/**
 * KODEX-∞ · RUNTIME GRAPH PROJECTION (KOD-29)
 *
 * The Bridge 1 knowledge graph is provenance-rich source material. It is NOT
 * automatically a navigation graph. This module keeps those two surfaces
 * separate so research/content relations cannot silently become visitor exits.
 *
 * Structural invariants come from the canonical A–M–Y topology:
 * A = common origin, M = optional distributed Heart, Y = route-derived Return.
 * B–L and N–X remain unassigned until creator-approved mappings exist.
 */

import frozenGraph from "./frozen-canonical-graph.json" with { type: "json" };

export type KodexLetter =
  | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L"
  | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X"
  | "Y";

export type StructuralCoordinate = "A" | "M" | "Y";
export const CANONICAL_COORDINATES: ReadonlyArray<StructuralCoordinate> = ["A", "M", "Y"] as const;

export const HEART_ENDPOINT_ID = "KDX-STRUCTURAL-M";
export const RETURN_ENDPOINT_ID = "KDX-STRUCTURAL-Y";

const EPISTEMIC_STATUSES = new Set([
  "VERIFIED",
  "CANONICAL",
  "INFERRED",
  "SPECULATIVE",
  "NEEDS_CONFIRMATION",
  "DEPRECATED",
]);
const RIGHTS_STATUSES = new Set(["CLEAR", "REFERENCE_ONLY", "UNKNOWN", "BLOCKED"]);
const CULTURAL_STATUSES = new Set(["STANDARD", "REVIEW_REQUIRED", "AUTHORIZATION_REQUIRED"]);

export interface CanonicalNode {
  id: string;
  coordinateAssignment: KodexLetter | null;
  epistemicStatus: string;
  sourceIds: string[];
  roles: string[];
  rightsStatus: string;
  culturalStatus: string;
  /** Optional runtime metadata. M may never be mandatory. */
  runtimeMandatory?: boolean;
}

export interface CanonicalEdge {
  id: string;
  from: string;
  to: string;
  type: string;
  certainty: string;
  claimIds: string[];
  sourceIds: string[];
  /** Only explicitly reviewed edges may become navigation exits. */
  runtimeNavigable?: boolean;
}

export interface FrozenCanonicalGraph {
  source: string;
  canonical: boolean;
  nodes: CanonicalNode[];
  edges: CanonicalEdge[];
}

export interface StructuralEndpoint {
  id: string;
  coordinate: StructuralCoordinate;
  kind: "SOURCE_ENTRY" | "VIRTUAL_PORTAL" | "VIRTUAL_TERMINAL";
  mandatory: boolean;
  routeDerived: boolean;
  sourceNodeIds: string[];
}

export interface GraphProjection {
  source: string;
  /** Source nodes remain intact for provenance/knowledge lookup. */
  nodes: CanonicalNode[];
  edges: CanonicalEdge[];
  nodeById: ReadonlyMap<string, CanonicalNode>;
  /** Full knowledge relations. Never consume this as navigation. */
  knowledgeAdjacency: ReadonlyMap<string, string[]>;
  /** Explicit runtime exits only (`runtimeNavigable: true`). */
  adjacency: ReadonlyMap<string, string[]>;
  /** Source nodes that explicitly carry A/M/Y. */
  nodesByCoordinate: ReadonlyMap<StructuralCoordinate, string[]>;
  /** Always registers A/M/Y structure without inventing B–X meanings. */
  structuralEndpoints: ReadonlyMap<StructuralCoordinate, StructuralEndpoint>;
  /** Source node IDs admitted to the executable runtime surface. */
  runtimeNodeIds: ReadonlySet<string>;
  /** Non-fatal work still needed before a fuller executable subgraph exists. */
  unresolved: string[];
  /** Contract violations. Resolver must refuse projections with anomalies. */
  anomalies: string[];
  status: "REVIEW" | "IMPLEMENTED";
}

function isLetter(value: string): value is KodexLetter {
  return /^[A-Y]$/.test(value);
}

function pushSorted(map: Map<string, string[]>, from: string, to: string): void {
  const values = map.get(from);
  if (values && !values.includes(to)) values.push(to);
}

function buildAdjacency(nodes: CanonicalNode[], edges: CanonicalEdge[]): Map<string, string[]> {
  const adjacency = new Map<string, string[]>();
  for (const node of nodes) adjacency.set(node.id, []);
  for (const edge of edges) {
    pushSorted(adjacency, edge.from, edge.to);
    pushSorted(adjacency, edge.to, edge.from);
  }
  for (const [id, neighbors] of adjacency) {
    adjacency.set(id, neighbors.sort((a, b) => a.localeCompare(b)));
  }
  return adjacency;
}

function validateIds(nodes: CanonicalNode[], edges: CanonicalEdge[], anomalies: string[]): void {
  const nodeIds = new Set<string>();
  for (const node of nodes) {
    if (!/^NODE-[A-Z0-9_-]+$/.test(node.id)) anomalies.push(`UNKNOWN_NODE_ID ${node.id}`);
    if (nodeIds.has(node.id)) anomalies.push(`DUPLICATE_NODE ${node.id}`);
    nodeIds.add(node.id);
  }
  const edgeIds = new Set<string>();
  for (const edge of edges) {
    if (!/^EDGE-[A-Z0-9_-]+$/.test(edge.id)) anomalies.push(`UNKNOWN_EDGE_ID ${edge.id}`);
    if (edgeIds.has(edge.id)) anomalies.push(`DUPLICATE_EDGE ${edge.id}`);
    edgeIds.add(edge.id);
  }
}

function validateStatuses(nodes: CanonicalNode[], anomalies: string[]): void {
  for (const node of nodes) {
    if (!EPISTEMIC_STATUSES.has(node.epistemicStatus)) {
      anomalies.push(`UNKNOWN_EPISTEMIC_STATUS ${node.id} ${node.epistemicStatus}`);
    }
    if (!RIGHTS_STATUSES.has(node.rightsStatus)) {
      anomalies.push(`UNKNOWN_RIGHTS_STATUS ${node.id} ${node.rightsStatus}`);
    }
    if (!CULTURAL_STATUSES.has(node.culturalStatus)) {
      anomalies.push(`UNKNOWN_CULTURAL_STATUS ${node.id} ${node.culturalStatus}`);
    }
  }
}

function validateCoordinates(nodes: CanonicalNode[], anomalies: string[]): void {
  for (const node of nodes) {
    const coord = node.coordinateAssignment;
    if (coord === null) continue;
    if (!isLetter(coord)) anomalies.push(`UNKNOWN_COORDINATE ${node.id} ${String(coord)}`);
    else if (!CANONICAL_COORDINATES.includes(coord as StructuralCoordinate)) {
      anomalies.push(`INVENTED_COORDINATE ${node.id} ${coord}`);
    }
    if (coord === "M" && node.runtimeMandatory === true) {
      anomalies.push(`MANDATORY_HEART_FORBIDDEN ${node.id}`);
    }
  }
}

function validateEdges(edges: CanonicalEdge[], nodeIds: Set<string>, anomalies: string[]): void {
  for (const edge of edges) {
    if (!nodeIds.has(edge.from)) anomalies.push(`DANGLING_EDGE ${edge.id} from ${edge.from}`);
    if (!nodeIds.has(edge.to)) anomalies.push(`DANGLING_EDGE ${edge.id} to ${edge.to}`);
  }
}

export function projectCanonicalGraph(graph: FrozenCanonicalGraph): GraphProjection {
  const anomalies: string[] = [];
  const unresolved: string[] = [];
  const sortedNodes = [...graph.nodes].sort((a, b) => a.id.localeCompare(b.id));
  const sortedEdges = [...graph.edges].sort((a, b) => a.id.localeCompare(b.id));

  validateIds(sortedNodes, sortedEdges, anomalies);
  validateStatuses(sortedNodes, anomalies);
  validateCoordinates(sortedNodes, anomalies);

  const nodeIds = new Set(sortedNodes.map((node) => node.id));
  validateEdges(sortedEdges, nodeIds, anomalies);

  const nodeById = new Map(sortedNodes.map((node) => [node.id, node]));
  const knowledgeAdjacency = buildAdjacency(sortedNodes, sortedEdges);
  const runtimeEdges = sortedEdges.filter((edge) => edge.runtimeNavigable === true);
  const adjacency = buildAdjacency(sortedNodes, runtimeEdges);

  const nodesByCoordinate = new Map<StructuralCoordinate, string[]>();
  for (const coord of CANONICAL_COORDINATES) nodesByCoordinate.set(coord, []);
  for (const node of sortedNodes) {
    const coord = node.coordinateAssignment;
    if (coord !== null && CANONICAL_COORDINATES.includes(coord as StructuralCoordinate)) {
      nodesByCoordinate.get(coord as StructuralCoordinate)!.push(node.id);
    }
  }
  for (const coord of CANONICAL_COORDINATES) {
    nodesByCoordinate.get(coord)!.sort((a, b) => a.localeCompare(b));
  }

  const aNodes = nodesByCoordinate.get("A")!;
  if (aNodes.length === 0) anomalies.push("MISSING_A");
  if (aNodes.length > 1) anomalies.push(`MULTIPLE_A ${aNodes.join(",")}`);

  // M and Y are canonical structural invariants, not Bridge-1 content claims.
  // Register virtual endpoints when no source node carries them; this preserves
  // optional Heart and route-derived Return without assigning a corpus item.
  const structuralEndpoints = new Map<StructuralCoordinate, StructuralEndpoint>([
    [
      "A",
      {
        id: aNodes[0] ?? "KDX-STRUCTURAL-A-MISSING",
        coordinate: "A",
        kind: "SOURCE_ENTRY",
        mandatory: true,
        routeDerived: false,
        sourceNodeIds: [...aNodes],
      },
    ],
    [
      "M",
      {
        id: HEART_ENDPOINT_ID,
        coordinate: "M",
        kind: "VIRTUAL_PORTAL",
        mandatory: false,
        routeDerived: false,
        sourceNodeIds: [...nodesByCoordinate.get("M")!],
      },
    ],
    [
      "Y",
      {
        id: RETURN_ENDPOINT_ID,
        coordinate: "Y",
        kind: "VIRTUAL_TERMINAL",
        mandatory: true,
        routeDerived: true,
        sourceNodeIds: [...nodesByCoordinate.get("Y")!],
      },
    ],
  ]);

  const runtimeNodeIds = new Set<string>(aNodes);
  for (const edge of runtimeEdges) {
    runtimeNodeIds.add(edge.from);
    runtimeNodeIds.add(edge.to);
  }

  if (runtimeEdges.length === 0) unresolved.push("NO_RUNTIME_EDGES_SELECTED");
  if (nodesByCoordinate.get("M")!.length === 0) unresolved.push("M_USES_STRUCTURAL_PORTAL_ENDPOINT");
  if (nodesByCoordinate.get("Y")!.length === 0) unresolved.push("Y_USES_ROUTE_DERIVED_TERMINAL_ENDPOINT");
  unresolved.push("B_L_N_X_MEANINGS_REMAIN_UNASSIGNED");

  return {
    source: graph.source,
    nodes: sortedNodes,
    edges: sortedEdges,
    nodeById,
    knowledgeAdjacency,
    adjacency,
    nodesByCoordinate,
    structuralEndpoints,
    runtimeNodeIds,
    unresolved,
    anomalies,
    status: runtimeEdges.length > 0 && anomalies.length === 0 ? "IMPLEMENTED" : "REVIEW",
  };
}

export const canonicalGraphProjection: GraphProjection = projectCanonicalGraph(
  frozenGraph as FrozenCanonicalGraph,
);
