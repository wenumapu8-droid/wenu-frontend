#!/usr/bin/env node
/**
 * KODEX-∞ · t01-06 RITUAL DEVICE · ARTE FIJA DE LA CABECERA Y DEL PIE
 *
 * Genera src/components/kodex/lamina/t01-06/arte-hdrftr.ts trazando las piezas
 * fijas de las dos franjas desde la referencia. El .ts no se edita a mano: se
 * corre esto.
 *
 *   node scripts/lamina/arte-t01-06-hdrftr.mjs
 *
 * Ningún umbral se eligió mirando el resultado. Cada uno ganó un barrido medido
 * (scripts/lamina/_t0106_barrido.mjs): binarizar la caja, resolver por mínimos
 * cuadrados el relleno que minimiza el error absoluto contra la referencia,
 * quedarse con el umbral de menor error. La tabla de ganadores está en la
 * cabecera del .ts.
 *
 * Dos piezas NO se trazan, y no por gusto:
 *
 *  · el código de barras del pie es una función de una variable —se lee columna
 *    por columna y se comprime por tramos, cada uno con SU luminancia—; el
 *    contorno le inventa esquinas y le come tinta;
 *  · la barra cian de STATUS es lo mismo girado 90°: son estelas horizontales
 *    que se apagan hacia la izquierda, así que se lee FILA por fila. Trazarla
 *    la convierte en un bloque macizo y pierde el degradado, que es todo lo que
 *    esa barra es.
 *
 * Sale a glyphs/<slug>/hdrftr/ (con --out) y no al directorio compartido de la
 * lámina: hay otros tres agentes en los bloques de esta misma lámina.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { PNG } from "pngjs";

const SLUG = "t01-06-ritual-device";
const OUT = "hdrftr";
const REF = `reference/canon/${SLUG}.png`;
const img = PNG.sync.read(readFileSync(REF));
const { width: W, data } = img;
const rgb = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
const lum = (x, y) => { const p = rgb(x, y); return (p[0] * 77 + p[1] * 150 + p[2] * 29) >> 8; };

/** Traza una pieza con glyphs.mjs y devuelve sus glifos en coordenadas del panel. */
function trazar(band, xr, umbral, dy) {
  execFileSync("node", ["scripts/lamina/glyphs.mjs", SLUG, "--band", band, "--x", xr, "--umbral", String(umbral), "--out", OUT]);
  const man = JSON.parse(readFileSync(`scripts/lamina/glyphs/${SLUG}/${OUT}/manifiesto.json`, "utf8"));
  return man.glifos.map((g) => {
    const svg = readFileSync(`scripts/lamina/glyphs/${SLUG}/${OUT}/${g.id}.svg`, "utf8");
    const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
    /* El trazador emite un path por contorno con su propio transform. Perderlo
       desarma el glifo: la contraforma de la O queda fuera de sitio. */
    const ds = [...svg.matchAll(/<path d="([^"]+)"(?:[^>]*transform="([^"]+)")?/g)].map((m) => [m[1], m[2] ?? ""]);
    return { x: g.caja.x, y: g.caja.y - dy, w: g.caja.w, h: g.caja.h, vw: +vb[1], vh: +vb[2], d: ds };
  });
}

/** Columnas de un código de barras, en luminancia 0-255, comprimidas por tramos. */
function barras(x0, x1, y0, y1, dy) {
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

/**
 * Estelas: la barra cian de STATUS, leída FILA por fila. Cada fila se comprime
 * en tramos de color parecido (tolerancia por canal) y cada tramo guarda su
 * propio RGB. Devuelve [x, y, w, r, g, b].
 */
function estelas(x0, x1, y0, y1, dy, tol = 7, minB = 11) {
  const out = [];
  for (let y = y0; y <= y1; y++) {
    const fila = [];
    for (let x = x0; x <= x1; x++) fila.push(rgb(x, y));
    let i = 0;
    while (i < fila.length) {
      let j = i;
      const cerca = (a, b) => Math.abs(a[0] - b[0]) <= tol && Math.abs(a[1] - b[1]) <= tol && Math.abs(a[2] - b[2]) <= tol;
      while (j + 1 < fila.length && cerca(fila[j + 1], fila[i])) j++;
      const n = j - i + 1;
      const m = [0, 1, 2].map((k) => Math.round(fila.slice(i, j + 1).reduce((a, p) => a + p[k], 0) / n));
      if (m[2] > minB) out.push([x0 + i, y - dy, n, ...m]);
      i = j + 1;
    }
  }
  return out;
}

const arte = {
  // ── cabecera (caja 0,0 · 1672×88: las y son las del póster) ───────────────
  hdrTitulo:   trazar("17,64", "20,955", 95, 0),      // "KODEX−∞ / RITUAL DEVICE"
  hdrBajada:   trazar("73,90", "22,392", 60, 0),      // "ARTEFACT CORE / DISPOSITIVO RITUAL" (cian)
  hdrCoreSeed: trazar("46,58", "812,878", 26, 0),     // rótulo "CORE SEED"
  hdrClaves:   trazar("30,41", "938,1295", 22, 0),    // CLASS · ORIGIN · PATTERN · STATUS
  hdrVals:     trazar("45,71", "938,1215", 46, 0),    // RITUAL DEVICE · UNKNOWN / SIGNAL PROTO · PROTECT. PERPETUATE.
  hdrActive:   trazar("45,58", "1248,1296", 38, 0),   // "ACTIVE" (cian)
  hdrAla:      trazar("22,62", "1468,1648", 38, 0),   // emblema alado
  hdrBuilt:    trazar("68,83", "1452,1660", 38, 0),   // "BUILT FOR ARCHIVES THAT REMEMBER."
  hdrEstelas:  estelas(1296, 1447, 21, 60, 0),        // barra cian de STATUS

  // ── pie (caja 0,866 · 1672×75: las y ya vienen restadas −866) ─────────────
  ftrMarca:    trazar("880,905", "18,150", 46, 866),  // "KODEX−∞"
  ftrLema:     trazar("884,899", "626,994", 38, 866), // "BUILT FOR ARCHIVES THAT REMEMBER."
  ftrPpp:      trazar("885,899", "1130,1362", 30, 866), // "PATTERN. PROTECT. PERPETUATE."
  ftrAla:      trazar("869,916", "1398,1620", 26, 866), // emblema alado
  ftrBarras:   barras(168, 267, 883, 902, 866),
};

const cab = `/**
 * t01-06 · ARTE FIJA TRAZADA DE LA CABECERA Y EL PIE — NO SE EDITA A MANO.
 *
 * Generado desde reference/canon/t01-06-ritual-device.png con
 * scripts/lamina/glyphs.mjs (vtracer sobre el original sobremuestreado ×8).
 * Regenerar con: node scripts/lamina/arte-t01-06-hdrftr.mjs
 *
 * Cada umbral ganó un barrido medido (scripts/lamina/_t0106_barrido.mjs), no
 * una mirada: se binariza la caja, se resuelve por mínimos cuadrados el relleno
 * que minimiza el error absoluto medio contra la referencia y gana el umbral de
 * menor error. Los ganadores:
 *
 *   pieza                              banda      x           umbral relleno  err
 *   "KODEX−∞ / RITUAL DEVICE"          17..64      20..955      95   #b0b0af  9,48
 *   bajada cian                        73..90      22..392      60   #148087  6,87
 *   rótulo "CORE SEED"                 46..58     812..878      26   #323130  5,50
 *   CLASS·ORIGIN·PATTERN·STATUS        30..41     938..1295     22   #2e2f2e  3,53
 *   RITUAL DEVICE·UNKNOWN·PROTECT      45..71     938..1215     46   #5c5d5c  6,67
 *   "ACTIVE" (cian)                    45..58    1248..1296     38   #145356  5,53
 *   emblema alado (cabecera)           22..62    1468..1648     38   #4e4e4d  6,79
 *   "BUILT FOR ARCHIVES…" (cabecera)   68..83    1452..1660     38   #4b4b4b  7,64
 *   "KODEX−∞" del pie                 880..905     18..150      46   #545353  6,80
 *   "BUILT FOR ARCHIVES…" del pie     884..899    626..994      38   #4c4d4c  4,98
 *   "PATTERN. PROTECT…" del pie       885..899   1130..1362     30   #3d3e3d  4,37
 *   emblema alado (pie)               869..916   1398..1620     26   #343434  4,46
 *
 * Las CIFRAS no están acá y no deben estarlo: "TANDA 01", "KX-TA01-0RITUAL" y
 * "VISUAL SYSTEM v2.0" van como texto de verdad dentro de un contenedor
 * data-symbolic, porque el canon pide que los números del póster se presenten
 * como ficción del póster y no como dibujo.
 *
 * Tampoco se trazan las dos piezas que son funciones de una variable: el código
 * de barras del pie (luminancia media por columna) y la barra cian de STATUS
 * (estelas horizontales leídas fila por fila, cada tramo con su propio RGB).
 * Trazadas pierden el degradado, que es todo lo que esas dos piezas son.
 *
 * Las x son las del póster. Las y de la cabecera también (su caja abre en 0,0);
 * las del pie ya vienen restadas −866, que es donde abre la suya.
 */
export type Glifo = { x: number; y: number; w: number; h: number; vw: number; vh: number; d: [string, string][] };
export type Barras = { y: number; h: number; tramos: number[][] };
export type Estela = number[];
`;

const tipo = (k) => (k.includes("Barras") ? "Barras" : k.includes("Estelas") ? "Estela[]" : "Glifo[]");
const cuerpo = Object.entries(arte)
  .map(([k, v]) => `export const ${k} = ${JSON.stringify(v)} as unknown as ${tipo(k)};`)
  .join("\n\n");

writeFileSync("src/components/kodex/lamina/t01-06/arte-hdrftr.ts", cab + "\n" + cuerpo + "\n");
console.log("ok",
  Object.entries(arte).map(([k, v]) => `${k}:${Array.isArray(v) ? v.length + (k.includes("Estelas") ? " tramos" : " glifos") : v.tramos.length + " tramos"}`).join("  "));
