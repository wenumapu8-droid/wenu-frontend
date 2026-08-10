#!/usr/bin/env node
/**
 * KODEX-∞ · t01-07 COSMOLOGY CORE · ARTE FIJA DE LA CABECERA Y DEL PIE
 *
 * Genera src/components/kodex/lamina/t01-07/arte-hdrftr.ts trazando las piezas
 * fijas de las dos franjas desde la referencia. El .ts no se edita a mano: se
 * corre esto.
 *
 *   node scripts/lamina/arte-t01-07-hdrftr.mjs
 *
 * El umbral de cada pieza NO se eligió mirando el resultado. Salió de un barrido
 * medido sobre el original: para cada umbral candidato se binariza la caja, se
 * elige el relleno F que minimiza el error absoluto contra la referencia
 * (F óptimo = mediana de la luminancia bajo la máscara) y gana el umbral de
 * menor error. La tabla con los ganadores está en la cabecera del .ts.
 *
 * Sale a glyphs/<slug>/hdrftr/ (con --out) y no al directorio compartido de la
 * lámina: hay otros tres agentes en los bloques de esta misma lámina y sin --out
 * se pisan la salida.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { PNG } from "pngjs";

const SLUG = "t01-07-cosmology-core";
const OUT = "hdrftr";
const REF = `reference/canon/${SLUG}.png`;
const img = PNG.sync.read(readFileSync(REF));
const { width: W, data } = img;
const lum = (x, y) => { const i = (y * W + x) * 4; return (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8; };

/** Traza una pieza con glyphs.mjs y devuelve sus glifos en coordenadas del panel. */
function trazar(band, xr, umbral, dy) {
  execFileSync("node", ["scripts/lamina/glyphs.mjs", SLUG, "--band", band, "--x", xr, "--umbral", String(umbral), "--out", OUT]);
  const man = JSON.parse(readFileSync(`scripts/lamina/glyphs/${SLUG}/${OUT}/manifiesto.json`, "utf8"));
  return man.glifos.map((g) => {
    const svg = readFileSync(`scripts/lamina/glyphs/${SLUG}/${OUT}/${g.id}.svg`, "utf8");
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
  // ── cabecera (caja 0,0 · 1672×88: las y son las del póster) ───────────────
  hdrTitulo: trazar("14,47", "108,690", 76, 0),   // "KODEX−∞ / COSMOLOGY CORE"
  hdrBajada: trazar("57,74", "110,430", 40, 0),   // "ORBIT MAP / NÚCLEO COSMOLÓGICO"
  hdrArbol: trazar("18,76", "24,82", 31, 0),      // árbol del emblema
  hdrClaves: trazar("24,34", "708,1175", 27, 0),  // los cinco rótulos de la tabla
  hdrLema1: trazar("27,37", "1298,1478", 29, 0),  // "PATTERN. PROTECT. PERPETUATE."
  hdrLema2: trazar("38,49", "1298,1478", 27, 0),  // "BUILT FOR ARCHIVES THAT REMEMBER."
  hdrAla: trazar("23,62", "1480,1660", 24, 0),    // emblema alado
  hdrBarras: barras(1181, 1288, 26, 48, 0),

  /* Las cifras. Van trazadas y no como <text> porque se midió: con el texto
     puesto encima, esta cabecera daba 1,91 % y las seis celdas dejaban entre
     9,3 y 19,5 de error absoluto medio cada una. No es cuestión de brillo —con
     el relleno recalibrado para que la tinta media coincida al 1 %, el error
     SUBIÓ (16,7 → 19,5 en "TANDA 01"): lo que no coincide es la forma, porque
     la mono del póster no existe en ninguna máquina. Cada una conserva su texto
     literal en el aria-label y vive dentro de un contenedor data-symbolic. */
  hdrTanda: trazar("77,88", "20,84", 32, 0),      // "TANDA 01" del chip
  hdrVal1: trazar("36,47", "708,800", 30, 0),     // TANDA-01
  hdrVal2: trazar("36,47", "812,900", 31, 0),     // KX-T01-01A
  hdrVal3: trazar("36,47", "907,1005", 40, 0),    // 2025-05-22
  hdrVal4: trazar("36,47", "1016,1078", 42, 0),   // v2.0.0
  hdrVal5: trazar("36,47", "1086,1163", 28, 0),   // T01A-CORE

  // ── pie (caja 0,866 · 1672×75: las y ya vienen restadas −866) ─────────────
  ftrMarca: trazar("888,914", "16,152", 42, 866), // "KODEX−∞"
  ftrLema: trazar("894,908", "686,948", 30, 866), // "BUILT FOR ARCHIVES THAT REMEMBER."
  ftrPpp: trazar("894,908", "1180,1404", 31, 866),// "PATTERN. PROTECT. PERPETUATE."
  ftrAla: trazar("885,922", "1480,1650", 20, 866),// emblema alado
  ftrBarras: barras(160, 259, 892, 911, 866),
};

const cab = `/**
 * t01-07 · ARTE FIJA TRAZADA DE LA CABECERA Y EL PIE — NO SE EDITA A MANO.
 *
 * Generado desde reference/canon/t01-07-cosmology-core.png con
 * scripts/lamina/glyphs.mjs (vtracer sobre el original sobremuestreado ×8).
 * Regenerar con: node scripts/lamina/arte-t01-07-hdrftr.mjs
 *
 * Cada umbral salió de un barrido medido contra la referencia —binarizar,
 * elegir el relleno óptimo, quedarse con el de menor error absoluto medio—, no
 * de mirar el resultado y elegir el que "se veía bien":
 *
 *   pieza                        banda      x            umbral  relleno  error
 *   "KODEX−∞ / COSMOLOGY CORE"   14..47     108..690       76      154    10,86
 *   bajada magenta               57..74     110..430       40       82     7,23
 *   árbol del emblema            18..76      24..82        31       63    10,60
 *   rótulos de la tabla (×5)     24..34     708..1175      27       53     6,36
 *   "PATTERN. PROTECT…"          27..37    1298..1478      29       60     7,43
 *   "BUILT FOR ARCHIVES…"        38..49    1298..1478      27       55     8,54
 *   emblema alado (cabecera)     23..62    1480..1660      24       49     5,60
 *   "KODEX−∞" del pie           888..914     16..152       42       85     5,84
 *   "BUILT FOR ARCHIVES…" pie   894..908    686..948       30       60     2,46
 *   "PATTERN. PROTECT…" pie     894..908   1180..1404      31       62     2,40
 *   emblema alado (pie)         885..922   1480..1650      20       41     4,83
 *
 * Los VALORES de la tabla de metadatos no están acá y no deben estarlo: son
 * cifras (TANDA-01, KX-T01-01A, 2025-05-22, v2.0.0, T01A-CORE) y el canon pide
 * que las cifras del póster vayan como texto de verdad dentro de un contenedor
 * data-symbolic, no como dibujo. Lo mismo "TANDA 01" del emblema y
 * "VISUAL SYSTEM v2.0" del pie.
 *
 * Los códigos de barras tampoco se trazan: el contorno les inventa esquinas y
 * les come tinta. Son la luminancia media por columna del original, comprimida
 * por tramos, así que cada barra está donde y como está en la referencia.
 *
 * Las x son las del póster. Las y de la cabecera también (su caja abre en 0,0);
 * las del pie ya vienen restadas −866, que es donde abre la suya.
 */
export type Glifo = { x: number; y: number; w: number; h: number; vw: number; vh: number; d: [string, string][] };
export type Barras = { y: number; h: number; tramos: number[][] };
`;

const cuerpo = Object.entries(arte)
  .map(([k, v]) => `export const ${k} = ${JSON.stringify(v)} as unknown as ${k.includes("Barras") ? "Barras" : "Glifo[]"};`)
  .join("\n\n");

writeFileSync("src/components/kodex/lamina/t01-07/arte-hdrftr.ts", cab + "\n" + cuerpo + "\n");
console.log("ok",
  Object.entries(arte).map(([k, v]) => `${k}:${Array.isArray(v) ? v.length + " glifos" : v.tramos.length + " tramos"}`).join("  "));
