import { clamp, hash21, smoothstep } from "../engine/math.js";

export const signalScene = {
  id: "signal",
  index: 4,
  title: "THE SIGNAL<br />DREAMS IN<br />CODE.",
  kicker: "04 · SIGNAL PROTOCOL",
  body: "NOISE IS NOT FAILURE. IT IS THE ARCHIVE ATTEMPTING TO SPEAK.",
  command: "GENERATE SIGNAL",
  message: "ERROR COMO ORÁCULO · DATA BECOMES RHYTHM · ESCUCHA EL INTERVALO",
  field(x, y, t, pointer, seed) {
    const wave = Math.sin(x * 15 + t * 1.9 + Math.sin(y * 5 + t)) * 0.5 + 0.5;
    const carrier = Math.sin(y * 34 - t * 3.1 + x * 5) * 0.5 + 0.5;
    const pulse = Math.exp(-Math.abs(y - Math.sin(x * 4 + t) * 0.22) * 13);
    const noise = hash21(Math.floor((x + 1.1) * 90 + t * 5), Math.floor((y + 1.1) * 70 + seed));
    const interference = smoothstep(0.72, 1, wave * carrier + noise * 0.28);
    const pointerBeam = Math.exp(-Math.abs(x - (pointer.x * 2 - 1)) * 16) * 0.18;
    return clamp(pulse * 0.62 + interference * 0.46 + pointerBeam);
  },
};
