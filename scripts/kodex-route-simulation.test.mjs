import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildRouteFrame,
  createObserverState,
  hashSeed,
  reduceObserverState,
} from '../src/lib/kodex/deep-navigation-engine.js';

const NODE_DEFS = Object.freeze({
  'SCI-BIOLOGY': { fields: ['science', 'biology'], lensAffinity: ['MICROSCOPE', 'NAKED_EYE', 'SYSTEM'] },
  'SCI-PATTERN': { fields: ['science', 'mathematics'], lensAffinity: ['MAGNIFIER', 'SYSTEM', 'META'] },
  'SCI-COSMOS': { fields: ['science', 'cosmos'], lensAffinity: ['SATELLITE', 'TELESCOPE', 'META'] },
  'TECH-NETWORK': { fields: ['technology', 'network'], lensAffinity: ['SYSTEM', 'TELEPHOTO', 'META'] },
  'TECH-MACHINE': { fields: ['technology', 'machine'], lensAffinity: ['MAGNIFIER', 'NAKED_EYE', 'SYSTEM'] },
  'TECH-CITY': { fields: ['technology', 'future-city'], lensAffinity: ['SYSTEM', 'TELEPHOTO', 'SATELLITE'] },
  'ART-FORM': { fields: ['art', 'design'], lensAffinity: ['MAGNIFIER', 'NAKED_EYE', 'SYSTEM'] },
  'ART-IMAGE': { fields: ['art', 'photography'], lensAffinity: ['MAGNIFIER', 'NAKED_EYE', 'META'] },
  'ART-POETRY': { fields: ['art', 'poetry'], lensAffinity: ['NAKED_EYE', 'SYSTEM', 'META'] },
  'CON-MIND': { fields: ['consciousness', 'philosophy'], lensAffinity: ['NAKED_EYE', 'SYSTEM', 'META'] },
  'CON-OBSERVER': { fields: ['consciousness', 'observer'], lensAffinity: ['MAGNIFIER', 'SYSTEM', 'META'] },
  'CON-RITUAL': { fields: ['consciousness', 'ritual'], lensAffinity: ['NAKED_EYE', 'TELEPHOTO', 'META'], requiredMemory: ['art:OCN-KEY'] },
});

const GRAPH = Object.freeze({
  'SCI-BIOLOGY': ['SCI-PATTERN', 'TECH-NETWORK', 'ART-FORM', 'CON-MIND'],
  'SCI-PATTERN': ['SCI-COSMOS', 'TECH-MACHINE', 'ART-IMAGE', 'CON-OBSERVER'],
  'SCI-COSMOS': ['SCI-BIOLOGY', 'TECH-CITY', 'ART-POETRY', 'CON-OBSERVER'],
  'TECH-NETWORK': ['TECH-MACHINE', 'SCI-PATTERN', 'ART-FORM', 'CON-MIND'],
  'TECH-MACHINE': ['TECH-CITY', 'SCI-BIOLOGY', 'ART-IMAGE', 'CON-OBSERVER'],
  'TECH-CITY': ['TECH-NETWORK', 'SCI-COSMOS', 'ART-POETRY', 'CON-RITUAL'],
  'ART-FORM': ['ART-IMAGE', 'SCI-PATTERN', 'TECH-MACHINE', 'CON-MIND'],
  'ART-IMAGE': ['ART-POETRY', 'SCI-BIOLOGY', 'TECH-CITY', 'CON-OBSERVER'],
  'ART-POETRY': ['ART-FORM', 'SCI-COSMOS', 'TECH-NETWORK', 'CON-RITUAL'],
  'CON-MIND': ['CON-OBSERVER', 'SCI-BIOLOGY', 'TECH-NETWORK', 'ART-FORM'],
  'CON-OBSERVER': ['CON-RITUAL', 'SCI-PATTERN', 'TECH-MACHINE', 'ART-IMAGE'],
  'CON-RITUAL': ['CON-MIND', 'SCI-COSMOS', 'TECH-CITY', 'ART-POETRY'],
});

function primaryField(nodeId) {
  return NODE_DEFS[nodeId].fields[0];
}

function candidateFor(from, id) {
  const def = NODE_DEFS[id];
  const sameField = primaryField(from) === primaryField(id);
  return {
    id,
    ...def,
    semanticAffinity: sameField ? 0.88 : 0.67,
    narrativeCompatibility: 0.76,
    curatorWeight: 0.62 + (hashSeed(id) % 20) / 100,
    cognitiveLoad: 0.25 + (hashSeed(`load:${id}`) % 40) / 100,
    epistemicStatus: 'VERIFIED',
    rightsStatus: 'CLEAR',
    culturalStatus: 'STANDARD',
    runtimeNavigable: true,
  };
}

const BLOCKED_REFERENCE = Object.freeze({
  id: 'BLOCKED-REFERENCE',
  fields: ['reference'],
  semanticAffinity: 1,
  narrativeCompatibility: 1,
  curatorWeight: 1,
  cognitiveLoad: 0,
  epistemicStatus: 'VERIFIED',
  rightsStatus: 'REFERENCE_ONLY',
  culturalStatus: 'STANDARD',
  runtimeNavigable: true,
});

function runSession(seed, steps = 15) {
  let state = createObserverState({ routeSignature: `KDX-SIM-${seed}` });
  state = reduceObserverState(state, {
    type: 'VISIT_NODE',
    nodeId: 'SCI-BIOLOGY',
    fields: NODE_DEFS['SCI-BIOLOGY'].fields,
  });

  const trace = ['SCI-BIOLOGY'];
  const frameSizes = [];
  let blockedReferenceLeaks = 0;
  let ritualBeforeArtLeaks = 0;
  let ritualUnlocked = false;

  for (let step = 0; step < steps; step += 1) {
    const current = state.currentNodeId;
    const candidates = [
      ...GRAPH[current].map((id) => candidateFor(current, id)),
      BLOCKED_REFERENCE,
    ];

    const frame = buildRouteFrame({
      candidates,
      observer: state,
      options: { seed: `session:${seed}:step:${step}`, publicMode: true, maxChoices: 4 },
    });

    assert.equal(frame.autoNavigate, false);
    assert.ok(frame.selected.length >= 2 && frame.selected.length <= 4);
    frameSizes.push(frame.selected.length);

    if (frame.selected.some((item) => item.id === 'BLOCKED-REFERENCE')) blockedReferenceLeaks += 1;
    if (!state.activatedArtworks.includes('OCN-KEY') && frame.selected.some((item) => item.id === 'CON-RITUAL')) {
      ritualBeforeArtLeaks += 1;
    }
    if (state.activatedArtworks.includes('OCN-KEY') && frame.selected.some((item) => item.id === 'CON-RITUAL')) {
      ritualUnlocked = true;
    }

    const choiceIndex = hashSeed(`choice:${seed}:${step}`) % frame.selected.length;
    const chosen = frame.selected[choiceIndex].id;

    state = reduceObserverState(state, { type: 'CHOOSE_ROUTE', nodeId: chosen });
    state = reduceObserverState(state, {
      type: 'VISIT_NODE',
      nodeId: chosen,
      fields: NODE_DEFS[chosen].fields,
    });

    if (chosen === 'ART-IMAGE' && !state.activatedArtworks.includes('OCN-KEY')) {
      state = reduceObserverState(state, { type: 'ACTIVATE_ART', artworkId: 'OCN-KEY' });
    }

    if (step % 5 === 1) state = reduceObserverState(state, { type: 'RECEDE' });
    if (step % 5 === 3) state = reduceObserverState(state, { type: 'APPROACH' });

    trace.push(chosen);
  }

  return {
    state,
    trace,
    frameSizes,
    blockedReferenceLeaks,
    ritualBeforeArtLeaks,
    ritualUnlocked,
  };
}

test('12-node route simulation is deterministic for an identical seed', () => {
  const a = runSession('replay-proof', 15);
  const b = runSession('replay-proof', 15);
  assert.deepEqual(a.trace, b.trace);
  assert.equal(a.state.routeSignature, b.state.routeSignature);
});

test('128 synthetic journeys stay bounded, diverse, safe and non-dead-ending', () => {
  const sessions = Array.from({ length: 128 }, (_, index) => runSession(`S${index}`, 15));
  const allVisited = new Set();
  let totalUniqueNodes = 0;
  let totalUniqueFields = 0;
  let totalRevisits = 0;
  let totalTransitions = 0;
  let ritualUnlockedSessions = 0;

  for (const session of sessions) {
    assert.equal(session.blockedReferenceLeaks, 0);
    assert.equal(session.ritualBeforeArtLeaks, 0);
    assert.ok(session.frameSizes.every((size) => size >= 2 && size <= 4));

    const uniqueNodes = new Set(session.trace);
    const uniqueFields = new Set(session.trace.map(primaryField));
    for (const id of uniqueNodes) allVisited.add(id);
    totalUniqueNodes += uniqueNodes.size;
    totalUniqueFields += uniqueFields.size;
    totalTransitions += session.trace.length - 1;
    totalRevisits += session.trace.length - uniqueNodes.size;
    if (session.ritualUnlocked) ritualUnlockedSessions += 1;
  }

  const avgUniqueNodes = totalUniqueNodes / sessions.length;
  const avgUniqueFields = totalUniqueFields / sessions.length;
  const revisitRatio = totalRevisits / (totalTransitions + sessions.length);

  assert.equal(allVisited.size, Object.keys(NODE_DEFS).length, `reachable nodes: ${[...allVisited].sort().join(', ')}`);
  assert.ok(avgUniqueNodes >= 6.5, `avgUniqueNodes=${avgUniqueNodes.toFixed(2)}`);
  assert.ok(avgUniqueFields >= 3.25, `avgUniqueFields=${avgUniqueFields.toFixed(2)}`);
  assert.ok(revisitRatio < 0.58, `revisitRatio=${revisitRatio.toFixed(3)}`);
  assert.ok(ritualUnlockedSessions > 0, 'memory-conditioned CON-RITUAL should become available in some sessions');
});
