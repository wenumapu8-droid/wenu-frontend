import { clamp, smoothstep, hash21 } from "../engine/math.js";

const TAU = Math.PI * 2;

function ring(x, y, radius, thickness = 0.035) {
  return Math.exp(-Math.abs(Math.hypot(x, y) - radius) / thickness);
}

function spokeField(x, y, phase) {
  const angle = Math.atan2(y, x);
  const radius = Math.hypot(x, y);
  const spokes = Math.pow(Math.max(0, Math.cos(angle * 8 + Math.sin(phase) * 0.16)), 18);
  const radialGate = smoothstep(0.12, 0.2, radius) * (1 - smoothstep(0.68, 0.82, radius));
  return spokes * radialGate;
}

/**
 * Synthetic KODEX HoloCore specimen.
 *
 * This is not a reconstruction of the Drive ASCII Reactor poster. It tests an
 * abstract reusable law: a stable luminous core, restrained cage/ribs, data
 * dither and state-bounded signal packets. All animated terms are periodic
 * integer multiples of the declared 24 s loop.
 */
export const holocoreSignalCoreScene = {
  id: "holocore-signal-core",
  index: 7,
  title: "SIGNAL CORE",
  kicker: "HOLOCORE · COHERENCE CHAMBER",
  body: "THE SIGNAL CONDENSES AROUND A STABLE CORE.",
  command: "RESOLVE CORE",
  message: "CORE · CAGE · DITHER · CLOSED PHASE LOOP",
  loopSeconds: 24,
  field(x, y, t, pointer, seed) {
    const phase = ((t % 24) / 24) * TAU;
    const px = (pointer.x * 2 - 1) * (pointer.active ? 0.035 : 0);
    const py = (pointer.y * 2 - 1) * (pointer.active ? 0.025 : 0);
    const sx = x - px;
    const sy = y - py;
    const radius = Math.hypot(sx, sy);

    const breath = 1 + Math.sin(phase * 2) * 0.035;
    const core = Math.exp(-radius / (0.105 * breath));
    const coreHalo = Math.exp(-radius / (0.23 * breath)) * 0.44;

    const inner = ring(sx, sy, 0.2 + Math.sin(phase * 2) * 0.008, 0.03);
    const mid = ring(sx, sy, 0.37 + Math.cos(phase) * 0.01, 0.028);
    const outer = ring(sx, sy, 0.58 + Math.sin(phase * 3) * 0.008, 0.024);

    // A cage proxy built from common radial geometry, deliberately different
    // from any identifiable source morphology.
    const ribs = spokeField(sx, sy, phase);
    const verticalCage = Math.exp(-Math.abs(sx) / 0.018) *
      smoothstep(0.13, 0.2, Math.abs(sy)) *
      (1 - smoothstep(0.62, 0.75, Math.abs(sy)));
    const horizontalCage = Math.exp(-Math.abs(sy) / 0.018) *
      smoothstep(0.16, 0.24, Math.abs(sx)) *
      (1 - smoothstep(0.58, 0.72, Math.abs(sx)));

    const angle = Math.atan2(sy, sx);
    const packetCarrier = ring(sx, sy, 0.37, 0.04);
    const packets = packetCarrier * (0.5 + 0.5 * Math.sin(angle * 18 - phase * 4));

    const cloudGate = smoothstep(0.22, 0.32, radius) * (1 - smoothstep(0.68, 0.86, radius));
    const noise = hash21(
      Math.floor((sx + 1) * 72 + seed),
      Math.floor((sy + 1) * 68),
    );
    const dither = cloudGate * smoothstep(0.66, 0.93, noise) * 0.42;

    const pulse = ring(sx, sy, 0.72 + Math.sin(phase) * 0.02, 0.018) * 0.18;

    return clamp(
      core * 0.98 +
      coreHalo +
      inner * 0.82 +
      mid * 0.68 +
      outer * 0.48 +
      ribs * 0.48 +
      verticalCage * 0.56 +
      horizontalCage * 0.56 +
      packets * 0.72 +
      dither +
      pulse
    );
  },
};
