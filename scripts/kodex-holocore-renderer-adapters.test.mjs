import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LOW_RES_RASTER_DEFAULTS,
  makeRasterStars,
  phaseAt,
  rasterSignalState,
} from '../src/kodex/holocore/renderers/LowResRasterRenderer.js';
import {
  HOLOCORE_RENDERER_KINDS,
  IMPLEMENTED_HOLOCORE_RENDERER_KINDS,
  HOLOCORE_SURFACE_KINDS,
  RASTER_SIGNAL_RENDERER_SPEC,
  RENDERER_ADAPTER_STATUS,
} from '../src/kodex/holocore/renderers/registry.js';

test('renderer taxonomy separates content renderers from surface pipelines', () => {
  assert.deepEqual(HOLOCORE_RENDERER_KINDS, [
    'ascii-field',
    'raster2d-lowres',
    'webgl-shader',
    'artwork-adapter',
  ]);
  assert.deepEqual(IMPLEMENTED_HOLOCORE_RENDERER_KINDS, ['ascii-field', 'raster2d-lowres']);
  assert.deepEqual(HOLOCORE_SURFACE_KINDS, ['none', 'crt-webgl']);
  assert.equal(RENDERER_ADAPTER_STATUS['webgl-shader'], 'ADMITTED_NOT_YET_ADAPTED');
  assert.equal(RENDERER_ADAPTER_STATUS['artwork-adapter'], 'ADMITTED_NOT_YET_ADAPTED');
});

test('raster signal spec encodes low-resolution-first behavior and fallback', () => {
  assert.equal(RASTER_SIGNAL_RENDERER_SPEC.rendererKind, 'raster2d-lowres');
  assert.equal(RASTER_SIGNAL_RENDERER_SPEC.surfaceKind, 'crt-webgl');
  assert.deepEqual(RASTER_SIGNAL_RENDERER_SPEC.internalResolution, [320, 240]);
  assert.equal(RASTER_SIGNAL_RENDERER_SPEC.visualFps, 15);
  assert.equal(RASTER_SIGNAL_RENDERER_SPEC.loopMs, 24_000);
  assert.equal(RASTER_SIGNAL_RENDERER_SPEC.reducedMotion, 'STATIC_PHASE');
  assert.equal(RASTER_SIGNAL_RENDERER_SPEC.fallback, 'SOURCE_CANVAS_PIXELATED');
  assert.match(RASTER_SIGNAL_RENDERER_SPEC.copyBoundary, /^NO_EXTERNAL_/);
});

test('phase helper closes exactly at the declared 24 second seam', () => {
  assert.equal(phaseAt(0), 0);
  assert.equal(phaseAt(LOW_RES_RASTER_DEFAULTS.loopMs), 0);
  assert.equal(phaseAt(LOW_RES_RASTER_DEFAULTS.loopMs * 9), 0);
  assert.ok(Math.abs(phaseAt(12_000) - Math.PI) < 1e-12);
});

test('raster signal state closes and pointer perturbation stays bounded', () => {
  const pointer = { x: 0.93, y: 0.06, active: true };
  const start = rasterSignalState(0, pointer);
  const seam = rasterSignalState(24_000, pointer);

  for (const key of ['phase', 'pointerX', 'pointerY', 'objectYaw', 'objectPitch', 'ringRadius', 'rasterPhase', 'paletteIndex', 'scanY']) {
    assert.ok(Math.abs(start[key] - seam[key]) < 1e-12, `${key}: ${start[key]} vs ${seam[key]}`);
  }

  assert.ok(Math.abs(start.pointerX) <= 0.045);
  assert.ok(Math.abs(start.pointerY) <= 0.035);
  assert.ok(start.scanY >= 0 && start.scanY <= 239);
});

test('deterministic star generator is stable and remains inside the internal raster', () => {
  const a = makeRasterStars();
  const b = makeRasterStars();
  assert.deepEqual(a, b);
  assert.equal(a.length, 148);

  for (const star of a) {
    assert.ok(star.x >= 0 && star.x < 320);
    assert.ok(star.y >= 0 && star.y < 240);
    assert.ok(star.depth >= 0.15 && star.depth <= 1);
    assert.ok(star.size === 1 || star.size === 2);
  }
});
