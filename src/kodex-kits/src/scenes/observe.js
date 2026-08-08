import { clamp, length2, smoothstep } from "../engine/math.js";

export const observeScene = {
  id: "observe",
  index: 1,
  title: "THE<br />ARCHIVE<br />WATCHES.",
  kicker: "01 · OBSERVATION PROTOCOL",
  body: "YOU ARE INSIDE THE SIGNAL. OBSERVATION CHANGES THE PATTERN.",
  command: "BEGIN OBSERVATION",
  message: "LO QUE OBSERVA TAMBIÉN ES OBSERVADO · MEMORY DOES NOT REMAIN STILL · ARCHIVO LATENTE",
  field(x, y, t, pointer, seed) {
    const px = pointer.x * 2 - 1;
    const py = pointer.y * 2 - 1;
    const dx = x - px * 0.22;
    const dy = y - py * 0.16;
    const r = length2(dx, dy);
    const angle = Math.atan2(dy, dx);

    const aperture = 0.12 + Math.max(0, 1 - Math.abs(dx)) * 0.34;
    const eye = 1 - clamp(Math.abs(dy) / aperture);
    const iris = Math.exp(-Math.abs(r - 0.19) * 30);
    const pupil = Math.exp(-r * 15);
    const orbital = Math.sin(r * 31 - t * 1.7 + seed) * 0.5 + 0.5;
    const spokes = Math.sin(angle * 12 + t * 0.35) * 0.5 + 0.5;
    const shell = 1 - smoothstep(0.62, 0.88, r);

    return clamp(
      eye * 0.32 +
      iris * 0.38 +
      pupil * 0.68 +
      orbital * shell * 0.19 +
      spokes * pupil * 0.13
    );
  },
};
