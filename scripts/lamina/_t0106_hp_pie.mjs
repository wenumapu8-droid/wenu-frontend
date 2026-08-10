#!/usr/bin/env node
/* Cajas de tinta del pie de t01-06. */
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
const img = PNG.sync.read(readFileSync("reference/canon/t01-06-ritual-device.png"));
const { width: W, data } = img;
const rgb = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
const lum = (x, y) => { const p = rgb(x, y); return (p[0] * 77 + p[1] * 150 + p[2] * 29) >> 8; };
function caja(nom, x0, x1, y0, y1, thr = 20) {
  let ax = 1e9, ay = 1e9, bx = -1, by = -1, n = 0, pico = 0, pr = [0, 0, 0]; const vals = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const v = lum(x, y);
    if (v > pico) { pico = v; pr = rgb(x, y); }
    if (v > thr) { n++; vals.push(v); if (x < ax) ax = x; if (x > bx) bx = x; if (y < ay) ay = y; if (y > by) by = y; }
  }
  vals.sort((a, b) => a - b);
  console.log(nom.padEnd(14), `x=${ax}..${bx} (w=${bx - ax + 1})  y=${ay}..${by} (h=${by - ay + 1})  n=${n}  pico=${pr.join(",")}  mediana=${vals[vals.length >> 1] ?? 0}`);
}
// tramos horizontales de una fila
function runsx(y, x0, x1, thr = 15) {
  const r = []; let s = -1;
  for (let x = x0; x <= x1; x++) { const on = lum(x, y) > thr; if (on && s < 0) s = x; if (!on && s >= 0) { r.push([s, x - 1]); s = -1; } }
  if (s >= 0) r.push([s, x1]);
  return r;
}
console.log("== tramos de tinta en el pie por fila (y 874..914, x 13..1660, thr 18) ==");
for (let y = 874; y <= 914; y++) {
  const r = runsx(y, 13, 1660, 18).filter(([a, b]) => b - a >= 0);
  if (r.length) console.log(y, r.length, JSON.stringify(r.slice(0, 6)) + (r.length > 6 ? "…" : ""), "  primer=" + r[0][0], "ultimo=" + r[r.length - 1][1]);
}
console.log();
caja("KODEX-inf", 20, 200, 870, 915);
caja("barras", 200, 330, 870, 915);
caja("VISUAL SYS", 335, 500, 870, 915);
caja("BUILT", 600, 1100, 870, 915);
caja("PPP", 1100, 1420, 870, 915);
caja("ALA", 1450, 1660, 870, 915);
