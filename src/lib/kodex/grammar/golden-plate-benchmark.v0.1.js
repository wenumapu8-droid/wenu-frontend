import { MICRO_UNIVERSE_GRAPH, MICRO_UNIVERSE_NODES } from '../micro-universe.js';
import { buildProtectedOcinActivationInput } from './protected-activation-adapter.js';

export const KDX_GOLDEN_PLATE_BENCHMARK_PROFILE = Object.freeze({
  version: 'golden-plate-benchmark-v0.1.2',
  status: 'IMPLEMENTED_CANDIDATE',
  plateCount: 12,
  domains: Object.freeze(['science', 'technology', 'art', 'consciousness']),
  runtimeDependency: false,
  purpose: 'Deterministic Assembly OS regression corpus; not canon promotion or deployment evidence.',
});

const SCENE_BY_PLATE = Object.freeze({
  KNOWLEDGE_PLATE: 'ARCHIVE',
  JUNCTION_PLATE: 'MACHINE',
  ACTIVATOR_PLATE: 'COSMOLOGY',
});

const NATURAL_PLATE_TYPE = Object.freeze({
  KNOWLEDGE: 'KNOWLEDGE_PLATE',
  JUNCTION: 'JUNCTION_PLATE',
  ACTIVATOR: 'ACTIVATOR_PLATE',
});

const ROUTE_ROLES = Object.freeze(['CONTINUITY', 'BRIDGE', 'ECHO', 'SERENDIPITY']);
const LIVING_FIELD_ACTIVATION_ID = 'KDX-FX-006';

function routeSlateFor(nodeId) {
  return (MICRO_UNIVERSE_GRAPH[nodeId] || []).slice(0, 4).map((target_node, index) => ({
    target_node,
    role: ROUTE_ROLES[index % ROUTE_ROLES.length],
  }));
}

function nodeInput(nodeId, plateType) {
  const node = MICRO_UNIVERSE_NODES[nodeId];
  if (!node) throw new Error(`Unknown golden benchmark node ${nodeId}`);
  const input = {
    node_id: node.id,
    title: node.title,
    scene_state: SCENE_BY_PLATE[plateType],
    observer_lens: node.lensAffinity?.[0] || 'NAKED_EYE',
    macro_signal: node.title,
    provenance_refs: [`repo:src/lib/kodex/micro-universe.js#${node.id}`],
    primary_payload: {
      payload_type: plateType === 'JUNCTION_PLATE' ? 'MAP' : 'CONCEPT',
      payload_ref: node.id,
      status: 'IMPLEMENTED_CANDIDATE',
    },
  };
  if (plateType === 'JUNCTION_PLATE') input.route_slate = routeSlateFor(nodeId);
  if (plateType === 'ACTIVATOR_PLATE' && node.artworkId) {
    const protectedInput = buildProtectedOcinActivationInput(node.artworkId);
    input.primary_payload = { ...protectedInput.primary_payload };
    input.artwork_contract = { ...protectedInput.artwork_contract };
    input.activation_profile = { ...protectedInput.activation_profile };
    input.provenance_refs = [...new Set([...input.provenance_refs, ...protectedInput.provenance_refs])];
  } else if (plateType === 'ACTIVATOR_PLATE') {
    input.primary_payload = {
      payload_type: 'FIELD',
      payload_ref: node.id,
      status: 'IMPLEMENTED_CANDIDATE',
    };
    input.artwork_contract = null;
    input.activation_profile = {
      activation_id: LIVING_FIELD_ACTIVATION_ID,
      explicit_action_required: true,
      environment_only: true,
    };
  }
  return input;
}

const CASE_BLUEPRINTS = Object.freeze([
  ['GP-SCI-01', 'science', 'SCI-BIOLOGY', 'seed-gp-sci-01'],
  ['GP-SCI-02', 'science', 'SCI-PATTERN', 'seed-gp-sci-02'],
  ['GP-SCI-03', 'science', 'SCI-COSMOS', 'seed-gp-sci-03'],
  ['GP-TECH-01', 'technology', 'TECH-NETWORK', 'seed-gp-tech-01'],
  ['GP-TECH-02', 'technology', 'TECH-MACHINE', 'seed-gp-tech-02'],
  ['GP-TECH-03', 'technology', 'TECH-CITY', 'seed-gp-tech-03'],
  ['GP-ART-01', 'art', 'ART-FORM', 'seed-gp-art-01'],
  ['GP-ART-02', 'art', 'ART-IMAGE', 'seed-gp-art-02'],
  ['GP-ART-03', 'art', 'ART-POETRY', 'seed-gp-art-03'],
  ['GP-CON-01', 'consciousness', 'CON-MIND', 'seed-gp-con-01'],
  ['GP-CON-02', 'consciousness', 'CON-OBSERVER', 'seed-gp-con-02'],
  ['GP-CON-03', 'consciousness', 'CON-RITUAL', 'seed-gp-con-03'],
]);

export const KDX_GOLDEN_PLATE_CASES = Object.freeze(CASE_BLUEPRINTS.map(([case_id, domain, nodeId, seed]) => {
  const natural = NATURAL_PLATE_TYPE[MICRO_UNIVERSE_NODES[nodeId].plate];
  return Object.freeze({
    case_id,
    domain,
    node_id: nodeId,
    plate_type: natural,
    seed,
    node: Object.freeze(nodeInput(nodeId, natural)),
  });
}));

export function getGoldenPlateBenchmarkSummary() {
  const byDomain = Object.fromEntries(KDX_GOLDEN_PLATE_BENCHMARK_PROFILE.domains.map((domain) => [domain, 0]));
  const byPlateType = {};
  for (const entry of KDX_GOLDEN_PLATE_CASES) {
    byDomain[entry.domain] += 1;
    byPlateType[entry.plate_type] = (byPlateType[entry.plate_type] || 0) + 1;
  }
  return Object.freeze({
    total: KDX_GOLDEN_PLATE_CASES.length,
    byDomain: Object.freeze(byDomain),
    byPlateType: Object.freeze(byPlateType),
    protectedArtworkActivators: KDX_GOLDEN_PLATE_CASES.filter((entry) => entry.node.artwork_contract).length,
    livingFieldActivators: KDX_GOLDEN_PLATE_CASES.filter((entry) => entry.plate_type === 'ACTIVATOR_PLATE' && entry.node.primary_payload?.payload_type === 'FIELD').length,
    activatorContractGap: null,
  });
}
