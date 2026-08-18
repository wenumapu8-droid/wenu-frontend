import test from 'node:test';
import assert from 'node:assert/strict';

import {
  KDX_NATURAL_LAW_PROFILE,
  KdxNaturalLawError,
  deriveNaturalLawProfile,
  validateNaturalPatternIds,
} from '../src/lib/kodex/grammar/natural-law-profile.js';
import { KDX_NATURAL_LAW_REGISTRY_PROFILE } from '../src/lib/kodex/grammar/natural-law-patterns.v0.1.js';
import {
  compileSemanticIrToAssemblyInput,
  compileSemanticIrToPlateSpec,
} from '../src/lib/kodex/grammar/semantic-ir-compiler.js';
import { KDX_SEMANTIC_IR_FIXTURES } from '../src/lib/kodex/grammar/semantic-ir-fixtures.v0.1.js';

const byId = (id) => KDX_SEMANTIC_IR_FIXTURES.find((fixture) => fixture.id === id);

test('Natural Law P0.2 is explicitly trace-only and does not create parallel runtime authority', () => {
  assert.equal(KDX_NATURAL_LAW_REGISTRY_PROFILE.role, 'TRACE_ONLY_PATTERN_REGISTRY');
  assert.equal(KDX_NATURAL_LAW_REGISTRY_PROFILE.createsParallelRuntime, false);
  assert.equal(KDX_NATURAL_LAW_REGISTRY_PROFILE.mutatesAssemblyOS, false);
  assert.equal(KDX_NATURAL_LAW_REGISTRY_PROFILE.mutatesDeepNavigation, false);
  assert.equal(KDX_NATURAL_LAW_REGISTRY_PROFILE.mutatesMemory, false);
  assert.equal(KDX_NATURAL_LAW_PROFILE.role, 'TRACE_ONLY_PROFILE_COMPILER');
  assert.equal(KDX_NATURAL_LAW_PROFILE.behaviorChange, false);
  assert.equal(KDX_NATURAL_LAW_PROFILE.mutatesRoutes, false);
});

test('all three Semantic IR proof cases derive deterministic Natural Law profiles', () => {
  assert.equal(KDX_SEMANTIC_IR_FIXTURES.length, 3);
  for (const fixture of KDX_SEMANTIC_IR_FIXTURES) {
    const first = deriveNaturalLawProfile(fixture);
    const second = deriveNaturalLawProfile(fixture);
    assert.ok(first);
    assert.deepEqual(first, second);
    assert.equal(first.trace_only, true);
    assert.equal(first.behavior_change, false);
    assert.deepEqual(first.pattern_ids, fixture.natural_patterns);
    assert.ok(first.epistemic_trace.length >= 1);
  }
});

test('Natural Law trace never enters the existing Assembly OS input dialect or PlateSpec', () => {
  for (const fixture of KDX_SEMANTIC_IR_FIXTURES) {
    const assemblyInput = compileSemanticIrToAssemblyInput(fixture);
    const compiled = compileSemanticIrToPlateSpec(fixture);
    assert.equal(Object.hasOwn(assemblyInput, 'natural_patterns'), false);
    assert.equal(Object.hasOwn(assemblyInput, 'natural_law'), false);
    assert.equal(Object.hasOwn(compiled.plateSpec, 'natural_patterns'), false);
    assert.equal(Object.hasOwn(compiled.plateSpec, 'natural_law'), false);
  }
});

test('unsupported Natural Law pattern IDs fail closed', () => {
  assert.throws(
    () => validateNaturalPatternIds(['UNIVERSAL_MAGIC_PATTERN']),
    (error) => error instanceof KdxNaturalLawError && error.code === 'UNKNOWN_NATURAL_PATTERN',
  );
});

test('pattern/operator incompatibility fails closed before any runtime behavior', () => {
  const fixture = byId('KDX-SEM-IMPERMANENCE');
  const invalid = {
    ...fixture,
    operators: ['OBSERVE'],
    natural_patterns: ['SYMMETRY_BREAKING'],
  };
  assert.throws(
    () => deriveNaturalLawProfile(invalid),
    (error) => error instanceof KdxNaturalLawError && error.code === 'NATURAL_PATTERN_OPERATOR_MISMATCH',
  );
});

test('pattern/geometry incompatibility fails closed before any runtime behavior', () => {
  const fixture = byId('KDX-SEM-OBSERVER');
  const invalid = {
    ...fixture,
    geometry: { ...fixture.geometry, primitives: ['POINT_CENTER'] },
    natural_patterns: ['VORONOI_DELAUNAY'],
  };
  assert.throws(
    () => deriveNaturalLawProfile(invalid),
    (error) => error instanceof KdxNaturalLawError && error.code === 'NATURAL_PATTERN_GEOMETRY_MISMATCH',
  );
});

test('IMPERMANENCE produces mutation/recursion hints without changing its semantic memory contract', () => {
  const fixture = byId('KDX-SEM-IMPERMANENCE');
  const profile = deriveNaturalLawProfile(fixture);
  assert.deepEqual(profile.pattern_ids, ['SYMMETRY_BREAKING', 'NESTED_RECURSION']);
  assert.ok(profile.layer_hints.motion.includes('PERTURB'));
  assert.ok(profile.layer_hints.motion.includes('INWARD_SCALE_TRANSITION'));
  assert.equal(fixture.memory.effect, 'RESIDUE');
  assert.equal(fixture.return.effect, 'RETURNED_FORM');
});

test('INTERDEPENDENCE exposes network/neighborhood hints but leaves explicit Junction route slate untouched', () => {
  const fixture = byId('KDX-SEM-INTERDEPENDENCE');
  const profile = deriveNaturalLawProfile(fixture);
  const beforeRoutes = fixture.route_slate.map((route) => ({ ...route }));
  assert.deepEqual(profile.pattern_ids, ['ADAPTIVE_TRANSPORT_NETWORK', 'VORONOI_DELAUNAY']);
  assert.ok(profile.layer_hints.information_architecture.includes('ADAPTIVE_CONNECTION_EMPHASIS'));
  assert.ok(profile.layer_hints.information_architecture.includes('SEMANTIC_TERRITORIES'));
  assert.deepEqual(fixture.route_slate, beforeRoutes);
  assert.equal(fixture.interaction.selection_required, true);
});

test('OBSERVER uses deep-representation compression only as a methodological trace', () => {
  const fixture = byId('KDX-SEM-OBSERVER');
  const profile = deriveNaturalLawProfile(fixture);
  assert.deepEqual(profile.pattern_ids, ['DEEP_REPRESENTATION_COMPRESSION']);
  assert.ok(profile.layer_hints.return.includes('GEOMETRIC_MEMORY_SIGNATURE'));
  assert.ok(profile.epistemic_trace[0].prohibited_inferences.includes('KODEX_IMPLEMENTS_AMPLITUHEDRON'));
  assert.equal(fixture.memory.effect, 'TRACE');
});
