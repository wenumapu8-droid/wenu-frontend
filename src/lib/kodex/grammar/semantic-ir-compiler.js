import { assemblePlateSpec } from './deterministic-assembler.js';
import {
  KDX_GEOMETRIC_EVIDENCE_CLASSES,
  KDX_GEOMETRIC_PRIMITIVE_BY_ID,
} from './geometric-transduction-registry.v0.1.js';

export const KDX_SEMANTIC_IR_PROFILE = Object.freeze({
  version: 'semantic-ir-v0.1.1',
  status: 'IMPLEMENTED_CANDIDATE',
  role: 'PRE_ASSEMBLY_ADAPTER',
  createsParallelRuntime: false,
  mutatesAssemblyOS: false,
  geometryRole: 'OPTIONAL_SEMANTIC_TRACE',
});

const PLATE_TYPES = new Set(['KNOWLEDGE_PLATE', 'JUNCTION_PLATE', 'ACTIVATOR_PLATE']);
const EPISTEMIC_STATUSES = new Set(['VERIFIED', 'CANONICAL', 'CANON_CANDIDATE', 'INFERRED', 'SPECULATIVE', 'NEEDS_CONFIRMATION']);
const OPERATORS = new Set([
  'MANIFEST', 'OBSERVE', 'REVEAL', 'RELATE', 'APPROACH', 'CROSS',
  'DIVERGE', 'CONVERGE', 'MUTATE', 'ERODE', 'INHERIT', 'RECONSTRUCT', 'RETURN',
]);
const DEPTH_TYPES = new Set(['MATERIAL', 'INFORMATION', 'LINEAGE', 'SYSTEMIC', 'COSMOLOGICAL', 'EPISTEMIC', 'META']);
const MEMORY_EFFECTS = new Set(['NONE', 'TRACE', 'RESIDUE', 'INHERITANCE', 'ROUTE_SIGNATURE', 'RECONSTRUCTION']);
const RETURN_EFFECTS = new Set(['UNCHANGED', 'TRACE_VISIBLE', 'RETURNED_FORM', 'THRESHOLD_PRIME']);
const GEOMETRIC_EVIDENCE_CLASSES = new Set(KDX_GEOMETRIC_EVIDENCE_CLASSES);

export class KdxSemanticIrError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'KdxSemanticIrError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

const unique = (values) => [...new Set((values || []).filter(Boolean))];
const intersects = (left, right) => left.some((value) => right.includes(value));
const assertNonEmptyString = (value, field) => {
  if (typeof value !== 'string' || value.trim().length < 2) {
    throw new KdxSemanticIrError('INVALID_FIELD', `${field} must be a non-empty string.`, { field, value });
  }
};

function validateGeometry(ir) {
  if (ir.geometry == null) return null;
  if (!ir.geometry || typeof ir.geometry !== 'object' || Array.isArray(ir.geometry)) {
    throw new KdxSemanticIrError('INVALID_GEOMETRY', 'geometry must be an object when declared.', { id: ir.id });
  }
  const primitives = unique(ir.geometry.primitives);
  if (primitives.length === 0 || primitives.length > 4) {
    throw new KdxSemanticIrError('INVALID_GEOMETRY_PRIMITIVES', 'geometry.primitives requires 1–4 registered primitive IDs.', { id: ir.id, primitives });
  }
  if (!GEOMETRIC_EVIDENCE_CLASSES.has(ir.geometry.evidence_class)) {
    throw new KdxSemanticIrError('INVALID_GEOMETRY_EVIDENCE_CLASS', 'geometry.evidence_class must use a registered geometric evidence class.', { id: ir.id, evidence_class: ir.geometry.evidence_class });
  }
  assertNonEmptyString(ir.geometry.relation, 'geometry.relation');

  const registered = primitives.map((primitiveId) => {
    const entry = KDX_GEOMETRIC_PRIMITIVE_BY_ID[primitiveId];
    if (!entry) {
      throw new KdxSemanticIrError('UNKNOWN_GEOMETRY_PRIMITIVE', `Unsupported geometric primitive: ${primitiveId}`, { id: ir.id, primitiveId });
    }
    if (!intersects(ir.operators, entry.compatible_operators)) {
      throw new KdxSemanticIrError('GEOMETRY_OPERATOR_MISMATCH', `Geometric primitive ${primitiveId} has no compatible declared semantic operator.`, {
        id: ir.id,
        primitiveId,
        operators: ir.operators,
        compatible_operators: entry.compatible_operators,
      });
    }
    if (!intersects(ir.depth_types, entry.compatible_depth_types)) {
      throw new KdxSemanticIrError('GEOMETRY_DEPTH_MISMATCH', `Geometric primitive ${primitiveId} has no compatible declared depth type.`, {
        id: ir.id,
        primitiveId,
        depth_types: ir.depth_types,
        compatible_depth_types: entry.compatible_depth_types,
      });
    }
    return entry;
  });

  return Object.freeze({
    primitives: Object.freeze(primitives),
    relation: ir.geometry.relation,
    evidence_class: ir.geometry.evidence_class,
    notes: ir.geometry.notes || null,
    registered_primitives: Object.freeze(registered.map((entry) => Object.freeze({
      id: entry.id,
      relation: entry.relation,
      evidence_class: entry.evidence_class,
    }))),
  });
}

export function validateSemanticIr(ir) {
  if (!ir || typeof ir !== 'object' || Array.isArray(ir)) {
    throw new KdxSemanticIrError('INVALID_IR', 'Semantic IR must be an object.');
  }
  assertNonEmptyString(ir.id, 'id');
  assertNonEmptyString(ir.question, 'question');
  assertNonEmptyString(ir.scene_state, 'scene_state');
  if (!PLATE_TYPES.has(ir.plate_type)) {
    throw new KdxSemanticIrError('INVALID_PLATE_TYPE', `Unsupported plate_type: ${ir.plate_type}`, { plate_type: ir.plate_type });
  }
  if (!Array.isArray(ir.principles) || unique(ir.principles).length === 0) {
    throw new KdxSemanticIrError('MISSING_PRINCIPLE', 'Semantic IR requires at least one principle.', { id: ir.id });
  }
  if (!Array.isArray(ir.epistemic) || ir.epistemic.length === 0 || ir.epistemic.some((status) => !EPISTEMIC_STATUSES.has(status))) {
    throw new KdxSemanticIrError('INVALID_EPISTEMIC_STATUS', 'Semantic IR epistemic[] must use registered statuses.', { id: ir.id, epistemic: ir.epistemic });
  }
  if (!Array.isArray(ir.operators) || ir.operators.length === 0 || ir.operators.some((operator) => !OPERATORS.has(operator))) {
    throw new KdxSemanticIrError('INVALID_OPERATOR', 'Semantic IR operators[] must use registered semantic operators.', { id: ir.id, operators: ir.operators });
  }
  if (!Array.isArray(ir.depth_types) || ir.depth_types.length === 0 || ir.depth_types.some((depth) => !DEPTH_TYPES.has(depth))) {
    throw new KdxSemanticIrError('INVALID_DEPTH_TYPE', 'Semantic IR depth_types[] must use registered depth types.', { id: ir.id, depth_types: ir.depth_types });
  }
  validateGeometry(ir);
  if (!ir.memory || !MEMORY_EFFECTS.has(ir.memory.effect)) {
    throw new KdxSemanticIrError('INVALID_MEMORY_EFFECT', 'Semantic IR memory.effect is missing or unsupported.', { id: ir.id, memory: ir.memory });
  }
  if (!ir.return || !RETURN_EFFECTS.has(ir.return.effect)) {
    throw new KdxSemanticIrError('INVALID_RETURN_EFFECT', 'Semantic IR return.effect is missing or unsupported.', { id: ir.id, return: ir.return });
  }
  if (!Array.isArray(ir.provenance_refs) || unique(ir.provenance_refs).length === 0) {
    throw new KdxSemanticIrError('MISSING_PROVENANCE', 'Semantic IR requires at least one provenance reference.', { id: ir.id });
  }
  if (ir.seed === undefined || ir.seed === null || ir.seed === '') {
    throw new KdxSemanticIrError('MISSING_SEED', 'Semantic IR requires an explicit deterministic seed.', { id: ir.id });
  }
  if (ir.plate_type === 'JUNCTION_PLATE') {
    const routeCount = Array.isArray(ir.route_slate) ? ir.route_slate.length : 0;
    if (routeCount < 2 || routeCount > 5) {
      throw new KdxSemanticIrError('INVALID_ROUTE_BOUNDS', 'JUNCTION_PLATE Semantic IR requires 2–5 explicit routes.', { id: ir.id, routeCount });
    }
  }
  if (ir.plate_type === 'ACTIVATOR_PLATE' && ir.manifestation?.payload_type === 'ARTWORK') {
    throw new KdxSemanticIrError(
      'PROTECTED_ARTWORK_ADAPTER_REQUIRED',
      'Semantic IR P0 does not admit protected ARTWORK directly. Use the existing protected activation adapter, then pass its governed contract to Assembly OS.',
      { id: ir.id },
    );
  }
  return true;
}

export function compileSemanticIrToAssemblyInput(ir) {
  validateSemanticIr(ir);
  const manifestation = ir.manifestation || {};
  const input = {
    node_id: ir.id,
    title: manifestation.title || ir.principles[0],
    scene_state: ir.scene_state,
    observer_lens: ir.observer_lens || 'NAKED_EYE',
    communication_mode: ir.communication_mode,
    macro_signal: manifestation.macro_signal || ir.question,
    provenance_refs: unique(ir.provenance_refs),
    primary_payload: {
      payload_type: manifestation.payload_type || (ir.plate_type === 'JUNCTION_PLATE' ? 'MAP' : 'CONCEPT'),
      payload_ref: manifestation.payload_ref || ir.id,
      status: manifestation.status || 'CANON_CANDIDATE',
    },
    route_slate: Array.isArray(ir.route_slate) ? ir.route_slate.map(({ target_node, role }) => ({ target_node, role })) : [],
    copy_slots: Array.isArray(manifestation.copy_slots) ? manifestation.copy_slots.map((slot) => ({ ...slot })) : [],
    allow_motion: manifestation.allow_motion !== false,
  };

  if (ir.plate_type === 'ACTIVATOR_PLATE') {
    input.artwork_contract = null;
    input.activation_profile = {
      activation_id: manifestation.activation_id || 'MOTION_03_FIELD_MARBLE',
      explicit_action_required: manifestation.explicit_action_required !== false,
      environment_only: true,
    };
    input.primary_payload.payload_type = 'FIELD';
  }

  return Object.freeze(input);
}

export function buildSemanticTrace(ir) {
  validateSemanticIr(ir);
  const geometry = validateGeometry(ir);
  return Object.freeze({
    semantic_ir_id: ir.id,
    semantic_ir_version: ir.version || KDX_SEMANTIC_IR_PROFILE.version,
    question: ir.question,
    principles: Object.freeze(unique(ir.principles)),
    epistemic: Object.freeze(unique(ir.epistemic)),
    operators: Object.freeze(unique(ir.operators)),
    depth_types: Object.freeze(unique(ir.depth_types)),
    geometry,
    interaction: Object.freeze({ ...(ir.interaction || {}) }),
    memory: Object.freeze({ ...ir.memory }),
    return: Object.freeze({ ...ir.return }),
    provenance_refs: Object.freeze(unique(ir.provenance_refs)),
  });
}

export function compileSemanticIrToPlateSpec(ir) {
  const assemblyInput = compileSemanticIrToAssemblyInput(ir);
  const plateSpec = assemblePlateSpec(assemblyInput, ir.plate_type, ir.seed);
  return Object.freeze({
    semanticTrace: buildSemanticTrace(ir),
    assemblyInput,
    plateSpec,
  });
}
