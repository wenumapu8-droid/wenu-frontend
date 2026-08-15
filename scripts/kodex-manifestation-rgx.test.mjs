import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildManifestationView,
  createManifestationState,
  reduceManifestationState,
} from '../src/lib/kodex/manifestation-engine.js';
import {
  MANIFESTATION_RGX_PHASE_MAP,
  resolveManifestationRGXVisual,
} from '../src/lib/kodex/manifestation-rgx-visual-resolver.js';

function apply(state, event) {
  return reduceManifestationState(state, event);
}

test('phase grammar maps to explicit RGX family ids', () => {
  assert.deepEqual(MANIFESTATION_RGX_PHASE_MAP, {
    POTENTIAL: 'source-chamber',
    SIGNAL: 'signal-core',
    INTERFERENCE: 'interference-portal',
    TRANSFORMING: 'signal-vortex',
    REALIZED: 'living-organism',
    TRACE: 'memory-tree',
  });
});

test('explicit DNA node realizes as DNA ASCENT RGX', () => {
  let state = createManifestationState();
  state = apply(state, {
    type: 'DECLARE_INTENT',
    intentId: 'test-dna',
    intent: 'MATERIALIZE DNA ASCENT',
    nodeId: 'KDX-NODE-DNA-ASCENT',
  });
  state = apply(state, { type: 'EMIT_SIGNAL' });
  state = apply(state, { type: 'BEGIN_TRANSFORMATION' });
  state = apply(state, { type: 'REALIZE' });

  const view = buildManifestationView(state);
  assert.equal(view.phase, 'REALIZED');
  assert.equal(view.visualSpecimenId, 'dna-ascent');
  assert.equal(view.visualResolutionSource, 'NODE_MAP');

  const rgx = resolveManifestationRGXVisual(view);
  assert.equal(rgx.specimenId, 'dna-ascent');
  assert.equal(rgx.profile.conceptId, 'dna-ascent');
  assert.equal(rgx.source, 'MANIFESTATION_VIEW');
});

test('unknown requested visual never becomes ORBITAL CITY by RGX fallback', () => {
  const rgx = resolveManifestationRGXVisual({
    phase: 'INTERFERENCE',
    visualSpecimenId: 'not-an-authored-rgx-id',
  });
  assert.equal(rgx.specimenId, 'interference-portal');
  assert.equal(rgx.source, 'PHASE_RGX_FALLBACK');
  assert.notEqual(rgx.specimenId, 'orbital-city');
});

test('unresolved blocker forces INTERFERENCE RGX and blocks transformation', () => {
  let state = createManifestationState();
  state = apply(state, { type: 'DECLARE_INTENT', intentId: 'blocked', intent: 'TEST' });
  state = apply(state, { type: 'EMIT_SIGNAL' });
  state = apply(state, {
    type: 'ADD_BLOCKER',
    blocker: {
      id: 'creator-gate',
      type: 'CREATOR_ACCEPTANCE',
      label: 'Creator review pending',
      severity: 0.62,
    },
  });
  state = apply(state, { type: 'BEGIN_TRANSFORMATION' });

  const view = buildManifestationView(state);
  assert.equal(view.phase, 'INTERFERENCE');
  assert.equal(view.blocked, true);
  assert.equal(view.visualSpecimenId, 'interference-portal');
  assert.equal(resolveManifestationRGXVisual(view).specimenId, 'interference-portal');
});

test('TRACE resolves to MEMORY TREE RGX after realization', () => {
  let state = createManifestationState();
  state = apply(state, { type: 'DECLARE_INTENT', intentId: 'trace', intent: 'TEST', nodeId: 'KDX-NODE-DNA-ASCENT' });
  state = apply(state, { type: 'EMIT_SIGNAL' });
  state = apply(state, { type: 'BEGIN_TRANSFORMATION' });
  state = apply(state, { type: 'REALIZE' });
  state = apply(state, { type: 'WRITE_TRACE', routeSignature: 'TEST' });
  const view = buildManifestationView(state);
  assert.equal(view.phase, 'TRACE');
  assert.equal(resolveManifestationRGXVisual(view).specimenId, 'memory-tree');
});
