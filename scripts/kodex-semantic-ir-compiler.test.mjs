import test from 'node:test';
import assert from 'node:assert/strict';

import {
  KDX_SEMANTIC_IR_PROFILE,
  KdxSemanticIrError,
  buildSemanticTrace,
  compileSemanticIrToAssemblyInput,
  compileSemanticIrToPlateSpec,
  validateSemanticIr,
} from '../src/lib/kodex/grammar/semantic-ir-compiler.js';
import { KDX_SEMANTIC_IR_FIXTURES } from '../src/lib/kodex/grammar/semantic-ir-fixtures.v0.1.js';
import {
  KDX_GEOMETRIC_PRIMITIVES,
  KDX_GEOMETRIC_TRANSDUCTION_PROFILE,
} from '../src/lib/kodex/grammar/geometric-transduction-registry.v0.1.js';

const byId = (id) => KDX_SEMANTIC_IR_FIXTURES.find((fixture) => fixture.id === id);

test('Semantic IR is explicitly a pre-Assembly adapter, not a parallel runtime', () => {
  assert.equal(KDX_SEMANTIC_IR_PROFILE.role, 'PRE_ASSEMBLY_ADAPTER');
  assert.equal(KDX_SEMANTIC_IR_PROFILE.createsParallelRuntime, false);
  assert.equal(KDX_SEMANTIC_IR_PROFILE.mutatesAssemblyOS, false);
  assert.equal(KDX_SEMANTIC_IR_PROFILE.geometryRole, 'OPTIONAL_SEMANTIC_TRACE');
});

test('Geometric Transduction is a bounded semantic registry, not another runtime or Assembly OS', () => {
  assert.equal(KDX_GEOMETRIC_TRANSDUCTION_PROFILE.role, 'SEMANTIC_GEOMETRY_REGISTRY');
  assert.equal(KDX_GEOMETRIC_TRANSDUCTION_PROFILE.createsParallelRuntime, false);
  assert.equal(KDX_GEOMETRIC_TRANSDUCTION_PROFILE.mutatesAssemblyOS, false);
  assert.equal(KDX_GEOMETRIC_PRIMITIVES.length, 12);
});

test('all P0 principle fixtures validate and compile through the existing deterministic assembler', () => {
  assert.equal(KDX_SEMANTIC_IR_FIXTURES.length, 3);
  for (const fixture of KDX_SEMANTIC_IR_FIXTURES) {
    assert.equal(validateSemanticIr(fixture), true);
    const result = compileSemanticIrToPlateSpec(fixture);
    assert.equal(result.plateSpec.semantic_node, fixture.id);
    assert.equal(result.plateSpec.scene_state, fixture.scene_state);
    assert.equal(result.plateSpec.plate_type, fixture.plate_type);
    assert.deepEqual(result.semanticTrace.principles, fixture.principles);
    assert.deepEqual(result.semanticTrace.operators, fixture.operators);
    assert.deepEqual(result.semanticTrace.memory, fixture.memory);
    assert.deepEqual(result.semanticTrace.return, fixture.return);
    assert.deepEqual(result.semanticTrace.geometry.primitives, fixture.geometry.primitives);
    assert.equal(result.semanticTrace.geometry.evidence_class, fixture.geometry.evidence_class);
  }
});

test('same Semantic IR + geometry + seed compiles to the same PlateSpec and trace', () => {
  const fixture = byId('KDX-SEM-IMPERMANENCE');
  const first = compileSemanticIrToPlateSpec(fixture);
  const second = compileSemanticIrToPlateSpec(fixture);
  assert.deepEqual(first.plateSpec, second.plateSpec);
  assert.deepEqual(first.semanticTrace, second.semanticTrace);
});

test('geometry remains semantic trace and does not mutate Assembly OS input dialect', () => {
  const fixture = byId('KDX-SEM-INTERDEPENDENCE');
  const assemblyInput = compileSemanticIrToAssemblyInput(fixture);
  const trace = buildSemanticTrace(fixture);
  assert.equal(Object.hasOwn(assemblyInput, 'geometry'), false);
  assert.deepEqual(trace.geometry.primitives, ['LATTICE_FIELD', 'NESTED_SCALE']);
  assert.equal(trace.geometry.evidence_class, 'KODEX_SYMBOLIC');
});

test('IMPERMANENCE preserves the semantic chain without forcing it into renderer-specific fields', () => {
  const fixture = byId('KDX-SEM-IMPERMANENCE');
  const trace = buildSemanticTrace(fixture);
  const assemblyInput = compileSemanticIrToAssemblyInput(fixture);
  assert.deepEqual(trace.operators, ['MANIFEST', 'MUTATE', 'ERODE', 'INHERIT']);
  assert.deepEqual(trace.geometry.primitives, ['SYMMETRY_BREAK', 'SPIRAL_HELIX']);
  assert.equal(trace.memory.effect, 'RESIDUE');
  assert.equal(trace.return.effect, 'RETURNED_FORM');
  assert.equal(assemblyInput.scene_state, 'ARCHIVE');
  assert.equal(assemblyInput.primary_payload.payload_type, 'CONCEPT');
});

test('INTERDEPENDENCE requires explicit route choice and preserves the bounded Junction slate', () => {
  const fixture = byId('KDX-SEM-INTERDEPENDENCE');
  const result = compileSemanticIrToPlateSpec(fixture);
  assert.equal(fixture.interaction.selection_required, true);
  assert.equal(result.plateSpec.route_slate.length, 3);
  assert.deepEqual(result.plateSpec.route_slate.map((route) => route.role), ['BRIDGE', 'CONTINUITY', 'RETURN']);
  assert.equal(result.semanticTrace.memory.effect, 'ROUTE_SIGNATURE');
  assert.equal(result.semanticTrace.return.effect, 'THRESHOLD_PRIME');
});

test('OBSERVER compiles as an existing governed living-field activator, never a protected-art bypass', () => {
  const fixture = byId('KDX-SEM-OBSERVER');
  const result = compileSemanticIrToPlateSpec(fixture);
  assert.equal(result.plateSpec.primary_payload.payload_type, 'FIELD');
  assert.equal(result.plateSpec.artwork_contract, null);
  assert.equal(result.plateSpec.activation_profile.environment_only, true);
  assert.equal(result.plateSpec.activation_profile.explicit_action_required, true);
  assert.equal(result.semanticTrace.memory.effect, 'TRACE');
  assert.deepEqual(result.semanticTrace.geometry.primitives, ['POINT_CENTER', 'AXIS']);
});

test('unknown semantic operators fail closed before Assembly OS', () => {
  const fixture = byId('KDX-SEM-IMPERMANENCE');
  const invalid = { ...fixture, operators: ['MANIFEST', 'MAGICALLY_PROVE'] };
  assert.throws(
    () => validateSemanticIr(invalid),
    (error) => error instanceof KdxSemanticIrError && error.code === 'INVALID_OPERATOR',
  );
});

test('unknown geometric primitives fail closed before Assembly OS', () => {
  const fixture = byId('KDX-SEM-IMPERMANENCE');
  const invalid = {
    ...fixture,
    geometry: { ...fixture.geometry, primitives: ['UNIVERSAL_SECRET_SHAPE'] },
  };
  assert.throws(
    () => validateSemanticIr(invalid),
    (error) => error instanceof KdxSemanticIrError && error.code === 'UNKNOWN_GEOMETRY_PRIMITIVE',
  );
});

test('geometric primitives must have a declared operator and depth relationship', () => {
  const fixture = byId('KDX-SEM-OBSERVER');
  const invalid = {
    ...fixture,
    geometry: { ...fixture.geometry, primitives: ['TESSELLATION_PACKING'] },
  };
  assert.throws(
    () => validateSemanticIr(invalid),
    (error) => error instanceof KdxSemanticIrError && ['GEOMETRY_OPERATOR_MISMATCH', 'GEOMETRY_DEPTH_MISMATCH'].includes(error.code),
  );
});

test('Semantic IR P0 refuses direct protected artwork and keeps the existing protected adapter authoritative', () => {
  const fixture = byId('KDX-SEM-OBSERVER');
  const invalid = {
    ...fixture,
    manifestation: {
      ...fixture.manifestation,
      payload_type: 'ARTWORK',
      payload_ref: 'OCIN-PROTECTED-WORK',
    },
  };
  assert.throws(
    () => validateSemanticIr(invalid),
    (error) => error instanceof KdxSemanticIrError && error.code === 'PROTECTED_ARTWORK_ADAPTER_REQUIRED',
  );
});
