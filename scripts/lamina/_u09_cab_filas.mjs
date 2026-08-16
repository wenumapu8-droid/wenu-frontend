#!/usr/bin/env node
/** u09-source · cabecera: tinta por fila, ref vs render, para ver dónde falta. */
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";

const ref = PNG.sync.read(readFileSync("reference/canon/u09-source.png"));
const act = PNG.sync.read(readFileSync("scripts/lamina/out/u09-source/actual.png"));
const UMBRAL = 40;
const Y0 = 0, Y1 = 232, X0 = 0, X1 = 1122;

const cuenta = (png, y) => {
  let n = 0;
  for (let x = X0; x < Math.min(X1, png.width); x++) {
    const i = (png.width * y + x) << 2;
    const lum = 0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2];
    if (lum >= UMBRAL) n++;
  }
  return n;
};

let totR = 0, totA = 0;
const filas = [];
for (let y = Y0; y < Y1; y++) {
  const r = cuenta(ref, y), a = cuenta(act, y);
  totR += r; totA += a;
  filas.push([y, r, a]);
}
console.log(`total ref=${totR} act=${totA} cobertura=${(100 * totA / totR).toFixed(1)}%`);
console.log("\nfilas con déficit (ref - act >= 30):");
for (const [y, r, a] of filas) {
  if (r - a >= 30) console.log(`y=${String(y).padStart(3)}  ref=${String(r).padStart(4)}  act=${String(a).padStart(4)}  falta=${r - a}`);
}
console.log("\nfilas con exceso (act - ref >= 30):");
for (const [y, r, a] of filas) {
  if (a - r >= 30) console.log(`y=${String(y).padStart(3)}  ref=${String(r).padStart(4)}  act=${String(a).padStart(4)}  sobra=${a - r}`);
}
