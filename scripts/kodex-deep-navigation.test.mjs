import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEEP_NAVIGATION_POLICY,
  KODEX_LENSES,
  buildRouteFrame,
  createObserverState,
  reduceObserverState,
  resolveNodeRepresentation,
  scoreRouteCandidate,
  transitionLens,
} from '../src/lib/kodex/deep-navigation-engine.js';

const safeCandidate = (id, extra = {}) => ({
  id,
  fields: ['science'],
  semanticAffinity: 0.7,
  narrativeCompatibility: 0.7,
  curatorWeight: 0.7,
  cognitiveLoad: 0.3,
  rightsStatus: 'CLEAR',
  culturalStatus: 'STANDARD',
  epistemicStatus: 'VERIFIED',
  runtimeNavigable: true,
  ...extra,
});

test('lens transitions are bounded and explicit', () => {
  assert.equal(transitionLens('MICROSCOPE', 'APPROACH'), 'MICROSCOPE');
  assert.equal(transitionLens('NAKED_EYE', 'APPROACH'), 'MAGNIFIER');
  assert.equal(transitionLens('NAKED_EYE', 'RECEDE'), 'SYSTEM');
  assert.equal(transitionLens('TELESCOPE', 'RECEDE'), 'META');
  assert.equal(transitionLens('META', 'RECEDE'), 'META');
  assert.equal(transitionLens('MICROSCOPE', 'RESET'), 'NAKED_EYE');
  assert.equal(transitionLens('NAKED_EYE', 'SATELLITE'), 'SATELLITE');
});

test('observer reducer records semantic route memory without raw telemetry/profile fields', () => {
  const initial = createObserverState({ pointerX: 0.9, psychologicalProfile: 'forbidden' });
  assert.equal('pointerX' in initial, false);
  assert.equal('psychologicalProfile' in initial, false);

  const visited = reduceObserverState(initial, {
    type: 'VISIT_NODE',
    nodeId: 'NODE-WATER',
    fields: ['science', 'art'],
    pointerVelocity: 999,
  });
  assert.equal(visited.currentNodeId, 'NODE-WATER');
  assert.equal(visited.visitCounts['NODE-WATER'], 1);
  assert.equal(visited.fieldVisits.science, 1);
  assert.equal(visited.fieldVisits.art, 1);
  assert.equal('pointerVelocity' in visited.routeTrace[0], false);
  assert.match(visited.routeSignature, /^KDX-/);

  const activated = reduceObserverState(visited, { type: 'ACTIVATE_ART', artworkId: 'OCN-001' });
  assert.deepEqual(activated.activatedArtworks, ['OCN-001']);
  assert.equal(activated.memorySignals.includes('art:OCN-001'), true);
});

test('semantic zoom preserves node identity and chooses exact/nearest representations', () => {
  const node = {
    id: 'NODE-MYCELIUM',
    representations: [
      { lens: 'MICROSCOPE', payloadRef: 'hyphae' },
      { lens: 'NAKED_EYE', payloadRef: 'fruiting-body' },
      { lens: 'SATELLITE', payloadRef: 'forest-network' },
    ],
  };

  const exact = resolveNodeRepresentation(node, { lens: 'SATELLITE' });
  assert.equal(exact.nodeId, 'NODE-MYCELIUM');
  assert.equal(exact.representation.payloadRef, 'forest-network');
  assert.equal(exact.exact, true);

  const fallback = resolveNodeRepresentation(node, { lens: 'TELESCOPE' });
  assert.equal(fallback.nodeId, 'NODE-MYCELIUM');
  assert.equal(fallback.representation.payloadRef, 'forest-network');
  assert.equal(fallback.fallbackDistance, 1);
  assert.equal(fallback.exact, false);
});

test('route scoring is deterministic for the same state and seed', () => {
  const observer = createObserverState({
    currentNodeId: 'NODE-A',
    routeSignature: 'KDX-TEST',
    fieldVisits: { science: 1 },
  });
  const candidate = safeCandidate('NODE-B', { fields: ['technology'] });
  const a = scoreRouteCandidate(candidate, observer, { seed: 'same-seed' });
  const b = scoreRouteCandidate(candidate, observer, { seed: 'same-seed' });
  assert.deepEqual(a, b);
  assert.equal(a.eligible, true);
});

test('public route hard-gates rights, cultural authorization and unconfirmed claims', () => {
  const observer = createObserverState({ currentNodeId: 'NODE-A' });

  assert.equal(scoreRouteCandidate(
    safeCandidate('NODE-RIGHTS', { rightsStatus: 'REFERENCE_ONLY' }),
    observer,
    { publicMode: true },
  ).eligible, false);

  assert.equal(scoreRouteCandidate(
    safeCandidate('NODE-CULTURE', { culturalStatus: 'AUTHORIZATION_REQUIRED' }),
    observer,
    { publicMode: true },
  ).eligible, false);

  assert.equal(scoreRouteCandidate(
    safeCandidate('NODE-UNCERTAIN', { epistemicStatus: 'NEEDS_CONFIRMATION' }),
    observer,
    { publicMode: true },
  ).eligible, false);

  const labelledLab = scoreRouteCandidate(
    safeCandidate('NODE-UNCERTAIN-LAB', { epistemicStatus: 'NEEDS_CONFIRMATION' }),
    observer,
    { publicMode: false, allowNeedsConfirmation: true },
  );
  assert.equal(labelledLab.eligible, true);
  assert.ok(labelledLab.components.unsupportedClaimRisk > 0);
});

test('memory-conditioned edges remain closed until the required semantic event exists', () => {
  const candidate = safeCandidate('NODE-SECRET', { requiredMemory: ['art:OCN-KEY'] });
  const before = scoreRouteCandidate(candidate, createObserverState(), { publicMode: true });
  assert.equal(before.eligible, false);
  assert.equal(before.gateReasons.includes('missing-memory:art:OCN-KEY'), true);

  const afterState = reduceObserverState(createObserverState(), { type: 'ACTIVATE_ART', artworkId: 'OCN-KEY' });
  const after = scoreRouteCandidate(candidate, afterState, { publicMode: true });
  assert.equal(after.eligible, true);
});

test('revisits are penalized without becoming engagement scoring', () => {
  const candidate = safeCandidate('NODE-B');
  const fresh = scoreRouteCandidate(candidate, createObserverState({ currentNodeId: 'NODE-A' }), { seed: 'repeat' });
  const repeated = scoreRouteCandidate(candidate, createObserverState({
    currentNodeId: 'NODE-A',
    recentNodes: ['NODE-B'],
    visitCounts: { 'NODE-B': 3 },
  }), { seed: 'repeat' });

  assert.ok(fresh.score > repeated.score);
  assert.equal(DEEP_NAVIGATION_POLICY.prohibitedObjectives.includes('time-on-site'), true);
  assert.equal(DEEP_NAVIGATION_POLICY.prohibitedObjectives.includes('psychological-profile'), true);
});

test('route frame exposes a small diverse set and never auto-navigates', () => {
  const observer = createObserverState({
    currentNodeId: 'NODE-START',
    fieldVisits: { science: 2 },
    routeSignature: 'KDX-DIVERSE',
  });
  const candidates = [
    safeCandidate('SCI-1', { fields: ['science'], curatorWeight: 0.95 }),
    safeCandidate('SCI-2', { fields: ['science'], curatorWeight: 0.90 }),
    safeCandidate('SCI-3', { fields: ['science'], curatorWeight: 0.85 }),
    safeCandidate('ART-1', { fields: ['art'], curatorWeight: 0.70 }),
    safeCandidate('TECH-1', { fields: ['technology'], curatorWeight: 0.68 }),
    safeCandidate('SPIRIT-1', { fields: ['consciousness'], curatorWeight: 0.66 }),
  ];

  const frame = buildRouteFrame({ candidates, observer, options: { seed: 'diversity', maxChoices: 4 } });
  assert.equal(frame.autoNavigate, false);
  assert.equal(frame.selected.length, 4);
  const selectedIds = frame.selected.map((item) => item.id);
  assert.equal(selectedIds.includes('ART-1') || selectedIds.includes('TECH-1') || selectedIds.includes('SPIRIT-1'), true);
  assert.ok(selectedIds.filter((id) => id.startsWith('SCI-')).length <= 2);
  assert.equal(KODEX_LENSES[frame.observer.lens].key, 'NAKED_EYE');
});

test('blocked-if memory prevents a route after a mutually exclusive choice', () => {
  const state = reduceObserverState(createObserverState(), { type: 'CHOOSE_ROUTE', nodeId: 'NODE-X' });
  const candidate = safeCandidate('NODE-Y', { blockedIf: ['route:NODE-X'] });
  const result = scoreRouteCandidate(candidate, state, { publicMode: true });
  assert.equal(result.eligible, false);
  assert.equal(result.gateReasons.includes('blocked-by-memory:route:NODE-X'), true);
});
