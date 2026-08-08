/**
 * KODEX-∞ · EDGE RESOLVER + BOUNDED SERENDIPITY (KOD-30)
 *
 * Runtime exits consume only `GraphProjection.adjacency`, which contains edges
 * explicitly admitted as runtime navigation. Bridge/research relations live in
 * `knowledgeAdjacency` and are never treated as visitor exits implicitly.
 */

import {
  HEART_ENDPOINT_ID,
  RETURN_ENDPOINT_ID,
  type GraphProjection,
} from "./journeyGraph/canonical-graph.ts";
import type { JourneyState, KodexLetter } from "./journey-state.ts";

export type AccessibilityMode = "full" | "reduced" | "off";
export const MIN_RETURN_DISTINCT_COORDINATES = 6;

export interface ResolverContext {
  state: JourneyState;
  projection: GraphProjection;
  /** Current source/runtime node. If omitted, A/current coordinate is resolved. */
  currentNode?: string;
  /** Reduced/off disables serendipitous reordering but preserves all actions. */
  accessibility?: AccessibilityMode;
}

export interface ResolvedEdge {
  from: string;
  to: string;
  toLetter: KodexLetter | null;
  toKind: "NODE" | "HEART_PORTAL" | "RETURN_TERMINAL";
  reason: "RETURN" | "HEART" | "CONNECTED" | "SERENDIPITY" | "FALLBACK";
  serendipitySeed: number;
  candidates: string[];
}

export function resolveNodeForLetter(
  projection: GraphProjection,
  letter: KodexLetter,
): string[] {
  if (letter === "M") return [projection.structuralEndpoints.get("M")?.id ?? HEART_ENDPOINT_ID];
  if (letter === "Y") return [projection.structuralEndpoints.get("Y")?.id ?? RETURN_ENDPOINT_ID];
  if (letter === "A") return projection.nodesByCoordinate.get("A") ?? [];
  return [];
}

function assertProjectionUsable(projection: GraphProjection): void {
  if (projection.anomalies.length > 0) {
    throw new Error(`KODEX graph projection invalid: ${projection.anomalies.join(" | ")}`);
  }
}

function neighborsOf(projection: GraphProjection, nodeId: string): string[] {
  return projection.adjacency.get(nodeId) ?? [];
}

function distinctConsequentialCoordinates(state: JourneyState): number {
  return new Set(state.letterTrace.filter((letter) => letter !== "M" && letter !== "Y")).size;
}

/**
 * Y is structural and route-derived. For the v0 executable gate we use the
 * canonical minimum of six consequential coordinates; this is deliberately
 * stricter than the old two-letter shortcut and does not assign meanings to
 * any intermediate coordinate.
 */
function resolveReturnEndpoint(state: JourneyState, projection: GraphProjection): string | null {
  if (distinctConsequentialCoordinates(state) < MIN_RETURN_DISTINCT_COORDINATES) return null;
  return projection.structuralEndpoints.get("Y")?.id ?? RETURN_ENDPOINT_ID;
}

/** Heart becomes selectable only when the JourneyState portal is AVAILABLE. */
function maybeHeartEndpoint(state: JourneyState, projection: GraphProjection): string | null {
  if (state.heart.portalState !== "AVAILABLE") return null;
  if (state.current === "M" || state.letterTrace.length === 0) return null;
  return projection.structuralEndpoints.get("M")?.id ?? HEART_ENDPOINT_ID;
}

function stableSort(ids: string[]): string[] {
  return [...new Set(ids)].sort((a, b) => a.localeCompare(b));
}

function letterOf(projection: GraphProjection, id: string): KodexLetter | null {
  if (id === (projection.structuralEndpoints.get("M")?.id ?? HEART_ENDPOINT_ID)) return "M";
  if (id === (projection.structuralEndpoints.get("Y")?.id ?? RETURN_ENDPOINT_ID)) return "Y";
  return projection.nodeById.get(id)?.coordinateAssignment ?? null;
}

function kindOf(projection: GraphProjection, id: string): ResolvedEdge["toKind"] {
  if (id === (projection.structuralEndpoints.get("M")?.id ?? HEART_ENDPOINT_ID)) return "HEART_PORTAL";
  if (id === (projection.structuralEndpoints.get("Y")?.id ?? RETURN_ENDPOINT_ID)) return "RETURN_TERMINAL";
  return "NODE";
}

export function resolveEdge(ctx: ResolverContext): ResolvedEdge {
  const { state, projection } = ctx;
  assertProjectionUsable(projection);
  const accessibility = ctx.accessibility ?? "full";

  const current =
    ctx.currentNode ??
    resolveNodeForLetter(projection, state.current)[0] ??
    projection.structuralEndpoints.get("A")?.id ??
    "";

  const neighbors = stableSort(neighborsOf(projection, current));
  const returnEndpoint = resolveReturnEndpoint(state, projection);
  const heartEndpoint = maybeHeartEndpoint(state, projection);
  const seed = Math.max(0, Math.min(0.999999, state.serendipitySeed));

  // Once the v0 completion gate is met, Y is the canonical convergence.
  if (returnEndpoint) {
    return {
      from: current,
      to: returnEndpoint,
      toLetter: "Y",
      toKind: "RETURN_TERMINAL",
      reason: "RETURN",
      serendipitySeed: seed,
      candidates: [returnEndpoint, ...neighbors, ...(heartEndpoint ? [heartEndpoint] : [])],
    };
  }

  // Heart is an optional candidate, never an automatic priority over a normal
  // connected exit. Reduced/off mode therefore chooses the stable connected
  // path first and exposes Heart only when no connected exit exists.
  const pool = stableSort([...neighbors, ...(heartEndpoint ? [heartEndpoint] : [])]);

  if (pool.length === 0) {
    const fallback = projection.structuralEndpoints.get("A")?.id ?? current;
    return {
      from: current,
      to: fallback,
      toLetter: letterOf(projection, fallback),
      toKind: kindOf(projection, fallback),
      reason: "FALLBACK",
      serendipitySeed: seed,
      candidates: [fallback],
    };
  }

  let chosen: string;
  if (accessibility === "off" || accessibility === "reduced") {
    chosen = neighbors[0] ?? heartEndpoint ?? pool[0];
  } else {
    chosen = pool[Math.min(Math.floor(seed * pool.length), pool.length - 1)];
  }

  const isHeart = chosen === heartEndpoint;
  const firstConnected = neighbors[0] ?? null;
  const reason: ResolvedEdge["reason"] = isHeart
    ? "HEART"
    : chosen === firstConnected
      ? "CONNECTED"
      : "SERENDIPITY";

  return {
    from: current,
    to: chosen,
    toLetter: letterOf(projection, chosen),
    toKind: kindOf(projection, chosen),
    reason,
    serendipitySeed: seed,
    candidates: pool,
  };
}

export function simulateJourney(ctx: ResolverContext, maxSteps = 50): ResolvedEdge[] {
  const steps: ResolvedEdge[] = [];
  let cursor = ctx;
  for (let i = 0; i < maxSteps; i += 1) {
    const edge = resolveEdge(cursor);
    steps.push(edge);
    if (edge.reason === "RETURN") break;

    const nextLetter = edge.toLetter;
    cursor = {
      ...cursor,
      currentNode: edge.to,
      state: {
        ...cursor.state,
        current: nextLetter ?? cursor.state.current,
        letterTrace: nextLetter ? [...cursor.state.letterTrace, nextLetter] : cursor.state.letterTrace,
        visitCounts: nextLetter
          ? {
              ...cursor.state.visitCounts,
              [nextLetter]: (cursor.state.visitCounts[nextLetter] ?? 0) + 1,
            }
          : cursor.state.visitCounts,
      },
    };
  }
  return steps;
}
