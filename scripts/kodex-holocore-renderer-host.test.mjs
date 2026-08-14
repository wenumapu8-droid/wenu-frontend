import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HOLOCORE_HOST_DEFAULT_RENDERER,
  HOLOCORE_HOST_RENDERER_IDS,
  normalizeHoloCoreRendererId,
  normalizeHoloCoreSpecimenId,
  resolveHoloCoreHostPlan,
} from '../src/kodex/holocore/renderers/host-plan.js';

test('HoloCore host exposes only implemented renderer technologies', () => {
  assert.deepEqual(HOLOCORE_HOST_RENDERER_IDS, ['ascii-field', 'raster2d-lowres', 'webgl-shader']);
  assert.equal(HOLOCORE_HOST_DEFAULT_RENDERER, 'ascii-field');
  assert.equal(normalizeHoloCoreRendererId('artwork-adapter'), 'ascii-field');
  assert.equal(normalizeHoloCoreRendererId('unknown'), 'ascii-field');
});

test('host plan preserves renderer-specific temporal truth contracts', () => {
  const ascii = resolveHoloCoreHostPlan('ascii-field', 'signal-core');
  const raster = resolveHoloCoreHostPlan('raster2d-lowres', 'signal-core');
  const webgl = resolveHoloCoreHostPlan('webgl-shader', 'signal-core');

  assert.equal(ascii.specimenId, 'signal-core');
  assert.equal(ascii.temporalContract, 'CLOSED_24S_LOOP');
  assert.equal(ascii.seamlessLoopClaim, true);
  assert.equal(ascii.surfaceKind, 'none');

  assert.equal(raster.specimenId, null);
  assert.equal(raster.temporalContract, 'CLOSED_24S_LOOP');
  assert.equal(raster.seamlessLoopClaim, true);
  assert.equal(raster.surfaceKind, 'crt-webgl');

  assert.equal(webgl.specimenId, null);
  assert.equal(webgl.temporalContract, 'AMBIENT_UNCLOSED');
  assert.equal(webgl.seamlessLoopClaim, false);
  assert.equal(webgl.surfaceKind, 'none');
});

test('invalid specimen only falls back inside the ASCII renderer plan', () => {
  const fallback = normalizeHoloCoreSpecimenId('not-a-specimen');
  assert.equal(fallback, 'orbital-city');
  assert.equal(resolveHoloCoreHostPlan('ascii-field', 'not-a-specimen').specimenId, 'orbital-city');
  assert.equal(resolveHoloCoreHostPlan('webgl-shader', 'not-a-specimen').specimenId, null);
});

test('renderer plan exposes accessibility/provenance/fallback metadata', () => {
  for (const renderer of HOLOCORE_HOST_RENDERER_IDS) {
    const plan = resolveHoloCoreHostPlan(renderer, 'orbital-city');
    assert.ok(plan.reducedMotion);
    assert.ok(plan.fallback);
    assert.match(plan.provenance, /^KODEX_/);
    assert.ok(plan.materiality);
    assert.ok(plan.label);
  }
});
