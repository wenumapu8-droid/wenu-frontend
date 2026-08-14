import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MICRO_UNIVERSE_ENTRY,
  MICRO_UNIVERSE_GRAPH,
  MICRO_UNIVERSE_HISTORY_KIND,
  MICRO_UNIVERSE_NODES,
  buildMicroUniverseFrame,
  buildMicroUniverseUrl,
  createMicroUniverseDeepLinkState,
  createMicroUniverseHistorySnapshot,
  createMicroUniverseState,
  enterMicroUniverseNode,
  restoreMicroUniverseHistoryState,
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

test('history snapshot reconstructs route memory without putting memory in the URL', () => {
  let state = createMicroUniverseState();
  state = enterMicroUniverseNode(state,'ART-FORM','BRIDGE');
  state = enterMicroUniverseNode(state,'ART-IMAGE','CONTINUITY');
  assert.ok(state.activatedArtworks.includes('OCN-LAB-KEY'));

  const snapshot = createMicroUniverseHistorySnapshot(state);
  assert.equal(snapshot.kind, MICRO_UNIVERSE_HISTORY_KIND);
  const restored = restoreMicroUniverseHistoryState(snapshot);
  assert.equal(restored.currentNodeId,'ART-IMAGE');
  assert.deepEqual(restored.activatedArtworks,state.activatedArtworks);
  assert.deepEqual(restored.routeTrace,state.routeTrace);

  const url = buildMicroUniverseUrl(restored);
  assert.match(url,/node=ART-IMAGE/);
  assert.match(url,/lens=NAKED_EYE/);
  assert.equal(url.includes('OCN-LAB-KEY'),false);
  assert.equal(url.includes('routeSignature'),false);
  assert.equal(url.includes('memory'),false);
});

test('clean deep links reconstruct only safe public coordinates, not gated memory', () => {
  const direct = createMicroUniverseDeepLinkState({ nodeId:'TECH-CITY', lens:'SATELLITE' });
  assert.equal(direct.currentNodeId,'TECH-CITY');
  assert.equal(direct.lens,'SATELLITE');
  assert.deepEqual(direct.activatedArtworks,[]);
  assert.equal(direct.routeTrace.filter((event) => event.kind === 'VISIT_NODE').length,1);

  const gated = createMicroUniverseDeepLinkState({ nodeId:'CON-RITUAL', lens:'META' });
  assert.equal(gated.currentNodeId,MICRO_UNIVERSE_ENTRY);
  assert.equal(gated.lens,'META');
  assert.deepEqual(gated.activatedArtworks,[]);

  const invalid = restoreMicroUniverseHistoryState({ kind:MICRO_UNIVERSE_HISTORY_KIND, observer:{ currentNodeId:'NOT-A-NODE' } }, { nodeId:'ART-FORM' });
  assert.equal(invalid.currentNodeId,'ART-FORM');
});
