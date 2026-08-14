import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MICRO_UNIVERSE_ENTRY,
  MICRO_UNIVERSE_GRAPH,
  MICRO_UNIVERSE_NODES,
  buildMicroUniverseFrame,
  createMicroUniverseState,
  enterMicroUniverseNode,
} from '../src/lib/kodex/micro-universe.js';

test('micro-universe has exactly 12 nodes across four primary fields', () => {
  const nodes = Object.values(MICRO_UNIVERSE_NODES);
  assert.equal(nodes.length, 12);
  assert.deepEqual([...new Set(nodes.map((node) => node.field))].sort(), ['art','consciousness','science','technology']);
  assert.equal(Object.keys(MICRO_UNIVERSE_GRAPH).length, 12);
  assert.ok(nodes.every((node) => MICRO_UNIVERSE_GRAPH[node.id]?.length === 4));
});

test('entry frame is bounded, deterministic and never auto-navigates', () => {
  const state = createMicroUniverseState();
  assert.equal(state.currentNodeId, MICRO_UNIVERSE_ENTRY);
  const a = buildMicroUniverseFrame(state,{ seed:'lab-proof' });
  const b = buildMicroUniverseFrame(state,{ seed:'lab-proof' });
  assert.deepEqual(a.selected.map((x) => [x.id,x.role]), b.selected.map((x) => [x.id,x.role]));
  assert.ok(a.selected.length >= 2 && a.selected.length <= 4);
  assert.equal(a.autoNavigate,false);
});

test('memory-conditioned ritual is closed before synthetic art key and can open after it', () => {
  let state = createMicroUniverseState({ currentNodeId:'CON-OBSERVER', currentFields:['consciousness','observer'] });
  const before = buildMicroUniverseFrame(state,{ seed:'before-key' });
  assert.equal(before.selected.some((x) => x.id === 'CON-RITUAL'),false);

  state = enterMicroUniverseNode(state,'ART-IMAGE','BRIDGE');
  assert.ok(state.activatedArtworks.includes('OCN-LAB-KEY'));
  state = enterMicroUniverseNode(state,'CON-OBSERVER','ECHO');

  const seen = Array.from({ length:64 },(_,i) => buildMicroUniverseFrame(state,{ seed:`after-key-${i}` }))
    .some((frame) => frame.selected.some((x) => x.id === 'CON-RITUAL'));
  assert.equal(seen,true);
});

test('every node remains reachable in the declared lab graph', () => {
  const reached = new Set([MICRO_UNIVERSE_ENTRY]);
  const queue = [MICRO_UNIVERSE_ENTRY];
  while (queue.length) {
    const current = queue.shift();
    for (const next of MICRO_UNIVERSE_GRAPH[current] || []) {
      if (!reached.has(next)) { reached.add(next); queue.push(next); }
    }
  }
  assert.equal(reached.size,12);
});
