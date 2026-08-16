#!/usr/bin/env node
/**
 * KODEX-∞ · t01-02 OBSERVATION EYE · ARTE FIJA DE LA CABECERA Y DEL PIE
 *
 * Genera src/components/kodex/lamina/t01-02/arte.ts trazando las piezas fijas
 * de las dos franjas desde la referencia. El .ts no se edita a mano: se corre
 * esto.
 *
 *   node scripts/lamina/arte-t01-02-cabpie.mjs
 *
 * Diferencia con el generador de t01-08: acá el umbral NO se elige a criterio
 * ni se hereda de la lámina anterior. Se BARRE. Para cada pieza y cada umbral
 * candidato se traza, se rasteriza el trazo a 1× con librsvg (blanco sobre
 * negro, con el desenfoque que después va en el componente) y se resuelve por
 * mínimos cuadrados el color de relleno que mejor explica la banda original:
 *
 *     k = Σ(ref·cobertura) / Σ(cobertura²)        (por canal)
 *     residuo = Σ(ref − k·cobertura)² / Σref²
 *
 * Gana el par (umbral, sigma) de menor residuo, y el color que sale del ajuste
 * es el que se escribe en el componente. Así el relleno tampoco es criterio:
 * es el óptimo para la cobertura que realmente dibuja el trazo, que es por qué
 * nunca coincide con el color pico del original.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { PNG } from "pngjs";
import sharp from "sharp";

const SLUG = "t01-02-observation-eye";
const REF = `reference/canon/${SLUG}.png`;
const img = PNG.sync.read(readFileSync(REF));
const { width: W, data } = img;
const lum = (x, y) => { const i = (y * W + x) * 4; return (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8; };

/** Traza una pieza con glyphs.mjs y devuelve sus glifos en coordenadas del póster. */
function trazar(band, xr, umbral) {
  execFileSync("node", ["scripts/lamina/glyphs.mjs", SLUG, "--band", band, "--x", xr, "--umbral", String(umbral)], { stdio: "pipe" });
  const man = JSON.parse(readFileSync(`scripts/lamina/glyphs/${SLUG}/manifiesto.json`, "utf8"));
  return man.glifos.map((g) => {
    const svg = readFileSync(`scripts/lamina/glyphs/${SLUG}/${g.id}.svg`, "utf8");
    const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
    /* El trazador emite cada path con su propio transform="translate(..)".
       Perderlo desarma los glifos: las contraformas quedan fuera de sitio. */
    const ds = [...svg.matchAll(/<path d="([^"]+)"(?:[^>]*transform="([^"]+)")?/g)].map((m) => [m[1], m[2] ?? ""]);
    return { x: g.caja.x, y: g.caja.y, w: g.caja.w, h: g.caja.h, vw: +vb[1], vh: +vb[2], d: ds };
  });
}

/** Marca de los glifos en un rectángulo del póster, a 1×, con desenfoque sigma. */
async function cobertura(glifos, r, sigma) {
  const cuerpo = glifos.map((g) =>
    `<svg x="${g.x - r.x0}" y="${g.y - r.y0}" width="${g.w}" height="${g.h}" viewBox="0 0 ${g.vw} ${g.vh}" preserveAspectRatio="none">` +
    g.d.map(([d, tr]) => `<path d="${d}"${tr ? ` transform="${tr}"` : ""} fill="#fff"/>`).join("") + `</svg>`
  ).join("");
  const filtro = sigma > 0
    /* color-interpolation-filters="sRGB" NO es decoración: por defecto el
       desenfoque de SVG opera en linearRGB, y ahí blur(k·máscara) ≠ k·blur(máscara).
       El ajuste por mínimos cuadrados de acá abajo supone lo segundo, así que sin
       esta línea el color que sale del ajuste no es el que el navegador pinta. */
    ? `<defs><filter id="b" x="-30%" y="-60%" width="160%" height="220%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${sigma}"/></filter></defs><g filter="url(#b)">${cuerpo}</g>`
    : cuerpo;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${r.w}" height="${r.h}" viewBox="0 0 ${r.w} ${r.h}"><rect width="${r.w}" height="${r.h}" fill="#000"/>${filtro}</svg>`;
  const { data: px } = await sharp(Buffer.from(svg)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const cov = new Float64Array(r.w * r.h);
  for (let i = 0; i < cov.length; i++) cov[i] = px[i * 3] / 255;
  return cov;
}

/** Mínimos cuadrados: color de relleno óptimo para esa cobertura, y residuo. */
function ajustar(cov, r) {
  const num = [0, 0, 0];
  let den = 0, ref2 = 0;
  for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
    const c = cov[y * r.w + x];
    const i = ((y + r.y0) * W + (x + r.x0)) * 4;
    den += c * c;
    for (let k = 0; k < 3; k++) { num[k] += c * data[i + k]; ref2 += data[i + k] * data[i + k]; }
  }
  const k = num.map((n) => (den > 0 ? Math.min(255, Math.max(0, Math.round(n / den))) : 0));
  let res = 0;
  for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
    const c = cov[y * r.w + x];
    const i = ((y + r.y0) * W + (x + r.x0)) * 4;
    for (let j = 0; j < 3; j++) { const d = data[i + j] - k[j] * c; res += d * d; }
  }
  return { k, res: Math.sqrt(res / ref2) };
}

const SIGMAS = [0, 0.35, 0.5, 0.7, 0.9, 1.1, 1.4];

/** Barre umbral × sigma y se queda con el mínimo residuo. */
async function mejor(nombre, band, xr, umbrales) {
  const [by0, by1] = band.split(",").map(Number);
  const [bx0, bx1] = xr.split(",").map(Number);
  const r = { x0: bx0, y0: by0, w: bx1 - bx0 + 1, h: by1 - by0 + 1 };
  let top = null;
  for (const u of umbrales) {
    const gl = trazar(band, xr, u);
    if (!gl.length) continue;
    for (const s of SIGMAS) {
      const cov = await cobertura(gl, r, s);
      const { k, res } = ajustar(cov, r);
      if (!top || res < top.res) top = { u, s, k, res, gl };
    }
  }
  console.log(`  ${nombre.padEnd(11)} umbral ${String(top.u).padStart(3)}  sigma ${top.s}  fill rgb(${top.k})  residuo ${(top.res * 100).toFixed(2)}%  ${top.gl.length} glifos`);
  return top;
}

/** Columnas de un código de barras, en luminancia 0-255, comprimidas por tramos. */
function barras(x0, x1, y0, y1, dy) {
  const cols = [];
  for (let x = x0; x <= x1; x++) {
    let r = 0, g = 0, b = 0;
    for (let y = y0; y <= y1; y++) { const i = (y * W + x) * 4; r += data[i]; g += data[i + 1]; b += data[i + 2]; }
    const n = y1 - y0 + 1;
    cols.push([Math.round(r / n), Math.round(g / n), Math.round(b / n)]);
  }
  const tramos = [];
  let i = 0;
  while (i < cols.length) {
    let j = i;
    const cerca = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) <= 14;
    while (j + 1 < cols.length && cerca(cols[j + 1], cols[i])) j++;
    const m = [0, 1, 2].map((c) => Math.round(cols.slice(i, j + 1).reduce((a, v) => a + v[c], 0) / (j - i + 1)));
    if (m[0] + m[1] + m[2] > 12) tramos.push([x0 + i, j - i + 1, ...m]);
    i = j + 1;
  }
  return { y: y0 - dy, h: y1 - y0 + 1, tramos };
}

/* ── piezas ──────────────────────────────────────────────────────────────
   Las bandas y las columnas de cada pieza salieron de barrer la referencia
   fila por fila y columna por columna (scripts de sondeo), no de mirarla. */
const U_GRANDE = [40, 50, 60, 70, 80, 90, 100, 115];
const U_MEDIO = [20, 26, 32, 38, 45, 52, 60, 70];
const U_CHICO = [10, 14, 18, 22, 26, 32, 40, 50];

console.log("\n  cabecera");
const cabArbol = await mejor("arbol", "17,80", "15,89", U_CHICO);
const cabMarcaA = await mejor("KODEX-∞ /", "22,56", "104,315", U_GRANDE);
const cabMarcaB = await mejor("OBSERV.EYE", "22,56", "318,660", U_MEDIO);
const cabBajA = await mejor("bajada A", "60,78", "104,244", U_GRANDE);
const cabBajB = await mejor("bajada B", "60,78", "245,415", U_MEDIO);
const cabClaves = await mejor("claves", "34,45", "708,1180", U_MEDIO);
const cabLema = await mejor("lema", "42,53", "1232,1400", U_MEDIO);
const cabAla = await mejor("ala", "31,64", "1494,1660", U_CHICO);

console.log("\n  pie");
const ftrMarca = await mejor("KODEX-∞", "883,909", "20,125", U_MEDIO);
const ftrBuilt = await mejor("BUILT FOR", "889,902", "670,945", U_MEDIO);
const ftrPpp = await mejor("PATTERN.", "890,902", "1078,1290", U_MEDIO);
const ftrAla = await mejor("ala", "877,915", "1300,1480", U_CHICO);

const corrido = (t, dy) => ({ ...t, gl: t.gl.map((g) => ({ ...g, y: g.y - dy })) });
const P = corrido;

const piezas = {
  cabArbol, cabMarcaA, cabMarcaB, cabBajA, cabBajB, cabClaves, cabLema, cabAla,
  ftrMarca: P(ftrMarca, 866), ftrBuilt: P(ftrBuilt, 866), ftrPpp: P(ftrPpp, 866), ftrAla: P(ftrAla, 866),
};

const barcodes = {
  cabBarras: barras(1529, 1657, 72, 87, 0),
  ftrBarras: barras(170, 384, 885, 907, 866),
};

const tabla = Object.entries(piezas)
  .map(([k, v]) => ` *   ${k.padEnd(10)} umbral ${String(v.u).padStart(3)}  sigma ${v.s}  fill rgb(${v.k})  residuo ${(v.res * 100).toFixed(2)} %`)
  .join("\n");

const cab = `/**
 * t01-02 · ARTE FIJA TRAZADA — NO SE EDITA A MANO.
 *
 * Generado desde reference/canon/${SLUG}.png con
 * scripts/lamina/arte-t01-02-cabpie.mjs (vtracer sobre el original
 * sobremuestreado ×8, binarizado e invertido).
 *
 * Ningún umbral ni ningún color de relleno de esta lámina se eligió mirando el
 * resultado. Para cada pieza se barrieron seis umbrales × cuatro desenfoques,
 * se rasterizó cada trazo a 1× y se resolvió por mínimos cuadrados el relleno
 * que mejor explica la banda original. Ganó el mínimo residuo:
 *
${tabla}
 *
 * Los valores de la tabla de metadatos NO están acá y no deben estarlo: son
 * cifras (BUILD, DATE, RES, SYS VER.) y el canon pide que las cifras del
 * póster vayan como texto de verdad dentro de un contenedor data-symbolic, no
 * como dibujo. Las CLAVES sí van trazadas: son sólo letras.
 *
 * Los códigos de barras no se trazan con vtracer —el contorno les inventa
 * esquinas—: son la media por columna del original, comprimida por tramos de
 * color parecido, así que cada barra está donde y como está en la referencia.
 *
 * Las x son las del póster. Las y del pie ya vienen restadas −866, que es donde
 * empieza su caja.
 */
export type Glifo = { x: number; y: number; w: number; h: number; vw: number; vh: number; d: [string, string][] };
export type Barras = { y: number; h: number; tramos: number[][] };
`;

const cuerpo = [
  ...Object.entries(piezas).map(([k, v]) =>
    `/** umbral ${v.u} · sigma ${v.s} · residuo ${(v.res * 100).toFixed(2)} % */\n` +
    `export const ${k} = ${JSON.stringify(v.gl)} as unknown as Glifo[];\n` +
    `export const ${k}Tinta = "rgb(${v.k})";\nexport const ${k}Sigma = ${v.s};`),
  ...Object.entries(barcodes).map(([k, v]) => `export const ${k} = ${JSON.stringify(v)} as unknown as Barras;`),
].join("\n\n");

writeFileSync("src/components/kodex/lamina/t01-02/arte.ts", cab + "\n" + cuerpo + "\n");
console.log(`\n  ok → src/components/kodex/lamina/t01-02/arte.ts  (${Object.keys(piezas).length} piezas, ${Object.values(barcodes).reduce((a, b) => a + b.tramos.length, 0)} tramos de barras)\n`);
