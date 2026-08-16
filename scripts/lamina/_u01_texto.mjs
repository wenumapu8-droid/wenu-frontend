#!/usr/bin/env node
/**
 * Detector de líneas de texto sobre la referencia de u01.
 *
 *   node scripts/lamina/_u01_texto.mjs x0 x1 y0 y1 [umbral]
 *
 * Agrupa filas con tinta en líneas y devuelve, por línea: caja de tinta, alto
 * de versal, color medio y los arranques de carácter (para deducir el avance).
 */
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

const im = PNG.sync.read(readFileSync("/Users/galvazincia/kodex-work/reference/canon/u01-origin-field.png"));
const W = im.width;
const lum = (x, y) => {
  const i = (y * W + x) * 4;
  return (im.data[i] * 77 + im.data[i + 1] * 150 + im.data[i + 2] * 29) >> 8;
};
const [x0, x1, y0, y1, uArg] = process.argv.slice(2).map(Number);
const u = uArg || 55;

const filas = [];
for (let y = y0; y <= y1; y++) {
  let n = 0;
  for (let x = x0; x <= x1; x++) if (lum(x, y) >= u) n++;
  filas.push(n);
}
const lineas = [];
let ini = -1;
for (let i = 0; i < filas.length; i++) {
  if (filas[i] >= 2 && ini < 0) ini = i;
  else if (filas[i] < 2 && ini >= 0) { lineas.push([ini + y0, i - 1 + y0]); ini = -1; }
}
if (ini >= 0) lineas.push([ini + y0, y1]);

for (const [a, b] of lineas) {
  if (b - a < 3) continue;
  let mnx = 1e9, mxx = -1, r = 0, g = 0, bl = 0, c = 0;
  const cols = [];
  for (let x = x0; x <= x1; x++) {
    let hay = false;
    for (let y = a; y <= b; y++) {
      if (lum(x, y) < u) continue;
      hay = true;
      const i = (y * W + x) * 4;
      r += im.data[i]; g += im.data[i + 1]; bl += im.data[i + 2]; c++;
    }
    cols.push(hay);
    if (hay) { if (x < mnx) mnx = x; if (x > mxx) mxx = x; }
  }
  /* Arranques: transición sin-tinta → con-tinta. */
  const arr = [];
  for (let i = 1; i < cols.length; i++) if (cols[i] && !cols[i - 1]) arr.push(i + x0);
  const pasos = arr.slice(1).map((v, i) => v - arr[i]).filter((d) => d < 40);
  const paso = pasos.length ? pasos.reduce((s, v) => s + v, 0) / pasos.length : 0;
  console.log(
    `y=${a}..${b} (alto ${b - a + 1})  x=${mnx}..${mxx} (ancho ${mxx - mnx + 1})  ` +
    `rgb(${(r / c) | 0},${(g / c) | 0},${(bl / c) | 0})  arranques=${arr.length} pasoMedio=${paso.toFixed(2)}`
  );
  console.log(`      x: ${arr.join(" ")}`);
}
