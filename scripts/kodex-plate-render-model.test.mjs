import test from 'node:test';
import assert from 'node:assert/strict';
import { assemblePlateSpec } from '../src/lib/kodex/grammar/deterministic-assembler.js';
import { KDX_GOLDEN_PLATE_CASES } from '../src/lib/kodex/grammar/golden-plate-benchmark.v0.1.js';
import { compilePlateRenderModel, KdxRenderModelError } from '../src/lib/kodex/grammar/plate-render-model.js';

test('all 12 Golden Plate specs compile to renderer-safe registered-ID models', () => {
  for (const entry of KDX_GOLDEN_PLATE_CASES) {
    const spec = assemblePlateSpec(entry.node, entry.plate_type, entry.seed);
    const model = compilePlateRenderModel(spec);
    assert.equal(model.plate_id, spec.plate_id);
    assert.equal(model.shell.height, '100dvh');
    assert.equal(model.shell.page_scroll, false);
    assert.equal(model.evidence.render_status, 'NOT_RUN');
    assert.equal(model.evidence.browser_validated, false);
    assert.equal(model.evidence.human_curator_acceptance, 'NOT_RUN');
    assert.ok(model.slots.every((slot) => slot.element?.element_id === slot.element_id));
    assert.ok(model.motion.every((element) => spec.motion_profile.element_ids.includes(element.element_id)));
  }
});

test('protected artwork render model preserves no-crop contract and does not invent source approval', () => {
  const entry = KDX_GOLDEN_PLATE_CASES.find((candidate) => candidate.node.artwork_contract);
  assert.ok(entry, 'benchmark must include a protected artwork activator');
  const spec = assemblePlateSpec(entry.node, entry.plate_type, entry.seed);
  const model = compilePlateRenderModel(spec);
  assert.equal(model.artwork.object_fit, 'contain');
  assert.equal(model.artwork.crop_allowed, false);
  assert.equal(model.artwork.recolor_allowed, false);
  assert.equal(model.artwork.distort_allowed, false);
  assert.equal(model.artwork.render_source_bytes, spec.artwork_contract.source_bytes_renderable === true);
});

test('renderer hard-fails on unregistered element IDs', () => {
  const entry = KDX_GOLDEN_PLATE_CASES[0];
  const spec = assemblePlateSpec(entry.node, entry.plate_type, entry.seed);
  const broken = structuredClone(spec);
  broken.slots[0].element_id = 'KDX_FAKE_ELEMENT';
  assert.throws(
    () => compilePlateRenderModel(broken),
    (error) => error instanceof KdxRenderModelError && error.code === 'UNREGISTERED_ELEMENT',
  );
});
