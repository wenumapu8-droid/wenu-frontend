#!/usr/bin/env node
/* Reparte el error del panel por zonas: dice DÓNDE está el error, no cuánto.
   uso: node scripts/lamina/_t0106_hp_peor.mjs <Cabecera|Pie> */
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
const panel = process.argv[2] || "Cabecera";
const t = PNG.sync.read(readFileSync(`scripts/lamina/out/t01-06-ritual-device/paneles/${panel}-triptico.png`));
const { width: TW, height: H, data } = t;
const W = (TW - 16) / 3;
const at = (img, x, y) => { const i = (y * TW + x + img * (W + 8)) * 4; return [data[i], data[i + 1], data[i + 2]]; };
const err = (x, y) => { const a = at(0, x, y), b = at(1, x, y); return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]); };
// mapa por bloques de 40x11
const BX = 40, BY = 11;
const filas = [];
let total = 0;
for (let by = 0; by < H; by += BY) {
  const fila = [];
  for (let bx = 0; bx < W; bx += BX) {
    let s = 0;
    for (let y = by; y < Math.min(by + BY, H); y++) for (let x = bx; x < Math.min(bx + BX, W); x++) s += err(x, y);
    fila.push(s); total += s;
  }
  filas.push([by, fila]);
}
console.log("total", total);
// las 25 celdas peores
const peores = [];
filas.forEach(([by, fila]) => fila.forEach((v, i) => peores.push([v, i * BX, by])));
peores.sort((a, b) => b[0] - a[0]);
console.log("peores celdas (err, x, y):");
for (const [v, x, y] of peores.slice(0, 25)) console.log(`  ${String(v).padStart(8)}  x=${x}..${x + BX - 1}  y=${y}..${y + BY - 1}   ${(100 * v / total).toFixed(2)}%`);
// por franja de x
const porX = new Array(Math.ceil(W / 100)).fill(0);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) porX[Math.floor(x / 100)] += err(x, y);
console.log("por franja de 100 px en x:");
porX.forEach((v, i) => console.log(`  x=${i * 100}..${i * 100 + 99}  ${String(v).padStart(8)}  ${(100 * v / total).toFixed(1)}%`));
