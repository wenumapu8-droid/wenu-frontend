#!/usr/bin/env node
/**
 * KODEX-∞ · t01-05 SPECIMEN SKULL · ARTE FIJA DEL BLOQUE IZQUIERDA
 *
 * Genera src/components/kodex/lamina/t01-05/arte-izq.ts trazando desde
 * reference/canon/t01-05-specimen-skull.png todo lo fijo de la columna
 * izquierda: el panel 01 entero y las mitades izquierdas de los paneles 05 y
 * 06, que caen dentro de la caja del bloque (left:4 top:88 · 295×778) y que
 * nadie más puede alcanzar sin salirse de la suya.
 *
 *   node scripts/lamina/arte-t01-05-izq.mjs            # genera arte-izq.ts
 *   node scripts/lamina/arte-t01-05-izq.mjs --cajas    # verifica los encuadres
 *   node scripts/lamina/arte-t01-05-izq.mjs --barrer   # barre umbrales
 *
 * Escribe en archivo y temporal propios: la lámina la arman cinco agentes a la
 * vez y `scripts/lamina/glyphs/<slug>/` es un cajón único que ya se pisaron.
 *
 * Qué hace distinto al generador de t01-04, y por qué:
 *
 *  · LOS MARCOS SE LEEN, NO SE AJUSTAN. En t01-04 cada filo se resolvía como un
 *    rectángulo de posición y ancho fraccionarios contra las medias de columna.
 *    Acá no alcanza: esta lámina tiene reglas DISCONTINUAS —la de y=276 es una
 *    línea de guiones, el filo inferior de la tarjeta del panel 05 se apaga a la
 *    mitad, y las reglas de y=298 y y=310 cruzan el emblema del árbol— y un
 *    rectángulo uniforme las aplana. Se leen fila por fila (o columna por
 *    columna) con el mismo criterio que un código de barras: tramos de brillo
 *    parecido, altura exacta de un píxel. Es exacto por construcción y encima
 *    repinta con el valor real los píxeles donde una regla cruza un organismo.
 *
 *  · ORGANISMOS POR CAPAS, igual que en t01-04: emblema del árbol, disco SCAN,
 *    disco ISOLATE, los dos sellos de contención y el sello hexagonal
 *    KODEX-∞ van con seis umbrales apilados, del halo al núcleo.
 *
 *  · COLOR POR PIEZA, MEDIDO. Esta columna tiene seis paletas —rojo de titular,
 *    gris de ficha, blanco del logotipo, rojo sangre del sello, cian de ISOLATE
 *    y verde de la flecha— y ninguna está elegida a ojo: el tono sale del
 *    promedio RGB de la tinta real de la ventana, reescalado a la luminancia
 *    que pidió el ajuste.
 *
 * La retícula punteada de fondo NO se modela: medida, sus líneas valen 1-2 de
 * luminancia (percentil 30 sobre el cuerpo del panel), o sea menos de un 0,1 %
 * de diferencia sobre el bloque entero. Modelarla sería inventar precisión.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { PNG } from "pngjs";
import sharp from "sharp";
import { vectorize, ColorMode, PathSimplifyMode, Hierarchical } from "@neplex/vectorizer";

const SLUG = "t01-05-specimen-skull";
const REF = `reference/canon/${SLUG}.png`;
const TMP = "scripts/lamina/out/_t0105_izq";
const DESTINO = "src/components/kodex/lamina/t01-05/arte-izq.ts";

/* Origen de la caja del bloque: left:4px top:88px. Todo lo que sale de acá
   está en el sistema del componente, no en el del póster. */
const DX = 4;
const DY = 88;

const img = PNG.sync.read(readFileSync(REF));
const { width: W, data } = img;
const lum = (x, y) => { const i = (y * W + x) * 4; return (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8; };
const rgbAt = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };

mkdirSync(TMP, { recursive: true });

// ── trazado ────────────────────────────────────────────────────────────────

/**
 * Traza una banda: corta por columnas con tinta, recorta cada trozo a su alto
 * real y lo vectoriza. Recortar al alto real importa: centrar mal un glifo lo
 * corre en la lámina y el diff lo castiga aunque el dibujo esté perfecto.
 */
async function trazarBanda([y0, y1], [x0, x1], umbral, { hueco = 2, escala = 8, mota = 6, precision = 2 } = {}) {
  const celdas = [];
  let run = null;
  for (let x = Math.max(0, x0); x <= Math.min(W - 1, x1); x++) {
    let n = 0;
    for (let y = y0; y <= y1; y++) if (lum(x, y) > umbral) n++;
    if (n > 0) run = run ? [run[0], x] : [x, x];
    else if (run && x - run[1] > hueco) { celdas.push(run); run = null; }
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
      .resize({ width: c.w * escala, height: c.h * escala, kernel: "nearest" })
      .greyscale()
      .threshold(umbral)
      .negate() // vtracer binario traza lo OSCURO; acá la tinta es lo claro
      .png()
      .toBuffer();

    const svg = await vectorize(bin, {
      colorMode: ColorMode.Binary,
      hierarchical: Hierarchical.Stacked,
      filterSpeckle: mota,
      colorPrecision: 6,
      layerDifference: 16,
      mode: PathSimplifyMode.Spline,
      cornerThreshold: 60,
      lengthThreshold: 4,
      maxIterations: 10,
      spliceThreshold: 45,
      pathPrecision: precision,
    });

    /* Cada path trae su propio transform="translate(..)". Perderlo desarma el
       glifo: la contraforma de la D queda fuera de sitio y la letra sale
       maciza. Se guarda el par. */
    const d = [...svg.matchAll(/<path d="([^"]+)"(?:[^>]*transform="([^"]+)")?/g)].map((m) => [m[1], m[2] ?? ""]);
    if (d.length) glifos.push({ x: c.x - DX, y: c.y - DY, w: c.w, h: c.h, vw: c.w * escala, vh: c.h * escala, d });
  }
  return glifos;
}

const trazar = async (bandas, xr, umbral, opc) =>
  (await Promise.all(bandas.map((b) => trazarBanda(b, xr, umbral, opc)))).flat();

// ── medición ───────────────────────────────────────────────────────────────

/** Ventana que cubre todas las bandas de una pieza, en coordenadas del póster. */
const ventana = (bandas, [x0, x1]) => ({
  x0, x1,
  y0: Math.min(...bandas.map((b) => b[0])),
  y1: Math.max(...bandas.map((b) => b[1])),
});

/** Rasteriza las capas sobre negro y devuelve la máscara de cada una. */
async function mascaras(capas, v) {
  const w = v.x1 - v.x0 + 1, h = v.y1 - v.y0 + 1;
  const out = [];
  for (const glifos of capas) {
    const cuerpo = glifos.map((g) =>
      `<svg x="${g.x + DX - v.x0}" y="${g.y + DY - v.y0}" width="${g.w}" height="${g.h}" viewBox="0 0 ${g.vw} ${g.vh}" preserveAspectRatio="none">` +
      g.d.map(([d, tr]) => `<path d="${d}"${tr ? ` transform="${tr}"` : ""} fill="#fff"/>`).join("") + `</svg>`
    ).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#000"/>${cuerpo}</svg>`;
    out.push(await sharp(Buffer.from(svg)).greyscale().raw().toBuffer());
  }
  return { m: out, w, h };
}

/** Error absoluto medio de una combinación de grises contra la referencia. */
function error(ms, grises, v) {
  const { m, w, h } = ms;
  let e = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    let val = 0;
    // Las capas van de umbral bajo a alto y son anidadas: la de arriba manda.
    for (let k = 0; k < m.length; k++) if (m[k][i] > 127) val = grises[k];
    e += Math.abs(val - lum(v.x0 + x, v.y0 + y));
  }
  return e / (w * h);
}

/** Descenso por coordenadas sobre los grises de las capas. */
function ajustarGrises(ms, v) {
  const n = ms.m.length;
  const g = new Array(n).fill(120);
  let mae = error(ms, g, v);
  for (let vuelta = 0; vuelta < 4; vuelta++) {
    for (let k = 0; k < n; k++) {
      let mejor = g[k], mejorE = mae;
      for (let cand = 15; cand <= 245; cand += 5) {
        const p = g.slice(); p[k] = cand;
        const e = error(ms, p, v);
        if (e < mejorE) { mejorE = e; mejor = cand; }
      }
      g[k] = mejor; mae = mejorE;
    }
  }
  return { grises: g, mae };
}

/** Tono medido: promedio RGB de la tinta real de la ventana, reescalado a la
 *  luminancia que pidió el ajuste. Nadie elige un hex. */
function tono(v, gris, piso) {
  let s = [0, 0, 0], n = 0;
  for (let y = v.y0; y <= v.y1; y++) for (let x = v.x0; x <= v.x1; x++) {
    if (lum(x, y) > piso) { const p = rgbAt(x, y); s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; n++; }
  }
  if (!n) return "#000000";
  const m = s.map((q) => q / n);
  const L = (m[0] * 77 + m[1] * 150 + m[2] * 29) / 256;
  const k = L > 0 ? gris / L : 0;
  return "#" + m.map((q) => Math.max(0, Math.min(255, Math.round(q * k))).toString(16).padStart(2, "0")).join("");
}

// ── marcos y reglas: leídos, no ajustados ──────────────────────────────────

/**
 * Una tira es una regla del póster leída a lo largo, con altura (o ancho) de
 * un píxel exacto y tramos de brillo parecido. Es el criterio del código de
 * barras aplicado al chrome, y acá hace falta de verdad:
 *
 *  · la regla de y=276 es una línea de GUIONES (31-44, 53-70, 81-98, 106-113,
 *    119-272): un rectángulo uniforme le inventa 40 px de tinta que no están;
 *  · el filo inferior de la tarjeta del panel 05 llega entero hasta x=131 y
 *    después se apaga;
 *  · las reglas de y=298 y y=310 cruzan el emblema del árbol, y leerlas repinta
 *    esos píxeles con el valor real por encima del trazo vectorial;
 *  · los filos de dos filas —y=131·132, y=573·574— no comparten brillo (10 y
 *    34, 10 y 20). Promediarlos en un rectángulo de 1,5 px de alto deja las dos
 *    filas mal; leerlas por separado deja las dos bien.
 *
 * El brillo se guarda SIEMPRE como RGB medido y no como luminancia. No es un
 * lujo: la regla bajo el logotipo (y=187·188), el marco de la caja THREAT LEVEL
 * y el de la caja del sello son ROJOS, y como gris salen plomizos encima del
 * organismo que envuelven, que sí es rojo.
 */
function tira(eje, pos, a, b, { piso = 3, salto = 3, color = true } = {}) {
  const n = b - a + 1;
  const cel = [];
  for (let i = 0; i < n; i++) {
    const x = eje === "h" ? a + i : pos;
    const y = eje === "h" ? pos : a + i;
    cel.push({ v: lum(x, y), rgb: rgbAt(x, y) });
  }
  const tramos = [];
  let i = 0;
  while (i < n) {
    let j = i;
    while (j + 1 < n && Math.abs(cel[j + 1].v - cel[i].v) <= salto) j++;
    const trozo = cel.slice(i, j + 1);
    const v = Math.round(trozo.reduce((s, c) => s + c.v, 0) / trozo.length);
    if (v > piso) {
      const o = eje === "h" ? DX : DY;
      if (color) {
        const m = [0, 1, 2].map((k) => Math.round(trozo.reduce((s, c) => s + c.rgb[k], 0) / trozo.length));
        tramos.push([a + i - o, j - i + 1, m[0], m[1], m[2]]);
      } else tramos.push([a + i - o, j - i + 1, v]);
    }
    i = j + 1;
  }
  return { eje, p: pos - (eje === "h" ? DY : DX), tramos, color };
}

/**
 * Reglas horizontales: [fila del póster, x0, x1, opciones].
 *
 * Los rangos salen de medir los tramos de tinta de cada fila con
 * scripts/lamina/_t0105_izq_extent.mjs, no de mirarlas. Las filas 91·92, 101·102,
 * 586·587, 595 y 858·859 cruzan la lámina entera —se comprobó a x=1664— y acá
 * va sólo el trozo que cae en esta caja.
 */
const REGLAS_H = [
  [91, 200, 298], [92, 16, 298],                       // remate de la cabecera
  [101, 4, 298], [102, 4, 298],                        // filo superior de la columna
  [131, 4, 298], [132, 4, 298],                        // filo superior de la ficha
  [134, 16, 60], [135, 16, 60],                        // lengüeta del canto izquierdo
  [187, 16, 298], [188, 16, 298],                      // regla roja bajo el logotipo
  [276, 26, 278],                                      // línea de guiones bajo ORIGIN
  [298, 26, 278], [299, 26, 278],                      // divisoria bajo STATUS
  [310, 26, 136], [311, 26, 136], [312, 26, 136],      // filo superior de THREAT LEVEL
  [397, 26, 136], [398, 26, 136],                      // filo inferior de THREAT LEVEL
  [408, 4, 298], [409, 4, 298], [410, 4, 298],         // filo superior de IDENTITY ANCHORS
  [433, 26, 278], [434, 26, 278],                      // regla bajo el rótulo
  [521, 26, 278], [522, 26, 278],                      // regla sobre CONTAINMENT
  [573, 4, 298], [574, 4, 298],                        // filo inferior de IDENTITY ANCHORS
  [586, 4, 298], [587, 4, 298],                        // filo inferior de la ficha
  [595, 4, 298],                                       // cierre de la banda superior
  [602, 12, 60], [603, 12, 60],                        // lengüeta del rótulo 05
  [622, 4, 298], [623, 4, 298],                        // regla bajo el rótulo 05
  [683, 12, 152], [684, 12, 80],                       // filo inferior de la tarjeta 05
  [696, 4, 298], [697, 4, 298], [698, 4, 298],         // filo inferior del panel 05
  [702, 4, 254], [703, 4, 254], [704, 4, 254],         // filo superior del panel 06
  [724, 4, 298], [725, 4, 298], [726, 4, 298],         // regla bajo el rótulo 06
  [735, 4, 298], [736, 4, 298],                        // filo superior de las cajas del sello
  [836, 4, 298], [837, 4, 298], [838, 4, 298],         // filo inferior de esas cajas
  [844, 4, 298], [845, 4, 298],                        // filo inferior del panel 06
  [858, 4, 298], [859, 4, 298],                        // cierre de la banda de bloques
];

/**
 * Reglas verticales: [columna del póster, y0, y1].
 *
 * El canto izquierdo del póster son DOS líneas (x=6 y x=8) con un valle entre
 * medio, no un borde de 2 px: leídas por separado quedan las dos bien. La
 * cabecera abre el canto y el pie lo cierra; esta franja es de este bloque.
 */
const REGLAS_V = [
  [6, 88, 865], [7, 88, 865], [8, 88, 865], [9, 88, 865],   // canto izquierdo del póster
  [20, 92, 860], [21, 92, 860],                             // canto izquierdo de la columna
  [31, 305, 402], [32, 305, 402],                           // caja THREAT LEVEL, izquierda
  [129, 305, 402], [130, 305, 402],                         // caja THREAT LEVEL, derecha
  [146, 620, 686], [147, 620, 686],                         // canto derecho de la tarjeta 05
  [31, 733, 840], [32, 733, 840],                           // caja del sello, izquierda
  [223, 733, 840], [224, 733, 840],                         // caja del sello, derecha
  [235, 733, 840], [236, 733, 840],                         // caja de la firma, izquierda
  [189, 524, 578],                                          // divisoria de CONTAINMENT
  [283, 128, 578], [284, 128, 578],                         // canto derecho de la ficha
  [297, 98, 590], [298, 98, 590],                           // canto derecho de la columna
];

// ── piezas ─────────────────────────────────────────────────────────────────
/**
 * [nombre, bandas, rango x, umbrales, opciones].
 *
 * Con tres umbrales la pieza es tipografía (halo del antialias + cuerpo);
 * con seis es un organismo. Todo en coordenadas del PÓSTER.
 *
 * Las piezas de la columna derecha de los paneles 05 y 06 se trazan HASTA
 * x=308, veinte píxeles más allá del corte del bloque, y las recorta el
 * overflow de la caja. Cortar la ventana justo en x=298 partiría glifos al
 * medio y el trazador los deformaría; recortar el dibujo ya trazado corta en
 * el píxel exacto. Lo que quede a la derecha del corte es de Centro.
 */
const PIEZAS = [
  // ── 01. SUBJECT CLASSIFICATION ──────────────────────────────────────────
  ["p01Num",     [[112, 125]], [26, 49],   [14, 30, 55]],
  ["p01Titulo",  [[112, 125]], [50, 210],  [16, 34, 60]],
  ["p01Marca",   [[143, 183]], [26, 252],  [18, 40, 75, 120, 165]],
  ["p01Subject", [[193, 220]], [26, 272],  [14, 30, 55, 90]],
  ["p01Ficha",   [[228, 240], [245, 257], [262, 274], [279, 292]], [26, 222], [14, 30, 55]],
  ["p01Threat",  [[314, 329]], [36, 127],  [12, 26, 46]],
  ["p01C4",      [[335, 378]], [36, 127],  [12, 26, 46, 78], { hueco: 8 }],
  ["p01Extremo", [[380, 394]], [34, 127],  [11, 24, 42]],
  ["p01Emblema", [[300, 409]], [149, 277], [10, 20, 34, 55, 88, 135], { hueco: 130, escala: 5, mota: 3, precision: 1 }],
  ["p01IdRot",   [[415, 430]], [34, 278],  [14, 30, 55], { hueco: 8 }],
  ["p01Filas",   [[438, 451], [451, 464], [464, 477], [477, 491], [491, 504], [504, 517]], [34, 212], [14, 30, 55]],
  ["p01Contain", [[526, 539]], [34, 186],  [12, 26, 46]],
  ["p01Nota",    [[540, 554], [554, 568]], [34, 186], [14, 30, 55]],
  ["p01Sellos",  [[528, 570]], [196, 278], [9, 18, 31, 50, 80, 125], { hueco: 20, escala: 6, mota: 3, precision: 1 }],

  // ── 05. MOTION & SCAN PROTOCOLS (mitad izquierda) ───────────────────────
  ["p05Num",     [[605, 619]], [26, 49],   [14, 30, 55]],
  ["p05Titulo",  [[605, 619]], [50, 210],  [16, 34, 60]],
  ["p05Scan",    [[625, 681]], [22, 77],   [10, 20, 34, 55, 88, 135], { hueco: 60, escala: 6, mota: 3, precision: 1 }],
  ["p05ScanRot", [[631, 647]], [78, 152],  [14, 30, 55]],
  ["p05ScanTxt", [[647, 661], [661, 677]], [78, 152], [13, 28, 50]],
  ["p05Flecha",  [[643, 664]], [150, 175], [10, 22, 40, 65]],
  ["p05Isolate", [[623, 681]], [176, 234], [10, 20, 34, 55, 88, 135], { hueco: 62, escala: 6, mota: 3, precision: 1 }],
  ["p05IsoRot",  [[631, 647]], [237, 308], [14, 30, 55]],
  ["p05IsoTxt",  [[647, 661], [661, 677]], [237, 308], [13, 28, 50]],

  // ── 06. AUTHENTICATION / SEAL (mitad izquierda) ─────────────────────────
  ["p06Num",     [[707, 721]], [26, 49],   [14, 30, 55]],
  ["p06Titulo",  [[707, 721]], [50, 205],  [16, 34, 60]],
  ["p06Sello",   [[738, 835]], [34, 221],  [9, 18, 31, 50, 80, 125], { hueco: 190, escala: 5, mota: 3, precision: 1 }],
  ["p06FirmaRot",[[740, 755]], [240, 308], [12, 26, 46]],
  ["p06Firma",   [[762, 776], [779, 793], [796, 811], [813, 828]], [240, 308], [14, 30, 55]],
];

const UMBRALES = [10, 13, 16, 20, 26, 30, 34, 40, 50, 60, 75, 95];

if (process.argv.includes("--cajas")) {
  /* Verificación de encuadre: imprime la holgura de tinta REAL de cada ventana.
     Una banda mal puesta no falla, sale fea: si la holgura es 0 la pieza está
     tocando el borde de su ventana y probablemente se comió la de al lado. */
  for (const [nombre, bandas, xr] of PIEZAS) {
    const v = ventana(bandas, xr);
    let ax = 1e9, bx = -1, ay = 1e9, by = -1, n = 0;
    for (let y = v.y0; y <= v.y1; y++) for (let x = v.x0; x <= v.x1; x++) if (lum(x, y) > 20) {
      n++; if (x < ax) ax = x; if (x > bx) bx = x; if (y < ay) ay = y; if (y > by) by = y;
    }
    const holgura = n ? `x +${ax - v.x0}/-${v.x1 - bx}  y +${ay - v.y0}/-${v.y1 - by}` : "SIN TINTA";
    console.log(nombre.padEnd(12), `ventana ${v.x0}..${v.x1} × ${v.y0}..${v.y1}`.padEnd(30), holgura);
  }
  process.exit(0);
}

if (process.argv.includes("--barrer")) {
  const soloA = process.argv.indexOf("--pieza");
  const filtro = soloA > -1 ? process.argv[soloA + 1] : null;
  for (const [nombre, bandas, xr, us, opc] of PIEZAS) {
    if (filtro && nombre !== filtro) continue;
    if (us.length > 1) { console.log(nombre.padEnd(12), "capas — el barrido lineal no aplica"); continue; }
    const v = ventana(bandas, xr);
    const filas = [];
    for (const u of UMBRALES) {
      const g = await trazar(bandas, xr, u, opc);
      if (!g.length) { filas.push({ u, mae: Infinity, grises: [0], n: 0 }); continue; }
      const r = ajustarGrises(await mascaras([g], v), v);
      filas.push({ u, ...r, n: g.length });
    }
    filas.sort((a, b) => a.mae - b.mae);
    console.log(nombre.padEnd(12), filas.slice(0, 4).map((f) => `u${f.u}/g${f.grises[0]}=${f.mae.toFixed(2)}(${f.n})`).join("  "));
  }
  rmSync(TMP, { recursive: true, force: true });
  process.exit(0);
}

const arte = {};
const informe = [];
for (const [nombre, bandas, xr, us, opc] of PIEZAS) {
  const v = ventana(bandas, xr);
  const capas = [];
  for (const u of us) capas.push(await trazar(bandas, xr, u, opc));
  const vivas = capas.filter((c) => c.length);
  if (!vivas.length) { console.warn("VACÍA", nombre); continue; }
  const { grises, mae } = ajustarGrises(await mascaras(vivas, v), v);
  arte[nombre] = vivas.map((glifos, i) => ({ c: tono(v, grises[i], us[Math.min(i, us.length - 1)]), g: glifos }));
  const nodos = vivas.reduce((a, c) => a + c.reduce((b, g) => b + g.d.length, 0), 0);
  informe.push(
    ` *   ${nombre.padEnd(12)} ${us.join("/").padEnd(22)} ${grises.join("/").padEnd(24)} ${mae.toFixed(2).padStart(6)}   ${String(nodos).padStart(5)}`
  );
  process.stdout.write(`${nombre} `);
}
console.log();

arte.reglas = [
  ...REGLAS_H.map(([y, a, b, o]) => tira("h", y, a, b, o)),
  ...REGLAS_V.map(([x, a, b, o]) => tira("v", x, a, b, o)),
].filter((t) => t.tramos.length);

const cab = `/**
 * t01-05 · BLOQUE IZQUIERDA · ARTE FIJA TRAZADA — NO SE EDITA A MANO.
 *
 * Generado desde reference/canon/t01-05-specimen-skull.png con
 * scripts/lamina/arte-t01-05-izq.mjs. Las coordenadas están en el sistema de
 * la caja del bloque (left:4 top:88), o sea corridas −4,−88 respecto del
 * póster.
 *
 * Ningún relleno de acá está elegido a ojo. Cada pieza se rasteriza sobre
 * negro y un descenso por coordenadas busca la luminancia —o las seis, si es
 * un organismo por capas— que menos error absoluto medio deja contra el
 * original. El TONO sale del promedio RGB de la tinta real de esa ventana,
 * reescalado a esa luminancia.
 *
 *   pieza        umbrales               rellenos                    MAE   nodos
${informe.join("\n")}
 *
 * \`reglas\` es el chrome: cada filo del póster leído a lo largo, con altura de
 * un píxel exacto y tramos de brillo medido. No son rectángulos ajustados —esta
 * lámina tiene reglas de guiones, filos que se apagan a la mitad y reglas que
 * cruzan el emblema del árbol, y un rectángulo uniforme las aplana.
 *
 * Las cifras del póster son ficción: el componente las declara con
 * data-symbolic y su texto literal en aria-label. No van como <text> real
 * porque a 8 px de versal la mono del póster no existe en ninguna máquina
 * —medido en la lámina 1, el mismo rótulo dejaba 8,83 % como texto contra
 * 2,71 % trazado.
 */
export type Glifo = { x: number; y: number; w: number; h: number; vw: number; vh: number; d: [string, string][] };
export type Capa = { c: string; g: Glifo[] };
export type Tira = { eje: "h" | "v"; p: number; tramos: number[][]; color: boolean };
`;

const tipo = (k) => (k === "reglas" ? "Tira[]" : "Capa[]");
const cuerpo = Object.entries(arte)
  .map(([k, v]) => `export const ${k} = ${JSON.stringify(v)} as unknown as ${tipo(k)};`)
  .join("\n\n");

writeFileSync(DESTINO, cab + "\n" + cuerpo + "\n");
rmSync(TMP, { recursive: true, force: true });
console.log("ok →", DESTINO);
