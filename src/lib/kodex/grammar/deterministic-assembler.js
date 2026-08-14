import elementRegistry from './kdx_element_registry.v0.1.json' with { type: 'json' };
import { hashSeed } from '../deep-navigation-engine.js';

export const KDX_ASSEMBLER_PROFILE = Object.freeze({
  version: 'deterministic-assembler-v0.1.0',
  status: 'IMPLEMENTED_CANDIDATE',
  registryVersion: elementRegistry.registry_version,
  deterministic: true,
  inventsElementIds: false,
});

const PLATE_TYPES = Object.freeze([
  'KNOWLEDGE_PLATE',
  'JUNCTION_PLATE',
  'ACTIVATOR_PLATE',
]);

const BLOCKED_ELEMENT_STATUSES = new Set(['HOLD', 'DEPRECATED', 'REJECT_FOR_NOW']);
const ASSEMBLY_ELEMENT_STATUSES = new Set(['PRODUCTION_CANDIDATE', 'IMPLEMENTED_CANDIDATE', 'VERIFIED', 'CANONICAL']);
const ROUTE_ROLES = new Set(['CONTINUITY', 'BRIDGE', 'ECHO', 'SERENDIPITY', 'RETURN']);
const LENSES = new Set(['MICROSCOPE', 'MAGNIFIER', 'NAKED_EYE', 'SYSTEM', 'TELEPHOTO', 'SATELLITE', 'TELESCOPE', 'META']);

const PLATE_CONFIG = Object.freeze({
  KNOWLEDGE_PLATE: Object.freeze({
    slotId: 'composition',
    slotType: 'MACRO_COMPOSITION',
    candidateFamilies: Object.freeze(['GRID']),
    candidateSlotTypes: Object.freeze(['MACRO_COMPOSITION', 'PRIMARY_PAYLOAD', 'SYSTEM_MAP', 'STATE_SEQUENCE', 'EVIDENCE_RAIL']),
    communicationMode: 'EDITORIAL',
    defaultPayloadType: 'CONCEPT',
  }),
  JUNCTION_PLATE: Object.freeze({
    slotId: 'composition',
    slotType: 'SYSTEM_MAP',
    candidateFamilies: Object.freeze(['GRID']),
    candidateSlotTypes: Object.freeze(['SYSTEM_MAP', 'ROUTE', 'STATE_QUADRANTS', 'CONTROL', 'PRIMARY_PORTAL', 'SECONDARY_PORTAL']),
    communicationMode: 'ROUTE',
    defaultPayloadType: 'MAP',
  }),
  ACTIVATOR_PLATE: Object.freeze({
    slotId: 'environment',
    slotType: 'TRANSFORMATION_FIELD',
    candidateFamilies: Object.freeze(['EFFECT', 'GRID']),
    candidateSlotTypes: Object.freeze(['TRANSFORMATION_FIELD', 'PORTAL_FIELD', 'BACKGROUND_FIELD', 'PRIMARY_PORTAL', 'PRIMARY_PAYLOAD']),
    communicationMode: 'AUTHORIAL',
    defaultPayloadType: 'ARTWORK',
  }),
});

const BASE_QA = Object.freeze([
  'SCHEMA', 'PROVENANCE', 'RIGHTS', '100DVH', 'NO_PAGE_SCROLL', 'MOBILE',
  'KEYBOARD', 'FOCUS', 'REDUCED_MOTION', 'NO_WEBGL_FALLBACK', 'PERFORMANCE', 'DETERMINISM',
]);

export class KdxAssemblyError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'KdxAssemblyError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

const cleanId = (value) => String(value || '')
  .toUpperCase()
  .replace(/[^A-Z0-9_-]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 64);

const unique = (values) => [...new Set((values || []).filter(Boolean))];

function nodeIdOf(node) {
  return node?.node_id || node?.id || null;
}

function assertInput(node, plateType, seed) {
  const nodeId = nodeIdOf(node);
  if (!node || typeof node !== 'object') {
    throw new KdxAssemblyError('INVALID_NODE', 'Assembler requires a node object.');
  }
  if (!nodeId) {
    throw new KdxAssemblyError('MISSING_NODE_ID', 'Node must expose node_id or id.');
  }
  if (!PLATE_TYPES.includes(plateType)) {
    throw new KdxAssemblyError('INVALID_PLATE_TYPE', `Unsupported plate type: ${plateType}`, { plateType });
  }
  if (seed === undefined || seed === null || seed === '') {
    throw new KdxAssemblyError('MISSING_SEED', 'Deterministic assembly requires an explicit seed.');
  }
  if (!node.scene_state) {
    throw new KdxAssemblyError('MISSING_SCENE_STATE', 'Node must declare scene_state for scene compatibility gates.', { nodeId });
  }
  if (!Array.isArray(node.provenance_refs) || node.provenance_refs.length === 0) {
    throw new KdxAssemblyError('MISSING_PROVENANCE', 'Node must carry at least one provenance_ref before assembly.', { nodeId });
  }
  if (node.observer_lens && !LENSES.has(node.observer_lens)) {
    throw new KdxAssemblyError('INVALID_OBSERVER_LENS', `Unsupported observer lens: ${node.observer_lens}`, { nodeId });
  }
}

function elementPassesHardGates(element, plateType, sceneState) {
  if (!element || BLOCKED_ELEMENT_STATUSES.has(element.status)) return false;
  if (!ASSEMBLY_ELEMENT_STATUSES.has(element.status)) return false;
  if (element.provenance?.status !== 'VERIFIED') return false;
  if (element.rights !== 'PROJECT_SOURCE') return false;
  if (!element.allowed_plate_types?.includes(plateType)) return false;
  if (!element.allowed_scene_roles?.includes(sceneState)) return false;
  if (element.accessibility?.meaning_preserved_without_motion !== true) return false;
  return true;
}

function stableCandidates({ plateType, sceneState, families, slotTypes }) {
  return elementRegistry.elements
    .filter((element) => elementPassesHardGates(element, plateType, sceneState))
    .filter((element) => families.includes(element.family))
    .filter((element) => element.slot_types?.some((slotType) => slotTypes.includes(slotType)))
    .sort((a, b) => a.element_id.localeCompare(b.element_id));
}

function chooseDeterministically(candidates, seedMaterial) {
  if (candidates.length === 0) return null;
  return candidates[hashSeed(seedMaterial) % candidates.length];
}

function normalizeRouteSlate(node, plateType) {
  const routes = Array.isArray(node.route_slate) ? node.route_slate : [];
  if (plateType !== 'JUNCTION_PLATE') {
    return routes.slice(0, 5).filter((route) => route?.target_node && ROUTE_ROLES.has(route.role));
  }
  if (routes.length < 2 || routes.length > 5) {
    throw new KdxAssemblyError('INVALID_ROUTE_BOUNDS', 'JUNCTION_PLATE requires 2–5 prevalidated route choices.', {
      nodeId: nodeIdOf(node),
      routeCount: routes.length,
    });
  }
  for (const route of routes) {
    if (!route?.target_node || !ROUTE_ROLES.has(route.role)) {
      throw new KdxAssemblyError('INVALID_ROUTE_RECORD', 'Junction route records require target_node and a registered route role.', { route });
    }
  }
  return routes.map(({ target_node, role }) => ({ target_node, role }));
}

function normalizeArtwork(node, plateType) {
  if (plateType !== 'ACTIVATOR_PLATE') return { artworkContract: null, activationProfile: null };
  const art = node.artwork_contract;
  const activation = node.activation_profile;
  if (!art || !activation) {
    throw new KdxAssemblyError('ACTIVATOR_CONTRACT_REQUIRED', 'ACTIVATOR_PLATE requires pre-existing artwork_contract and activation_profile.', { nodeId: nodeIdOf(node) });
  }
  const integrityOk = art.full_view_required === true
    && art.preserve_aspect === true
    && art.crop_allowed === false
    && art.recolor_source_allowed === false
    && art.distort_source_allowed === false;
  if (!integrityOk) {
    throw new KdxAssemblyError('ARTWORK_INTEGRITY_BLOCK', 'Protected artwork contract violates full-view/no-crop/source-integrity gates.', { artworkId: art.artwork_id });
  }
  if (!art.artwork_id || activation.environment_only !== true) {
    throw new KdxAssemblyError('ACTIVATION_CONTRACT_BLOCK', 'Activator requires artwork_id and environment_only activation.', { nodeId: nodeIdOf(node) });
  }
  return {
    artworkContract: {
      artwork_id: art.artwork_id,
      full_view_required: true,
      preserve_aspect: true,
      crop_allowed: false,
      recolor_source_allowed: false,
      distort_source_allowed: false,
      source_bytes_renderable: art.source_bytes_renderable === true,
    },
    activationProfile: {
      activation_id: activation.activation_id,
      explicit_action_required: activation.explicit_action_required !== false,
      environment_only: true,
    },
  };
}

function payloadFor(node, plateType, artworkContract) {
  if (plateType === 'ACTIVATOR_PLATE') {
    return {
      payload_type: 'ARTWORK',
      payload_ref: artworkContract.artwork_id,
      status: node.primary_payload?.status || 'IMPLEMENTED_CANDIDATE',
    };
  }
  if (node.primary_payload) return { ...node.primary_payload };
  const nodeId = nodeIdOf(node);
  return {
    payload_type: PLATE_CONFIG[plateType].defaultPayloadType,
    payload_ref: plateType === 'JUNCTION_PLATE' ? `ROUTE-${nodeId}` : nodeId,
    status: 'IMPLEMENTED_CANDIDATE',
  };
}

function pickMotion(node, plateType, seed, compositionElement) {
  // One living behavior at most in this P0 assembler. If the required element is
  // itself a moving EFFECT, do not stack an additional motion preset.
  if (node.allow_motion === false || compositionElement.family === 'EFFECT') return null;
  const candidates = stableCandidates({
    plateType,
    sceneState: node.scene_state,
    families: ['MOTION'],
    slotTypes: ['MOTION_PROFILE'],
  }).filter((element) => !element.incompatibilities?.includes(compositionElement.element_id));
  return chooseDeterministically(candidates, `${seed}|${nodeIdOf(node)}|${plateType}|motion`);
}

export function assemblePlateSpec(node, plateType, seed) {
  assertInput(node, plateType, seed);
  const nodeId = nodeIdOf(node);
  const config = PLATE_CONFIG[plateType];
  const { artworkContract, activationProfile } = normalizeArtwork(node, plateType);
  const routeSlate = normalizeRouteSlate(node, plateType);

  const compositionCandidates = stableCandidates({
    plateType,
    sceneState: node.scene_state,
    families: config.candidateFamilies,
    slotTypes: config.candidateSlotTypes,
  });
  const compositionElement = chooseDeterministically(
    compositionCandidates,
    `${seed}|${nodeId}|${plateType}|${config.slotId}`,
  );
  if (!compositionElement) {
    throw new KdxAssemblyError('NO_SAFE_ELEMENT', 'No registered element survives status/rights/provenance/scene/plate/slot gates.', {
      nodeId,
      plateType,
      sceneState: node.scene_state,
      slotId: config.slotId,
      candidateFamilies: config.candidateFamilies,
    });
  }

  const motionElement = pickMotion(node, plateType, seed, compositionElement);
  const selectedIds = unique([compositionElement.element_id, motionElement?.element_id]);
  const selectedFamilies = unique([compositionElement.family, motionElement?.family]);
  const highPriorityCount = motionElement?.motion_cost === 'HIGH' ? 1 : 0;
  const shortType = plateType.replace('_PLATE', '');
  const plateHash = hashSeed(`${seed}|${nodeId}|${plateType}`).toString(16).toUpperCase().padStart(8, '0');

  const spec = {
    plate_id: `KDX-PLATE-${cleanId(nodeId)}-${shortType}-${plateHash}`,
    plate_type: plateType,
    version: '0.1.0',
    seed,
    scene_state: node.scene_state,
    semantic_node: nodeId,
    observer_lens: node.observer_lens || 'NAKED_EYE',
    communication_mode: node.communication_mode || config.communicationMode,
    primary_payload: payloadFor(node, plateType, artworkContract),
    macro_signal: String(node.macro_signal || node.title || nodeId).slice(0, 120),
    slots: [{
      slot_id: config.slotId,
      slot_type: config.slotType,
      required: true,
      element_id: compositionElement.element_id,
    }],
    allowed_element_families: selectedFamilies,
    artwork_contract: artworkContract,
    copy_slots: Array.isArray(node.copy_slots) ? node.copy_slots.map((slot) => ({ ...slot })) : [],
    motion_profile: {
      element_ids: motionElement ? [motionElement.element_id] : [],
      high_priority_count: highPriorityCount,
    },
    activation_profile: activationProfile,
    route_slate: routeSlate,
    provenance_refs: unique(node.provenance_refs),
    responsive_profile: {
      desktop: 'registered composition contract',
      mobile: 'recompose hierarchy; preserve semantic payload',
      primary_shell: '100dvh',
    },
    fallback_profile: {
      reduced_motion: 'static semantic state; no motion-required meaning',
      no_webgl: 'DOM/SVG/static registered fallback',
    },
    qa_requirements: unique([
      ...BASE_QA,
      ...(plateType === 'JUNCTION_PLATE' ? ['ROUTE_BOUNDS'] : []),
      ...(plateType === 'ACTIVATOR_PLATE' ? ['NO_CROP'] : []),
    ]),
  };

  // Guard against future registry drift silently turning a selected ID invalid.
  for (const elementId of selectedIds) {
    const selected = elementRegistry.elements.find((element) => element.element_id === elementId);
    if (!selected || !elementPassesHardGates(selected, plateType, node.scene_state)) {
      throw new KdxAssemblyError('REGISTRY_DRIFT_BLOCK', 'Selected element no longer satisfies hard assembly gates.', { elementId, nodeId, plateType });
    }
  }

  return Object.freeze(spec);
}

export function tryAssemblePlateSpec(node, plateType, seed) {
  try {
    return { ok: true, spec: assemblePlateSpec(node, plateType, seed), error: null };
  } catch (error) {
    if (!(error instanceof KdxAssemblyError)) throw error;
    return {
      ok: false,
      spec: null,
      error: { code: error.code, message: error.message, details: error.details },
    };
  }
}

export function getAssemblyEligibleElementIds(node, plateType) {
  assertInput(node, plateType, '__eligibility__');
  const config = PLATE_CONFIG[plateType];
  return stableCandidates({
    plateType,
    sceneState: node.scene_state,
    families: config.candidateFamilies,
    slotTypes: config.candidateSlotTypes,
  }).map((element) => element.element_id);
}
