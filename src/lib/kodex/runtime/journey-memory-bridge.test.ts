import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  KODEX_INTERACTION_EVENT,
  type KodexInteractionEventDetail,
} from "./interaction-events";
import {
  createKodexJourneyMemoryBridge,
  interactionToJourneyEvents,
  KODEX_JOURNEY_STORAGE_KEY,
  KODEX_ORGANISM_ACTION_EVENT,
  organismActionToJourneyEvents,
  restoreJourneyFromStorage,
  type KodexJourneyStorage,
  type KodexOrganismActionEventDetail,
} from "./journey-memory-bridge";
import { createInitialJourneyState, type SerializedJourneyState } from "./journey-state";
import {
  semanticConceptToJourneyAction,
  semanticRelationToJourneyAction,
} from "./semantic-memory-journey-adapter.js";

class MemoryStorage implements KodexJourneyStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

function eventWithDetail<T>(type: string, detail: T): Event {
  const event = new Event(type) as Event & { detail: T };
  Object.defineProperty(event, "detail", { value: detail, enumerable: true });
  return event;
}

const interaction = (over: Partial<KodexInteractionEventDetail> = {}): KodexInteractionEventDetail => ({
  id: "node:remember:1",
  interactionId: "remember",
  nodeId: "NODE-A",
  role: "TRACE",
  semanticTarget: "remember",
  stateBefore: "threshold",
  stateAfter: "remember",
  writesToMemory: true,
  sourceIds: [],
  claimIds: [],
  createdAt: 1,
  ...over,
});

const organism = (over: Partial<KodexOrganismActionEventDetail> = {}): KodexOrganismActionEventDetail => ({
  id: "organism-1",
  createdAt: 2,
  presetId: "KDX-TEST",
  family: "FIELD",
  action: "OPEN",
  memoryWrites: ["opened", "opened", "observed"],
  ...over,
});

describe("Journey memory bridge", () => {
  it("maps meaningful semantic interaction to a commit at the current coordinate", () => {
    const events = interactionToJourneyEvents(interaction(), createInitialJourneyState());
    assert.equal(events.length, 1);
    assert.equal(events[0]?.kind, "commit");
    assert.equal(events[0]?.letter, "A");
    assert.equal(events[0]?.detail, "remember");
  });

  it("does not persist atmospheric/non-memory interaction", () => {
    const events = interactionToJourneyEvents(
      interaction({ writesToMemory: false, stateAfter: "threshold" }),
      createInitialJourneyState(),
    );
    assert.deepEqual(events, []);
  });

  it("discards incoming wall-clock timing and persists semantic order only", () => {
    const events = interactionToJourneyEvents(
      interaction({ createdAt: 987654321 }),
      createInitialJourneyState(),
    );
    assert.equal(events[0]?.at, 0);

    const organismEvents = organismActionToJourneyEvents(
      organism({ createdAt: 123456789 }),
      createInitialJourneyState(),
    );
    assert.deepEqual(organismEvents.map((event) => event.at), [0, 1]);
  });

  it("deduplicates declared organism memory writes within one action", () => {
    const events = organismActionToJourneyEvents(organism(), createInitialJourneyState());
    assert.deepEqual(events.map((event) => event.detail), ["opened", "observed"]);
    assert.equal(new Set(events.map((event) => event.id)).size, 2);
  });

  it("persists semantic interactions in session-scoped storage", () => {
    const target = new EventTarget();
    const storage = new MemoryStorage();
    const bridge = createKodexJourneyMemoryBridge(target, storage);

    target.dispatchEvent(eventWithDetail(KODEX_INTERACTION_EVENT, interaction({ createdAt: 999999 })));

    assert.deepEqual(bridge.getState().committedActions, ["remember"]);
    const persisted = JSON.parse(storage.getItem(KODEX_JOURNEY_STORAGE_KEY) ?? "{}") as SerializedJourneyState;
    assert.deepEqual(persisted.committedActions, ["remember"]);
    assert.equal(persisted.trace[0]?.at, 0);
    assert.equal("createdAt" in (persisted.trace[0] as object), false);
  });

  it("replaying the same semantic event identity does not double-write memory", () => {
    const target = new EventTarget();
    const storage = new MemoryStorage();
    const bridge = createKodexJourneyMemoryBridge(target, storage);
    const detail = interaction();

    target.dispatchEvent(eventWithDetail(KODEX_INTERACTION_EVENT, detail));
    target.dispatchEvent(eventWithDetail(KODEX_INTERACTION_EVENT, detail));

    assert.deepEqual(bridge.getState().committedActions, ["remember"]);
    assert.equal(bridge.getState().trace.length, 1);
  });

  it("organism actions enter the same JourneyState memory instead of a parallel store", () => {
    const target = new EventTarget();
    const storage = new MemoryStorage();
    const bridge = createKodexJourneyMemoryBridge(target, storage);

    target.dispatchEvent(eventWithDetail(KODEX_ORGANISM_ACTION_EVENT, organism()));

    assert.deepEqual(bridge.getState().committedActions, ["opened", "observed"]);
    assert.equal(bridge.getState().trace.every((event) => event.kind === "commit"), true);
  });

  it("restores persisted JourneyState and falls back safely on malformed storage", () => {
    const good = new MemoryStorage();
    const target = new EventTarget();
    const bridge = createKodexJourneyMemoryBridge(target, good);
    target.dispatchEvent(eventWithDetail(KODEX_INTERACTION_EVENT, interaction()));

    const restored = restoreJourneyFromStorage(good);
    assert.deepEqual(restored.committedActions, ["remember"]);

    const bad = new MemoryStorage();
    bad.setItem(KODEX_JOURNEY_STORAGE_KEY, "{broken");
    assert.deepEqual(restoreJourneyFromStorage(bad), createInitialJourneyState());
  });

  it("restored JourneyState plus explicit semantic commits replays deterministically without a migration store", () => {
    const seedTarget = new EventTarget();
    const seedStorage = new MemoryStorage();
    const seedBridge = createKodexJourneyMemoryBridge(seedTarget, seedStorage);
    seedTarget.dispatchEvent(eventWithDetail(KODEX_INTERACTION_EVENT, interaction()));

    const baseline = seedStorage.getItem(KODEX_JOURNEY_STORAGE_KEY);
    assert.ok(baseline, "existing JourneyState snapshot must be available for deterministic restore");
    seedBridge.destroy();

    const concept = semanticConceptToJourneyAction({
      eventId: "migration-concept-1",
      concept: "MEMORY",
      explicitCommit: true,
    });
    const relation = semanticRelationToJourneyAction({
      eventId: "migration-relation-1",
      from: "MEMORY",
      to: "SIGNAL",
      explicitCommit: true,
    });
    assert.ok(concept && relation, "explicit semantic commits must produce existing organism-action records");

    const replay = () => {
      const target = new EventTarget();
      const storage = new MemoryStorage();
      storage.setItem(KODEX_JOURNEY_STORAGE_KEY, baseline);
      const bridge = createKodexJourneyMemoryBridge(target, storage);

      target.dispatchEvent(eventWithDetail(KODEX_ORGANISM_ACTION_EVENT, concept));
      target.dispatchEvent(eventWithDetail(KODEX_ORGANISM_ACTION_EVENT, relation));
      target.dispatchEvent(eventWithDetail(KODEX_ORGANISM_ACTION_EVENT, concept));
      target.dispatchEvent(eventWithDetail(KODEX_ORGANISM_ACTION_EVENT, relation));

      const result = {
        state: bridge.getState(),
        persisted: storage.getItem(KODEX_JOURNEY_STORAGE_KEY),
      };
      bridge.destroy();
      return result;
    };

    const first = replay();
    const second = replay();

    assert.deepEqual(first.state, second.state, "same restored state plus same explicit semantic sequence must replay identically");
    assert.equal(first.persisted, second.persisted, "serialized JourneyState must be byte-stable across deterministic replay");
    assert.deepEqual(first.state.committedActions, [
      "remember",
      "concept:CX-003:MEMORY",
      "relation:CX-003:CX-001",
    ]);
    assert.equal(first.state.trace.length, 3, "replayed semantic identities must not double-write after restore");
  });

  it("reset removes persisted state and returns to deterministic initial state", () => {
    const target = new EventTarget();
    const storage = new MemoryStorage();
    const bridge = createKodexJourneyMemoryBridge(target, storage);
    target.dispatchEvent(eventWithDetail(KODEX_INTERACTION_EVENT, interaction()));

    bridge.reset();

    assert.deepEqual(bridge.getState(), createInitialJourneyState());
    assert.equal(storage.getItem(KODEX_JOURNEY_STORAGE_KEY), null);
  });
});
