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

    // A continuous low-frequency skin is intentional. v0.1 relied mainly on
    // contour peaks, which produced sparse beads in the ASCII quantizer. The
    // skin gives the torus perceptual mass while keeping microglyph texture.
    const crossSection = 1 - smoothstep(0.018, 0.215, tubeDistance);
    const frontness = Math.sin(angle) * 0.5 + 0.5;
    const sideLight = Math.cos(angle - 0.42) * 0.5 + 0.5;
    const depth = 0.68 + frontness * 0.32;
    const skin = bodyMask * crossSection * (0.22 + sideLight * 0.16) * depth;

    // Dense laminated surface. Wider low-amplitude bands form a coherent shell;
    // narrow bands retain the optical "field-line" language at close range.
    let laminations = 0;
    for (let band = -5; band <= 5; band += 1) {
      const offset = band * 0.024;
      const breathe = Math.sin(phase + band * 0.48) * 0.004;
      const distance = radius - (major + offset + breathe);
      const broad = gaussian(distance, 0.020) * (0.22 + (5 - Math.abs(band)) * 0.035);
      const filament = gaussian(distance, 0.0085) * (0.36 + (5 - Math.abs(band)) * 0.055);
      laminations = Math.max(laminations, broad, filament);
    }

    // Longitudinal surface flow. Opposed directions create circulation without
    // turning the object into a loading spinner. The threshold is lowered from
    // v0.1 so flow reads as a continuous current rather than isolated packets.
    const flowA = Math.sin(angle * 12 - phase * 2 + tubeDistance * 38) * 0.5 + 0.5;
    const flowB = Math.sin(angle * 17 + phase * 1.35 - tubeDistance * 52) * 0.5 + 0.5;
    const flowSignal = Math.max(flowA, flowB * 0.92);
    const stream = bodyMask * smoothstep(0.56, 0.92, flowSignal) * (0.34 + frontness * 0.34);

    // Front/back separation is encoded in luminance, not fake occlusion. Rear
    // material remains visible, while the near side carries the brightest skin.
    const rearAttenuation = 0.64 + frontness * 0.36;
    const surface = Math.max(skin, laminations * 0.88, stream) * bodyMask * rearAttenuation;

    // Interior throat and two aperture rims create a legible negative-space
    // opening. The outer rim is weaker so the hole remains open, not filled.
    const apertureRadius = 0.255;
    const apertureInner = gaussian(radius - apertureRadius, 0.014) * (0.48 + frontness * 0.16);
    const apertureOuter = gaussian(radius - 0.315, 0.025) * 0.15;
    const throat = (1 - smoothstep(0.105, apertureRadius, radius)) * 0.045;

    // Slow circulating packets now sit inside the continuous shell. They provide
    // a readable flow path but no longer carry the object's entire visual mass.
    let packets = 0;
    for (let i = 0; i < 8; i += 1) {
      const direction = i % 2 === 0 ? 1 : -1;
      const packetAngle = phase * direction + i * TAU / 8;
      const packetRadius = major + Math.sin(phase * 2 + i) * 0.032;
      const dx = rx - Math.cos(packetAngle) * packetRadius;
      const dy = ry - Math.sin(packetAngle) * packetRadius;
      packets = Math.max(packets, Math.exp(-Math.hypot(dx, dy) / 0.050));
    }

    // A restrained surrounding field gives the object spatial context without
    // competing with it. The torus remains the dominant signal.
    const halo = gaussian(radius - 0.77, 0.045) * 0.10
      + gaussian(radius - 0.91, 0.055) * 0.045;

    return clamp(
      surface * 1.08
      + apertureInner
      + apertureOuter
      + throat
      + packets * 0.55
      + halo,
    );
  },
});
