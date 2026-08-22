export const KDX_RECEIVER_EPISTEMIC_CONTRACT = 'receiver-epistemic-v0.1.0';

export const KDX_RECEIVER_EPISTEMIC_STATES = Object.freeze({
  RECEIVED: 'RECEIVED',
  INTERPRETED: 'INTERPRETED',
  CORRELATED: 'CORRELATED',
  VERIFIED: 'VERIFIED',
  NEEDS_CONFIRMATION: 'NEEDS_CONFIRMATION',
});

function stableText(value) {
  return String(value ?? '').trim();
}

function stableRefs(refs) {
  if (!Array.isArray(refs)) return [];
  return [...new Set(refs.map(stableText).filter(Boolean))].sort();
}

/**
 * Build a deterministic Receiver capture without owning persistence, routing,
 * visitor scoring or truth authority. Observation and interpretation remain
 * separate by construction.
 */
export function createReceiverEpistemicCapture({
  captureId,
  raw,
  source = 'UNKNOWN',
  interpretation = '',
} = {}) {
  const id = stableText(captureId);
  const receivedText = stableText(raw);
  const sourceId = stableText(source) || 'UNKNOWN';
  const interpretedText = stableText(interpretation);

  if (!id) throw new Error('RECEIVER_CAPTURE_ID_REQUIRED');
  if (!receivedText) throw new Error('RECEIVER_RAW_SIGNAL_REQUIRED');

  return {
    contract: KDX_RECEIVER_EPISTEMIC_CONTRACT,
    capture_id: id,
    source: sourceId,
    received: {
      status: KDX_RECEIVER_EPISTEMIC_STATES.RECEIVED,
      text: receivedText,
    },
    interpretation: interpretedText
      ? {
          status: KDX_RECEIVER_EPISTEMIC_STATES.INTERPRETED,
          text: interpretedText,
        }
      : null,
  };
}

/**
 * Resolve only what this bounded instrument can establish itself.
 *
 * RECEIVED is the raw observation layer.
 * INTERPRETED requires an explicit interpretation payload.
 * CORRELATED requires explicit relation references but remains correlation,
 * not verification.
 * VERIFIED is deliberately outside this adapter's authority and therefore
 * always fails closed to NEEDS_CONFIRMATION. External source/evidence
 * authority must perform any later verification step.
 */
export function resolveReceiverEpistemicStatus({
  capture,
  requestedStatus = 'RECEIVED',
  correlationRefs = [],
  evidenceRefs = [],
} = {}) {
  if (!capture || capture.contract !== KDX_RECEIVER_EPISTEMIC_CONTRACT) {
    throw new Error('INVALID_RECEIVER_CAPTURE');
  }

  const requested = stableText(requestedStatus).toUpperCase();
  const correlations = stableRefs(correlationRefs);
  const evidence = stableRefs(evidenceRefs);

  if (requested === KDX_RECEIVER_EPISTEMIC_STATES.RECEIVED) {
    return {
      requested_status: requested,
      resolved_status: KDX_RECEIVER_EPISTEMIC_STATES.RECEIVED,
      correlation_refs: correlations,
      evidence_refs: evidence,
    };
  }

  if (requested === KDX_RECEIVER_EPISTEMIC_STATES.INTERPRETED) {
    return {
      requested_status: requested,
      resolved_status: capture.interpretation
        ? KDX_RECEIVER_EPISTEMIC_STATES.INTERPRETED
        : KDX_RECEIVER_EPISTEMIC_STATES.NEEDS_CONFIRMATION,
      correlation_refs: correlations,
      evidence_refs: evidence,
    };
  }

  if (requested === KDX_RECEIVER_EPISTEMIC_STATES.CORRELATED) {
    return {
      requested_status: requested,
      resolved_status: correlations.length
        ? KDX_RECEIVER_EPISTEMIC_STATES.CORRELATED
        : KDX_RECEIVER_EPISTEMIC_STATES.NEEDS_CONFIRMATION,
      correlation_refs: correlations,
      evidence_refs: evidence,
    };
  }

  return {
    requested_status: requested || KDX_RECEIVER_EPISTEMIC_STATES.NEEDS_CONFIRMATION,
    resolved_status: KDX_RECEIVER_EPISTEMIC_STATES.NEEDS_CONFIRMATION,
    correlation_refs: correlations,
    evidence_refs: evidence,
    reason:
      requested === KDX_RECEIVER_EPISTEMIC_STATES.VERIFIED
        ? 'EXTERNAL_VERIFICATION_AUTHORITY_REQUIRED'
        : 'UNSUPPORTED_EPISTEMIC_PROMOTION',
  };
}
