#!/usr/bin/env node
/**
 * KODEX-∞ · t01-05 SPECIMEN SKULL · ARTE FIJA DEL BLOQUE CENTRO
 *
 * Genera src/components/kodex/lamina/t01-05/arte-centro.ts trazando desde
 * reference/canon/t01-05-specimen-skull.png todo lo fijo que cae dentro de la
 * caja (299,88 · 642×778): el panel 02 entero, la mitad derecha de los paneles
 * 05 y 06, el panel 07 completo y el canto del 08.
 *
 *   node scripts/lamina/arte-t01-05-centro.mjs           # genera el .ts
 *   node scripts/lamina/arte-t01-05-centro.mjs --cajas   # verifica encuadres
 *   node scripts/lamina/arte-t01-05-centro.mjs --barrer [--pieza X]
 *
 * Escribe SOLO en arte-centro.ts y en su temporal propio. La lámina la arman
 * cinco agentes a la vez y el cajón compartido de glyphs/ ya se pisó una vez.
 *
 * Hereda el método de scripts/lamina/arte-t01-04-izq.mjs (bandas por pieza,
 * organismos por capas, descenso por coordenadas sobre los grises, tono medido)
 * y le suma tres cosas que esta lámina necesitaba:
 *
 *  1. FILTRO POR FAMILIA DE COLOR. El cráneo es rojo Y cian sobre el mismo
 *     píxel-espacio: la mandíbula y los pómulos son cian frío y el resto rojo.
 *     Trazado junto, el promedio RGB de la ventana da un violeta sucio que no
 *     está en ninguna parte del póster. Se traza dos veces, una por familia,
 *     con máscaras disjuntas (b > r+10 es cian, el resto es rojo), y cada una
 *     se ajusta su propia escalera de capas.
 *
 *  2. EXCLUSIONES. La ventana del organismo (306–775 × 104–586) contiene
 *     además el título, los tres rótulos, la columna de glifos rituales, el
 *     código y la regla. Sin recortarlos, esas piezas se trazarían dos veces
 *     —una con su tono y otra con el del organismo— y quedarían al doble de
 *     tinta. Cada pieza declara los rectángulos que le sacan de la máscara.
 *
 *  3. CAMPO. Los marcos y las reglas no se trazan ni se estiman: se LEEN por
 *     tramos horizontales de brillo igual, con su RGB medido. Es la misma
 *     lectura celda por celda que ya se usaba para el QR, aplicada a los filos.
 *     Un filo del póster reparte su tinta entre dos o tres filas y casi nunca
 *     por igual; escribirlos a mano como rectángulos de 1 px es lo que se hizo
 *     en la lámina 04 y costó una tarde de sondas.
 *
 * El QR se lee celda por celda por la razón de siempre: a resolución de módulo
 * las fronteras caen a mitad de píxel y dos rectángulos vecinos no suman su
 * cobertura.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { PNG } from "pngjs";
import sharp from "sharp";
import { vectorize, ColorMode, PathSimplifyMode, Hierarchical } from "@neplex/vectorizer";

const SLUG = "t01-05-specimen-skull";
const REF = `reference/canon/${SLUG}.png`;
const TMP = "scripts/lamina/out/_t0105_centro";
const DESTINO = "src/components/kodex/lamina/t01-05/arte-centro.ts";

/* Origen de la caja del bloque: left:299px top:88px. */
const DX = 299;
const DY = 88;

const img = PNG.sync.read(readFileSync(REF));
const { width: W, height: H, data } = img;
const idx = (x, y) => (y * W + x) * 4;
const lum = (x, y) => { const i = idx(x, y); return (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8; };
const rgbAt = (x, y) => { const i = idx(x, y); return [data[i], data[i + 1], data[i + 2]]; };

mkdirSync(TMP, { recursive: true });

// ── familias de color ──────────────────────────────────────────────────────
/**
 * Sólo el cráneo las necesita. El resto de las piezas se encuadra en ventanas
 * de un solo color y el promedio RGB de la ventana ya es el tono correcto.
 */
const FAMILIAS = {
  cian: (r, g, b) => b > r + 10 && g > r,
  rojo: (r, g, b) => !(b > r + 10 && g > r),
};

const dentro = (x, y, ex) => ex.some(([a, b, c, d]) => x >= a && x <= c && y >= b && y <= d);

// ── trazado ────────────────────────────────────────────────────────────────

/**
 * Traza una banda. Corta por columnas con tinta, recorta cada trozo a su alto
 * real —centrar mal un glifo lo corre en la lámina y el diff lo cobra aunque
 * el dibujo esté perfecto— y lo vectoriza.
 *
 * `hueco` es el salto de columnas vacías que separa dos piezas: 2 px alcanza
 * en tipografía; en un organismo hay que subirlo o la masa se parte en cien
 * SVG que no comparten viewBox y se deforman cada uno por su lado.
 */
async function trazarBanda([y0, y1], [x0, x1], umbral, opc = {}) {
  const { hueco = 2, escala = 8, mota = 6, precision = 2, fam = null, exc = [] } = opc;
  const fn = fam ? FAMILIAS[fam] : null;
  const tinta = (x, y) => {
    if (lum(x, y) <= umbral) return false;
    if (exc.length && dentro(x, y, exc)) return false;
    if (fn) { const [r, g, b] = rgbAt(x, y); return fn(r, g, b); }
    return true;
  };

  const celdas = [];
  let run = null;
  for (let x = Math.max(0, x0); x <= Math.min(W - 1, x1); x++) {
    let n = 0;
    for (let y = y0; y <= y1; y++) if (tinta(x, y)) n++;
    if (n > 0) run = run ? [run[0], x] : [x, x];
    else if (run && x - run[1] > hueco) { celdas.push(run); run = null; }
  }
  if (run) celdas.push(run);

  const glifos = [];
  for (const [cx0, cx1] of celdas) {
    let ty = y1, by = y0;
    for (let y = y0; y <= y1; y++) {
      for (let x = cx0; x <= cx1; x++) {
        if (tinta(x, y)) { if (y < ty) ty = y; if (y > by) by = y; break; }
      }
    }
    if (by < ty) continue;
    const c = { x: cx0, y: ty, w: cx1 - cx0 + 1, h: by - ty + 1 };

    /* La máscara se arma en JS y no con sharp.threshold(): hay que poder
       filtrar por familia y descontar exclusiones, y eso no es un umbral. */
    const raw = Buffer.alloc(c.w * c.h);
    for (let y = 0; y < c.h; y++)
      for (let x = 0; x < c.w; x++)
        raw[y * c.w + x] = tinta(c.x + x, c.y + y) ? 0 : 255; // vtracer binario traza lo OSCURO

    const bin = await sharp(raw, { raw: { width: c.w, height: c.h, channels: 1 } })
      .resize({ width: c.w * escala, height: c.h * escala, kernel: "nearest" })
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

    /* Cada path trae su transform="translate(..)". Perderlo desarma el glifo:
       la contraforma de la D queda fuera de sitio y la letra sale maciza. */
    const d = [...svg.matchAll(/<path d="([^"]+)"(?:[^>]*transform="([^"]+)")?/g)].map((m) => [m[1], m[2] ?? ""]);
    if (d.length) glifos.push({ x: c.x - DX, y: c.y - DY, w: c.w, h: c.h, vw: c.w * escala, vh: c.h * escala, d });
  }
  return glifos;
}

const trazar = async (bandas, xr, umbral, opc) =>
  (await Promise.all(bandas.map((b) => trazarBanda(b, xr, umbral, opc)))).flat();

// ── medición ───────────────────────────────────────────────────────────────

const ventana = (bandas, [x0, x1]) => ({
  x0, x1,
  y0: Math.min(...bandas.map((b) => b[0])),
  y1: Math.max(...bandas.map((b) => b[1])),
});

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

/**
 * Objetivo de una pieza en cada píxel de su ventana.
 *
 * Para una pieza normal es la luminancia del original. Para una pieza FILTRADA
 * POR FAMILIA es la luminancia sólo donde el píxel es de su familia, y 0 donde
 * no: la capa cian no tiene que tapar el rojo del pómulo, y medirla contra la
 * luminancia completa la castiga por tinta que no le toca. Sin esto el descenso
 * le subía los grises al cian para compensar el rojo ausente y el organismo
 * salía azulado — el cian cerraba en 19,7 de MAE contra 2,4 con el objetivo
 * correcto.
 */
function objetivo(v, opc) {
  const { fam = null, exc = [] } = opc;
  const fn = fam ? FAMILIAS[fam] : null;
  const w = v.x1 - v.x0 + 1, h = v.y1 - v.y0 + 1;
  const t = new Uint8Array(w * h);
  const uso = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const px = v.x0 + x, py = v.y0 + y, i = y * w + x;
    if (exc.length && dentro(px, py, exc)) continue;
    uso[i] = 1;
    if (fn) { const p = rgbAt(px, py); if (!fn(p[0], p[1], p[2])) continue; }
    t[i] = lum(px, py);
  }
  return { t, uso };
}

/** Error absoluto medio. Las zonas excluidas no cuentan: ahí la pieza no
 *  dibuja a propósito y castigarla por eso le bajaría el gris a todas las
 *  capas para compensar tinta que no le toca. */
function error(ms, grises, obj) {
  const { m, w, h } = ms;
  const { t, uso } = obj;
  let e = 0, n = 0;
  for (let i = 0; i < w * h; i++) {
    if (!uso[i]) continue;
    let val = 0;
    for (let k = 0; k < m.length; k++) if (m[k][i] > 127) val = grises[k];
    e += Math.abs(val - t[i]); n++;
  }
  return n ? e / n : 0;
}

function ajustarGrises(ms, v, opc) {
  const obj = objetivo(v, opc);
  const n = ms.m.length;
  const g = new Array(n).fill(120);
  let mae = error(ms, g, obj);
  for (let vuelta = 0; vuelta < 3; vuelta++) {
    for (let k = 0; k < n; k++) {
      let mejor = g[k], mejorE = mae;
      for (let cand = 15; cand <= 250; cand += 5) {
        const p = g.slice(); p[k] = cand;
        const e = error(ms, p, obj);
        if (e < mejorE) { mejorE = e; mejor = cand; }
      }
      g[k] = mejor; mae = mejorE;
    }
  }
  return { grises: g, mae };
}

/** Tono medido: promedio RGB de la tinta REAL de la pieza —misma familia,
 *  mismas exclusiones—, reescalado a la luminancia que pidió el barrido. */
function tono(v, gris, piso, opc = {}) {
  const { fam = null, exc = [] } = opc;
  const fn = fam ? FAMILIAS[fam] : null;
  let s = [0, 0, 0], n = 0;
  for (let y = v.y0; y <= v.y1; y++) for (let x = v.x0; x <= v.x1; x++) {
    if (lum(x, y) <= piso) continue;
    if (exc.length && dentro(x, y, exc)) continue;
    const p = rgbAt(x, y);
    if (fn && !fn(p[0], p[1], p[2])) continue;
    s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; n++;
  }
  if (!n) return "#000000";
  const m = s.map((q) => q / n);
  const L = (m[0] * 77 + m[1] * 150 + m[2] * 29) / 256;
  const k = L > 0 ? gris / L : 0;
  return "#" + m.map((q) => Math.max(0, Math.min(255, Math.round(q * k))).toString(16).padStart(2, "0")).join("");
}

// ── lectura directa ────────────────────────────────────────────────────────

/**
 * CAMPO: tramos horizontales de brillo igual con su RGB medido. Para marcos,
 * reglas y filos —todo lo que es una línea de 1 a 6 px— y para el QR.
 *
 * No se trazan por dos razones medidas en las láminas anteriores: el contorno
 * binariza y un filo del póster reparte su tinta entre dos o tres filas con
 * pesos distintos (el canto de un panel pica en 43 y el de al lado en 26), y a
 * resolución de módulo las fronteras caen a mitad de píxel y dos rectángulos
 * vecinos no suman su cobertura.
 */
function campo(x0, y0, x1, y1, { piso = 6, salto = 4 } = {}) {
  const celdas = [];
  for (let y = y0; y <= y1; y++) {
    let x = x0;
    while (x <= x1) {
      const v0 = lum(x, y);
      if (v0 <= piso) { x++; continue; }
      let k = x;
      const acu = [0, 0, 0];
      while (k <= x1) {
        const v = lum(k, y);
        if (v <= piso || Math.abs(v - v0) > salto) break;
        const p = rgbAt(k, y); acu[0] += p[0]; acu[1] += p[1]; acu[2] += p[2];
        k++;
      }
      const n = k - x;
      celdas.push([x - DX, y - DY, n, Math.round(acu[0] / n), Math.round(acu[1] / n), Math.round(acu[2] / n)]);
      x = k;
    }
  }
  return celdas;
}

// ── piezas ─────────────────────────────────────────────────────────────────

/* La ventana del organismo lleva dentro cinco cosas que NO son el organismo.
   Se le descuentan; cada una se traza aparte con su propio tono. */
const EXC_CRANEO = [
  [306, 104, 620, 140],  // título y su regla
  [306, 140, 420, 192],  // FRONT VIEW / X-RAY COMPOSITE / LIVE FEED
  [306, 192, 364, 506],  // columna de glifos rituales
  [306, 516, 434, 543],  // SC/KX-7A19-SK01...
  [306, 543, 940, 586],  // regla graduada y su código
];

const ORG = { hueco: 4000, escala: 3, mota: 3, precision: 1 };
const ORG5 = { hueco: 4000, escala: 5, mota: 3, precision: 1 };

/** [nombre, bandas, rango x, umbrales, opciones]. Un umbral = pieza plana
 *  (tipografía, línea); varios = organismo por capas. Todo en coordenadas del
 *  PÓSTER; la resta del origen la hace el trazador. */
const PIEZAS = [
  // ── 02. CORE SCAN / CRANIAL OVERVIEW ────────────────────────────────────
  ["p02TitRojo", [[108, 126]], [306, 399], [20, 48, 95]],
  ["p02TitGris", [[108, 126]], [400, 620], [20, 48, 95]],
  ["p02Rot",     [[141, 154], [155, 168], [169, 184]], [306, 420], [16, 36, 70]],
  ["p02GlifR",   [[194, 362]], [306, 364], [12, 26, 50, 90], { hueco: 8 }],
  ["p02GlifG",   [[363, 506]], [306, 364], [10, 22, 44, 80], { hueco: 8 }],

  /* El organismo: dos familias disjuntas, cada una con su escalera. Siete
     peldaños en el rojo porque va del anillo de fondo (tinta 9) al filo del
     parietal (255); cinco en el cian, que no llega tan alto. */
  ["p02CraneoR", [[104, 586]], [306, 771], [7, 15, 28, 50, 88, 140, 200], { ...ORG, fam: "rojo", exc: EXC_CRANEO }],
  ["p02CraneoC", [[104, 586]], [306, 771], [12, 26, 52, 100, 165], { ...ORG, fam: "cian", exc: EXC_CRANEO }],

  ["p02Codigo",  [[516, 543]], [306, 434], [12, 28, 55]],
  ["p02Regla",   [[543, 586]], [300, 748], [10, 24, 50, 100], { hueco: 4000, escala: 4, mota: 2, precision: 1 }],

  // ── ANATOMY OVERLAYS ────────────────────────────────────────────────────
  ["ovlTit",     [[134, 152]], [766, 940], [16, 38, 75], { hueco: 8 }],
  ["ovlF1T",     [[162, 178]], [772, 858], [16, 38, 75]],
  ["ovlF1G",     [[179, 218]], [772, 858], [14, 32, 60]],
  ["ovlF2T",     [[254, 270]], [772, 858], [16, 38, 75]],
  ["ovlF2G",     [[271, 314]], [772, 858], [14, 32, 60]],
  ["ovlF3T",     [[345, 361]], [772, 858], [16, 38, 75]],
  ["ovlF3G",     [[362, 404]], [772, 858], [14, 32, 60]],
  ["ovlF4T",     [[434, 450]], [772, 858], [16, 38, 75]],
  ["ovlF4G",     [[451, 494]], [772, 858], [14, 32, 60]],
  ["ovlM1",      [[155, 245]], [850, 940], [8, 18, 36, 70, 120, 180], ORG5],
  ["ovlM2",      [[246, 334]], [850, 940], [8, 18, 36, 70, 120, 180], ORG5],
  ["ovlM3",      [[335, 424]], [850, 940], [8, 18, 36, 70, 120, 180], ORG5],
  ["ovlM4",      [[425, 512]], [850, 940], [8, 18, 36, 70, 120, 180], ORG5],

  // ── SIGNAL LOCK · STABILITY ─────────────────────────────────────────────
  ["lockRotI",   [[523, 539]], [760, 846], [16, 36, 70]],
  ["lockValI",   [[540, 568]], [760, 846], [14, 32, 62], { hueco: 5 }],
  ["lockRotD",   [[523, 539]], [847, 936], [16, 36, 70]],
  ["lockValD",   [[540, 568]], [847, 936], [14, 32, 62], { hueco: 5 }],

  // ── 05. MOTION & SCAN PROTOCOLS (mitad derecha) ─────────────────────────
  ["p05Reveal",  [[624, 684]], [312, 376], [12, 28, 55, 100], { hueco: 60, escala: 5, mota: 3, precision: 1 }],
  ["p05RevRot",  [[632, 648]], [377, 460], [16, 38, 75]],
  ["p05RevGl",   [[648, 680]], [377, 460], [14, 32, 60]],
  ["p05Glitch",  [[622, 686]], [462, 517], [12, 28, 55, 100], { hueco: 60, escala: 5, mota: 3, precision: 1 }],
  ["p05GliRot",  [[632, 648]], [518, 604], [16, 38, 75]],
  ["p05GliGl",   [[648, 680]], [518, 604], [14, 32, 60]],
  ["p05Arch",    [[624, 684]], [606, 654], [12, 28, 55, 100], { hueco: 60, escala: 5, mota: 3, precision: 1 }],
  ["p05ArcTxt",  [[632, 648], [648, 680]], [655, 730], [14, 34, 66]],

  // ── 06. AUTHENTICATION / SEAL (mitad derecha) ───────────────────────────
  ["p06Hash",    [[740, 756]], [299, 384], [14, 32, 62]],
  ["p06Lineas",  [[760, 776], [780, 796], [797, 813], [815, 831]], [299, 384], [14, 32, 62]],
  ["p06Huella",  [[730, 842]], [385, 464], [10, 22, 44, 80, 140], { hueco: 90, escala: 5, mota: 3, precision: 1 }],
  ["p06Acceso",  [[740, 756]], [470, 582], [14, 32, 62]],
  ["p06Omega",   [[757, 780]], [470, 582], [14, 32, 62]],
  ["p06Clear",   [[788, 802], [803, 817], [818, 834]], [470, 582], [14, 32, 62]],
  ["p06Botones", [[734, 840]], [686, 730], [10, 24, 48, 90], { hueco: 20, escala: 5, mota: 3, precision: 1 }],

  // ── 07. MINI POSTER VARIATION ───────────────────────────────────────────
  ["p07TitR",    [[604, 618]], [746, 772], [16, 38, 75]],
  ["p07TitG",    [[604, 618]], [773, 912], [16, 38, 75]],
  ["p07Word",    [[626, 658]], [755, 900], [16, 40, 90, 150], { hueco: 40, escala: 4, mota: 3, precision: 1 }],
  ["p07Craneo",  [[658, 790]], [752, 902], [8, 18, 36, 70, 120, 180], { hueco: 400, escala: 4, mota: 3, precision: 1 }],
  ["p07Subject", [[790, 808]], [755, 900], [14, 34, 68]],
  ["p07Pie",     [[810, 848]], [752, 902], [10, 24, 48, 90], { hueco: 400, escala: 5, mota: 2, precision: 1 }],

  // ── 08. MOBILE TILE (canto) ─────────────────────────────────────────────
  ["p08Canto",   [[600, 858]], [916, 940], [10, 24, 48, 90], { hueco: 400, escala: 4, mota: 2, precision: 1 }],
];

const UMBRALES = [10, 14, 18, 24, 30, 38, 48, 60, 75, 95];

if (process.argv.includes("--cajas")) {
  for (const [nombre, bandas, xr, , opc = {}] of PIEZAS) {
    const v = ventana(bandas, xr);
    const exc = opc.exc ?? [];
    const fn = opc.fam ? FAMILIAS[opc.fam] : null;
    let ax = 1e9, bx = -1, ay = 1e9, by = -1, n = 0;
    for (let y = v.y0; y <= v.y1; y++) for (let x = v.x0; x <= v.x1; x++) {
      if (lum(x, y) <= 20) continue;
      if (exc.length && dentro(x, y, exc)) continue;
      if (fn) { const p = rgbAt(x, y); if (!fn(p[0], p[1], p[2])) continue; }
      n++; if (x < ax) ax = x; if (x > bx) bx = x; if (y < ay) ay = y; if (y > by) by = y;
    }
    const holgura = n ? `x ${ax}..${bx} (+${ax - v.x0}/-${v.x1 - bx})  y ${ay}..${by} (+${ay - v.y0}/-${v.y1 - by})` : "SIN TINTA";
    console.log(nombre.padEnd(11), `${v.x0}..${v.x1} × ${v.y0}..${v.y1}`.padEnd(24), holgura);
  }
  process.exit(0);
}

if (process.argv.includes("--barrer")) {
  const i = process.argv.indexOf("--pieza");
  const filtro = i > -1 ? process.argv[i + 1] : null;
  for (const [nombre, bandas, xr, us, opc = {}] of PIEZAS) {
    if (filtro && nombre !== filtro) continue;
    if (us.length > 1) { console.log(nombre.padEnd(11), "capas — el barrido lineal no aplica"); continue; }
    const v = ventana(bandas, xr);
    const exc = opc.exc ?? [];
    const filas = [];
    for (const u of UMBRALES) {
      const g = await trazar(bandas, xr, u, opc);
      if (!g.length) { filas.push({ u, mae: Infinity, grises: [0], n: 0 }); continue; }
      filas.push({ u, ...ajustarGrises(await mascaras([g], v), v, opc), n: g.length });
    }
    filas.sort((a, b) => a.mae - b.mae);
    console.log(nombre.padEnd(11), filas.slice(0, 4).map((f) => `u${f.u}/g${f.grises[0]}=${f.mae.toFixed(2)}(${f.n})`).join("  "));
  }
  rmSync(TMP, { recursive: true, force: true });
  process.exit(0);
}

const arte = {};
const informe = [];
for (const [nombre, bandas, xr, us, opc = {}] of PIEZAS) {
  const v = ventana(bandas, xr);
  const exc = opc.exc ?? [];
  const capas = [];
  for (const u of us) capas.push(await trazar(bandas, xr, u, opc));
  const vivas = capas.filter((c) => c.length);
  if (!vivas.length) { console.warn("\nVACÍA", nombre); continue; }
  const { grises, mae } = ajustarGrises(await mascaras(vivas, v), v, opc);
  arte[nombre] = vivas.map((glifos, i) => ({
    c: tono(v, grises[i], us[Math.min(i, us.length - 1)], { fam: opc.fam, exc }),
    g: glifos,
  }));
  const nodos = vivas.reduce((a, c) => a + c.reduce((b, g) => b + g.d.length, 0), 0);
  informe.push(` *   ${nombre.padEnd(11)} ${us.join("/").padEnd(26)} ${grises.join("/").padEnd(28)} ${mae.toFixed(2).padStart(6)}  ${String(nodos).padStart(6)}`);
  process.stdout.write(`${nombre} `);
}
console.log();

/* ── cromo leído, no estimado ──────────────────────────────────────────────
   Cada rectángulo cubre SÓLO filos: marcos, reglas y separadores. Las cajas
   salen de sondear la referencia (scripts/lamina/_t0105_bordes.mjs), no de
   mirarlas. Los rangos se eligen para no morder tipografía ni organismo: lo
   que entre acá se dibuja con su RGB exacto y volvería a dibujarse trazado. */
arte.cromo = [
  ...campo(299, 99, 940, 104),    // 02 · filo superior
  ...campo(299, 104, 302, 590),   // 02 · canto izquierdo (el eje está en 298, del vecino)
  ...campo(299, 583, 940, 592),   // 02 · filo inferior
  ...campo(303, 127, 620, 139),   // 02 · regla bajo el título y su escalón
  ...campo(750, 128, 940, 133),   // overlays · arranque de la columna
  ...campo(750, 153, 940, 158),   // overlays · regla del encabezado
  ...campo(750, 246, 940, 253),   // overlays · separador 01|02
  ...campo(750, 336, 940, 343),   // overlays · separador 02|03
  ...campo(750, 426, 940, 433),   // overlays · separador 03|04
  ...campo(750, 130, 757, 520),   // overlays · canto izquierdo de la columna
  ...campo(752, 516, 940, 523),   // lock · filo superior de la caja
  ...campo(752, 523, 762, 572),   // lock · canto izquierdo
  ...campo(843, 523, 852, 572),   // lock · tabique central
  ...campo(925, 523, 940, 572),   // lock · canto derecho
  ...campo(752, 566, 940, 574),   // lock · filo inferior
  ...campo(299, 593, 940, 601),   // banda inferior · filo de apertura
  ...campo(299, 601, 940, 604),   // 05 · filo superior
  ...campo(299, 619, 740, 628),   // 05 · regla del título y techo de las fichas
  ...campo(299, 628, 316, 690),   // 05 · tabique ISOLATE|REVEAL
  ...campo(450, 622, 464, 690),   // 05 · tabique REVEAL|GLITCH
  ...campo(588, 622, 602, 690),   // 05 · tabique GLITCH|ARCHIVE
  ...campo(299, 678, 740, 700),   // 05 · piso de las fichas y del panel
  ...campo(299, 700, 740, 708),   // 06 · filo superior
  ...campo(299, 720, 740, 733),   // 06 · regla del título y techo de las celdas
  ...campo(452, 726, 472, 840),   // 06 · tabique de la celda del hash
  ...campo(574, 726, 596, 840),   // 06 · tabique OMEGA|QR
  ...campo(676, 726, 692, 840),   // 06 · tabique QR|botones
  ...campo(722, 726, 740, 840),   // 06 · canto derecho
  ...campo(299, 833, 740, 850),   // 06 · piso
  ...campo(740, 598, 916, 606),   // 07 · filo superior
  ...campo(740, 606, 758, 858),   // 07 · canto izquierdo
  ...campo(740, 617, 916, 626),   // 07 · regla del título
  ...campo(893, 606, 916, 858),   // 07 · canto derecho
  ...campo(740, 845, 916, 860),   // 07 · piso
  ...campo(299, 855, 940, 866),   // banda inferior · filo de cierre
];

/* El QR se lee celda por celda: a resolución de módulo las fronteras caen a
   mitad de píxel y dos rectángulos vecinos no suman su cobertura. */
arte.p06Qr = campo(594, 742, 678, 830, { piso: 8, salto: 2 });

const cab = `/**
 * t01-05 · BLOQUE CENTRO · ARTE FIJA TRAZADA — NO SE EDITA A MANO.
 *
 * Generado desde reference/canon/${SLUG}.png con
 * scripts/lamina/arte-t01-05-centro.mjs. Las coordenadas están en el sistema
 * de la caja del bloque (left:299 top:88), o sea corridas −299,−88 respecto
 * del póster.
 *
 * Ningún relleno de acá está elegido a ojo. Cada pieza se rasteriza sobre
 * negro y un descenso por coordenadas busca las luminancias —una por capa— que
 * menos error absoluto medio dejan contra el original; el TONO sale del
 * promedio RGB de la tinta real de esa ventana (misma familia de color, mismas
 * exclusiones), reescalado a esa luminancia.
 *
 *   pieza       umbrales                   rellenos                        MAE   nodos
${informe.join("\n")}
 *
 * \`cromo\` y \`p06Qr\` no están trazados: son tramos horizontales de brillo igual
 * con su RGB medido. Un filo del póster reparte su tinta entre dos o tres filas
 * con pesos distintos y el contorno binario los aplana.
 */
export type Glifo = { x: number; y: number; w: number; h: number; vw: number; vh: number; d: [string, string][] };
export type Capa = { c: string; g: Glifo[] };
export type Campo = number[][];
`;

const tipo = (k) => (k === "cromo" || k === "p06Qr" ? "Campo" : "Capa[]");
const cuerpo = Object.entries(arte)
  .map(([k, v]) => `export const ${k} = ${JSON.stringify(v)} as unknown as ${tipo(k)};`)
  .join("\n\n");

writeFileSync(DESTINO, cab + "\n" + cuerpo + "\n");
rmSync(TMP, { recursive: true, force: true });
console.log("ok →", DESTINO);
