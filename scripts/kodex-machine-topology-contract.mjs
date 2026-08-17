import assert from 'node:assert/strict';
import {
  buildMachineTopology,
  createSeededRandom,
  seedToUint32,
} from '../src/lib/kodex/machine-topology.js';

const seedA = 'A90C-73F1';
const seedB = '1F2E-9A10';
const options = { width: 720, height: 720 };

const a = buildMachineTopology(seedA, options);
const replayA = buildMachineTopology(seedA, options);
const b = buildMachineTopology(seedB, options);

assert.deepEqual(a, replayA, 'same seed must reproduce exact topology');
assert.notDeepEqual(a, b, 'different seeds must produce different topology');
assert.equal(seedToUint32(seedA), seedToUint32(seedA), 'seed hash must be stable');

const randomA = createSeededRandom(seedA);
const replayRandomA = createSeededRandom(seedA);
assert.deepEqual(
  [randomA(), randomA(), randomA()],
  [replayRandomA(), replayRandomA(), replayRandomA()],
  'local PRNG must replay exactly',
);

function assertTopology(topology) {
  assert.ok(
    topology.nodes.length >= 20 && topology.nodes.length <= 49,
    `bounded node count: ${topology.nodes.length}`,
  );
  assert.ok(
    topology.edges.length >= topology.nodes.length * 0.6,
    `sufficient connected structure: ${topology.edges.length}`,
  );

  const nodeIds = new Set(topology.nodes.map((node) => node.id));
  assert.equal(nodeIds.size, topology.nodes.length, 'node ids must be unique');

  for (const node of topology.nodes) {
    assert.ok(node.x >= 0 && node.x <= topology.width, `${node.id} x must stay in bounds`);
    assert.ok(node.y >= 0 && node.y <= topology.height, `${node.id} y must stay in bounds`);
    assert.ok(['core', 'junction', 'port'].includes(node.kind), `${node.id} node kind must be governed`);
  }

  for (const edge of topology.edges) {
    assert.ok(nodeIds.has(edge.from), `${edge.id} from endpoint must exist`);
    assert.ok(nodeIds.has(edge.to), `${edge.id} to endpoint must exist`);
    assert.notEqual(edge.from, edge.to, `${edge.id} must not self-loop`);
    assert.ok(Array.isArray(edge.path) && edge.path.length >= 3, `${edge.id} must expose a routed path`);
    for (const point of edge.path) {
      assert.ok(point.x >= 0 && point.x <= topology.width, `${edge.id} path x must stay in bounds`);
      assert.ok(point.y >= 0 && point.y <= topology.height, `${edge.id} path y must stay in bounds`);
    }
  }

  for (const cell of topology.cells) {
    assert.ok(cell.x >= 0 && cell.x + cell.width <= topology.width + 1, `${cell.id} x must stay in bounds`);
    assert.ok(cell.y >= 0 && cell.y + cell.height <= topology.height + 1, `${cell.id} y must stay in bounds`);
    assert.ok(['processor', 'memory-cell'].includes(cell.kind), `${cell.id} cell kind must be governed`);
  }
}

assertTopology(a);
assertTopology(b);

// A bounded deterministic sweep protects the topology model against seeds that
// accidentally collapse the lattice or push geometry outside the canvas. It is
// intentionally pure/fast; browser and creator evidence remain separate gates.
const sweep = [];
for (let i = 0; i < 256; i += 1) {
  const left = ((i * 7919) >>> 0).toString(16).toUpperCase().padStart(8, '0').slice(0, 4);
  const right = ((i * 104729) >>> 0).toString(16).toUpperCase().padStart(8, '0').slice(-4);
  const seed = `${left}-${right}`;
  const topology = buildMachineTopology(seed, options);
  assertTopology(topology);
  assert.deepEqual(
    topology,
    buildMachineTopology(seed, options),
    `sweep seed ${seed} must replay exactly`,
  );
  sweep.push({ nodes: topology.nodes.length, edges: topology.edges.length });
}

console.log(JSON.stringify({
  status: 'PASS',
  version: a.version,
  seedA: { nodes: a.nodes.length, edges: a.edges.length, cells: a.cells.length },
  seedB: { nodes: b.nodes.length, edges: b.edges.length, cells: b.cells.length },
  sameSeedExact: JSON.stringify(a) === JSON.stringify(replayA),
  differentSeedDifferent: JSON.stringify(a) !== JSON.stringify(b),
  sweep: {
    samples: sweep.length,
    minNodes: Math.min(...sweep.map((sample) => sample.nodes)),
    maxNodes: Math.max(...sweep.map((sample) => sample.nodes)),
    minEdges: Math.min(...sweep.map((sample) => sample.edges)),
    maxEdges: Math.max(...sweep.map((sample) => sample.edges)),
  },
}, null, 2));
