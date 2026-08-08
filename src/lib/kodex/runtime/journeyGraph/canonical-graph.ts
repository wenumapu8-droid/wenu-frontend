/**
 * KODEX-∞ · PROYECCIÓN DEL GRAPH CANÓNICO (KOD-29)
 *
 * Proyecta el graph canónico congelado (generado por el Bridge 1 / KOD-26) a
 * estructuras determinísticas consumibles por el resolver de bordes (KOD-30).
 *
 * El graph de entrada vive en `journeyGraph/frozen-canonical-graph.json` y es
 * producido por `scripts/bridge_atlas_corpus_v1.py` del repo canon. Esta
 * proyección es lógica pura: no toca DOM ni red, y es testable con `node --test`.
 *
 * Invariantes que se hacen cumplir aquí:
 *
 *   - coordenada asignada sólo A / M / Y; B–L y N–X quedan LATENT (null).
 *   - los IDs de nodos y edges son únicos.
 *   - no hay edges colgantes: todo `from`/`to` existe en nodos.
 *   - las restricciones culturales viajan con el nodo (rights/cultural status).
 *
 * La proyección es determinística: el mismo graph de entrada produce la misma
 * salida, ordenada de forma estable.
 */

import frozenGraph from "./frozen-canonical-graph.json" with { type: "json" };

export type KodexLetter =
  | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L"
  | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X"
  | "Y";

export const CANONICAL_COORDINATES: ReadonlyArray<KodexLetter> = ["A", "M", "Y"] as const;

export interface CanonicalNode {
  id: string;
  coordinateAssignment: KodexLetter | null;
  epistemicStatus: string;
  sourceIds: string[];
  roles: string[];
  rightsStatus: string;
  culturalStatus: string;
}

export interface CanonicalEdge {
  id: string;
  from: string;
  to: string;
  type: string;
  certainty: string;
  claimIds: string[];
  sourceIds: string[];
}

export interface FrozenCanonicalGraph {
  source: string;
  canonical: boolean;
  nodes: CanonicalNode[];
  edges: CanonicalEdge[];
}

export interface GraphProjection {
  source: string;
  nodes: CanonicalNode[];
  edges: CanonicalEdge[];
  nodeById: ReadonlyMap<string, CanonicalNode>;
  /** Adyacencia determinística: nodo -> ids vecinos ordenados. */
  adjacency: ReadonlyMap<string, string[]>;
  /** Nodos por coordenada conocida (A/M/Y). Nunca inventa B–L/N–X. */
  nodesByCoordinate: ReadonlyMap<KodexLetter, string[]>;
  /** Anomalías detectadas al proyectar. Vacío si la proyección es válida. */
  anomalies: string[];
}

function isLetter(value: string): value is KodexLetter {
  return /^[A-Y]$/.test(value);
}

function assertNoDuplicateIds(
  nodes: CanonicalNode[],
  edges: CanonicalEdge[],
  anomalies: string[],
): void {
  const nodeIds = new Set<string>();
  for (const node of nodes) {
    if (nodeIds.has(node.id)) anomalies.push(`DUPLICATE_NODE ${node.id}`);
    nodeIds.add(node.id);
  }
  const edgeIds = new Set<string>();
  for (const edge of edges) {
    if (edgeIds.has(edge.id)) anomalies.push(`DUPLICATE_EDGE ${edge.id}`);
    edgeIds.add(edge.id);
  }
}

function assertNoDanglingEdges(
  edges: CanonicalEdge[],
  nodeIds: Set<string>,
  anomalies: string[],
): void {
  for (const edge of edges) {
    if (!nodeIds.has(edge.from)) anomalies.push(`DANGLING_EDGE ${edge.id} from ${edge.from}`);
    if (!nodeIds.has(edge.to)) anomalies.push(`DANGLING_EDGE ${edge.id} to ${edge.to}`);
  }
}

function assertKnownCoordinates(nodes: CanonicalNode[], anomalies: string[]): void {
  for (const node of nodes) {
    if (node.coordinateAssignment === null) continue;
    if (!isLetter(node.coordinateAssignment)) {
      anomalies.push(`UNKNOWN_COORDINATE ${node.id} ${String(node.coordinateAssignment)}`);
    } else if (!CANONICAL_COORDINATES.includes(node.coordinateAssignment)) {
      anomalies.push(`INVENTED_COORDINATE ${node.id} ${node.coordinateAssignment}`);
    }
  }
}

/**
 * Proyecta el graph canónico congelado a estructuras de resolución.
 * Devuelve anomalías en lugar de lanzar para que la validación sea inspeccionable;
 * el resolver de bordes (KOD-30) debe negarse a operar sobre una proyección con
 * anomalías.
 */
export function projectCanonicalGraph(graph: FrozenCanonicalGraph): GraphProjection {
  const anomalies: string[] = [];
  const sortedNodes = [...graph.nodes].sort((a, b) => a.id.localeCompare(b.id));
  const sortedEdges = [...graph.edges].sort((a, b) => a.id.localeCompare(b.id));

  assertNoDuplicateIds(sortedNodes, sortedEdges, anomalies);
  assertKnownCoordinates(sortedNodes, anomalies);

  const nodeIds = new Set(sortedNodes.map((n) => n.id));
  assertNoDanglingEdges(sortedEdges, nodeIds, anomalies);

  const nodeById = new Map(sortedNodes.map((n) => [n.id, n]));

  const adjacency = new Map<string, string[]>();
  for (const node of sortedNodes) adjacency.set(node.id, []);
  for (const edge of sortedEdges) {
    const from = adjacency.get(edge.from);
    const to = adjacency.get(edge.to);
    if (from && !from.includes(edge.to)) from.push(edge.to);
    if (to && !to.includes(edge.from)) to.push(edge.from);
  }
  for (const [id, neighbors] of adjacency) {
    adjacency.set(id, neighbors.sort((a, b) => a.localeCompare(b)));
  }

  const nodesByCoordinate = new Map<KodexLetter, string[]>();
  for (const coord of CANONICAL_COORDINATES) nodesByCoordinate.set(coord, []);
  for (const node of sortedNodes) {
    const coord = node.coordinateAssignment;
    if (coord !== null && CANONICAL_COORDINATES.includes(coord)) {
      nodesByCoordinate.get(coord)!.push(node.id);
    }
  }
  for (const coord of CANONICAL_COORDINATES) {
    nodesByCoordinate.get(coord)!.sort((a, b) => a.localeCompare(b));
  }

  return {
    source: graph.source,
    nodes: sortedNodes,
    edges: sortedEdges,
    nodeById,
    adjacency,
    nodesByCoordinate,
    anomalies,
  };
}

/** Proyección del graph canónico congelado embebido en el repo. */
export const canonicalGraphProjection: GraphProjection = projectCanonicalGraph(
  frozenGraph as FrozenCanonicalGraph,
);
