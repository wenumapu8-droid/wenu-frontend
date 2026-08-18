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

const byId = (id) => KDX_SEMANTIC_IR_FIXTURES.find((fixture) => fixture.id === id);

test('Semantic IR is explicitly a pre-Assembly adapter, not a parallel runtime', () => {
  assert.equal(KDX_SEMANTIC_IR_PROFILE.role, 'PRE_ASSEMBLY_ADAPTER');
  assert.equal(KDX_SEMANTIC_IR_PROFILE.createsParallelRuntime, false);
  assert.equal(KDX_SEMANTIC_IR_PROFILE.mutatesAssemblyOS, false);
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
  }
});

test('same Semantic IR + seed compiles to the same PlateSpec', () => {
  const fixture = byId('KDX-SEM-IMPERMANENCE');
  const first = compileSemanticIrToPlateSpec(fixture);
  const second = compileSemanticIrToPlateSpec(fixture);
  assert.deepEqual(first.plateSpec, second.plateSpec);
  assert.deepEqual(first.semanticTrace, second.semanticTrace);
});

test('IMPERMANENCE preserves the semantic chain without forcing it into renderer-specific fields', () => {
  const fixture = byId('KDX-SEM-IMPERMANENCE');
  const trace = buildSemanticTrace(fixture);
  const assemblyInput = compileSemanticIrToAssemblyInput(fixture);
  assert.deepEqual(trace.operators, ['MANIFEST', 'MUTATE', 'ERODE', 'INHERIT']);
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
});

test('unknown semantic operators fail closed before Assembly OS', () => {
  const fixture = byId('KDX-SEM-IMPERMANENCE');
  const invalid = { ...fixture, operators: ['MANIFEST', 'MAGICALLY_PROVE'] };
  assert.throws(
    () => validateSemanticIr(invalid),
    (error) => error instanceof KdxSemanticIrError && error.code === 'INVALID_OPERATOR',
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
