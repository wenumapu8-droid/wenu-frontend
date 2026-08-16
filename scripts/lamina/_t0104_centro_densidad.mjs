#!/usr/bin/env node
/**
 * Mapa de sobra/falta de tinta del bloque Centro.
 *
 * El diff píxel a píxel de un fractal es casi ciego: dos árboles con la misma
 * masa pero distintas ramas dan 100 % de desacuerdo. Lo que SÍ se puede
 * perseguir es el término estructural del banco —la media de luminancia por
 * bloque— y para eso hace falta ver dónde sobra y dónde falta, no un número.
 *
 * Lee el tríptico que deja score-panel.mjs (referencia | actual | diff) y
 * compara las medias por bloque.
 *
 * Uso: node scripts/lamina/_t0104_centro_densidad.mjs [bloque] [x0 x1 y0 y1]
 */
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const T = PNG.sync.read(readFileSync(join(ROOT, "scripts", "lamina", "out", "t01-04-archive-tree", "paneles", "Centro-triptico.png")));
const W = 610, H = 778, GAP = 8;
const lum = (px, py, off) => {
  const i = (py * T.width + px + off) * 4;
  return (T.data[i] * 77 + T.data[i + 1] * 150 + T.data[i + 2] * 29) >> 8;
};
const B = Number(process.argv[2] || 16);
const [x0, x1, y0, y1] = process.argv.length > 3 ? process.argv.slice(3, 7).map(Number) : [0, W - 1, 0, H - 1];

let sumRef = 0, sumAct = 0, n = 0, err = 0;
for (let by = y0; by <= y1; by += B) {
  let fila = "";
  for (let bx = x0; bx <= x1; bx += B) {
    let a = 0, b = 0, c = 0;
    for (let yy = by; yy < Math.min(by + B, y1 + 1); yy++)
      for (let xx = bx; xx < Math.min(bx + B, x1 + 1); xx++) { a += lum(xx, yy, 0); b += lum(xx, yy, W + GAP); c++; }
    a /= c; b /= c;
    sumRef += a; sumAct += b; n++; err += Math.abs(a - b);
    const d = b - a;                      // >0 sobra tinta · <0 falta
    fila += Math.abs(d) < 4 ? "·" : d > 24 ? "@" : d > 12 ? "O" : d > 4 ? "o" : d < -24 ? "#" : d < -12 ? "X" : "x";
  }
  console.log(String(by).padStart(4), fila);
}
console.log(`\n  media ref ${(sumRef / n).toFixed(2)} · actual ${(sumAct / n).toFixed(2)} · |error| ${(err / n).toFixed(2)}`);
console.log("  o O @ = sobra tinta   ·   x X # = falta tinta   ·   · = dentro de ±4");
