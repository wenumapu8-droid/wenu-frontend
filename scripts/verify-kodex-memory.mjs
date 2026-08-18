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
const {
  semanticConceptToJourneyAction,
  semanticRelationToJourneyAction,
} = await import('../src/lib/kodex/runtime/semantic-memory-journey-adapter.js');

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

assert.equal(
  semanticConceptToJourneyAction({ eventId: 'passive-1', concept: 'MEMORY', explicitCommit: false }),
  null,
  'passive concept observation must not become a persisted journey action',
);
assert.equal(
  semanticRelationToJourneyAction({ eventId: 'passive-2', from: 'MEMORY', to: 'SIGNAL', explicitCommit: false }),
  null,
  'passive concept co-occurrence must not become a persisted relation',
);

const conceptAction = semanticConceptToJourneyAction({
  eventId: 'commit-1',
  concept: 'MEMORY',
  explicitCommit: true,
});
assert.deepEqual(conceptAction, {
  id: 'semantic:commit-1:CX-003',
  createdAt: 0,
  presetId: 'semantic-memory-v0.1.0',
  family: 'SEMANTIC_MEMORY',
  action: 'TRACE_CONCEPT',
  memoryWrites: ['concept:CX-003:MEMORY'],
});

const relationActionA = semanticRelationToJourneyAction({
  eventId: 'rel-1',
  from: 'SIGNAL',
  to: 'MEMORY',
  explicitCommit: true,
});
const relationActionB = semanticRelationToJourneyAction({
  eventId: 'rel-1',
  from: 'MEMORY',
  to: 'SIGNAL',
  explicitCommit: true,
});
assert.deepEqual(relationActionA, relationActionB, 'explicit relation identity must be order-stable');
assert.deepEqual(relationActionA?.memoryWrites, ['relation:CX-003:CX-001']);
assert.equal(
  storage.get(KEY),
  stableBeforeRejectedWrites,
  'semantic JourneyState adapter must own no RETURN storage side effects',
);

console.log('KODEX memory authority boundary verification: PASS');
