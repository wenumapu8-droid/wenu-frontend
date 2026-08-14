import { clamp, smoothstep, hash21 } from '../engine/math.js';
import { orbitalCityRGXProfile, profileToField } from '../../holocore/reference-profiles/orbital-city-rgx.js';

const TAU = Math.PI * 2;
const FIELD_LAYERS = orbitalCityRGXProfile.layers.map(profileToField);
const STRUCTURAL_LAYERS = FIELD_LAYERS.filter(layer => layer.type === 'ring' || layer.type === 'habitat');
const ATMOSPHERE_LAYER = FIELD_LAYERS.find(layer => layer.type === 'cloud');
const PLANET_LAYER = FIELD_LAYERS.find(layer => layer.type === 'planet');
const HABITAT_LAYER = FIELD_LAYERS.find(layer => layer.type === 'habitat');

function ellipseRadius(x, y, layer, rx = layer.rx, ry = layer.ry) {
  const dx = (x - layer.cx) / Math.max(rx, 0.001);
  const dy = (y - layer.cy) / Math.max(ry, 0.001);
  return Math.hypot(dx, dy);
}

function ellipseRing(x, y, layer, thickness = 0.032) {
  return Math.exp(-Math.abs(ellipseRadius(x, y, layer) - 1) / thickness);
}

function ellipseFillScaled(x, y, layer, rxScale = 0.2, ryScale = 0.44, softness = 0.32) {
  const rx = Math.min(layer.rx * rxScale, 0.11);
  const ry = Math.min(layer.ry * ryScale, 0.035);
  const radius = ellipseRadius(x, y, layer, rx, ry);
  return 1 - smoothstep(Math.max(0, 1 - softness), 1, radius);
}

function fineConcentricRibs(x, y, layer) {
  const radius = ellipseRadius(x, y, layer);
  return Math.max(
    Math.exp(-Math.abs(radius - 0.78) / 0.025),
    Math.exp(-Math.abs(radius - 0.88) / 0.02),
    Math.exp(-Math.abs(radius - 1.08) / 0.024),
  );
}

function axisField(x, y, phase) {
  const pulse = 0.76 + 0.24 * (Math.sin(phase * 4) * 0.5 + 0.5);
  const core = Math.exp(-Math.abs(x) / 0.008) * pulse;
  const halo = Math.exp(-Math.abs(x) / 0.034) * 0.2;
  const gate = 1 - smoothstep(0.96, 1, Math.abs(y));
  return (core + halo) * gate;
}

function dataColumn(x, y, phase, seed) {
  const xCell = Math.floor((x + 1) * 118);
  const yCell = Math.floor((y + 1) * 96);
  const staticNoise = hash21(xCell + seed, yCell);
  const stream = Math.sin(y * 46 - phase * 8 + xCell * 0.17) * 0.5 + 0.5;
  const axial = Math.exp(-Math.abs(x) / 0.16);
  return axial * smoothstep(0.72, 0.96, staticNoise * 0.7 + stream * 0.3) * 0.22;
}

function atmosphereField(x, y, phase, seed) {
  if (!ATMOSPHERE_LAYER) return 0;
  const radius = ellipseRadius(x, y, ATMOSPHERE_LAYER);
  const mask = 1 - smoothstep(0.72, 1.08, radius);
  const xCell = Math.floor((x + 1) * 92);
  const yCell = Math.floor((y + 1) * 72);
  const n0 = hash21(xCell + seed, yCell);
  const n1 = hash21(Math.floor(xCell * 0.53 + 17), Math.floor(yCell * 0.61 + seed));
  const breathe = 0.88 + 0.12 * (Math.sin(phase * 2) * 0.5 + 0.5);
  return mask * smoothstep(0.48, 0.92, n0 * 0.67 + n1 * 0.33) * ATMOSPHERE_LAYER.weight * breathe;
}

function planetaryField(x, y, seed) {
  if (!PLANET_LAYER) return 0;
  const radius = ellipseRadius(x, y, PLANET_LAYER);
  const rim = Math.exp(-Math.abs(radius - 1) / 0.022);
  const surface = radius < 1
    ? smoothstep(0.77, 0.97, hash21(Math.floor((x + 1) * 130 + seed), Math.floor((y + 1) * 90))) * 0.16
    : 0;
  return rim * 0.72 + surface;
}

/**
 * Reference-grounded ORBITAL CITY field.
 *
 * No reference pixels are embedded. A normalized topology profile is shared
 * by this dense microglyph field and the SVG scaffold. Fine nodes and spokes
 * live in the vector layer instead of being recomputed for every ASCII cell;
 * that preserves definition while keeping the continuous loop affordable.
 */
export const holocoreOrbitalRGXScene = Object.freeze({
  id: 'holocore-orbital-rgx',
  index: 6,
  title: 'ORBITAL CITY · RGX',
  kicker: 'REFERENCE-GROUNDED HOLOCORE',
  body: 'THE REFERENCE IS NOT DISPLAYED. ITS STRUCTURE IS RE-EXECUTED.',
  command: 'RESOLVE STRUCTURE',
  message: 'MICROGLYPH FIELD · SHARED TOPOLOGY · CLOSED PHASE LOOP',
  loopSeconds: orbitalCityRGXProfile.loopSeconds,
  field(x, y, t, pointer, seed) {
    const phase = ((t % orbitalCityRGXProfile.loopSeconds) / orbitalCityRGXProfile.loopSeconds) * TAU;
    const px = (pointer.x * 2 - 1) * (pointer.active ? 0.018 : 0);
    const py = (pointer.y * 2 - 1) * (pointer.active ? 0.01 : 0);
    const sx = x - px;
    const sy = y - py;

    let architecture = 0;
    for (let index = 0; index < STRUCTURAL_LAYERS.length; index += 1) {
      const layer = STRUCTURAL_LAYERS[index];
      const ring = ellipseRing(sx, sy, layer, layer.type === 'habitat' ? 0.024 : 0.032);
      const hub = ellipseFillScaled(sx, sy, layer);
      architecture = Math.max(
        architecture,
        ring * layer.weight,
        hub * Math.min(1, layer.weight + 0.05),
      );
    }

    // The largest habitat ring keeps a few extra raster ribs; radial spokes
    // and orbit nodes are drawn once by the SVG scaffold above this field.
    if (HABITAT_LAYER) {
      architecture = Math.max(architecture, fineConcentricRibs(sx, sy, HABITAT_LAYER) * 0.76);
    }

    const railGate = smoothstep(-0.64, -0.58, sy) * (1 - smoothstep(0.76, 0.82, sy));
    const rails = Math.max(
      Math.exp(-Math.abs(sx - 0.105) / 0.009),
      Math.exp(-Math.abs(sx + 0.105) / 0.009),
      Math.exp(-Math.abs(sx - 0.245) / 0.008) * 0.7,
      Math.exp(-Math.abs(sx + 0.245) / 0.008) * 0.7,
    ) * railGate;

    const axis = axisField(sx, sy, phase);
    const stream = dataColumn(sx, sy, phase, seed);
    const atmosphere = atmosphereField(sx, sy, phase, seed);
    const planet = planetaryField(sx, sy, seed);

    // Sparse grid signal; the visible fine grid itself is CSS and therefore
    // does not consume per-cell trigonometric work.
    const gridX = Math.abs(((sx + 1) * 20) % 1 - 0.5) < 0.035 ? 0.018 : 0;
    const gridY = Math.abs(((sy + 1) * 16) % 1 - 0.5) < 0.035 ? 0.018 : 0;
    const technicalGrid = Math.min(gridX, gridY);

    return clamp(
      architecture * 0.92 +
      rails * 0.42 +
      axis * 0.68 +
      stream +
      atmosphere * 0.72 +
      planet * 0.72 +
      technicalGrid
    );
  },
});
