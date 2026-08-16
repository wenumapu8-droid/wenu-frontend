#!/usr/bin/env node
/**
 * KODEX-∞ · t01-04 ARCHIVE TREE · ARTE FIJA DE LA CABECERA Y DEL PIE
 *
 * Genera src/components/kodex/lamina/t01-04/arte.ts trazando las piezas fijas
 * de las dos franjas desde reference/canon/t01-04-archive-tree.png. El .ts no
 * se edita a mano: se corre esto.
 *
 *   node scripts/lamina/arte-t01-04-hdrftr.mjs           # genera arte.ts
 *   node scripts/lamina/arte-t01-04-hdrftr.mjs --barrer  # barre umbrales
 *
 * Traza con el mismo pre-proceso que scripts/lamina/glyphs.mjs (sobremuestreo
 * ×8 nearest → binarizado por luminancia → inversión → vtracer), pero escribe
 * en un directorio propio: la lámina la están armando cinco agentes a la vez y
 * glyphs/<slug>/ es un único cajón compartido que se pisan entre sí.
 *
 * NINGÚN umbral de acá está elegido a ojo. `--barrer` traza cada pieza con
 * varios umbrales, la rasteriza con librsvg sobre negro y se queda con el par
 * (umbral, relleno) que menos error absoluto medio deja contra la referencia.
 * La tabla de resultados queda en la cabecera de arte.ts.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { PNG } from "pngjs";
import sharp from "sharp";
import { vectorize, ColorMode, PathSimplifyMode, Hierarchical } from "@neplex/vectorizer";

const SLUG = "t01-04-archive-tree";
const REF = `reference/canon/${SLUG}.png`;
const TMP = "scripts/lamina/out/_t0104_hdrftr";
const ESCALA = 8;

const img = PNG.sync.read(readFileSync(REF));
const { width: W, data } = img;
const lum = (x, y) => { const i = (y * W + x) * 4; return (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8; };

mkdirSync(TMP, { recursive: true });

/* ── trazado ──────────────────────────────────────────────────────────────
   Separa la banda en glifos por columnas con tinta, recorta cada uno a su alto
   real y lo vectoriza. Recortar al alto real importa: centrar mal un glifo lo
   corre en la lámina y el diff lo castiga aunque el dibujo esté perfecto. */
async function trazar(band, xr, umbral, dy = 0) {
  const [y0, y1] = band.split(",").map(Number);
  const [x0, x1] = xr.split(",").map(Number);

  const celdas = [];
  let run = null;
  for (let x = Math.max(0, x0); x <= Math.min(W - 1, x1); x++) {
    let n = 0;
    for (let y = y0; y <= y1; y++) if (lum(x, y) > umbral) n++;
    if (n > 0) run = run ? [run[0], x] : [x, x];
    else if (run && x - run[1] > 2) { celdas.push(run); run = null; }
  }
  if (run) celdas.push(run);

  const glifos = [];
  for (const [cx0, cx1] of celdas) {
    let ty = y1, by = y0;
    for (let y = y0; y <= y1; y++) {
      for (let x = cx0; x <= cx1; x++) {
        if (lum(x, y) > umbral) { if (y < ty) ty = y; if (y > by) by = y; break; }
      }
    }
    const c = { x: cx0, y: ty, w: cx1 - cx0 + 1, h: by - ty + 1 };

    const bin = await sharp(REF)
      .extract({ left: c.x, top: c.y, width: c.w, height: c.h })
      .resize({ width: c.w * ESCALA, height: c.h * ESCALA, kernel: "nearest" })
      .greyscale()
      .threshold(umbral)
      .negate() // vtracer binario traza lo oscuro; acá la tinta es lo claro
      .png()
      .toBuffer();

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

    /* Cada path viene con su propio transform="translate(..)". Perderlo desarma
       el glifo: la contraforma de la D queda fuera de sitio y la letra sale
       maciza. Se guarda el par. */
    const d = [...svg.matchAll(/<path d="([^"]+)"(?:[^>]*transform="([^"]+)")?/g)].map((m) => [m[1], m[2] ?? ""]);
    glifos.push({ x: c.x, y: c.y - dy, w: c.w, h: c.h, vw: c.w * ESCALA, vh: c.h * ESCALA, d });
  }
  return glifos;
}

/* ── código de barras ─────────────────────────────────────────────────────
   Un código de barras es una función de UNA variable, así que se lee columna
   por columna y no se traza: el contorno le inventa esquinas y le come tinta. */
function barras(x0, x1, y0, y1, dy = 0) {
  const cols = [];
  for (let x = x0; x <= x1; x++) {
    let s = 0;
    for (let y = y0; y <= y1; y++) s += lum(x, y);
    cols.push(Math.round(s / (y1 - y0 + 1)));
  }
  const tramos = [];
  let i = 0;
  while (i < cols.length) {
    let j = i;
    while (j + 1 < cols.length && Math.abs(cols[j + 1] - cols[i]) <= 6) j++;
    const v = Math.round(cols.slice(i, j + 1).reduce((a, b) => a + b, 0) / (j - i + 1));
    if (v > 8) tramos.push([x0 + i, j - i + 1, v]);
    i = j + 1;
  }
  return { y: y0 - dy, h: y1 - y0 + 1, tramos };
}

/* ── barrido de umbral ────────────────────────────────────────────────────
   Rasteriza los glifos trazados sobre negro y mide el error absoluto medio
   contra el recorte de la referencia. El relleno se barre junto con el umbral
   porque los dos compensan lo mismo: el trazo binarizado sale con el halo de
   antialias adentro, así que la silueta es más ancha y quiere menos brillo. */
async function medir(glifos, band, xr, dy) {
  const [y0, y1] = band.split(",").map(Number);
  const [x0, x1] = xr.split(",").map(Number);
  const w = x1 - x0 + 1, h = y1 - y0 + 1;

  const cuerpo = glifos.map((g) =>
    `<svg x="${g.x - x0}" y="${g.y + dy - y0}" width="${g.w}" height="${g.h}" viewBox="0 0 ${g.vw} ${g.vh}" preserveAspectRatio="none">` +
    g.d.map(([d, tr]) => `<path d="${d}"${tr ? ` transform="${tr}"` : ""} fill="#fff"/>`).join("") + `</svg>`
  ).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#000"/>${cuerpo}</svg>`;
  const mask = await sharp(Buffer.from(svg)).greyscale().raw().toBuffer();

  let best = null;
  for (let gris = 40; gris <= 230; gris += 5) {
    let e = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const m = mask[y * w + x] / 255;
      e += Math.abs(m * gris - lum(x0 + x, y0 + y));
    }
    const mae = e / (w * h);
    if (!best || mae < best.mae) best = { gris, mae };
  }
  return best;
}

/* ── piezas ───────────────────────────────────────────────────────────────
   [nombre, banda, rango x, umbral elegido, desplazamiento y de la caja].
   Las y del pie ya vienen restadas −866, que es donde arranca su caja. */
const PIEZAS = [
  ["hdrMarca",   "16,54",   "14,266",    80,   0],
  ["hdrTitulo",  "16,54",   "267,600",   80,   0],
  ["hdrBajada",  "62,78",   "14,300",    40,   0],
  ["hdrClaves",  "28,42",   "808,1245",  40,   0],
  ["hdrLema1",   "28,42",   "1312,1500", 22,   0],
  ["hdrLema2",   "44,58",   "1312,1510", 22,   0],
  ["hdrAla",     "26,60",   "1506,1650", 26,   0],
  ["ftrMarca",   "882,910", "14,175",    40, 866],
  ["ftrVerde",   "886,902", "742,1015",  34, 866],
  ["ftrPpp",     "884,900", "1198,1415", 26, 866],
  ["ftrAla",     "874,920", "1436,1648", 22, 866],
];

const UMBRALES = [18, 22, 26, 30, 34, 40, 45, 50, 55, 60, 70, 80];

if (process.argv.includes("--barrer")) {
  for (const [nombre, band, xr, , dy] of PIEZAS) {
    const filas = [];
    for (const u of UMBRALES) {
      const g = await trazar(band, xr, u, dy);
      if (!g.length) { filas.push({ u, mae: Infinity, gris: 0, n: 0 }); continue; }
      const m = await medir(g, band, xr, dy);
      filas.push({ u, ...m, n: g.length });
    }
    filas.sort((a, b) => a.mae - b.mae);
    console.log(nombre.padEnd(10), filas.slice(0, 4).map((f) => `u${f.u}/g${f.gris}=${f.mae.toFixed(2)}(${f.n})`).join("  "));
  }
  rmSync(TMP, { recursive: true, force: true });
  process.exit(0);
}

const arte = {};
const informe = [];
for (const [nombre, band, xr, u, dy] of PIEZAS) {
  arte[nombre] = await trazar(band, xr, u, dy);
  const m = await medir(arte[nombre], band, xr, dy);
  informe.push(` *   ${nombre.padEnd(10)} ${band.padEnd(9)} ${String(u).padStart(3)}      ${m.gris.toString().padStart(3)}     ${m.mae.toFixed(2)}`);
}
arte.ftrBarras = barras(184, 293, 881, 907, 866);

const cab = `/**
 * t01-04 · ARTE FIJA TRAZADA — NO SE EDITA A MANO.
 *
 * Generado desde reference/canon/t01-04-archive-tree.png con
 * scripts/lamina/arte-t01-04-hdrftr.mjs (vtracer sobre el original
 * sobremuestreado ×8). Cada umbral salió de un barrido medido —\`--barrer\`
 * traza la pieza con doce umbrales, la rasteriza sobre negro y se queda con la
 * que menos error absoluto medio deja— y no de mirarla y elegir la que "se veía
 * bien":
 *
 *   pieza      banda     umbral  relleno   MAE
${informe.join("\n")}
 *
 * Los VALORES de la tabla de metadatos no están acá y no deben estarlo: son
 * cifras, y el canon pide que las cifras vayan como texto de verdad dentro de
 * un contenedor data-symbolic, no como dibujo. Los RÓTULOS (SYS VER., BUILD,
 * DATE, SEED HASH) no llevan cifras y sí van trazados.
 *
 * Las coordenadas x son las del póster; las y del pie ya vienen restadas −866,
 * que es donde empieza su caja. El código de barras no es un patrón inventado:
 * es la luminancia media por columna del original, comprimida por tramos.
 */
export type Glifo = { x: number; y: number; w: number; h: number; vw: number; vh: number; d: [string, string][] };
export type Barras = { y: number; h: number; tramos: number[][] };
`;

const cuerpo = Object.entries(arte)
  .map(([k, v]) => `export const ${k} = ${JSON.stringify(v)} as unknown as ${k.includes("Barras") ? "Barras" : "Glifo[]"};`)
  .join("\n\n");

writeFileSync(join("src/components/kodex/lamina/t01-04", "arte.ts"), cab + "\n" + cuerpo + "\n");
rmSync(TMP, { recursive: true, force: true });
console.log("ok", Object.entries(arte).map(([k, v]) => `${k}:${Array.isArray(v) ? v.length : v.tramos.length}`).join("  "));
