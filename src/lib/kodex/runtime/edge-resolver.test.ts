import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveEdge, resolveNodeForLetter, simulateJourney } from "./edge-resolver.ts";
import { canonicalGraphProjection, projectCanonicalGraph } from "./journeyGraph/canonical-graph.ts";
import type { GraphProjection } from "./journeyGraph/canonical-graph.ts";
import { createInitialJourneyState, replayJourney } from "./journey-state.ts";
import type { JourneyEvent } from "./journey-state.ts";

function node(id: string, coord: "A" | "M" | "Y" | null = null) {
  return {
    id,
    coordinateAssignment: coord,
    epistemicStatus: "VERIFIED",
    sourceIds: [id],
    roles: [],
    rightsStatus: "CLEAR",
    culturalStatus: "STANDARD",
  };
}

function testProjection(): GraphProjection {
  return projectCanonicalGraph({
    source: "test",
    canonical: true,
    nodes: [
      node("NODE-A", "A"),
      node("NODE-M", "M"),
      node("NODE-Y", "Y"),
      node("NODE-B"),
      node("NODE-C"),
    ],
    edges: [
      { id: "E-AB", from: "NODE-A", to: "NODE-B", type: "RELATED", certainty: "CONFIRMED", claimIds: [], sourceIds: [] },
      { id: "E-BC", from: "NODE-B", to: "NODE-C", type: "RELATED", certainty: "CONFIRMED", claimIds: [], sourceIds: [] },
      { id: "E-AC", from: "NODE-A", to: "NODE-C", type: "RELATED", certainty: "CONFIRMED", claimIds: [], sourceIds: [] },
    ],
  });
}

const ev = (
  over: Partial<JourneyEvent> & Pick<JourneyEvent, "id" | "kind" | "letter">,
): JourneyEvent => ({ at: 0, ...over });

describe("EdgeResolver (KOD-30)", () => {
  it("resolves from A to a connected neighbor deterministically", () => {
    const projection = testProjection();
    const state = {
      ...replayJourney([ev({ id: "start", kind: "arrive", letter: "A", world: "ARTIFACT" })]),
      heart: { portalState: "AVAILABLE" as const, visitCount: 1 },
    };
    const result = resolveEdge({ state, projection, currentNode: "NODE-A", accessibility: "off" });
    assert.equal(result.from, "NODE-A");
    assert.equal(result.reason, "CONNECTED");
    assert.ok(result.candidates.includes(result.to));
  });

  it("maps letter A to the common-origin node", () => {
    const projection = testProjection();
    assert.deepEqual(resolveNodeForLetter(projection, "A"), ["NODE-A"]);
    assert.deepEqual(resolveNodeForLetter(projection, "Y"), ["NODE-Y"]);
    assert.deepEqual(resolveNodeForLetter(projection, "B"), []);
  });

  it("never returns Y on the first step", () => {
    const projection = testProjection();
    const state = createInitialJourneyState();
    const result = resolveEdge({ state, projection, currentNode: "NODE-A" });
    assert.notEqual(result.reason, "RETURN");
  });

  it("returns Y only after a real multi-letter trace", () => {
    const projection = testProjection();
    const state = replayJourney([
      ev({ id: "a1", kind: "arrive", letter: "A" }),
      ev({ id: "b1", kind: "arrive", letter: "B" }),
    ]);
    const result = resolveEdge({ state, projection, currentNode: "NODE-B" });
    assert.equal(result.reason, "RETURN");
    assert.equal(result.to, "NODE-Y");
    assert.equal(result.toLetter, "Y");
  });

  it("offers heart M as an optional, non-scoring detour", () => {
    const projection = testProjection();
    const state = replayJourney([
      ev({ id: "a1", kind: "arrive", letter: "A" }),
      ev({ id: "b1", kind: "arrive", letter: "B" }),
    ]);
    const result = resolveEdge({ state, projection, currentNode: "NODE-B", accessibility: "off" });
    if (result.reason === "RETURN") {
      const next = simulateJourney({ state, projection, currentNode: "NODE-B", accessibility: "off" }, 2);
      assert.equal(next[next.length - 1].to, "NODE-Y");
    } else {
      assert.equal(result.reason, "HEART");
      assert.equal(result.to, "NODE-M");
      assert.equal(result.toLetter, "M");
    }
  });

  it("heart never appears when portal is AVAILABLE (resolved)", () => {
    const projection = testProjection();
    const state = {
      ...replayJourney([ev({ id: "a1", kind: "arrive", letter: "A" })]),
      heart: { portalState: "AVAILABLE" as const, visitCount: 1 },
    };
    const candidates = resolveEdge({ state, projection, currentNode: "NODE-A", accessibility: "off" }).candidates;
    assert.ok(!candidates.includes("NODE-M"));
  });

  it("serendipity is bounded: only reorders candidates, never invents new ones", () => {
    const projection = testProjection();
    const base = replayJourney([
      ev({ id: "a1", kind: "arrive", letter: "A" }),
      ev({ id: "b1", kind: "arrive", letter: "B" }),
    ]);
    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const seeded = { ...base, serendipitySeed: i / 20 };
      const result = resolveEdge({ state: { ...seeded, current: "B" }, projection, currentNode: "NODE-B" });
      results.add(result.to);
      assert.ok(
        ["NODE-A", "NODE-C", "NODE-M", "NODE-Y"].includes(result.to),
        `serendipity chose ${result.to}`,
      );
    }
    assert.ok(results.size >= 1);
  });

  it("simulateJourney converges to Y when a real trace exists", () => {
    const projection = testProjection();
    const state = replayJourney([
      ev({ id: "a1", kind: "arrive", letter: "A" }),
      ev({ id: "b1", kind: "arrive", letter: "B" }),
      ev({ id: "c1", kind: "arrive", letter: "C" }),
    ]);
    const steps = simulateJourney({ state, projection, currentNode: "NODE-C", accessibility: "off" }, 20);
    assert.ok(steps.length > 0);
    assert.equal(steps[steps.length - 1].reason, "RETURN");
    assert.equal(steps[steps.length - 1].to, "NODE-Y");
  });

  it("falls back to A on an orphan graph", () => {
    const orphan = projectCanonicalGraph({
      source: "test",
      canonical: true,
      nodes: [node("NODE-ALONE", "A")],
      edges: [],
    });
    const state = replayJourney([ev({ id: "a1", kind: "arrive", letter: "A" })]);
    const result = resolveEdge({ state, projection: orphan, currentNode: "NODE-ALONE" });
    assert.equal(result.reason, "FALLBACK");
    assert.equal(result.to, "NODE-ALONE");
  });

  it("accessibility off disables serendipity ordering", () => {
    const projection = testProjection();
    const base = {
      ...replayJourney([ev({ id: "a1", kind: "arrive", letter: "A" })]),
      serendipitySeed: 0.999,
      heart: { portalState: "AVAILABLE" as const, visitCount: 1 },
    };
    const full = resolveEdge({ state: { ...base, current: "A" }, projection, currentNode: "NODE-A" });
    const off = resolveEdge({ state: { ...base, current: "A" }, projection, currentNode: "NODE-A", accessibility: "off" });
    assert.equal(off.reason, "CONNECTED");
    assert.equal(off.to, "NODE-B");
    assert.ok(full.candidates.includes(full.to));
  });

  it("projection against the frozen canonical graph never crashes the resolver", () => {
    const state = replayJourney([
      ev({ id: "a1", kind: "arrive", letter: "A", world: "ARTIFACT" }),
      ev({ id: "b1", kind: "arrive", letter: "B" }),
    ]);
    const result = resolveEdge({ state, projection: canonicalGraphProjection, currentNode: "NODE-KDX-CORPUS-001" });
    assert.ok(result.to.length > 0);
    assert.equal(canonicalGraphProjection.anomalies.length, 0);
  });
});
