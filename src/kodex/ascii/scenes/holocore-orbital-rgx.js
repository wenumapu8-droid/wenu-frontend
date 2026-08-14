import { clamp, smoothstep, hash21 } from '../engine/math.js';
import { orbitalCityRGXProfile, profileToField } from '../../holocore/reference-profiles/orbital-city-rgx.js';

const TAU = Math.PI * 2;
const FIELD_LAYERS = orbitalCityRGXProfile.layers.map(profileToField);

function ellipseCoordinates(x, y, layer) {
  const dx = (x - layer.cx) / Math.max(layer.rx, 0.001);
  const dy = (y - layer.cy) / Math.max(layer.ry, 0.001);
  return { dx, dy, radius: Math.hypot(dx, dy), angle: Math.atan2(dy, dx) };
}

function ellipseRing(x, y, layer, thickness = 0.032) {
  const { radius } = ellipseCoordinates(x, y, layer);
  return Math.exp(-Math.abs(radius - 1) / thickness);
}

function ellipseFill(x, y, layer, softness = 0.18) {
  const { radius } = ellipseCoordinates(x, y, layer);
  return 1 - smoothstep(Math.max(0, 1 - softness), 1, radius);
}

function ringNodes(x, y, layer, phase, direction = 1) {
  if (!layer.nodes) return 0;
  const { radius, angle } = ellipseCoordinates(x, y, layer);
  const ring = Math.exp(-Math.abs(radius - 1) / 0.065);
  const lobes = Math.pow(Math.max(0, Math.cos(angle * layer.nodes - phase * direction)), 18);
  return ring * lobes;
}

function radialSpokes(x, y, layer, phase) {
  if (!layer.spokes) return 0;
  const { radius, angle } = ellipseCoordinates(x, y, layer);
  const radialMask = smoothstep(0.12, 0.24, radius) * (1 - smoothstep(0.86, 0.98, radius));
  const spokes = Math.pow(Math.abs(Math.cos(angle * (layer.spokes / 2) + phase)), 28);
  return radialMask * spokes;
}

function fineConcentricRibs(x, y, layer) {
  const { radius } = ellipseCoordinates(x, y, layer);
  const ribs = Math.max(
    Math.exp(-Math.abs(radius - 0.78) / 0.025),
    Math.exp(-Math.abs(radius - 0.88) / 0.02),
    Math.exp(-Math.abs(radius - 1.08) / 0.024),
  );
  return ribs;
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

function atmosphereField(x, y, layer, phase, seed) {
  const { radius } = ellipseCoordinates(x, y, layer);
  const mask = 1 - smoothstep(0.72, 1.08, radius);
  const xCell = Math.floor((x + 1) * 92);
  const yCell = Math.floor((y + 1) * 72);
  const n0 = hash21(xCell + seed, yCell);
  const n1 = hash21(Math.floor(xCell * 0.53 + 17), Math.floor(yCell * 0.61 + seed));
  const breathe = 0.88 + 0.12 * (Math.sin(phase * 2) * 0.5 + 0.5);
  return mask * smoothstep(0.48, 0.92, n0 * 0.67 + n1 * 0.33) * layer.weight * breathe;
}

function planetaryField(x, y, layer, seed) {
  const { radius } = ellipseCoordinates(x, y, layer);
  const rim = Math.exp(-Math.abs(radius - 1) / 0.022);
  const inside = radius < 1 ? 1 : 0;
  const surface = inside
    ? smoothstep(0.77, 0.97, hash21(Math.floor((x + 1) * 130 + seed), Math.floor((y + 1) * 90))) * 0.16
    : 0;
  return rim * 0.72 + surface;
}

/**
 * Reference-grounded ORBITAL CITY field.
 *
 * This is not an image filter and does not embed reference pixels. The field
 * is generated from a normalized topology profile shared with the vector
 * scaffold: atmosphere -> crown -> platforms -> habitat ring -> service
 * orbit -> planetary interface. The ASCII layer therefore resolves the same
 * structural hierarchy that the crisp scaffold draws above it.
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
    let signals = 0;
    let atmosphere = 0;
    let planet = 0;

    FIELD_LAYERS.forEach((layer, index) => {
      if (layer.type === 'cloud') {
        atmosphere = Math.max(atmosphere, atmosphereField(sx, sy, layer, phase, seed));
        return;
      }
      if (layer.type === 'planet') {
        planet = Math.max(planet, planetaryField(sx, sy, layer, seed));
        return;
      }

      const ring = ellipseRing(sx, sy, layer, layer.type === 'habitat' ? 0.024 : 0.032);
      const hubLayer = { ...layer, rx: Math.min(layer.rx * 0.2, 0.11), ry: Math.min(layer.ry * 0.44, 0.035) };
      const hub = ellipseFill(sx, sy, hubLayer, 0.32);
      const nodes = ringNodes(sx, sy, layer, phase * (index % 2 === 0 ? 2 : 3), index % 2 === 0 ? 1 : -1);
      const ribs = layer.type === 'habitat' ? fineConcentricRibs(sx, sy, layer) : 0;
      const spokes = layer.type === 'habitat' ? radialSpokes(sx, sy, layer, -phase) : 0;

      architecture = Math.max(
        architecture,
        ring * layer.weight,
        hub * Math.min(1, layer.weight + 0.05),
        ribs * 0.78,
        spokes * 0.48,
      );
      signals = Math.max(signals, nodes * 0.88);
    });

    // Vertical structural rails inferred from the axial reference hierarchy.
    const railGate = smoothstep(-0.64, -0.58, sy) * (1 - smoothstep(0.76, 0.82, sy));
    const rails = Math.max(
      Math.exp(-Math.abs(sx - 0.105) / 0.009),
      Math.exp(-Math.abs(sx + 0.105) / 0.009),
      Math.exp(-Math.abs(sx - 0.245) / 0.008) * 0.7,
      Math.exp(-Math.abs(sx + 0.245) / 0.008) * 0.7,
    ) * railGate;

    const axis = axisField(sx, sy, phase);
    const stream = dataColumn(sx, sy, phase, seed);

    // Faint technical field keeps empty zones alive without masking the
    // reference-grounded hierarchy.
    const gridX = Math.exp(-Math.abs(((sx + 1) * 20) % 1 - 0.5) / 0.028);
    const gridY = Math.exp(-Math.abs(((sy + 1) * 16) % 1 - 0.5) / 0.028);
    const technicalGrid = Math.min(gridX, gridY) * 0.035;

    return clamp(
      architecture * 0.9 +
      signals * 0.68 +
      rails * 0.44 +
      axis * 0.68 +
      stream +
      atmosphere * 0.72 +
      planet * 0.72 +
      technicalGrid
    );
  },
});
