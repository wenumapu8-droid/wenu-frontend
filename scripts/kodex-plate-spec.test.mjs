import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

const grammar = new URL('../src/lib/kodex/grammar/', import.meta.url);
const schema = JSON.parse(await fs.readFile(new URL('kdx_plate_spec.schema.json', grammar), 'utf8'));
const registry = JSON.parse(await fs.readFile(new URL('kdx_element_registry.v0.1.json', grammar), 'utf8'));
const registered = new Map(registry.elements.map((element) => [element.element_id, element]));
const plateTypes = new Set(schema.properties.plate_type.enum);
const lenses = new Set(schema.properties.observer_lens.enum);
const qaValues = new Set(schema.properties.qa_requirements.items.enum);

function validate(spec) {
  const errors = [];
  const required = schema.required;
  for (const field of required) if (!Object.hasOwn(spec, field)) errors.push(`missing:${field}`);
  if (!plateTypes.has(spec.plate_type)) errors.push('plate_type');
  if (!lenses.has(spec.observer_lens)) errors.push('observer_lens');
  if (spec.responsive_profile?.primary_shell !== '100dvh') errors.push('primary_shell');
  if ((spec.motion_profile?.high_priority_count ?? 99) > 2) errors.push('motion_budget');
  if (!Array.isArray(spec.provenance_refs) || spec.provenance_refs.length < 1) errors.push('provenance');
  if (!Array.isArray(spec.qa_requirements) || spec.qa_requirements.some((item) => !qaValues.has(item))) errors.push('qa_requirements');
  for (const slot of spec.slots || []) {
    if (slot.element_id == null) {
      if (slot.required) errors.push(`unfilled_required_slot:${slot.slot_id}`);
      continue;
    }
    const element = registered.get(slot.element_id);
    if (!element) errors.push(`unregistered_element:${slot.element_id}`);
    else {
      if (['HOLD', 'DEPRECATED'].includes(element.status)) errors.push(`blocked_element:${slot.element_id}`);
      if (!element.allowed_plate_types.includes(spec.plate_type)) errors.push(`plate_incompatible:${slot.element_id}`);
    }
  }
  if (spec.plate_type === 'JUNCTION_PLATE') {
    if (!Array.isArray(spec.route_slate) || spec.route_slate.length < 2 || spec.route_slate.length > 5) errors.push('junction_route_bounds');
  }
  if (spec.plate_type === 'ACTIVATOR_PLATE') {
    const art = spec.artwork_contract;
    if (spec.primary_payload?.payload_type !== 'ARTWORK') errors.push('activator_payload');
    if (!art || art.full_view_required !== true || art.preserve_aspect !== true || art.crop_allowed !== false || art.recolor_source_allowed !== false || art.distort_source_allowed !== false) errors.push('artwork_integrity');
    if (!spec.activation_profile || spec.activation_profile.environment_only !== true) errors.push('activation_environment');
    if (!spec.qa_requirements?.includes('NO_CROP')) errors.push('no_crop_qa');
  }
  return errors;
}

const common = {
  version: '0.1.0', seed: 'golden-seed-01', scene_state: 'ARCHIVE', semantic_node: 'SCI-BIOLOGY', observer_lens: 'NAKED_EYE',
  communication_mode: 'EDITORIAL', macro_signal: 'LIVING SYSTEMS', copy_slots: [],
  motion_profile: { element_ids: [], high_priority_count: 0 }, activation_profile: null, route_slate: [],
  provenance_refs: ['drive:27_KODEX_DEEP_NAVIGATION_ENGINE'],
  responsive_profile: { desktop: '12-column', mobile: 'recomposed 4-column', primary_shell: '100dvh' },
  fallback_profile: { reduced_motion: 'static semantic state', no_webgl: 'DOM/SVG semantic fallback' },
  qa_requirements: ['SCHEMA', 'PROVENANCE', 'RIGHTS', '100DVH', 'MOBILE', 'KEYBOARD', 'FOCUS', 'REDUCED_MOTION', 'DETERMINISM']
};

const knowledge = {
  ...structuredClone(common), plate_id: 'KDX-PLATE-KNOWLEDGE-001', plate_type: 'KNOWLEDGE_PLATE',
  primary_payload: { payload_type: 'CONCEPT', payload_ref: 'SCI-BIOLOGY', status: 'IMPLEMENTED_CANDIDATE' },
  slots: [{ slot_id: 'composition', slot_type: 'MACRO_COMPOSITION', required: true, element_id: 'KDX_G02_SPECIMEN_DOSSIER' }],
  allowed_element_families: ['GRID', 'MOTION', 'EFFECT']
};

const junction = {
  ...structuredClone(common), plate_id: 'KDX-PLATE-JUNCTION-001', plate_type: 'JUNCTION_PLATE', scene_state: 'DESCENT',
  primary_payload: { payload_type: 'MAP', payload_ref: 'ROUTE-SLATE', status: 'IMPLEMENTED_CANDIDATE' },
  slots: [{ slot_id: 'composition', slot_type: 'SYSTEM_MAP', required: true, element_id: 'KDX_G04_DENSE_ORBITAL_FIELD' }],
  allowed_element_families: ['GRID', 'MOTION'],
  route_slate: [{ target_node: 'TECH-NETWORK', role: 'BRIDGE' }, { target_node: 'ART-FORM', role: 'SERENDIPITY' }],
  qa_requirements: [...common.qa_requirements, 'ROUTE_BOUNDS']
};

const activator = {
  ...structuredClone(common), plate_id: 'KDX-PLATE-ACTIVATOR-001', plate_type: 'ACTIVATOR_PLATE', scene_state: 'COSMOLOGY',
  primary_payload: { payload_type: 'ARTWORK', payload_ref: 'OCN-TOR-001', status: 'IMPLEMENTED_CANDIDATE' },
  slots: [{ slot_id: 'environment', slot_type: 'TRANSFORMATION_FIELD', required: true, element_id: 'KDX-FX-006' }],
  allowed_element_families: ['EFFECT', 'MOTION'],
  artwork_contract: { artwork_id: 'OCN-TOR-001', full_view_required: true, preserve_aspect: true, crop_allowed: false, recolor_source_allowed: false, distort_source_allowed: false, source_bytes_renderable: false },
  activation_profile: { activation_id: 'INWARD_SCALE', explicit_action_required: true, environment_only: true },
  qa_requirements: [...common.qa_requirements, 'NO_CROP']
};

test('three primary PlateSpec fixtures satisfy explicit hard invariants', () => {
  assert.deepEqual(validate(knowledge), []);
  assert.deepEqual(validate(junction), []);
  assert.deepEqual(validate(activator), []);
});

test('JUNCTION_PLATE rejects fewer than two or more than five routes', () => {
  const tooFew = structuredClone(junction); tooFew.route_slate = [{ target_node: 'A', role: 'CONTINUITY' }];
  const tooMany = structuredClone(junction); tooMany.route_slate = Array.from({ length: 6 }, (_, i) => ({ target_node: `N${i}`, role: 'CONTINUITY' }));
  assert.ok(validate(tooFew).includes('junction_route_bounds'));
  assert.ok(validate(tooMany).includes('junction_route_bounds'));
});

test('ACTIVATOR_PLATE rejects crop, source mutation, or non-environment activation', () => {
  const broken = structuredClone(activator);
  broken.artwork_contract.crop_allowed = true;
  broken.artwork_contract.recolor_source_allowed = true;
  broken.activation_profile.environment_only = false;
  const errors = validate(broken);
  assert.ok(errors.includes('artwork_integrity'));
  assert.ok(errors.includes('activation_environment'));
});

test('PlateSpec rejects unregistered, HOLD, and plate-incompatible element IDs', () => {
  const unknown = structuredClone(knowledge); unknown.slots[0].element_id = 'KDX-NOT-REGISTERED';
  const hold = structuredClone(knowledge); hold.slots[0].element_id = 'KDX_G05_BIOMETRIC_CLOCK';
  const incompatible = structuredClone(junction); incompatible.slots[0].element_id = 'KDX-FX-001';
  assert.ok(validate(unknown).some((error) => error.startsWith('unregistered_element:')));
  assert.ok(validate(hold).some((error) => error.startsWith('blocked_element:')));
  assert.ok(validate(incompatible).some((error) => error.startsWith('plate_incompatible:')));
});
