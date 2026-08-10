#!/usr/bin/env node
/**
 * KODEX-∞ · t01-04 ARCHIVE TREE · EXTRACTOR DEL BLOQUE CENTRO
 *
 * Trazador propio, con destino propio. `scripts/lamina/glyphs.mjs` escribe
 * siempre en glyphs/<slug>/ y dos agentes de la MISMA lámina se pisan la salida
 * sin enterarse; acá cada corrida cae en
 * src/components/kodex/lamina/t01-04/trazos-centro/ y no la toca nadie más.
 *
 * Hace dos cosas distintas porque son dos problemas distintos:
 *
 *  · ARTE FIJA (columna de glifos, emblema del disco, fila de marcas del pie):
 *    sobremuestreo ×8 nearest → binarizado por umbral → inversión → vtracer.
 *    Dos capas por pieza: una base a umbral bajo, que recoge el marco tenue y
 *    el halo, y un realce a umbral alto con el núcleo brillante. Una sola capa
 *    obliga a elegir entre perder el marco o empastar el glifo.
 *
 *  · CÓDIGOS DE BARRAS Y TIRAS DE MARCAS: NO se trazan. Una tira de marcas es
 *    una función de una sola variable; el contorno le inventa esquinas y le
 *    come tinta. Se lee COLUMNA POR COLUMNA y se comprime por tramos iguales.
 *
 * Uso: node scripts/lamina/_t0104_centro_arte.mjs
 */
import sharp from "sharp";
import { vectorize, ColorMode, PathSimplifyMode, Hierarchical } from "@neplex/vectorizer";
import { PNG } from "pngjs";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const REF = join(ROOT, "reference", "canon", "t01-04-archive-tree.png");
const OUT = join(ROOT, "src", "components", "kodex", "lamina", "t01-04", "trazos-centro");
mkdirSync(OUT, { recursive: true });

const img = PNG.sync.read(readFileSync(REF));
const { width: W, data } = img;
const lum = (x, y) => { const i = (y * W + x) * 4; return (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8; };

const ESCALA = 8;

/* ── arte fija ─────────────────────────────────────────────────────────── */
async function trazar(nombre, caja, umbral) {
  const { x, y, w, h } = caja;
  const bin = await sharp(REF)
    .extract({ left: x, top: y, width: w, height: h })
    .resize({ width: w * ESCALA, height: h * ESCALA, kernel: "nearest" })
    .blur(1)                 // el trazo binario necesita 1 px de desenfoque:
    .greyscale()             // sin él el contorno persigue el ruido del raster
    .threshold(umbral)
    .negate()                // vtracer binario traza lo OSCURO; la tinta es lo claro
    .png()
    .toBuffer();

  // El Config del binding es completo, no parcial: van todas las claves.
  const svg = await vectorize(bin, {
    colorMode: ColorMode.Binary,
    hierarchical: Hierarchical.Stacked,
    filterSpeckle: 4,
    colorPrecision: 6,
    layerDifference: 16,
    mode: PathSimplifyMode.Spline,
    cornerThreshold: 60,
    lengthThreshold: 4,
    maxIterations: 10,
    spliceThreshold: 45,
    pathPrecision: 2,
  });

  const limpio = svg
    .replace(/<svg[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w * ESCALA} ${h * ESCALA}" width="${w}" height="${h}" preserveAspectRatio="none">`)
    .replace(/<\/?g[^>]*>/g, "")
    .replace(/fill="[^"]*"/g, 'fill="currentColor"');
  writeFileSync(join(OUT, `${nombre}.svg`), limpio);
  const nodos = (limpio.match(/[MLCQZ]/g) ?? []).length;
  console.log(`  ${nombre.padEnd(18)} ${w}×${h} @${umbral}  ${nodos} nodos  ${(limpio.length / 1024).toFixed(1)}KB`);
}

/* ── tira de marcas: columna por columna ───────────────────────────────── */
function tira(x0, x1, y0, y1, umbral) {
  const cols = [];
  for (let x = x0; x <= x1; x++) {
    let a = -1, b = -1, mx = 0;
    for (let y = y0; y <= y1; y++) {
      const v = lum(x, y);
      if (v > umbral) { if (a < 0) a = y; b = y; if (v > mx) mx = v; }
    }
    cols.push(a < 0 ? null : [a, b - a + 1, mx]);
  }
  // comprime tramos con la misma firma
  const tramos = [];
  let ini = 0;
  for (let i = 1; i <= cols.length; i++) {
    const p = cols[i - 1], q = cols[i];
    const igual = p && q && p[0] === q[0] && p[1] === q[1] && Math.abs(p[2] - q[2]) < 12;
    if (!igual) {
      if (p) tramos.push([x0 + ini, i - ini, p[0], p[1], p[2]]);
      ini = i;
    }
  }
  return tramos;
}

/* Las cajas salieron de sondear el PNG, no de estimarlas. */
await trazar("glifos-base", { x: 452, y: 120, w: 44, h: 232 }, 16);
await trazar("glifos-alto", { x: 452, y: 120, w: 44, h: 232 }, 52);
await trazar("emblema-base", { x: 874, y: 376, w: 94, h: 96 }, 22);
await trazar("emblema-alto", { x: 874, y: 376, w: 94, h: 96 }, 62);
await trazar("marcas-pie", { x: 412, y: 564, w: 260, h: 16 }, 30);
/* El ∞ del tronco NO va procedural: es arte fija y además la pieza más
   brillante del panel (pico 226 contra 150 de las raíces que pasan por
   detrás), así que un umbral alto lo separa limpio del organismo. */
await trazar("infinito-base", { x: 656, y: 345, w: 88, h: 40 }, 96);
await trazar("infinito-alto", { x: 656, y: 345, w: 88, h: 40 }, 150);

const senal = tira(412, 834, 518, 544, 24);
const brida = tira(412, 834, 552, 566, 26);
writeFileSync(
  join(OUT, "tiras.json"),
  JSON.stringify({ senal, brida }, null, 0)
);
console.log(`  tiras.json          señal ${senal.length} tramos · cifras ${brida.length} tramos`);
