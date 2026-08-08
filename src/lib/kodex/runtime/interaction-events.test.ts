/**
 * KODEX−∞ · Interaction event identity — unit tests (MP-1, unblocks KOD-41).
 *
 * Run with the repository's pinned Node (24.14.1), which strips TypeScript
 * types natively and ships the test runner:
 *
 *     node --test src/lib/kodex/runtime/interaction-events.test.ts
 *
 * The four required proofs are tagged (a)..(d) below.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  computeKodexInteractionEventId,
  createKodexInteractionEvent,
  createKodexInteractionEventDetail,
  createKodexInteractionSequence,
  defaultKodexInteractionSequence,
  isMeaningfulKodexInteraction,
  replayKodexInteractionEvent,
  KODEX_INTERACTION_EVENT,
  type KodexInteractionEventDetail,
  type KodexInteractionEventInput,
} from './interaction-events.ts';

import {
  applyJourneyEvent,
  createInitialJourneyState,
  hasAppliedEvent,
  toSessionMemory,
  type KodexJourneyEvent,
} from './journey-state.ts';

/** A frozen wall clock. Every event below is minted in the same millisecond. */
const SAME_MILLISECOND = 1_700_000_000_000;

const reveal = (
  overrides: Partial<KodexInteractionEventInput> = {},
): KodexInteractionEventInput => ({
  interactionId: 'observe',
  nodeId: 'interaction-v0',
  role: 'REVEAL',
  semanticTarget: 'observe',
  stateBefore: 'threshold',
  stateAfter: 'observe',
  writesToMemory: true,
  sourceIds: [],
  claimIds: [],
  ...overrides,
});

/**
 * The bridge KOD-41 uses: an interaction that writes to memory becomes a
 * COMMIT_ACTION whose journey identity IS the interaction identity. The kernel
 * treats it as an opaque string and dedupes on it.
 */
const asJourneyEvent = (detail: KodexInteractionEventDetail): KodexJourneyEvent => ({
  id: detail.id,
  type: 'COMMIT_ACTION',
  actionId: `${detail.nodeId}:${detail.interactionId}`,
  sourceIds: detail.sourceIds,
});

/* ------------------------------------------------------------------ *
 * (a) same millisecond, distinct interactions → distinct ids
 * ------------------------------------------------------------------ */

test('(a) two distinct interactions in the same millisecond get distinct ids', () => {
  const sequence = createKodexInteractionSequence();
  const opts = { sequence, createdAt: SAME_MILLISECOND };

  const first = createKodexInteractionEventDetail(reveal({ interactionId: 'observe' }), opts);
  const second = createKodexInteractionEventDetail(reveal({ interactionId: 'remember' }), opts);

  assert.equal(first.createdAt, second.createdAt, 'precondition: same millisecond');
  assert.notEqual(first.id, second.id);
});

test('(a) the old collision case — same node + interaction, same millisecond — no longer collapses', () => {
  const sequence = createKodexInteractionSequence();
  const opts = { sequence, createdAt: SAME_MILLISECOND };

  // Exactly what the legacy `${nodeId}:${interactionId}:${Date.now()}` scheme
  // folded into a single identity.
  const first = createKodexInteractionEventDetail(reveal(), opts);
  const second = createKodexInteractionEventDetail(reveal(), opts);

  assert.equal(first.createdAt, second.createdAt);
  assert.equal(first.ordinal, 0);
  assert.equal(second.ordinal, 1);
  assert.notEqual(first.id, second.id);
});

test('(a) ten same-millisecond interactions produce ten distinct ids', () => {
  const sequence = createKodexInteractionSequence();
  const ids = new Set<string>();

  for (let i = 0; i < 10; i += 1) {
    ids.add(
      createKodexInteractionEventDetail(reveal(), {
        sequence,
        createdAt: SAME_MILLISECOND,
      }).id,
    );
  }

  assert.equal(ids.size, 10);
});

/* ------------------------------------------------------------------ *
 * (b) replay determinism
 * ------------------------------------------------------------------ */

test('(b) the same logical event replayed yields an identical id', () => {
  const original = createKodexInteractionEventDetail(reveal(), {
    sequence: createKodexInteractionSequence(),
    createdAt: SAME_MILLISECOND,
  });

  // Browser Back/Forward: the recorded detail is rehydrated much later, from a
  // different sequence, on a different clock tick.
  const replayed = replayKodexInteractionEvent(original).detail;

  assert.equal(replayed.id, original.id);
  assert.equal(replayed.ordinal, original.ordinal);
});

test('(b) identity contains no wall-clock input', () => {
  const input = reveal();

  const early = createKodexInteractionEventDetail(input, { ordinal: 3, createdAt: 1 });
  const late = createKodexInteractionEventDetail(input, {
    ordinal: 3,
    createdAt: SAME_MILLISECOND,
  });

  assert.notEqual(early.createdAt, late.createdAt);
  assert.equal(early.id, late.id);
  assert.equal(early.id, computeKodexInteractionEventId(input, 3));
});

test('(b) a whole session replays to the same id trace from a fresh sequence', () => {
  const script: KodexInteractionEventInput[] = [
    reveal({ interactionId: 'observe' }),
    reveal({ interactionId: 'observe' }),
    reveal({ interactionId: 'remember', semanticTarget: 'remember', stateAfter: 'remember' }),
    reveal({ interactionId: 'source', semanticTarget: 'source', sourceIds: ['SRC-A'] }),
  ];

  const run = () => {
    const sequence = createKodexInteractionSequence();
    return script.map(
      (input) =>
        createKodexInteractionEventDetail(input, { sequence, createdAt: SAME_MILLISECOND }).id,
    );
  };

  const firstRun = run();
  const secondRun = run();

  assert.deepEqual(secondRun, firstRun);
  assert.equal(new Set(firstRun).size, firstRun.length, 'all four ids are distinct');
});

test('(b) id sets are order-insensitive, so a reordered replay is still the same event', () => {
  const a = computeKodexInteractionEventId(reveal({ sourceIds: ['SRC-B', 'SRC-A'] }), 0);
  const b = computeKodexInteractionEventId(reveal({ sourceIds: ['SRC-A', 'SRC-B'] }), 0);
  const c = computeKodexInteractionEventId(reveal({ sourceIds: ['SRC-A', 'SRC-A', 'SRC-B'] }), 0);

  assert.equal(a, b);
  assert.equal(a, c);
});

test('(b) a tampered replay payload is rejected rather than silently re-identified', () => {
  const original = createKodexInteractionEventDetail(reveal(), { ordinal: 0 });
  const tampered: KodexInteractionEventDetail = { ...original, stateAfter: 'source' };

  assert.throws(() => replayKodexInteractionEvent(tampered), /does not match its recorded identity/);
});

/* ------------------------------------------------------------------ *
 * (c) end-to-end replay safety through the JourneyState reducer
 * ------------------------------------------------------------------ */

test('(c) the same logical event fed twice through the reducer writes memory once', () => {
  const sequence = createKodexInteractionSequence();

  const clicked = createKodexInteractionEventDetail(
    reveal({ interactionId: 'source', semanticTarget: 'source', sourceIds: ['SRC-KODEX-V0'] }),
    { sequence, createdAt: SAME_MILLISECOND },
  );

  assert.ok(isMeaningfulKodexInteraction(clicked), 'precondition: this event writes to memory');

  const initial = createInitialJourneyState({ sessionId: 'kdx-mp1' });
  const afterFirst = applyJourneyEvent(initial, asJourneyEvent(clicked));

  // Browser Back, then Forward: the recorded event is dispatched again.
  const replayed = replayKodexInteractionEvent(clicked).detail;
  const afterReplay = applyJourneyEvent(afterFirst, asJourneyEvent(replayed));

  assert.equal(afterReplay, afterFirst, 'replay returns the identical state object');
  assert.equal(afterReplay.committedActionIds.length, 1);
  assert.equal(afterReplay.appliedEventIds.length, 1);
  assert.deepEqual(toSessionMemory(afterReplay).decisions, ['interaction-v0:source']);
  assert.deepEqual(toSessionMemory(afterReplay).sourcesOpened, ['SRC-KODEX-V0']);
  assert.ok(hasAppliedEvent(afterReplay, clicked.id));
});

test('(c) repeated Back/Forward cycles never accumulate memory', () => {
  const clicked = createKodexInteractionEventDetail(reveal({ interactionId: 'remember' }), {
    sequence: createKodexInteractionSequence(),
  });

  let state = createInitialJourneyState({ sessionId: 'kdx-mp1' });
  for (let i = 0; i < 5; i += 1) {
    state = applyJourneyEvent(state, asJourneyEvent(replayKodexInteractionEvent(clicked).detail));
  }

  assert.equal(state.committedActionIds.length, 1);
  assert.equal(state.appliedEventIds.length, 1);
});

test('(c) the legacy time-based scheme would have failed this same test', () => {
  const legacyId = (nodeId: string, interactionId: string, now: number) =>
    `${nodeId}:${interactionId}:${now}`;

  // Replay one millisecond later: a new identity, therefore a second write.
  const first = legacyId('interaction-v0', 'source', SAME_MILLISECOND);
  const replay = legacyId('interaction-v0', 'source', SAME_MILLISECOND + 1);
  assert.notEqual(first, replay, 'legacy replay minted a new id — the defect');

  let state = createInitialJourneyState({ sessionId: 'kdx-legacy' });
  state = applyJourneyEvent(state, { id: first, type: 'COMMIT_ACTION', actionId: 'a' });
  state = applyJourneyEvent(state, { id: replay, type: 'COMMIT_ACTION', actionId: 'a' });
  assert.equal(state.committedActionIds.length, 2, 'legacy duplicated the memory write');
});

/* ------------------------------------------------------------------ *
 * (d) anti-fake control: distinct occurrences stay distinguishable
 * ------------------------------------------------------------------ */

test('(d) two genuinely separate occurrences of an identical payload stay distinct', () => {
  const sequence = createKodexInteractionSequence();
  const opts = { sequence, createdAt: SAME_MILLISECOND };

  // Byte-for-byte identical payloads, two real clicks.
  const firstClick = createKodexInteractionEventDetail(reveal(), opts);
  const secondClick = createKodexInteractionEventDetail(reveal(), opts);

  assert.notEqual(firstClick.id, secondClick.id);

  let state = createInitialJourneyState({ sessionId: 'kdx-mp1' });
  state = applyJourneyEvent(state, asJourneyEvent(firstClick));
  state = applyJourneyEvent(state, asJourneyEvent(secondClick));

  assert.equal(
    state.appliedEventIds.length,
    2,
    'dedup must not swallow a second genuine occurrence',
  );
  assert.equal(state.committedActionIds.length, 2);
});

test('(d) the ordinal is the only difference — the scheme is not collapsing everything', () => {
  const input = reveal();
  assert.notEqual(
    computeKodexInteractionEventId(input, 0),
    computeKodexInteractionEventId(input, 1),
  );
  assert.equal(
    computeKodexInteractionEventId(input, 7),
    computeKodexInteractionEventId(input, 7),
  );
});

test('(d) every semantic field participates in the identity', () => {
  const base = reveal();
  const baseId = computeKodexInteractionEventId(base, 0);

  const variants: KodexInteractionEventInput[] = [
    reveal({ nodeId: 'interaction-v1' }),
    reveal({ interactionId: 'remember' }),
    reveal({ role: 'TRACE' }),
    reveal({ semanticTarget: 'source' }),
    reveal({ stateBefore: 'observe' }),
    reveal({ stateAfter: 'remember' }),
    reveal({ writesToMemory: false }),
    reveal({ sourceIds: ['SRC-A'] }),
    reveal({ claimIds: ['CLM-A'] }),
  ];

  const ids = variants.map((v) => computeKodexInteractionEventId(v, 0));
  for (const id of ids) assert.notEqual(id, baseId);
  assert.equal(new Set([baseId, ...ids]).size, ids.length + 1, 'no two variants collide');
});

test('(d) field boundaries cannot be forged by crafted strings', () => {
  const a = computeKodexInteractionEventId(
    reveal({ nodeId: 'node', interactionId: 'a:b' }),
    0,
  );
  const b = computeKodexInteractionEventId(
    reveal({ nodeId: 'node:a', interactionId: 'b' }),
    0,
  );

  assert.notEqual(a, b);
});

/* ------------------------------------------------------------------ *
 * Shape, opacity and backward compatibility
 * ------------------------------------------------------------------ */

test('ids are opaque strings and carry no timestamp', () => {
  const detail = createKodexInteractionEventDetail(reveal(), {
    ordinal: 0,
    createdAt: SAME_MILLISECOND,
  });

  assert.match(detail.id, /^kdxe1_[0-9a-f]{16}$/);
  assert.equal(detail.id.includes(String(SAME_MILLISECOND)), false);
  // No plaintext of the semantic payload leaks into the identity either.
  assert.equal(detail.id.includes(detail.nodeId), false);
  assert.equal(detail.id.includes(detail.interactionId), false);
});

test('the existing single-argument call site still works and dispatches a CustomEvent', () => {
  // Exactly the shape used by src/pages/kodex/lab/interaction-v0/index.astro.
  const event = createKodexInteractionEvent({
    interactionId: 'observe',
    nodeId: 'interaction-v0',
    role: 'REVEAL',
    semanticTarget: 'observe',
    stateBefore: 'threshold',
    stateAfter: 'observe',
    writesToMemory: true,
    sourceIds: ['SRC-KODEX-INTERACTION-V0'],
    claimIds: [],
  });

  assert.equal(event.type, KODEX_INTERACTION_EVENT);
  assert.equal(event.bubbles, true);
  assert.equal(event.composed, true);
  assert.equal(typeof event.detail.id, 'string');
  assert.equal(typeof event.detail.ordinal, 'number');
  assert.equal(event.detail.interactionId, 'observe');
});

test('the ambient sequence advances per node + interaction key', () => {
  const before = defaultKodexInteractionSequence.peek('ambient-node', 'ambient-interaction');

  const a = createKodexInteractionEventDetail(
    reveal({ nodeId: 'ambient-node', interactionId: 'ambient-interaction' }),
  );
  const b = createKodexInteractionEventDetail(
    reveal({ nodeId: 'ambient-node', interactionId: 'ambient-interaction' }),
  );

  assert.equal(a.ordinal, before);
  assert.equal(b.ordinal, before + 1);
  assert.notEqual(a.id, b.id);
});

test('sequence keys do not bleed between nodes or interactions', () => {
  const sequence = createKodexInteractionSequence();

  assert.equal(sequence.next('node', 'ab'), 0);
  assert.equal(sequence.next('nodea', 'b'), 0, 'concatenated keys must not collide');
  assert.equal(sequence.next('node', 'ab'), 1);

  sequence.reset();
  assert.equal(sequence.next('node', 'ab'), 0);
});

test('malformed identities are rejected', () => {
  assert.throws(() => computeKodexInteractionEventId(reveal({ nodeId: '' }), 0), TypeError);
  assert.throws(() => computeKodexInteractionEventId(reveal({ interactionId: '' }), 0), TypeError);
  assert.throws(() => computeKodexInteractionEventId(reveal(), -1), RangeError);
  assert.throws(() => computeKodexInteractionEventId(reveal(), 1.5), RangeError);
});

test('isMeaningfulKodexInteraction is unchanged by the new identity', () => {
  const writes = createKodexInteractionEventDetail(reveal(), { ordinal: 0 });
  const noop = createKodexInteractionEventDetail(
    reveal({ stateAfter: 'threshold', writesToMemory: false }),
    { ordinal: 0 },
  );

  assert.equal(isMeaningfulKodexInteraction(writes), true);
  assert.equal(isMeaningfulKodexInteraction(noop), false);
});
