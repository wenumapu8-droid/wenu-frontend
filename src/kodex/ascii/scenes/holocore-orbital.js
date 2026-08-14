import { clamp, smoothstep, hash21 } from "../engine/math.js";

const TAU = Math.PI * 2;

function ellipseRing(x, y, cx, cy, rx, ry, thickness = 0.05) {
  const dx = (x - cx) / Math.max(rx, 0.001);
  const dy = (y - cy) / Math.max(ry, 0.001);
  const radius = Math.hypot(dx, dy);
  return Math.exp(-Math.abs(radius - 1) / thickness);
}

function ellipseFill(x, y, cx, cy, rx, ry, softness = 0.18) {
  const dx = (x - cx) / Math.max(rx, 0.001);
  const dy = (y - cy) / Math.max(ry, 0.001);
  const radius = Math.hypot(dx, dy);
  return 1 - smoothstep(Math.max(0, 1 - softness), 1, radius);
}

function horizontalDeck(x, y, cy, halfWidth, thickness = 0.02) {
  const inside = 1 - smoothstep(halfWidth * 0.86, halfWidth, Math.abs(x));
  return inside * Math.exp(-Math.abs(y - cy) / thickness);
}

function verticalStrut(x, y, cx, y0, y1, width = 0.015) {
  const minY = Math.min(y0, y1);
  const maxY = Math.max(y0, y1);
  const insideY = smoothstep(minY - 0.025, minY + 0.015, y) *
    (1 - smoothstep(maxY - 0.015, maxY + 0.025, y));
  return Math.exp(-Math.abs(x - cx) / width) * insideY;
}

function moduleCluster(x, y, cy, spread, count, phase, scale = 1) {
  let value = 0;
  for (let index = 0; index < count; index += 1) {
    const normalized = count <= 1 ? 0.5 : index / (count - 1);
    const cx = (normalized - 0.5) * spread;
    const bob = Math.sin(phase * 2 + index * 1.7) * 0.007;
    const module = ellipseFill(x, y, cx, cy + bob, 0.038 * scale, 0.018 * scale, 0.3);
    const shell = ellipseRing(x, y, cx, cy + bob, 0.052 * scale, 0.024 * scale, 0.12);
    value = Math.max(value, module * 0.8 + shell * 0.55);
  }
  return value;
}

function rotatingRingSignal(x, y, cx, cy, rx, ry, phase, frequency = 16) {
  const dx = (x - cx) / Math.max(rx, 0.001);
  const dy = (y - cy) / Math.max(ry, 0.001);
  const radius = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const ring = Math.exp(-Math.abs(radius - 1) / 0.045);
  const packet = Math.sin(angle * frequency - phase) * 0.5 + 0.5;
  return ring * (0.34 + packet * 0.66);
}

/**
 * KODEX HoloCore prototype specimen.
 *
 * The specimen is intentionally not a physical engineering model. It is a
 * speculative orbital-city concept translated into a signal-resolved ASCII
 * field. The visual hierarchy is designed to remain legible at coarse glyph
 * resolution: axial tether -> stacked orbital strata -> habitat ring ->
 * service modules -> atmosphere -> planetary interface.
 *
 * Every animated term derives from integer multiples of one 24 s phase, so
 * the procedural field returns to the same state at the loop seam.
 */
export const holocoreOrbitalScene = {
  id: "holocore-orbital",
  index: 6,
  title: "ORBITAL CITY",
  kicker: "HOLOCORE · SIGNAL-RESOLVED SPECIMEN",
  body: "THE FORM DOES NOT APPEAR. IT RESOLVES.",
  command: "MATERIALIZE SIGNAL",
  message: "AXIAL SYSTEM · ASCII PROJECTION · CLOSED PHASE LOOP",
  loopSeconds: 24,
  field(x, y, t, pointer, seed) {
    const phase = ((t % 24) / 24) * TAU;
    const px = (pointer.x * 2 - 1) * (pointer.active ? 0.04 : 0);
    const py = (pointer.y * 2 - 1) * (pointer.active ? 0.02 : 0);
    const sx = x - px;
    const sy = y - py;

    // Primary tether: a restrained vertical transmission axis connecting the
    // orbital stack to the planetary interface.
    const spineWidth = 0.018 + (Math.sin(phase) * 0.5 + 0.5) * 0.005;
    const spineMask = 1 - smoothstep(0.92, 0.99, Math.abs(sy));
    const spine = Math.exp(-Math.abs(sx) / spineWidth) * spineMask;
    const spineHalo = Math.exp(-Math.abs(sx) / 0.055) * spineMask * 0.22;

    // Five stacked strata make the object read as an exploded orbital system
    // rather than a single abstract ring.
    const crownRing = ellipseRing(
      sx,
      sy,
      Math.sin(phase) * 0.014,
      -0.61,
      0.29 + Math.sin(phase * 2) * 0.008,
      0.067,
      0.065,
    );
    const upperRing = ellipseRing(
      sx,
      sy,
      -Math.sin(phase * 2) * 0.012,
      -0.36,
      0.46,
      0.105,
      0.055,
    );
    const habitatRing = ellipseRing(
      sx,
      sy,
      Math.cos(phase) * 0.012,
      -0.02,
      0.69 + Math.sin(phase * 3) * 0.01,
      0.17,
      0.052,
    );
    const serviceRing = ellipseRing(
      sx,
      sy,
      Math.sin(phase * 2) * 0.01,
      0.34,
      0.52,
      0.115,
      0.055,
    );
    const lowerRing = ellipseRing(
      sx,
      sy,
      -Math.cos(phase) * 0.01,
      0.58,
      0.33,
      0.075,
      0.065,
    );

    // Solid hubs and decks survive the ASCII downsampling and provide a clear
    // central mass for each orbital stratum.
    const crownHub = ellipseFill(sx, sy, 0, -0.61, 0.075, 0.032, 0.34);
    const upperHub = ellipseFill(sx, sy, 0, -0.36, 0.095, 0.038, 0.34);
    const habitatHub = ellipseFill(sx, sy, 0, -0.02, 0.12, 0.045, 0.34);
    const serviceHub = ellipseFill(sx, sy, 0, 0.34, 0.095, 0.038, 0.34);
    const lowerHub = ellipseFill(sx, sy, 0, 0.58, 0.07, 0.03, 0.34);

    const deckA = horizontalDeck(sx, sy, -0.61, 0.3, 0.018);
    const deckB = horizontalDeck(sx, sy, -0.36, 0.47, 0.018);
    const deckC = horizontalDeck(sx, sy, -0.02, 0.68, 0.017);
    const deckD = horizontalDeck(sx, sy, 0.34, 0.53, 0.018);
    const deckE = horizontalDeck(sx, sy, 0.58, 0.34, 0.018);

    // Structural rails create a recognisable megastructure silhouette without
    // pretending to describe real orbital engineering.
    const innerRails = Math.max(
      verticalStrut(sx, sy, -0.12, -0.58, 0.56, 0.014),
      verticalStrut(sx, sy, 0.12, -0.58, 0.56, 0.014),
    );
    const midRails = Math.max(
      verticalStrut(sx, sy, -0.29, -0.33, 0.31, 0.012),
      verticalStrut(sx, sy, 0.29, -0.33, 0.31, 0.012),
    );

    const upperModules = moduleCluster(sx, sy, -0.2, 0.72, 9, phase, 1.05);
    const lowerModules = moduleCluster(sx, sy, 0.19, 0.9, 11, -phase, 0.95);
    const serviceModules = moduleCluster(sx, sy, 0.71, 0.62, 7, phase * 2, 0.9);

    // Counter-moving signal packets make orbital circulation visible while
    // keeping the geometric rings themselves stable enough to read.
    const upperTraffic = rotatingRingSignal(sx, sy, 0, -0.36, 0.46, 0.105, phase * 3, 14);
    const habitatTraffic = rotatingRingSignal(sx, sy, 0, -0.02, 0.69, 0.17, -phase * 4, 22);
    const serviceTraffic = rotatingRingSignal(sx, sy, 0, 0.34, 0.52, 0.115, phase * 5, 18);

    // Atmospheric signal cloud above the stack. Static cell noise avoids a
    // discontinuity at the procedural loop seam.
    const cloudMask = (1 - smoothstep(0.32, 0.82, Math.abs(sx))) *
      (1 - smoothstep(0.08, 0.2, Math.abs(sy + 0.82)));
    const cloudNoise = hash21(
      Math.floor((sx + 1) * 56),
      Math.floor((sy + 1) * 48 + seed),
    );
    const atmosphere = cloudMask * smoothstep(0.5, 0.9, cloudNoise) * 0.42;

    // Planetary interface: horizon only, intentionally diagrammatic rather
    // than a claim about a specific planet or launch architecture.
    const planetCurve = 0.87 + sx * sx * 0.24;
    const horizon = Math.exp(-Math.abs(sy - planetCurve) / 0.024) *
      (1 - smoothstep(0.72, 0.99, Math.abs(sx)));
    const surfaceNoise = sy > planetCurve
      ? hash21(Math.floor((sx + 1) * 58), Math.floor(sy * 76)) * 0.12
      : 0;

    // Bidirectional signal packets travelling along the tether.
    const packetWaveA = Math.sin((sy + 1) * 20 - phase * 6) * 0.5 + 0.5;
    const packetWaveB = Math.sin((sy + 1) * 13 + phase * 4) * 0.5 + 0.5;
    const packets = spine * (0.2 + Math.max(packetWaveA, packetWaveB) * 0.8);

    const boundary = ellipseRing(sx, sy, 0, 0.02, 0.8, 0.94, 0.012) * 0.08;

    const architecture = Math.max(
      crownRing * 0.82,
      upperRing * 0.88,
      habitatRing,
      serviceRing * 0.9,
      lowerRing * 0.82,
      deckA * 0.75,
      deckB * 0.78,
      deckC * 0.9,
      deckD * 0.78,
      deckE * 0.75,
      crownHub * 0.86,
      upperHub * 0.82,
      habitatHub,
      serviceHub * 0.82,
      lowerHub * 0.8,
      innerRails * 0.62,
      midRails * 0.5,
      upperModules * 0.82,
      lowerModules * 0.8,
      serviceModules * 0.76,
    );

    const traffic = Math.max(
      upperTraffic * 0.55,
      habitatTraffic * 0.72,
      serviceTraffic * 0.58,
    );

    return clamp(
      architecture * 0.92 +
      spine * 0.38 +
      spineHalo +
      packets * 0.55 +
      traffic +
      atmosphere +
      horizon * 0.62 +
      surfaceNoise +
      boundary
    );
  },
};
