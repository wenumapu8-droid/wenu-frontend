import elementRegistry from './kdx_element_registry.v0.1.json' with { type: 'json' };
import { hashSeed } from '../deep-navigation-engine.js';

export const KDX_ASSEMBLER_PROFILE = Object.freeze({
  version: 'deterministic-assembler-v0.1.0',
  status: 'IMPLEMENTED_CANDIDATE',
  registryVersion: elementRegistry.registry_version,
  deterministic: true,
  inventsElementIds: false,
});

const PLATE_TYPES = Object.freeze(['KNOWLEDGE_PLATE', 'JUNCTION_PLATE', 'ACTIVATOR_PLATE']);
const BLOCKED_ELEMENT_STATUSES = new Set(['HOLD', 'DEPRECATED', 'REJECT_FOR_NOW']);
const ASSEMBLY_ELEMENT_STATUSES = new Set(['PRODUCTION_CANDIDATE', 'IMPLEMENTED_CANDIDATE', 'VERIFIED', 'CANONICAL']);
const ROUTE_ROLES = new Set(['CONTINUITY', 'BRIDGE', 'ECHO', 'SERENDIPITY', 'RETURN']);
const LENSES = new Set(['MICROSCOPE', 'MAGNIFIER', 'NAKED_EYE', 'SYSTEM', 'TELEPHOTO', 'SATELLITE', 'TELESCOPE', 'META']);
const PAYLOAD_TYPES = new Set(['CONCEPT', 'ARTWORK', 'DIAGRAM', 'DOCUMENT', 'OBJECT', 'FIELD', 'MAP', 'TYPE']);
const PAYLOAD_STATUSES = new Set(['VERIFIED', 'CANONICAL', 'CANON_CANDIDATE', 'IMPLEMENTED_CANDIDATE', 'NEEDS_CONFIRMATION']);
const COPY_ROLES = new Set(['MACRO_SIGNAL', 'TITLE', 'DECK', 'BODY', 'LABEL', 'EVIDENCE', 'CAPTION', 'CTA', 'TELEMETRY', 'SOURCE_NOTE']);
const COPY_STATUSES = new Set(['VERIFIED', 'CANONICAL', 'CANON_CANDIDATE', 'PROPOSED', 'NEEDS_CONFIRMATION']);

const PLATE_CONFIG = Object.freeze({
  KNOWLEDGE_PLATE: Object.freeze({
    slotId: 'composition',
    candidateFamilies: Object.freeze(['GRID']),
    candidateSlotTypes: Object.freeze(['MACRO_COMPOSITION', 'PRIMARY_PAYLOAD', 'SYSTEM_MAP', 'STATE_SEQUENCE', 'EVIDENCE_RAIL']),
    communicationMode: 'EDITORIAL',
    defaultPayloadType: 'CONCEPT',
  }),
  JUNCTION_PLATE: Object.freeze({
    slotId: 'composition',
    candidateFamilies: Object.freeze(['GRID']),
    candidateSlotTypes: Object.freeze(['SYSTEM_MAP', 'ROUTE', 'STATE_QUADRANTS', 'CONTROL', 'PRIMARY_PORTAL', 'SECONDARY_PORTAL']),
    communicationMode: 'ROUTE',
    defaultPayloadType: 'MAP',
  }),
  ACTIVATOR_PLATE: Object.freeze({
    slotId: 'environment',
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
const nodeIdOf = (node) => node?.node_id || node?.id || null;

function assertInput(node, plateType, seed) {
  const nodeId = nodeIdOf(node);
  if (!node || typeof node !== 'object') throw new KdxAssemblyError('INVALID_NODE', 'Assembler requires a node object.');
  if (!nodeId) throw new KdxAssemblyError('MISSING_NODE_ID', 'Node must expose node_id or id.');
  if (!PLATE_TYPES.includes(plateType)) throw new KdxAssemblyError('INVALID_PLATE_TYPE', `Unsupported plate type: ${plateType}`, { plateType });
  if (seed === undefined || seed === null || seed === '') throw new KdxAssemblyError('MISSING_SEED', 'Deterministic assembly requires an explicit seed.');
  if (!node.scene_state) throw new KdxAssemblyError('MISSING_SCENE_STATE', 'Node must declare scene_state for scene compatibility gates.', { nodeId });
  if (!Array.isArray(node.provenance_refs) || unique(node.provenance_refs).length === 0) {
    throw new KdxAssemblyError('MISSING_PROVENANCE', 'Node must carry at least one provenance_ref before assembly.', { nodeId });
  }
  if (node.observer_lens && !LENSES.has(node.observer_lens)) {
    throw new KdxAssemblyError('INVALID_OBSERVER_LENS', `Unsupported observer lens: ${node.observer_lens}`, { nodeId });
  }
}

function elementPassesHardGates(element, plateType, sceneState) {
  if (!element || BLOCKED_ELEMENT_STATUSES.has(element.status) || !ASSEMBLY_ELEMENT_STATUSES.has(element.status)) return false;
  if (element.provenance?.status !== 'VERIFIED' || element.rights !== 'PROJECT_SOURCE') return false;
  if (!element.allowed_plate_types?.includes(plateType) || !element.allowed_scene_roles?.includes(sceneState)) return false;
  return element.accessibility?.meaning_preserved_without_motion === true;
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
    throw new KdxAssemblyError('INVALID_ROUTE_BOUNDS', 'JUNCTION_PLATE requires 2–5 prevalidated route choices.', { nodeId: nodeIdOf(node), routeCount: routes.length });
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
  if (!art.artwork_id || !activation.activation_id || activation.environment_only !== true) {
    throw new KdxAssemblyError('ACTIVATION_CONTRACT_BLOCK', 'Activator requires artwork_id, activation_id and environment_only activation.', { nodeId: nodeIdOf(node) });
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

function normalizePayload(node, plateType, artworkContract) {
  const fallback = {
    payload_type: PLATE_CONFIG[plateType].defaultPayloadType,
    payload_ref: plateType === 'JUNCTION_PLATE' ? `ROUTE-${nodeIdOf(node)}` : nodeIdOf(node),
    status: 'IMPLEMENTED_CANDIDATE',
  };
  const payload = plateType === 'ACTIVATOR_PLATE'
    ? { payload_type: 'ARTWORK', payload_ref: artworkContract.artwork_id, status: node.primary_payload?.status || fallback.status }
    : (node.primary_payload ? { ...node.primary_payload } : fallback);
  if (!PAYLOAD_TYPES.has(payload.payload_type) || !payload.payload_ref || !PAYLOAD_STATUSES.has(payload.status)) {
    throw new KdxAssemblyError('INVALID_PRIMARY_PAYLOAD', 'Primary payload does not satisfy PlateSpec payload contract.', { payload, nodeId: nodeIdOf(node) });
  }
  return payload;
}

function normalizeCopySlots(node) {
  const slots = Array.isArray(node.copy_slots) ? node.copy_slots : [];
  return slots.map((slot) => {
    if (!COPY_ROLES.has(slot?.role) || !slot?.source_ref || !COPY_STATUSES.has(slot?.status)) {
      throw new KdxAssemblyError('INVALID_COPY_SLOT', 'Copy slots must retain a registered role, source_ref and explicit status.', { slot, nodeId: nodeIdOf(node) });
    }
    return { role: slot.role, source_ref: slot.source_ref, status: slot.status };
  });
}

function pickMotion(node, plateType, seed, compositionElement) {
  if (node.allow_motion === false || compositionElement.family === 'EFFECT') return null;
  const candidates = stableCandidates({
    plateType,
    sceneState: node.scene_state,
    families: ['MOTION'],
    slotTypes: ['MOTION_PROFILE'],
  });
  return chooseDeterministically(candidates, `${seed}|${nodeIdOf(node)}|${plateType}|motion`);
}

export function assemblePlateSpec(node, plateType, seed) {
  assertInput(node, plateType, seed);
  const nodeId = nodeIdOf(node);
  const config = PLATE_CONFIG[plateType];
  const { artworkContract, activationProfile } = normalizeArtwork(node, plateType);
  const routeSlate = normalizeRouteSlate(node, plateType);
  const primaryPayload = normalizePayload(node, plateType, artworkContract);
  const copySlots = normalizeCopySlots(node);

  const compositionCandidates = stableCandidates({
    plateType,
    sceneState: node.scene_state,
    families: config.candidateFamilies,
    slotTypes: config.candidateSlotTypes,
  });
  const compositionElement = chooseDeterministically(compositionCandidates, `${seed}|${nodeId}|${plateType}|${config.slotId}`);
  if (!compositionElement) {
    throw new KdxAssemblyError('NO_SAFE_ELEMENT', 'No registered element survives status/rights/provenance/scene/plate/slot gates.', {
      nodeId, plateType, sceneState: node.scene_state, slotId: config.slotId, candidateFamilies: config.candidateFamilies,
    });
  }
  const resolvedSlotType = config.candidateSlotTypes.find((slotType) => compositionElement.slot_types?.includes(slotType));
  if (!resolvedSlotType) {
    throw new KdxAssemblyError('SLOT_COMPATIBILITY_BLOCK', 'Selected element does not expose a compatible slot type.', { elementId: compositionElement.element_id, nodeId, plateType });
  }

  const motionElement = pickMotion(node, plateType, seed, compositionElement);
  const movingElements = [compositionElement.family === 'EFFECT' ? compositionElement : null, motionElement].filter(Boolean);
  const motionIds = unique(movingElements.map((element) => element.element_id));
  const selectedIds = unique([compositionElement.element_id, ...motionIds]);
  const selectedFamilies = unique([compositionElement.family, motionElement?.family]);
  const highPriorityCount = movingElements.filter((element) => element.motion_cost === 'HIGH').length;
  if (highPriorityCount > 2) {
    throw new KdxAssemblyError('MOTION_BUDGET_BLOCK', 'Assembly exceeds the <=2 high-priority motion invariant.', { selectedIds, highPriorityCount });
  }

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
    primary_payload: primaryPayload,
    macro_signal: String(node.macro_signal || node.title || nodeId).slice(0, 120),
    slots: [{ slot_id: config.slotId, slot_type: resolvedSlotType, required: true, element_id: compositionElement.element_id }],
    allowed_element_families: selectedFamilies,
    artwork_contract: artworkContract,
    copy_slots: copySlots,
    motion_profile: { element_ids: motionIds, high_priority_count: highPriorityCount },
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
    return { ok: false, spec: null, error: { code: error.code, message: error.message, details: error.details } };
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
