import { clamp, smoothstep } from "../engine/math.js";

const TAU = Math.PI * 2;
const LOOP_SECONDS = 24;
const phaseOf = t => (((t % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS) / LOOP_SECONDS * TAU;
const gaussian = (distance, width) => Math.exp(-Math.abs(distance) / Math.max(width, 0.0001));

/**
 * KDX-HOLO-BENCH-001 — TOROIDAL FIELD
 *
 * Perceptual benchmark, not a scientific field simulation.
 * The topology is an authored toroidal metaphor rendered through the existing
 * bounded ASCII HoloCore runtime. Pointer input perturbs presentation only.
 */
export const holocoreToroidalFieldScene = Object.freeze({
  id: "holocore-toroidal-field",
  index: 41,
  title: "TOROIDAL FIELD",
  kicker: "HOLOCORE · PERCEPTUAL BENCHMARK 001",
  body: "A CLOSED FIELD TURNS THROUGH ITSELF.",
  command: "OBSERVE THE FLOW",
  message: "ART / COMP / SPEC · TOROIDAL METAPHOR · CLOSED LOOP",
  loopSeconds: LOOP_SECONDS,
  field(x, y, t, pointer) {
    const phase = phaseOf(t);

    // Very small observer perturbation: the object remains composed and centered.
    const px = pointer?.active ? (pointer.x * 2 - 1) * 0.035 : 0;
    const py = pointer?.active ? (pointer.y * 2 - 1) * 0.022 : 0;
    const sx = x - px;
    const sy = y - py;

    // Project the field into a gently tilted ellipse. This is intentionally an
    // authored perceptual model rather than a claim of physical simulation.
    const tilt = -0.16;
    const ct = Math.cos(tilt);
    const st = Math.sin(tilt);
    const rx = sx * ct - sy * st;
    const ry = (sx * st + sy * ct) / 0.58;
    const radius = Math.hypot(rx, ry);
    const angle = Math.atan2(ry, rx);

    const major = 0.54;
    const tubeDistance = Math.abs(radius - major);
    const bodyMask = 1 - smoothstep(0.12, 0.27, tubeDistance);

    // Dense laminated surface: several close toroidal contours prevent the form
    // from reading like a single flat ring.
    let laminations = 0;
    for (let band = -4; band <= 4; band += 1) {
      const offset = band * 0.027;
      const breathe = Math.sin(phase + band * 0.48) * 0.004;
      laminations = Math.max(
        laminations,
        gaussian(radius - (major + offset + breathe), 0.012) * (0.48 + (4 - Math.abs(band)) * 0.07),
      );
    }

    // Longitudinal surface flow. Opposed phase directions keep the loop alive
    // without making the object spin like a loading indicator.
    const flowA = Math.sin(angle * 12 - phase * 2 + tubeDistance * 38) * 0.5 + 0.5;
    const flowB = Math.sin(angle * 17 + phase * 1.35 - tubeDistance * 52) * 0.5 + 0.5;
    const stream = bodyMask * smoothstep(0.74, 0.97, Math.max(flowA, flowB * 0.9)) * 0.72;

    // The near side is subtly brighter; the rear side remains visible so the
    // aperture reads as volume rather than a donut outline.
    const nearSide = 0.62 + 0.38 * (Math.sin(angle) * 0.5 + 0.5);
    const surface = Math.max(laminations, stream) * bodyMask * nearSide;

    // Interior throat and a soft negative-space rim make the central opening
    // visually legible even at small/mobile sizes.
    const apertureRadius = 0.255;
    const aperture = gaussian(radius - apertureRadius, 0.018) * 0.46;
    const throat = (1 - smoothstep(0.12, apertureRadius, radius)) * 0.08;

    // Slow circulating packets give the eye a path to follow while preserving a
    // seamless 24 second loop.
    let packets = 0;
    for (let i = 0; i < 6; i += 1) {
      const packetAngle = phase * (i % 2 === 0 ? 1 : -0.72) + i * TAU / 6;
      const packetRadius = major + Math.sin(phase * 2 + i) * 0.028;
      const dx = rx - Math.cos(packetAngle) * packetRadius;
      const dy = ry - Math.sin(packetAngle) * packetRadius;
      packets = Math.max(packets, Math.exp(-Math.hypot(dx, dy) / 0.055));
    }

    // Peripheral field lines are deliberately weak: the torus must dominate.
    const halo = gaussian(radius - 0.78, 0.028) * 0.11
      + gaussian(radius - 0.92, 0.035) * 0.05;

    return clamp(surface * 0.96 + aperture + throat + packets * 0.72 + halo);
  },
});
