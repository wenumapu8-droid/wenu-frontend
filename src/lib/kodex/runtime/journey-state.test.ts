/**
 * KODEX−∞ · JourneyState + EventTrace core — unit tests (KOD-28).
 *
 * Run with the repository's pinned Node (24.14.1), which strips TypeScript
 * types natively and ships the test runner:
 *
 *     node --test src/lib/kodex/runtime/journey-state.test.ts
 *
 * Each acceptance criterion from the work packet is tagged AC1..AC7 below.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  KODEX_LETTERS,
  applyJourneyEvent,
  applyJourneyEvents,
  boundedSerendipityIndex,
  createInitialJourneyState,
  hasAppliedEvent,
  restoreJourneyState,
  serializeJourneyState,
  toSessionMemory,
  type KodexAlphabetJourneyState,
  type KodexJourneyEvent,
} from './journey-state.ts';

/** A representative nonalphabetical walk: A → C → H → C′ → M → C → Q. */
const WALK: KodexJourneyEvent[] = [
  { id: 'e1', type: 'ENTER_LETTER', letter: 'C', worldId: 'world:archive' },
  { id: 'e2', type: 'COMMIT_ACTION', actionId: 'act:open-plate', sourceIds: ['src:001'] },
  { id: 'e3', type: 'TRACE_RELATION', relationId: 'rel:plate->press', entityIds: ['ent:press'] },
  { id: 'e4', type: 'ENTER_LETTER', letter: 'H', worldId: 'world:machine' },
  { id: 'e5', type: 'IGNORE_SIGNAL', signalId: 'sig:unread-margin' },
  { id: 'e6', type: 'OBSERVE_SPECTRAL', bandId: 'band:obsidian' },
  { id: 'e7', type: 'ENTER_LETTER', letter: 'C', worldId: 'world:archive' },
];

const seed = () => createInitialJourneyState({ sessionId: 'kdx-test' });

/* ================================================================== *
 * Initial state (AC7)
 * ================================================================== */

test('AC7 · initial state begins at A and is deterministic', () => {
  const a = seed();
  const b = seed();

  assert.equal(a.currentLetter, 'A');
  assert.equal(a.previousLetter, null);
  assert.deepEqual([...a.path], ['A']);
  assert.deepEqual([...a.visitedLetters], ['A']);
  assert.equal(a.visitCounts.A, 1);
  assert.equal(a.mVisitCount, 0);
  assert.equal(a.returnAnchor, null);
  assert.equal(a.completionEligible, false);
  assert.equal(a.appliedEventIds.length, 0);

  // Two independent constructions are indistinguishable.
  assert.deepStrictEqual(serializeJourneyState(a), serializeJourneyState(b));
  assert.equal(a.routeSignature, b.routeSignature);

  // The coordinate system is exactly 25 letters, A..Y.
  assert.equal(KODEX_LETTERS.length, 25);
  assert.equal(KODEX_LETTERS[0], 'A');
  assert.equal(KODEX_LETTERS[KODEX_LETTERS.length - 1], 'Y');
});

test('state is frozen; callers cannot mutate the trace in place', () => {
  const state = applyJourneyEvents(seed(), WALK);
  assert.throws(() => {
    (state.committedActionIds as string[]).push('act:smuggled');
  });
});

/* ================================================================== *
 * AC1 · determinism
 * ================================================================== */

test('AC1 · same ordered event sequence produces the same state', () => {
  const first = applyJourneyEvents(seed(), WALK);
  const second = applyJourneyEvents(seed(), WALK);

  assert.deepStrictEqual(serializeJourneyState(first), serializeJourneyState(second));
  assert.equal(first.routeSignature, second.routeSignature);
  assert.equal(first.serendipitySeed, second.serendipitySeed);
});

test('AC1 · a different order produces a different route signature', () => {
  const forward = applyJourneyEvents(seed(), [
    { id: 'x1', type: 'ENTER_LETTER', letter: 'C' },
    { id: 'x2', type: 'ENTER_LETTER', letter: 'H' },
  ]);
  const reversed = applyJourneyEvents(seed(), [
    { id: 'x2', type: 'ENTER_LETTER', letter: 'H' },
    { id: 'x1', type: 'ENTER_LETTER', letter: 'C' },
  ]);

  assert.deepEqual([...forward.path], ['A', 'C', 'H']);
  assert.deepEqual([...reversed.path], ['A', 'H', 'C']);
  assert.notEqual(forward.routeSignature, reversed.routeSignature);
});

test('AC1 · bounded serendipity is deterministic and stays inside its bucket', () => {
  const state = applyJourneyEvents(seed(), WALK);
  const again = applyJourneyEvents(seed(), WALK);

  assert.equal(boundedSerendipityIndex(state, 4), boundedSerendipityIndex(again, 4));
  for (let i = 0; i < 50; i += 1) {
    const index = boundedSerendipityIndex(state, 4, `salt-${i}`);
    assert.ok(index >= 0 && index < 4, `index ${index} escaped the bucket`);
  }
});

/* ================================================================== *
 * AC7 · action commit and ignored signal
 * ================================================================== */

test('AC7 · action commit records the decision and its sources', () => {
  const state = applyJourneyEvents(seed(), [
    { id: 'c1', type: 'ENTER_LETTER', letter: 'C' },
    { id: 'c2', type: 'COMMIT_ACTION', actionId: 'act:one', sourceIds: ['src:a', 'src:b'] },
    { id: 'c3', type: 'COMMIT_ACTION', actionId: 'act:two', sourceIds: ['src:b'] },
  ]);

  assert.deepEqual([...state.committedActionIds], ['act:one', 'act:two']);
  assert.deepEqual([...state.sourceIds], ['src:a', 'src:b']);
  assert.equal(state.completionEligible, true);
});

test('AC7 · ignored signals persist as delayed-consequence placeholders', () => {
  const state = applyJourneyEvents(seed(), [
    { id: 'i1', type: 'ENTER_LETTER', letter: 'K' },
    { id: 'i2', type: 'IGNORE_SIGNAL', signalId: 'sig:one' },
    { id: 'i3', type: 'ENTER_LETTER', letter: 'R' },
    { id: 'i4', type: 'IGNORE_SIGNAL', signalId: 'sig:two' },
  ]);

  assert.deepEqual([...state.ignoredSignalIds], ['sig:one', 'sig:two']);
  // Moving on never clears a signal the visitor passed over.
  assert.equal(state.currentLetter, 'R');
  assert.deepEqual([...toSessionMemory(state).unresolved], ['sig:one', 'sig:two']);
});

/* ================================================================== *
 * AC3 · revisits
 * ================================================================== */

test('AC3 · revisits increment the count without destroying prior trace', () => {
  const state = applyJourneyEvents(seed(), WALK);

  assert.equal(state.visitCounts.C, 2, 'C was entered twice');
  assert.equal(state.visitCounts.H, 1);
  assert.deepEqual([...state.path], ['A', 'C', 'H', 'C']);

  // visitedLetters stays a distinct set in first-visit order.
  assert.deepEqual([...state.visitedLetters], ['A', 'C', 'H']);

  // Everything recorded during the first visit to C survives the revisit.
  assert.deepEqual([...state.committedActionIds], ['act:open-plate']);
  assert.deepEqual([...state.tracedRelationIds], ['rel:plate->press']);
  assert.deepEqual([...state.ignoredSignalIds], ['sig:unread-margin']);
  assert.deepEqual([...state.spectralState], ['band:obsidian']);
  assert.equal(state.appliedEventIds.length, WALK.length);
});

test('AC3 · a third visit keeps incrementing and keeps the walk ordered', () => {
  const state = applyJourneyEvents(applyJourneyEvents(seed(), WALK), [
    { id: 'e8', type: 'ENTER_LETTER', letter: 'C' },
  ]);

  assert.equal(state.visitCounts.C, 3);
  assert.deepEqual([...state.path], ['A', 'C', 'H', 'C', 'C']);
  assert.deepEqual([...state.committedActionIds], ['act:open-plate']);
});

/* ================================================================== *
 * AC2 · idempotent replay by event identity
 * ================================================================== */

test('AC2 · replaying an event with an unchanged identity cannot double-write', () => {
  const base = applyJourneyEvents(seed(), WALK);
  const replayed = applyJourneyEvents(base, WALK);

  // The exact same object comes back: no write of any kind occurred.
  assert.equal(replayed, base);
  assert.deepStrictEqual(serializeJourneyState(replayed), serializeJourneyState(base));
});

test('AC2 · a duplicated COMMIT_ACTION id is recorded exactly once', () => {
  const commit: KodexJourneyEvent = {
    id: 'dup-commit',
    type: 'COMMIT_ACTION',
    actionId: 'act:only-once',
  };

  const once = applyJourneyEvent(seed(), commit);
  const twice = applyJourneyEvent(once, commit);
  const thrice = applyJourneyEvent(twice, { ...commit });

  assert.deepEqual([...thrice.committedActionIds], ['act:only-once']);
  assert.deepEqual([...thrice.appliedEventIds], ['dup-commit']);
  assert.equal(twice, once);
  assert.equal(thrice, once, 'a structurally equal clone is still the same identity');
});

test('AC2 · a duplicated ENTER_LETTER id cannot inflate the visit count', () => {
  const enter: KodexJourneyEvent = { id: 'dup-enter', type: 'ENTER_LETTER', letter: 'K' };
  const state = applyJourneyEvents(seed(), [enter, enter, enter]);

  assert.equal(state.visitCounts.K, 1);
  assert.deepEqual([...state.path], ['A', 'K']);
});

test('AC2 · de-duplication keys on identity only, so genuine repeats still count', () => {
  // Identical payload, different event identity: this is a real second visit,
  // not a replay, and it must be applied. This is what separates idempotent
  // replay from silently swallowing legitimate revisits.
  const state = applyJourneyEvents(seed(), [
    { id: 'visit-1', type: 'ENTER_LETTER', letter: 'K' },
    { id: 'visit-2', type: 'ENTER_LETTER', letter: 'K' },
  ]);

  assert.equal(state.visitCounts.K, 2);
  assert.deepEqual([...state.path], ['A', 'K', 'K']);
  assert.ok(hasAppliedEvent(state, 'visit-1'));
  assert.ok(hasAppliedEvent(state, 'visit-2'));
});

test('AC2 · interleaved partial replay converges on the same state', () => {
  const full = applyJourneyEvents(seed(), WALK);

  // A client that resends an overlapping window of the trace.
  const resent = applyJourneyEvents(
    applyJourneyEvents(seed(), WALK.slice(0, 4)),
    WALK.slice(2),
  );

  assert.deepStrictEqual(serializeJourneyState(resent), serializeJourneyState(full));
});

test('AC2 · an event without an identity is rejected', () => {
  assert.throws(
    () => applyJourneyEvent(seed(), { type: 'COMMIT_ACTION', actionId: 'x' } as KodexJourneyEvent),
    /event\.id/,
  );
});

/* ================================================================== *
 * AC4 · Heart state without a Heart visit
 * ================================================================== */

test('AC4 · Heart portal state can exist without any Heart visit', () => {
  const state = applyJourneyEvents(seed(), [
    { id: 'h1', type: 'ENTER_LETTER', letter: 'C' },
    { id: 'h2', type: 'SET_HEART_PORTAL', letter: 'C', portalState: 'LATENT' },
    { id: 'h3', type: 'SET_HEART_PORTAL', letter: 'C', portalState: 'RESONANT' },
    { id: 'h4', type: 'ENTER_LETTER', letter: 'Q' },
    { id: 'h5', type: 'SET_HEART_PORTAL', letter: 'Q', portalState: 'AVAILABLE' },
    { id: 'h6', type: 'COMMIT_ACTION', actionId: 'act:read' },
  ]);

  assert.equal(state.mPortalStateByLetter.C, 'RESONANT');
  assert.equal(state.mPortalStateByLetter.Q, 'AVAILABLE');

  // No visit was forced by any of that.
  assert.equal(state.mVisitCount, 0);
  assert.equal(state.currentLetter, 'Q');
  assert.ok(!state.visitedLetters.includes('M'));
  assert.ok(!state.path.includes('M'));
  assert.equal(state.returnAnchor, null);

  // And M is never a score: eligibility is reachable without ever visiting it.
  assert.equal(state.completionEligible, true);
});

test('AC4 · visiting M never changes completion eligibility', () => {
  const withoutHeart = applyJourneyEvents(seed(), [
    { id: 'n1', type: 'ENTER_LETTER', letter: 'C' },
    { id: 'n2', type: 'COMMIT_ACTION', actionId: 'act:read' },
  ]);
  const withHeart = applyJourneyEvents(withoutHeart, [
    { id: 'n3', type: 'ENTER_LETTER', letter: 'M' },
    { id: 'n4', type: 'LEAVE_HEART' },
  ]);

  assert.equal(withoutHeart.completionEligible, true);
  assert.equal(withHeart.completionEligible, true);
  assert.equal(withHeart.mVisitCount, 1);

  // Visiting only M, with no intermediate coordinate, confers nothing.
  const heartOnly = applyJourneyEvents(seed(), [
    { id: 'm1', type: 'ENTER_LETTER', letter: 'M' },
    { id: 'm2', type: 'COMMIT_ACTION', actionId: 'act:sit' },
  ]);
  assert.equal(heartOnly.mVisitCount, 1);
  assert.equal(heartOnly.completionEligible, false);
});

test('AC4 · M and Y cannot host the Heart portal', () => {
  assert.throws(
    () => applyJourneyEvent(seed(), { id: 'p1', type: 'SET_HEART_PORTAL', letter: 'M', portalState: 'LATENT' }),
    /Heart portal cannot be hosted/,
  );
  assert.throws(
    () => applyJourneyEvent(seed(), { id: 'p2', type: 'SET_HEART_PORTAL', letter: 'Y', portalState: 'LATENT' }),
    /Heart portal cannot be hosted/,
  );
});

test('AC4 · M is reachable from more than one region and accumulates visits', () => {
  const state = applyJourneyEvents(seed(), [
    { id: 'r1', type: 'ENTER_LETTER', letter: 'C' },
    { id: 'r2', type: 'ENTER_LETTER', letter: 'M' },
    { id: 'r3', type: 'LEAVE_HEART' },
    { id: 'r4', type: 'ENTER_LETTER', letter: 'R' },
    { id: 'r5', type: 'ENTER_LETTER', letter: 'M' },
    { id: 'r6', type: 'LEAVE_HEART' },
  ]);

  assert.equal(state.mVisitCount, 2);
  assert.equal(state.visitCounts.M, 2);
  assert.equal(state.currentLetter, 'R');
});

/* ================================================================== *
 * AC5 · return anchor round-trip
 * ================================================================== */

test('AC5 · leaving M restores the exact prior node, focus and world', () => {
  const beforeHeart = applyJourneyEvents(seed(), [
    { id: 'a1', type: 'ENTER_LETTER', letter: 'K', worldId: 'world:cosmology', focusId: 'focus:plate-7' },
    { id: 'a2', type: 'ENTER_LETTER', letter: 'K', worldId: 'world:cosmology', focusId: 'focus:plate-9' },
    { id: 'a3', type: 'TRACE_RELATION', relationId: 'rel:k' },
  ]);

  const inHeart = applyJourneyEvent(beforeHeart, { id: 'a4', type: 'ENTER_LETTER', letter: 'M' });

  assert.deepEqual(inHeart.returnAnchor, {
    letter: 'K',
    visitIndex: 2,
    focusId: 'focus:plate-9',
    worldId: 'world:cosmology',
    routeSignature: beforeHeart.routeSignature,
    traceLength: 3,
  });

  const returned = applyJourneyEvent(inHeart, { id: 'a5', type: 'LEAVE_HEART' });

  assert.equal(returned.currentLetter, beforeHeart.currentLetter);
  assert.equal(returned.currentFocusId, beforeHeart.currentFocusId);
  assert.equal(returned.currentWorldId, beforeHeart.currentWorldId);
  assert.equal(returned.previousLetter, 'M');
  assert.equal(returned.returnAnchor, null);

  // Restoration is not a new visit: the anchor round-trips exactly.
  assert.equal(returned.visitCounts.K, beforeHeart.visitCounts.K);

  // And the trace accumulated during the detour is preserved.
  assert.deepEqual([...returned.tracedRelationIds], ['rel:k']);
});

test('AC5 · the anchor survives serialize/restore byte-for-byte', () => {
  const inHeart = applyJourneyEvents(seed(), [
    { id: 's1', type: 'ENTER_LETTER', letter: 'J', worldId: 'world:artifact', focusId: 'focus:node-3' },
    { id: 's2', type: 'ENTER_LETTER', letter: 'M' },
  ]);

  const restored = restoreJourneyState(JSON.parse(JSON.stringify(serializeJourneyState(inHeart))));

  assert.deepEqual(restored.returnAnchor, inHeart.returnAnchor);

  // Leaving M after a restore lands in exactly the same place.
  const returnedLive = applyJourneyEvent(inHeart, { id: 's3', type: 'LEAVE_HEART' });
  const returnedRestored = applyJourneyEvent(restored, { id: 's3', type: 'LEAVE_HEART' });
  assert.deepStrictEqual(
    serializeJourneyState(returnedRestored),
    serializeJourneyState(returnedLive),
  );
});

test('AC5 · re-entering M from inside M does not overwrite the original anchor', () => {
  const state = applyJourneyEvents(seed(), [
    { id: 'o1', type: 'ENTER_LETTER', letter: 'P', focusId: 'focus:origin' },
    { id: 'o2', type: 'ENTER_LETTER', letter: 'M' },
    { id: 'o3', type: 'ENTER_LETTER', letter: 'M' },
  ]);

  assert.equal(state.returnAnchor?.letter, 'P');
  assert.equal(state.returnAnchor?.focusId, 'focus:origin');

  const returned = applyJourneyEvent(state, { id: 'o4', type: 'LEAVE_HEART' });
  assert.equal(returned.currentLetter, 'P');
  assert.equal(returned.currentFocusId, 'focus:origin');
});

test('AC5 · LEAVE_HEART outside M is a no-op', () => {
  const state = applyJourneyEvents(seed(), [{ id: 'q1', type: 'ENTER_LETTER', letter: 'C' }]);
  const after = applyJourneyEvent(state, { id: 'q2', type: 'LEAVE_HEART' });

  assert.equal(after.currentLetter, 'C');
  assert.equal(after.returnAnchor, null);
});

/* ================================================================== *
 * AC6 · privacy-minimized serialization
 * ================================================================== */

test('AC6 · full state round-trips through serialize/restore', () => {
  const state = applyJourneyEvents(seed(), [
    ...WALK,
    { id: 'z1', type: 'SET_HEART_PORTAL', letter: 'C', portalState: 'RESONANT' },
    { id: 'z2', type: 'RESOLVE_EDGES', edgeIds: ['edge:c->q', 'edge:c->m'] },
    { id: 'z3', type: 'OBSERVE_CONTRADICTION', contradictionId: 'con:dating' },
    { id: 'z4', type: 'RAISE_QUESTION', questionId: 'q:provenance' },
    { id: 'z5', type: 'SET_ACCESSIBILITY', accessibility: { motion: 'REDUCED', sound: 'ON' } },
    { id: 'z6', type: 'SET_CONSENT', grant: 'memoryWrite', granted: true },
  ]);

  const restored = restoreJourneyState(JSON.parse(JSON.stringify(serializeJourneyState(state))));
  assert.deepStrictEqual(serializeJourneyState(restored), serializeJourneyState(state));
  assert.equal(restored.routeSignature, state.routeSignature);
});

test('AC6 · serialization excludes raw pointer telemetry', () => {
  // Events arriving from the input layer may carry a normalized-input snapshot.
  // None of it may reach memory: passive pointer movement cannot write
  // consequential personal memory (ADR-0010).
  const telemetry = {
    pointer: { x: 0.731, y: -0.442, targetX: 0.9, targetY: -0.5, active: true, type: 'mouse' },
    velocity: { x: 0.0031, y: -0.0044, magnitude: 0.0054 },
    devicePixelRatio: 2,
    userAgent: 'SENTINEL-UA-DO-NOT-PERSIST',
    dwellMs: 4210,
    createdAt: 1770000000000,
  };

  const noisy = [
    { id: 't1', type: 'ENTER_LETTER', letter: 'C', focusId: 'focus:legit', ...telemetry },
    { id: 't2', type: 'COMMIT_ACTION', actionId: 'act:legit', ...telemetry },
  ] as unknown as KodexJourneyEvent[];

  const state = applyJourneyEvents(seed(), noisy);
  const wire = JSON.stringify(serializeJourneyState(state));

  for (const forbidden of [
    'SENTINEL-UA-DO-NOT-PERSIST',
    'pointer',
    'velocity',
    'targetX',
    'magnitude',
    'devicePixelRatio',
    'userAgent',
    'dwellMs',
    'createdAt',
    '0.731',
    '4210',
    '1770000000000',
  ]) {
    assert.ok(!wire.includes(forbidden), `serialized state leaked "${forbidden}"`);
  }

  // The semantic parts still landed.
  assert.equal(state.currentFocusId, 'focus:legit');
  assert.deepEqual([...state.committedActionIds], ['act:legit']);
});

test('AC6 · session memory projection matches the shared schema', () => {
  // Key set from kodex-minus-infinity:schemas/session-memory.schema.json, which
  // declares additionalProperties:false.
  const ALLOWED = new Set([
    'version', 'sessionId', 'startedAt', 'path', 'decisions', 'sourcesOpened',
    'claimsSeen', 'entitiesTraced', 'relationsTraced', 'contradictionsSeen',
    'userAnnotations', 'systemObservations', 'selectedFunctionalState',
    'contemplativePreferences', 'accessibility', 'artifactSeed',
    'generatedArtifacts', 'unresolved', 'consent',
  ]);
  const REQUIRED = ['version', 'sessionId', 'path', 'decisions', 'accessibility', 'consent'];

  const state = applyJourneyEvents(seed(), [
    ...WALK,
    { id: 'y1', type: 'SET_CONSENT', grant: 'memoryWrite', granted: true },
  ]);
  const memory = toSessionMemory(state) as unknown as Record<string, unknown>;

  for (const key of Object.keys(memory)) {
    assert.ok(ALLOWED.has(key), `session memory emitted disallowed key "${key}"`);
  }
  for (const key of REQUIRED) {
    assert.ok(key in memory, `session memory missing required key "${key}"`);
  }

  assert.ok(Number.isInteger(memory.version) && (memory.version as number) >= 1);
  assert.deepEqual(memory.path, ['A', 'C', 'H', 'C']);
  assert.deepEqual(memory.decisions, ['act:open-plate']);
  assert.deepEqual(memory.relationsTraced, ['rel:plate->press']);
  assert.deepEqual(memory.entitiesTraced, ['ent:press']);
  assert.ok(['FULL', 'REDUCED', 'OFF'].includes((memory.accessibility as { motion: string }).motion));
  assert.ok(['ON', 'OFF'].includes((memory.accessibility as { sound: string }).sound));
});

test('AC6 · session memory never exposes the Heart as a score', () => {
  const state = applyJourneyEvents(seed(), [
    { id: 'k1', type: 'ENTER_LETTER', letter: 'C' },
    { id: 'k2', type: 'ENTER_LETTER', letter: 'M' },
    { id: 'k3', type: 'LEAVE_HEART' },
  ]);
  const memory = toSessionMemory(state) as unknown as Record<string, unknown>;

  assert.ok(!('mVisitCount' in memory));
  assert.ok(!('mPortalStateByLetter' in memory));
  assert.ok(!('returnAnchor' in memory));
  assert.ok(!('completionEligible' in memory));
});

test('AC6 · a tampered signature or seed is recomputed, not trusted', () => {
  const state = applyJourneyEvents(seed(), WALK);
  const snapshot = serializeJourneyState(state);

  const restored = restoreJourneyState({
    ...snapshot,
    routeSignature: 'KDX-FORGED',
    serendipitySeed: 1,
    completionEligible: true,
  });

  assert.equal(restored.routeSignature, state.routeSignature);
  assert.equal(restored.serendipitySeed, state.serendipitySeed);
  assert.equal(restored.completionEligible, state.completionEligible);
});

test('AC6 · restore rejects a journey that did not begin at A', () => {
  const state = applyJourneyEvents(seed(), WALK);
  const snapshot = serializeJourneyState(state);

  assert.throws(
    () => restoreJourneyState({ ...snapshot, path: ['C', 'H'] }),
    /begins at A/,
  );
});

/* ================================================================== *
 * Edge resolution
 * ================================================================== */

test('open edges are recomputed per move, never accumulated', () => {
  const state = applyJourneyEvents(seed(), [
    { id: 'g1', type: 'RESOLVE_EDGES', edgeIds: ['edge:a->c', 'edge:a->k'] },
  ]);
  assert.deepEqual([...state.openEdgeIds], ['edge:a->c', 'edge:a->k']);

  const replaced = applyJourneyEvent(state, {
    id: 'g2',
    type: 'RESOLVE_EDGES',
    edgeIds: ['edge:a->q'],
  });
  assert.deepEqual([...replaced.openEdgeIds], ['edge:a->q']);

  const moved = applyJourneyEvent(replaced, { id: 'g3', type: 'ENTER_LETTER', letter: 'Q' });
  assert.deepEqual([...moved.openEdgeIds], [], 'moving invalidates the resolved edge set');
});

test('an unknown coordinate is rejected', () => {
  assert.throws(
    () => applyJourneyEvent(seed(), { id: 'bad', type: 'ENTER_LETTER', letter: 'Z' } as unknown as KodexJourneyEvent),
    /must be a KODEX letter/,
  );
});
