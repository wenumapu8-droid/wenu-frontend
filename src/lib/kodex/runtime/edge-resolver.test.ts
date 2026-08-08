import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  MIN_RETURN_DISTINCT_COORDINATES,
  resolveEdge,
  resolveNodeForLetter,
} from "./edge-resolver.ts";
import {
  HEART_ENDPOINT_ID,
  RETURN_ENDPOINT_ID,
  canonicalGraphProjection,
  projectCanonicalGraph,
  type GraphProjection,
} from "./journeyGraph/canonical-graph.ts";
import { createInitialJourneyState, replayJourney } from "./journey-state.ts";
import type { JourneyEvent } from "./journey-state.ts";

function node(id: string, coord: "A" | null = null) {
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

function runtimeEdge(id: string, from: string, to: string) {
  return {
    id,
    from,
    to,
    type: "RELATED",
    certainty: "CONFIRMED",
    claimIds: [],
    sourceIds: [],
    runtimeNavigable: true,
  };
}

function testProjection(): GraphProjection {
  return projectCanonicalGraph({
    source: "test",
    canonical: true,
    nodes: [node("NODE-A", "A"), node("NODE-B"), node("NODE-C")],
    edges: [
      runtimeEdge("EDGE-AB", "NODE-A", "NODE-B"),
      runtimeEdge("EDGE-BC", "NODE-B", "NODE-C"),
      runtimeEdge("EDGE-AC", "NODE-A", "NODE-C"),
    ],
  });
}

const ev = (
  over: Partial<JourneyEvent> & Pick<JourneyEvent, "id" | "kind" | "letter">,
): JourneyEvent => ({ at: 0, ...over });

function stateWithLetters(letters: JourneyEvent["letter"][]) {
  return replayJourney(
    letters.map((letter, index) => ev({ id: `e${index}`, kind: "arrive", letter })),
  );
}

describe("EdgeResolver (KOD-30)", () => {
  it("uses only explicitly runtime-navigable edges", () => {
    const projection = testProjection();
    const state = stateWithLetters(["A"]);
    const result = resolveEdge({ state, projection, currentNode: "NODE-A", accessibility: "off" });
    assert.equal(result.reason, "CONNECTED");
    assert.equal(result.to, "NODE-B");
    assert.equal(result.toKind, "NODE");
  });

  it("maps structural A/M/Y without assigning B–X meanings", () => {
    const projection = testProjection();
    assert.deepEqual(resolveNodeForLetter(projection, "A"), ["NODE-A"]);
    assert.deepEqual(resolveNodeForLetter(projection, "M"), [HEART_ENDPOINT_ID]);
    assert.deepEqual(resolveNodeForLetter(projection, "Y"), [RETURN_ENDPOINT_ID]);
    assert.deepEqual(resolveNodeForLetter(projection, "B"), []);
  });

  it("never returns Y before the canonical v0 completion threshold", () => {
    const projection = testProjection();
    const letters: JourneyEvent["letter"][] = ["A", "B", "C", "D", "E"];
    assert.equal(new Set(letters).size, MIN_RETURN_DISTINCT_COORDINATES - 1);
    const result = resolveEdge({
      state: stateWithLetters(letters),
      projection,
      currentNode: "NODE-B",
      accessibility: "off",
    });
    assert.notEqual(result.reason, "RETURN");
  });

  it("converges to route-derived Y after six distinct consequential coordinates", () => {
    const projection = testProjection();
    const state = stateWithLetters(["A", "B", "C", "D", "E", "F"]);
    const result = resolveEdge({ state, projection, currentNode: "NODE-C" });
    assert.equal(result.reason, "RETURN");
    assert.equal(result.to, RETURN_ENDPOINT_ID);
    assert.equal(result.toLetter, "Y");
    assert.equal(result.toKind, "RETURN_TERMINAL");
  });

  it("does not expose Heart while portal state is LATENT/RESONANT", () => {
    const projection = testProjection();
    const state = stateWithLetters(["A", "B"]);
    assert.notEqual(state.heart.portalState, "AVAILABLE");
    const result = resolveEdge({ state, projection, currentNode: "NODE-B", accessibility: "off" });
    assert.ok(!result.candidates.includes(HEART_ENDPOINT_ID));
  });

  it("exposes AVAILABLE Heart as optional rather than mandatory", () => {
    const projection = testProjection();
    const state = {
      ...stateWithLetters(["A", "B"]),
      heart: { portalState: "AVAILABLE" as const, visitCount: 0 },
      serendipitySeed: 0,
    };
    const result = resolveEdge({ state, projection, currentNode: "NODE-B", accessibility: "off" });
    assert.ok(result.candidates.includes(HEART_ENDPOINT_ID));
    assert.equal(result.to, "NODE-A");
    assert.equal(result.reason, "CONNECTED");
  });

  it("can select Heart through bounded serendipity when AVAILABLE", () => {
    const projection = testProjection();
    const state = {
      ...stateWithLetters(["A", "B"]),
      heart: { portalState: "AVAILABLE" as const, visitCount: 0 },
      serendipitySeed: 0.999,
    };
    const result = resolveEdge({ state, projection, currentNode: "NODE-B" });
    assert.ok(result.candidates.includes(HEART_ENDPOINT_ID));
    if (result.to === HEART_ENDPOINT_ID) {
      assert.equal(result.reason, "HEART");
      assert.equal(result.toLetter, "M");
      assert.equal(result.toKind, "HEART_PORTAL");
    }
  });

  it("reduced/off mode is deterministic and does not require pointer-style variability", () => {
    const projection = testProjection();
    const state = {
      ...stateWithLetters(["A"]),
      heart: { portalState: "AVAILABLE" as const, visitCount: 0 },
      serendipitySeed: 0.999,
    };
    const reduced = resolveEdge({ state, projection, currentNode: "NODE-A", accessibility: "reduced" });
    const off = resolveEdge({ state, projection, currentNode: "NODE-A", accessibility: "off" });
    assert.equal(reduced.to, "NODE-B");
    assert.equal(off.to, "NODE-B");
  });

  it("falls back to A when an executable subgraph has no exits", () => {
    const projection = projectCanonicalGraph({
      source: "test",
      canonical: true,
      nodes: [node("NODE-A", "A"), node("NODE-KNOWLEDGE")],
      edges: [
        {
          id: "EDGE-KNOWLEDGE",
          from: "NODE-A",
          to: "NODE-KNOWLEDGE",
          type: "RELATED",
          certainty: "CONFIRMED",
          claimIds: [],
          sourceIds: [],
        },
      ],
    });
    const result = resolveEdge({ state: stateWithLetters(["A"]), projection, currentNode: "NODE-A" });
    assert.equal(result.reason, "FALLBACK");
    assert.equal(result.to, "NODE-A");
  });

  it("refuses a projection with contract anomalies", () => {
    const invalid = projectCanonicalGraph({
      source: "test",
      canonical: true,
      nodes: [node("NODE-X")],
      edges: [],
    });
    assert.throws(
      () => resolveEdge({ state: createInitialJourneyState(), projection: invalid }),
      /projection invalid/,
    );
  });

  it("the frozen Bridge-1 graph is knowledge-safe: no research relation becomes a visitor exit", () => {
    assert.equal(canonicalGraphProjection.anomalies.length, 0);
    const state = stateWithLetters(["A"]);
    const result = resolveEdge({
      state,
      projection: canonicalGraphProjection,
      currentNode: "NODE-KDX-CORPUS-001",
      accessibility: "off",
    });
    assert.equal(result.reason, "FALLBACK");
    assert.equal(result.to, "NODE-KDX-CORPUS-001");
    assert.ok(canonicalGraphProjection.unresolved.includes("NO_RUNTIME_EDGES_SELECTED"));
  });
});
