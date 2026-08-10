#!/usr/bin/env node
/**
 * KODEX-∞ · t01-08 · ARTE FIJA DEL HEADER Y DEL FOOTER
 *
 * Genera src/components/kodex/lamina/t01-08/arte.ts trazando las piezas fijas
 * de las dos franjas desde la referencia. No se edita el .ts a mano: se corre
 * esto.
 *
 *   node scripts/lamina/arte-t01-08-hdrftr.mjs
 *
 * Cada umbral de acá abajo salió de un barrido medido —primero por residuo
 * cuadrático contra la referencia, después afinado por píxeles marcados en el
 * banco—, no de mirar el resultado y elegir el que "se veía bien".
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { PNG } from "pngjs";

const REF = "reference/canon/t01-08-signal-bloom.png";
const img = PNG.sync.read(readFileSync(REF));
const { width: W, data } = img;
const lum = (x, y) => { const i = (y * W + x) * 4; return (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8; };

/** Traza una pieza con glyphs.mjs y devuelve sus glifos ya en coordenadas del panel. */
function trazar(band, xr, umbral, dy) {
  execFileSync("node", ["scripts/lamina/glyphs.mjs", "t01-08-signal-bloom", "--band", band, "--x", xr, "--umbral", String(umbral)]);
  const man = JSON.parse(readFileSync("scripts/lamina/glyphs/t01-08-signal-bloom/manifiesto.json", "utf8"));
  return man.glifos.map((g) => {
    const svg = readFileSync(`scripts/lamina/glyphs/t01-08-signal-bloom/${g.id}.svg`, "utf8");
    const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
    /* El trazador emite cada path con su propio transform="translate(..)".
       Perderlo desarma los glifos: la contraforma de la D queda fuera de sitio
       y la letra sale maciza. Se guarda el par. */
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

const arte = {
  hdrMarcaA:  trazar("17,53",   "15,285",    60, 0),
  hdrMarcaB:  trazar("17,53",   "286,592",   55, 0),
  hdrAla:     trazar("24,56",   "1505,1662", 22, 0),
  hdrBajada:  trazar("57,72",   "15,380",    45, 0),
  hdrLema1:   trazar("27,39",   "1308,1492", 30, 0),
  hdrLema2:   trazar("43,55",   "1308,1492", 30, 0),
  hdrBarras:  barras(617, 815, 23, 53, 0),
  ftrMarca:   trazar("882,908", "15,168",    32, 866),
  ftrAla:     trazar("880,919", "1448,1662", 22, 866),
  ftrLema:    trazar("890,902", "650,965",   30, 866),
  ftrPpp:     trazar("888,900", "1192,1428", 30, 866),
  ftrBarras:  barras(320, 381, 883, 903, 866),
};

const cab = `/**
 * t01-08 · ARTE FIJA TRAZADA — NO SE EDITA A MANO.
 *
 * Generado desde reference/canon/t01-08-signal-bloom.png con
 * scripts/lamina/glyphs.mjs (vtracer sobre el original sobremuestreado ×8).
 * Cada umbral salió de un barrido medido contra la referencia, no de criterio:
 *
 *   pieza                banda            umbral   residuo
 *   logotipo blanco      17..53           60       (barrido en banco)
 *   "SIGNAL BLOOM"       17..53           55       4,87 %
 *   bajada del header    57..72           45      11,35 %
 *   lema del header (1)  27..39           30      12,85 %
 *   lema del header (2)  43..55           30      13,56 %
 *   emblema del header   24..56           22      12,16 %
 *   logotipo del pie     882..908         32       6,09 %
 *   lema del pie         890..902         30      12,52 %
 *   "PATTERN..." del pie 888..900         30      12,39 %
 *   emblema del pie      880..919         22      14,72 %
 *
 * La tabla de metadatos NO está acá y no debe estarlo: sus valores son cifras
 * (SYS VER, BUILD, DATE, SEED HASH) y el canon pide que las cifras vayan como
 * texto de verdad dentro de un contenedor data-symbolic, no como dibujo.
 *
 * Las coordenadas x son las del póster; las y del pie ya vienen restadas −866,
 * que es donde empieza su caja. Los códigos de barras no son un patrón
 * inventado: son la luminancia media por columna del original, comprimida por
 * tramos, así que cada barra está donde y como está en la referencia.
 */
export type Glifo = { x: number; y: number; w: number; h: number; vw: number; vh: number; d: [string, string][] };
export type Barras = { y: number; h: number; tramos: number[][] };
`;

const cuerpo = Object.entries(arte)
  .map(([k, v]) => `export const ${k} = ${JSON.stringify(v)} as unknown as ${k.includes("Barras") ? "Barras" : "Glifo[]"};`)
  .join("\n\n");

writeFileSync("src/components/kodex/lamina/t01-08/arte.ts", cab + "\n" + cuerpo + "\n");
console.log("ok",
  Object.entries(arte).map(([k, v]) => `${k}:${Array.isArray(v) ? v.length + " glifos" : v.tramos.length + " tramos"}`).join("  "));
