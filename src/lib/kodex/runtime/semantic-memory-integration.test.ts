import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createKodexJourneyMemoryBridge,
  KODEX_JOURNEY_STORAGE_KEY,
  KODEX_ORGANISM_ACTION_EVENT,
  type KodexJourneyStorage,
} from "./journey-memory-bridge";
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

function semanticSequence() {
  const concept = semanticConceptToJourneyAction({
    eventId: "integration-concept-1",
    concept: "MEMORY",
    explicitCommit: true,
  });
  const relation = semanticRelationToJourneyAction({
    eventId: "integration-relation-1",
    from: "MEMORY",
    to: "SIGNAL",
    explicitCommit: true,
  });
  assert.ok(concept && relation);
  return { concept, relation };
}

describe("Semantic Memory integration on current JourneyState authority", () => {
  it("refuses passive concept/relation observation", () => {
    assert.equal(semanticConceptToJourneyAction({ eventId: "passive", concept: "MEMORY" }), null);
    assert.equal(semanticRelationToJourneyAction({ eventId: "passive", from: "MEMORY", to: "SIGNAL" }), null);
  });

  it("fails closed for unknown concepts and self-relations", () => {
    assert.equal(semanticConceptToJourneyAction({ eventId: "bad", concept: "UNKNOWN", explicitCommit: true }), null);
    assert.equal(semanticRelationToJourneyAction({ eventId: "bad", from: "MEMORY", to: "MEMORY", explicitCommit: true }), null);
  });

  it("persists explicit semantic commits through the existing JourneyState bridge only", () => {
    const target = new EventTarget();
    const storage = new MemoryStorage();
    const bridge = createKodexJourneyMemoryBridge(target, storage);
    const { concept, relation } = semanticSequence();

    target.dispatchEvent(eventWithDetail(KODEX_ORGANISM_ACTION_EVENT, concept));
    target.dispatchEvent(eventWithDetail(KODEX_ORGANISM_ACTION_EVENT, relation));

    assert.deepEqual(bridge.getState().committedActions, [
      "concept:CX-003:MEMORY",
      "relation:CX-003:CX-001",
    ]);
    assert.ok(storage.getItem(KODEX_JOURNEY_STORAGE_KEY));
    bridge.destroy();
  });

  it("replays the same explicit semantic identities deterministically and idempotently", () => {
    const run = () => {
      const target = new EventTarget();
      const storage = new MemoryStorage();
      const bridge = createKodexJourneyMemoryBridge(target, storage);
      const { concept, relation } = semanticSequence();

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

    const first = run();
    const second = run();
    assert.deepEqual(first.state, second.state);
    assert.equal(first.persisted, second.persisted);
    assert.equal(first.state.trace.length, 2);
  });
});
