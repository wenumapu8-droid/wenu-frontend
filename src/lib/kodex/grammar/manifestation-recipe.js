import { getNaturalLawPattern } from './natural-law-patterns.v0.1.js';
import { buildProtectedOcinActivationInput } from './protected-activation-adapter.js';
import { resolveGenerativeGeometryConcepts } from './generative-geometry-crosswalk.v0.1.js';

export const KDX_MANIFESTATION_RECIPE_PROFILE = Object.freeze({
  version: 'manifestation-recipe-v0.1.0',
  status: 'IMPLEMENTED_CANDIDATE',
  role: 'STATELESS_EXISTING_RUNTIME_ADAPTER',
  createsRenderer: false,
  createsStateMachine: false,
  createsMemoryStore: false,
  mutatesAssemblyOS: false,
  mutatesDeepNavigation: false,
  mutatesMemory: false,
  failClosed: true,
});

export const KDX_RENDER_TIERS = Object.freeze(['HIGH', 'MID', 'LOW', 'STATIC']);
export const KDX_WORLD_PHASES = Object.freeze(['E00', 'T01', 'M11', 'R10']);
export const KDX_SCENE_IDS = Object.freeze([
  'THRESHOLD', 'PROLOGUE', 'DESCENT', 'ARCHIVE', 'MACHINE', 'COSMOLOGY', 'RETURN',
]);

export const KDX_MANIFESTATION_OPERATOR_CAPABILITIES = Object.freeze({
  RADIAL_SYMMETRY: Object.freeze({
    runtime: 'mirror',
    role: 'EFFECT_CHAIN',
    note: 'Uses the existing mirror.frag polar-fold shader; no new radial-symmetry shader is created.',
    params: Object.freeze({
      segments: Object.freeze({ runtime: 'u_seg', min: 1, max: 24, integer: true, fallback: 6 }),
      rotation: Object.freeze({ runtime: 'u_angle', min: -6.283185307, max: 6.283185307, fallback: 0 }),
      mix: Object.freeze({ runtime: 'u_mix', min: 0, max: 1, fallback: 1 }),
    }),
  }),
  DISTORT: Object.freeze({
    runtime: 'distort',
    role: 'EFFECT_CHAIN',
    params: Object.freeze({
      amount: Object.freeze({ runtime: 'u_amt', min: 0, max: 0.5, fallback: 0.12 }),
      mode: Object.freeze({ runtime: 'u_mode', min: 0, max: 2, integer: true, fallback: 0 }),
    }),
  }),
  COLOR: Object.freeze({
    runtime: 'color',
    role: 'EFFECT_CHAIN',
    params: Object.freeze({
      mode: Object.freeze({ runtime: 'u_mode', min: 0, max: 2, integer: true, fallback: 0 }),
      amount: Object.freeze({ runtime: 'u_amt', min: 0, max: 1, fallback: 0.5 }),
    }),
  }),
  FEEDBACK: Object.freeze({
    runtime: 'feedback',
    role: 'PIPELINE_FEEDBACK',
    params: Object.freeze({
      decay: Object.freeze({ runtime: 'decay', min: 0.78, max: 0.975, fallback: 0.9 }),
    }),
  }),
});

const DEFAULT_STATE_MAPPING = Object.freeze({
  DORMANT: 'E00',
  AWARE: 'T01',
  OPEN: 'M11',
  RETURN: 'R10',
});

const SOURCE_MODES = new Set(['flow', 'spiral', 'blacksun']);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const unique = (values = []) => [...new Set(values.filter(Boolean))];
const clean = (value) => String(value || '').trim();

export class KdxManifestationRecipeError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'KdxManifestationRecipeError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

function assertString(value, field) {
  if (clean(value).length < 2) {
    throw new KdxManifestationRecipeError('INVALID_FIELD', `${field} must be a non-empty string.`, { field, value });
  }
}

function stableHash(value) {
  const text = String(value ?? '');
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function normalizedSeed(seed) {
  if (Number.isFinite(seed)) return clamp(Number(seed), 0, 1);
  const label = clean(seed);
  if (!label) throw new KdxManifestationRecipeError('MISSING_SEED', 'ManifestationRecipe requires an explicit seed.');
  return stableHash(label) / 0xffffffff;
}

function freezeDeep(value) {
  if (Array.isArray(value)) return Object.freeze(value.map(freezeDeep));
  if (value && typeof value === 'object') {
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, child]) => [key, freezeDeep(child)])));
  }
  return value;
}

function normalizeParam(rawValue, spec, operatorId, paramId) {
  const fallback = spec.fallback;
  const numeric = rawValue == null ? fallback : Number(rawValue);
  if (!Number.isFinite(numeric)) {
    throw new KdxManifestationRecipeError('INVALID_OPERATOR_PARAM', `${operatorId}.${paramId} must be numeric.`, {
      operatorId, paramId, value: rawValue,
    });
  }
  const bounded = clamp(numeric, spec.min, spec.max);
  return spec.integer ? Math.round(bounded) : Number(bounded.toFixed(6));
}

function compileOperator(operator = {}) {
  const id = clean(operator.id).toUpperCase();
  const capability = KDX_MANIFESTATION_OPERATOR_CAPABILITIES[id];
  if (!capability) {
    throw new KdxManifestationRecipeError('UNKNOWN_MANIFESTATION_OPERATOR', `Unsupported manifestation operator: ${id || '(empty)'}`, { operator });
  }
  const supplied = operator.params || {};
  const knownParamIds = Object.keys(capability.params);
  for (const suppliedKey of Object.keys(supplied)) {
    if (!knownParamIds.includes(suppliedKey)) {
      throw new KdxManifestationRecipeError(
        'UNSUPPORTED_OPERATOR_PARAM',
        `${id}.${suppliedKey} is not supported by the existing runtime capability.`,
        { operatorId: id, paramId: suppliedKey, supported: knownParamIds },
      );
    }
  }
  const runtimeParams = {};
  const semanticParams = {};
  for (const [paramId, spec] of Object.entries(capability.params)) {
    const value = normalizeParam(supplied[paramId], spec, id, paramId);
    semanticParams[paramId] = value;
    runtimeParams[spec.runtime] = value;
  }
  return freezeDeep({
    id,
    runtime: capability.runtime,
    role: capability.role,
    on: operator.on !== false,
    params: semanticParams,
    runtime_params: runtimeParams,
    note: capability.note || null,
  });
}

function validatePatternIds(patternIds = []) {
  const ids = unique(patternIds.map((id) => clean(id).toUpperCase()));
  if (ids.length > 6) {
    throw new KdxManifestationRecipeError('PATTERN_LIMIT_EXCEEDED', 'ManifestationRecipe supports at most six source-scoped pattern IDs.', { ids });
  }
  return ids.map((id) => {
    const pattern = getNaturalLawPattern(id);
    if (!pattern) {
      throw new KdxManifestationRecipeError('UNKNOWN_NATURAL_PATTERN', `Unsupported Natural Law pattern: ${id}`, { id });
    }
    return pattern;
  });
}

function compileStateMapping(mapping = DEFAULT_STATE_MAPPING) {
  const merged = { ...DEFAULT_STATE_MAPPING, ...(mapping || {}) };
  for (const key of Object.keys(DEFAULT_STATE_MAPPING)) {
    if (!KDX_WORLD_PHASES.includes(merged[key])) {
      throw new KdxManifestationRecipeError('INVALID_WORLD_PHASE', `state_mapping.${key} must use an existing KodexWorld phase.`, {
        key, phase: merged[key], allowed: KDX_WORLD_PHASES,
      });
    }
  }
  return freezeDeep(merged);
}

function compileSource(source = {}) {
  const kind = clean(source.kind).toUpperCase();
  if (kind !== 'PROTECTED_OCIN_ACTIVATION') {
    throw new KdxManifestationRecipeError(
      'UNSUPPORTED_SOURCE_KIND',
      'P0.4 only accepts a registered protected Ocín activation contract. Source pixels remain governed separately.',
      { kind: kind || null },
    );
  }
  assertString(source.artwork_id, 'source.artwork_id');
  const contract = buildProtectedOcinActivationInput(source.artwork_id, {
    explicitActionRequired: source.explicit_action_required !== false,
  });
  const fallbackSourceMode = clean(source.fallback_source_mode || 'flow').toLowerCase();
  if (!SOURCE_MODES.has(fallbackSourceMode)) {
    throw new KdxManifestationRecipeError('INVALID_SOURCE_MODE', `Unsupported KodexWorld source mode: ${fallbackSourceMode}`, { fallbackSourceMode });
  }
  return freezeDeep({
    kind,
    artwork_id: source.artwork_id,
    activation_contract: contract,
    source_bytes_renderable: Boolean(contract.artwork_contract.source_bytes_renderable),
    runtime_source_mode: fallbackSourceMode,
    source_pixel_status: contract.artwork_contract.source_bytes_renderable ? 'AVAILABLE_BY_CONTRACT' : 'WITHHELD_BY_PROTECTED_SOURCE_CONTRACT',
  });
}

function validateProvenanceRefs(recipe, { geometry, patternRecords, source, compiledOperators }) {
  const refs = unique((recipe.provenance_refs || []).map(clean));
  const required = new Set();
  const allowed = new Set();

  if (geometry?.primitive_ids?.length) {
    const ref = 'runtime:src/lib/kodex/grammar/geometric-transduction-registry.v0.1.js';
    required.add(ref);
    allowed.add(ref);
  }

  if (patternRecords?.length) {
    const ref = 'runtime:src/lib/kodex/grammar/natural-law-patterns.v0.1.js';
    required.add(ref);
    allowed.add(ref);
  }

  if (source?.artwork_id) {
    const ref = `registry:OCÍN_MASTER_ART_REGISTRY_v0.8#${source.artwork_id}`;
    required.add(ref);
    allowed.add(ref);
  }

  for (const operator of compiledOperators || []) {
    if (operator.id === 'RADIAL_SYMMETRY' && operator.runtime === 'mirror') {
      const ref = 'runtime:src/kodex/shaders/mirror.frag';
      required.add(ref);
      allowed.add(ref);
    }
  }

  const invalid = refs.filter((ref) => !allowed.has(ref));
  if (invalid.length) {
    throw new KdxManifestationRecipeError(
      'INVALID_PROVENANCE_REF',
      'ManifestationRecipe provenance_refs[] must bind only to authorities implied by registered recipe inputs.',
      { invalid, allowed: [...allowed] },
    );
  }

  const missing = [...required].filter((ref) => !refs.includes(ref));
  if (missing.length) {
    throw new KdxManifestationRecipeError(
      'MISSING_REQUIRED_PROVENANCE',
      'ManifestationRecipe is missing provenance required by its registered geometry, pattern, source or runtime inputs.',
      { missing, refs },
    );
  }

  return freezeDeep(refs);
}

function deriveMemoryInfluence(memorySignature, recipeMemory = {}) {
  if (!memorySignature) return freezeDeep({ applied: false, reason: 'NO_MEMORY_SIGNATURE' });
  const metrics = memorySignature.metrics || {};
  const totalVisits = Math.max(1, Number(metrics.totalVisits) || 0);
  const visitedCount = Math.max(1, Number(metrics.visitedCount) || 0);
  const revisitRatio = clamp((Number(metrics.revisitCount) || 0) / totalVisits, 0, 1);
  const branchingFactor = clamp((Number(metrics.branchPointCount) || 0) / visitedCount, 0, 1);
  const depth = Math.max(0, Number(metrics.depth) || 0);
  const depthBand = clamp(depth / Math.max(1, Number(recipeMemory.depth_normalizer) || 6), 0, 1);
  return freezeDeep({
    applied: recipeMemory.enabled !== false,
    source_signature_id: memorySignature.id || null,
    source_topology: memorySignature.topology || null,
    revisit_ratio: Number(revisitRatio.toFixed(6)),
    branching_factor: Number(branchingFactor.toFixed(6)),
    depth_band: Number(depthBand.toFixed(6)),
    field_count: Math.max(0, Number(metrics.fieldCount) || 0),
    descriptive_only: true,
    visitor_score: false,
  });
}

function applyMemoryToOperators(operators, memoryInfluence) {
  if (!memoryInfluence?.applied) return operators;
  return operators.map((operator) => {
    const runtimeParams = { ...operator.runtime_params };
    const semanticParams = { ...operator.params };
    if (operator.id === 'RADIAL_SYMMETRY') {
      const segments = clamp(
        semanticParams.segments + Math.round(memoryInfluence.revisit_ratio * 4 + memoryInfluence.depth_band * 2),
        1,
        24,
      );
      semanticParams.segments = segments;
      runtimeParams.u_seg = segments;
    }
    if (operator.id === 'DISTORT') {
      const amount = clamp(semanticParams.amount + memoryInfluence.branching_factor * 0.06, 0, 0.5);
      semanticParams.amount = Number(amount.toFixed(6));
      runtimeParams.u_amt = semanticParams.amount;
    }
    if (operator.id === 'FEEDBACK') {
      const decay = clamp(semanticParams.decay + memoryInfluence.revisit_ratio * 0.025, 0.78, 0.975);
      semanticParams.decay = Number(decay.toFixed(6));
      runtimeParams.decay = semanticParams.decay;
    }
    return freezeDeep({ ...operator, params: semanticParams, runtime_params: runtimeParams });
  });
}

function tierOperatorBudget(tier) {
  return { HIGH: 3, MID: 2, LOW: 1, STATIC: 2 }[tier] ?? 1;
}

function applyRenderTier(operators, tier) {
  const effectBudget = tierOperatorBudget(tier);
  let effectsUsed = 0;
  return operators.map((operator) => {
    if (operator.role !== 'EFFECT_CHAIN') return operator;
    const allowed = operator.on && effectsUsed < effectBudget;
    if (allowed) effectsUsed += 1;
    return freezeDeep({ ...operator, on: allowed });
  });
}

function runtimePlanId(payload) {
  return `KDX-MAN-${stableHash(JSON.stringify(payload)).toString(36).toUpperCase()}`;
}

export function validateManifestationRecipe(recipe = {}) {
  assertString(recipe.id, 'id');
  assertString(recipe.concept_id, 'concept_id');
  assertString(recipe.semantic_intent, 'semantic_intent');
  const sceneId = clean(recipe.scene_id).toUpperCase();
  if (!KDX_SCENE_IDS.includes(sceneId)) {
    throw new KdxManifestationRecipeError('INVALID_SCENE', `Unsupported KODEX scene: ${sceneId || '(empty)'}`, { sceneId });
  }
  if (!Array.isArray(recipe.geometry_concepts) || recipe.geometry_concepts.length === 0) {
    throw new KdxManifestationRecipeError('MISSING_GEOMETRY', 'ManifestationRecipe requires geometry_concepts[].');
  }
  if (!Array.isArray(recipe.operators) || recipe.operators.length === 0 || recipe.operators.length > 6) {
    throw new KdxManifestationRecipeError('INVALID_OPERATORS', 'ManifestationRecipe requires 1–6 operators.');
  }
  if (!Array.isArray(recipe.provenance_refs) || recipe.provenance_refs.length === 0) {
    throw new KdxManifestationRecipeError('MISSING_PROVENANCE', 'ManifestationRecipe requires provenance_refs[].');
  }
  normalizedSeed(recipe.seed);
  return true;
}

export function compileManifestationRecipe(recipe = {}, context = {}) {
  validateManifestationRecipe(recipe);
  const sceneId = clean(recipe.scene_id).toUpperCase();
  const geometry = resolveGenerativeGeometryConcepts(recipe.geometry_concepts);
  const explicitPatternIds = unique((recipe.pattern_ids || []).map((id) => clean(id).toUpperCase()));
  const patternRecords = validatePatternIds(unique([...explicitPatternIds, ...geometry.implied_pattern_ids]));
  const source = compileSource(recipe.source);
  const renderTier = clean(recipe.render_tier || 'HIGH').toUpperCase();
  if (!KDX_RENDER_TIERS.includes(renderTier)) {
    throw new KdxManifestationRecipeError('INVALID_RENDER_TIER', `Unsupported render tier: ${renderTier}`, { renderTier });
  }
  const memoryInfluence = deriveMemoryInfluence(context.memorySignature || null, recipe.memory_response || {});
  const compiledOperators = applyRenderTier(
    applyMemoryToOperators(recipe.operators.map(compileOperator), memoryInfluence),
    renderTier,
  );
  const provenanceRefs = validateProvenanceRefs(recipe, {
    geometry,
    patternRecords,
    source,
    compiledOperators,
  });
  const feedback = compiledOperators.find((operator) => operator.id === 'FEEDBACK');
  const runtimeEffects = compiledOperators
    .filter((operator) => operator.role === 'EFFECT_CHAIN')
    .map((operator) => freezeDeep({
      semantic_operator: operator.id,
      name: operator.runtime,
      on: operator.on,
      params: operator.runtime_params,
    }));
  const stateMapping = compileStateMapping(recipe.state_mapping);
  const tint = Array.isArray(recipe.tint) && recipe.tint.length === 3
    ? recipe.tint.map((value) => clamp(Number(value) || 0, 0, 1))
    : [0.82, 0.82, 0.82];
  const seed = normalizedSeed(recipe.seed);
  const core = {
    recipe_version: KDX_MANIFESTATION_RECIPE_PROFILE.version,
    recipe_id: recipe.id,
    concept_id: recipe.concept_id,
    scene_id: sceneId,
    semantic_intent: recipe.semantic_intent,
    topology: clean(recipe.topology || geometry.concepts[0]).toUpperCase(),
    geometry_concepts: geometry.concepts,
    geometry_ids: geometry.primitive_ids,
    geometry_mappings: geometry.mappings.map((mapping) => ({ concept: mapping.concept, mapping: mapping.mapping })),
    pattern_ids: patternRecords.map((record) => record.id),
    source,
    operators: compiledOperators,
    runtime: {
      sourceMode: source.runtime_source_mode,
      effects: runtimeEffects,
      decay: feedback?.runtime_params?.decay ?? clamp(Number(recipe.dynamics?.feedback_decay) || 0.9, 0.78, 0.975),
      seed,
      tint,
      renderTier,
      initialPhase: stateMapping.DORMANT,
    },
    state_mapping: stateMapping,
    interaction: {
      pointer: recipe.interaction?.pointer !== false,
      touch: recipe.interaction?.touch !== false,
      dwell_ms: clamp(Number(recipe.interaction?.dwell_ms) || 1200, 250, 5000),
      audio: Boolean(recipe.interaction?.audio),
      time: recipe.interaction?.time !== false,
    },
    memory_influence: memoryInfluence,
    reduced_motion_fallback: recipe.reduced_motion_fallback || 'STATIC_SEMANTIC_ENDPOINT',
    epistemic_trace: freezeDeep(recipe.epistemic_trace || []),
    provenance_refs: provenanceRefs,
    source_pixel_blocked: !source.source_bytes_renderable,
  };
  return freezeDeep({ ...core, plan_id: runtimePlanId(core) });
}

export const KDX_MANIFESTATION_RECIPE_DEMOS = Object.freeze({
  COSMOLOGY_RADIAL_001: freezeDeep({
    id: 'COSMOLOGY_RADIAL_001',
    concept_id: 'KDX-CONCEPT-SYSTEM-WITHIN-SYSTEM',
    scene_id: 'COSMOLOGY',
    semantic_intent: 'A relational field differentiates, opens, remembers traversal and returns without inventing a new source image.',
    topology: 'ORBIT_FIELD',
    geometry_concepts: ['CIRCLE_ORBIT', 'SYMMETRY', 'RECURSION'],
    pattern_ids: ['NESTED_RECURSION', 'PHYLLOTAXIS_SPACING'],
    source: {
      kind: 'PROTECTED_OCIN_ACTIVATION',
      artwork_id: 'OCN-MND-GRY-002',
      explicit_action_required: true,
      fallback_source_mode: 'flow',
    },
    operators: [
      { id: 'RADIAL_SYMMETRY', params: { segments: 6, rotation: 0, mix: 0.88 } },
      { id: 'DISTORT', params: { amount: 0.08, mode: 0 } },
      { id: 'COLOR', params: { mode: 0, amount: 0.32 } },
      { id: 'FEEDBACK', params: { decay: 0.91 } },
    ],
    dynamics: { feedback_decay: 0.91 },
    interaction: { pointer: true, touch: true, dwell_ms: 1100, audio: false, time: true },
    memory_response: { enabled: true, depth_normalizer: 6 },
    state_mapping: DEFAULT_STATE_MAPPING,
    tint: [0.78, 0.78, 0.74],
    seed: 'KODEX:COSMOLOGY_RADIAL_001:V0',
    render_tier: 'HIGH',
    reduced_motion_fallback: 'STATIC_SEMANTIC_ENDPOINT',
    epistemic_trace: [
      { layer: 'FORMAL', statement: 'Radial folding is implemented by the existing polar mirror shader.' },
      { layer: 'KODEX_CANONICAL', statement: 'Recurrence and return are compositional mappings, not universal metaphysical facts.' },
    ],
    provenance_refs: [
      'runtime:src/kodex/shaders/mirror.frag',
      'runtime:src/lib/kodex/grammar/geometric-transduction-registry.v0.1.js',
      'runtime:src/lib/kodex/grammar/natural-law-patterns.v0.1.js',
      'registry:OCÍN_MASTER_ART_REGISTRY_v0.8#OCN-MND-GRY-002',
    ],
  }),
});