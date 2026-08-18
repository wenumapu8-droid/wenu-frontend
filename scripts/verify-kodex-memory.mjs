import assert from 'node:assert/strict';

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.has(key) ? storage.get(key) : null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
};

const { memoryDiagnostics, readSpecimen, record } = await import('../src/kodex/return/memory.js');
const {
  KDX_CONCEPTS,
  canonicalConceptKey,
  conceptsForEvent,
  edgeKey,
} = await import('../src/kodex/memory/concepts.js');

const KEY = 'kx-journey';

storage.clear();
const writesBefore = memoryDiagnostics.writes;

record({ type: 'view', work: '/kodex/' });
record({ type: 'effect', effect: 'mirror' });
record({ type: 'cycle' });

const acceptedRaw = storage.get(KEY);
assert.ok(acceptedRaw, 'RETURN specimen store must persist accepted route/effect/cycle evidence');
const accepted = JSON.parse(acceptedRaw);
assert.deepEqual(Object.keys(accepted).sort(), ['cycle', 'effects', 'views']);
assert.deepEqual(accepted.views, ['/kodex/']);
assert.deepEqual(accepted.effects, ['mirror']);
assert.equal(accepted.cycle, 1);

const stableBeforeRejectedWrites = storage.get(KEY);
record({ type: 'signal' });
record({ type: 'dwell', concept: 'MEMORY', seconds: 99 });
record({ type: 'concept', concept: 'OBSERVER', strength: 1 });
assert.equal(
  storage.get(KEY),
  stableBeforeRejectedWrites,
  'RETURN specimen store must ignore signal/dwell/concept semantic-memory writes',
);
assert.equal(memoryDiagnostics.writes, writesBefore + 3, 'only view/effect/cycle writes are admitted');

const specimenA = readSpecimen('VERIFY');
const specimenB = readSpecimen('VERIFY');
assert.deepEqual(specimenA, specimenB, 'same RETURN evidence must remain deterministic');
assert.equal(specimenA.curated, false);
assert.equal(specimenA.cycle, 2);
assert.deepEqual(specimenA.visualChain, ['mirror']);

assert.equal(KDX_CONCEPTS.SIGNAL.id, 'CX-001');
assert.equal(KDX_CONCEPTS.MATTER.id, 'CX-002');
assert.equal(KDX_CONCEPTS.MEMORY.id, 'CX-003');
assert.equal(KDX_CONCEPTS.OBSERVER.id, 'CX-004');
assert.equal(KDX_CONCEPTS.RETURN.id, 'CX-005');
assert.equal(canonicalConceptKey(' memory '), 'MEMORY');
assert.equal(canonicalConceptKey('unknown'), null);
assert.equal(edgeKey('MEMORY', 'SIGNAL'), 'MEMORY::SIGNAL');

const semanticProposal = conceptsForEvent({ type: 'concept', concept: 'MEMORY', strength: 0.42 });
assert.ok(
  semanticProposal.some(({ key, weight }) => key === 'MEMORY' && weight > 0),
  'concept vocabulary may remain a pure proposal layer without owning persistence',
);
assert.equal(
  storage.get(KEY),
  stableBeforeRejectedWrites,
  'pure semantic vocabulary evaluation must not mutate RETURN persistence',
);

console.log('KODEX memory authority boundary verification: PASS');
