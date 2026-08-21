import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MICRO_UNIVERSE_ENTRY,
  createMicroUniverseState,
  enterMicroUniverseNode,
} from '../src/lib/kodex/micro-universe.js';
import {
  MEMORY_CONSTELLATION_VERSION,
  buildMicroUniverseMemoryConstellation,
  revisitKnownMicroUniverseNode,
} from '../src/lib/kodex/memory-constellation.js';

test('memory constellation exposes visited nodes only and emphasizes current node', () => {
  let state = createMicroUniverseState();
  state = enterMicroUniverseNode(state, 'ART-FORM', 'BRIDGE');
  state = enterMicroUniverseNode(state, 'ART-IMAGE', 'CONTINUITY');

  const map = buildMicroUniverseMemoryConstellation(state);
  assert.equal(map.version, MEMORY_CONSTELLATION_VERSION);
  assert.equal(map.revealsUnvisitedNodes, false);
  assert.deepEqual(map.nodes.map((node) => node.id), [MICRO_UNIVERSE_ENTRY, 'ART-FORM', 'ART-IMAGE']);
  assert.equal(map.visitedCount, 3);
  assert.equal(map.nodes.filter((node) => node.isCurrent).length, 1);
  assert.equal(map.nodes.find((node) => node.isCurrent)?.id, 'ART-IMAGE');
  assert.equal(map.nodes.some((node) => node.id === 'TECH-CITY'), false);
});

test('memory constellation preserves remembered route roles on traversed edges', () => {
  let state = createMicroUniverseState();
  state = enterMicroUniverseNode(state, 'ART-FORM', 'BRIDGE');
  state = enterMicroUniverseNode(state, 'ART-IMAGE', 'CONTINUITY');

  const map = buildMicroUniverseMemoryConstellation(state);
  assert.deepEqual(map.edges, [
    { from: MICRO_UNIVERSE_ENTRY, to: 'ART-FORM', role: 'BRIDGE' },
    { from: 'ART-FORM', to: 'ART-IMAGE', role: 'CONTINUITY' },
  ]);
});

test('known-node revisit becomes an explicit ECHO visit while unknown nodes are rejected', () => {
  let state = createMicroUniverseState();
  state = enterMicroUniverseNode(state, 'ART-FORM', 'BRIDGE');
  state = enterMicroUniverseNode(state, 'ART-IMAGE', 'CONTINUITY');

  const beforeUnknown = state.routeTrace.length;
  const unknown = revisitKnownMicroUniverseNode(state, 'TECH-CITY');
  assert.equal(unknown.currentNodeId, 'ART-IMAGE');
  assert.equal(unknown.routeTrace.length, beforeUnknown);

  const revisited = revisitKnownMicroUniverseNode(state, MICRO_UNIVERSE_ENTRY);
  assert.equal(revisited.currentNodeId, MICRO_UNIVERSE_ENTRY);
  const lastChoice = [...revisited.routeTrace].reverse().find((event) => event.kind === 'CHOOSE_ROUTE');
  assert.equal(lastChoice.nodeId, MICRO_UNIVERSE_ENTRY);
  assert.equal(lastChoice.role, 'ECHO');

  const map = buildMicroUniverseMemoryConstellation(revisited);
  assert.equal(map.nodes.find((node) => node.id === MICRO_UNIVERSE_ENTRY)?.visits, 2);
  assert.equal(map.nodes.find((node) => node.id === MICRO_UNIVERSE_ENTRY)?.isCurrent, true);
});
