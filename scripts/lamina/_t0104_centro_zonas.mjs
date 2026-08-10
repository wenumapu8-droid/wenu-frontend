#!/usr/bin/env node
/* Media de luminancia referencia vs render, por zona nombrada del bloque
   Centro. Es el mismo tríptico que deja score-panel.mjs. */
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const T = PNG.sync.read(readFileSync(join(ROOT, "scripts", "lamina", "out", "t01-04-archive-tree", "paneles", "Centro-triptico.png")));
const W = 610, GAP = 8;
const lum = (px, py, off) => { const i = (py * T.width + px + off) * 4; return (T.data[i] * 77 + T.data[i + 1] * 150 + T.data[i + 2] * 29) >> 8; };
/* Cajas en coordenadas de la caja del bloque (póster − 400,−88). */
const ZONAS = [
  ["titulo",        3, 580,   2,  20],
  ["regla",         3, 580,  20,  24],
  ["escala",       10,  46,  30, 385],
  ["glifos",       50,  98,  30, 266],
  ["copa",        110, 480,  30, 235],
  ["tronco",      270, 330, 170, 275],
  ["raices",       40, 500, 270, 410],
  ["capas-der",   470, 580,  30, 270],
  ["emblema",     470, 570, 285, 390],
  ["senal-rot",    10, 100, 420, 432],
  ["tira",         12, 430, 430, 456],
  ["stability",   445, 570, 428, 462],
  ["brida",        10, 575, 456, 494],
  ["marco-inf",     0, 610, 494, 510],
  ["07-cola",       0,  62, 508, 762],
  ["08-titulo",    65, 583, 508, 534],
  ["08-camara",    72, 580, 534, 760],
  ["03-09-borde", 583, 610,   0, 762],
];
console.log("zona           ref   act   dif   |err| 8x8");
for (const [n, x0, x1, y0, y1] of ZONAS) {
  let a = 0, b = 0, c = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { a += lum(x, y, 0); b += lum(x, y, W + GAP); c++; }
  // error estructural 8x8 de la zona
  let acum = 0, nb = 0;
  for (let by = y0; by < y1; by += 8) for (let bx = x0; bx < x1; bx += 8) {
    let sa = 0, sb = 0, k = 0;
    for (let y = by; y < Math.min(by + 8, y1); y++) for (let x = bx; x < Math.min(bx + 8, x1); x++) { sa += lum(x, y, 0); sb += lum(x, y, W + GAP); k++; }
    if (k) { acum += Math.abs(sa / k - sb / k); nb++; }
  }
  console.log(n.padEnd(13), (a / c).toFixed(1).padStart(5), (b / c).toFixed(1).padStart(5),
    ((b - a) / c).toFixed(1).padStart(6), (acum / nb).toFixed(1).padStart(6));
}
