#!/usr/bin/env node
/** Sonda de marcos del bloque Derecha de t01-07. Filas y columnas con tinta
 *  en más de un umbral de cobertura, dentro de la caja del andamiaje. */
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

const img = PNG.sync.read(readFileSync("reference/canon/t01-07-cosmology-core.png"));
const { width: W, data } = img;
const lum = (x, y) => { const i = (y * W + x) * 4; return (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8; };

const a = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const [X0, X1] = a("--x", "1175,1667").split(",").map(Number);
const [Y0, Y1] = a("--y", "88,865").split(",").map(Number);
const U = Number(a("--umbral", 12));
const COB = Number(a("--cob", 0.8));

const anchoX = X1 - X0 + 1, anchoY = Y1 - Y0 + 1;

console.log(`\n  caja ${X0}-${X1} × ${Y0}-${Y1}  umbral ${U}  cobertura ${COB}\n`);

console.log("  FILAS (horizontal):");
for (let y = Y0; y <= Y1; y++) {
  let n = 0, s = 0;
  for (let x = X0; x <= X1; x++) { const l = lum(x, y); if (l > U) n++; s += l; }
  if (n / anchoX >= COB) console.log(`    y=${y}  cob ${(n / anchoX).toFixed(2)}  lum media ${(s / anchoX).toFixed(1)}`);
}

console.log("\n  COLUMNAS (vertical):");
for (let x = X0; x <= X1; x++) {
  let n = 0, s = 0;
  for (let y = Y0; y <= Y1; y++) { const l = lum(x, y); if (l > U) n++; s += l; }
  if (n / anchoY >= COB) console.log(`    x=${x}  cob ${(n / anchoY).toFixed(2)}  lum media ${(s / anchoY).toFixed(1)}`);
}
