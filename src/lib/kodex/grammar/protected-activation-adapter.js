import {
  getProtectedOcinActivator,
  validateProtectedOcinActivator,
} from '../ocin/protected-activators-v0.js';

export const KDX_PROTECTED_ACTIVATION_ADAPTER_PROFILE = Object.freeze({
  version: 'protected-activation-adapter-v0.1.0',
  status: 'IMPLEMENTED_CANDIDATE',
  sourceRegistry: 'src/lib/kodex/ocin/protected-activators-v0.js',
  mutatesOriginal: false,
  embedsSourceBytes: false,
});

export class KdxProtectedActivationError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'KdxProtectedActivationError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

export function buildProtectedOcinActivationInput(artworkId, options = {}) {
  const record = getProtectedOcinActivator(artworkId);
  if (!record) {
    throw new KdxProtectedActivationError('UNKNOWN_OCIN_ARTWORK', 'Protected activation adapter requires a registered Ocín artwork ID.', { artworkId });
  }
  const validation = validateProtectedOcinActivator(record);
  if (!validation.valid) {
    throw new KdxProtectedActivationError('INVALID_PROTECTED_RECORD', 'Protected Ocín record failed integrity validation.', {
      artworkId,
      reasons: validation.reasons,
    });
  }
  if (record.publicationStatus === 'APPROVED_FOR_PUBLIC_EXPORT') {
    // Approval is not inferred from this adapter; even an approved record still uses
    // the same immutable source contract. Publication remains a separate release gate.
  }
  const status = options.payloadStatus || 'IMPLEMENTED_CANDIDATE';
  return Object.freeze({
    primary_payload: Object.freeze({
      payload_type: 'ARTWORK',
      payload_ref: record.artworkId,
      status,
    }),
    artwork_contract: Object.freeze({
      artwork_id: record.artworkId,
      full_view_required: true,
      preserve_aspect: true,
      crop_allowed: false,
      recolor_source_allowed: false,
      distort_source_allowed: false,
      source_bytes_renderable: false,
    }),
    activation_profile: Object.freeze({
      activation_id: record.primaryActivation,
      explicit_action_required: options.explicitActionRequired !== false,
      environment_only: true,
    }),
    provenance_refs: Object.freeze([
      `registry:${record.sourceRegistry}#${record.artworkId}`,
      `runtime:src/lib/kodex/ocin/protected-activators-v0.js#${record.artworkId}`,
    ]),
    release_state: Object.freeze({
      publication_status: record.publicationStatus,
      rights_status: record.rightsStatus,
      source_bytes_renderable: false,
    }),
  });
}

export function tryBuildProtectedOcinActivationInput(artworkId, options = {}) {
  try {
    return { ok: true, contract: buildProtectedOcinActivationInput(artworkId, options), error: null };
  } catch (error) {
    if (!(error instanceof KdxProtectedActivationError)) throw error;
    return { ok: false, contract: null, error: { code: error.code, message: error.message, details: error.details } };
  }
}
