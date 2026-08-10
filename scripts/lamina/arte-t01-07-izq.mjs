#!/usr/bin/env node
/**
 * KODEX-∞ · t01-07 COSMOLOGY CORE · ARTE FIJA DEL BLOQUE IZQUIERDA
 *
 * Genera src/components/kodex/lamina/t01-07/arte-izq.ts trazando desde
 * reference/canon/t01-07-cosmology-core.png todo lo fijo de los paneles
 * 01 NAVIGATION PANEL, 02 SCENE STATES y 03 MOTION NOTES. El .ts NO se edita a
 * mano: se corre esto.
 *
 *   node scripts/lamina/arte-t01-07-izq.mjs            # genera arte-izq.ts
 *   node scripts/lamina/arte-t01-07-izq.mjs --cajas    # verifica el encuadre
 *   node scripts/lamina/arte-t01-07-izq.mjs --barrer   # barre umbrales
 *
 * Escribe en archivo y temporal propios: la lámina la arman cinco agentes a la
 * vez y `scripts/lamina/glyphs/<slug>/` es un cajón único que ya se pisaron.
 *
 * Hereda el método de t01-04 (trazado por bandas, capas por umbral, relleno por
 * descenso de coordenadas, tono medido) y le agrega una pieza que esa lámina no
 * necesitaba:
 *
 *   RETÍCULA LEÍDA, NO RESUELTA. t01-04 resolvía cada filo del póster a mano —
 *   posición, ancho y luminancia de un rectángulo por regla— y son 40 números
 *   escritos uno por uno. Acá los marcos son 21 reglas horizontales y 8
 *   verticales, muchas de ellas de color (los cuatro marcos de SCENE STATES son
 *   magenta, cian, violeta y fucsia, cada uno distinto). Se leen igual que un
 *   código de barras pero en las dos orientaciones: se recorre la tira línea por
 *   línea, se comprime por tramos de color parecido y se emite el RGB MEDIDO.
 *   Es exacto por construcción y no hay ningún número elegido a ojo. El corte de
 *   cada tira sale de las sondas de _t0107_izq_probe.mjs, no de mirarlas.
 *
 * Los organismos —cuatro miniaturas del mapa orbital y cuatro diagramas de
 * movimiento— SÍ se trazan con vtracer por capas. Leerlos línea por línea daría
 * 0 % de error y sería hacer trampa: eso es un mapa de bits escrito como SVG.
 * La lectura línea por línea se reserva a lo que es de verdad unidimensional
 * (reglas, marcos, códigos de barras), que es donde el canon del banco la
 * autoriza.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { PNG } from "pngjs";
import sharp from "sharp";
import { vectorize, ColorMode, PathSimplifyMode, Hierarchical } from "@neplex/vectorizer";

const SLUG = "t01-07-cosmology-core";
const REF = `reference/canon/${SLUG}.png`;
const TMP = "scripts/lamina/out/_t0107_izq";
const DESTINO = "src/components/kodex/lamina/t01-07/arte-izq.ts";

/* Origen de la caja del bloque: left:4px top:88px. Todo lo que sale de acá está
   en el sistema del componente, no en el del póster. */
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
 * real y lo vectoriza. Recortar al alto real importa —centrar mal un glifo lo
 * corre en la lámina y el diff lo castiga aunque el dibujo esté perfecto.
 *
 * `hueco` es el salto de columnas vacías que separa dos glifos. En tipografía
 * 2 px alcanza; en un organismo hay que subirlo o la masa se parte en cien SVG
 * anidados que no comparten viewBox y se deforman cada uno por su lado.
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
      for (let cand = 15; cand <= 250; cand += 5) {
        const p = g.slice(); p[k] = cand;
        const e = error(ms, p, v);
        if (e < mejorE) { mejorE = e; mejor = cand; }
      }
      g[k] = mejor; mae = mejorE;
    }
  }
  return { grises: g, mae };
}

/** Tono medido: promedio RGB de la tinta real de la ventana por encima de
 *  `piso`, reescalado a la luminancia que pidió el barrido. Nadie elige un hex. */
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

// ── retícula: tiras leídas línea por línea ─────────────────────────────────

/**
 * Lee una tira de marco. Es el mismo criterio del código de barras de t01-04
 * —una función de una variable, se recorre y se comprime por tramos— pero en
 * las dos orientaciones y guardando el RGB medido, porque acá la mitad de los
 * filos son de color.
 *
 *   eje "h": cada FILA de la tira se comprime a lo largo de x.
 *   eje "v": cada COLUMNA se comprime a lo largo de y.
 *
 * Los tramos por debajo de `piso` se descartan, así que una tira vertical que
 * cruza cuatro paneles con aire entre ellos sale partida sola: no hay que
 * decirle dónde empieza y termina cada canto.
 */
function tira(x0, x1, y0, y1, { eje = "h", piso = 3, salto = 2 } = {}) {
  const out = [];
  const linea = (n) => (eje === "h" ? y0 + n : x0 + n);
  const largo = eje === "h" ? x1 - x0 + 1 : y1 - y0 + 1;
  const lineas = eje === "h" ? y1 - y0 + 1 : x1 - x0 + 1;
  for (let n = 0; n < lineas; n++) {
    const L = linea(n);
    const px = [];
    for (let k = 0; k < largo; k++) {
      const [x, y] = eje === "h" ? [x0 + k, L] : [L, y0 + k];
      px.push({ v: lum(x, y), rgb: rgbAt(x, y) });
    }
    let i = 0;
    while (i < largo) {
      let j = i;
      while (j + 1 < largo && Math.abs(px[j + 1].v - px[i].v) <= salto) j++;
      const t = px.slice(i, j + 1);
      const v = t.reduce((a, b) => a + b.v, 0) / t.length;
      if (v > piso) {
        const m = [0, 1, 2].map((c) => Math.round(t.reduce((a, b) => a + b.rgb[c], 0) / t.length));
        const largoTramo = j - i + 1;
        out.push(
          eje === "h"
            ? [x0 + i - DX, L - DY, largoTramo, 1, m[0], m[1], m[2]]
            : [L - DX, y0 + i - DY, 1, largoTramo, m[0], m[1], m[2]]
        );
      }
      i = j + 1;
    }
  }
  return out;
}

// ── retícula del bloque ────────────────────────────────────────────────────
/**
 * Las 29 tiras del bloque, en coordenadas del PÓSTER. Cada corte sale de una
 * sonda de luminancia, no de mirar la lámina:
 *
 *  · las verticales llevan holgura de 2-3 columnas a cada lado porque un canto
 *    del póster reparte su tinta entre dos y tres columnas con brillos muy
 *    distintos (el canto derecho del panel 02 pica 41 en x=392 y 21 en x=393).
 *  · las horizontales van entre el contenido de arriba y el de abajo, nunca
 *    encima: si una tira toca un renglón de texto, el texto sale dibujado dos
 *    veces —una como marco y otra como glifo— y el bloque se ensucia.
 *  · las tiras que envuelven una miniatura se estrechan a 2-3 filas para no
 *    comerle el halo al organismo, que sí va trazado.
 */
const TIRAS = [
  // verticales
  ["vBordeIzq", [4, 7, 88, 866, "v"]],       // canto izquierdo del póster
  ["vSeparador", [398, 407, 88, 866, "v"]],  // corte entre este bloque y el centro
  // El canto izquierdo va en tres tramos y no en uno: los rótulos «01.», «02.»
  // y «03.» arrancan en x=13, la misma columna que el filo del panel 02, y una
  // tira continua se comería sus dos primeras columnas con el tono del marco.
  ["vPanIzq1", [9, 14, 126, 352, "v"]],
  ["vPanIzq2", [9, 14, 378, 585, "v"]],
  ["vPanIzq3", [9, 14, 616, 834, "v"]],
  ["vPanDer", [390, 397, 100, 866, "v"]],    // cantos derechos
  ["vP01Med", [205, 209, 126, 352, "v"]],    // divisoria de columnas del panel 01
  ["vP02Med", [172, 175, 378, 585, "v"]],    // divisoria glosa/miniatura de SCENE STATES
  ["vP03Med", [199, 204, 616, 834, "v"]],    // divisoria de celdas de MOTION NOTES
  ["vCabecera", [96, 102, 88, 102, "v"]],    // resto del marco de la cabecera

  // horizontales
  ["hCabecera", [13, 92, 88, 97, "h"]],      // filo inferior del chip rosa de la cabecera
  ["hBanda0", [4, 405, 102, 106, "h"]],
  ["hP01Sup", [9, 397, 126, 131, "h"]],
  ["hP01Rot", [9, 397, 148, 153, "h"]],      // bajo COORDINATE READOUT y NAV STATUS
  ["hP01Med", [9, 397, 225, 230, "h"]],
  ["hP01Rot2", [9, 397, 248, 254, "h"]],     // bajo ORBITAL REFERENCE y LEGEND
  ["hP01Inf", [9, 397, 346, 352, "h"]],
  ["hBanda1", [4, 405, 353, 358, "h"]],
  ["hMapSup", [9, 397, 378, 381, "h"]],
  ["hMapInf", [9, 397, 427, 429, "h"]],
  ["hOrbSup", [9, 397, 431, 434, "h"]],
  ["hOrbInf", [9, 397, 479, 481, "h"]],
  ["hAliSup", [9, 397, 483, 486, "h"]],
  ["hAliInf", [9, 397, 530, 533, "h"]],
  ["hRevSup", [9, 397, 535, 537, "h"]],
  ["hRevInf", [9, 397, 582, 584, "h"]],
  ["hBanda2", [4, 405, 586, 591, "h"]],
  ["hBanda3", [4, 405, 592, 597, "h"]],
  ["hP03Sup", [9, 397, 616, 622, "h"]],
  ["hP03Med", [9, 397, 719, 724, "h"]],
  ["hP03Inf", [9, 397, 829, 835, "h"]],
  ["hBanda4", [4, 405, 860, 866, "h"]],
];

// ── piezas trazadas ────────────────────────────────────────────────────────
/**
 * [nombre, bandas, rango x, umbral(es), opciones].
 * Con un umbral la pieza es plana (tipografía, iconos de línea); con seis es un
 * organismo por capas. Todo en coordenadas del PÓSTER.
 */
const LEG = [[253, 266], [267, 278], [279, 290], [291, 303], [304, 315], [316, 328], [329, 341]];
const ORG = [10, 17, 28, 45, 70, 105, 155, 205];
const ORGOPC = { hueco: 400, escala: 5, mota: 3, precision: 1 };

const PIEZAS = [
  // ── 01. NAVIGATION PANEL ────────────────────────────────────────────────
  ["p01Titulo", [[109, 124]], [12, 200], [16, 34, 60]],
  ["p01TitA", [[134, 147]], [16, 204], [20, 44, 80]],
  ["p01TitB", [[134, 147]], [211, 390], [20, 44, 80]],
  ["p01Coord", [[159, 178], [179, 197], [198, 216]], [16, 204], [16, 34, 60]],
  ["p01Nav", [[155, 167], [168, 179], [180, 192], [193, 205], [206, 218]], [211, 390], [14, 30, 55]],
  ["p01TitC", [[234, 247]], [16, 204], [20, 44, 80]],
  ["p01TitD", [[234, 247]], [211, 390], [20, 44, 80]],
  ["p01Orb", [[256, 272], [273, 289], [290, 307], [308, 325], [326, 343]], [16, 204], [16, 34, 60]],
  ["p01LegTxt", LEG, [242, 390], [14, 30, 55]],
  // Los siete iconos de la leyenda son siete tintas distintas —fucsia, cian,
  // violeta, magenta, cian, azul, rosa— y por eso son siete piezas: una sola
  // promediaría los seis tonos en un gris malva que no está en el póster.
  ["p01Ico1", [LEG[0]], [220, 240], [14, 30, 55, 90]],
  ["p01Ico2", [LEG[1]], [220, 240], [14, 30, 55, 90]],
  ["p01Ico3", [LEG[2]], [220, 240], [14, 30, 55, 90]],
  ["p01Ico4", [LEG[3]], [220, 240], [14, 30, 55, 90]],
  ["p01Ico5", [LEG[4]], [220, 240], [14, 30, 55, 90]],
  ["p01Ico6", [LEG[5]], [220, 240], [14, 30, 55, 90]],
  ["p01Ico7", [LEG[6]], [220, 240], [14, 30, 55, 90]],

  // ── 02. SCENE STATES ────────────────────────────────────────────────────
  ["p02Titulo", [[360, 375]], [12, 200], [16, 34, 60]],
  // Nombre y regleta de cada estado van juntos: comparten tinta y tono.
  ["p02NomMap", [[394, 411], [412, 421]], [16, 82], [16, 36, 64]],
  ["p02NomOrb", [[445, 462], [463, 474]], [16, 82], [16, 36, 64]],
  ["p02NomAli", [[497, 514], [515, 526]], [16, 82], [16, 36, 64]],
  ["p02NomRev", [[548, 566], [567, 577]], [16, 82], [16, 36, 64]],
  ["p02Glosa", [
    [388, 399], [400, 410], [411, 422],
    [439, 450], [451, 462], [463, 474],
    [491, 502], [503, 514], [515, 526],
    [542, 553], [554, 565], [566, 577],
  ], [84, 171], [16, 34, 60]],
  // Las cuatro miniaturas del mapa orbital: son el organismo de la lámina y van
  // por seis capas. Aplanarlas mejora el número y borra el campo de estrellas.
  ["p02ArtMap", [[382, 426]], [176, 389], ORG, ORGOPC],
  ["p02ArtOrb", [[435, 478]], [176, 389], ORG, ORGOPC],
  ["p02ArtAli", [[487, 529]], [176, 389], ORG, ORGOPC],
  ["p02ArtRev", [[538, 581]], [176, 389], ORG, ORGOPC],

  // ── 03. MOTION NOTES ────────────────────────────────────────────────────
  ["p03Titulo", [[599, 614]], [12, 200], [16, 34, 60]],
  ["p03Nom1", [[626, 643]], [16, 100], [16, 36, 64]],
  ["p03Nom2", [[626, 643]], [210, 291], [16, 36, 64]],
  ["p03Nom3", [[731, 748]], [16, 100], [16, 36, 64]],
  ["p03Nom4", [[731, 748]], [210, 291], [16, 36, 64]],
  ["p03Txt1", [[651, 663], [664, 677], [678, 691], [692, 704]], [16, 100], [16, 34, 60]],
  ["p03Txt2", [[651, 663], [664, 677], [678, 691], [692, 704]], [210, 291], [16, 34, 60]],
  ["p03Txt3", [[754, 767], [768, 781], [782, 795], [796, 809]], [16, 100], [16, 34, 60]],
  ["p03Txt4", [[754, 767], [768, 781], [782, 795], [796, 809]], [210, 291], [16, 34, 60]],
  ["p03Dia1", [[623, 718]], [101, 198], ORG, ORGOPC],
  ["p03Dia2", [[623, 718]], [292, 389], ORG, ORGOPC],
  ["p03Dia3", [[726, 828]], [101, 198], ORG, ORGOPC],
  ["p03Dia4", [[726, 828]], [292, 389], ORG, ORGOPC],
];

const UMBRALES = [10, 14, 18, 22, 26, 30, 36, 44, 55, 70, 90];

if (process.argv.includes("--cajas")) {
  /* Verificación de encuadre: la caja de tinta REAL de cada ventana. Existe
     porque una banda mal puesta no falla, sale fea: en la primera vuelta la
     banda del nombre MAP se comía el primer renglón de glosa y la glosa salía
     con el tono rosa del nombre. */
  for (const [nombre, bandas, xr] of PIEZAS) {
    const v = ventana(bandas, xr);
    let ax = 1e9, bx = -1, ay = 1e9, by = -1, n = 0;
    for (let y = v.y0; y <= v.y1; y++) for (let x = v.x0; x <= v.x1; x++) if (lum(x, y) > 22) {
      n++; if (x < ax) ax = x; if (x > bx) bx = x; if (y < ay) ay = y; if (y > by) by = y;
    }
    const holgura = n ? `x +${ax - v.x0}/-${v.x1 - bx}  y +${ay - v.y0}/-${v.y1 - by}` : "SIN TINTA";
    console.log(nombre.padEnd(11), `ventana ${v.x0}..${v.x1} × ${v.y0}..${v.y1}`.padEnd(30), holgura);
  }
  for (const [nombre, [x0, x1, y0, y1, eje]] of TIRAS) {
    const t = tira(x0, x1, y0, y1, { eje });
    console.log(nombre.padEnd(11), `tira ${eje} ${x0}..${x1} × ${y0}..${y1}`.padEnd(30), `${t.length} tramos`);
  }
  process.exit(0);
}

if (process.argv.includes("--barrer")) {
  const soloA = process.argv.indexOf("--pieza");
  const filtro = soloA > -1 ? process.argv[soloA + 1] : null;
  for (const [nombre, bandas, xr, us, opc] of PIEZAS) {
    if (filtro && nombre !== filtro) continue;
    if (us.length > 1 && !filtro) { console.log(nombre.padEnd(11), "capas — el barrido lineal no aplica"); continue; }
    const v = ventana(bandas, xr);
    const filas = [];
    for (const u of UMBRALES) {
      const g = await trazar(bandas, xr, u, opc);
      if (!g.length) { filas.push({ u, mae: Infinity, grises: [0], n: 0 }); continue; }
      const r = ajustarGrises(await mascaras([g], v), v);
      filas.push({ u, ...r, n: g.length });
    }
    filas.sort((a, b) => a.mae - b.mae);
    console.log(nombre.padEnd(11), filas.slice(0, 4).map((f) => `u${f.u}/g${f.grises[0]}=${f.mae.toFixed(2)}(${f.n})`).join("  "));
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
    ` *   ${nombre.padEnd(11)} ${us.join("/").padEnd(18)} ${grises.join("/").padEnd(20)} ${mae.toFixed(2).padStart(6)}   ${String(nodos).padStart(5)}`
  );
  process.stdout.write(`${nombre} `);
}
console.log();

const reticula = {};
for (const [nombre, [x0, x1, y0, y1, eje]] of TIRAS) reticula[nombre] = tira(x0, x1, y0, y1, { eje });
const tramos = Object.values(reticula).reduce((a, t) => a + t.length, 0);

const cab = `/**
 * t01-07 · BLOQUE IZQUIERDA · ARTE FIJA TRAZADA — NO SE EDITA A MANO.
 *
 * Generado desde reference/canon/t01-07-cosmology-core.png con
 * scripts/lamina/arte-t01-07-izq.mjs. Las coordenadas están en el sistema de la
 * caja del bloque (left:4 top:88), o sea corridas −4,−88 respecto del póster.
 *
 * Ningún relleno de acá está elegido a ojo. Cada pieza se rasteriza sobre negro
 * y un descenso por coordenadas busca la luminancia —o las seis, si es un
 * organismo por capas— que menos error absoluto medio deja contra el original.
 * El TONO sale del promedio RGB de la tinta real de esa ventana, reescalado a
 * esa luminancia.
 *
 *   pieza       umbrales           rellenos                MAE   nodos
${informe.join("\n")}
 *
 * La RETÍCULA (${tramos} tramos en ${TIRAS.length} tiras) no se traza ni se resuelve: se lee
 * línea por línea con su RGB medido, igual que un código de barras pero en las
 * dos orientaciones. Los cuatro marcos de SCENE STATES son magenta, cian,
 * violeta y fucsia; un solo gris para todos aplanaría la lámina entera.
 */
export type Glifo = { x: number; y: number; w: number; h: number; vw: number; vh: number; d: [string, string][] };
export type Capa = { c: string; g: Glifo[] };
export type Tramo = [number, number, number, number, number, number, number];
`;

const cuerpo = [
  ...Object.entries(arte).map(([k, v]) => `export const ${k} = ${JSON.stringify(v)} as unknown as Capa[];`),
  `export const reticula = ${JSON.stringify(Object.values(reticula).flat())} as unknown as Tramo[];`,
].join("\n\n");

writeFileSync(DESTINO, cab + "\n" + cuerpo + "\n");
rmSync(TMP, { recursive: true, force: true });
console.log("ok →", DESTINO, `· ${tramos} tramos de retícula`);
