#!/usr/bin/env node
/**
 * KODEX-∞ · u01-origin-field · perfil de tinta POR FILA de una caja
 *
 * El perfil por columnas ya dijo que el lema cae en la x correcta y con la
 * altura correcta, y aun así el lema paga 1.749 de los 2.350 píxeles distintos
 * de la bajada. Lo que queda por mirar es el reparto vertical y la cantidad
 * total de tinta: una fuente medio punto más grande, o medio punto más opaca,
 * no corre ningún glifo de sitio y sin embargo pinta de más en cada borde.
 *
 * Imprime por fila: píxeles con tinta (>umbral), suma de luminancia y máximo.
 *
 * Uso: node scripts/lamina/_u01_bajada_filas.mjs <x0> <x1> <y0> <y1> [umbral]
 */
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const [, , x0s, x1s, y0s, y1s, us] = process.argv;
const [x0, x1, y0, y1] = [+x0s, +x1s, +y0s, +y1s];
const U = us ? +us : 40;

const imgs = {
  ref: PNG.sync.read(readFileSync(join(ROOT, "reference", "canon", "u01-origin-field.png"))),
  ren: PNG.sync.read(readFileSync(join(ROOT, "scripts", "lamina", "out", "u01-origin-field", "actual.png"))),
};

function fila(png, y) {
  const W = png.width;
  let n = 0, suma = 0, max = 0;
  for (let x = x0; x <= x1; x++) {
    const i = (y * W + x) * 4;
    const l = (png.data[i] * 77 + png.data[i + 1] * 150 + png.data[i + 2] * 29) >> 8;
    if (l > U) n++;
    suma += l;
    if (l > max) max = l;
  }
  return { n, suma, max };
}

console.log(`\ncaja x ${x0}..${x1} · umbral ${U}\n`);
console.log("  fila |   ref: px    suma   max |   ren: px    suma   max |   Δpx    Δsuma");
let tr = 0, ta = 0;
for (let y = y0; y <= y1; y++) {
  const r = fila(imgs.ref, y), a = fila(imgs.ren, y);
  tr += r.suma; ta += a.suma;
  console.log(
    `  ${String(y).padStart(4)} |      ${String(r.n).padStart(4)} ${String(r.suma).padStart(7)} ${String(r.max).padStart(5)} |` +
    `      ${String(a.n).padStart(4)} ${String(a.suma).padStart(7)} ${String(a.max).padStart(5)} |` +
    ` ${String(a.n - r.n).padStart(5)} ${String(a.suma - r.suma).padStart(8)}`
  );
}
console.log(`\n  tinta total (suma de luminancia)   ref ${tr}   render ${ta}   ratio ${(ta / tr).toFixed(4)}`);
