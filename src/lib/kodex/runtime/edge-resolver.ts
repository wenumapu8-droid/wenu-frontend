/**
 * KODEX-∞ · EDGE RESOLVER + SERENDIPIDAD ACOTADA (KOD-30)
 *
 * Resuelve el siguiente borde del recorrido de forma determinística a partir
 * del estado del viaje (KOD-28) y del graph canónico proyectado (KOD-29).
 *
 * Contrato canónico que cumple (alphabet-topology.json / experience-graph.json):
 *
 *   - edgeResolution: STATE_DEPENDENT
 *   - Y / RETURN se genera ÚNICAMENTE desde un event trace real que ya visitó
 *     más de una coordenada; nunca se fuerza Y al inicio.
 *   - M / HEART es opcional: puede ofrecerse desde más de una región, nunca
 *     es obligatorio y nunca puntúa.
 *   - LOOPS y MUTATED REVISITS están permitidos.
 *   - B–L y N–X no reciben significado inventado.
 *   - La serendipidad es ACOTADA y determinística: usa la semilla derivada
 *     del rastro (0..1) para variar el orden de candidatos sin aleatoriedad.
 *   - ACCESSIBILITY_MODE reduce la variabilidad (camino determinístico).
 *
 * Dominio: el recorrido se resuelve sobre NODOS del graph proyectado
 * (NODE-*), mientras el kernel de estado guarda letras. `resolveEdge` opera en
 * nodos y reporta también la letra destino cuando el nodo la tiene; la
 * integración con JourneyState traduce letra -> nodo inicial vía
 * `resolveNodeForLetter`.
 *
 * Es lógica pura: no toca DOM ni red, y se testea con `node --test`.
 */

import type { GraphProjection } from "./journeyGraph/canonical-graph.ts";
import type { JourneyState, KodexLetter } from "./journey-state.ts";

export type AccessibilityMode = "full" | "reduced" | "off";

export interface ResolverContext {
  state: JourneyState;
  projection: GraphProjection;
  /** Nodo actual del recorrido. Si no se provee, se deriva de `state.current`. */
  currentNode?: string;
  /** Preferencias del usuario. `reduced`/`off` desactivan la serendipidad. */
  accessibility?: AccessibilityMode;
}

export interface ResolvedEdge {
  from: string;
  to: string;
  toLetter: KodexLetter | null;
  /** Cómo se resolvió el borde. */
  reason: "RETURN" | "HEART" | "CONNECTED" | "SERENDIPITY" | "FALLBACK";
  /** Semilla de serendipidad usada (determinística desde el rastro). */
  serendipitySeed: number;
  /** Ids de nodos candidatos considerados, en el orden evaluado. */
  candidates: string[];
}

/**
 * Traduce una letra del recorrido a los nodos del graph que llevan esa
 * coordenada. Si la letra no tiene nodo asignado (LATENT), devuelve [].
 */
export function resolveNodeForLetter(
  projection: GraphProjection,
  letter: KodexLetter,
): string[] {
  return projection.nodesByCoordinate.get(letter) ?? [];
}

function neighborsOf(projection: GraphProjection, nodeId: string): string[] {
  return projection.adjacency.get(nodeId) ?? [];
}

/**
 * Devuelve el nodo destino Y al que converge un recorrido real: el nodo
 * proyectado con coordenada Y, si existe y el rastro ya visitó más de una
 * letra (nunca se devuelve en el primer paso).
 */
function resolveReturnNode(state: JourneyState, projection: GraphProjection): string | null {
  const distinct = new Set(state.letterTrace).size;
  if (distinct < 2) return null;
  const yNodes = projection.nodesByCoordinate.get("Y") ?? [];
  return yNodes.length ? yNodes[0] : null;
}

/**
 * Ofrece M / HEART como candidato opcional. Sólo aparece cuando el corazón
 * está LATENT/RESONANT y el rastro ya tiene al menos una coordenada: es un
 * desvío posible, nunca obligatorio.
 */
function maybeHeartNode(state: JourneyState, projection: GraphProjection): string | null {
  if (state.heart.portalState === "AVAILABLE") return null;
  if (state.letterTrace.length < 1) return null;
  const mNodes = projection.nodesByCoordinate.get("M") ?? [];
  return mNodes.length ? mNodes[0] : null;
}

function stableSort(ids: string[]): string[] {
  return [...ids].sort((a, b) => a.localeCompare(b));
}

function letterOf(projection: GraphProjection, nodeId: string): KodexLetter | null {
  const node = projection.nodeById.get(nodeId);
  return node?.coordinateAssignment ?? null;
}

/**
 * Resuelve el siguiente borde de forma determinística.
 *
 * Prioridad:
 *   1. RETURN (Y) cuando el rastro real ya justifica el retorno.
 *   2. HEART (M) como opción opcional.
 *   3. Vecinos conectados del nodo actual (orden estable).
 *   4. Variación serendípica acotada del orden de candidatos.
 *   5. Fallback: coordenada A (origen común) si el graph está huérfano.
 */
export function resolveEdge(ctx: ResolverContext): ResolvedEdge {
  const state = ctx.state;
  const projection = ctx.projection;
  const accessibility = ctx.accessibility ?? "full";

  const current =
    ctx.currentNode ??
    resolveNodeForLetter(projection, state.current)[0] ??
    projection.nodesByCoordinate.get("A")?.[0] ??
    "";

  const neighbors = stableSort(neighborsOf(projection, current));
  const returnNode = resolveReturnNode(state, projection);
  const heartNode = maybeHeartNode(state, projection);

  const candidates = [
    ...(returnNode ? [returnNode] : []),
    ...(heartNode ? [heartNode] : []),
    ...neighbors,
  ];

  const seed = state.serendipitySeed;

  if (candidates.length === 0) {
    const aNodes = projection.nodesByCoordinate.get("A") ?? [];
    const fallback = aNodes[0] ?? current;
    return {
      from: current,
      to: fallback,
      toLetter: letterOf(projection, fallback),
      reason: "FALLBACK",
      serendipitySeed: seed,
      candidates: [fallback],
    };
  }

  // RETURN y HEART son invariantes: se resuelven sin variación.
  if (returnNode && candidates[0] === returnNode) {
    return {
      from: current,
      to: returnNode,
      toLetter: "Y",
      reason: "RETURN",
      serendipitySeed: seed,
      candidates,
    };
  }
  if (heartNode && candidates[0] === heartNode) {
    return {
      from: current,
      to: heartNode,
      toLetter: "M",
      reason: "HEART",
      serendipitySeed: seed,
      candidates,
    };
  }

  let chosen: string;
  let reason: ResolvedEdge["reason"];
  if (neighbors.length === 0) {
    chosen = candidates[0];
    reason = "CONNECTED";
  } else if (accessibility === "off" || accessibility === "reduced") {
    chosen = neighbors[0];
    reason = "CONNECTED";
  } else {
    const index = Math.min(Math.floor(seed * neighbors.length), neighbors.length - 1);
    chosen = neighbors[index];
    reason = index === 0 ? "CONNECTED" : "SERENDIPITY";
  }

  return {
    from: current,
    to: chosen,
    toLetter: letterOf(projection, chosen),
    reason,
    serendipitySeed: seed,
    candidates,
  };
}

/**
 * Simula un recorrido desde el estado actual hasta que se alcanza RETURN (Y)
 * o se agota el límite de pasos. Devuelve los bordes resueltos.
 */
export function simulateJourney(ctx: ResolverContext, maxSteps = 50): ResolvedEdge[] {
  const steps: ResolvedEdge[] = [];
  let cursor = ctx;
  for (let i = 0; i < maxSteps; i++) {
    const edge = resolveEdge(cursor);
    steps.push(edge);
    if (edge.reason === "RETURN") break;
    cursor = {
      ...cursor,
      currentNode: edge.to,
      state: {
        ...cursor.state,
        current: edge.toLetter ?? cursor.state.current,
        letterTrace: edge.toLetter
          ? [...cursor.state.letterTrace, edge.toLetter]
          : cursor.state.letterTrace,
        visitCounts: edge.toLetter
          ? {
              ...cursor.state.visitCounts,
              [edge.toLetter]: (cursor.state.visitCounts[edge.toLetter] ?? 0) + 1,
            }
          : cursor.state.visitCounts,
      },
    };
  }
  return steps;
}
