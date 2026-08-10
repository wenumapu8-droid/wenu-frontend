#!/usr/bin/env node
/** Perfil de tinta por fila (o columna) en una caja: para encontrar dónde
 *  empieza y termina cada renglón sin estimarlo. */
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
const img = PNG.sync.read(readFileSync("reference/canon/t01-07-cosmology-core.png"));
const { width: W, data } = img;
const lum = (x, y) => { const i = (y * W + x) * 4; return (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8; };
const [x0, y0, x1, y1] = process.argv.slice(2, 6).map(Number);
const U = Number(process.argv[6] ?? 20);
const eje = process.argv[7] ?? "y";
if (eje === "y") {
  for (let y = y0; y <= y1; y++) {
    let n = 0, s = 0;
    for (let x = x0; x <= x1; x++) { const l = lum(x, y); if (l > U) n++; s += l; }
    console.log(`${y}  ${String(n).padStart(4)}  ${"#".repeat(Math.min(70, Math.round(n / 3)))}`);
  }
} else {
  for (let x = x0; x <= x1; x++) {
    let n = 0;
    for (let y = y0; y <= y1; y++) if (lum(x, y) > U) n++;
    console.log(`${x}  ${String(n).padStart(4)}  ${"#".repeat(Math.min(70, n))}`);
  }
}
