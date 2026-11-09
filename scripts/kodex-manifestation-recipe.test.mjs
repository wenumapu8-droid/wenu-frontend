import assert from 'node:assert/strict';
import test from 'node:test';

import {
  KDX_MANIFESTATION_RECIPE_DEMOS,
  KdxManifestationRecipeError,
  compileManifestationRecipe,
} from '../src/lib/kodex/grammar/manifestation-recipe.js';
import {
  KdxGenerativeGeometryCrosswalkError,
  resolveGenerativeGeometryConcept,
} from '../src/lib/kodex/grammar/generative-geometry-crosswalk.v0.1.js';

const recipe = KDX_MANIFESTATION_RECIPE_DEMOS.COSMOLOGY_RADIAL_001;
const memorySignature = Object.freeze({
  id: 'KDX-MEM-TEST',
  topology: 'ORBIT_LOOP',
  metrics: Object.freeze({
    totalVisits: 8,
    visitedCount: 5,
    revisitCount: 3,
    branchPointCount: 1,
    depth: 4,
    fieldCount: 3,
  }),
});

test('same recipe + seed + memory snapshot compiles to the same plan', () => {
  const a = compileManifestationRecipe(recipe, { memorySignature });
  const b = compileManifestationRecipe(recipe, { memorySignature });
  assert.deepEqual(a, b);
  assert.equal(a.plan_id, b.plan_id);
  assert.match(a.plan_id, /^KDX-MAN-[A-Z0-9]+$/);
});

test('RADIAL_SYMMETRY reuses the existing mirror shader capability', () => {
  const plan = compileManifestationRecipe(recipe, { memorySignature });
  const radial = plan.operators.find((operator) => operator.id === 'RADIAL_SYMMETRY');
  const runtime = plan.runtime.effects.find((effect) => effect.semantic_operator === 'RADIAL_SYMMETRY');
  assert.equal(radial.runtime, 'mirror');
  assert.equal(runtime.name, 'mirror');
  assert.ok(runtime.params.u_seg >= 6 && runtime.params.u_seg <= 24);
});

test('protected Ocín activation is consumed without authorizing source pixels', () => {
  const plan = compileManifestationRecipe(recipe, { memorySignature });
  assert.equal(plan.source.artwork_id, 'OCN-MND-GRY-002');
  assert.equal(plan.source.source_bytes_renderable, false);
  assert.equal(plan.source_pixel_blocked, true);
  assert.equal(plan.source.source_pixel_status, 'WITHHELD_BY_PROTECTED_SOURCE_CONTRACT');
  assert.equal(plan.source.activation_contract.artwork_contract.distort_source_allowed, false);
  assert.equal(plan.source.activation_contract.artwork_contract.crop_allowed, false);
});

test('memory affects only bounded visual parameters and is not mutated', () => {
  const snapshot = JSON.stringify(memorySignature);
  const plan = compileManifestationRecipe(recipe, { memorySignature });
  assert.equal(JSON.stringify(memorySignature), snapshot);
  assert.equal(plan.memory_influence.descriptive_only, true);
  assert.equal(plan.memory_influence.visitor_score, false);
  assert.ok(plan.memory_influence.revisit_ratio > 0);
  assert.ok(plan.memory_influence.branching_factor > 0);
});

test('unsupported geometry concepts fail closed', () => {
  assert.throws(
    () => resolveGenerativeGeometryConcept('UNIVERSAL_METAPHYSICAL_TORUS'),
    (error) => error instanceof KdxGenerativeGeometryCrosswalkError && error.code === 'UNKNOWN_GENERATIVE_GEOMETRY',
  );
});

test('unsupported radial-symmetry params fail instead of fabricating shader support', () => {
  const invalid = {
    ...recipe,
    operators: recipe.operators.map((operator) => operator.id === 'RADIAL_SYMMETRY'
      ? { ...operator, params: { ...operator.params, reflection_mode: 2 } }
      : operator),
  };
  assert.throws(
    () => compileManifestationRecipe(invalid, { memorySignature }),
    (error) => error instanceof KdxManifestationRecipeError && error.code === 'UNSUPPORTED_OPERATOR_PARAM',
  );
});

test('unknown runtime operators fail closed', () => {
  const invalid = { ...recipe, operators: [{ id: 'MAGIC_QUANTUM_FIELD', params: {} }] };
  assert.throws(
    () => compileManifestationRecipe(invalid, { memorySignature }),
    (error) => error instanceof KdxManifestationRecipeError && error.code === 'UNKNOWN_MANIFESTATION_OPERATOR',
  );
});

test('MID and LOW tiers deterministically reduce active effect-chain passes', () => {
  const mid = compileManifestationRecipe({ ...recipe, render_tier: 'MID' }, { memorySignature });
  const low = compileManifestationRecipe({ ...recipe, render_tier: 'LOW' }, { memorySignature });
  assert.equal(mid.runtime.effects.filter((effect) => effect.on).length, 2);
  assert.equal(low.runtime.effects.filter((effect) => effect.on).length, 1);
});

test('provenance refs fail closed instead of accepting unbound strings', () => {
  const invalid = {
    ...recipe,
    provenance_refs: [...recipe.provenance_refs, 'fabricated:trust-me'],
  };
  assert.throws(
    () => compileManifestationRecipe(invalid, { memorySignature }),
    (error) => error instanceof KdxManifestationRecipeError && error.code === 'INVALID_PROVENANCE_REF',
  );
});

test('protected artwork provenance cannot be omitted from a manifestation recipe', () => {
  const invalid = {
    ...recipe,
    provenance_refs: recipe.provenance_refs.filter((ref) => !ref.includes('OCÍN_MASTER_ART_REGISTRY_v0.8#OCN-MND-GRY-002')),
  };
  assert.throws(
    () => compileManifestationRecipe(invalid, { memorySignature }),
    (error) => error instanceof KdxManifestationRecipeError && error.code === 'MISSING_REQUIRED_PROVENANCE',
  );
});
