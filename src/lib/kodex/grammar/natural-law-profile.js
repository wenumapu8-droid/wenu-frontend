import {
  KDX_NATURAL_LAW_EVIDENCE_CLASSES,
  KDX_NATURAL_LAW_PATTERN_BY_ID,
  KDX_NATURAL_LAW_REGISTRY_PROFILE,
} from './natural-law-patterns.v0.1.js';

export const KDX_NATURAL_LAW_PROFILE = Object.freeze({
  version: 'natural-law-profile-v0.1.0',
  status: 'IMPLEMENTED_CANDIDATE',
  role: 'TRACE_ONLY_PROFILE_COMPILER',
  createsParallelRuntime: false,
  mutatesAssemblyOS: false,
  mutatesDeepNavigation: false,
  mutatesMemory: false,
  mutatesRoutes: false,
  behaviorChange: false,
  registryVersion: KDX_NATURAL_LAW_REGISTRY_PROFILE.version,
});

const EVIDENCE_CLASSES = new Set(KDX_NATURAL_LAW_EVIDENCE_CLASSES);
const unique = (values = []) => [...new Set(values.filter(Boolean))];
const intersects = (left = [], right = []) => left.some((value) => right.includes(value));

export class KdxNaturalLawError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'KdxNaturalLawError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

export function validateNaturalPatternIds(patternIds = []) {
  if (!Array.isArray(patternIds)) {
    throw new KdxNaturalLawError('INVALID_PATTERN_LIST', 'natural_patterns must be an array when declared.');
  }
  const ids = unique(patternIds);
  if (ids.length === 0 || ids.length > 6) {
    throw new KdxNaturalLawError('INVALID_PATTERN_BOUNDS', 'natural_patterns requires 1–6 unique registered pattern IDs.', { patternIds });
  }
  return ids.map((id) => {
    const entry = KDX_NATURAL_LAW_PATTERN_BY_ID[id];
    if (!entry) {
      throw new KdxNaturalLawError('UNKNOWN_NATURAL_PATTERN', `Unsupported natural-law pattern: ${id}`, { id });
    }
    if (!EVIDENCE_CLASSES.has(entry.evidence_class)) {
      throw new KdxNaturalLawError('INVALID_PATTERN_EVIDENCE', `Pattern ${id} has an unsupported evidence class.`, {
        id,
        evidence_class: entry.evidence_class,
      });
    }
    return entry;
  });
}

function validatePatternCompatibility(ir, entries) {
  const geometryIds = unique(ir?.geometry?.primitives || []);
  const operators = unique(ir?.operators || []);

  for (const entry of entries) {
    if (entry.compatible_geometry.length && geometryIds.length && !intersects(geometryIds, entry.compatible_geometry)) {
      throw new KdxNaturalLawError(
        'NATURAL_PATTERN_GEOMETRY_MISMATCH',
        `Pattern ${entry.id} has no compatible declared geometric primitive.`,
        { patternId: entry.id, geometryIds, compatible_geometry: entry.compatible_geometry },
      );
    }
    if (entry.compatible_operators.length && operators.length && !intersects(operators, entry.compatible_operators)) {
      throw new KdxNaturalLawError(
        'NATURAL_PATTERN_OPERATOR_MISMATCH',
        `Pattern ${entry.id} has no compatible declared semantic operator.`,
        { patternId: entry.id, operators, compatible_operators: entry.compatible_operators },
      );
    }
  }
}

const LAYER_KEYS = Object.freeze([
  'information_architecture',
  'layout',
  'responsive',
  'motion',
  'sound',
  'navigation',
  'memory',
  'return',
]);

function aggregateLayerHints(entries) {
  const hints = {};
  for (const key of LAYER_KEYS) {
    hints[key] = Object.freeze(unique(entries.flatMap((entry) => entry.layer_hints[key] || [])));
  }
  return Object.freeze(hints);
}

export function deriveNaturalLawProfile(ir = {}) {
  if (ir.natural_patterns == null) return null;
  const entries = validateNaturalPatternIds(ir.natural_patterns);
  validatePatternCompatibility(ir, entries);

  const patternIds = entries.map((entry) => entry.id);
  const epistemicTrace = entries.map((entry) => Object.freeze({
    pattern_id: entry.id,
    evidence_class: entry.evidence_class,
    source_scope: entry.source_scope,
    provenance_refs: Object.freeze([...entry.provenance_refs]),
    prohibited_inferences: Object.freeze([...entry.prohibited_inferences]),
  }));

  return Object.freeze({
    version: KDX_NATURAL_LAW_PROFILE.version,
    status: KDX_NATURAL_LAW_PROFILE.status,
    role: KDX_NATURAL_LAW_PROFILE.role,
    trace_only: true,
    behavior_change: false,
    pattern_ids: Object.freeze(patternIds),
    formal_properties: Object.freeze(unique(entries.flatMap((entry) => entry.formal_properties))),
    layer_hints: aggregateLayerHints(entries),
    epistemic_trace: Object.freeze(epistemicTrace),
  });
}
