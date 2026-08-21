import { clamp, fract, length2, rotate2, smoothstep } from "../engine/math.js";

export const descentScene = {
  id: "descent",
  index: 2,
  title: "DESCEND<br />INTO THE<br />PATTERN.",
  kicker: "02 · DESCENT PROTOCOL",
  body: "THE DEEPER YOU GO, THE MORE THE ARCHIVE RECOGNIZES YOU.",
  command: "START DESCENT",
  message: "BAJO LA SUPERFICIE · SIGNAL BELOW SIGNAL · CADA CAPA RECUERDA",
  field(x, y, t, pointer, seed) {
    let [rx, ry] = rotate2(x, y, Math.sin(t * 0.13) * 0.08);
    rx += (pointer.x - 0.5) * 0.18;
    ry += (pointer.y - 0.5) * 0.12;

    const r = length2(rx, ry);
    const a = Math.atan2(ry, rx);
    const depth = 1 / Math.max(r, 0.045);
    const rings = 1 - smoothstep(0.02, 0.085, Math.abs(fract(depth * 0.23 - t * 0.38) - 0.5));
    const rays = 1 - smoothstep(0.01, 0.07, Math.abs(Math.sin(a * 14 + seed)));
    const core = Math.exp(-r * 5.5);
    const tunnel = clamp(rings * 0.62 + rays * 0.26 + core * 0.4);
    return tunnel * smoothstep(1.2, 0.1, r);
  },
};
