import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MICRO_UNIVERSE_ENTRY,
  MICRO_UNIVERSE_GRAPH,
  MICRO_UNIVERSE_HISTORY_KIND,
  MICRO_UNIVERSE_NODES,
  activateMicroUniverseArtwork,
  buildMicroUniverseFrame,
  buildMicroUniverseUrl,
  createMicroUniverseDeepLinkState,
  createMicroUniverseHistorySnapshot,
  createMicroUniverseState,
  enterMicroUniverseNode,
  getMicroUniverseArtwork,
  restoreMicroUniverseHistoryState,
} from '../src/lib/kodex/micro-universe.js';
import {
  OCIN_PROTECTED_ACTIVATOR_IDS,
  OCIN_PROTECTED_ACTIVATORS_V0,
  validateProtectedOcinActivator,
} from '../src/lib/kodex/ocin/protected-activators-v0.js';

test('micro-universe has exactly 12 nodes across four primary fields', () => {
  const nodes = Object.values(MICRO_UNIVERSE_NODES);
  assert.equal(nodes.length, 12);
  assert.deepEqual([...new Set(nodes.map((node) => node.field))].sort(), ['art','consciousness','science','technology']);
  assert.equal(Object.keys(MICRO_UNIVERSE_GRAPH).length, 12);
  assert.ok(nodes.every((node) => MICRO_UNIVERSE_GRAPH[node.id]?.length === 4));
});

test('three protected Ocín activators are source-linked, full-view and non-renderable before approval', () => {
  assert.deepEqual([...OCIN_PROTECTED_ACTIVATOR_IDS].sort(), ['OCN-MND-GRY-002','OCN-SQR-001','OCN-TOR-001']);
  for (const record of Object.values(OCIN_PROTECTED_ACTIVATORS_V0)) {
    assert.deepEqual(validateProtectedOcinActivator(record), { valid:true, reasons:[] });
    assert.equal(record.fullViewRequired,true);
    assert.equal(record.sourceBytesRenderable,false);
    assert.equal(record.provenanceStatus,'SOURCE_LINKED');
    assert.equal(record.prohibitedPresentation.includes('crop'),true);
    assert.ok(record.primaryActivation);
  }
  assert.equal(MICRO_UNIVERSE_NODES['ART-FORM'].artworkId,'OCN-SQR-001');
  assert.equal(MICRO_UNIVERSE_NODES['ART-IMAGE'].artworkId,'OCN-TOR-001');
  assert.equal(MICRO_UNIVERSE_NODES['ART-POETRY'].artworkId,'OCN-MND-GRY-002');
});

test('entry frame is bounded, deterministic and never auto-navigates', () => {
  const state = createMicroUniverseState();
  assert.equal(state.currentNodeId, MICRO_UNIVERSE_ENTRY);
  assert.equal(state.depth,0);
  const a = buildMicroUniverseFrame(state,{ seed:'lab-proof' });
  const b = buildMicroUniverseFrame(state,{ seed:'lab-proof' });
  assert.deepEqual(a.selected.map((x) => [x.id,x.role]), b.selected.map((x) => [x.id,x.role]));
  assert.ok(a.selected.length >= 2 && a.selected.length <= 4);
  assert.equal(a.autoNavigate,false);
});

test('meaningful route entry increments semantic depth without changing lens', () => {
  const state = createMicroUniverseState();
  const next = enterMicroUniverseNode(state,'SCI-PATTERN','CONTINUITY');
  assert.equal(next.currentNodeId,'SCI-PATTERN');
  assert.equal(next.depth,1);
  assert.equal(next.lens,state.lens);
  const again = enterMicroUniverseNode(next,'SCI-COSMOS','CONTINUITY');
  assert.equal(again.depth,2);
});

test('entering an artwork node does not activate it; explicit activation unlocks the memory-conditioned ritual', () => {
  let state = createMicroUniverseState({ currentNodeId:'CON-OBSERVER', currentFields:['consciousness','observer'] });
  const before = buildMicroUniverseFrame(state,{ seed:'before-key' });
  assert.equal(before.selected.some((x) => x.id === 'CON-RITUAL'),false);

  state = enterMicroUniverseNode(state,'ART-IMAGE','BRIDGE');
  assert.equal(state.activatedArtworks.includes('OCN-TOR-001'),false);
  const artwork = getMicroUniverseArtwork('ART-IMAGE');
  assert.equal(artwork?.artworkId,'OCN-TOR-001');

  state = activateMicroUniverseArtwork(state,'OCN-TOR-001');
  assert.ok(state.activatedArtworks.includes('OCN-TOR-001'));
  assert.ok(state.memorySignals.includes('art:OCN-TOR-001'));
  state = enterMicroUniverseNode(state,'CON-OBSERVER','ECHO');

  const seen = Array.from({ length:64 },(_,i) => buildMicroUniverseFrame(state,{ seed:`after-key-${i}` }))
    .some((frame) => frame.selected.some((x) => x.id === 'CON-RITUAL'));
  assert.equal(seen,true);
});

test('activation is restricted to the protected artwork bound to the current node', () => {
  let state = enterMicroUniverseNode(createMicroUniverseState(),'ART-FORM','BRIDGE');
  state = activateMicroUniverseArtwork(state,'OCN-TOR-001');
  assert.deepEqual(state.activatedArtworks,[]);
  state = activateMicroUniverseArtwork(state,'OCN-SQR-001');
  assert.deepEqual(state.activatedArtworks,['OCN-SQR-001']);
  const repeated = activateMicroUniverseArtwork(state,'OCN-SQR-001');
  assert.deepEqual(repeated.activatedArtworks,['OCN-SQR-001']);
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

test('history snapshot reconstructs explicit artwork memory without putting it in the URL', () => {
  let state = createMicroUniverseState();
  state = enterMicroUniverseNode(state,'ART-FORM','BRIDGE');
  state = activateMicroUniverseArtwork(state,'OCN-SQR-001');
  state = enterMicroUniverseNode(state,'ART-IMAGE','CONTINUITY');
  state = activateMicroUniverseArtwork(state,'OCN-TOR-001');
  assert.ok(state.activatedArtworks.includes('OCN-TOR-001'));

  const snapshot = createMicroUniverseHistorySnapshot(state);
  assert.equal(snapshot.kind, MICRO_UNIVERSE_HISTORY_KIND);
  const restored = restoreMicroUniverseHistoryState(snapshot);
  assert.equal(restored.currentNodeId,'ART-IMAGE');
  assert.equal(restored.depth,2);
  assert.deepEqual(restored.activatedArtworks,state.activatedArtworks);
  assert.deepEqual(restored.routeTrace,state.routeTrace);

  const url = buildMicroUniverseUrl(restored);
  assert.match(url,/node=ART-IMAGE/);
  assert.match(url,/lens=NAKED_EYE/);
  assert.equal(url.includes('OCN-TOR-001'),false);
  assert.equal(url.includes('OCN-SQR-001'),false);
  assert.equal(url.includes('routeSignature'),false);
  assert.equal(url.includes('memory'),false);
});

test('clean deep links reconstruct only safe public coordinates, not gated memory', () => {
  const direct = createMicroUniverseDeepLinkState({ nodeId:'TECH-CITY', lens:'SATELLITE' });
  assert.equal(direct.currentNodeId,'TECH-CITY');
  assert.equal(direct.lens,'SATELLITE');
  assert.equal(direct.depth,0);
  assert.deepEqual(direct.activatedArtworks,[]);
  assert.equal(direct.routeTrace.filter((event) => event.kind === 'VISIT_NODE').length,1);

  const gated = createMicroUniverseDeepLinkState({ nodeId:'CON-RITUAL', lens:'META' });
  assert.equal(gated.currentNodeId,MICRO_UNIVERSE_ENTRY);
  assert.equal(gated.lens,'META');
  assert.deepEqual(gated.activatedArtworks,[]);

  const invalid = restoreMicroUniverseHistoryState({ kind:MICRO_UNIVERSE_HISTORY_KIND, observer:{ currentNodeId:'NOT-A-NODE' } }, { nodeId:'ART-FORM' });
  assert.equal(invalid.currentNodeId,'ART-FORM');
});
