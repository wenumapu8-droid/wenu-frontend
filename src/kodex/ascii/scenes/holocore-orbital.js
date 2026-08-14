import { clamp, smoothstep, hash21 } from "../engine/math.js";

const TAU = Math.PI * 2;

function ellipseRing(x, y, cx, cy, rx, ry, thickness = 0.035) {
  const dx = (x - cx) / Math.max(rx, 0.001);
  const dy = (y - cy) / Math.max(ry, 0.001);
  const radius = Math.hypot(dx, dy);
  return Math.exp(-Math.abs(radius - 1) / thickness);
}

function horizontalDeck(x, y, cy, halfWidth, thickness = 0.015) {
  const inside = 1 - smoothstep(halfWidth * 0.82, halfWidth, Math.abs(x));
  return inside * Math.exp(-Math.abs(y - cy) / thickness);
}

function moduleCluster(x, y, cy, spread, count, phase) {
  let value = 0;
  for (let index = 0; index < count; index += 1) {
    const normalized = count <= 1 ? 0.5 : index / (count - 1);
    const cx = (normalized - 0.5) * spread;
    const bob = Math.sin(phase * 2 + index * 1.7) * 0.008;
    value = Math.max(value, ellipseRing(x, y, cx, cy + bob, 0.055, 0.022, 0.11));
  }
  return value;
}

/**
 * KODEX HoloCore prototype specimen.
 *
 * This scene deliberately avoids source-image mutation. It translates the
 * orbital-city concept into a procedural ASCII signal field: axial spine,
 * stacked decks, orbital rings, modules, atmospheric cloud and planetary
 * interface. All motion is derived from one 24 s phase, so the field closes
 * on itself without a visible restart.
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
    const px = (pointer.x * 2 - 1) * (pointer.active ? 0.045 : 0);
    const py = (pointer.y * 2 - 1) * (pointer.active ? 0.025 : 0);
    const sx = x - px;
    const sy = y - py;

    // Central elevator / energy tether. It subtly breathes rather than spins.
    const spineWidth = 0.012 + (Math.sin(phase) * 0.5 + 0.5) * 0.006;
    const spine = Math.exp(-Math.abs(sx) / spineWidth) * (1 - smoothstep(0.94, 1, Math.abs(sy)));

    // Orbital strata. Each ring uses an integer phase multiple so the complete
    // composition returns to frame zero every 24 seconds.
    const upperOrbit = ellipseRing(
      sx,
      sy,
      Math.sin(phase) * 0.018,
      -0.51,
      0.42 + Math.sin(phase * 2) * 0.012,
      0.105,
      0.032,
    );
    const habitatRing = ellipseRing(
      sx,
      sy,
      Math.cos(phase) * 0.014,
      0.04,
      0.63 + Math.sin(phase * 3) * 0.012,
      0.155,
      0.025,
    );
    const lowerOrbit = ellipseRing(
      sx,
      sy,
      -Math.sin(phase * 2) * 0.012,
      0.48,
      0.46,
      0.092,
      0.032,
    );

    const deckA = horizontalDeck(sx, sy, -0.49, 0.43, 0.013);
    const deckB = horizontalDeck(sx, sy, 0.04, 0.62, 0.012);
    const deckC = horizontalDeck(sx, sy, 0.49, 0.45, 0.013);

    const upperModules = moduleCluster(sx, sy, -0.31, 0.62, 7, phase);
    const serviceModules = moduleCluster(sx, sy, 0.68, 0.76, 9, -phase);

    // Concentric transit traces create the impression of counter-rotation.
    const radial = Math.hypot(sx, sy * 1.75);
    const angle = Math.atan2(sy * 1.75, sx);
    const transitBand = Math.exp(-Math.abs(radial - 0.64) / 0.018) *
      (Math.sin(angle * 18 - phase * 4) * 0.5 + 0.5) * 0.55;

    // Atmospheric layer: bounded particulate cloud above the structure.
    // The discrete texture itself stays static; movement comes from the
    // continuous orbital system so frame 0 and frame 24 cannot disagree due
    // to floating-point floor boundaries.
    const cloudMask = (1 - smoothstep(0.2, 0.72, Math.abs(sx))) *
      (1 - smoothstep(0.05, 0.22, Math.abs(sy + 0.82)));
    const cloudNoise = hash21(
      Math.floor((sx + 1) * 52),
      Math.floor((sy + 1) * 44 + seed),
    );
    const atmosphere = cloudMask * smoothstep(0.43, 0.88, cloudNoise) * 0.72;

    // Planetary interface/horizon near the bottom of the chamber.
    const planetCurve = 0.88 + sx * sx * 0.28;
    const horizon = Math.exp(-Math.abs(sy - planetCurve) / 0.018) *
      (1 - smoothstep(0.68, 0.98, Math.abs(sx)));
    const surfaceNoise = sy > planetCurve
      ? hash21(Math.floor((sx + 1) * 62), Math.floor(sy * 80)) * 0.22
      : 0;

    // Signal packets climb and descend the spine in a closed phase cycle.
    const packetPhase = ((sy + 1) * 6 - phase * 2) % 1;
    const packets = spine * (0.35 + (Math.sin(packetPhase * TAU) * 0.5 + 0.5) * 0.65);

    // Registration halo keeps the whole specimen visually contained.
    const boundary = ellipseRing(sx, sy, 0, 0.02, 0.79, 0.94, 0.012) * 0.16;

    return clamp(
      spine * 0.35 +
      packets * 0.48 +
      upperOrbit * 0.52 +
      habitatRing * 0.72 +
      lowerOrbit * 0.5 +
      deckA * 0.25 +
      deckB * 0.34 +
      deckC * 0.24 +
      upperModules * 0.5 +
      serviceModules * 0.46 +
      transitBand +
      atmosphere +
      horizon * 0.65 +
      surfaceNoise +
      boundary
    );
  },
};
