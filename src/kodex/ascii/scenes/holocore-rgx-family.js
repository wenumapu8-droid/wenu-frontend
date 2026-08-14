import { clamp, smoothstep, hash21 } from '../engine/math.js';
import { holocoreOrbitalRGXScene } from './holocore-orbital-rgx.js';
import {
  HOLOCORE_RGX_PROFILE_IDS,
  resolveHoloCoreRGXProfile,
} from '../../holocore/reference-profiles/rgx-family.js';

const TAU = Math.PI * 2;
const viewport = (x, y) => ({ u: (x + 1) * 0.5, v: (y + 1) * 0.5 });

function ellipseMetric(u, v, cx, cy, rx, ry) {
  const dx = (u - cx) / Math.max(rx, 0.0001);
  const dy = (v - cy) / Math.max(ry, 0.0001);
  return Math.sqrt(dx * dx + dy * dy);
}

function ellipseMetricSquared(u, v, cx, cy, rx, ry) {
  const dx = (u - cx) / Math.max(rx, 0.0001);
  const dy = (v - cy) / Math.max(ry, 0.0001);
  return dx * dx + dy * dy;
}

function ellipseRing(u, v, cx, cy, rx, ry, thickness = 0.035) {
  const r = ellipseMetric(u, v, cx, cy, rx, ry);
  return Math.exp(-Math.abs(r - 1) / thickness);
}

function ellipseFill(u, v, cx, cy, rx, ry, softness = 0.2) {
  const r = ellipseMetric(u, v, cx, cy, rx, ry);
  return 1 - smoothstep(Math.max(0, 1 - softness), 1, r);
}

function circleMetric(u, v, cx = 0.5, cy = 0.5) {
  const dx = u - cx;
  const dy = v - cy;
  return Math.sqrt(dx * dx + dy * dy);
}

function circleRingFromR(r, radius, thickness = 0.025) {
  return Math.exp(-Math.abs(r - radius) / thickness);
}

function axialLine(value, center, width = 0.01) {
  return Math.exp(-Math.abs(value - center) / width);
}

function cheapNoise(u, v, phase, seed, strength = 0.12) {
  const cx = Math.floor(u * 82);
  const cy = Math.floor(v * 70);
  const n = hash21(cx + seed, cy);
  const stream = Math.sin(v * 31 - phase * 4 + cx * 0.07) * 0.5 + 0.5;
  return smoothstep(0.74, 0.96, n * 0.76 + stream * 0.24) * strength;
}

function boundedPointer(pointer, amountX = 0.015, amountY = 0.01) {
  if (!pointer?.active) return { x: 0, y: 0 };
  return {
    x: (pointer.x * 2 - 1) * amountX,
    y: (pointer.y * 2 - 1) * amountY,
  };
}

// Exact topology lives in the SVG scaffold. Canvas supplies the moving signal
// volume only, so microglyph density does not require re-solving fine geometry
// for every cell on every frame.
function radialCore(profile, u, v, phase, seed) {
  const p = profile.params;
  const dx = u - 0.5;
  const dy = v - 0.5;
  const r = Math.sqrt(dx * dx + dy * dy);
  const pulse = 1 + Math.sin(phase * 2) * 0.035;
  const core = 1 - smoothstep(p.coreR * 0.55, p.coreR * pulse, r);
  const cageHalo = circleRingFromR(r, p.cageR * 0.82, 0.035) * 0.18;
  const axial = axialLine(u, 0.5, 0.012) * (1 - smoothstep(p.cageR, p.cageR * 1.08, r)) * 0.14;
  return clamp(core * 0.9 + Math.exp(-r / 0.17) * 0.26 + cageHalo + axial + cheapNoise(u, v, phase, seed, 0.13));
}

function portal(profile, u, v, phase, seed) {
  const p = profile.params;
  const r = circleMetric(u, v);
  const pulse = 1 + Math.sin(phase) * 0.018;
  const aperture = circleRingFromR(r, p.apertureR * pulse, 0.015);
  const tunnel = Math.cos((r - p.apertureR) * 85 - phase * 2.4) * 0.5 + 0.5;
  const gate = smoothstep(p.apertureR * 0.9, p.apertureR * 1.1, r) * (1 - smoothstep(p.outerR * 0.9, p.outerR, r));
  const axis = axialLine(u, 0.5, 0.012) * gate * 0.18;
  return clamp(aperture * 0.9 + tunnel * gate * 0.32 + axis + cheapNoise(u, v, phase, seed, 0.08));
}

function vortex(profile, u, v, phase) {
  const p = profile.params;
  const dx = u - 0.5;
  const dy = v - 0.5;
  const r2 = dx * dx + dy * dy;
  const outer2 = p.outerR * p.outerR;
  const core2 = p.coreR * p.coreR;
  const gate = 1 - smoothstep(outer2 * 0.72, outer2, r2);
  const core = 1 - smoothstep(core2 * 0.2, core2, r2);
  // The SVG owns the exact five spiral polylines. This cartesian interference
  // field creates moving microglyph signal without atan2/log per cell.
  const flow = Math.sin((dx * 31 + dy * 23) - phase * 2) * 0.5 + 0.5;
  const counter = Math.sin((dx * 17 - dy * 29) + phase * 3) * 0.5 + 0.5;
  const interference = flow * counter * gate * (1 - smoothstep(core2, core2 * 3.4, r2));
  return clamp(core * 0.94 + interference * 0.62 + gate * 0.04);
}

function helix(profile, u, v, phase, seed) {
  const p = profile.params;
  const y = clamp((v - p.y0) / Math.max(0.001, p.y1 - p.y0));
  const gate = smoothstep(p.y0 - 0.03, p.y0 + 0.01, v) * (1 - smoothstep(p.y1 - 0.01, p.y1 + 0.03, v));
  const angle = y * p.cycles * TAU + phase;
  const wave = Math.sin(angle) * p.amplitude;
  const strandA = axialLine(u, 0.5 + wave, 0.009) * gate;
  const strandB = axialLine(u, 0.5 - wave, 0.009) * gate;
  const traveling = (Math.sin(y * p.rungCount * Math.PI - phase * 2) * 0.5 + 0.5) * axialLine(u, 0.5, 0.11) * gate * 0.18;
  return clamp(Math.max(strandA, strandB) * 0.88 + traveling + cheapNoise(u, v, phase, seed, 0.07));
}

function tree(profile, u, v, phase, seed) {
  const p = profile.params;
  const trunkGate = smoothstep(p.trunkTop - 0.02, p.trunkTop + 0.02, v) * (1 - smoothstep(p.trunkBase - 0.01, p.trunkBase + 0.03, v));
  const trunk = axialLine(u, 0.5, 0.012) * trunkGate;
  const canopyMetric = ellipseMetric(u, v, 0.5, 0.3, p.canopyR, 0.21);
  const canopy = (1 - smoothstep(0.62, 1, canopyMetric)) * cheapNoise(u, v, phase, seed, 0.42);
  const roots = v > p.trunkBase
    ? Math.max(
        axialLine(u, 0.5 - (v - p.trunkBase) * 0.72, 0.014),
        axialLine(u, 0.5 + (v - p.trunkBase) * 0.72, 0.014),
      ) * (1 - smoothstep(p.trunkBase + p.rootDepth * 0.82, p.trunkBase + p.rootDepth, v))
    : 0;
  return clamp(trunk * 0.86 + canopy + roots * 0.5 + cheapNoise(u, v, phase, seed, 0.045));
}

function skull(profile, u, v, phase) {
  const p = profile.params;
  const metric2 = ellipseMetricSquared(u, v, p.cx, p.cy, p.skullRx, p.skullRy);
  const shell = Math.exp(-Math.abs(metric2 - 1) / 0.1);
  const fill = (1 - smoothstep(0.4, 0.96, metric2)) * 0.11;
  const scanY = p.cy + Math.sin(phase) * p.skullRy * 0.72;
  const scan = Math.exp(-Math.abs(v - scanY) / 0.009) * (1 - smoothstep(0.84, 1.08, metric2)) * 0.36;
  const axial = axialLine(u, p.cx, 0.018) * (1 - smoothstep(0.65, 1, metric2)) * 0.08;
  return clamp(shell * 0.84 + fill + scan + axial);
}

function orbitMap(profile, u, v, phase, seed) {
  const p = profile.params;
  const r = circleMetric(u, v);
  const source = 1 - smoothstep(p.sourceR * 0.55, p.sourceR, r);
  const orbitalPulse = (Math.sin(r * 78 - phase * 2) * 0.5 + 0.5) * (1 - smoothstep(0.43, 0.48, r)) * 0.18;
  const cross = p.axialCross ? Math.max(axialLine(u, 0.5, 0.006), axialLine(v, 0.5, 0.006)) * 0.12 : 0;
  return clamp(source * 0.86 + orbitalPulse + cross + cheapNoise(u, v, phase, seed, 0.06));
}

function eyes(profile, u, v, phase, seed) {
  const r = circleMetric(u, v);
  const centerEye = ellipseRing(u, v, 0.5, 0.5, 0.11, 0.045, 0.06);
  const pupil = 1 - smoothstep(0.008, 0.026, r);
  const latticeWave = (Math.sin(r * 92 - phase * 2) * 0.5 + 0.5) * (1 - smoothstep(0.42, 0.46, r)) * 0.14;
  return clamp(centerEye * 0.86 + pupil * 0.9 + latticeWave + cheapNoise(u, v, phase, seed, 0.11));
}

function heart(profile, u, v, phase, seed) {
  const p = profile.params;
  const pulse = 1 + Math.sin(phase * 2) * 0.025;
  const s = p.scale * pulse;
  const left = ellipseFill(u, v, p.cx - s * 0.22, p.cy - s * 0.22, s * 0.33, s * 0.3, 0.28);
  const right = ellipseFill(u, v, p.cx + s * 0.22, p.cy - s * 0.22, s * 0.33, s * 0.3, 0.28);
  const lower = ellipseFill(u, v, p.cx, p.cy + s * 0.07, s * 0.38, s * 0.52, 0.24);
  const body = Math.max(left, right, lower) * 0.48;
  const core = ellipseFill(u, v, p.cx, p.cy - s * 0.04, s * 0.105, s * 0.14, 0.28) * 0.32;
  return clamp(body + core + cheapNoise(u, v, phase, seed, 0.065));
}

function source(profile, u, v, phase) {
  const p = profile.params;
  const dx = u - 0.5;
  const dy = v - 0.43;
  const r2 = dx * dx + dy * dy;
  const radius = p.sphereR * (1 + Math.sin(phase) * 0.018);
  const radius2 = radius * radius;
  const sphere = Math.exp(-Math.abs(r2 - radius2) / 0.009);
  const glow = 0.34 / (1 + r2 * 32);
  const radialWave = (Math.sin(r2 * 230 - phase * 2) * 0.5 + 0.5) * (1 - smoothstep(radius2 * 0.08, radius2 * 1.15, r2)) * 0.14;
  const horizon = Math.exp(-Math.abs(v - p.horizonY) / 0.008) * (1 - smoothstep(0.37, 0.5, Math.abs(u - 0.5))) * 0.28;
  return clamp(sphere * 0.82 + glow + radialWave + horizon);
}

function returnGate(profile, u, v, phase, seed) {
  const p = profile.params;
  const metric = ellipseMetric(u, v, p.gateCx, p.gateCy, p.gateRx, p.gateRy);
  const portal = Math.exp(-Math.abs(metric - 1) / 0.035);
  const recursion = (Math.sin(metric * p.nested * 22 - phase * 2) * 0.5 + 0.5) * (1 - smoothstep(0.88, 1.02, metric)) * 0.2;
  const pathHalf = p.pathWidth + Math.abs(v - p.horizonY) * 0.2;
  const path = (1 - smoothstep(pathHalf * 0.75, pathHalf, Math.abs(u - 0.5))) * smoothstep(p.gateCy, p.gateCy + 0.08, v) * 0.28;
  const horizon = Math.exp(-Math.abs(v - p.horizonY) / 0.008) * 0.28;
  return clamp(portal * 0.84 + recursion + path + horizon + cheapNoise(u, v, phase, seed, 0.055));
}

function organism(profile, u, v, phase, seed, seedMode = false) {
  const p = profile.params;
  const breathe = 1 + Math.sin(phase) * (seedMode ? 0.015 : 0.025);
  const metric = ellipseMetric(u, v, p.cx, p.cy, p.rx * breathe, p.ry * breathe);
  const shell = Math.exp(-Math.abs(metric - 1) / 0.035);
  const inner = Math.exp(-Math.abs(metric - 0.8) / 0.05) * 0.32;
  const axis = axialLine(u, p.cx, 0.008) * (1 - smoothstep(0.82, 1, metric)) * 0.22;
  const data = cheapNoise(u, v, phase, seed, seedMode ? 0.17 : 0.11) * (1 - smoothstep(0.72, 1, metric));
  return clamp(shell * 0.9 + inner + axis + data);
}

function fieldFor(profile, u, v, phase, seed) {
  switch (profile.motif) {
    case 'radial-core': return radialCore(profile, u, v, phase, seed);
    case 'portal': return portal(profile, u, v, phase, seed);
    case 'vortex': return vortex(profile, u, v, phase);
    case 'helix': return helix(profile, u, v, phase, seed);
    case 'tree': return tree(profile, u, v, phase, seed);
    case 'skull': return skull(profile, u, v, phase);
    case 'orbit-map': return orbitMap(profile, u, v, phase, seed);
    case 'eyes': return eyes(profile, u, v, phase, seed);
    case 'heart': return heart(profile, u, v, phase, seed);
    case 'source': return source(profile, u, v, phase);
    case 'return': return returnGate(profile, u, v, phase, seed);
    case 'organism': return organism(profile, u, v, phase, seed, false);
    case 'seed': return organism(profile, u, v, phase, seed, true);
    default: return cheapNoise(u, v, phase, seed, 0.1);
  }
}

const SCENES = new Map();
for (const id of HOLOCORE_RGX_PROFILE_IDS) {
  if (id === 'orbital-city') {
    SCENES.set(id, holocoreOrbitalRGXScene);
    continue;
  }
  const profile = resolveHoloCoreRGXProfile(id);
  SCENES.set(id, Object.freeze({
    id: `holocore-${id}-rgx`,
    index: 6,
    title: `${profile.title} · RGX`,
    kicker: 'REFERENCE-GROUNDED HOLOCORE',
    body: 'THE REFERENCE IS NOT DISPLAYED. ITS STRUCTURE IS RE-EXECUTED.',
    command: 'RESOLVE STRUCTURE',
    message: `${profile.motif.toUpperCase()} · MICROGLYPH FIELD · CLOSED PHASE LOOP`,
    loopSeconds: profile.loopSeconds,
    field(x, y, t, pointer, seed) {
      const phase = ((t % profile.loopSeconds) / profile.loopSeconds) * TAU;
      const shift = boundedPointer(pointer);
      const { u, v } = viewport(x, y);
      return fieldFor(profile, u - shift.x, v - shift.y, phase, seed);
    },
  }));
}

export const HOLOCORE_RGX_SCENES = Object.freeze(Object.fromEntries(SCENES));
export function resolveHoloCoreRGXScene(id) {
  return SCENES.get(id) ?? SCENES.get('orbital-city');
}
