import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEEP_NAVIGATION_POLICY,
  KODEX_LENSES,
  ROUTE_ALGORITHM_PROFILE,
  ROUTE_ROLES,
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
  assert.deepEqual(visited.currentFields, ['science', 'art']);
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
  const observer = createObserverState({ currentNodeId: 'NODE-A', routeSignature: 'KDX-TEST', fieldVisits: { science: 1 } });
  const candidate = safeCandidate('NODE-B', { fields: ['technology'] });
  const a = scoreRouteCandidate(candidate, observer, { seed: 'same-seed' });
  const b = scoreRouteCandidate(candidate, observer, { seed: 'same-seed' });
  assert.deepEqual(a, b);
  assert.equal(a.eligible, true);
});

test('public route hard-gates rights, cultural authorization and unconfirmed claims', () => {
  const observer = createObserverState({ currentNodeId: 'NODE-A' });
  assert.equal(scoreRouteCandidate(safeCandidate('NODE-RIGHTS', { rightsStatus: 'REFERENCE_ONLY' }), observer, { publicMode: true }).eligible, false);
  assert.equal(scoreRouteCandidate(safeCandidate('NODE-CULTURE', { culturalStatus: 'AUTHORIZATION_REQUIRED' }), observer, { publicMode: true }).eligible, false);
  assert.equal(scoreRouteCandidate(safeCandidate('NODE-UNCERTAIN', { epistemicStatus: 'NEEDS_CONFIRMATION' }), observer, { publicMode: true }).eligible, false);
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
  const repeated = scoreRouteCandidate(candidate, createObserverState({ currentNodeId: 'NODE-A', recentNodes: ['NODE-B'], visitCounts: { 'NODE-B': 3 } }), { seed: 'repeat' });
  assert.ok(fresh.score > repeated.score);
  assert.equal(DEEP_NAVIGATION_POLICY.prohibitedObjectives.includes('time-on-site'), true);
  assert.equal(DEEP_NAVIGATION_POLICY.prohibitedObjectives.includes('psychological-profile'), true);
});

test('route slate composes continuity, bridge, echo and serendipity without auto-navigation', () => {
  const observer = createObserverState({
    currentNodeId: 'SCI-START',
    currentFields: ['science'],
    fieldVisits: { science: 2, art: 1 },
    activatedArtworks: ['OCN-001'],
    memorySignals: ['art:OCN-001'],
    routeSignature: 'KDX-ROLES',
  });
  const candidates = [
    safeCandidate('SCI-CONTINUE', { fields: ['science'], routeRoles: ['CONTINUITY'], curatorWeight: 0.95 }),
    safeCandidate('TECH-BRIDGE', { fields: ['technology'], routeRoles: ['BRIDGE'], curatorWeight: 0.75 }),
    safeCandidate('ART-ECHO', { fields: ['art'], routeRoles: ['ECHO'], memoryTags: ['art:OCN-001'], curatorWeight: 0.72 }),
    safeCandidate('CON-SERENDIPITY', { fields: ['consciousness'], routeRoles: ['SERENDIPITY'], curatorWeight: 0.68 }),
    safeCandidate('SCI-EXTRA', { fields: ['science'], curatorWeight: 0.90 }),
  ];
  const frame = buildRouteFrame({ candidates, observer, options: { seed: 'roles', maxChoices: 4 } });
  assert.equal(frame.autoNavigate, false);
  assert.equal(frame.selected.length, 4);
  assert.deepEqual(new Set(frame.selected.map((item) => item.role)), new Set(ROUTE_ROLES));
  assert.deepEqual(frame.slate.presentRoles.sort(), [...ROUTE_ROLES].sort());
  assert.equal(frame.slate.missingRoles.length, 0);
  assert.equal(frame.slate.algorithmVersion, ROUTE_ALGORITHM_PROFILE.version);
  assert.equal(ROUTE_ALGORITHM_PROFILE.status, 'HYPOTHESIS');
  assert.equal(KODEX_LENSES[frame.observer.lens].key, 'NAKED_EYE');
});

test('role hints cannot resurrect nodes blocked by deterministic safety gates', () => {
  const observer = createObserverState({ currentNodeId: 'NODE-A', currentFields: ['science'] });
  const candidates = [
    safeCandidate('SAFE-CONTINUITY', { routeRoles: ['CONTINUITY'] }),
    safeCandidate('SAFE-BRIDGE', { fields: ['technology'], routeRoles: ['BRIDGE'] }),
    safeCandidate('BLOCKED-ECHO', { fields: ['art'], routeRoles: ['ECHO'], rightsStatus: 'REFERENCE_ONLY', curatorWeight: 1 }),
    safeCandidate('SAFE-SERENDIPITY', { fields: ['consciousness'], routeRoles: ['SERENDIPITY'] }),
  ];
  const frame = buildRouteFrame({ candidates, observer, options: { seed: 'safety-role', maxChoices: 4, publicMode: true } });
  assert.equal(frame.selected.some((item) => item.id === 'BLOCKED-ECHO'), false);
  assert.equal(frame.excluded.some((item) => item.id === 'BLOCKED-ECHO'), true);
  assert.equal(frame.slate.missingRoles.includes('ECHO'), true);
});

test('role-composed slate is reproducible for identical state, candidates and seed', () => {
  const observer = createObserverState({ currentNodeId: 'NODE-A', currentFields: ['science'], routeSignature: 'KDX-REPRO' });
  const candidates = [
    safeCandidate('A', { routeRoles: ['CONTINUITY'] }),
    safeCandidate('B', { fields: ['technology'], routeRoles: ['BRIDGE'] }),
    safeCandidate('C', { fields: ['art'], routeRoles: ['SERENDIPITY'] }),
    safeCandidate('D', { fields: ['consciousness'] }),
  ];
  const first = buildRouteFrame({ candidates, observer, options: { seed: 'fixed', maxChoices: 4 } });
  const second = buildRouteFrame({ candidates, observer, options: { seed: 'fixed', maxChoices: 4 } });
  assert.deepEqual(first, second);
});

test('route frame reports insufficient safe choices instead of fabricating unsafe doors', () => {
  const observer = createObserverState({ currentNodeId: 'NODE-A' });
  const frame = buildRouteFrame({
    observer,
    candidates: [
      safeCandidate('ONLY-SAFE'),
      safeCandidate('BLOCKED', { rightsStatus: 'REFERENCE_ONLY' }),
    ],
    options: { publicMode: true, maxChoices: 4 },
  });
  assert.equal(frame.selected.length, 1);
  assert.equal(frame.slate.insufficientSafeChoices, true);
  assert.equal(frame.excluded.some((item) => item.id === 'BLOCKED'), true);
});

test('blocked-if memory prevents a route after a mutually exclusive choice', () => {
  const state = reduceObserverState(createObserverState(), { type: 'CHOOSE_ROUTE', nodeId: 'NODE-X', role: 'BRIDGE' });
  const candidate = safeCandidate('NODE-Y', { blockedIf: ['route:NODE-X'] });
  const result = scoreRouteCandidate(candidate, state, { publicMode: true });
  assert.equal(result.eligible, false);
  assert.equal(result.gateReasons.includes('blocked-by-memory:route:NODE-X'), true);
  assert.equal(state.routeTrace.at(-1).role, 'BRIDGE');
});
