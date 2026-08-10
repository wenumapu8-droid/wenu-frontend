#!/usr/bin/env node
/**
 * KODEX-∞ · t01-04 ARCHIVE TREE · ARTE FIJA DEL BLOQUE DERECHA
 *
 * Genera src/components/kodex/lamina/t01-04/trazos/arte-derecha.ts trazando las
 * piezas fijas de los paneles 03 · 04 · 05 (y la parte del 09/10/11 que cae
 * dentro de la caja) desde reference/canon/t01-04-archive-tree.png.
 *
 *   node scripts/lamina/arte-t01-04-derecha.mjs           # genera el .ts
 *   node scripts/lamina/arte-t01-04-derecha.mjs --barrer  # tabla de umbrales
 *
 * Escribe en un directorio propio a propósito: `scripts/lamina/glyphs.mjs` deja
 * todo en glyphs/<slug>/ y esta lámina la arman cinco agentes a la vez, así que
 * ese cajón compartido se pisa solo. Acá nada sale de este archivo.
 *
 * ── Lo que hace distinto al trazador general ──────────────────────────────
 *
 * 1. MÁSCARA POR COLOR, no por gris. La lámina mezcla tres tintas en la misma
 *    línea de base: verde (g > r), gris neutro (r ≈ g ≈ b) y rojo (r ≫ g). Con
 *    un umbral de luminancia las tres caen en el mismo trazo y hay que elegir
 *    un solo relleno, que sale mal para las tres. Separadas por color, cada
 *    capa lleva su propio tono y la misma banda se traza dos o tres veces sin
 *    tener que partirla por x —que era la otra opción y es frágil, porque
 *    «05. BRANCH DETAIL» y «// NODE CLUSTER» comparten renglón.
 *
 * 2. CAPAS POR UMBRAL para el organismo. Los árboles, el racimo de nodos y los
 *    espectros no son línea: son un halo con un núcleo brillante adentro. Un
 *    umbral solo obliga a elegir entre perder el halo o empastar el núcleo. Se
 *    trazan dos o tres veces con umbrales crecientes y se pintan de oscuro a
 *    claro; el relleno de cada capa se mide encima del compuesto anterior.
 *
 * 3. El relleno NO se elige a ojo. Para cada capa se barre un escalar sobre el
 *    tono medido (el color del percentil 0,2 % de la máscara) y gana el que
 *    menos error absoluto medio deja contra la referencia. El MAE de cada pieza
 *    queda escrito en la cabecera del .ts generado.
 *
 * 4. Los CÓDIGOS DE BARRAS no pasan por vtracer. Un código de barras es una
 *    función de una sola variable: se lee columna por columna. El contorno le
 *    inventa esquinas y le come tinta.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { PNG } from "pngjs";
import sharp from "sharp";
import { vectorize, ColorMode, PathSimplifyMode, Hierarchical } from "@neplex/vectorizer";

const SLUG = "t01-04-archive-tree";
const REF = `reference/canon/${SLUG}.png`;
const SALIDA = "src/components/kodex/lamina/t01-04/trazos/arte-derecha.ts";
const ESCALA = 8;

/* Origen de la caja del bloque (andamiaje). Todo lo que se emite ya viene
   relativo a este punto, así el componente no repite la resta en cada nodo. */
const BX = 1010;
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

/* ── filtros de tinta ─────────────────────────────────────────────────────
   Medidos sobre la referencia, no supuestos:
     verde  rgb(104,142,5)   · g claramente por encima de r, azul casi nulo
     gris   rgb(125,128,125) · los tres canales dentro de un 12 %
     rojo   rgb(188,51,39)   · r al doble de g
     blanco rgb(162,162,162) · las barras de los códigos, neutras y brillantes */
const FILTROS = {
  lum: (r, g, b, l, u) => l > u,
  verde: (r, g, b, l, u) => l > u && g > r * 1.06 && b < g * 0.62,
  gris: (r, g, b, l, u) => l > u && g <= r * 1.06 && r < g * 1.35 && b > g * 0.62,
  rojo: (r, g, b, l, u) => l > u && r > g * 1.45,
  /* Gris APAGADO: los marcos de las tiras del panel 10 son neutros y tenues, y
     comparten caja con los códigos de barras, que son neutros y brillantes. Sin
     el techo, la máscara del marco se traga las barras —y las barras no se
     trazan, se leen columna por columna. */
  grisd: (r, g, b, l, u) => l > u && l < 70 && g <= r * 1.12 && r < g * 1.4 && b > g * 0.55,
  /* Todo lo que no es rojo. Los organismos no son de UN color: el árbol de la
     ficha móvil y los núcleos del racimo llegan a rgb(253,255,158), donde el
     verde ya no domina al rojo y la máscara «verde» los deja afuera —que es
     justo la parte más brillante del dibujo—. Donde no hay tinta roja en la
     caja, esto es lo correcto y las capas por umbral se encargan del tono. */
  palido: (r, g, b, l, u) => l > u && r <= g * 1.45,
};

/** Máscara de 1 byte por píxel: 255 tinta, 0 fondo. */
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

/** Tono representativo de la máscara: percentil 0,2 % por luminancia,
 *  normalizado a canal máximo = 1. El brillo lo pone el barrido. */
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

/** Recorta la caja a la tinta real de la máscara. Centrar mal una pieza la
 *  corre en la lámina y el diff la castiga aunque el dibujo esté perfecto. */
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

  /* Cada path trae su propio transform="translate(..)". Perderlo desarma el
     dibujo: la contraforma de una letra queda fuera de sitio. Se guarda el par. */
  return [...svg.matchAll(/<path d="([^"]+)"(?:[^>]*transform="([^"]+)")?/g)].map((m) => [m[1], m[2] ?? ""]);
}

/* ── modo trazo: parte la banda en celdas por columnas con tinta ───────────
   Para renglones de texto y filas de glifos. Una caja por glifo pesa menos que
   una caja por renglón y no arrastra el interletraje al viewBox. */
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

/* ── barrido de relleno ───────────────────────────────────────────────────
   Rasteriza el compuesto de capas sobre negro y mide el error absoluto medio
   en luminancia contra el recorte de la referencia. Las capas se resuelven en
   orden: cada una se mide ENCIMA de lo ya pintado, porque el orden de pintado
   es el que ve el navegador. */
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

/* ── piezas ───────────────────────────────────────────────────────────────
   [id, x0, y0, x1, y1, modo, capas]
   modo   "trazo"  parte en celdas por columnas (texto, filas de glifos)
          "bloque" una sola pieza (organismos, gráficos, retículas)
   capas  [filtro, umbral, filterSpeckle] · se pintan en el orden dado

   Las cajas salieron de medir la referencia columna por columna y fila por
   fila (marcos en x=1141/1294/1470/1651, filas en y=109/360/369/392/585/596/
   619/849), no de mirar el póster y calcular. */
const PIEZAS = [
  // ── 03 GROWTH STATES ───────────────────────────────────────────────────
  ["p3tit", 1010, 90, 1215, 105, "trazo", [["verde", 30, 4]]],
  ["p3cab", 1010, 114, 1651, 128, "trazo", [["verde", 42, 4]]],
  ["p3sub", 1010, 129, 1651, 141, "trazo", [["gris", 42, 4]]],
  ["p3art", 1010, 142, 1651, 287, "bloque", [["palido", 12, 40], ["palido", 34, 16], ["palido", 66, 8], ["palido", 110, 5], ["palido", 165, 3]]],
  ["p3g1", 1010, 287, 1651, 299, "trazo", [["verde", 38, 4]]],
  ["p3g2", 1010, 300, 1651, 311, "trazo", [["gris", 42, 4]]],
  ["p3wav", 1010, 312, 1651, 356, "bloque", [["palido", 18, 12], ["palido", 52, 7], ["palido", 100, 5], ["palido", 155, 3]]],

  // ── 04 SIGNAL & SPECTRUM ANALYSIS ──────────────────────────────────────
  ["p4tit", 1010, 374, 1299, 389, "trazo", [["verde", 36, 4]]],
  ["p4lb1", 1010, 395, 1140, 408, "trazo", [["gris", 36, 4]]],
  ["p4wav", 1010, 408, 1224, 478, "bloque", [["palido", 14, 24], ["palido", 48, 10], ["palido", 104, 6], ["palido", 165, 4]]],
  ["p4lb2", 1010, 478, 1140, 492, "trazo", [["gris", 36, 4]]],
  ["p4spe", 1010, 492, 1224, 558, "bloque", [["palido", 14, 24], ["palido", 48, 10], ["palido", 104, 6], ["palido", 165, 4]]],
  ["p4axi", 1010, 558, 1224, 572, "trazo", [["gris", 26, 3]]],
  ["p4dsc", 1228, 398, 1300, 480, "bloque", [["verde", 16, 8], ["verde", 60, 5], ["verde", 120, 4]]],
  ["p4dscR", 1228, 398, 1300, 480, "bloque", [["rojo", 18, 4]]],
  ["p4q1", 1228, 480, 1300, 492, "trazo", [["gris", 34, 3]]],
  ["p4q2", 1228, 493, 1300, 509, "trazo", [["verde", 40, 4]]],
  ["p4q3", 1228, 509, 1300, 523, "bloque", [["palido", 20, 3], ["palido", 70, 2]]],
  ["p4q4", 1228, 524, 1300, 536, "trazo", [["gris", 34, 3]]],
  ["p4q5", 1228, 536, 1300, 552, "trazo", [["verde", 40, 4]]],
  ["p4q6", 1228, 552, 1300, 570, "bloque", [["palido", 18, 3], ["palido", 60, 2]]],

  // ── 05 BRANCH DETAIL // NODE CLUSTER ───────────────────────────────────
  ["p5titV", 1310, 374, 1651, 389, "trazo", [["verde", 36, 4]]],
  ["p5titG", 1310, 374, 1651, 389, "trazo", [["gris", 34, 4]]],
  ["p5img", 1310, 393, 1535, 538, "bloque", [["palido", 12, 40], ["palido", 40, 16], ["palido", 78, 8], ["palido", 125, 5], ["palido", 185, 3]]],
  ["p5tabV", 1537, 394, 1651, 533, "trazo", [["verde", 36, 4]]],
  ["p5tabG", 1537, 394, 1651, 533, "bloque", [["gris", 30, 4]]],
  ["p5glf", 1310, 534, 1535, 588, "bloque", [["palido", 14, 10], ["palido", 52, 5], ["palido", 110, 4]]],
  ["p5sel", 1534, 530, 1596, 588, "bloque", [["rojo", 14, 4], ["rojo", 55, 3]]],
  ["p5selG", 1534, 530, 1596, 588, "bloque", [["gris", 14, 4]]],
  ["p5lst", 1596, 530, 1651, 588, "bloque", [["verde", 14, 6], ["verde", 60, 4]]],
  ["p5lstG", 1596, 530, 1651, 588, "bloque", [["gris", 14, 4]]],

  // ── 09 MOBILE TILE (jirón derecho que cae en la caja) ──────────────────
  ["p09v", 1010, 596, 1148, 850, "bloque", [["palido", 10, 24], ["palido", 32, 12], ["palido", 66, 7], ["palido", 112, 5], ["palido", 170, 3]]],
  ["p09r", 1010, 596, 1148, 850, "bloque", [["rojo", 16, 4], ["rojo", 60, 3]]],

  // ── 10 ARCHIVE STRIPS ──────────────────────────────────────────────────
  ["p10tit", 1155, 600, 1420, 617, "trazo", [["verde", 36, 4]]],
  ["p10lbV", 1155, 626, 1420, 800, "trazo", [["verde", 38, 4]]],
  ["p10lbG", 1155, 626, 1420, 800, "trazo", [["gris", 38, 4]]],
  ["p10caj", 1160, 636, 1372, 838, "bloque", [["verde", 20, 6]]],
  ["p10cajG", 1160, 636, 1372, 838, "bloque", [["grisd", 7, 6]]],
  ["p10cod", 1318, 636, 1372, 838, "bloque", [["gris", 40, 3]]],
  ["p10mrcR", 1160, 636, 1372, 838, "bloque", [["rojo", 11, 3]]],
  ["p10glfV", 1374, 630, 1420, 840, "bloque", [["verde", 14, 5], ["verde", 70, 4]]],
  ["p10glfR", 1374, 630, 1420, 840, "bloque", [["rojo", 12, 4], ["rojo", 60, 3]]],
  
  // ── 11 GLYPH LIBRARY ───────────────────────────────────────────────────
  ["p11tit", 1432, 600, 1651, 617, "trazo", [["verde", 36, 4]]],
  ["p11gr", 1432, 626, 1651, 757, "bloque", [["palido", 9, 6], ["palido", 32, 5], ["palido", 66, 4], ["palido", 110, 3]]],
  ["p11r4", 1432, 757, 1651, 848, "bloque", [["palido", 11, 6], ["palido", 42, 4], ["palido", 96, 3]]],
  ["p11r4R", 1432, 757, 1651, 848, "bloque", [["rojo", 12, 4], ["rojo", 55, 3]]],
];

/* Códigos de barras: [id, x0, x1, y0, y1]. Se leen columna por columna. */
const BARRAS = [
  ["b1", 1166, 1318, 646, 664],
  ["b2", 1166, 1318, 699, 717],
  ["b3", 1166, 1318, 753, 771],
  ["b4", 1166, 1318, 808, 825],
];

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

/* ── ejecución ────────────────────────────────────────────────────────────*/
async function pieza([id, x0, y0, x1, y1, modo, capas]) {
  const c = { x: Math.max(0, x0), y: Math.max(0, y0), w: Math.min(W - 1, x1) - x0 + 1, h: Math.min(H - 1, y1) - y0 + 1 };
  const salida = [];
  const trazos = [];
  let compuesto = Buffer.alloc(c.w * c.h);

  for (const [filtro, u, speckle] of capas) {
    const buf = mascara(c, filtro, u);
    const rgb = tono(c, buf);
    let glifos = [];

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
  if (!trazos.length) return { id, capas: [], mae: mae(compuesto, c), caja: c };

  /* Barrido del relleno POR REGIÓN VISIBLE. Las capas se pintan de oscura a
     clara y la clara tapa a la oscura, así que el relleno de una capa sólo se
     ve donde ninguna posterior la cubre. Midiéndolo sobre la capa entera —que
     es lo que hacía la primera versión— el halo de un árbol se elegía sobre
     píxeles que después quedan tapados por el núcleo, y salía demasiado claro:
     la retícula de recuadros del panel 11 se iba a brillo de glifo. */
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

  return { id, capas: salida, mae: mae(compuesto, c), caja: c };
}

const barrer = process.argv.includes("--barrer");
const arte = {};
const informe = [];
for (const p of PIEZAS) {
  const r = await pieza(p);
  arte[r.id] = r.capas;
  const nodos = r.capas.reduce((a, c) => a + c.g.reduce((b, g) => b + g.d.length, 0), 0);
  const linea = ` *   ${r.id.padEnd(8)} ${String(p[1]).padStart(4)},${String(p[2]).padStart(3)} ${String(r.caja.w).padStart(4)}×${String(r.caja.h).padStart(3)}  ${r.capas.map((c) => c.fill).join(" ").padEnd(26)} ${String(nodos).padStart(5)} nodos  MAE ${r.mae.toFixed(2)}`;
  informe.push(linea);
  console.log(linea.slice(5));
}
const barras = {};
for (const [id, ...r] of BARRAS) barras[id] = leerBarras(...r);

if (barrer) process.exit(0);

const cab = `/**
 * t01-04 · BLOQUE DERECHA · ARTE FIJA TRAZADA — NO SE EDITA A MANO.
 *
 * Generado con scripts/lamina/arte-t01-04-derecha.mjs desde
 * reference/canon/${SLUG}.png (vtracer sobre máscara de color
 * sobremuestreada ×8). Las coordenadas ya vienen relativas al origen de la
 * caja del bloque (${BX}, ${BY}).
 *
 * Ningún relleno está elegido a ojo: se barrió un escalar sobre el tono medido
 * de cada máscara y ganó el de menor error absoluto medio contra la referencia.
 *
 *   pieza      caja          tamaño      relleno(s)                  nodos   MAE
${informe.join("\n")}
 */
export type Glifo = { x: number; y: number; w: number; h: number; vw: number; vh: number; d: [string, string][] };
export type Capa = { fill: string; g: Glifo[] };
/** Tramos de un código de barras: [x, ancho, luminancia]. Leídos columna por
 *  columna: el contorno de vtracer les inventa esquinas y pierde tinta. */
export type Barras = { y: number; h: number; tramos: [number, number, number][] };

export const ARTE: Record<string, Capa[]> = ${JSON.stringify(arte)};
export const BARRAS: Record<string, Barras> = ${JSON.stringify(barras)};
`;

mkdirSync("src/components/kodex/lamina/t01-04/trazos", { recursive: true });
writeFileSync(SALIDA, cab);
console.log(`\n  → ${SALIDA}  (${(cab.length / 1024).toFixed(0)} KB)\n`);
