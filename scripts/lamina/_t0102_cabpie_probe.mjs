#!/usr/bin/env node
/**
 * Sonda de la cabecera y el pie de t01-02. Sólo lectura: imprime perfiles de
 * tinta por fila y por columna del PNG de referencia. No escribe nada.
 *
 *   node scripts/lamina/_t0102_cabpie_probe.mjs filas y0 y1 [x0 x1]
 *   node scripts/lamina/_t0102_cabpie_probe.mjs cols x0 x1 y0 y1
 *   node scripts/lamina/_t0102_cabpie_probe.mjs rgb x0 x1 y0 y1
 */
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

const img = PNG.sync.read(readFileSync("reference/canon/t01-02-observation-eye.png"));
const { width: W, height: H, data } = img;
const lum = (x, y) => { const i = (y * W + x) * 4; return (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8; };
const px = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };

const [modo, ...a] = process.argv.slice(2);
const n = a.map(Number);

if (modo === "filas") {
  const [y0, y1, x0 = 0, x1 = W - 1] = n;
  for (let y = y0; y <= y1; y++) {
    let s = 0, mx = 0, cnt = 0;
    for (let x = x0; x <= x1; x++) { const v = lum(x, y); s += v; if (v > mx) mx = v; if (v > 8) cnt++; }
    console.log(`y= ${String(y).padStart(4)}  media ${(s / (x1 - x0 + 1)).toFixed(2).padStart(7)}  max ${String(mx).padStart(3)}  n>8 ${cnt}`);
  }
} else if (modo === "cols") {
  const [x0, x1, y0, y1] = n;
  for (let x = x0; x <= x1; x++) {
    let s = 0, mx = 0, cnt = 0;
    for (let y = y0; y <= y1; y++) { const v = lum(x, y); s += v; if (v > mx) mx = v; if (v > 8) cnt++; }
    console.log(`x= ${String(x).padStart(4)}  media ${(s / (y1 - y0 + 1)).toFixed(2).padStart(7)}  max ${String(mx).padStart(3)}  n>8 ${cnt}`);
  }
} else if (modo === "rgb") {
  const [x0, x1, y0, y1] = n;
  let r = 0, g = 0, b = 0, c = 0, pico = [0, 0, 0], pl = 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const [pr, pg, pb] = px(x, y); r += pr; g += pg; b += pb; c++;
    const l = lum(x, y); if (l > pl) { pl = l; pico = [pr, pg, pb]; }
  }
  console.log(`media rgb(${(r / c).toFixed(1)},${(g / c).toFixed(1)},${(b / c).toFixed(1)})  pico rgb(${pico}) lum ${pl}`);
} else {
  console.log("modos: filas | cols | rgb");
}
