#!/usr/bin/env node
/**
 * Sonda del bloque Izquierda de t01-04. Lee la referencia y contesta preguntas
 * de medición: perfiles de tinta por fila/columna, luminancia de un marco,
 * caja de tinta de una región y volcado de una franja.
 *
 * uso:
 *   node scripts/lamina/_t0104_izq_probe.mjs filas x0 x1 y0 y1 [umbral]
 *   node scripts/lamina/_t0104_izq_probe.mjs cols  x0 x1 y0 y1 [umbral]
 *   node scripts/lamina/_t0104_izq_probe.mjs caja  x0 x1 y0 y1 [umbral]
 *   node scripts/lamina/_t0104_izq_probe.mjs pico  x0 x1 y0 y1
 *   node scripts/lamina/_t0104_izq_probe.mjs fila  y x0 x1
 *   node scripts/lamina/_t0104_izq_probe.mjs col   x y0 y1
 */
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

const img = PNG.sync.read(readFileSync("reference/canon/t01-04-archive-tree.png"));
const { width: W, height: H, data } = img;
const lum = (x, y) => { const i = (y * W + x) * 4; return (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8; };
const rgb = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };

const [modo, ...rest] = process.argv.slice(2);
const n = rest.map(Number);

if (modo === "filas" || modo === "cols") {
  const [x0, x1, y0, y1, u = 20] = n;
  if (modo === "filas") {
    for (let y = y0; y <= y1; y++) {
      let c = 0, s = 0, mx = 0;
      for (let x = x0; x <= x1; x++) { const v = lum(x, y); s += v; if (v > u) c++; if (v > mx) mx = v; }
      if (c) console.log(`y=${y}  n=${c}  media=${(s / (x1 - x0 + 1)).toFixed(1)}  pico=${mx}`);
    }
  } else {
    for (let x = x0; x <= x1; x++) {
      let c = 0, s = 0, mx = 0;
      for (let y = y0; y <= y1; y++) { const v = lum(x, y); s += v; if (v > u) c++; if (v > mx) mx = v; }
      if (c) console.log(`x=${x}  n=${c}  media=${(s / (y1 - y0 + 1)).toFixed(1)}  pico=${mx}`);
    }
  }
} else if (modo === "caja") {
  const [x0, x1, y0, y1, u = 20] = n;
  let ax = 1e9, bx = -1, ay = 1e9, by = -1, s = 0, c = 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const v = lum(x, y); s += v;
    if (v > u) { c++; if (x < ax) ax = x; if (x > bx) bx = x; if (y < ay) ay = y; if (y > by) by = y; }
  }
  console.log(`x ${ax}..${bx} (${bx - ax + 1})  y ${ay}..${by} (${by - ay + 1})  tinta=${c}  media=${(s / ((x1 - x0 + 1) * (y1 - y0 + 1))).toFixed(2)}`);
} else if (modo === "pico") {
  const [x0, x1, y0, y1] = n;
  let best = [0, 0, 0], bl = -1, s = [0, 0, 0], c = 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const v = lum(x, y); const p = rgb(x, y);
    if (v > bl) { bl = v; best = p; }
    if (v > 12) { s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; c++; }
  }
  console.log(`pico rgb(${best}) lum=${bl}   media de tinta rgb(${s.map((q) => Math.round(q / (c || 1)))}) n=${c}`);
} else if (modo === "fila") {
  const [y, x0, x1] = n;
  const out = [];
  for (let x = x0; x <= x1; x++) out.push(`${x}:${lum(x, y)}`);
  console.log(out.join(" "));
} else if (modo === "col") {
  const [x, y0, y1] = n;
  const out = [];
  for (let y = y0; y <= y1; y++) out.push(`${y}:${lum(x, y)}`);
  console.log(out.join(" "));
} else {
  console.log(`${W}x${H}`);
}
