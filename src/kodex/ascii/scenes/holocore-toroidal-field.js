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

    // Project into a visibly tilted, less-compressed ellipse so the object reads
    // as a volume rather than a thin horizontal ring. This remains an authored
    // perceptual model, not a physical field simulation.
    const tilt = -0.23;
    const ct = Math.cos(tilt);
    const st = Math.sin(tilt);
    const rx = sx * ct - sy * st;
    const ry = (sx * st + sy * ct) / 0.72;
    const radius = Math.hypot(rx, ry);
    const angle = Math.atan2(ry, rx);

    const major = 0.55;
    const tubeDistance = Math.abs(radius - major);
    const bodyMask = 1 - smoothstep(0.105, 0.245, tubeDistance);

    // Continuous shell floor: the prior v0.2 skin gained volume but fell below
    // the ASCII quantizer across the rear arc, producing a U-shaped silhouette.
    // Keep the full toroidal body visibly present, then layer depth/highlights.
    const crossSection = 1 - smoothstep(0.018, 0.215, tubeDistance);
    const frontness = Math.sin(angle) * 0.5 + 0.5;
    const sideLight = Math.cos(angle - 0.42) * 0.5 + 0.5;
    const shellFloor = bodyMask * crossSection * (0.44 + sideLight * 0.12);
    const skin = shellFloor * (0.88 + frontness * 0.12);

    // Dense laminated surface. Wider low-amplitude bands form a coherent shell;
    // narrow bands retain the optical "field-line" language at close range.
    let laminations = 0;
    for (let band = -5; band <= 5; band += 1) {
      const offset = band * 0.024;
      const breathe = Math.sin(phase + band * 0.48) * 0.004;
      const distance = radius - (major + offset + breathe);
      const broad = gaussian(distance, 0.020) * (0.24 + (5 - Math.abs(band)) * 0.038);
      const filament = gaussian(distance, 0.0085) * (0.40 + (5 - Math.abs(band)) * 0.058);
      laminations = Math.max(laminations, broad, filament);
    }

    // Longitudinal surface flow. Opposed directions create circulation without
    // turning the object into a loading spinner. Keep flow continuous and let
    // frontness modulate intensity rather than erase the rear arc.
    const flowA = Math.sin(angle * 12 - phase * 2 + tubeDistance * 38) * 0.5 + 0.5;
    const flowB = Math.sin(angle * 17 + phase * 1.35 - tubeDistance * 52) * 0.5 + 0.5;
    const flowSignal = Math.max(flowA, flowB * 0.92);
    const stream = bodyMask * smoothstep(0.54, 0.91, flowSignal) * (0.36 + frontness * 0.28);

    // Front/back separation is luminance-only. Rear attenuation now has a high
    // floor so the back half remains materially legible in the glyph renderer.
    const rearAttenuation = 0.86 + frontness * 0.14;
    const surface = Math.max(skin, laminations * 0.95, stream) * bodyMask * rearAttenuation;

    // Interior throat and two aperture rims create a legible negative-space
    // opening. Preserve enough rear-rim energy to close the toroidal silhouette.
    const apertureRadius = 0.255;
    const apertureInner = gaussian(radius - apertureRadius, 0.014) * (0.56 + frontness * 0.12);
    const apertureOuter = gaussian(radius - 0.315, 0.025) * 0.18;
    const throat = (1 - smoothstep(0.105, apertureRadius, radius)) * 0.045;

    // Slow circulating packets sit inside the continuous shell. They provide a
    // readable flow path but remain subordinate to the object's material mass.
    let packets = 0;
    for (let i = 0; i < 8; i += 1) {
      const direction = i % 2 === 0 ? 1 : -1;
      const packetAngle = phase * direction + i * TAU / 8;
      const packetRadius = major + Math.sin(phase * 2 + i) * 0.032;
      const dx = rx - Math.cos(packetAngle) * packetRadius;
      const dy = ry - Math.sin(packetAngle) * packetRadius;
      packets = Math.max(packets, Math.exp(-Math.hypot(dx, dy) / 0.050));
    }

    // Restrained surrounding field gives the object spatial context without
    // competing with it. The torus remains the dominant signal.
    const halo = gaussian(radius - 0.77, 0.045) * 0.10
      + gaussian(radius - 0.91, 0.055) * 0.045;

    return clamp(
      surface * 1.10
      + apertureInner
      + apertureOuter
      + throat
      + packets * 0.50
      + halo,
    );
  },
});
