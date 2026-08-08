import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  HEART_ENDPOINT_ID,
  RETURN_ENDPOINT_ID,
  canonicalGraphProjection,
  projectCanonicalGraph,
} from "./canonical-graph.ts";

function node(
  id: string,
  coordinateAssignment: "A" | "M" | "Y" | null = null,
  overrides: Record<string, unknown> = {},
) {
  return {
    id,
    coordinateAssignment,
    epistemicStatus: "VERIFIED",
    sourceIds: [],
    roles: [],
    rightsStatus: "CLEAR",
    culturalStatus: "STANDARD",
    ...overrides,
  };
}

function edge(id: string, from: string, to: string, runtimeNavigable = false) {
  return {
    id,
    from,
    to,
    type: "RELATED",
    certainty: "CONFIRMED",
    claimIds: [],
    sourceIds: [],
    runtimeNavigable,
  };
}

describe("Canonical graph projection (KOD-29)", () => {
  it("frozen Bridge-1 snapshot validates without contract anomalies", () => {
    assert.deepEqual(canonicalGraphProjection.anomalies, []);
    assert.equal(canonicalGraphProjection.source, "bridge-1-v0");
    assert.equal(canonicalGraphProjection.nodes.length, 25);
    assert.equal(canonicalGraphProjection.edges.length, 69);
  });

  it("does not silently convert knowledge relations into navigation exits", () => {
    const knowledgeEdges = [...canonicalGraphProjection.knowledgeAdjacency.values()].flat().length;
    const runtimeEdges = [...canonicalGraphProjection.adjacency.values()].flat().length;
    assert.ok(knowledgeEdges > 0);
    assert.equal(runtimeEdges, 0);
    assert.ok(canonicalGraphProjection.unresolved.includes("NO_RUNTIME_EDGES_SELECTED"));
  });

  it("admits only explicitly runtime-navigable fixture edges", () => {
    const projection = projectCanonicalGraph({
      source: "fixture",
      canonical: true,
      nodes: [node("NODE-A", "A"), node("NODE-B"), node("NODE-C")],
      edges: [edge("EDGE-AB", "NODE-A", "NODE-B", true), edge("EDGE-AC", "NODE-A", "NODE-C")],
    });
    assert.deepEqual(projection.adjacency.get("NODE-A"), ["NODE-B"]);
    assert.deepEqual(projection.knowledgeAdjacency.get("NODE-A"), ["NODE-B", "NODE-C"]);
    assert.ok(projection.runtimeNodeIds.has("NODE-A"));
    assert.ok(projection.runtimeNodeIds.has("NODE-B"));
    assert.ok(!projection.runtimeNodeIds.has("NODE-C"));
  });

  it("registers A from source and M/Y as structural endpoints without inventing corpus assignments", () => {
    assert.deepEqual(canonicalGraphProjection.nodesByCoordinate.get("A"), ["NODE-KDX-CORPUS-001"]);
    assert.deepEqual(canonicalGraphProjection.nodesByCoordinate.get("M"), []);
    assert.deepEqual(canonicalGraphProjection.nodesByCoordinate.get("Y"), []);
    assert.equal(canonicalGraphProjection.structuralEndpoints.get("A")?.id, "NODE-KDX-CORPUS-001");
    assert.equal(canonicalGraphProjection.structuralEndpoints.get("M")?.id, HEART_ENDPOINT_ID);
    assert.equal(canonicalGraphProjection.structuralEndpoints.get("M")?.mandatory, false);
    assert.equal(canonicalGraphProjection.structuralEndpoints.get("Y")?.id, RETURN_ENDPOINT_ID);
    assert.equal(canonicalGraphProjection.structuralEndpoints.get("Y")?.routeDerived, true);
  });

  it("preserves source restrictions on OCIN nodes", () => {
    const ocin = canonicalGraphProjection.nodes.filter((candidate) => candidate.id.includes("OCIN"));
    assert.equal(ocin.length, 10);
    for (const candidate of ocin) {
      assert.equal(candidate.rightsStatus, "UNKNOWN");
      assert.equal(candidate.culturalStatus, "REVIEW_REQUIRED");
    }
  });

  it("is deterministic for the same input", () => {
    const graph = {
      source: "fixture",
      canonical: true,
      nodes: [node("NODE-A", "A"), node("NODE-B")],
      edges: [edge("EDGE-AB", "NODE-A", "NODE-B", true)],
    };
    const first = projectCanonicalGraph(graph);
    const second = projectCanonicalGraph(graph);
    assert.deepEqual(first.nodes, second.nodes);
    assert.deepEqual(first.edges, second.edges);
    assert.deepEqual([...first.adjacency], [...second.adjacency]);
    assert.deepEqual(first.unresolved, second.unresolved);
  });

  it("reports duplicate node and edge IDs", () => {
    const projection = projectCanonicalGraph({
      source: "fixture",
      canonical: true,
      nodes: [node("NODE-A", "A"), node("NODE-A", "A")],
      edges: [edge("EDGE-X", "NODE-A", "NODE-A"), edge("EDGE-X", "NODE-A", "NODE-A")],
    });
    assert.ok(projection.anomalies.some((value) => value.startsWith("DUPLICATE_NODE")));
    assert.ok(projection.anomalies.some((value) => value.startsWith("DUPLICATE_EDGE")));
  });

  it("reports dangling edges", () => {
    const projection = projectCanonicalGraph({
      source: "fixture",
      canonical: true,
      nodes: [node("NODE-A", "A")],
      edges: [edge("EDGE-GHOST", "NODE-A", "NODE-MISSING", true)],
    });
    assert.ok(projection.anomalies.some((value) => value.startsWith("DANGLING_EDGE")));
  });

  it("reports missing or duplicated A", () => {
    const missing = projectCanonicalGraph({ source: "fixture", canonical: true, nodes: [node("NODE-X")], edges: [] });
    assert.ok(missing.anomalies.includes("MISSING_A"));

    const duplicated = projectCanonicalGraph({
      source: "fixture",
      canonical: true,
      nodes: [node("NODE-A1", "A"), node("NODE-A2", "A")],
      edges: [],
    });
    assert.ok(duplicated.anomalies.some((value) => value.startsWith("MULTIPLE_A")));
  });

  it("rejects invented B–X coordinate assignments", () => {
    const projection = projectCanonicalGraph({
      source: "fixture",
      canonical: true,
      nodes: [node("NODE-A", "A"), node("NODE-B", "B" as never)],
      edges: [],
    });
    assert.ok(projection.anomalies.some((value) => value.startsWith("INVENTED_COORDINATE")));
  });

  it("rejects M encoded as mandatory", () => {
    const projection = projectCanonicalGraph({
      source: "fixture",
      canonical: true,
      nodes: [node("NODE-A", "A"), node("NODE-M", "M", { runtimeMandatory: true })],
      edges: [],
    });
    assert.ok(projection.anomalies.some((value) => value.startsWith("MANDATORY_HEART_FORBIDDEN")));
  });

  it("reports unrecognized epistemic/rights/cultural statuses", () => {
    const projection = projectCanonicalGraph({
      source: "fixture",
      canonical: true,
      nodes: [
        node("NODE-A", "A", {
          epistemicStatus: "MAGIC",
          rightsStatus: "MAYBE",
          culturalStatus: "UNSPECIFIED",
        }),
      ],
      edges: [],
    });
    assert.ok(projection.anomalies.some((value) => value.startsWith("UNKNOWN_EPISTEMIC_STATUS")));
    assert.ok(projection.anomalies.some((value) => value.startsWith("UNKNOWN_RIGHTS_STATUS")));
    assert.ok(projection.anomalies.some((value) => value.startsWith("UNKNOWN_CULTURAL_STATUS")));
  });

  it("reports malformed IDs instead of accepting them silently", () => {
    const projection = projectCanonicalGraph({
      source: "fixture",
      canonical: true,
      nodes: [node("A", "A")],
      edges: [],
    });
    assert.ok(projection.anomalies.some((value) => value.startsWith("UNKNOWN_NODE_ID")));
  });
});
