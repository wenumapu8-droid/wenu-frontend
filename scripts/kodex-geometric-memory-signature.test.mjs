import test from 'node:test';
import assert from 'node:assert/strict';

import {
  GEOMETRIC_MEMORY_SIGNATURE_PROFILE,
  buildGeometricMemorySignature,
  classifyGeometricMemoryTopology,
} from '../src/lib/kodex/geometric-memory-signature.js';
import {
  createMicroUniverseState,
  enterMicroUniverseNode,
} from '../src/lib/kodex/micro-universe.js';
import { buildMicroUniverseMemoryConstellation } from '../src/lib/kodex/memory-constellation.js';

function travel(ids = []) {
  let state = createMicroUniverseState({ routeSignature: 'KDX-MEMORY-TEST' });
  for (const id of ids) state = enterMicroUniverseNode(state, id, 'CONTINUITY');
  return state;
}

test('initial route memory manifests as a seed point only', () => {
  const state = createMicroUniverseState({ routeSignature: 'KDX-SEED' });
  const signature = buildGeometricMemorySignature(state);
  assert.equal(signature.topology, 'SEED_POINT');
  assert.equal(signature.nodes.length, 1);
  assert.equal(signature.edges.length, 0);
  assert.equal(signature.revealsUnvisitedNodes, false);
  assert.equal(signature.mutatesRouteState, false);
  assert.equal(signature.mutatesMemoryState, false);
  assert.equal(GEOMETRIC_MEMORY_SIGNATURE_PROFILE.createsParallelMemory, false);
});

test('same route state produces byte-stable signature data', () => {
  const state = travel(['SCI-PATTERN', 'SCI-COSMOS', 'TECH-CITY']);
  const first = buildGeometricMemorySignature(state);
  const second = buildGeometricMemorySignature(state);
  assert.deepEqual(first, second);
  assert.equal(first.id, second.id);
});

test('a deeper unique route becomes spiral descent when it remains within fewer than three fields', () => {
  const state = travel(['SCI-PATTERN', 'SCI-COSMOS', 'TECH-CITY']);
  const signature = buildGeometricMemorySignature(state);
  assert.equal(signature.metrics.depth, 3);
  assert.equal(signature.metrics.revisitCount, 0);
  assert.equal(signature.metrics.fieldCount, 2);
  assert.equal(signature.topology, 'SPIRAL_DESCENT');
  assert.equal(signature.patterns.some((pattern) => pattern.id === 'NESTED_RECURSION'), true);
});

test('a route spanning three or more observed fields becomes a constellation before spiral classification', () => {
  const state = travel(['TECH-NETWORK', 'ART-FORM', 'CON-MIND']);
  const signature = buildGeometricMemorySignature(state);
  assert.equal(signature.metrics.visitedCount, 4);
  assert.equal(signature.metrics.fieldCount, 4);
  assert.equal(signature.metrics.revisitCount, 0);
  assert.equal(signature.topology, 'CONSTELLATION');
});

test('a simple return to a previously visited node manifests as an orbit loop', () => {
  const state = travel(['SCI-PATTERN', 'SCI-COSMOS', 'SCI-BIOLOGY']);
  const signature = buildGeometricMemorySignature(state);
  assert.equal(signature.metrics.revisitCount, 1);
  assert.ok(signature.metrics.closedReturnCount >= 1);
  assert.equal(signature.metrics.branchPointCount, 0);
  assert.equal(signature.topology, 'ORBIT_LOOP');
});

test('revisit plus divergent observed exits becomes a hybrid weave', () => {
  const state = travel(['SCI-PATTERN', 'SCI-COSMOS', 'SCI-BIOLOGY', 'ART-FORM']);
  const signature = buildGeometricMemorySignature(state);
  assert.equal(signature.metrics.revisitCount, 1);
  assert.ok(signature.metrics.branchPointCount >= 1);
  assert.equal(signature.topology, 'HYBRID_WEAVE');
});

test('topology classifier remains bounded for synthetic branch-only evidence', () => {
  assert.equal(classifyGeometricMemoryTopology({
    visitedCount: 5,
    totalVisits: 5,
    edgeCount: 4,
    revisitCount: 0,
    closedReturnCount: 0,
    branchPointCount: 1,
    fieldCount: 2,
    depth: 2,
  }), 'BRANCH_TREE');
});

test('signature contains visited memory only and never hidden graph topology', () => {
  const state = travel(['TECH-NETWORK', 'ART-FORM']);
  const constellation = buildMicroUniverseMemoryConstellation(state);
  const signature = buildGeometricMemorySignature(state);
  const expected = new Set(constellation.nodes.map((node) => node.id));
  const actual = new Set(signature.nodes.map((node) => node.id));
  assert.deepEqual(actual, expected);
  for (const edge of signature.edges) {
    assert.equal(expected.has(edge.from), true);
    assert.equal(expected.has(edge.to), true);
  }
  assert.equal(signature.revealsUnvisitedNodes, false);
});

test('derivation does not mutate observer route or memory state', () => {
  const state = travel(['SCI-PATTERN', 'SCI-COSMOS']);
  const before = structuredClone(state);
  buildGeometricMemorySignature(state);
  assert.deepEqual(state, before);
});

test('meaningful route change changes the geometric memory signature', () => {
  const a = buildGeometricMemorySignature(travel(['SCI-PATTERN', 'SCI-COSMOS']));
  const b = buildGeometricMemorySignature(travel(['TECH-NETWORK', 'ART-FORM']));
  assert.notEqual(a.id, b.id);
  assert.notDeepEqual(a.nodes.map(({ id, x, y }) => ({ id, x, y })), b.nodes.map(({ id, x, y }) => ({ id, x, y })));
});
