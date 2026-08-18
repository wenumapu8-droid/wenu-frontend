import assert from 'node:assert/strict';

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.has(key) ? storage.get(key) : null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
};

const {
  KDX_MEMORY_KEY,
  clearMemory,
  observeConcept,
  readMemoryTrace,
  readSpecimen,
  record,
} = await import('../src/kodex/return/memory.js');

clearMemory();
record({ type: 'view', work: '/kodex/' });
record({ type: 'signal' });
observeConcept('MEMORY', { strength: 0.42, seconds: 8 });
observeConcept('SIGNAL', { strength: 0.31 });
record({ type: 'effect', effect: 'distort' });
record({ type: 'cycle' });

const trace = readMemoryTrace('VERIFY');
assert.equal(trace.version, 2);
assert.equal(trace.curated, false);
assert.ok(trace.concepts.find((concept) => concept.key === 'MEMORY').salience > 0);
assert.ok(trace.concepts.find((concept) => concept.key === 'SIGNAL').salience > 0);
assert.ok(trace.strongestAssociation);
assert.ok(trace.visualVector.persistence > 0);

const specimenA = readSpecimen('VERIFY');
const specimenB = readSpecimen('VERIFY');
assert.equal(specimenA.seed, specimenB.seed, 'same event history must remain reproducible');
assert.equal(specimenA.memoryTrace.seed, trace.seed);

storage.set(KDX_MEMORY_KEY, JSON.stringify({
  started: Date.now() - 10_000,
  views: ['/kodex/', '/kodex/archive/'],
  effects: ['mirror'],
  signal: 1,
  cycle: 1,
}));
const migrated = readMemoryTrace('LEGACY');
assert.equal(migrated.version, 2);
assert.equal(JSON.parse(storage.get(KDX_MEMORY_KEY)).version, 2);
assert.ok(migrated.concepts.some((concept) => concept.salience > 0));

clearMemory();
assert.equal(storage.has(KDX_MEMORY_KEY), false);
console.log('KODEX semantic memory v2 verification: PASS');
