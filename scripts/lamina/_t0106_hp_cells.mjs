#!/usr/bin/env node
/* Cajas de tinta de cada celda de la cabecera de t01-06, con pico y color. */
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
const img = PNG.sync.read(readFileSync("reference/canon/t01-06-ritual-device.png"));
const { width: W, data } = img;
const rgb = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
const lum = (x, y) => { const p = rgb(x, y); return (p[0] * 77 + p[1] * 150 + p[2] * 29) >> 8; };
function caja(nom, x0, x1, y0, y1, thr = 25) {
  let ax = 1e9, ay = 1e9, bx = -1, by = -1, n = 0, pico = 0, pr = [0, 0, 0];
  const vals = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const v = lum(x, y);
    if (v > pico) { pico = v; pr = rgb(x, y); }
    if (v > thr) { n++; vals.push(v); if (x < ax) ax = x; if (x > bx) bx = x; if (y < ay) ay = y; if (y > by) by = y; }
  }
  vals.sort((a, b) => a - b);
  console.log(nom.padEnd(16), `x=${ax}..${bx} (w=${bx - ax + 1})  y=${ay}..${by} (h=${by - ay + 1})  n=${n}  pico=${pr.join(",")}  mediana=${vals[vals.length >> 1] ?? 0}`);
}
const C = [
  ["TANDA 01", 800, 925, 20, 42],
  ["CORE SEED", 800, 925, 44, 58],
  ["KX-TA01-0RIT", 800, 925, 59, 74],
  ["CLASS", 935, 1012, 20, 42],
  ["RITUAL", 935, 1012, 44, 58],
  ["DEVICE", 935, 1012, 59, 74],
  ["ORIGIN", 1022, 1130, 20, 42],
  ["UNKNOWN /", 1022, 1130, 44, 58],
  ["SIGNAL PROTO", 1022, 1130, 59, 74],
  ["PATTERN", 1140, 1240, 20, 42],
  ["PROTECT.", 1140, 1240, 44, 58],
  ["PERPETUATE.", 1140, 1240, 59, 74],
  ["STATUS", 1249, 1340, 20, 42],
  ["ACTIVE", 1249, 1340, 44, 74],
];
for (const c of C) caja(...c);
console.log("--- barra cian STATUS ---");
// máscara cian
let ax = 1e9, ay = 1e9, bx = -1, by = -1;
for (let y = 15; y < 80; y++) for (let x = 1330; x < 1460; x++) { const [r, g, b] = rgb(x, y); if (b > 30 && b - r > 15) { if (x < ax) ax = x; if (x > bx) bx = x; if (y < ay) ay = y; if (y > by) by = y; } }
console.log("cian bbox", ax, ay, bx, by);
for (let y = ay; y <= by; y++) {
  const seg = [];
  let s = -1;
  for (let x = 1250; x <= 1460; x++) { const [r, g, b] = rgb(x, y); const on = b > 24 && b - r > 10; if (on && s < 0) s = x; if (!on && s >= 0) { seg.push([s, x - 1]); s = -1; } }
  if (s >= 0) seg.push([s, 1460]);
  const mx = seg.length ? Math.max(...seg.map(([a, b2]) => { let m = 0; for (let x = a; x <= b2; x++) { const c = rgb(x, y); if (c[2] > m) m = c[2]; } return m; })) : 0;
  console.log(y, JSON.stringify(seg), "picoB=" + mx);
}
