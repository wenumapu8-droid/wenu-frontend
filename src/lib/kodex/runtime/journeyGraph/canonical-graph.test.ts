import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { canonicalGraphProjection, projectCanonicalGraph } from "./canonical-graph.ts";

describe("Canonical graph projection (KOD-29)", () => {
  it("frozen graph projects without anomalies", () => {
    assert.equal(canonicalGraphProjection.anomalies.length, 0);
  });

  it("source is bridge-1-v0", () => {
    assert.equal(canonicalGraphProjection.source, "bridge-1-v0");
  });

  it("node and edge counts reconcile with the frozen input", () => {
    assert.equal(canonicalGraphProjection.nodes.length, 25);
    assert.equal(canonicalGraphProjection.edges.length, 69);
  });

  it("nodeById indexes every node", () => {
    for (const node of canonicalGraphProjection.nodes) {
      assert.equal(canonicalGraphProjection.nodeById.get(node.id)?.id, node.id);
    }
  });

  it("adjacency is undirected and sorted", () => {
    for (const [id, neighbors] of canonicalGraphProjection.adjacency) {
      assert.ok(canonicalGraphProjection.nodeById.has(id), `node ${id} has adjacency`);
      assert.deepEqual(neighbors, [...neighbors].sort((a, b) => a.localeCompare(b)));
      for (const n of neighbors) {
        assert.ok(canonicalGraphProjection.nodeById.has(n), `neighbor ${n} exists`);
        assert.ok(
          canonicalGraphProjection.adjacency.get(n)!.includes(id),
          `adjacency symmetric ${id} <-> ${n}`,
        );
      }
    }
  });

  it("every edge endpoint exists (no dangling edges)", () => {
    const ids = new Set(canonicalGraphProjection.nodes.map((n) => n.id));
    for (const edge of canonicalGraphProjection.edges) {
      assert.ok(ids.has(edge.from), `edge ${edge.id} from ${edge.from}`);
      assert.ok(ids.has(edge.to), `edge ${edge.id} to ${edge.to}`);
    }
  });

  it("coordinates only A/M/Y, never invented B-L or N-X", () => {
    for (const node of canonicalGraphProjection.nodes) {
      if (node.coordinateAssignment !== null) {
        assert.ok(["A", "M", "Y"].includes(node.coordinateAssignment), node.id);
      }
    }
  });

  it("A is assigned to the common-origin node only", () => {
    const aNodes = canonicalGraphProjection.nodesByCoordinate.get("A")!;
    assert.deepEqual(aNodes, ["NODE-KDX-CORPUS-001"]);
  });

  it("M and Y are never force-assigned by the projection", () => {
    assert.equal(canonicalGraphProjection.nodesByCoordinate.get("M")!.length, 0);
    assert.equal(canonicalGraphProjection.nodesByCoordinate.get("Y")!.length, 0);
  });

  it("restrictions travel with OCIN nodes", () => {
    const ocin = canonicalGraphProjection.nodes.filter((n) => n.id.includes("OCIN"));
    assert.equal(ocin.length, 10);
    for (const node of ocin) {
      assert.equal(node.rightsStatus, "UNKNOWN");
      assert.equal(node.culturalStatus, "REVIEW_REQUIRED");
    }
  });

  it("projection is deterministic for the same frozen input", () => {
    const again = projectCanonicalGraph(
      canonicalGraphProjection as unknown as Parameters<typeof projectCanonicalGraph>[0],
    );
    assert.deepEqual(
      again.nodes.map((n) => n.id),
      canonicalGraphProjection.nodes.map((n) => n.id),
    );
    assert.deepEqual(again.edges, canonicalGraphProjection.edges);
  });

  it("reports duplicate node ids as anomalies", () => {
    const result = projectCanonicalGraph({
      source: "test",
      canonical: true,
      nodes: [
        {
          id: "NODE-A",
          coordinateAssignment: null,
          epistemicStatus: "VERIFIED",
          sourceIds: [],
          roles: [],
          rightsStatus: "CLEAR",
          culturalStatus: "STANDARD",
        },
        {
          id: "NODE-A",
          coordinateAssignment: null,
          epistemicStatus: "VERIFIED",
          sourceIds: [],
          roles: [],
          rightsStatus: "CLEAR",
          culturalStatus: "STANDARD",
        },
      ],
      edges: [],
    });
    assert.ok(result.anomalies.some((a) => a.startsWith("DUPLICATE_NODE")));
  });

  it("reports invented coordinates as anomalies", () => {
    const result = projectCanonicalGraph({
      source: "test",
      canonical: true,
      nodes: [
        {
          id: "NODE-B",
          coordinateAssignment: "B" as never,
          epistemicStatus: "VERIFIED",
          sourceIds: [],
          roles: [],
          rightsStatus: "CLEAR",
          culturalStatus: "STANDARD",
        },
      ],
      edges: [],
    });
    assert.ok(result.anomalies.some((a) => a.startsWith("INVENTED_COORDINATE")));
  });

  it("reports dangling edges as anomalies", () => {
    const result = projectCanonicalGraph({
      source: "test",
      canonical: true,
      nodes: [
        {
          id: "NODE-A",
          coordinateAssignment: null,
          epistemicStatus: "VERIFIED",
          sourceIds: [],
          roles: [],
          rightsStatus: "CLEAR",
          culturalStatus: "STANDARD",
        },
      ],
      edges: [
        {
          id: "EDGE-GHOST",
          from: "NODE-A",
          to: "NODE-MISSING",
          type: "RELATED",
          certainty: "CONFIRMED",
          claimIds: [],
          sourceIds: [],
        },
      ],
    });
    assert.ok(result.anomalies.some((a) => a.startsWith("DANGLING_EDGE")));
  });
});
