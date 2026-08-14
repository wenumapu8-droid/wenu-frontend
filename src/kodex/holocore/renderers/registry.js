import { LowResRasterRenderer } from './LowResRasterRenderer.js';
import { CrtSurfaceAdapter } from './CrtSurfaceAdapter.js';

export const HOLOCORE_RENDERER_KINDS = Object.freeze([
  'ascii-field',
  'raster2d-lowres',
  'webgl-shader',
  'artwork-adapter',
]);

export const IMPLEMENTED_HOLOCORE_RENDERER_KINDS = Object.freeze([
  'ascii-field',
  'raster2d-lowres',
]);

export const HOLOCORE_SURFACE_KINDS = Object.freeze([
  'none',
  'crt-webgl',
]);

export const RENDERER_ADAPTER_STATUS = Object.freeze({
  'ascii-field': 'IMPLEMENTED_EXISTING_RUNTIME',
  'raster2d-lowres': 'IMPLEMENTED_FEATURE_PROOF',
  'webgl-shader': 'ADMITTED_NOT_YET_ADAPTED',
  'artwork-adapter': 'ADMITTED_NOT_YET_ADAPTED',
});

export const RASTER_SIGNAL_RENDERER_SPEC = Object.freeze({
  id: 'raster-signal',
  rendererKind: 'raster2d-lowres',
  surfaceKind: 'crt-webgl',
  internalResolution: Object.freeze([320, 240]),
  visualFps: 15,
  loopMs: 24_000,
  reducedMotion: 'STATIC_PHASE',
  fallback: 'SOURCE_CANVAS_PIXELATED',
  provenance: 'KODEX_SYNTHETIC_REFERENCE_ABSTRACTION',
  referenceFamily: 'RASTER_EARLY_COMPUTER',
  copyBoundary: 'NO_EXTERNAL_PIXELS_LOGOS_TYPOGRAPHY_MODELS_OR_SOURCE_LAYOUT',
});

export function createRasterSignalAdapter({ canvas, container, reducedMotion } = {}) {
  const renderer = new LowResRasterRenderer(canvas, { reducedMotion });
  const surface = new CrtSurfaceAdapter({
    source: canvas,
    container,
    preset: 'machine',
    reducedMotion,
  });

  return Object.freeze({
    spec: RASTER_SIGNAL_RENDERER_SPEC,
    renderer,
    surface,
    start() {
      renderer.start();
      surface.start();
    },
    stop() {
      renderer.stop();
      surface.stop();
    },
    destroy() {
      surface.destroy();
      renderer.destroy();
    },
  });
}
