#!/usr/bin/env node
/**
 * Sonda del bloque IZQUIERDA de t01-07. Medias de fila y de columna sobre
 * ventanas arbitrarias, para encontrar marcos reales en vez de estimarlos.
 *   node scripts/lamina/_t0107_izq_probe.mjs filas x0 x1 y0 y1 [min]
 *   node scripts/lamina/_t0107_izq_probe.mjs cols  x0 x1 y0 y1 [min]
 *   node scripts/lamina/_t0107_izq_probe.mjs caja  x0 x1 y0 y1 [umbral]
 */
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

const img = PNG.sync.read(readFileSync("reference/canon/t01-07-cosmology-core.png"));
const { width: W, height: H, data } = img;
const lum = (x, y) => { const i = (y * W + x) * 4; return (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8; };
const rgb = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };

const [modo, a, b, c, d, e] = process.argv.slice(2);
const x0 = +a, x1 = +b, y0 = +c, y1 = +d;
const min = e === undefined ? 6 : +e;

if (modo === "filas") {
  for (let y = y0; y <= y1; y++) {
    let s = 0, sr = [0, 0, 0];
    for (let x = x0; x <= x1; x++) { s += lum(x, y); const p = rgb(x, y); sr[0] += p[0]; sr[1] += p[1]; sr[2] += p[2]; }
    const n = x1 - x0 + 1, m = s / n;
    if (m >= min) console.log(String(y).padStart(4), m.toFixed(1).padStart(6), sr.map((q) => Math.round(q / n)).join(","));
  }
} else if (modo === "cols") {
  for (let x = x0; x <= x1; x++) {
    let s = 0, sr = [0, 0, 0];
    for (let y = y0; y <= y1; y++) { s += lum(x, y); const p = rgb(x, y); sr[0] += p[0]; sr[1] += p[1]; sr[2] += p[2]; }
    const n = y1 - y0 + 1, m = s / n;
    if (m >= min) console.log(String(x).padStart(4), m.toFixed(1).padStart(6), sr.map((q) => Math.round(q / n)).join(","));
  }
} else if (modo === "caja") {
  const u = e === undefined ? 22 : +e;
  let ax = 1e9, bx = -1, ay = 1e9, by = -1, n = 0, s = [0, 0, 0];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (lum(x, y) > u) {
    n++; if (x < ax) ax = x; if (x > bx) bx = x; if (y < ay) ay = y; if (y > by) by = y;
    const p = rgb(x, y); s[0] += p[0]; s[1] += p[1]; s[2] += p[2];
  }
  console.log(n ? `tinta ${n}px  x ${ax}..${bx}  y ${ay}..${by}  rgb ${s.map((q) => Math.round(q / n)).join(",")}` : "SIN TINTA");
}
