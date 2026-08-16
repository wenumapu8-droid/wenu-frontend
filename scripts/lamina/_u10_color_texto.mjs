#!/usr/bin/env node
/**
 * KODEX-∞ · u10-commons · COLOR DE UN TEXTO DE LA REFERENCIA
 *
 * Antes de declarar un `fill` y un `fill-opacity` hay que saber con qué tinta
 * está escrito. Promediar toda la caja no sirve: el fondo negro y el campo
 * arrastran la media a cero. Se promedia SOLO lo que pasa el umbral, y se
 * reporta también el pico, que es el color del trazo sin antialias.
 *
 * La referencia de esta lámina se compone sobre negro puro, así que el pico
 * dividido por el color declarado da la opacidad directamente.
 *
 * Uso: node scripts/lamina/_u10_color_texto.mjs x0,y0,x1,y1 [--umbral 62]
 */
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const U = Number(arg("--umbral", 62));
const png = PNG.sync.read(readFileSync(join(ROOT, "reference/canon/u10-commons.png")));

function caja(x0, y0, x1, y1) {
  let n = 0, r = 0, g = 0, b = 0, mx = 0, pico = [0, 0, 0];
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = (y * png.width + x) * 4;
      const L = 0.299 * png.data[i] + 0.587 * png.data[i + 1] + 0.114 * png.data[i + 2];
      if (L > U) {
        n++; r += png.data[i]; g += png.data[i + 1]; b += png.data[i + 2];
        if (L > mx) { mx = L; pico = [png.data[i], png.data[i + 1], png.data[i + 2]]; }
      }
    }
  }
  return n
    ? `${String(n).padStart(4)} px   medio rgb(${(r / n).toFixed(0)},${(g / n).toFixed(0)},${(b / n).toFixed(0)})   pico rgb(${pico.join(",")}) L=${mx.toFixed(0)}`
    : "   0 px";
}

const cajas = process.argv.slice(2).filter((a) => /^\d+,\d+,\d+,\d+$/.test(a));
if (!cajas.length) {
  /* Las cajas de referencia del bloque central y, para comparar, un texto de
     panel cuyo color YA está declarado en Paneles.astro. */
  const fijas = [
    ["YOU ARE NOT  ", [520, 299, 605, 308]],
    ["ALONE HERE   ", [524, 317, 600, 326]],
    ["PUBLIC TRACE ", [497, 1041, 623, 1053]],
    ["EVERY TRACE  ", [475, 1188, 645, 1197]],
    ["panel WRITE  ", [86, 604, 140, 614]],
    ["panel texto  ", [86, 632, 248, 642]],
  ];
  for (const [t, c] of fijas) console.log(`  ${t}  ${caja(...c)}`);
} else {
  for (const c of cajas) console.log(`  ${c}  ${caja(...c.split(",").map(Number))}`);
}
