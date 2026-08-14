import {
  HOLOCORE_DEFAULT_SPECIMEN_ID,
  HOLOCORE_SPECIMEN_IDS,
  resolveHoloCoreSpecimen,
} from '../registry.js';

export const HOLOCORE_HOST_RENDERER_IDS = Object.freeze([
  'ascii-field',
  'raster2d-lowres',
  'webgl-shader',
]);

export const HOLOCORE_HOST_DEFAULT_RENDERER = 'ascii-field';

const BASE_PLANS = Object.freeze({
  'ascii-field': Object.freeze({
    rendererKind: 'ascii-field',
    label: 'ASCII FIELD',
    materiality: 'GLYPH / SIGNAL DENSITY',
    temporalContract: 'CLOSED_24S_LOOP',
    seamlessLoopClaim: true,
    surfaceKind: 'none',
    reducedMotion: 'STATIC_PHASE',
    fallback: 'ASCII_CANVAS_STATIC_PHASE',
    provenance: 'KODEX_INTERNAL_RUNTIME',
  }),
  'raster2d-lowres': Object.freeze({
    rendererKind: 'raster2d-lowres',
    label: 'LOW-RES RASTER',
    materiality: '320×240 / LIMITED PALETTE / 15 FPS',
    temporalContract: 'CLOSED_24S_LOOP',
    seamlessLoopClaim: true,
    surfaceKind: 'crt-webgl',
    reducedMotion: 'STATIC_PHASE',
    fallback: 'PIXELATED_SOURCE_CANVAS',
    provenance: 'KODEX_SYNTHETIC_REFERENCE_ABSTRACTION',
  }),
  'webgl-shader': Object.freeze({
    rendererKind: 'webgl-shader',
    label: 'WEBGL SOURCE FIELD',
    materiality: 'INTERNAL KODEX SOURCE SHADER',
    temporalContract: 'AMBIENT_UNCLOSED',
    seamlessLoopClaim: false,
    surfaceKind: 'none',
    reducedMotion: 'STATIC_TIME_FRAME',
    fallback: 'STATIC_CANVAS_RETICLE',
    provenance: 'KODEX_INTERNAL_SHADER_REUSE',
  }),
});

export function normalizeHoloCoreRendererId(rendererId) {
  return HOLOCORE_HOST_RENDERER_IDS.includes(rendererId)
    ? rendererId
    : HOLOCORE_HOST_DEFAULT_RENDERER;
}

export function normalizeHoloCoreSpecimenId(specimenId) {
  return HOLOCORE_SPECIMEN_IDS.includes(specimenId)
    ? specimenId
    : HOLOCORE_DEFAULT_SPECIMEN_ID;
}

export function resolveHoloCoreHostPlan(rendererId, specimenId) {
  const normalizedRenderer = normalizeHoloCoreRendererId(rendererId);
  const base = BASE_PLANS[normalizedRenderer];
  const specimen = normalizedRenderer === 'ascii-field'
    ? resolveHoloCoreSpecimen(normalizeHoloCoreSpecimenId(specimenId))
    : null;

  return Object.freeze({
    ...base,
    specimenId: specimen?.id ?? null,
    specimenTitle: specimen?.title ?? (
      normalizedRenderer === 'raster2d-lowres' ? 'RASTER SIGNAL' : 'OBSERVE SOURCE FIELD'
    ),
    accent: specimen?.accent ?? (normalizedRenderer === 'raster2d-lowres' ? '#7de9ff' : '#b787ff'),
  });
}
