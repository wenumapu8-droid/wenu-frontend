import {
  MICRO_UNIVERSE_NODES,
  createMicroUniverseState,
  enterMicroUniverseNode,
} from './micro-universe.js';

/**
 * KODEX−∞ · MEMORY CONSTELLATION
 *
 * Smallest orientation model for the deep-navigation lab.
 * It exposes visited nodes only; it never reveals unseen graph topology.
 * This is route memory, not user profiling or an engagement score.
 */
export const MEMORY_CONSTELLATION_VERSION = 'memory-constellation-v0.1.0';

function visitEvents(state) {
  return (state.routeTrace || []).filter(
    (event) => event?.kind === 'VISIT_NODE' && MICRO_UNIVERSE_NODES[event.nodeId],
  );
}

export function buildMicroUniverseMemoryConstellation(stateInput = {}) {
  const state = createMicroUniverseState(stateInput);
  const visits = visitEvents(state);
  const nodeMap = new Map();
  const edges = [];
  let pendingChoice = null;
  let previousVisit = null;

  for (let traceIndex = 0; traceIndex < state.routeTrace.length; traceIndex += 1) {
    const event = state.routeTrace[traceIndex];
    if (event?.kind === 'CHOOSE_ROUTE' && MICRO_UNIVERSE_NODES[event.nodeId]) {
      pendingChoice = { nodeId: event.nodeId, role: event.role || null };
      continue;
    }
    if (event?.kind !== 'VISIT_NODE' || !MICRO_UNIVERSE_NODES[event.nodeId]) continue;

    const node = MICRO_UNIVERSE_NODES[event.nodeId];
    const existing = nodeMap.get(event.nodeId);
    if (!existing) {
      nodeMap.set(event.nodeId, {
        id: event.nodeId,
        title: node.title,
        field: node.field,
        firstTraceIndex: traceIndex,
        lastTraceIndex: traceIndex,
        visits: 1,
        isCurrent: event.nodeId === state.currentNodeId,
      });
    } else {
      existing.lastTraceIndex = traceIndex;
      existing.visits += 1;
      existing.isCurrent = event.nodeId === state.currentNodeId;
    }

    if (previousVisit) {
      edges.push({
        from: previousVisit.nodeId,
        to: event.nodeId,
        role: pendingChoice?.nodeId === event.nodeId ? pendingChoice.role : null,
      });
    }
    previousVisit = event;
    pendingChoice = null;
  }

  const nodes = [...nodeMap.values()]
    .map((item) => ({ ...item, isCurrent: item.id === state.currentNodeId }))
    .sort((a, b) => a.firstTraceIndex - b.firstTraceIndex);

  return Object.freeze({
    version: MEMORY_CONSTELLATION_VERSION,
    currentNodeId: state.currentNodeId,
    visitedCount: nodes.length,
    totalVisits: visits.length,
    nodes: Object.freeze(nodes.map(Object.freeze)),
    edges: Object.freeze(edges.map(Object.freeze)),
    revealsUnvisitedNodes: false,
  });
}

export function revisitKnownMicroUniverseNode(stateInput = {}, nodeId) {
  const state = createMicroUniverseState(stateInput);
  const constellation = buildMicroUniverseMemoryConstellation(state);
  const known = constellation.nodes.some((node) => node.id === nodeId);
  if (!known || nodeId === state.currentNodeId) return state;
  return enterMicroUniverseNode(state, nodeId, 'ECHO');
}
