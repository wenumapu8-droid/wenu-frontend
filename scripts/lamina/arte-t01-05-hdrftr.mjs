#!/usr/bin/env node
/**
 * KODEX-∞ · t01-05 SPECIMEN SKULL · ARTE FIJA DE CABECERA Y PIE
 *
 * Genera src/components/kodex/lamina/t01-05/arte-hdrftr.ts trazando las piezas
 * fijas de las dos franjas desde la referencia. El .ts NO se edita a mano: se
 * corre esto.
 *
 *   node scripts/lamina/arte-t01-05-hdrftr.mjs
 *
 * Cada umbral y cada relleno de acá abajo salió de un barrido medido
 * (scripts/lamina/_t0105_barrido.mjs): para cada umbral se traza, se rasteriza
 * el trazo a escala 1 y se resuelve por mínimos cuadrados el color que minimiza
 * el error absoluto contra el original. Gana el umbral de menor error. Ninguno
 * se eligió mirando el resultado.
 *
 * Los códigos de barras NO pasan por el trazador: son una función de una sola
 * variable y se leen columna por columna, comprimidos por tramos. El contorno
 * les inventa esquinas y les come tinta.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { PNG } from "pngjs";

const SLUG = "t01-05-specimen-skull";
const REF = `reference/canon/${SLUG}.png`;
const img = PNG.sync.read(readFileSync(REF));
const { width: W, data } = img;
const lum = (x, y) => { const i = (y * W + x) * 4; return (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8; };

/** Traza una pieza con glyphs.mjs y devuelve sus glifos en coordenadas del panel. */
function trazar(nombre, band, xr, umbral, dy) {
  const out = `hdrftr-${nombre}`;
  execFileSync("node", [
    "scripts/lamina/glyphs.mjs", SLUG,
    "--band", band, "--x", xr, "--umbral", String(umbral), "--out", out,
  ], { stdio: "ignore" });
  const dir = `scripts/lamina/glyphs/${SLUG}/${out}`;
  const man = JSON.parse(readFileSync(`${dir}/manifiesto.json`, "utf8"));
  return man.glifos.map((g) => {
    const svg = readFileSync(`${dir}/${g.id}.svg`, "utf8");
    const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
    /* El trazador emite cada path con su propio transform="translate(..)".
       Perderlo desarma el glifo: la contraforma de la D queda fuera de sitio y
       la letra sale maciza. Se guarda el par. */
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
  hdrMarca:  trazar("hdrMarca",  "20,59",    "20,715",    100, 0),
  hdrBajada: trazar("hdrBajada", "66,84",    "20,305",     38, 0),
  hdrClaves: trazar("hdrClaves", "27,41",    "905,1370",   38, 0),
  hdrBuilt:  trazar("hdrBuilt",  "27,58",    "1398,1522",  45, 0),
  hdrAla:    trazar("hdrAla",    "26,63",    "1528,1652",  34, 0),
  hdrBarras: barras(755, 874, 35, 57, 0),
  ftrMarca:  trazar("ftrMarca",  "885,912",  "22,162",     32, 866),
  ftrVdb:    trazar("ftrVdb",    "884,900",  "285,472",    38, 866),
  ftrLema:   trazar("ftrLema",   "891,907",  "685,950",    34, 866),
  ftrPpp:    trazar("ftrPpp",    "891,907",  "1138,1368",  34, 866),
  ftrAla:    trazar("ftrAla",    "877,924",  "1436,1630",  26, 866),
  ftrBarras: barras(174, 273, 889, 910, 866),
};

const cab = `/**
 * t01-05 · ARTE FIJA TRAZADA DE CABECERA Y PIE — NO SE EDITA A MANO.
 *
 * Generado desde reference/canon/t01-05-specimen-skull.png con
 * scripts/lamina/glyphs.mjs (vtracer sobre el original sobremuestreado ×8).
 * Regenerar con: node scripts/lamina/arte-t01-05-hdrftr.mjs
 *
 * Cada umbral salió de un barrido medido, no de criterio: se traza con doce
 * umbrales, se rasteriza el trazo a escala 1, se resuelve el relleno óptimo por
 * mínimos cuadrados y gana el de menor error absoluto contra el original.
 *
 *   pieza                       banda        umbral  relleno   error   negro
 *   "KODEX-∞ / SPECIMEN SKULL"  20..59       100     #acacab   10,85   59,82
 *   "BIO DOSSIER / CRÁNEO…"     66..84        38     #a90f10    5,87   15,00
 *   rótulos DOC ID…SYSTEM       27..41        38     #4c4c4b    2,81
 *   "BUILT FOR ARCHIVES…"       27..58        45     #585958    6,47
 *   emblema de la cabecera      26..63        34     #474847    5,74   17,06
 *   "KODEX-∞" del pie          885..912      32     #3e3e3d    4,44
 *   "VISUAL DEVELOPMENT BOARD"  884..900      38     #4a4b4a    6,35
 *   "BUILT FOR ARCHIVES…" pie   891..907      34     #414141    4,82
 *   "PATTERN. PROTECT.…"        891..907      34     #464747    5,17
 *   emblema del pie            877..924      26     #343433    4,94   11,71
 *
 * La columna «negro» es el error de NO dibujar la pieza: es la referencia
 * contra la que se mide si el trazado suma o resta.
 *
 * NO están acá los valores de la tabla de metadatos ni "TANDA 01" del pie:
 * llevan cifras, y el canon pide que las cifras del póster vayan como texto de
 * verdad dentro de un contenedor data-symbolic, no como dibujo.
 *
 * Las x son las del póster; las y del pie ya vienen restadas −866, que es donde
 * empieza su caja. Los códigos de barras son la luminancia media por columna
 * del original comprimida por tramos: cada barra está donde y como está en la
 * referencia.
 */
export type Glifo = { x: number; y: number; w: number; h: number; vw: number; vh: number; d: [string, string][] };
export type Barras = { y: number; h: number; tramos: number[][] };
`;

const cuerpo = Object.entries(arte)
  .map(([k, v]) => `export const ${k} = ${JSON.stringify(v)} as unknown as ${k.includes("Barras") ? "Barras" : "Glifo[]"};`)
  .join("\n\n");

writeFileSync("src/components/kodex/lamina/t01-05/arte-hdrftr.ts", cab + "\n" + cuerpo + "\n");
console.log("ok  " + Object.entries(arte)
  .map(([k, v]) => `${k}:${Array.isArray(v) ? v.length + "g" : v.tramos.length + "t"}`).join("  "));
