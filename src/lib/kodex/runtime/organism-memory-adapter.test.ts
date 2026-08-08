/**
 * KODEX−∞ · ORGANISM MEMORY ADAPTER · TESTS
 *
 * Work packet: MP-12.
 *
 * Payloads below use the real `preset.memory.writes` vocabulary declared in
 * `src/kodex/organism-engine/presets.ts`: `FIELD_ACTIVATED`, `VORTEX_OBSERVED`,
 * `SEED_PLANTED` + `GROWTH_STAGE_ADVANCED`, and the empty (atmospheric) case.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  KODEX_ORGANISM_ACTION_EVENT,
  computeOrganismWriteEventId,
  createKodexOrganismMemoryListener,
  foldOrganismAction,
  organismActionToJourneyEvents,
  type KodexOrganismActionDetail,
} from './organism-memory-adapter.ts';
import {
  createInitialJourneyState,
  serializeJourneyState,
} from './journey-state.ts';

const fieldAction: KodexOrganismActionDetail = {
  id: 'kodex-field:ACTIVATE:1750000000000:1',
  presetId: 'kodex-field',
  action: 'ACTIVATE',
  family: 'FIELD',
  createdAt: 1750000000000,
  memoryWrites: ['FIELD_ACTIVATED'],
};

const seedAction: KodexOrganismActionDetail = {
  id: 'kodex-seed:ACTIVATE:1750000000500:2',
  presetId: 'kodex-seed',
  action: 'ACTIVATE',
  family: 'GROWTH',
  createdAt: 1750000000500,
  memoryWrites: ['SEED_PLANTED', 'GROWTH_STAGE_ADVANCED'],
};

/** A preset that declares no writes: atmosphere only. */
const atmosphericAction: KodexOrganismActionDetail = {
  id: 'threshold-portal:ACTIVATE:1750000001000:3',
  presetId: 'threshold-portal',
  action: 'ACTIVATE',
  family: 'PORTAL',
  createdAt: 1750000001000,
  memoryWrites: [],
};

/* ------------------------------------------------------------------ *
 * (a) a memoryWrites payload produces the expected journey events
 * ------------------------------------------------------------------ */

describe('(a) memoryWrites become journey events', () => {
  it('turns one declared write into one COMMIT_ACTION', () => {
    const events = organismActionToJourneyEvents(fieldAction);

    assert.equal(events.length, 1);
    assert.deepEqual(
      { type: events[0].type, actionId: (events[0] as { actionId: string }).actionId },
      { type: 'COMMIT_ACTION', actionId: 'kodex-field:FIELD_ACTIVATED' },
    );
  });

  it('turns each declared write into its own event, in declared order', () => {
    const events = organismActionToJourneyEvents(seedAction);

    assert.deepEqual(
      events.map((event) => (event as { actionId: string }).actionId),
      ['kodex-seed:SEED_PLANTED', 'kodex-seed:GROWTH_STAGE_ADVANCED'],
    );
  });

  it('folds those writes into committedActionIds', () => {
    const state = foldOrganismAction(createInitialJourneyState(), seedAction);

    assert.deepEqual(state.committedActionIds, [
      'kodex-seed:SEED_PLANTED',
      'kodex-seed:GROWTH_STAGE_ADVANCED',
    ]);
  });

  it('emits only COMMIT_ACTION — it never moves the visitor or touches M', () => {
    const events = [
      ...organismActionToJourneyEvents(fieldAction),
      ...organismActionToJourneyEvents(seedAction),
    ];

    assert.deepEqual([...new Set(events.map((event) => event.type))], ['COMMIT_ACTION']);
  });

  it('leaves the coordinate, M and the traced graph untouched', () => {
    const before = createInitialJourneyState();
    const after = foldOrganismAction(before, seedAction);

    assert.equal(after.currentLetter, before.currentLetter);
    assert.deepEqual(after.path, before.path);
    assert.equal(after.mVisitCount, 0);
    assert.deepEqual(after.mPortalStateByLetter, {});
    assert.deepEqual(after.tracedRelationIds, []);
    assert.deepEqual(after.spectralState, []);
    assert.deepEqual(after.unresolvedIds, []);
  });

  it('deduplicates a token a preset declares twice', () => {
    const events = organismActionToJourneyEvents({
      ...fieldAction,
      memoryWrites: ['FIELD_ACTIVATED', 'FIELD_ACTIVATED', '  ', 'FIELD_ACTIVATED'],
    });

    assert.equal(events.length, 1);
  });
});

/* ------------------------------------------------------------------ *
 * (b) the same action folded twice writes once
 * ------------------------------------------------------------------ */

describe('(b) replay is idempotent', () => {
  it('folding the same action twice writes once', () => {
    const once = foldOrganismAction(createInitialJourneyState(), fieldAction);
    const twice = foldOrganismAction(once, fieldAction);

    assert.deepEqual(twice.committedActionIds, ['kodex-field:FIELD_ACTIVATED']);
    assert.equal(twice.appliedEventIds.length, 1);
    // Unchanged by identity: the kernel could not have written anything.
    assert.equal(twice, once);
  });

  it('is idempotent for a multi-write action too', () => {
    const once = foldOrganismAction(createInitialJourneyState(), seedAction);
    const thrice = foldOrganismAction(foldOrganismAction(once, seedAction), seedAction);

    assert.equal(thrice.committedActionIds.length, 2);
    assert.equal(thrice, once);
  });

  it('mints the same id for a replayed payload, without consulting the clock', () => {
    const first = organismActionToJourneyEvents(fieldAction)[0].id;
    // A replay reconstructed later, with a different observational timestamp.
    const replayed = organismActionToJourneyEvents({
      ...fieldAction,
      createdAt: 1999999999999,
      family: undefined,
    })[0].id;

    assert.equal(replayed, first);
  });

  it('does not mint ids from Date.now(): the id is a pure digest', () => {
    const id = computeOrganismWriteEventId(
      fieldAction.id,
      'kodex-field',
      'ACTIVATE',
      'FIELD_ACTIVATED',
    );

    assert.match(id, /^kdxo1_[0-9a-f]{16}$/);
    assert.equal(id, organismActionToJourneyEvents(fieldAction)[0].id);
    // The wall-clock digits carried by the occurrence token do not survive.
    assert.ok(!id.includes('1750000000000'));
  });

  it('keeps two genuinely distinct occurrences distinct', () => {
    const second: KodexOrganismActionDetail = {
      ...fieldAction,
      id: 'kodex-field:ACTIVATE:1750000009999:7',
    };
    const state = foldOrganismAction(
      foldOrganismAction(createInitialJourneyState(), fieldAction),
      second,
    );

    assert.equal(state.appliedEventIds.length, 2);
  });
});

/* ------------------------------------------------------------------ *
 * (c) an atmospheric action writes nothing
 * ------------------------------------------------------------------ */

describe('(c) atmosphere is not memory', () => {
  it('a preset declaring no writes produces no events', () => {
    assert.deepEqual(organismActionToJourneyEvents(atmosphericAction), []);
  });

  it('folding an atmospheric action leaves the state identical', () => {
    const before = createInitialJourneyState();
    const after = foldOrganismAction(before, atmosphericAction);

    assert.equal(after, before);
    assert.deepEqual(after.appliedEventIds, []);
    assert.deepEqual(after.committedActionIds, []);
  });

  it('ignores a malformed or absent payload rather than writing', () => {
    const before = createInitialJourneyState();

    assert.equal(foldOrganismAction(before, null), before);
    assert.equal(foldOrganismAction(before, undefined), before);
    assert.deepEqual(
      organismActionToJourneyEvents({ ...atmosphericAction, memoryWrites: undefined as never }),
      [],
    );
  });

  it('does not notify a listener for an atmospheric action', () => {
    const target = new EventTarget();
    let changes = 0;
    const listener = createKodexOrganismMemoryListener(target, {
      onChange: () => {
        changes += 1;
      },
    });

    target.dispatchEvent(
      new CustomEvent(KODEX_ORGANISM_ACTION_EVENT, { detail: atmosphericAction }),
    );
    assert.equal(changes, 0);

    target.dispatchEvent(new CustomEvent(KODEX_ORGANISM_ACTION_EVENT, { detail: fieldAction }));
    assert.equal(changes, 1);

    // A replay of an action already folded in is silent as well.
    target.dispatchEvent(new CustomEvent(KODEX_ORGANISM_ACTION_EVENT, { detail: fieldAction }));
    assert.equal(changes, 1);

    assert.deepEqual(listener.getState().committedActionIds, ['kodex-field:FIELD_ACTIVATED']);

    listener.destroy();
    target.dispatchEvent(new CustomEvent(KODEX_ORGANISM_ACTION_EVENT, { detail: seedAction }));
    assert.deepEqual(listener.getState().committedActionIds, ['kodex-field:FIELD_ACTIVATED']);
  });
});

/* ------------------------------------------------------------------ *
 * (d) nothing pointer-derived reaches serialized state
 * ------------------------------------------------------------------ */

describe('(d) no pointer telemetry, no profiling', () => {
  it('drops pointer, timing, device and audio fields riding on the payload', () => {
    const polluted = {
      ...fieldAction,
      pointerX: 0.7331,
      pointerY: 0.4242,
      pointerType: 'mouse',
      velocity: 12.5,
      dwellMs: 8888,
      audioMid: 0.61,
      attentionScore: 0.95,
      userAgent: 'probe/1.0',
    } as KodexOrganismActionDetail;

    const snapshot = serializeJourneyState(
      foldOrganismAction(createInitialJourneyState(), polluted),
    );
    const serialized = JSON.stringify(snapshot);

    for (const leak of [
      '0.7331',
      '0.4242',
      'mouse',
      '12.5',
      '8888',
      '0.61',
      '0.95',
      'probe/1.0',
      'attentionScore',
      'pointer',
    ]) {
      assert.ok(!serialized.includes(leak), `serialized state leaked ${leak}`);
    }

    assert.deepEqual(snapshot.committedActionIds, ['kodex-field:FIELD_ACTIVATED']);
  });

  it('never lets the observational timestamp into serialized state', () => {
    const snapshot = serializeJourneyState(
      foldOrganismAction(createInitialJourneyState(), seedAction),
    );

    assert.ok(!JSON.stringify(snapshot).includes('1750000000500'));
  });

  it('records no score, rank or count per visitor beyond the declared facts', () => {
    let state = createInitialJourneyState();
    for (const detail of [fieldAction, seedAction]) state = foldOrganismAction(state, detail);

    const snapshot = serializeJourneyState(state);

    // Committed actions are declared facts, not tallies: repeating one adds nothing.
    assert.deepEqual(snapshot.committedActionIds, [
      'kodex-field:FIELD_ACTIVATED',
      'kodex-seed:SEED_PLANTED',
      'kodex-seed:GROWTH_STAGE_ADVANCED',
    ]);
    assert.equal(snapshot.mVisitCount, 0);
    assert.equal(snapshot.completionEligible, false);
    assert.deepEqual(snapshot.consent, {});
  });
});
