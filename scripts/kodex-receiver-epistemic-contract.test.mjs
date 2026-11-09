import assert from 'node:assert/strict';
import test from 'node:test';

import {
  KDX_RECEIVER_EPISTEMIC_CONTRACT,
  createReceiverEpistemicCapture,
  resolveReceiverEpistemicStatus,
} from '../src/lib/kodex/runtime/receiver-epistemic-contract.js';

test('Receiver keeps RECEIVED observation separate from INTERPRETED meaning', () => {
  const capture = createReceiverEpistemicCapture({
    captureId: 'rx-001',
    raw: 'three white points appeared',
    interpretation: 'may resemble a triangle',
  });

  assert.equal(capture.contract, KDX_RECEIVER_EPISTEMIC_CONTRACT);
  assert.equal(capture.source, 'UNKNOWN');
  assert.deepEqual(capture.received, {
    status: 'RECEIVED',
    text: 'three white points appeared',
  });
  assert.deepEqual(capture.interpretation, {
    status: 'INTERPRETED',
    text: 'may resemble a triangle',
  });
});

test('Receiver capture is deterministic and rejects empty/passive observations', () => {
  const input = { captureId: 'rx-002', raw: '11:11', source: 'UNKNOWN' };
  const first = createReceiverEpistemicCapture(input);
  const second = createReceiverEpistemicCapture(input);

  assert.deepEqual(first, second);
  assert.throws(() => createReceiverEpistemicCapture({ raw: 'signal' }), /RECEIVER_CAPTURE_ID_REQUIRED/);
  assert.throws(() => createReceiverEpistemicCapture({ captureId: 'rx-empty', raw: '   ' }), /RECEIVER_RAW_SIGNAL_REQUIRED/);
});

test('INTERPRETED requires an explicit interpretation layer', () => {
  const capture = createReceiverEpistemicCapture({ captureId: 'rx-003', raw: 'blue field' });
  const result = resolveReceiverEpistemicStatus({ capture, requestedStatus: 'INTERPRETED' });
  assert.equal(result.resolved_status, 'NEEDS_CONFIRMATION');
});

test('CORRELATED requires explicit relation refs but does not imply VERIFIED', () => {
  const capture = createReceiverEpistemicCapture({ captureId: 'rx-004', raw: 'spiral' });

  const uncorrelated = resolveReceiverEpistemicStatus({ capture, requestedStatus: 'CORRELATED' });
  assert.equal(uncorrelated.resolved_status, 'NEEDS_CONFIRMATION');

  const correlated = resolveReceiverEpistemicStatus({
    capture,
    requestedStatus: 'CORRELATED',
    correlationRefs: ['capture:rx-001', 'capture:rx-001', 'capture:rx-003'],
  });
  assert.equal(correlated.resolved_status, 'CORRELATED');
  assert.deepEqual(correlated.correlation_refs, ['capture:rx-001', 'capture:rx-003']);
});

test('VERIFIED always fails closed inside the Receiver adapter', () => {
  const capture = createReceiverEpistemicCapture({
    captureId: 'rx-005',
    raw: 'luminous lattice',
    interpretation: 'possible grid motif',
  });

  const result = resolveReceiverEpistemicStatus({
    capture,
    requestedStatus: 'VERIFIED',
    evidenceRefs: ['self-claim:looks-true'],
  });

  assert.equal(result.requested_status, 'VERIFIED');
  assert.equal(result.resolved_status, 'NEEDS_CONFIRMATION');
  assert.equal(result.reason, 'EXTERNAL_VERIFICATION_AUTHORITY_REQUIRED');
});

test('Receiver contract exposes no parallel memory, route or visitor-scoring authority', () => {
  const capture = createReceiverEpistemicCapture({ captureId: 'rx-006', raw: 'tone' });
  const serialized = JSON.stringify(capture).toLowerCase();

  for (const forbidden of [
    'localstorage',
    'memorywrites',
    'route',
    'branch_score',
    'readiness',
    'coherence',
    'salience',
    'decay',
    'identity',
  ]) {
    assert.equal(serialized.includes(forbidden), false, `forbidden authority leaked: ${forbidden}`);
  }
});
