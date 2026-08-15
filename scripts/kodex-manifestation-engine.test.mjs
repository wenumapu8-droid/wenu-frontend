import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MANIFESTATION_VISUAL_MAP,
  buildManifestationView,
  createManifestationState,
  reduceManifestationState,
  summarizeInterference,
} from '../src/lib/kodex/manifestation-engine.js';

function reduce(events) {
  return events.reduce((state, event) => reduceManifestationState(state, event), createManifestationState());
}

test('manifestation state follows explicit deterministic transitions', () => {
  const state = reduce([
    { type: 'DECLARE_INTENT', intentId: 'INT-001', intent: 'Resolve one KODEX node', nodeId: 'KDX-NODE-PORTAL-RING', at: 1000 },
    { type: 'EMIT_SIGNAL' },
    { type: 'ADD_BLOCKER', blocker: { id: 'B-1', type: 'MISSING_EVIDENCE', severity: 0.8, sourceRef: 'SRC-001' } },
    { type: 'RESOLVE_BLOCKER', blockerId: 'B-1' },
    { type: 'BEGIN_TRANSFORMATION' },
    { type: 'REALIZE', at: 2400 },
    { type: 'WRITE_TRACE', routeSignature: 'KDX-ABC', memoryRef: 'MEM-001' },
  ]);

  assert.equal(state.phase, 'TRACE');
  assert.equal(state.visualSpecimenId, 'memory-tree');
  assert.equal(state.interference.unresolvedCount, 0);
  assert.equal(state.trace.at(-2).observedElapsedMs, 1400);
  assert.equal(state.trace.at(-1).routeSignature, 'KDX-ABC');
});

test('unresolved blockers force INTERFERENCE and prevent transformation', () => {
  let state = reduce([
    { type: 'DECLARE_INTENT', intentId: 'INT-002', intent: 'Activate a protected artwork' },
    { type: 'EMIT_SIGNAL' },
    { type: 'ADD_BLOCKER', blocker: { id: 'RIGHTS-1', type: 'RIGHTS_GATE', severity: 1 } },
  ]);

  assert.equal(state.phase, 'INTERFERENCE');
  assert.equal(state.visualSpecimenId, MANIFESTATION_VISUAL_MAP.INTERFERENCE);
  assert.equal(buildManifestationView(state).canTransform, false);

  state = reduceManifestationState(state, { type: 'BEGIN_TRANSFORMATION' });
  assert.equal(state.phase, 'INTERFERENCE');
});

test('causal load is derived only from explicit unresolved blocker severities', () => {
  const summary = summarizeInterference([
    { id: 'A', type: 'DEPENDENCY', severity: 0.2 },
    { id: 'B', type: 'RUNTIME_GATE', severity: 0.8 },
    { id: 'C', type: 'CONTRADICTION', severity: 1, resolved: true },
  ]);

  assert.equal(summary.blockerCount, 3);
  assert.equal(summary.unresolvedCount, 2);
  assert.equal(summary.resolvedCount, 1);
  assert.equal(summary.causalLoad, 0.5);
  assert.deepEqual(summary.unresolvedIds, ['A', 'B']);
});

test('phase-to-HoloCore mapping uses only existing registry specimen ids', () => {
  assert.deepEqual(MANIFESTATION_VISUAL_MAP, {
    POTENTIAL: 'source-chamber',
    SIGNAL: 'signal-core',
    INTERFERENCE: 'interference-portal',
    TRANSFORMING: 'signal-vortex',
    REALIZED: 'living-organism',
    TRACE: 'memory-tree',
  });
});

test('observed elapsed time is recorded only after REALIZE and never predicted', () => {
  let state = reduce([
    { type: 'DECLARE_INTENT', intentId: 'INT-003', intent: 'Compile a plate', at: 500 },
    { type: 'EMIT_SIGNAL' },
    { type: 'BEGIN_TRANSFORMATION' },
  ]);

  assert.equal(state.realizedAt, null);
  assert.equal(state.trace.some(event => 'observedElapsedMs' in event), false);

  state = reduceManifestationState(state, { type: 'REALIZE', at: 900 });
  assert.equal(state.trace.at(-1).observedElapsedMs, 400);
});
