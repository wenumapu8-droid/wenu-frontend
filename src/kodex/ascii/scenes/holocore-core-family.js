import { clamp, smoothstep, hash21, rotate2 } from "../engine/math.js";

const TAU = Math.PI * 2;
const LOOP_SECONDS = 24;

const phaseOf = t => (((t % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS) / LOOP_SECONDS * TAU;
const gaussian = (distance, width) => Math.exp(-Math.abs(distance) / Math.max(width, 0.0001));

function ellipseRadius(x, y, cx, cy, rx, ry) {
  return Math.hypot((x - cx) / Math.max(rx, 0.001), (y - cy) / Math.max(ry, 0.001));
}

function ellipseRing(x, y, cx, cy, rx, ry, thickness = 0.04) {
  return gaussian(ellipseRadius(x, y, cx, cy, rx, ry) - 1, thickness);
}

function ellipseFill(x, y, cx, cy, rx, ry, softness = 0.14) {
  const radius = ellipseRadius(x, y, cx, cy, rx, ry);
  return 1 - smoothstep(Math.max(0, 1 - softness), 1, radius);
}

function pointGlow(x, y, cx, cy, radius = 0.08) {
  return Math.exp(-Math.hypot(x - cx, y - cy) / Math.max(radius, 0.001));
}

function lineGlow(x, y, x0, y0, x1, y1, width = 0.02) {
  const vx = x1 - x0;
  const vy = y1 - y0;
  const len2 = Math.max(vx * vx + vy * vy, 0.000001);
  const u = clamp(((x - x0) * vx + (y - y0) * vy) / len2);
  const px = x0 + vx * u;
  const py = y0 + vy * u;
  return gaussian(Math.hypot(x - px, y - py), width);
}

function scene(meta, field) {
  return Object.freeze({
    ...meta,
    loopSeconds: LOOP_SECONDS,
    field,
  });
}

export const holocoreSignalVortexScene = scene({
  id: "holocore-signal-vortex",
  index: 14,
  title: "SIGNAL VORTEX",
  kicker: "HOLOCORE · CONVERGENCE FIELD",
  body: "NOISE ENTERS. PATTERN EMERGES.",
  command: "TUNE COHERENCE",
  message: "RADIAL FLOW · TRANSLATION FIELD · CLOSED LOOP",
}, (x, y, t, pointer) => {
  const phase = phaseOf(t);
  const px = pointer.active ? (pointer.x * 2 - 1) * 0.055 : 0;
  const py = pointer.active ? (pointer.y * 2 - 1) * 0.04 : 0;
  const sx = x - px;
  const sy = y - py;
  const radius = Math.hypot(sx, sy * 1.06);
  const angle = Math.atan2(sy, sx);
  const spiralA = Math.sin(angle * 6 + radius * 22 - phase * 3) * 0.5 + 0.5;
  const spiralB = Math.sin(angle * 9 - radius * 29 + phase * 4) * 0.5 + 0.5;
  const annulus = smoothstep(0.13, 0.24, radius) * (1 - smoothstep(0.78, 0.98, radius));
  const flow = annulus * Math.max(spiralA * 0.72, spiralB * 0.56);
  const packet = annulus * (Math.sin(radius * 56 + phase * 6) * 0.5 + 0.5) * 0.34;
  const aperture = ellipseRing(sx, sy, 0, 0, 0.18, 0.13, 0.06) * 0.95;
  const halo = ellipseRing(sx, sy, 0, 0, 0.46, 0.42, 0.035) * 0.24;
  return clamp(flow * 0.76 + packet + aperture + halo);
});

export const holocoreDnaAscentScene = scene({
  id: "holocore-dna-ascent",
  index: 3,
  title: "DNA ASCENT",
  kicker: "HOLOCORE · LIVING CODE AXIS",
  body: "THE CODE IS READ. THE MEANING IS MADE.",
  command: "TRACE LINEAGE",
  message: "HELICAL AXIS · BIO/SYMBOLIC SPLIT · CLOSED LOOP",
}, (x, y, t, pointer) => {
  const phase = phaseOf(t);
  const px = pointer.active ? (pointer.x * 2 - 1) * 0.025 : 0;
  const sx = x - px;
  const wave = y * 9.2 + phase * 2;
  const amp = 0.28 + Math.sin(phase) * 0.015;
  const left = -amp * Math.sin(wave);
  const right = amp * Math.sin(wave);
  const strandA = gaussian(sx - left, 0.025) * (1 - smoothstep(0.91, 0.99, Math.abs(y)));
  const strandB = gaussian(sx - right, 0.025) * (1 - smoothstep(0.91, 0.99, Math.abs(y)));
  const rungPhase = Math.sin((y + 1) * 20 * Math.PI) * 0.5 + 0.5;
  const between = 1 - smoothstep(Math.abs(left) * 0.92, Math.abs(left) + 0.035, Math.abs(sx));
  const rungs = between * smoothstep(0.78, 0.98, rungPhase) * 0.58;
  const axis = gaussian(sx, 0.012) * 0.14;
  const ascent = pointGlow(sx, y, 0, -0.74 + Math.sin(phase) * 0.035, 0.12) * 0.36;
  return clamp(Math.max(strandA, strandB) * 0.92 + rungs + axis + ascent);
});

export const holocoreMemoryTreeScene = scene({
  id: "holocore-memory-tree",
  index: 15,
  title: "MEMORY TREE",
  kicker: "HOLOCORE · ARCHIVE ENGINE",
  body: "THE ARCHIVE GROWS THROUGH RETURN.",
  command: "TRACE MEMORY",
  message: "BRANCHING GRAPH · ROOT MIRROR · CLOSED LOOP",
}, (x, y, t, pointer, seed) => {
  const phase = phaseOf(t);
  const sway = Math.sin(phase) * 0.025;
  const trunk = lineGlow(x, y, 0, 0.64, sway, -0.28, 0.028);
  let branches = 0;
  const levels = [-0.18, -0.34, -0.49, -0.62];
  levels.forEach((cy, index) => {
    const spread = 0.34 + index * 0.075;
    const yEnd = cy - 0.19 - index * 0.015;
    branches = Math.max(
      branches,
      lineGlow(x, y, sway, cy + 0.08, -spread + Math.sin(phase + index) * 0.02, yEnd, 0.021),
      lineGlow(x, y, sway, cy + 0.08, spread - Math.sin(phase + index) * 0.02, yEnd, 0.021),
    );
  });
  let roots = 0;
  for (let index = 0; index < 5; index += 1) {
    const target = (index - 2) * 0.22;
    roots = Math.max(roots, lineGlow(x, y, 0, 0.52, target, 0.88, 0.02));
  }
  const crownMask = ellipseFill(x, y, sway, -0.47, 0.7, 0.43, 0.28);
  const crownNoise = hash21(Math.floor((x + 1) * 42 + seed), Math.floor((y + 1) * 38));
  const memoryNodes = crownMask * smoothstep(0.7, 0.96, crownNoise) * (0.4 + (Math.sin(phase * 3) * 0.5 + 0.5) * 0.34);
  const archiveRing = ellipseRing(x, y, 0, -0.06, 0.8, 0.86, 0.018) * 0.12;
  return clamp(Math.max(trunk, branches, roots) * 0.9 + memoryNodes + archiveRing);
});

export const holocoreSkullArchiveScene = scene({
  id: "holocore-skull-archive",
  index: 29,
  title: "SKULL ARCHIVE",
  kicker: "HOLOCORE · RELIC SCAN",
  body: "MORPHOLOGY IS EVIDENCE. MEANING IS A LAYER.",
  command: "SCAN RELIC",
  message: "CRANIAL DOSSIER · EVIDENCE/SYMBOL SPLIT · CLOSED LOOP",
}, (x, y, t, pointer) => {
  const phase = phaseOf(t);
  const dx = pointer.active ? (pointer.x * 2 - 1) * 0.025 : 0;
  const sx = x - dx;
  const cranial = ellipseRing(sx, y, 0, -0.17, 0.48, 0.6, 0.045);
  const cheekL = lineGlow(sx, y, -0.39, 0.05, -0.28, 0.46, 0.025);
  const cheekR = lineGlow(sx, y, 0.39, 0.05, 0.28, 0.46, 0.025);
  const jaw = ellipseRing(sx, y, 0, 0.38, 0.3, 0.25, 0.065) * smoothstep(0.2, 0.38, y);
  const eyeL = ellipseRing(sx, y, -0.18, -0.1, 0.11, 0.09, 0.11);
  const eyeR = ellipseRing(sx, y, 0.18, -0.1, 0.11, 0.09, 0.11);
  const nose = Math.max(
    lineGlow(sx, y, -0.025, 0.02, -0.09, 0.22, 0.02),
    lineGlow(sx, y, 0.025, 0.02, 0.09, 0.22, 0.02),
  );
  const scanY = -0.7 + ((Math.sin(phase) * 0.5 + 0.5) * 1.4);
  const scan = gaussian(y - scanY, 0.018) * (1 - smoothstep(0.45, 0.62, Math.abs(sx))) * 0.5;
  const reticle = ellipseRing(sx, y, 0, -0.08, 0.67, 0.72, 0.018) * 0.18;
  return clamp(Math.max(cranial, cheekL, cheekR, jaw, eyeL, eyeR, nose) * 0.9 + scan + reticle);
});

export const holocoreCosmologyOrbitScene = scene({
  id: "holocore-cosmology-orbit",
  index: 12,
  title: "COSMOLOGY ORBIT",
  kicker: "HOLOCORE · ORBIT MAP",
  body: "NAVIGATE THE FIELD. READ THE SIGNAL.",
  command: "MAP THE FIELD",
  message: "ORBITAL MAP · NODE GRAPH · CLOSED LOOP",
}, (x, y, t, pointer) => {
  const phase = phaseOf(t);
  const px = pointer.active ? (pointer.x * 2 - 1) * 0.03 : 0;
  const py = pointer.active ? (pointer.y * 2 - 1) * 0.03 : 0;
  const sx = x - px;
  const sy = y - py;
  const r = Math.hypot(sx, sy);
  const rings = Math.max(
    gaussian(r - 0.22, 0.014),
    gaussian(r - 0.4, 0.014),
    gaussian(r - 0.6, 0.014),
    gaussian(r - 0.8, 0.014),
  ) * 0.5;
  let nodes = pointGlow(sx, sy, 0, 0, 0.09) * 0.9;
  [0.22, 0.4, 0.6, 0.8].forEach((radius, index) => {
    const a = phase * (index % 2 === 0 ? 1 + index * 0.25 : -(1 + index * 0.2)) + index * 1.1;
    nodes = Math.max(nodes, pointGlow(sx, sy, Math.cos(a) * radius, Math.sin(a) * radius, 0.055 + index * 0.004));
  });
  const axes = Math.max(gaussian(sx, 0.009), gaussian(sy, 0.009)) * 0.12;
  return clamp(rings + nodes + axes);
});

export const holocoreFieldOfEyesScene = scene({
  id: "holocore-field-of-eyes",
  index: 2,
  title: "FIELD OF EYES",
  kicker: "HOLOCORE · OBSERVER NETWORK",
  body: "EVERY GAZE IS A NODE.",
  command: "OBSERVE",
  message: "RECIPROCAL GAZE · POINTER-ONLY INPUT · CLOSED LOOP",
}, (x, y, t, pointer) => {
  const phase = phaseOf(t);
  let field = 0;
  const rows = [-0.56, -0.28, 0, 0.28, 0.56];
  const cols = [-0.64, -0.32, 0, 0.32, 0.64];
  rows.forEach((cy, row) => {
    cols.forEach((cx, col) => {
      if ((row + col) % 2 === 1 && Math.abs(cx) > 0.5 && Math.abs(cy) > 0.45) return;
      const attention = pointer.active
        ? 1 - smoothstep(0.12, 0.8, Math.hypot(cx - (pointer.x * 2 - 1), cy - (pointer.y * 2 - 1)))
        : 0.35;
      const blink = 0.045 + (Math.sin(phase * 2 + row * 0.7 + col) * 0.5 + 0.5) * 0.018;
      const sclera = ellipseRing(x, y, cx, cy, 0.12, blink, 0.11);
      const pupil = pointGlow(x, y, cx + attention * 0.015, cy, 0.025) * (0.5 + attention * 0.5);
      field = Math.max(field, sclera * 0.66 + pupil);
    });
  });
  const dome = ellipseRing(x, y, 0, 0.14, 0.9, 0.82, 0.016) * 0.13;
  const center = ellipseRing(x, y, 0, 0, 0.22, 0.11, 0.07) * 0.35;
  return clamp(field + dome + center);
});

export const holocoreHeartChamberScene = scene({
  id: "holocore-heart-chamber",
  index: 5,
  title: "HEART CHAMBER",
  kicker: "HOLOCORE · NODE M",
  body: "WHAT YOU FEEL, YOU REMEMBER.",
  command: "INTEGRATE",
  message: "ANATOMICAL MOTIF · SIMULATED PULSE · CLOSED LOOP",
}, (x, y, t, pointer) => {
  const phase = phaseOf(t);
  const pulse = 1 + Math.sin(phase * 2) * 0.035;
  const sx = x / pulse;
  const sy = (y + 0.05) / pulse;
  const upperL = ellipseFill(sx, sy, -0.17, -0.2, 0.24, 0.23, 0.28);
  const upperR = ellipseFill(sx, sy, 0.17, -0.2, 0.24, 0.23, 0.28);
  const lower = ellipseFill(sx, sy, 0, 0.13, 0.34, 0.48, 0.24);
  const taper = 1 - smoothstep(0.24, 0.43, Math.abs(sx) + Math.max(0, sy) * 0.26);
  const heart = Math.max(upperL, upperR, lower * taper);
  const notch = pointGlow(sx, sy, 0, -0.31, 0.075);
  const shell = clamp(heart - notch * 0.72);
  const vessels = Math.max(
    lineGlow(sx, sy, -0.05, -0.18, -0.28, -0.58, 0.018),
    lineGlow(sx, sy, 0.04, -0.19, 0.2, -0.62, 0.018),
    lineGlow(sx, sy, 0.08, -0.08, 0.34, -0.42, 0.015),
  );
  const ringRadius = 0.57 + Math.sin(phase * 2) * 0.025;
  const fieldRing = ellipseRing(x, y, 0, -0.02, ringRadius, ringRadius * 0.9, 0.025) * 0.3;
  const pointerGlow = pointer.active ? pointGlow(x, y, pointer.x * 2 - 1, pointer.y * 2 - 1, 0.2) * 0.08 : 0;
  return clamp(shell * 0.78 + vessels * 0.72 + fieldRing + pointerGlow);
});

export const holocoreSourceChamberScene = scene({
  id: "holocore-source-chamber",
  index: 4,
  title: "SOURCE CHAMBER",
  kicker: "HOLOCORE · PURE POTENTIAL",
  body: "THE SOURCE IS NOT STORED. IT BRANCHES.",
  command: "RECOGNIZE",
  message: "LUMINOUS SPHERE · RADIAL FIELD · CLOSED LOOP",
}, (x, y, t, pointer) => {
  const phase = phaseOf(t);
  const driftX = pointer.active ? (pointer.x * 2 - 1) * 0.025 : 0;
  const driftY = pointer.active ? (pointer.y * 2 - 1) * 0.018 : 0;
  const sx = x - driftX;
  const sy = y - driftY;
  const sphereRadius = 0.28 + Math.sin(phase) * 0.012;
  const core = pointGlow(sx, sy, 0, -0.08, sphereRadius * 0.56);
  const shell = ellipseRing(sx, sy, 0, -0.08, sphereRadius, sphereRadius, 0.045) * 0.72;
  const r = Math.hypot(sx, sy + 0.08);
  const a = Math.atan2(sy + 0.08, sx);
  const petals = gaussian(r - (0.44 + Math.sin(a * 8 + phase * 2) * 0.055), 0.025) * 0.38;
  const horizon = gaussian(y - 0.56, 0.012) * (1 - smoothstep(0.72, 0.98, Math.abs(x))) * 0.16;
  return clamp(core * 0.72 + shell + petals + horizon);
});

export const holocoreReturnGateScene = scene({
  id: "holocore-return-gate",
  index: 6,
  title: "RETURN GATE",
  kicker: "HOLOCORE · REINTEGRATION",
  body: "RETURN WITH MEMORY. NOT TO THE SAME POINT.",
  command: "RETURN",
  message: "RECURSIVE PORTAL · MEMORY CONVERGENCE · CLOSED LOOP",
}, (x, y, t, pointer) => {
  const phase = phaseOf(t);
  const open = 1 + Math.sin(phase) * 0.03;
  let arches = 0;
  [0.34, 0.5, 0.68, 0.86].forEach((rx, index) => {
    const ry = rx * 1.15;
    const ring = ellipseRing(x / open, y, 0, 0.12, rx, ry, 0.025 + index * 0.004);
    arches = Math.max(arches, ring * (0.85 - index * 0.12));
  });
  const pathWidth = 0.08 + Math.max(0, y) * 0.18;
  const path = (1 - smoothstep(pathWidth, pathWidth + 0.04, Math.abs(x))) * smoothstep(0.18, 0.86, y) * 0.46;
  let fragments = 0;
  for (let index = 0; index < 7; index += 1) {
    const a = phase * (index % 2 ? -2 : 2) + index * 0.9;
    const radius = 0.62 - index * 0.055;
    const cx = Math.cos(a) * radius;
    const cy = Math.sin(a) * radius * 0.68 - 0.06;
    fragments = Math.max(fragments, pointGlow(x, y, cx, cy, 0.045) * 0.54);
  }
  const signature = ellipseRing(x, y, 0, -0.04, 0.18, 0.09, 0.07) * 0.36;
  const pointerTrace = pointer.active ? lineGlow(x, y, 0, 0.78, (pointer.x * 2 - 1) * 0.35, 0.22, 0.012) * 0.12 : 0;
  return clamp(arches + path + fragments + signature + pointerTrace);
});

export const holocoreLivingOrganismScene = scene({
  id: "holocore-living-organism",
  index: 13,
  title: "LIVING ORGANISM",
  kicker: "HOLOCORE · ORGANIC NODE",
  body: "A SYSTEM CAN GROW WITHOUT PRETENDING TO BE ALIVE.",
  command: "OBSERVE GROWTH",
  message: "MEMBRANE · CHAMBERS · FILAMENT NETWORK · CLOSED LOOP",
}, (x, y, t, pointer, seed) => {
  const phase = phaseOf(t);
  const breathe = 1 + Math.sin(phase * 2) * 0.04;
  const sx = x / breathe;
  const sy = y / breathe;
  const cocoon = ellipseRing(sx, sy, 0, 0, 0.48, 0.78, 0.055) * 0.8;
  let chambers = 0;
  const chamberPoints = [[-0.13,-0.34],[0.16,-0.18],[-0.12,0.02],[0.15,0.2],[-0.08,0.38]];
  chamberPoints.forEach((point, index) => {
    const wobble = Math.sin(phase * (index % 2 ? 3 : 2) + index) * 0.015;
    chambers = Math.max(chambers, ellipseRing(sx, sy, point[0] + wobble, point[1], 0.12, 0.095, 0.11));
  });
  let tendrils = 0;
  [-0.34, -0.18, 0.18, 0.34].forEach((target, index) => {
    tendrils = Math.max(tendrils, lineGlow(sx, sy, 0, index < 2 ? -0.55 : 0.5, target, index < 2 ? -0.9 : 0.9, 0.018));
  });
  const mask = ellipseFill(sx, sy, 0, 0, 0.42, 0.71, 0.22);
  const noise = hash21(Math.floor((sx + 1) * 44 + seed), Math.floor((sy + 1) * 48));
  const data = mask * smoothstep(0.78, 0.98, noise) * 0.42;
  const response = pointer.active ? pointGlow(sx, sy, pointer.x * 2 - 1, pointer.y * 2 - 1, 0.22) * 0.1 : 0;
  return clamp(cocoon + chambers * 0.78 + tendrils * 0.52 + data + response);
});

export const holocoreSignalSeedScene = scene({
  id: "holocore-signal-seed",
  index: 10,
  title: "SIGNAL SEED",
  kicker: "HOLOCORE · EMERGENT DATA",
  body: "DATA IS ORGANIC AS A METAPHOR, NOT A BIOLOGICAL CLAIM.",
  command: "EVOLVE SIGNAL",
  message: "OVOID SEED · CHAMBER ACTIVATION · CLOSED LOOP",
}, (x, y, t, pointer, seed) => {
  const phase = phaseOf(t);
  const growth = 1 + (Math.sin(phase) * 0.5 + 0.5) * 0.035;
  const sx = x / growth;
  const sy = y / growth;
  const shell = ellipseRing(sx, sy, 0, 0.02, 0.43, 0.68, 0.055) * 0.9;
  const inner = ellipseRing(sx, sy, 0, 0.02, 0.31, 0.5, 0.065) * 0.34;
  let chambers = 0;
  [[0,-0.24],[-0.13,0.02],[0.14,0.06],[0,0.3]].forEach((point, index) => {
    const pulse = 1 + Math.sin(phase * (index + 1)) * 0.06;
    chambers = Math.max(chambers, ellipseFill(sx, sy, point[0], point[1], 0.085 * pulse, 0.07 * pulse, 0.3) * 0.72);
  });
  const mask = ellipseFill(sx, sy, 0, 0.02, 0.38, 0.61, 0.18);
  const dataNoise = hash21(Math.floor((sx + 1) * 54 + seed), Math.floor((sy + 1) * 58));
  const data = mask * smoothstep(0.84, 0.99, dataNoise) * 0.5;
  const ring = ellipseRing(sx, sy, 0, 0.02, 0.58 + Math.sin(phase * 2) * 0.02, 0.78, 0.018) * 0.14;
  const pointerSignal = pointer.active ? lineGlow(sx, sy, pointer.x * 2 - 1, pointer.y * 2 - 1, 0, 0.02, 0.015) * 0.12 : 0;
  return clamp(shell + inner + chambers + data + ring + pointerSignal);
});
