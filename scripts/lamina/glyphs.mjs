#!/usr/bin/env node
/**
 * KODEX-∞ · EXTRACTOR DE GLIFOS
 *
 * Recorta los glifos de una referencia y los vectoriza a SVG real con vtracer
 * (@neplex/vectorizer, el binding nativo de la librería de visioncortex).
 *
 * Por qué esto y no dibujarlos a mano: las 17 láminas tienen entre 6 y 30
 * glifos cada una — del orden de 200 símbolos. Dibujados a ojo salen parecidos
 * y distintos entre sí cada vez; trazados del original salen iguales al
 * original, que es lo único que el banco de pruebas premia. Los agentes que
 * los dibujaron a ojo lo dijeron solos: "son reconstrucciones, conservan el
 * peso visual y la silueta", y ahí se queda un techo de fidelidad.
 *
 * El truco que hace que funcione es el PRE-PROCESO, no el trazador:
 *
 *  1. sobremuestreo ×8 con kernel nearest — vtracer traza contornos, y sobre un
 *     glifo de 20 px el contorno es escalonado; sobre 160 px sale limpio;
 *  2. binarizado por umbral de luminancia — el original es naranja sobre negro
 *     con antialias, y el antialias se traza como un halo de contornos dobles;
 *  3. inversión — vtracer en modo binario traza lo OSCURO, y acá la tinta es lo
 *     claro.
 *
 * Sin los tres pasos el resultado son miles de nodos de ruido.
 *
 * Uso: node scripts/lamina/glyphs.mjs <slug> --band y0,y1 [--x x0,x1] [--umbral 34]
 */

import sharp from "sharp";
import { vectorize, ColorMode, PathSimplifyMode, Hierarchical } from "@neplex/vectorizer";
import { PNG } from "pngjs";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

const slug = process.argv[2];
const arg = (n, d) => {
  const i = process.argv.indexOf(n);
  return i > -1 ? process.argv[i + 1] : d;
};
if (!slug || !arg("--band")) {
  console.error("uso: node scripts/lamina/glyphs.mjs <slug> --band y0,y1 [--x x0,x1] [--umbral 34] [--out subcarpeta]");
  process.exit(2);
}
const [y0, y1] = arg("--band").split(",").map(Number);
const [x0, x1] = arg("--x", "0,99999").split(",").map(Number);
const UMBRAL = Number(arg("--umbral", 34));
const ESCALA = 8;

const refPath = join(ROOT, "reference", "canon", `${slug}.png`);
const img = PNG.sync.read(readFileSync(refPath));
const { width: W, data } = img;
const lum = (x, y) => {
  const i = (y * W + x) * 4;
  return (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
};

// ── separar los glifos por columnas de tinta ─────────────────────────────
const xa = Math.max(0, x0);
const xb = Math.min(W - 1, x1);
const celdas = [];
let run = null;
for (let x = xa; x <= xb; x++) {
  let n = 0;
  for (let y = y0; y <= y1; y++) if (lum(x, y) > UMBRAL) n++;
  if (n > 0) run = run ? [run[0], x] : [x, x];
  else if (run && x - run[1] > 2) {
    celdas.push(run);
    run = null;
  }
}
if (run) celdas.push(run);

// Recorta cada celda a su alto real: centrar mal un glifo lo desplaza en la
// lámina y el diff lo castiga aunque el dibujo sea perfecto.
const cajas = celdas.map(([cx0, cx1]) => {
  let ty = y1, by = y0;
  for (let y = y0; y <= y1; y++) {
    for (let x = cx0; x <= cx1; x++) {
      if (lum(x, y) > UMBRAL) { if (y < ty) ty = y; if (y > by) by = y; break; }
    }
  }
  return { x: cx0, y: ty, w: cx1 - cx0 + 1, h: by - ty + 1 };
});

/**
 * Destino propio por corrida.
 *
 * Antes esto era siempre `glyphs/<slug>/`, un único directorio por lámina. Dos
 * agentes trabajando bloques distintos de la MISMA lámina se pisaban la salida
 * sin enterarse: uno perdió varias corridas de barrido y lo descubrió tarde,
 * cuando ya había medido contra los archivos del otro. El bug es barato de
 * arreglar y caro de no arreglar, porque el trabajo perdido no avisa.
 *
 *   --out <nombre>   escribe en glyphs/<slug>/<nombre>/
 */
const sub = arg("--out", "");
const outDir = sub ? join(HERE, "glyphs", slug, sub) : join(HERE, "glyphs", slug);
mkdirSync(outDir, { recursive: true });

const manifiesto = [];
for (const [i, c] of cajas.entries()) {
  const id = `g${String(i + 1).padStart(2, "0")}`;

  const bin = await sharp(refPath)
    .extract({ left: c.x, top: c.y, width: c.w, height: c.h })
    .resize({ width: c.w * ESCALA, height: c.h * ESCALA, kernel: "nearest" })
    .greyscale()
    .threshold(UMBRAL)
    .negate() // vtracer binario traza lo oscuro; la tinta acá es lo claro
    .png()
    .toBuffer();

  // El Config del binding es completo, no parcial: pasar solo algunas claves
  // lanza «Value is none of these types JsConfig, Preset». Van todas.
  const svg = await vectorize(bin, {
    colorMode: ColorMode.Binary,
    hierarchical: Hierarchical.Stacked,
    filterSpeckle: 6,
    colorPrecision: 6,
    layerDifference: 16,
    mode: PathSimplifyMode.Spline,
    cornerThreshold: 60,
    lengthThreshold: 4,
    maxIterations: 10,
    spliceThreshold: 45,
    pathPrecision: 2,
  });

  // Reescala el viewBox a las unidades de la lámina para poder pegarlo tal cual.
  const limpio = svg
    .replace(/<svg[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${c.w * ESCALA} ${c.h * ESCALA}" width="${c.w}" height="${c.h}">`)
    .replace(/<\/?g[^>]*>/g, "");

  writeFileSync(join(outDir, `${id}.svg`), limpio);
  const nodos = (limpio.match(/[MLCQZ]/g) ?? []).length;
  manifiesto.push({ id, caja: c, nodos, bytes: limpio.length });
  console.log(`  ${id}  ${String(c.x).padStart(4)},${String(c.y).padStart(4)}  ${c.w}×${c.h}  ${nodos} nodos  ${(limpio.length / 1024).toFixed(1)}KB`);
}

writeFileSync(
  join(outDir, "manifiesto.json"),
  JSON.stringify({ slug, banda: [y0, y1], umbral: UMBRAL, escala: ESCALA, glifos: manifiesto }, null, 2)
);
console.log(`\n  ${manifiesto.length} glifos → scripts/lamina/glyphs/${slug}${sub ? "/" + sub : ""}/\n`);
if (!sub) console.log("  aviso: sin --out escribís en el directorio compartido de la lámina.\n         Si hay otro agente en la misma, vas a pisarle la salida.\n");
