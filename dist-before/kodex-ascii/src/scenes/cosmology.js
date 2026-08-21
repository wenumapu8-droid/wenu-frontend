import { clamp, hash21, length2, smoothstep } from "../engine/math.js";

export const cosmologyScene = {
  id: "cosmology",
  index: 3,
  title: "WE ARE<br />PATTERNS IN<br />THE COSMOS.",
  kicker: "03 · COSMOLOGY PROTOCOL",
  body: "FROM CODE TO STARS. EVERY SIGNAL ENTERS A GREATER ORBIT.",
  command: "MAP THE COSMOS",
  message: "WENU MAPU · ARRIBA Y ADENTRO · THE MAP IS ALSO A MEMORY",
  field(x, y, t, pointer, seed) {
    const px = (pointer.x - 0.5) * 0.3;
    const py = (pointer.y - 0.5) * 0.3;
    const dx = x - px;
    const dy = y - py;
    const r = length2(dx, dy);
    const a = Math.atan2(dy, dx);

    const orbitA = Math.exp(-Math.abs(length2(dx * 0.85, dy * 1.35) - 0.42) * 34);
    const orbitB = Math.exp(-Math.abs(length2(dx * 1.45, dy * 0.72) - 0.62) * 27);
    const orbitC = Math.exp(-Math.abs(r - 0.25) * 43);
    const stars = hash21(Math.floor((x + 1.2) * 58), Math.floor((y + 1.2) * 42));
    const starField = smoothstep(0.965, 0.998, stars + Math.sin(t * 0.8 + a * 3 + seed) * 0.025);
    const nucleus = Math.exp(-r * 13);

    return clamp(orbitA * 0.48 + orbitB * 0.44 + orbitC * 0.42 + starField * 0.8 + nucleus);
  },
};
