import { clamp, smoothstep } from "../engine/math.js";

const TAU = Math.PI * 2;

/**
 * Synthetic KODEX optical-state specimen.
 *
 * The field uses slow radial phase and sixfold symmetry to communicate a
 * portal/focus state without rapid flashing. It abstracts interference logic;
 * it does not reproduce any source artwork, aperture or identifiable layout.
 */
export const holocoreInterferencePortalScene = {
  id: "holocore-interference-portal",
  index: 8,
  title: "INTERFERENCE PORTAL",
  kicker: "HOLOCORE · PHASE FIELD",
  body: "THE APERTURE APPEARS WHERE PHASE RELATIONS COHERE.",
  command: "ALIGN FIELD",
  message: "PHASE · SYMMETRY · APERTURE · CLOSED PHASE LOOP",
  loopSeconds: 24,
  field(x, y, t, pointer) {
    const phase = ((t % 24) / 24) * TAU;
    const px = (pointer.x * 2 - 1) * (pointer.active ? 0.045 : 0);
    const py = (pointer.y * 2 - 1) * (pointer.active ? 0.035 : 0);
    const sx = x - px;
    const sy = y - py;
    const radius = Math.hypot(sx, sy);
    const angle = Math.atan2(sy, sx);

    const apertureRadius = 0.31 + Math.sin(phase) * 0.018;
    const aperture = Math.exp(-Math.abs(radius - apertureRadius) / 0.026);
    const innerVoid = 1 - smoothstep(0.1, apertureRadius * 0.72, radius);

    // Two low-speed radial waves. At two cycles per 24 seconds this remains
    // well below a flashing cadence and behaves as a slow spatial drift.
    const waveA = Math.sin(radius * 24 - phase * 2) * 0.5 + 0.5;
    const waveB = Math.sin(radius * 15 + phase) * 0.5 + 0.5;
    const annulusGate = smoothstep(0.18, 0.3, radius) * (1 - smoothstep(0.72, 0.93, radius));
    const interference = Math.max(0, waveA * waveB - 0.42) * annulusGate;

    const symmetry = Math.pow(
      Math.max(0, Math.cos(angle * 6 + Math.sin(phase) * 0.12)),
      10,
    ) * annulusGate;

    const axial = Math.max(
      Math.exp(-Math.abs(sx) / 0.016),
      Math.exp(-Math.abs(sy) / 0.016),
    ) * (1 - smoothstep(0.66, 0.84, radius));

    const focus = Math.exp(-radius / 0.08) * (0.72 + (Math.cos(phase) * 0.5 + 0.5) * 0.28);
    const outerBoundary = Math.exp(-Math.abs(radius - 0.78) / 0.018) * 0.18;

    return clamp(
      focus * 0.9 +
      aperture * 0.9 +
      interference * 0.66 +
      symmetry * 0.5 +
      axial * 0.22 +
      innerVoid * 0.12 +
      outerBoundary
    );
  },
};
