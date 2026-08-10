#!/usr/bin/env node
/**
 * KODEX-∞ · t01-05 SPECIMEN SKULL · ARTE FIJA DEL BLOQUE DERECHA
 *
 * Genera src/components/kodex/lamina/t01-05/trazos/arte-derecha.ts desde
 * reference/canon/t01-05-specimen-skull.png.
 *
 *   node scripts/lamina/arte-t01-05-derecha.mjs
 *
 * Hereda el método de scripts/lamina/arte-t01-04-derecha.mjs —máscara POR COLOR,
 * capas por umbral creciente, relleno elegido por barrido de MAE sobre la región
 * VISIBLE de cada capa— y le agrega lo que esta lámina necesita y aquélla no:
 *
 *  · Un tercer modo, "color": vtracer en ColorMode.Color sobre el recorte RGB.
 *    Las miniaturas THERMAL y GLITCH del panel 03 no son línea de un solo tinte
 *    sino falso color continuo (violeta→naranja→amarillo, y el glitch mete cian,
 *    magenta y verde en la misma fila de píxeles). Separarlas por máscara de
 *    color es imposible: no hay dos tintas, hay un gradiente. Medido sobre la
 *    miniatura THERMAL (116×164): máscara binaria multiumbral no baja de MAE 18;
 *    ColorMode.Color con colorPrecision 7 da MAE 3,67.
 *
 *  · Cuatro filtros de tinta en vez de tres, medidos sobre la referencia:
 *      rojo     rgb(173, 26, 22)   · r al séxtuple de g
 *      cian     rgb( 54,205,194)   · g y b muy por encima de r
 *      amarillo rgb(154,179,7)     · r y g altos, azul casi nulo
 *      gris     rgb(175,181,175)   · los tres canales dentro de un 15 %
 *
 *  · Los MARCOS de sección no se listan a ojo: `linea()` recibe fila o columna y
 *    un tramo de búsqueda, y devuelve la extensión real de la tinta y su color
 *    promedio. Lo que se escribe en el .ts es medición, no estimación.
 *
 * Los marcos de las tarjetas y de los ocho recuadros del 04 NO están en esa
 * lista: caen dentro de la caja de su pieza y salen trazados con ella. Repetirlos
 * sería pintar el mismo píxel dos veces con dos verdades.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { PNG } from "pngjs";
import sharp from "sharp";
import { vectorize, ColorMode, PathSimplifyMode, Hierarchical } from "@neplex/vectorizer";

const SLUG = "t01-05-specimen-skull";
const REF = `reference/canon/${SLUG}.png`;
const DIR = "src/components/kodex/lamina/t01-05/trazos";
const SALIDA = `${DIR}/arte-derecha.ts`;
const ESCALA = 8;
const ESCALA_COLOR = 4;

/* Origen de la caja del bloque (andamiaje t01-05: 941,88 · 727×778). */
const BX = 941;
const BY = 88;

const img = PNG.sync.read(readFileSync(REF));
const { width: W, height: H, data } = img;
const px = (x, y) => {
  const i = (y * W + x) * 4;
  return [data[i], data[i + 1], data[i + 2]];
};
const lum = (x, y) => {
  const [r, g, b] = px(x, y);
  return (r * 77 + g * 150 + b * 29) >> 8;
};

const FILTROS = {
  lum: (r, g, b, l, u) => l > u,
  rojo: (r, g, b, l, u) => l > u && r > g * 1.7 && r > b * 1.5,
  cian: (r, g, b, l, u) => l > u && g > r * 1.6 && b > r * 1.4,
  amar: (r, g, b, l, u) => l > u && b < g * 0.55 && g > r * 0.8 && g > b * 1.6,
  gris: (r, g, b, l, u) => l > u && r < g * 1.35 && g < r * 1.35 && b > g * 0.6 && b < g * 1.4,
  /* Todo lo que no es rojo: para organismos que van de gris a blanco pasando por
     tintes fríos, donde partir por tinte deja huecos. */
  palido: (r, g, b, l, u) => l > u && r <= g * 1.45,
};

function mascara(c, filtro, u) {
  const buf = Buffer.alloc(c.w * c.h);
  const test = FILTROS[filtro];
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      const [r, g, b] = px(c.x + x, c.y + y);
      const l = (r * 77 + g * 150 + b * 29) >> 8;
      if (test(r, g, b, l, u)) buf[y * c.w + x] = 255;
    }
  }
  return buf;
}

/** Tono representativo: percentil 0,2 % por luminancia, normalizado a canal
 *  máximo = 1. El brillo lo decide el barrido, no el ojo. */
function tono(c, buf) {
  const lista = [];
  for (let y = 0; y < c.h; y++)
    for (let x = 0; x < c.w; x++)
      if (buf[y * c.w + x]) {
        const [r, g, b] = px(c.x + x, c.y + y);
        lista.push([(r * 77 + g * 150 + b * 29) >> 8, r, g, b]);
      }
  if (!lista.length) return [1, 1, 1];
  lista.sort((a, b) => b[0] - a[0]);
  const p = lista[Math.min(lista.length - 1, Math.floor(lista.length * 0.002))];
  const m = Math.max(p[1], p[2], p[3]) || 1;
  return [p[1] / m, p[2] / m, p[3] / m];
}

function apretar(c, buf) {
  let x0 = c.w, y0 = c.h, x1 = -1, y1 = -1;
  for (let y = 0; y < c.h; y++)
    for (let x = 0; x < c.w; x++)
      if (buf[y * c.w + x]) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  if (x1 < 0) return null;
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const sub = Buffer.alloc(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) sub[y * w + x] = buf[(y + y0) * c.w + x + x0];
  return { caja: { x: c.x + x0, y: c.y + y0, w, h }, buf: sub };
}

async function vectorizar(caja, buf, speckle) {
  const bin = await sharp(buf, { raw: { width: caja.w, height: caja.h, channels: 1 } })
    .resize({ width: caja.w * ESCALA, height: caja.h * ESCALA, kernel: "nearest" })
    .negate() // vtracer binario traza lo OSCURO; acá la tinta es lo claro
    .png()
    .toBuffer();

  const svg = await vectorize(bin, {
    colorMode: ColorMode.Binary,
    hierarchical: Hierarchical.Stacked,
    filterSpeckle: speckle,
    colorPrecision: 6,
    layerDifference: 16,
    mode: PathSimplifyMode.Spline,
    cornerThreshold: 60,
    lengthThreshold: 4,
    maxIterations: 10,
    spliceThreshold: 45,
    pathPrecision: 2,
  });

  return [...svg.matchAll(/<path d="([^"]+)"(?:[^>]*transform="([^"]+)")?/g)].map((m) => [m[1], m[2] ?? ""]);
}

/** Modo "color": el recorte RGB entero, sin máscara. Devuelve el marcado
 *  interior del SVG de vtracer (paths con su propio fill y transform). */
async function vectorizarColor(c, prec, speckle) {
  const raw = Buffer.alloc(c.w * c.h * 3);
  for (let y = 0; y < c.h; y++)
    for (let x = 0; x < c.w; x++) {
      const [r, g, b] = px(c.x + x, c.y + y);
      const j = (y * c.w + x) * 3;
      raw[j] = r; raw[j + 1] = g; raw[j + 2] = b;
    }
  const up = await sharp(raw, { raw: { width: c.w, height: c.h, channels: 3 } })
    .resize({ width: c.w * ESCALA_COLOR, height: c.h * ESCALA_COLOR, kernel: "nearest" })
    .png()
    .toBuffer();
  const svg = await vectorize(up, {
    colorMode: ColorMode.Color,
    hierarchical: Hierarchical.Stacked,
    filterSpeckle: speckle,
    colorPrecision: prec,
    layerDifference: 16,
    mode: PathSimplifyMode.Spline,
    cornerThreshold: 60,
    lengthThreshold: 4,
    maxIterations: 10,
    spliceThreshold: 45,
    pathPrecision: 2,
  });
  const cuerpo = svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/\n/g, "");
  return cuerpo;
}

/* ── modo trazo: parte la banda en celdas por columnas con tinta ────────── */
async function celdas(c, buf) {
  const cortes = [];
  let run = null;
  for (let x = 0; x < c.w; x++) {
    let n = 0;
    for (let y = 0; y < c.h; y++) if (buf[y * c.w + x]) n++;
    if (n) run = run ? [run[0], x] : [x, x];
    else if (run && x - run[1] > 2) { cortes.push(run); run = null; }
  }
  if (run) cortes.push(run);
  return cortes.map(([a, b]) => {
    const w = b - a + 1;
    const sub = Buffer.alloc(w * c.h);
    for (let y = 0; y < c.h; y++) for (let x = 0; x < w; x++) sub[y * w + x] = buf[y * c.w + x + a];
    return apretar({ x: c.x + a, y: c.y, w, h: c.h }, sub);
  }).filter(Boolean);
}

/* ── barrido de relleno ─────────────────────────────────────────────────── */
function svgDeCapa(glifos, c) {
  return glifos.map((g) =>
    `<svg x="${g.x - c.x}" y="${g.y - c.y}" width="${g.w}" height="${g.h}" viewBox="0 0 ${g.vw} ${g.vh}" preserveAspectRatio="none">` +
    g.d.map(([d, tr]) => `<path d="${d}"${tr ? ` transform="${tr}"` : ""} fill="#fff"/>`).join("") +
    `</svg>`
  ).join("");
}

async function cobertura(glifos, c) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${c.w}" height="${c.h}"><rect width="${c.w}" height="${c.h}" fill="#000"/>${svgDeCapa(glifos, c)}</svg>`;
  return await sharp(Buffer.from(svg)).greyscale().raw().toBuffer();
}

function mae(compuesto, c) {
  let e = 0;
  for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) e += Math.abs(compuesto[y * c.w + x] - lum(c.x + x, c.y + y));
  return e / (c.w * c.h);
}

/* ── marcos: se MIDEN ───────────────────────────────────────────────────────
   linea("H"|"V", coord, a0, a1) recorre el tramo pedido, se queda con el tramo
   contiguo de tinta más largo y devuelve [x, y, w, h, color promedio]. Nada de
   suponer dónde empieza y termina un marco: la referencia lo dice. */
function linea(dir, coord, a0, a1, u = 6) {
  let mejor = null, s = null;
  for (let a = a0; a <= a1 + 1; a++) {
    const on = a <= a1 && (dir === "H" ? lum(a, coord) : lum(coord, a)) > u;
    if (on) { if (s === null) s = a; }
    else if (s !== null) {
      if (!mejor || a - s > mejor[1] - mejor[0]) mejor = [s, a];
      s = null;
    }
  }
  if (!mejor) return null;
  const [b0, b1] = mejor;
  let r = 0, g = 0, b = 0;
  for (let a = b0; a < b1; a++) {
    const p = dir === "H" ? px(a, coord) : px(coord, a);
    r += p[0]; g += p[1]; b += p[2];
  }
  const n = b1 - b0;
  const hex = "#" + [r / n, g / n, b / n].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
  return dir === "H"
    ? [b0 - BX, coord - BY, n, 1, hex]
    : [coord - BX, b0 - BY, 1, n, hex];
}

/* Los marcos de sección: los que NO caen dentro de ninguna pieza trazada.
   [dir, coord, desde, hasta] */
const MARCOS = [
  // divisoria de columna del póster y marco derecho, de arriba abajo
  ["V", 941, 88, 865], ["V", 942, 88, 865],
  ["V", 1661, 88, 865], ["V", 1662, 88, 865], ["V", 1663, 88, 865], ["V", 1664, 88, 865],
  // caja de la sección 03 + 04 (comparten cantos)
  ["V", 950, 87, 588], ["V", 951, 87, 588],
  ["V", 1645, 87, 588], ["V", 1646, 87, 588],
  ["H", 87, 941, 1664], ["H", 88, 941, 1664],
  ["H", 127, 950, 1646],
  ["H", 328, 950, 1646], ["H", 329, 950, 1646],
  ["H", 338, 950, 1646], ["H", 339, 950, 1646],
  ["H", 586, 950, 1646], ["H", 587, 950, 1646],
  // banda de abajo: techo, pie y los cantos de 08 · 09 · 10
  ["H", 595, 941, 1664],
  ["H", 858, 941, 1664], ["H", 859, 941, 1664],
  ["V", 1058, 595, 859], ["V", 1059, 595, 859],
  ["V", 1070, 595, 859],
  ["V", 1341, 595, 859], ["V", 1342, 595, 859], ["V", 1345, 595, 859],
  ["V", 1354, 595, 859],
];

/* ── piezas ─────────────────────────────────────────────────────────────────
   [id, x0, y0, x1, y1, modo, capas]
     "trazo"   parte en celdas por columnas — renglones de texto
     "bloque"  una sola pieza — organismos, gráficos, retículas, marcos propios
     "color"   vtracer en color sobre el recorte RGB — falso color continuo

   Las cajas salieron de barrer la referencia fila por fila y columna por
   columna dentro del bloque (marcos en y=87/127/154/318/328/339/367/391/
   472/482/577/586/595/622/845/858 y x=941/950/963/1087/1097/1221/1231/1354/
   1364/1478/1487/1621/1645/1661), no de mirar el póster. */
const PIEZAS = [
  // ── 03 · TREATMENT MODES (LIVE CROPS) ─────────────────────────────────
  ["p3tit", 952, 96, 1400, 125, "trazo", [["rojo", 26, 3], ["gris", 26, 3]]],
  // franja de rótulos de las cinco tarjetas: marcos, nombres y glifos
  ["p3rot", 955, 126, 1646, 155, "bloque", [["lum", 8, 3], ["lum", 45, 3], ["lum", 105, 3], ["lum", 165, 3]]],
  // X-RAY · rojo sobre negro. Cinco umbrales: el cráneo es halo con núcleo.
  ["p3c1", 963, 154, 1090, 320, "bloque", [["lum", 8, 24], ["lum", 26, 12], ["lum", 55, 7], ["lum", 95, 5], ["lum", 145, 4]]],
  // LINEWORK · amarillo verdoso
  ["p3c2", 1096, 154, 1223, 320, "bloque", [["lum", 8, 24], ["lum", 26, 12], ["lum", 55, 7], ["lum", 95, 5], ["lum", 145, 4]]],
  // BITMAP · gris neutro
  ["p3c3", 1230, 154, 1357, 320, "bloque", [["lum", 8, 20], ["lum", 40, 10], ["lum", 90, 6], ["lum", 150, 4], ["lum", 205, 3]]],
  // THERMAL y GLITCH · falso color continuo, no hay tintas que separar
  ["p3c4", 1363, 154, 1481, 320, "color", [7, 4]],
  ["p3c5", 1486, 154, 1624, 320, "color", [7, 4]],

  // ── 04 · ANALYSIS / SIGNAL READOUTS ───────────────────────────────────
  ["p4tit", 952, 344, 1400, 367, "trazo", [["rojo", 26, 3], ["gris", 26, 3]]],
  // fila 1 · cabeceras y cuerpos, un recuadro por columna medida
  ["p4h1", 956, 366, 1123, 392, "bloque", [["lum", 8, 3], ["lum", 35, 3], ["lum", 90, 3], ["lum", 150, 3]]],
  ["p4b1", 956, 391, 1123, 474, "bloque", [["lum", 7, 8], ["lum", 22, 5], ["lum", 50, 4], ["lum", 105, 3]]],
  ["p4h2", 1129, 366, 1307, 392, "bloque", [["lum", 8, 3], ["lum", 35, 3], ["lum", 90, 3], ["lum", 150, 3]]],
  ["p4b2", 1129, 391, 1307, 474, "bloque", [["lum", 7, 8], ["lum", 22, 5], ["lum", 50, 4], ["lum", 105, 3]]],
  ["p4h3", 1313, 366, 1477, 392, "bloque", [["lum", 8, 3], ["lum", 35, 3], ["lum", 90, 3], ["lum", 150, 3]]],
  ["p4b3", 1313, 391, 1477, 474, "bloque", [["lum", 7, 8], ["lum", 20, 5], ["lum", 45, 4], ["lum", 95, 3], ["lum", 160, 3]]],
  ["p4h4", 1483, 366, 1647, 392, "bloque", [["lum", 8, 3], ["lum", 35, 3], ["lum", 90, 3], ["lum", 150, 3]]],
  ["p4b4", 1483, 391, 1647, 474, "bloque", [["lum", 7, 8], ["lum", 22, 5], ["lum", 50, 4], ["lum", 105, 3], ["lum", 170, 3]]],
  // fila 2
  ["p4h5", 956, 482, 1123, 509, "bloque", [["lum", 8, 3], ["lum", 35, 3], ["lum", 90, 3], ["lum", 150, 3]]],
  ["p4b5", 956, 508, 1123, 579, "bloque", [["lum", 7, 8], ["lum", 22, 5], ["lum", 50, 4], ["lum", 105, 3], ["lum", 165, 3]]],
  ["p4h6", 1129, 482, 1307, 509, "bloque", [["lum", 8, 3], ["lum", 35, 3], ["lum", 90, 3], ["lum", 150, 3]]],
  ["p4b6", 1129, 508, 1307, 579, "bloque", [["lum", 7, 8], ["lum", 20, 5], ["lum", 45, 4], ["lum", 95, 3], ["lum", 160, 3]]],
  ["p4h7", 1313, 482, 1477, 509, "bloque", [["lum", 8, 3], ["lum", 35, 3], ["lum", 90, 3], ["lum", 150, 3]]],
  ["p4b7", 1313, 508, 1477, 579, "bloque", [["lum", 7, 8], ["lum", 22, 5], ["lum", 50, 4], ["lum", 105, 3], ["lum", 165, 3]]],
  ["p4h8", 1483, 482, 1647, 509, "bloque", [["lum", 8, 3], ["lum", 35, 3], ["lum", 90, 3], ["lum", 150, 3]]],
  ["p4b8", 1483, 508, 1647, 579, "bloque", [["lum", 7, 8], ["lum", 22, 5], ["lum", 50, 4], ["lum", 105, 3], ["lum", 165, 3]]],

  // ── 08 · MOBILE TILE · sólo el jirón que cae en la caja (x ≥ 941) ──────
  ["p08g", 941, 596, 1058, 858, "bloque", [["gris", 8, 6], ["gris", 70, 4], ["gris", 150, 3]]],
  ["p08r", 941, 596, 1058, 858, "bloque", [["rojo", 10, 10], ["rojo", 40, 6], ["rojo", 95, 4], ["rojo", 165, 3]]],

  // ── 09 · NOTES / OBSERVATIONS ─────────────────────────────────────────
  ["p09t", 1072, 596, 1341, 623, "trazo", [["rojo", 26, 3], ["gris", 26, 3]]],
  ["p09g", 1072, 622, 1341, 858, "bloque", [["gris", 8, 4], ["gris", 55, 3], ["gris", 125, 3]]],
  ["p09r", 1072, 622, 1341, 858, "bloque", [["rojo", 18, 4], ["rojo", 70, 3]]],

  // ── 10 · ARCHIVE TAGS ─────────────────────────────────────────────────
  ["p10t", 1356, 596, 1660, 623, "trazo", [["rojo", 26, 3], ["gris", 26, 3]]],
  ["p10g", 1356, 622, 1500, 858, "bloque", [["gris", 8, 4], ["gris", 55, 3], ["gris", 125, 3]]],
  // el emblema del árbol: albura pálida y los anillos rojos del sello
  ["p10a", 1480, 620, 1660, 858, "bloque", [["palido", 9, 5], ["palido", 45, 4], ["palido", 110, 3], ["palido", 175, 3]]],
  ["p10ar", 1480, 620, 1660, 858, "bloque", [["rojo", 12, 5], ["rojo", 50, 3], ["rojo", 110, 3]]],
];

/* ── ejecución ──────────────────────────────────────────────────────────── */
async function pieza([id, x0, y0, x1, y1, modo, capas]) {
  const c = { x: Math.max(0, x0), y: Math.max(0, y0), w: Math.min(W - 1, x1) - x0 + 1, h: Math.min(H - 1, y1) - y0 + 1 };

  if (modo === "color") {
    const [prec, speckle] = capas;
    const cuerpo = await vectorizarColor(c, prec, speckle);
    return {
      id, modo,
      color: { x: c.x - BX, y: c.y - BY, w: c.w, h: c.h, vw: c.w * ESCALA_COLOR, vh: c.h * ESCALA_COLOR, s: cuerpo },
      caja: c, mae: null, nodos: (cuerpo.match(/<path/g) || []).length,
    };
  }

  const salida = [];
  const trazos = [];
  const compuesto = Buffer.alloc(c.w * c.h);

  for (const [filtro, u, speckle] of capas) {
    const buf = mascara(c, filtro, u);
    const rgb = tono(c, buf);
    const glifos = [];

    if (modo === "trazo") {
      for (const cel of await celdas(c, buf)) {
        const d = await vectorizar(cel.caja, cel.buf, speckle);
        if (d.length) glifos.push({ ...cel.caja, vw: cel.caja.w * ESCALA, vh: cel.caja.h * ESCALA, d });
      }
    } else {
      const ap = apretar(c, buf);
      if (ap) {
        const d = await vectorizar(ap.caja, ap.buf, speckle);
        if (d.length) glifos.push({ ...ap.caja, vw: ap.caja.w * ESCALA, vh: ap.caja.h * ESCALA, d });
      }
    }
    if (!glifos.length) continue;
    trazos.push({ rgb, glifos, cov: await cobertura(glifos, c) });
  }
  if (!trazos.length) return { id, modo, capas: [], mae: mae(compuesto, c), caja: c, nodos: 0 };

  /* Relleno por REGIÓN VISIBLE: cada capa sólo se ve donde ninguna posterior la
     tapa. Medido sobre la capa entera, el halo se elige con píxeles que el
     núcleo va a cubrir y sale demasiado claro. */
  for (let i = 0; i < trazos.length; i++) {
    const t = trazos[i];
    const visible = [];
    for (let j = 0; j < t.cov.length; j++) {
      if (t.cov[j] <= 127) continue;
      let tapado = false;
      for (let k2 = i + 1; k2 < trazos.length && !tapado; k2++) if (trazos[k2].cov[j] > 127) tapado = true;
      if (!tapado) visible.push(j);
    }
    const ref = (visible.length ? visible : [...t.cov.keys()].filter((j) => t.cov[j] > 127))
      .map((j) => lum(c.x + (j % c.w), c.y + Math.floor(j / c.w)));

    let mejor = null;
    for (let k = 20; k <= 255; k += 3) {
      const l = Math.round((t.rgb[0] * k * 77 + t.rgb[1] * k * 150 + t.rgb[2] * k * 29) / 256);
      let e = 0;
      for (const v of ref) e += Math.abs(Math.min(255, l) - v);
      if (!mejor || e < mejor.e) mejor = { k, l, e };
    }
    for (let j = 0; j < t.cov.length; j++) if (t.cov[j] > 127) compuesto[j] = Math.min(255, mejor.l);

    const hex = "#" + t.rgb.map((v) => Math.round(Math.min(255, v * mejor.k)).toString(16).padStart(2, "0")).join("");
    salida.push({ fill: hex, g: t.glifos.map((g) => ({ ...g, x: g.x - BX, y: g.y - BY })) });
  }

  const nodos = salida.reduce((a, cp) => a + cp.g.reduce((b, g) => b + g.d.length, 0), 0);
  return { id, modo, capas: salida, mae: mae(compuesto, c), caja: c, nodos };
}

const arte = {};
const color = {};
const informe = [];
for (const p of PIEZAS) {
  const r = await pieza(p);
  if (r.modo === "color") color[r.id] = r.color;
  else arte[r.id] = r.capas;
  const linea_ = ` *   ${r.id.padEnd(6)} ${String(p[1]).padStart(4)},${String(p[2]).padStart(3)} ${String(r.caja.w).padStart(4)}×${String(r.caja.h).padStart(3)} ${r.modo.padEnd(6)} ${(r.capas ? r.capas.map((c) => c.fill).join(" ") : "—").padEnd(34)} ${String(r.nodos).padStart(5)} nodos  ${r.mae === null ? "" : "MAE " + r.mae.toFixed(2)}`;
  informe.push(linea_);
  console.log(linea_.slice(5));
}

const marcos = MARCOS.map((m) => linea(...m)).filter(Boolean);
console.log(`\n  marcos medidos: ${marcos.length}/${MARCOS.length}`);

const cab = `/**
 * t01-05 · BLOQUE DERECHA · ARTE FIJA TRAZADA — NO SE EDITA A MANO.
 *
 * Generado con scripts/lamina/arte-t01-05-derecha.mjs desde
 * reference/canon/${SLUG}.png. Las coordenadas ya vienen relativas al
 * origen de la caja del bloque (${BX}, ${BY}).
 *
 * Ningún relleno está elegido a ojo: se barrió un escalar sobre el tono medido
 * de cada máscara y ganó el de menor error absoluto medio contra la referencia.
 * Las piezas "color" no llevan relleno propio: vtracer en ColorMode.Color emite
 * el suyo por región.
 *
 *   pieza  caja      tamaño   modo   relleno(s)                         nodos  MAE
${informe.join("\n")}
 */
export type Glifo = { x: number; y: number; w: number; h: number; vw: number; vh: number; d: [string, string][] };
export type Capa = { fill: string; g: Glifo[] };
/** Pieza de falso color continuo: el marcado interior que emitió vtracer. */
export type Color = { x: number; y: number; w: number; h: number; vw: number; vh: number; s: string };
/** Marco medido: [x, y, ancho, alto, color promedio de su tinta]. */
export type Marco = [number, number, number, number, string];

export const ARTE: Record<string, Capa[]> = ${JSON.stringify(arte)};
export const COLOR: Record<string, Color> = ${JSON.stringify(color)};
export const MARCOS: Marco[] = ${JSON.stringify(marcos)};
`;

mkdirSync(DIR, { recursive: true });
writeFileSync(SALIDA, cab);
console.log(`\n  → ${SALIDA}  (${(cab.length / 1024).toFixed(0)} KB)\n`);
