import { clamp, smoothstep, hash21 } from '../engine/math.js';
import { holocoreOrbitalRGXScene } from './holocore-orbital-rgx.js';
import {
  HOLOCORE_RGX_PROFILE_IDS,
  resolveHoloCoreRGXProfile,
} from '../../holocore/reference-profiles/rgx-family.js';

const TAU = Math.PI * 2;

const viewport = (x, y) => ({ u: (x + 1) * 0.5, v: (y + 1) * 0.5 });

function ellipseCoords(u, v, cx, cy, rx, ry) {
  const dx = (u - cx) / Math.max(rx, 0.0001);
  const dy = (v - cy) / Math.max(ry, 0.0001);
  return { dx, dy, r: Math.hypot(dx, dy), a: Math.atan2(dy, dx) };
}

function ellipseRing(u, v, cx, cy, rx, ry, thickness = 0.035) {
  const { r } = ellipseCoords(u, v, cx, cy, rx, ry);
  return Math.exp(-Math.abs(r - 1) / thickness);
}

function ellipseFill(u, v, cx, cy, rx, ry, softness = 0.2) {
  const { r } = ellipseCoords(u, v, cx, cy, rx, ry);
  return 1 - smoothstep(Math.max(0, 1 - softness), 1, r);
}

function circleRing(u, v, cx, cy, radius, thickness = 0.025) {
  const r = Math.hypot(u - cx, v - cy);
  return Math.exp(-Math.abs(r - radius) / thickness);
}

function segment(u, v, x1, y1, x2, y2, width = 0.01) {
  const vx = x2 - x1;
  const vy = y2 - y1;
  const wx = u - x1;
  const wy = v - y1;
  const denom = vx * vx + vy * vy || 1;
  const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / denom));
  const px = x1 + vx * t;
  const py = y1 + vy * t;
  return Math.exp(-Math.hypot(u - px, v - py) / width);
}

function radialNoise(u, v, phase, seed, strength = 0.15) {
  const cellX = Math.floor(u * 96);
  const cellY = Math.floor(v * 82);
  const n = hash21(cellX + seed, cellY);
  const stream = Math.sin(v * 38 - phase * 5 + cellX * 0.09) * 0.5 + 0.5;
  return smoothstep(0.72, 0.96, n * 0.72 + stream * 0.28) * strength;
}

function boundedPointer(pointer, amountX = 0.015, amountY = 0.01) {
  if (!pointer?.active) return { x: 0, y: 0 };
  return {
    x: (pointer.x * 2 - 1) * amountX,
    y: (pointer.y * 2 - 1) * amountY,
  };
}

function radialCore(profile, u, v, phase, seed) {
  const p = profile.params;
  const dx = u - 0.5;
  const dy = v - 0.5;
  const r = Math.hypot(dx, dy);
  const a = Math.atan2(dy, dx);
  const pulse = 1 + Math.sin(phase * 2) * 0.025;
  const core = 1 - smoothstep(p.coreR * 0.65, p.coreR * pulse, r);
  let cage = 0;
  for (let i = 0; i < p.bands; i += 1) {
    const radius = p.coreR * 1.7 + (p.cageR - p.coreR * 1.7) * (i / Math.max(1, p.bands - 1));
    cage = Math.max(cage, circleRing(u, v, 0.5, 0.5, radius, 0.007 + i * 0.0015));
  }
  const ribs = Math.pow(Math.abs(Math.cos(a * (p.spokes / 2) + phase)), 24) *
    smoothstep(p.coreR * 1.3, p.coreR * 1.8, r) * (1 - smoothstep(p.cageR * 0.86, p.cageR, r));
  const halo = Math.exp(-r / 0.16) * 0.3;
  return clamp(core + cage * 0.62 + ribs * 0.42 + halo + radialNoise(u, v, phase, seed, 0.14));
}

function portal(profile, u, v, phase, seed) {
  const p = profile.params;
  const dx = u - 0.5;
  const dy = v - 0.5;
  const r = Math.hypot(dx, dy);
  const a = Math.atan2(dy, dx);
  const aperture = circleRing(u, v, 0.5, 0.5, p.apertureR * (1 + Math.sin(phase) * 0.025), 0.012);
  const bandPhase = ((r - p.apertureR) / Math.max(0.001, p.outerR - p.apertureR)) * p.bands * Math.PI;
  const bands = Math.pow(Math.abs(Math.sin(bandPhase + Math.sin(phase) * 0.25)), 18) *
    smoothstep(p.apertureR * 0.9, p.apertureR * 1.05, r) * (1 - smoothstep(p.outerR * 0.98, p.outerR * 1.04, r));
  const stabilizers = Math.pow(Math.abs(Math.cos(a * (p.stabilizers / 2) - phase * 0.5)), 30) *
    smoothstep(p.apertureR * 1.4, p.apertureR * 2.2, r) * (1 - smoothstep(p.outerR * 0.82, p.outerR, r));
  const axial = Math.exp(-Math.abs(dx) / 0.009) * (1 - smoothstep(p.outerR, p.outerR * 1.1, r));
  return clamp(aperture + bands * 0.72 + stabilizers * 0.46 + axial * 0.36 + radialNoise(u, v, phase, seed, 0.08));
}

function vortex(profile, u, v, phase, seed) {
  const p = profile.params;
  const dx = u - 0.5;
  const dy = v - 0.5;
  const r = Math.hypot(dx, dy);
  const a = Math.atan2(dy, dx);
  const gate = 1 - smoothstep(p.outerR * 0.9, p.outerR, r);
  const spiralPhase = a * p.arms - Math.log(r + 0.025) * p.turns * 2.2 - phase * 1.5;
  const arms = Math.pow(0.5 + 0.5 * Math.cos(spiralPhase), 14) * gate * smoothstep(p.coreR, p.coreR * 1.5, r);
  let rings = 0;
  for (let i = 1; i <= p.rings; i += 1) {
    rings = Math.max(rings, circleRing(u, v, 0.5, 0.5, p.coreR + i * ((p.outerR - p.coreR) / p.rings), 0.0045));
  }
  const core = 1 - smoothstep(p.coreR * 0.45, p.coreR, r);
  return clamp(core * 0.9 + arms * 0.82 + rings * 0.2 + radialNoise(u, v, phase, seed, 0.13));
}

function helix(profile, u, v, phase, seed) {
  const p = profile.params;
  const y = clamp((v - p.y0) / Math.max(0.001, p.y1 - p.y0));
  const gate = smoothstep(p.y0 - 0.03, p.y0 + 0.01, v) * (1 - smoothstep(p.y1 - 0.01, p.y1 + 0.03, v));
  const angle = y * p.cycles * TAU + phase;
  const xA = 0.5 + Math.sin(angle) * p.amplitude;
  const xB = 0.5 - Math.sin(angle) * p.amplitude;
  const strandA = Math.exp(-Math.abs(u - xA) / 0.008) * gate;
  const strandB = Math.exp(-Math.abs(u - xB) / 0.008) * gate;
  const rungPhase = Math.abs(Math.sin(y * p.rungCount * Math.PI));
  const rung = Math.pow(1 - rungPhase, 10) *
    (1 - smoothstep(Math.abs(xA - 0.5) + 0.035, Math.abs(xA - 0.5) + 0.07, Math.abs(u - 0.5))) * gate;
  const axis = Math.exp(-Math.abs(u - 0.5) / 0.025) * 0.12 * gate;
  return clamp(Math.max(strandA, strandB) * 0.96 + rung * 0.56 + axis + radialNoise(u, v, phase, seed, 0.08));
}

function tree(profile, u, v, phase, seed) {
  const p = profile.params;
  const breathe = Math.sin(phase) * 0.012;
  let value = segment(u, v, 0.5, p.trunkBase, 0.5, p.trunkTop, 0.012);
  const branchYs = [0.47, 0.4, 0.33, 0.27];
  const branchWidths = [0.24, 0.2, 0.16, 0.12];
  branchYs.slice(0, p.branchLevels).forEach((y, index) => {
    const width = branchWidths[index] + breathe * (index + 1) * 0.25;
    value = Math.max(
      value,
      segment(u, v, 0.5, y + 0.035, 0.5 - width, y - 0.085, 0.008),
      segment(u, v, 0.5, y + 0.035, 0.5 + width, y - 0.085, 0.008),
      segment(u, v, 0.5 - width * 0.55, y - 0.03, 0.5 - width * 1.18, y - 0.12, 0.006),
      segment(u, v, 0.5 + width * 0.55, y - 0.03, 0.5 + width * 1.18, y - 0.12, 0.006),
    );
  });
  const rootBase = p.trunkBase;
  value = Math.max(
    value,
    segment(u, v, 0.5, rootBase, 0.24, rootBase + p.rootDepth, 0.008),
    segment(u, v, 0.5, rootBase, 0.76, rootBase + p.rootDepth, 0.008),
    segment(u, v, 0.5, rootBase + 0.04, 0.38, rootBase + p.rootDepth * 0.9, 0.006),
    segment(u, v, 0.5, rootBase + 0.04, 0.62, rootBase + p.rootDepth * 0.9, 0.006),
  );
  for (let i = 1; i <= p.archiveRings; i += 1) {
    value = Math.max(value, ellipseRing(u, v, 0.5, 0.5, 0.12 + i * 0.085, 0.045 + i * 0.03, 0.03) * 0.28);
  }
  const canopy = ellipseFill(u, v, 0.5, 0.29, p.canopyR, 0.19, 0.42) * radialNoise(u, v, phase, seed, 0.45);
  return clamp(value * 0.9 + canopy);
}

function skull(profile, u, v, phase, seed) {
  const p = profile.params;
  const skull = ellipseRing(u, v, p.cx, p.cy, p.skullRx, p.skullRy, 0.055);
  const craniumFill = ellipseFill(u, v, p.cx, p.cy - 0.035, p.skullRx * 0.9, p.skullRy * 0.78, 0.28) * 0.12;
  const leftEye = ellipseRing(u, v, p.cx - p.eyeDx, p.eyeY, 0.055, 0.043, 0.11);
  const rightEye = ellipseRing(u, v, p.cx + p.eyeDx, p.eyeY, 0.055, 0.043, 0.11);
  const nose = Math.max(
    segment(u, v, p.cx, p.eyeY + 0.035, p.cx - 0.025, p.eyeY + 0.12, 0.008),
    segment(u, v, p.cx, p.eyeY + 0.035, p.cx + 0.025, p.eyeY + 0.12, 0.008),
  );
  const jaw = Math.max(
    segment(u, v, p.cx - 0.12, p.cy + 0.13, p.cx - 0.075, p.jawY, 0.008),
    segment(u, v, p.cx + 0.12, p.cy + 0.13, p.cx + 0.075, p.jawY, 0.008),
    segment(u, v, p.cx - 0.075, p.jawY, p.cx + 0.075, p.jawY, 0.008),
  );
  const scan = Math.exp(-Math.abs(v - (0.18 + ((phase / TAU) % 1) * 0.62)) / 0.008) * ellipseFill(u, v, p.cx, p.cy, p.skullRx * 1.2, p.skullRy * 1.18, 0.25);
  return clamp(skull * 0.92 + craniumFill + Math.max(leftEye, rightEye) * 0.86 + nose * 0.72 + jaw * 0.82 + scan * 0.35 + radialNoise(u, v, phase, seed, 0.05));
}

function orbitMap(profile, u, v, phase, seed) {
  const p = profile.params;
  let value = 0;
  p.rings.forEach((radius, index) => {
    value = Math.max(value, circleRing(u, v, 0.5, 0.5, radius, 0.005 + index * 0.0007) * (0.72 - index * 0.06));
  });
  const core = ellipseFill(u, v, 0.5, 0.5, p.sourceR, p.sourceR, 0.32);
  const cross = p.axialCross
    ? Math.max(segment(u, v, 0.5, 0.08, 0.5, 0.92, 0.004), segment(u, v, 0.08, 0.5, 0.92, 0.5, 0.004)) * 0.22
    : 0;
  const wave = (Math.sin((Math.hypot(u - 0.5, v - 0.5) * 52) - phase * 2) * 0.5 + 0.5) * 0.08;
  return clamp(value + core * 0.9 + cross + wave + radialNoise(u, v, phase, seed, 0.06));
}

function eyes(profile, u, v, phase, seed) {
  const p = profile.params;
  const dx = u - 0.5;
  const dy = v - 0.5;
  const r = Math.hypot(dx, dy);
  const a = Math.atan2(dy, dx);
  let lattice = 0;
  p.rings.slice(1).forEach((radius, index) => {
    lattice = Math.max(lattice, circleRing(u, v, 0.5, 0.5, radius, 0.005) * (0.36 + index * 0.08));
  });
  const radial = Math.pow(Math.abs(Math.cos(a * 7 + phase * 0.25)), 36) * (1 - smoothstep(0.43, 0.47, r)) * 0.18;
  const centerEye = ellipseRing(u, v, 0.5, 0.5, 0.11, 0.045, 0.055) + ellipseFill(u, v, 0.5, 0.5, 0.025, 0.025, 0.3);
  return clamp(centerEye * 0.92 + lattice + radial + radialNoise(u, v, phase, seed, 0.12));
}

function heart(profile, u, v, phase, seed) {
  const p = profile.params;
  const pulse = 1 + Math.sin(phase * 2) * 0.025;
  const s = p.scale * pulse;
  const left = ellipseFill(u, v, p.cx - s * 0.22, p.cy - s * 0.22, s * 0.33, s * 0.3, 0.28);
  const right = ellipseFill(u, v, p.cx + s * 0.22, p.cy - s * 0.22, s * 0.33, s * 0.3, 0.28);
  const lower = ellipseFill(u, v, p.cx, p.cy + s * 0.07, s * 0.38, s * 0.52, 0.24);
  const cavity = ellipseFill(u, v, p.cx, p.cy - s * 0.12, s * 0.11, s * 0.13, 0.25);
  const body = Math.max(left, right, lower) * 0.52 + cavity * 0.32;
  const vesselA = segment(u, v, p.cx - 0.045, p.cy - s * 0.34, p.cx - 0.11, p.cy - s * 0.62, 0.007);
  const vesselB = segment(u, v, p.cx + 0.035, p.cy - s * 0.34, p.cx + 0.12, p.cy - s * 0.58, 0.007);
  let rings = 0;
  p.rings.forEach(radius => { rings = Math.max(rings, circleRing(u, v, p.cx, p.cy, radius, 0.005) * 0.16); });
  return clamp(body + Math.max(vesselA, vesselB) * 0.85 + rings + radialNoise(u, v, phase, seed, 0.07));
}

function source(profile, u, v, phase, seed) {
  const p = profile.params;
  const dx = u - 0.5;
  const dy = v - 0.43;
  const r = Math.hypot(dx, dy);
  const a = Math.atan2(dy, dx);
  const sphere = circleRing(u, v, 0.5, 0.43, p.sphereR, 0.008);
  const glow = Math.exp(-r / 0.13) * 0.38;
  const flower = Math.pow(Math.abs(Math.cos(a * (p.petals / 2))), 24) *
    smoothstep(p.sphereR * 0.25, p.sphereR * 0.5, r) * (1 - smoothstep(p.sphereR * 0.85, p.sphereR, r));
  let rings = 0;
  for (let i = 1; i <= p.rings; i += 1) {
    rings = Math.max(rings, circleRing(u, v, 0.5, 0.43, p.sphereR * (0.45 + i * 0.11), 0.004) * 0.24);
  }
  const horizon = Math.exp(-Math.abs(v - p.horizonY) / 0.006) * (1 - smoothstep(0.38, 0.49, Math.abs(u - 0.5)));
  const reflection = segment(u, v, 0.5, 0.43 + p.sphereR, 0.5, p.horizonY, 0.004) * 0.22;
  return clamp(sphere * 0.88 + glow + flower * 0.42 + rings + horizon * 0.42 + reflection + radialNoise(u, v, phase, seed, 0.05));
}

function returnGate(profile, u, v, phase, seed) {
  const p = profile.params;
  let portalField = 0;
  for (let i = 0; i < p.nested; i += 1) {
    const scale = 1 - i * 0.12;
    portalField = Math.max(portalField, ellipseRing(u, v, p.gateCx, p.gateCy, p.gateRx * scale, p.gateRy * scale, 0.018) * (0.74 - i * 0.06));
  }
  const pathHalf = p.pathWidth + Math.abs(v - p.horizonY) * 0.2;
  const path = (1 - smoothstep(pathHalf * 0.75, pathHalf, Math.abs(u - 0.5))) * smoothstep(p.gateCy, p.gateCy + 0.08, v) * 0.36;
  const horizon = Math.exp(-Math.abs(v - p.horizonY) / 0.006) * 0.38;
  const convergence = Math.exp(-Math.abs(u - 0.5) / 0.018) * (Math.sin((v * 24) + phase * 2) * 0.5 + 0.5) * 0.16;
  return clamp(portalField + path + horizon + convergence + radialNoise(u, v, phase, seed, 0.08));
}

function organism(profile, u, v, phase, seed, seedMode = false) {
  const p = profile.params;
  const breathe = 1 + Math.sin(phase) * (seedMode ? 0.015 : 0.025);
  const shell = ellipseRing(u, v, p.cx, p.cy, p.rx * breathe, p.ry * breathe, 0.032);
  const inner = ellipseRing(u, v, p.cx, p.cy, p.rx * 0.82, p.ry * 0.83, 0.04) * 0.42;
  let chambers = 0;
  for (let i = 0; i < p.chambers; i += 1) {
    const t = p.chambers <= 1 ? 0.5 : i / (p.chambers - 1);
    const cy = p.cy - p.ry * 0.58 + t * p.ry * 1.16;
    const width = p.rx * (0.42 + Math.sin(t * Math.PI) * 0.24);
    chambers = Math.max(chambers, ellipseRing(u, v, p.cx + Math.sin(i * 2.1) * p.rx * 0.08, cy, width, p.ry * 0.075, 0.1) * 0.68);
  }
  const axis = segment(u, v, p.cx, p.cy - p.ry * 0.88, p.cx, p.cy + p.ry * 0.88, 0.006) * 0.3;
  const data = radialNoise(u, v, phase, seed, seedMode ? 0.18 : 0.12) * ellipseFill(u, v, p.cx, p.cy, p.rx * 0.92, p.ry * 0.92, 0.24);
  return clamp(shell * 0.92 + inner + chambers + axis + data);
}

function fieldFor(profile, u, v, phase, pointer, seed) {
  switch (profile.motif) {
    case 'radial-core': return radialCore(profile, u, v, phase, seed);
    case 'portal': return portal(profile, u, v, phase, seed);
    case 'vortex': return vortex(profile, u, v, phase, seed);
    case 'helix': return helix(profile, u, v, phase, seed);
    case 'tree': return tree(profile, u, v, phase, seed);
    case 'skull': return skull(profile, u, v, phase, seed);
    case 'orbit-map': return orbitMap(profile, u, v, phase, seed);
    case 'eyes': return eyes(profile, u, v, phase, seed);
    case 'heart': return heart(profile, u, v, phase, seed);
    case 'source': return source(profile, u, v, phase, seed);
    case 'return': return returnGate(profile, u, v, phase, seed);
    case 'organism': return organism(profile, u, v, phase, seed, false);
    case 'seed': return organism(profile, u, v, phase, seed, true);
    default: return radialNoise(u, v, phase, seed, 0.1);
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
      return fieldFor(profile, u - shift.x, v - shift.y, phase, pointer, seed);
    },
  }));
}

export const HOLOCORE_RGX_SCENES = Object.freeze(Object.fromEntries(SCENES));

export function resolveHoloCoreRGXScene(id) {
  return SCENES.get(id) ?? SCENES.get('orbital-city');
}
