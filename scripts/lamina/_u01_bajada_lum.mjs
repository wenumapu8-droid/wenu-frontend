#!/usr/bin/env node
/**
 * KODEX-∞ · u01-origin-field · perfil de luminancia de la bajada
 *
 * perfil.mjs binariza con un umbral; acá hace falta el valor crudo, porque las
 * guías de la bajada (anillo + raya a cada lado del lema) están por DEBAJO del
 * umbral 40 en la referencia y por ENCIMA en el render: el binario dice
 * "sobra tinta" sin decir cuánta. Esto imprime, columna por columna, el máximo
 * de luminancia de la banda y la fila donde cae.
 *
 * Uso: node scripts/lamina/_u01_bajada_lum.mjs <png> <x0> <x1> <y0> <y1>
 */
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";

const [, , file, x0s, x1s, y0s, y1s] = process.argv;
const png = PNG.sync.read(readFileSync(file));
const W = png.width;
const lum = (x, y) => {
  const i = (y * W + x) * 4;
  return (png.data[i] * 77 + png.data[i + 1] * 150 + png.data[i + 2] * 29) >> 8;
};
const [x0, x1, y0, y1] = [+x0s, +x1s, +y0s, +y1s];
const out = [];
for (let x = x0; x <= x1; x++) {
  let m = 0, my = 0;
  for (let y = y0; y <= y1; y++) { const l = lum(x, y); if (l > m) { m = l; my = y; } }
  out.push(`${x}:${m}@${my}`);
}
console.log(out.join(" "));
