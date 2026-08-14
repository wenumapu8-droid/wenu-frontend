import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

import { assemblePlateSpec } from '../src/lib/kodex/grammar/deterministic-assembler.js';
import {
  KDX_GOLDEN_PLATE_BENCHMARK_PROFILE,
  KDX_GOLDEN_PLATE_CASES,
  getGoldenPlateBenchmarkSummary,
} from '../src/lib/kodex/grammar/golden-plate-benchmark.v0.1.js';

const registry = JSON.parse(await fs.readFile(
  new URL('../src/lib/kodex/grammar/kdx_element_registry.v0.1.json', import.meta.url),
  'utf8',
));
const registeredIds = new Set(registry.elements.map((element) => element.element_id));

function selectedElementIds(spec) {
  return [
    ...(spec.slots || []).map((slot) => slot.element_id).filter(Boolean),
    ...(spec.motion_profile?.element_ids || []),
  ];
}

function assembleCorpus() {
  return KDX_GOLDEN_PLATE_CASES.map((entry) => ({
    entry,
    spec: assemblePlateSpec(entry.node, entry.plate_type, entry.seed),
  }));
}

test('golden corpus is exactly 12 plates with balanced four-domain coverage', () => {
  const summary = getGoldenPlateBenchmarkSummary();
  assert.equal(KDX_GOLDEN_PLATE_BENCHMARK_PROFILE.plateCount, 12);
  assert.equal(KDX_GOLDEN_PLATE_CASES.length, 12);
  assert.equal(summary.total, 12);
  assert.deepEqual(summary.byDomain, {
    science: 3,
    technology: 3,
    art: 3,
    consciousness: 3,
  });
  assert.equal(summary.byPlateType.ACTIVATOR_PLATE, 4);
  assert.equal(summary.protectedArtworkActivators, 3);
  assert.equal(summary.livingFieldActivators, 1);
  assert.equal(summary.activatorContractGap, null);
});

test('all 12 golden cases assemble successfully from registered IDs only', () => {
  const assembled = assembleCorpus();
  assert.equal(assembled.length, 12);
  const plateIds = new Set();
  for (const { entry, spec } of assembled) {
    assert.equal(spec.semantic_node, entry.node_id);
    assert.equal(spec.plate_type, entry.plate_type);
    assert.equal(spec.seed, entry.seed);
    assert.equal(spec.responsive_profile.primary_shell, '100dvh');
    assert.ok(spec.provenance_refs.length >= 1);
    assert.ok(spec.qa_requirements.includes('SCHEMA'));
    assert.ok(spec.qa_requirements.includes('MOBILE'));
    assert.ok(spec.qa_requirements.includes('KEYBOARD'));
    assert.ok(spec.qa_requirements.includes('REDUCED_MOTION'));
    assert.ok(spec.qa_requirements.includes('PERFORMANCE'));
    for (const id of selectedElementIds(spec)) assert.ok(registeredIds.has(id), `${entry.case_id} referenced unknown element ${id}`);
    assert.equal(plateIds.has(spec.plate_id), false, `duplicate plate_id ${spec.plate_id}`);
    plateIds.add(spec.plate_id);
  }
});

test('golden corpus is byte-deterministic for identical case inputs', () => {
  const first = assembleCorpus().map(({ spec }) => spec);
  const second = assembleCorpus().map(({ spec }) => spec);
  assert.deepEqual(second, first);
});

test('three protected artwork activators preserve Ocín source integrity', () => {
  const protectedActivators = assembleCorpus().filter(({ spec }) => spec.plate_type === 'ACTIVATOR_PLATE' && spec.primary_payload.payload_type === 'ARTWORK');
  assert.equal(protectedActivators.length, 3);
  for (const { spec } of protectedActivators) {
    assert.equal(spec.artwork_contract.full_view_required, true);
    assert.equal(spec.artwork_contract.preserve_aspect, true);
    assert.equal(spec.artwork_contract.crop_allowed, false);
    assert.equal(spec.artwork_contract.recolor_source_allowed, false);
    assert.equal(spec.artwork_contract.distort_source_allowed, false);
    assert.equal(spec.artwork_contract.source_bytes_renderable, false);
    assert.equal(spec.activation_profile.explicit_action_required, true);
    assert.equal(spec.activation_profile.environment_only, true);
    assert.ok(spec.qa_requirements.includes('NO_CROP'));
  }
});

test('CON-RITUAL is represented as one living-field activator without fake artwork semantics', () => {
  const fieldCases = assembleCorpus().filter(({ spec }) => spec.plate_type === 'ACTIVATOR_PLATE' && spec.primary_payload.payload_type === 'FIELD');
  assert.equal(fieldCases.length, 1);
  const [{ entry, spec }] = fieldCases;
  assert.equal(entry.node_id, 'CON-RITUAL');
  assert.equal(spec.artwork_contract, null);
  assert.equal(spec.primary_payload.payload_ref, 'CON-RITUAL');
  assert.equal(spec.activation_profile.environment_only, true);
  assert.ok(registeredIds.has(spec.activation_profile.activation_id), 'living-field activation must reference a registered production element ID');
  assert.equal(spec.qa_requirements.includes('NO_CROP'), false, 'living field must not fabricate artwork-specific NO_CROP semantics');
});

test('golden benchmark exposes composition diversity without treating diversity as correctness', () => {
  const assembled = assembleCorpus();
  const compositionIds = assembled.map(({ spec }) => spec.slots[0].element_id);
  const uniqueCompositionIds = new Set(compositionIds);
  const exactSignatures = new Set(assembled.map(({ spec }) => JSON.stringify({
    type: spec.plate_type,
    payload: spec.primary_payload.payload_type,
    composition: spec.slots[0].element_id,
    motion: spec.motion_profile.element_ids,
  })));
  assert.ok(uniqueCompositionIds.size >= 3, `benchmark collapsed to ${uniqueCompositionIds.size} composition IDs`);
  assert.ok(exactSignatures.size >= 4, `benchmark collapsed to ${exactSignatures.size} visual signatures`);
  console.log(JSON.stringify({
    benchmark: KDX_GOLDEN_PLATE_BENCHMARK_PROFILE.version,
    plates: assembled.length,
    uniqueCompositionIds: uniqueCompositionIds.size,
    uniqueVisualSignatures: exactSignatures.size,
    compositionIds: [...uniqueCompositionIds].sort(),
  }));
});
