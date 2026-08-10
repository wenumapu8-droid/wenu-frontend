#!/usr/bin/env node
/**
 * KODEX-∞ · t01-07 COSMOLOGY CORE · ARTE FIJA DEL BLOQUE DERECHA
 *
 * Genera src/components/kodex/lamina/t01-07/trazos/arte-derecha.ts trazando con
 * vtracer todo lo que hay dentro de la caja (1175,88 · 493×778) desde
 * reference/canon/t01-07-cosmology-core.png.
 *
 *   node scripts/lamina/arte-t01-07-derecha.mjs
 *
 * Escribe en un directorio propio del bloque: cinco agentes trabajan la misma
 * lámina y el cajón compartido de glyphs.mjs se pisa solo.
 *
 * ── Lo que cambia respecto del trazador de t01-04 ─────────────────────────
 *
 * Aquella lámina tiene tres tintas (verde · gris · rojo) y se separan por
 * dominancia de canal. Ésta no: es un degradado continuo magenta → violeta →
 * azul sobre negro, y encima lleva texto gris neutro EN EL MISMO renglón que
 * el organismo (las etiquetas SUB-ASTRAL…BEYOND caen dentro del gráfico de
 * bandas). Separar por x es imposible ahí.
 *
 * Así que la máscara parte el color en cuatro clases que SÍ son una partición:
 *
 *   neutro  saturación baja  (texto, nodos blancos de las constelaciones)
 *   mag     r > b·1,15       (rosa/magenta: títulos, la mitad del espectro)
 *   azul    b > r·1,15       (CORE RESONANCE, los anillos fríos del disco)
 *   viol    el resto saturado (el violeta que une los dos extremos)
 *
 * Cada clase se traza en tres o cuatro umbrales crecientes y se pintan
 * INTERCALADAS por umbral, no agrupadas por color: un nodo blanco con halo
 * violeta necesita que el halo se pinte antes que el núcleo, sea del color que
 * sea. Agrupadas por color, el halo violeta de la capa baja tapaba núcleos
 * blancos ya pintados.
 *
 * El relleno de cada capa no se elige a ojo: se barre un escalar sobre el tono
 * medido (percentil 0,2 % de la máscara) y gana el de menor error absoluto
 * medio contra la referencia, midiendo sólo la REGIÓN VISIBLE de la capa —lo
 * que no le tapa ninguna capa posterior—.
 *
 * El código de barras del panel 11 no pasa por vtracer: se lee columna por
 * columna. El contorno le inventa esquinas y le come tinta.
 *
 * Los MARCOS tampoco se trazan: son líneas de 1 px alineadas a la grilla y van
 * como <rect> con shape-rendering:crispEdges. Acá sólo se les mide el color.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { PNG } from "pngjs";
import sharp from "sharp";
import { vectorize, ColorMode, PathSimplifyMode, Hierarchical } from "@neplex/vectorizer";

const SLUG = "t01-07-cosmology-core";
const REF = `reference/canon/${SLUG}.png`;
const SALIDA = "src/components/kodex/lamina/t01-07/trazos/arte-derecha.ts";
const ESCALA = 8;

/* Origen de la caja del bloque (andamiaje). Todo se emite ya relativo. */
const BX = 1175;
const BY = 88;

const img = PNG.sync.read(readFileSync(REF));
const { width: W, height: H, data } = img;
const px = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
const lum = (x, y) => { const [r, g, b] = px(x, y); return (r * 77 + g * 150 + b * 29) >> 8; };

/* ── clases de tinta ──────────────────────────────────────────────────────
   Medidas sobre la referencia:
     magenta  rgb(222,52,138) títulos · rgb(251,114,210) pico del espectro
     violeta  rgb(105,88,108) órbitas · rgb(175,135,186) lavanda del disco
     azul     rgb(61,112,164) CORE RESONANCE · rgb(111,160,200) su pico
     neutro   rgb(128,134,127) rótulos · rgb(255,255,255) nodos de glifo   */
const esNeutro = (r, g, b) => {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  return mx - mn <= mx * 0.13 + 3;
};
const FILTROS = {
  neutro: (r, g, b, l, u) => l > u && esNeutro(r, g, b),
  mag: (r, g, b, l, u) => l > u && !esNeutro(r, g, b) && r > b * 1.15,
  azul: (r, g, b, l, u) => l > u && !esNeutro(r, g, b) && b > r * 1.15,
  viol: (r, g, b, l, u) => l > u && !esNeutro(r, g, b) && r <= b * 1.15 && b <= r * 1.15,
  todo: (r, g, b, l, u) => l > u,
};

/** Máscara de 1 byte por píxel: 255 tinta, 0 fondo. */
function mascara(c, filtro, u) {
  const buf = Buffer.alloc(c.w * c.h);
  const test = FILTROS[filtro];
  for (let y = 0; y < c.h; y++)
    for (let x = 0; x < c.w; x++) {
      const [r, g, b] = px(c.x + x, c.y + y);
      const l = (r * 77 + g * 150 + b * 29) >> 8;
      if (test(r, g, b, l, u)) buf[y * c.w + x] = 255;
    }
  return buf;
}

/** Tono representativo: percentil 0,2 % por luminancia, normalizado a 1. */
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

/** Recorta la caja a la tinta real. Centrar mal una pieza la corre en la
 *  lámina y el diff la castiga aunque el dibujo esté perfecto. */
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

  /* Cada path trae su transform="translate(..)"; perderlo desarma el dibujo. */
  return [...svg.matchAll(/<path d="([^"]+)"(?:[^>]*transform="([^"]+)")?/g)].map((m) => [m[1], m[2] ?? ""]);
}

/** Modo trazo: parte la banda en celdas por columnas con tinta. Para renglones
 *  de texto: una caja por palabra pesa menos y no arrastra el interletraje. */
function celdas(c, buf) {
  const cortes = [];
  let run = null;
  for (let x = 0; x < c.w; x++) {
    let n = 0;
    for (let y = 0; y < c.h; y++) if (buf[y * c.w + x]) n++;
    if (n) run = run ? [run[0], x] : [x, x];
    else if (run && x - run[1] > 2) { cortes.push(run); run = null; }
  }
  if (run) cortes.push(run);
  return cortes
    .map(([a, b]) => {
      const w = b - a + 1;
      const sub = Buffer.alloc(w * c.h);
      for (let y = 0; y < c.h; y++) for (let x = 0; x < w; x++) sub[y * w + x] = buf[y * c.w + x + a];
      return apretar({ x: c.x + a, y: c.y, w, h: c.h }, sub);
    })
    .filter(Boolean);
}

/* ── barrido de relleno ───────────────────────────────────────────────────*/
function svgDeCapa(glifos, c) {
  return glifos
    .map(
      (g) =>
        `<svg x="${g.x - c.x}" y="${g.y - c.y}" width="${g.w}" height="${g.h}" viewBox="0 0 ${g.vw} ${g.vh}" preserveAspectRatio="none">` +
        g.d.map(([d, tr]) => `<path d="${d}"${tr ? ` transform="${tr}"` : ""} fill="#fff"/>`).join("") +
        `</svg>`
    )
    .join("");
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

/* ── juegos de capas ──────────────────────────────────────────────────────
   Intercaladas por umbral y no agrupadas por color: el halo va antes que el
   núcleo aunque sean de clases distintas. [filtro, umbral, filterSpeckle] */
const ORG = [
  ["viol", 13, 14], ["azul", 13, 14], ["mag", 13, 14], ["neutro", 13, 14],
  ["viol", 52, 7], ["azul", 52, 7], ["mag", 52, 7], ["neutro", 52, 7],
  ["viol", 108, 5], ["azul", 108, 5], ["mag", 108, 5], ["neutro", 108, 5],
  ["viol", 175, 3], ["mag", 175, 3], ["neutro", 185, 3],
];
/** Organismo DENSO (las tres ondas, el disco, el teléfono, el árbol).
 *
 *  Con cuatro escalones el trazado sale lavado: entre púa y púa hay 1 px de
 *  bruma y la máscara del escalón bajo se cierra en una losa maciza, que luego
 *  se rellena con UN color —el promedio— y se come el contraste que hace que
 *  una onda se lea como onda. Medido en el banco: 1,42 % con 4 escalones,
 *  1,15 % con estos nueve. El coste es tamaño de archivo, no tiempo. */
const escalones = [12, 21, 33, 48, 67, 92, 126, 172, 218];
const FINO = escalones.flatMap((t) =>
  ["viol", "azul", "mag", "neutro"].map((c) => [c, t, t < 40 ? 10 : t < 100 ? 6 : 3])
);
/** Organismo tenue (miniaturas de trama fina): sin la capa alta, que en un
 *  dibujo de línea sólo recorta el mismo trazo dos veces. */
const ORGL = [
  ["viol", 11, 12], ["azul", 11, 12], ["mag", 11, 12], ["neutro", 11, 12],
  ["viol", 42, 6], ["azul", 42, 6], ["mag", 42, 6], ["neutro", 42, 6],
  ["viol", 92, 4], ["azul", 92, 4], ["mag", 92, 4], ["neutro", 92, 4],
  ["mag", 160, 3], ["neutro", 170, 3],
];

/* ── piezas ───────────────────────────────────────────────────────────────
   [id, x0, y0, x1, y1, modo, capas]  (coordenadas absolutas, inclusive)

   Las cajas salieron de barrer la referencia fila por fila y columna por
   columna con scripts/lamina/_t0107_der_perfil.mjs, no de mirar el póster:
     05  rótulos 113-120 · dibujo 126-216 · divisorias x 1302 · 1420 · 1543
     06  nombres 268-274 · glifos 286-345 · divisorias x 1246·1315·1384·1454·
         1523·1594
     07  FREQUENCY BANDS 394-401 · escala 407-413 · onda 415-453 · bandas
         457-462 · regla 468 · SIGNAL STRENGTH 476-483 · onda 489-512 · regla
         521 · CORE RESONANCE 529-536 · onda 541-566
     11  título 596-604 · teléfono 617-857 · ficha 627-787 · barras 793-815 ·
         gráfico 820-848                                                      */
const PIEZAS = [
  // ── 05 DIAGRAM STUDIES ─────────────────────────────────────────────────
  ["t5tit", 1179, 88, 1345, 106, "trazo", [["mag", 28, 4]]],
  ["t5lab", 1179, 110, 1665, 124, "trazo", [["neutro", 30, 4]]],
  ["b5c1", 1179, 125, 1301, 229, "bloque", ORGL],
  ["b5c2", 1304, 125, 1419, 229, "bloque", ORGL],
  ["b5c3", 1422, 125, 1542, 229, "bloque", ORGL],
  ["b5c4", 1545, 125, 1665, 229, "bloque", ORGL],

  // ── 06 CONSTELLATION GLYPHS ────────────────────────────────────────────
  ["t6tit", 1179, 238, 1400, 258, "trazo", [["mag", 28, 4]]],
  ["t6lab", 1179, 264, 1665, 278, "trazo", [["neutro", 28, 4]]],
  ["b6c1", 1179, 282, 1245, 353, "bloque", ORGL],
  ["b6c2", 1248, 282, 1314, 353, "bloque", ORGL],
  ["b6c3", 1317, 282, 1383, 353, "bloque", ORGL],
  ["b6c4", 1386, 282, 1453, 353, "bloque", ORGL],
  ["b6c5", 1456, 282, 1522, 353, "bloque", ORGL],
  ["b6c6", 1525, 282, 1593, 353, "bloque", ORGL],
  ["b6c7", 1596, 282, 1665, 353, "bloque", ORGL],

  // ── 07 SIGNAL CHARTS ───────────────────────────────────────────────────
  ["t7tit", 1179, 364, 1400, 385, "trazo", [["mag", 28, 4]]],
  ["t7l1", 1186, 391, 1420, 404, "trazo", [["neutro", 28, 4]]],
  ["t7esc", 1186, 405, 1496, 414, "trazo", [["neutro", 28, 3]]],
  ["b7wav", 1186, 414, 1496, 466, "bloque", FINO],
  ["t7l2", 1186, 473, 1420, 486, "trazo", [["neutro", 28, 4]]],
  ["b7sig", 1186, 487, 1496, 518, "bloque", FINO],
  ["t7l3", 1186, 526, 1420, 539, "trazo", [["neutro", 28, 4]]],
  ["b7cor", 1186, 540, 1496, 572, "bloque", FINO],

  // ── SPECTRUM READOUT ───────────────────────────────────────────────────
  ["tspt", 1512, 364, 1665, 385, "trazo", [["mag", 28, 4]]],
  ["bspt", 1512, 388, 1659, 579, "bloque", FINO],

  // ── panel del árbol (jirón derecho: el marco izquierdo lo abre el vecino)─
  ["btre", 1176, 640, 1318, 792, "bloque", FINO],
  ["bmic", 1176, 794, 1318, 858, "bloque", ORGL],

  // ── 11 MOBILE SCENE TILE ───────────────────────────────────────────────
  ["t11t", 1332, 590, 1560, 610, "trazo", [["mag", 28, 4]]],
  ["b11p", 1330, 613, 1521, 860, "bloque", FINO],
  ["b11f", 1537, 620, 1655, 790, "bloque", [
    ["neutro", 13, 4], ["mag", 13, 4], ["viol", 13, 4], ["azul", 13, 4],
    ["neutro", 55, 3], ["mag", 55, 3], ["viol", 55, 3], ["azul", 55, 3],
    ["neutro", 120, 3], ["mag", 120, 3], ["azul", 120, 3],
  ]],
  ["b11g", 1537, 816, 1655, 850, "bloque", ORGL],
];

/* Código de barras: [id, x0, x1, y0, y1]. Se lee columna por columna. */
const BARRAS = [["b11cod", 1538, 1652, 793, 815]];

function leerBarras(x0, x1, y0, y1) {
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
    while (j + 1 < cols.length && Math.abs(cols[j + 1] - cols[i]) <= 8) j++;
    const v = Math.round(cols.slice(i, j + 1).reduce((a, b) => a + b, 0) / (j - i + 1));
    if (v > 14) tramos.push([x0 + i - BX, j - i + 1, v]);
    i = j + 1;
  }
  return { y: y0 - BY, h: y1 - y0 + 1, tramos };
}

/* ── marcos ───────────────────────────────────────────────────────────────
   Salieron de scripts/lamina/_t0107_der_marcos.mjs (tramos de más de 90 px con
   cobertura > 0,9 que son PICO contra sus dos vecinas a ±2 px) y se filtraron
   a mano: el detector también encuentra el eje de las ondas y las verticales
   del disco, que son organismo y ya los traza vtracer. Dibujarlos dos veces
   con dos colores distintos es peor que no dibujarlos.
   Acá sólo van las coordenadas; el color se MIDE. [x0,y0,x1,y1] absoluto. */
const MARCOS = [
  // filas
  [1177, 105, 1667, 105], [1184, 106, 1547, 106],
  [1177, 230, 1667, 230], [1177, 231, 1667, 231], [1177, 235, 1667, 235],
  [1183, 258, 1667, 258], [1256, 259, 1667, 259],
  [1177, 355, 1667, 355], [1178, 362, 1667, 362], [1177, 363, 1667, 363],
  [1184, 386, 1497, 386], [1511, 386, 1660, 386],
  [1184, 468, 1497, 468], [1184, 521, 1497, 521], [1184, 580, 1497, 580],
  [1511, 581, 1660, 581],
  [1177, 587, 1667, 587], [1327, 588, 1667, 588],
  [1175, 605, 1328, 605], [1175, 606, 1328, 606],
  [1523, 611, 1656, 611], [1175, 613, 1328, 613], [1175, 614, 1329, 614],
  [1542, 618, 1648, 618], [1541, 619, 1648, 619],
  [1175, 638, 1320, 638], [1541, 655, 1648, 655],
  [1542, 709, 1648, 709], [1541, 710, 1648, 710],
  [1542, 747, 1648, 747], [1541, 748, 1648, 748],
  [1541, 787, 1648, 787], [1181, 795, 1313, 795],
  [1534, 848, 1656, 848], [1175, 864, 1659, 864],
  // columnas
  [1175, 645, 1175, 859],
  [1177, 88, 1177, 355], [1178, 88, 1178, 355],
  [1177, 363, 1177, 587], [1178, 363, 1178, 587],
  [1184, 386, 1184, 580],
  [1246, 258, 1246, 355], [1247, 258, 1247, 355],
  [1302, 105, 1302, 235], [1303, 105, 1303, 235],
  [1315, 258, 1315, 355], [1316, 258, 1316, 355],
  [1319, 638, 1319, 859], [1320, 638, 1320, 859],
  [1327, 587, 1327, 864], [1328, 587, 1328, 864],
  [1384, 258, 1384, 355], [1385, 258, 1385, 355],
  [1420, 105, 1420, 235], [1421, 105, 1421, 235],
  [1454, 258, 1454, 355], [1455, 258, 1455, 355],
  [1497, 386, 1497, 580],
  [1505, 362, 1505, 588], [1506, 362, 1506, 588],
  [1511, 386, 1511, 581],
  [1523, 258, 1523, 355], [1524, 258, 1524, 355],
  [1534, 611, 1534, 848], [1535, 611, 1535, 848],
  [1543, 105, 1543, 235], [1544, 105, 1544, 235],
  [1594, 258, 1594, 355], [1595, 258, 1595, 355],
  [1656, 611, 1656, 848], [1660, 386, 1660, 581],
  [1666, 88, 1666, 865], [1667, 88, 1667, 865],
];

function medirMarco([x0, y0, x1, y1]) {
  let r = 0, g = 0, b = 0, n = 0;
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) { const c = px(x, y); r += c[0]; g += c[1]; b += c[2]; n++; }
  const hex = "#" + [r / n, g / n, b / n].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
  return [x0 - BX, y0 - BY, x1 - x0 + 1, y1 - y0 + 1, hex];
}

/* ── ejecución ────────────────────────────────────────────────────────────*/
async function pieza([id, x0, y0, x1, y1, modo, capas]) {
  const c = { x: Math.max(0, x0), y: Math.max(0, y0), w: Math.min(W - 1, x1) - x0 + 1, h: Math.min(H - 1, y1) - y0 + 1 };
  const salida = [];
  const trazos = [];
  const compuesto = Buffer.alloc(c.w * c.h);

  for (const [filtro, u, speckle] of capas) {
    const buf = mascara(c, filtro, u);
    const rgb = tono(c, buf);
    const glifos = [];

    if (modo === "trazo") {
      for (const cel of celdas(c, buf)) {
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
  if (!trazos.length) return { id, capas: [], mae: mae(compuesto, c), caja: c };

  /* Relleno por REGIÓN VISIBLE: una capa sólo se ve donde ninguna posterior la
     tapa. Medido sobre la capa entera, el halo se elige con píxeles que después
     quedan cubiertos por el núcleo y sale demasiado claro. */
  for (let i = 0; i < trazos.length; i++) {
    const t = trazos[i];
    const visible = [];
    for (let j = 0; j < t.cov.length; j++) {
      if (t.cov[j] <= 127) continue;
      let tapado = false;
      for (let k = i + 1; k < trazos.length && !tapado; k++) if (trazos[k].cov[j] > 127) tapado = true;
      if (!tapado) visible.push(j);
    }
    const ref = (visible.length ? visible : [...t.cov.keys()].filter((j) => t.cov[j] > 127)).map((j) =>
      lum(c.x + (j % c.w), c.y + Math.floor(j / c.w))
    );

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

  return { id, capas: salida, mae: mae(compuesto, c), caja: c };
}

const arte = {};
const informe = [];
for (const p of PIEZAS) {
  const r = await pieza(p);
  arte[r.id] = r.capas;
  const nodos = r.capas.reduce((a, x) => a + x.g.reduce((b, g) => b + g.d.length, 0), 0);
  const linea = ` *   ${r.id.padEnd(6)} ${String(p[1]).padStart(4)},${String(p[2]).padStart(3)} ${String(r.caja.w).padStart(4)}×${String(r.caja.h).padStart(3)}  ${String(r.capas.length).padStart(2)} capas ${String(nodos).padStart(6)} nodos  MAE ${r.mae.toFixed(2)}`;
  informe.push(linea);
  console.log(linea.slice(5));
}
const barras = {};
for (const [id, ...r] of BARRAS) barras[id] = leerBarras(...r);
const marcos = MARCOS.map(medirMarco);

const cab = `/**
 * t01-07 · BLOQUE DERECHA · ARTE FIJA TRAZADA — NO SE EDITA A MANO.
 *
 * Generado con scripts/lamina/arte-t01-07-derecha.mjs desde
 * reference/canon/${SLUG}.png (vtracer sobre máscara de clase de color
 * sobremuestreada ×${ESCALA}). Las coordenadas ya vienen relativas al origen de la
 * caja del bloque (${BX}, ${BY}).
 *
 * Ningún relleno está elegido a ojo: se barrió un escalar sobre el tono medido
 * de cada máscara y ganó el de menor error absoluto medio contra la referencia,
 * midiendo sólo la región visible de la capa.
 *
 *   pieza  caja       tamaño        capas  nodos   MAE
${informe.join("\n")}
 */
export type Glifo = { x: number; y: number; w: number; h: number; vw: number; vh: number; d: [string, string][] };
export type Capa = { fill: string; g: Glifo[] };
/** Tramos de un código de barras: [x, ancho, luminancia]. Leídos columna por
 *  columna: el contorno de vtracer les inventa esquinas y pierde tinta. */
export type Barras = { y: number; h: number; tramos: [number, number, number][] };
/** Línea de chrome: [x, y, ancho, alto, relleno]. El color está medido. */
export type Marco = [number, number, number, number, string];

export const ARTE: Record<string, Capa[]> = ${JSON.stringify(arte)};
export const BARRAS: Record<string, Barras> = ${JSON.stringify(barras)};
export const MARCOS: Marco[] = ${JSON.stringify(marcos)};
`;

mkdirSync("src/components/kodex/lamina/t01-07/trazos", { recursive: true });
writeFileSync(SALIDA, cab);
console.log(`\n  → ${SALIDA}  (${(cab.length / 1024).toFixed(0)} KB)\n`);
