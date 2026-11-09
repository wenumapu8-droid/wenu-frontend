import { hashSeed } from './deep-navigation-engine.js';
import { buildMicroUniverseMemoryConstellation } from './memory-constellation.js';
import { createMicroUniverseState } from './micro-universe.js';
import { getNaturalLawPattern } from './grammar/natural-law-patterns.v0.1.js';

export const GEOMETRIC_MEMORY_SIGNATURE_PROFILE = Object.freeze({
  version: 'geometric-memory-signature-v0.1.0',
  status: 'IMPLEMENTED_CANDIDATE',
  role: 'DERIVED_MEMORY_MANIFESTATION',
  sourceAuthority: 'EXISTING_ROUTE_TRACE_AND_MEMORY_CONSTELLATION',
  createsParallelMemory: false,
  mutatesDeepNavigation: false,
  revealsUnvisitedNodes: false,
  scoresVisitor: false,
});

export const GEOMETRIC_MEMORY_TOPOLOGIES = Object.freeze([
  'SEED_POINT',
  'PATH',
  'SPIRAL_DESCENT',
  'BRANCH_TREE',
  'ORBIT_LOOP',
  'CONSTELLATION',
  'HYBRID_WEAVE',
]);

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const VIEWBOX_SIZE = 1000;
const CENTER = VIEWBOX_SIZE / 2;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const round = (value) => Math.round(value * 1000) / 1000;

function freezeRecord(record) {
  return Object.freeze({ ...record });
}

function visitSequence(state) {
  return (state.routeTrace || [])
    .filter((event) => event?.kind === 'VISIT_NODE' && event.nodeId)
    .map((event) => event.nodeId);
}

function graphMetrics(constellation, state) {
  const visits = visitSequence(state);
  const firstSeen = new Set();
  let closedReturnCount = 0;
  for (const nodeId of visits) {
    if (firstSeen.has(nodeId)) closedReturnCount += 1;
    firstSeen.add(nodeId);
  }

  const outgoing = new Map();
  for (const edge of constellation.edges) {
    if (!outgoing.has(edge.from)) outgoing.set(edge.from, new Set());
    outgoing.get(edge.from).add(edge.to);
  }
  const branchPointCount = [...outgoing.values()].filter((targets) => targets.size > 1).length;
  const fields = new Set(constellation.nodes.map((node) => node.field).filter(Boolean));

  return freezeRecord({
    visitedCount: constellation.visitedCount,
    totalVisits: constellation.totalVisits,
    edgeCount: constellation.edges.length,
    revisitCount: Math.max(0, constellation.totalVisits - constellation.visitedCount),
    closedReturnCount,
    branchPointCount,
    fieldCount: fields.size,
    depth: Math.max(0, Number(state.depth) || 0),
  });
}

export function classifyGeometricMemoryTopology(metrics) {
  if (!metrics || metrics.visitedCount <= 1) return 'SEED_POINT';
  if (metrics.revisitCount > 0 && metrics.branchPointCount > 0) return 'HYBRID_WEAVE';
  if (metrics.revisitCount > 0 || metrics.closedReturnCount > 0) return 'ORBIT_LOOP';
  if (metrics.branchPointCount > 0) return 'BRANCH_TREE';
  if (metrics.fieldCount >= 3 && metrics.visitedCount >= 4) return 'CONSTELLATION';
  if (metrics.depth >= 3 && metrics.visitedCount >= 3) return 'SPIRAL_DESCENT';
  return 'PATH';
}

function pathLayout(nodes) {
  const count = Math.max(1, nodes.length);
  return nodes.map((node, index) => {
    const t = count === 1 ? 0.5 : index / (count - 1);
    return {
      ...node,
      x: round(120 + t * 760),
      y: round(500 + Math.sin(t * Math.PI * 1.5) * 120),
    };
  });
}

function orbitLayout(nodes, routeSignature) {
  const count = Math.max(1, nodes.length);
  const phase = (hashSeed(routeSignature) % 360) * (Math.PI / 180);
  const radius = clamp(210 + count * 12, 220, 350);
  return nodes.map((node, index) => {
    const angle = phase + (Math.PI * 2 * index) / count;
    return {
      ...node,
      x: round(CENTER + Math.cos(angle) * radius),
      y: round(CENTER + Math.sin(angle) * radius),
    };
  });
}

function spiralLayout(nodes, routeSignature, compact = false) {
  const phase = (hashSeed(routeSignature) % 6283) / 1000;
  const step = compact ? 42 : 58;
  return nodes.map((node, index) => {
    const radius = 40 + Math.sqrt(index + 1) * step;
    const angle = phase + index * GOLDEN_ANGLE;
    return {
      ...node,
      x: round(CENTER + Math.cos(angle) * radius),
      y: round(CENTER + Math.sin(angle) * radius),
    };
  });
}

function constellationLayout(nodes, routeSignature) {
  const phase = (hashSeed(routeSignature) % 6283) / 1000;
  const count = Math.max(1, nodes.length);
  return nodes.map((node, index) => {
    const normalized = Math.sqrt((index + 1) / (count + 1));
    const radius = 85 + normalized * 315;
    const nodePhase = (hashSeed(node.id) % 97) / 97;
    const angle = phase + index * GOLDEN_ANGLE + nodePhase * 0.24;
    return {
      ...node,
      x: round(CENTER + Math.cos(angle) * radius),
      y: round(CENTER + Math.sin(angle) * radius),
    };
  });
}

function branchLayout(nodes) {
  const count = Math.max(1, nodes.length);
  return nodes.map((node, index) => {
    const level = index;
    const side = index === 0 ? 0 : ((hashSeed(`${node.id}:${node.field}`) % 2001) / 1000) - 1;
    return {
      ...node,
      x: round(CENTER + side * clamp(90 + level * 42, 90, 330)),
      y: round(100 + (count === 1 ? 400 : (index / (count - 1)) * 800)),
    };
  });
}

function layoutNodes(constellation, topology, routeSignature) {
  const baseNodes = constellation.nodes.map((node) => ({
    id: node.id,
    title: node.title,
    field: node.field,
    visits: node.visits,
    isCurrent: node.isCurrent,
    firstTraceIndex: node.firstTraceIndex,
    radius: clamp(11 + node.visits * 4, 15, 31),
  }));

  switch (topology) {
    case 'SEED_POINT':
      return baseNodes.map((node) => ({ ...node, x: CENTER, y: CENTER }));
    case 'ORBIT_LOOP':
      return orbitLayout(baseNodes, routeSignature);
    case 'BRANCH_TREE':
      return branchLayout(baseNodes);
    case 'CONSTELLATION':
      return constellationLayout(baseNodes, routeSignature);
    case 'SPIRAL_DESCENT':
      return spiralLayout(baseNodes, routeSignature);
    case 'HYBRID_WEAVE':
      return spiralLayout(baseNodes, routeSignature, true);
    case 'PATH':
    default:
      return pathLayout(baseNodes);
  }
}

function topologyPatternIds(topology) {
  switch (topology) {
    case 'SPIRAL_DESCENT': return ['NESTED_RECURSION', 'PHYLLOTAXIS_SPACING'];
    case 'BRANCH_TREE': return ['STOCHASTIC_BRANCHING'];
    case 'CONSTELLATION': return ['PHYLLOTAXIS_SPACING'];
    case 'HYBRID_WEAVE': return ['NESTED_RECURSION', 'PHYLLOTAXIS_SPACING'];
    case 'ORBIT_LOOP': return ['NESTED_RECURSION'];
    case 'PATH': return ['DEEP_REPRESENTATION_COMPRESSION'];
    case 'SEED_POINT':
    default: return ['DEEP_REPRESENTATION_COMPRESSION'];
  }
}

function buildPatternTrace(topology) {
  return Object.freeze(topologyPatternIds(topology).map((id) => {
    const pattern = getNaturalLawPattern(id);
    return freezeRecord({
      id,
      evidence_class: pattern?.evidence_class || 'NEEDS_CONFIRMATION',
      source_scope: pattern?.source_scope || null,
      prohibited_inferences: Object.freeze([...(pattern?.prohibited_inferences || [])]),
    });
  }));
}

function signatureId({ routeSignature, topology, metrics, nodes, edges }) {
  const payload = JSON.stringify({
    routeSignature,
    topology,
    metrics,
    nodes: nodes.map(({ id, x, y, visits, isCurrent }) => [id, x, y, visits, isCurrent]),
    edges: edges.map(({ from, to, role, order }) => [from, to, role, order]),
  });
  return `KDX-MEM-${hashSeed(payload).toString(36).toUpperCase()}`;
}

export function buildGeometricMemorySignature(stateInput = {}) {
  const state = createMicroUniverseState(stateInput);
  const constellation = buildMicroUniverseMemoryConstellation(state);
  const metrics = graphMetrics(constellation, state);
  const topology = classifyGeometricMemoryTopology(metrics);
  const nodes = layoutNodes(constellation, topology, state.routeSignature)
    .map((node) => freezeRecord(node));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = constellation.edges
    .filter((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to))
    .map((edge, order) => freezeRecord({ from: edge.from, to: edge.to, role: edge.role || null, order }));
  const patterns = buildPatternTrace(topology);
  const id = signatureId({ routeSignature: state.routeSignature, topology, metrics, nodes, edges });

  return Object.freeze({
    version: GEOMETRIC_MEMORY_SIGNATURE_PROFILE.version,
    id,
    topology,
    routeSignature: state.routeSignature,
    currentNodeId: state.currentNodeId,
    metrics,
    patterns,
    nodes: Object.freeze(nodes),
    edges: Object.freeze(edges),
    viewBox: Object.freeze({ x: 0, y: 0, width: VIEWBOX_SIZE, height: VIEWBOX_SIZE }),
    revealsUnvisitedNodes: false,
    mutatesRouteState: false,
    mutatesMemoryState: false,
    creatorVerdict: 'NOT_RUN',
  });
}
