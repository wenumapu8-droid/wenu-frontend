import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

import {
  KDX_ASSEMBLER_PROFILE,
  KdxAssemblyError,
  assemblePlateSpec,
  getAssemblyEligibleElementIds,
  tryAssemblePlateSpec,
} from '../src/lib/kodex/grammar/deterministic-assembler.js';

const registry = JSON.parse(await fs.readFile(
  new URL('../src/lib/kodex/grammar/kdx_element_registry.v0.1.json', import.meta.url),
  'utf8',
));
const registered = new Map(registry.elements.map((element) => [element.element_id, element]));

const knowledgeNode = {
  node_id: 'SCI-BIOLOGY',
  title: 'Living Systems',
  scene_state: 'ARCHIVE',
  observer_lens: 'NAKED_EYE',
  communication_mode: 'EDITORIAL',
  macro_signal: 'LIVING SYSTEMS',
  provenance_refs: ['drive:27_KODEX_DEEP_NAVIGATION_ENGINE'],
  primary_payload: { payload_type: 'CONCEPT', payload_ref: 'SCI-BIOLOGY', status: 'IMPLEMENTED_CANDIDATE' },
};

const junctionNode = {
  node_id: 'TECH-NETWORK',
  title: 'Distributed Systems',
  scene_state: 'MACHINE',
  observer_lens: 'SYSTEM',
  provenance_refs: ['repo:src/lib/kodex/micro-universe.js#TECH-NETWORK'],
  route_slate: [
    { target_node: 'SCI-PATTERN', role: 'BRIDGE' },
    { target_node: 'ART-FORM', role: 'SERENDIPITY' },
    { target_node: 'TECH-CITY', role: 'CONTINUITY' },
  ],
};

const activatorNode = {
  node_id: 'ART-IMAGE',
  title: 'Seed Aperture',
  scene_state: 'COSMOLOGY',
  observer_lens: 'NAKED_EYE',
  provenance_refs: ['registry:OCN-TOR-001'],
  artwork_contract: {
    artwork_id: 'OCN-TOR-001',
    full_view_required: true,
    preserve_aspect: true,
    crop_allowed: false,
    recolor_source_allowed: false,
    distort_source_allowed: false,
    source_bytes_renderable: false,
  },
  activation_profile: {
    activation_id: 'INWARD_SCALE',
    explicit_action_required: true,
    environment_only: true,
  },
};

const livingFieldNode = {
  node_id: 'CON-RITUAL',
  title: 'Threshold Ritual',
  scene_state: 'COSMOLOGY',
  observer_lens: 'META',
  provenance_refs: ['repo:src/lib/kodex/micro-universe.js#CON-RITUAL'],
  primary_payload: { payload_type: 'FIELD', payload_ref: 'CON-RITUAL', status: 'IMPLEMENTED_CANDIDATE' },
  artwork_contract: null,
  activation_profile: {
    activation_id: 'KDX-FX-006',
    explicit_action_required: true,
    environment_only: true,
  },
};

function assertRegisteredSpec(spec) {
  const ids = [
    ...(spec.slots || []).map((slot) => slot.element_id).filter(Boolean),
    ...(spec.motion_profile?.element_ids || []),
  ];
  assert.ok(ids.length >= 1, 'assembled spec must contain at least one registered element');
  for (const id of ids) {
    const element = registered.get(id);
    assert.ok(element, `assembler invented or referenced unknown ID ${id}`);
    assert.notEqual(element.status, 'HOLD', `assembler selected HOLD element ${id}`);
    assert.notEqual(element.status, 'DEPRECATED', `assembler selected DEPRECATED element ${id}`);
    assert.equal(element.provenance?.status, 'VERIFIED');
    assert.equal(element.rights, 'PROJECT_SOURCE');
    assert.ok(element.allowed_plate_types.includes(spec.plate_type), `${id} is plate-incompatible`);
    assert.ok(element.allowed_scene_roles.includes(spec.scene_state), `${id} is scene-incompatible`);
  }
}

test('assembler profile declares deterministic, registry-only behavior', () => {
  assert.equal(KDX_ASSEMBLER_PROFILE.deterministic, true);
  assert.equal(KDX_ASSEMBLER_PROFILE.inventsElementIds, false);
  assert.equal(KDX_ASSEMBLER_PROFILE.registryVersion, registry.registry_version);
});

test('same node + plate_type + seed produces byte-equivalent PlateSpec data', () => {
  const a = assemblePlateSpec(knowledgeNode, 'KNOWLEDGE_PLATE', 'seed-alpha');
  const b = assemblePlateSpec(structuredClone(knowledgeNode), 'KNOWLEDGE_PLATE', 'seed-alpha');
  assert.deepEqual(a, b);
  assertRegisteredSpec(a);
  assert.equal(a.responsive_profile.primary_shell, '100dvh');
  assert.ok(a.qa_requirements.includes('DETERMINISM'));
});

test('seed variation changes selection when multiple safe registered candidates exist', () => {
  const eligible = getAssemblyEligibleElementIds(knowledgeNode, 'KNOWLEDGE_PLATE');
  assert.ok(eligible.length >= 2, `fixture requires >=2 safe candidates, received ${eligible.length}`);
  const selected = new Set();
  for (let i = 0; i < 24; i += 1) {
    const spec = assemblePlateSpec(knowledgeNode, 'KNOWLEDGE_PLATE', `seed-${i}`);
    selected.add(spec.slots[0].element_id);
    assertRegisteredSpec(spec);
  }
  assert.ok(selected.size >= 2, 'seeded assembler collapsed to one composition despite multiple eligible candidates');
});

test('JUNCTION_PLATE preserves prevalidated 2–5 user-choice routes and never invents route records', () => {
  const spec = assemblePlateSpec(junctionNode, 'JUNCTION_PLATE', 42017);
  assert.deepEqual(spec.route_slate, junctionNode.route_slate);
  assert.equal(spec.route_slate.length, 3);
  assert.ok(spec.qa_requirements.includes('ROUTE_BOUNDS'));
  assertRegisteredSpec(spec);
});

test('artwork ACTIVATOR_PLATE copies protected artwork constraints without source mutation', () => {
  const spec = assemblePlateSpec(activatorNode, 'ACTIVATOR_PLATE', 'ocn-protected-seed');
  assert.equal(spec.primary_payload.payload_type, 'ARTWORK');
  assert.equal(spec.primary_payload.payload_ref, 'OCN-TOR-001');
  assert.equal(spec.artwork_contract.full_view_required, true);
  assert.equal(spec.artwork_contract.preserve_aspect, true);
  assert.equal(spec.artwork_contract.crop_allowed, false);
  assert.equal(spec.artwork_contract.recolor_source_allowed, false);
  assert.equal(spec.artwork_contract.distort_source_allowed, false);
  assert.equal(spec.artwork_contract.source_bytes_renderable, false);
  assert.equal(spec.activation_profile.environment_only, true);
  assert.ok(spec.qa_requirements.includes('NO_CROP'));
  assertRegisteredSpec(spec);
});

test('living-field ACTIVATOR_PLATE preserves field semantics without fabricating artwork constraints', () => {
  const spec = assemblePlateSpec(livingFieldNode, 'ACTIVATOR_PLATE', 'field-seed');
  assert.equal(spec.primary_payload.payload_type, 'FIELD');
  assert.equal(spec.primary_payload.payload_ref, 'CON-RITUAL');
  assert.equal(spec.artwork_contract, null);
  assert.equal(spec.activation_profile.environment_only, true);
  assert.equal(spec.activation_profile.activation_id, 'KDX-FX-006');
  assert.ok(registered.has(spec.activation_profile.activation_id));
  assert.equal(spec.qa_requirements.includes('NO_CROP'), false);
  assertRegisteredSpec(spec);
});

test('hard failures are structured instead of repaired or improvised', () => {
  const noProvenance = structuredClone(knowledgeNode);
  noProvenance.provenance_refs = [];
  assert.throws(
    () => assemblePlateSpec(noProvenance, 'KNOWLEDGE_PLATE', 'x'),
    (error) => error instanceof KdxAssemblyError && error.code === 'MISSING_PROVENANCE',
  );

  const oneDoor = structuredClone(junctionNode);
  oneDoor.route_slate = [{ target_node: 'SCI-PATTERN', role: 'CONTINUITY' }];
  assert.throws(
    () => assemblePlateSpec(oneDoor, 'JUNCTION_PLATE', 'x'),
    (error) => error instanceof KdxAssemblyError && error.code === 'INVALID_ROUTE_BOUNDS',
  );

  const noActivation = { ...knowledgeNode, node_id: 'ACTIVATOR-MISSING', scene_state: 'COSMOLOGY' };
  assert.throws(
    () => assemblePlateSpec(noActivation, 'ACTIVATOR_PLATE', 'x'),
    (error) => error instanceof KdxAssemblyError && error.code === 'ACTIVATION_CONTRACT_BLOCK',
  );

  const invalidArt = structuredClone(activatorNode);
  invalidArt.artwork_contract.crop_allowed = true;
  const result = tryAssemblePlateSpec(invalidArt, 'ACTIVATOR_PLATE', 'x');
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'ARTWORK_INTEGRITY_BLOCK');

  const fieldWithArt = structuredClone(livingFieldNode);
  fieldWithArt.artwork_contract = structuredClone(activatorNode.artwork_contract);
  const fieldResult = tryAssemblePlateSpec(fieldWithArt, 'ACTIVATOR_PLATE', 'x');
  assert.equal(fieldResult.ok, false);
  assert.equal(fieldResult.error.code, 'LIVING_FIELD_ARTWORK_CONFLICT');
});

test('scene incompatibility returns NO_SAFE_ELEMENT rather than inventing an ID', () => {
  const impossible = {
    ...junctionNode,
    node_id: 'RETURN-JUNCTION-PROBE',
    scene_state: 'RETURN',
  };
  const result = tryAssemblePlateSpec(impossible, 'JUNCTION_PLATE', 'no-safe-element');
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'NO_SAFE_ELEMENT');
});
