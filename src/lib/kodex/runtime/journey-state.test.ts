import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CANONICAL_LETTERS,
  createInitialJourneyState,
  journeyReducer,
  replayJourney,
  restoreJourney,
  serializeJourney,
  type JourneyEvent,
} from "./journey-state.ts";

const ev = (
  over: Partial<JourneyEvent> & Pick<JourneyEvent, "id" | "kind" | "letter">,
): JourneyEvent => ({ at: 0, ...over });

describe("JourneyState kernel (KOD-28)", () => {
  it("initial state is deterministic and begins at A", () => {
    const a = createInitialJourneyState();
    const b = createInitialJourneyState();
    assert.equal(a.current, "A");
    assert.deepEqual(a, b);
  });

  it("same ordered event sequence produces same state", () => {
    const seq: JourneyEvent[] = [
      ev({ id: "e1", kind: "arrive", letter: "C", world: "MEMORY" }),
      ev({ id: "e2", kind: "commit", letter: "C", detail: "RELATION_CHOSEN" }),
      ev({ id: "e3", kind: "arrive", letter: "H", world: "COSMOLOGY" }),
    ];
    assert.deepEqual(replayJourney(seq), replayJourney(seq));
  });

  it("duplicate replay event cannot double-write memory", () => {
    const e = ev({ id: "dup1", kind: "arrive", letter: "C" });
    const once = journeyReducer(createInitialJourneyState(), e);
    const twice = journeyReducer(once, e);
    assert.equal(twice.trace.length, 1);
    assert.equal(twice.visitCounts["C"], 1);
  });

  it("revisits increment count without destroying prior trace", () => {
    const first = ev({ id: "v1", kind: "arrive", letter: "C" });
    const second = ev({ id: "v2", kind: "arrive", letter: "C" });
    const state = replayJourney([first, second]);
    assert.equal(state.visitCounts["C"], 2);
    assert.deepEqual(state.letterTrace, ["C", "C"]);
  });

  it("heart state can exist without forcing a heart visit", () => {
    const resonant = ev({ id: "m1", kind: "heart", letter: "M", payload: { portalState: "RESONANT" } });
    const state = journeyReducer(createInitialJourneyState(), resonant);
    assert.equal(state.heart.portalState, "RESONANT");
    assert.equal(state.heart.visitCount, 0);
  });

  it("heart availability and real M visit are separate dimensions", () => {
    const available = ev({ id: "m1", kind: "heart", letter: "M", payload: { portalState: "AVAILABLE" } });
    const arriveM = ev({ id: "m2", kind: "arrive", letter: "M" });
    const state = journeyReducer(journeyReducer(createInitialJourneyState(), available), arriveM);
    assert.equal(state.heart.portalState, "AVAILABLE");
    assert.equal(state.heart.visitCount, 1);
    assert.equal(state.visitCounts["M"], 1);
  });

  it("return anchor round-trips exactly through serialize/restore", () => {
    const base = createInitialJourneyState();
    const anchor = ev({ id: "a1", kind: "anchor", letter: "Q", world: "ARTIFACT", payload: { focus: "ORIGIN_PLATE", localState: "IDLE" } });
    const state = journeyReducer(journeyReducer(base, ev({ id: "z", kind: "arrive", letter: "Q" })), anchor);
    const restored = restoreJourney(serializeJourney(state));
    assert.deepEqual(restored.returnAnchor, state.returnAnchor);
  });

  it("serialization applies a semantic allowlist, not a pointer blacklist", () => {
    const withPointer = ev({ id: "p1", kind: "commit", letter: "A", payload: { x: 0.5, y: 0.25, targetX: 0.6, targetY: 0.2, velocity: 0.9, action: "INITIATE" } });
    const serialized = serializeJourney(journeyReducer(createInitialJourneyState(), withPointer));
    assert.deepEqual(serialized.trace[0].payload ?? {}, {});
  });

  it("restore cannot reintroduce disallowed telemetry payloads", () => {
    const withPointer = ev({ id: "p1", kind: "commit", letter: "A", payload: { x: 0.5, action: "INITIATE" } });
    const state = journeyReducer(createInitialJourneyState(), withPointer);
    const serialized = serializeJourney(state);
    (serialized.trace[0] as { payload: Record<string, unknown> }).payload = { x: 99, y: 88, velocity: 1 };
    const restored = restoreJourney(serialized);
    assert.deepEqual(restored.trace[0].payload, undefined);
  });

  it("trace keeps only the semantic to field in payload", () => {
    const trace = ev({ id: "t1", kind: "trace", letter: "C", detail: "PRIMARY_CONCEPT", payload: { to: "H", x: 0.5, rawSensor: "unused" } });
    const serialized = serializeJourney(journeyReducer(createInitialJourneyState(), trace));
    assert.deepEqual(serialized.trace[0].payload, { to: "H" });
  });

  it("ignored signal is recorded as a delayed-consequence placeholder", () => {
    const state = journeyReducer(createInitialJourneyState(), ev({ id: "i1", kind: "ignore", letter: "H", detail: "FREQUENCY_BAND" }));
    assert.deepEqual(state.ignoredSignals, ["FREQUENCY_BAND"]);
  });

  it("commit records the action", () => {
    const state = journeyReducer(createInitialJourneyState(), ev({ id: "c1", kind: "commit", letter: "F", detail: "TRACE_RELATION" }));
    assert.deepEqual(state.committedActions, ["TRACE_RELATION"]);
  });

  it("trace relation records from/to", () => {
    const state = journeyReducer(createInitialJourneyState(), ev({ id: "t1", kind: "trace", letter: "C", detail: "PRIMARY_CONCEPT", payload: { to: "H" } }));
    assert.deepEqual(state.tracedRelations, [{ from: "C", to: "H", relation: "PRIMARY_CONCEPT" }]);
  });

  it("serendipity seed is bounded and deterministic", () => {
    const seq: JourneyEvent[] = [ev({ id: "s1", kind: "arrive", letter: "C" }), ev({ id: "s2", kind: "arrive", letter: "H" })];
    const state = replayJourney(seq);
    assert.ok(state.serendipitySeed >= 0 && state.serendipitySeed <= 1);
    assert.equal(state.serendipitySeed, replayJourney(seq).serendipitySeed);
  });

  it("B–L and N–X remain latent: kernel never assigns meaning", () => {
    const state = createInitialJourneyState();
    for (const letter of ["B", "L", "N", "X"]) {
      assert.ok(!CANONICAL_LETTERS.includes(letter as typeof CANONICAL_LETTERS[number]));
    }
    assert.deepEqual(state.visitCounts, {});
  });
});
