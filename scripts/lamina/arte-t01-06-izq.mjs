#!/usr/bin/env node
/**
 * KODEX-∞ · t01-06 RITUAL DEVICE · ARTE FIJA DEL BLOQUE IZQUIERDA
 *
 * Genera src/components/kodex/lamina/t01-06/arte-izq.ts trazando desde
 * reference/canon/t01-06-ritual-device.png SOLO EL CHROME de los paneles
 * «01. COMPONENT BREAKDOWN» y «02. OPERATING STATES»: rótulos, micrografía de
 * la regla lateral, la tira de ocho glifos, las flechas de transición y la
 * retícula de marcos.
 *
 * Lo que NO está acá y no debe estarlo: el dispositivo despiezado, los cuatro
 * discos de estado y las tres ondas. Ésos son el organismo del bloque y van
 * dibujados por código en Izquierda.astro (dos <canvas>). Trazarlos daría un
 * puntaje mucho mejor y sería escribir el mapa de bits como SVG: sin canvas no
 * hay máquina de estados ni página viva, que es el producto.
 *
 *   node scripts/lamina/arte-t01-06-izq.mjs            # genera arte-izq.ts
 *   node scripts/lamina/arte-t01-06-izq.mjs --cajas    # verifica el encuadre
 *   node scripts/lamina/arte-t01-06-izq.mjs --barrer   # barre umbrales
 *
 * Hereda el método de t01-04/t01-07 (bandas trazadas con vtracer, capas por
 * umbral, relleno por descenso de coordenadas, tono medido) y le agrega una
 * cosa: las BANDAS DE RENGLÓN SE DETECTAN, no se escriben. En esta lámina hay
 * 12 renglones de etiqueta en el panel 01 y 16 en el panel 02, y anotarlos a
 * mano es donde se cuelan los errores de un píxel que después no se ven pero
 * el diff sí. `bandas()` recorre la ventana y devuelve los renglones con tinta.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { PNG } from "pngjs";
import sharp from "sharp";
import { vectorize, ColorMode, PathSimplifyMode, Hierarchical } from "@neplex/vectorizer";

const SLUG = "t01-06-ritual-device";
const REF = `reference/canon/${SLUG}.png`;
const TMP = "scripts/lamina/out/_t0106_izq";
const DESTINO = "src/components/kodex/lamina/t01-06/arte-izq.ts";

/* Origen de la caja del bloque: left:4px top:88px. */
const DX = 4;
const DY = 88;

const img = PNG.sync.read(readFileSync(REF));
const { width: W, data } = img;
const lum = (x, y) => { const i = (y * W + x) * 4; return (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8; };
const rgbAt = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };

mkdirSync(TMP, { recursive: true });

/**
 * Renglones con tinta de una ventana. `hueco` es cuántas filas vacías separan
 * dos renglones; `margen` los engorda para no comerse el antialias de las
 * ascendentes, que a 9 px es medio glifo.
 */
function bandas(x0, x1, y0, y1, thr = 18, hueco = 2, margen = 1) {
  const out = [];
  let s = null, gap = 0;
  for (let y = y0; y <= y1; y++) {
    let n = 0;
    for (let x = x0; x <= x1; x++) if (lum(x, y) > thr) { n++; break; }
    if (n) { if (s === null) s = y; gap = 0; }
    else if (s !== null) { gap++; if (gap > hueco) { out.push([Math.max(y0, s - margen), Math.min(y1, y - gap + margen)]); s = null; } }
  }
  if (s !== null) out.push([Math.max(y0, s - margen), y1]);
  return out;
}

// ── trazado ────────────────────────────────────────────────────────────────

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
    if (c.w < 1 || c.h < 1) continue;

    const bin = await sharp(REF)
      .extract({ left: c.x, top: c.y, width: c.w, height: c.h })
      .resize({ width: c.w * escala, height: c.h * escala, kernel: "nearest" })
      .greyscale().threshold(umbral).negate().png().toBuffer();

    const svg = await vectorize(bin, {
      colorMode: ColorMode.Binary, hierarchical: Hierarchical.Stacked,
      filterSpeckle: mota, colorPrecision: 6, layerDifference: 16,
      mode: PathSimplifyMode.Spline, cornerThreshold: 60, lengthThreshold: 4,
      maxIterations: 10, spliceThreshold: 45, pathPrecision: precision,
    });

    const d = [...svg.matchAll(/<path d="([^"]+)"(?:[^>]*transform="([^"]+)")?/g)].map((m) => [m[1], m[2] ?? ""]);
    if (d.length) glifos.push({ x: c.x - DX, y: c.y - DY, w: c.w, h: c.h, vw: c.w * escala, vh: c.h * escala, d });
  }
  return glifos;
}

const trazar = async (bs, xr, umbral, opc) => (await Promise.all(bs.map((b) => trazarBanda(b, xr, umbral, opc)))).flat();

// ── medición de rellenos ───────────────────────────────────────────────────

const ventana = (bs, [x0, x1]) => ({ x0, x1, y0: Math.min(...bs.map((b) => b[0])), y1: Math.max(...bs.map((b) => b[1])) });

async function mascaras(capas, v) {
  const w = v.x1 - v.x0 + 1, h = v.y1 - v.y0 + 1;
  const out = [];
  for (const glifos of capas) {
    const cuerpo = glifos.map((g) =>
      `<svg x="${g.x + DX - v.x0}" y="${g.y + DY - v.y0}" width="${g.w}" height="${g.h}" viewBox="0 0 ${g.vw} ${g.vh}" preserveAspectRatio="none">` +
      g.d.map(([d, tr]) => `<path d="${d}"${tr ? ` transform="${tr}"` : ""} fill="#fff"/>`).join("") + `</svg>`).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#000"/>${cuerpo}</svg>`;
    out.push(await sharp(Buffer.from(svg)).greyscale().raw().toBuffer());
  }
  return { m: out, w, h };
}

function error(ms, grises, v) {
  const { m, w, h } = ms;
  let e = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    let val = 0;
    for (let k = 0; k < m.length; k++) if (m[k][i] > 127) val = grises[k];
    e += Math.abs(val - lum(v.x0 + x, v.y0 + y));
  }
  return e / (w * h);
}

function ajustarGrises(ms, v) {
  const n = ms.m.length;
  const g = new Array(n).fill(110);
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

function tira(x0, x1, y0, y1, { eje = "h", piso = 3, salto = 2 } = {}) {
  const out = [];
  const largo = eje === "h" ? x1 - x0 + 1 : y1 - y0 + 1;
  const lineas = eje === "h" ? y1 - y0 + 1 : x1 - x0 + 1;
  for (let n = 0; n < lineas; n++) {
    const L = eje === "h" ? y0 + n : x0 + n;
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
        const lt = j - i + 1;
        out.push(eje === "h" ? [x0 + i - DX, L - DY, lt, 1, m[0], m[1], m[2]] : [L - DX, y0 + i - DY, 1, lt, m[0], m[1], m[2]]);
      }
      i = j + 1;
    }
  }
  return out;
}

/* Las cuatro celdas de OPERATING STATES, medidas: cada una es su propia caja y
   no comparten alto (la de EMIT mide 80 y las otras 107-109). */
const CELDAS = [[130, 239], [249, 357], [367, 474], [483, 563]];
/* Última fila de glosa de cada celda: por debajo empieza la onda, que es
   organismo y se dibuja. La celda de EMIT no tiene onda y llega hasta el filo. */
const GLOSA_FIN = [202, 321, 439, 562];

const TIRAS = [
  // canto izquierdo del póster: la cabecera lo abre y el pie lo cierra, la
  // franja del medio no es de nadie más.
  ["vBordePos", [4, 8, 88, 866, "v"]],

  // 01. COMPONENT BREAKDOWN
  ["p01Izq", [14, 18, 96, 571, "v"]],
  ["p01Der", [411, 416, 96, 571, "v"]],
  ["p01Sup", [16, 414, 95, 100, "h"]],
  ["p01Tit", [16, 414, 121, 126, "h"]],
  ["p01Gli", [16, 414, 469, 474, "h"]],
  ["p01Mat", [16, 414, 514, 518, "h"]],
  ["p01Mas", [16, 414, 538, 543, "h"]],
  ["p01Inf", [16, 414, 566, 571, "h"]],

  // líneas de guía A-F: seis reglas de 2 px con su cuadradito de color. Son
  // unidimensionales por construcción y por eso se leen, no se trazan.
  ["guiaA", [236, 280, 145, 155, "h"]],
  ["guiaB", [236, 280, 197, 207, "h"]],
  ["guiaC", [236, 280, 254, 264, "h"]],
  ["guiaD", [236, 280, 312, 322, "h"]],
  ["guiaE", [236, 280, 371, 381, "h"]],
  ["guiaF", [236, 280, 429, 439, "h"]],

  // 02. OPERATING STATES · caja del rótulo
  ["p02BoxIzq", [419, 423, 95, 126, "v"]],
  ["p02BoxDer", [585, 590, 95, 126, "v"]],
  ["p02BoxSup", [421, 588, 95, 100, "h"]],
  ["p02BoxInf", [421, 588, 121, 126, "h"]],
  ["p02Inf", [421, 620, 566, 571, "h"]],

  // esquina del marco del héroe que entra en esta caja por 24 px
  ["heroeSup", [594, 620, 95, 100, "h"]],
  ["heroeIzq", [594, 598, 96, 130, "v"]],

  ...CELDAS.flatMap(([t, b], i) => [
    [`c${i + 1}Izq`, [425, 430, t, b, "v"]],
    [`c${i + 1}Der`, [616, 620, t, b, "v"]],
    [`c${i + 1}Sup`, [427, 620, t - 2, t + 2, "h"]],
    [`c${i + 1}Inf`, [427, 620, b - 2, b + 2, "h"]],
  ]),

  /* ── banda inferior ──────────────────────────────────────────────────────
     El encargo describía dos paneles; el andamiaje dio la caja entera y adentro
     hay dos más. «05. WAVEFORMS & RESONANCE GRAPHS» (16..490) entra completo, y
     de «06. UNIFORM MAP / PSEUDO-CODE» (495..1010) entran sus primeros 125 px.
     El corte del bloque cae en x=620, dentro del panel 06: nadie más lo alcanza
     sin salirse de su caja, así que su rebanada va acá. Está anotado en el
     informe. */
  ["bSup", [4, 620, 576, 583, "h"]],
  ["bTit", [16, 620, 599, 607, "h"]],
  ["bMed", [16, 490, 674, 681, "h"]],
  ["bMetSup", [16, 490, 798, 805, "h"]],
  ["bMetInf", [16, 490, 835, 843, "h"]],
  ["bInf", [4, 620, 845, 853, "h"]],
  ["bFin", [4, 620, 857, 866, "h"]],
  ["bIzq", [13, 19, 578, 852, "v"]],
  ["bDer05", [486, 493, 578, 852, "v"]],
  ["bIzq06", [493, 500, 578, 852, "v"]],
  ["bMedio", [245, 254, 604, 800, "v"]],
  // las cinco divisorias de la fila RESONANCE METRICS, medidas por sus huecos
  ["bMet1", [116, 124, 801, 841, "v"]],
  ["bMet2", [185, 193, 801, 841, "v"]],
  ["bMet3", [249, 257, 801, 841, "v"]],
  ["bMet4", [308, 316, 801, 841, "v"]],
  ["bMet5", [384, 392, 801, 841, "v"]],
];

// ── piezas trazadas ────────────────────────────────────────────────────────
/**
 * [nombre, bandas | "auto", rango x, umbral(es), opciones].
 * "auto" detecta los renglones con tinta dentro de [y0,y1] con `bandas()`.
 */
const AUTO = (y0, y1, thr = 18, hueco = 2) => ({ auto: [y0, y1, thr, hueco] });

const PIEZAS = [
  // ── 01. COMPONENT BREAKDOWN ─────────────────────────────────────────────
  ["p01Titulo", AUTO(102, 121), [20, 410], [16, 34, 60]],
  // La regla lateral es micrografía + escala: dos columnas de marcas de 2-3 px.
  // Va por capas porque el filo de la escala pica en 246 y el texto en 40.
  ["p01Regla", [[128, 468]], [19, 62], [12, 26, 50, 95], { hueco: 4, escala: 5, mota: 2, precision: 1 }],
  ["p01Etq", AUTO(138, 460, 16), [283, 412], [14, 30, 55]],
  // Los ocho glifos: arte fija, cinco capas — son marcas de tinta irregular y
  // aplanarlos a un gris los convierte en iconos de CAD.
  ["p01Glifos", [[474, 514]], [18, 412], [14, 26, 44, 72, 115], { hueco: 3, escala: 6, mota: 3, precision: 1 }],
  ["p01Materiales", AUTO(520, 538, 16), [18, 410], [14, 30, 55]],
  ["p01Masa", AUTO(543, 566, 16), [18, 412], [14, 30, 55]],

  // ── 02. OPERATING STATES ────────────────────────────────────────────────
  ["p02Titulo", AUTO(102, 121), [424, 586], [16, 34, 60]],
  ...CELDAS.flatMap(([t, b], i) => [
    [`p02Chip${i + 1}`, AUTO(t + 3, t + 24, 12), [432, 452], [10, 22, 42]],
    [`p02Nom${i + 1}`, AUTO(t + 11, t + 28, 32), [508, 614], [20, 44, 80]],
    // El corte de abajo evita la onda: es organismo y va por canvas.
    [`p02Glosa${i + 1}`, AUTO(t + 29, GLOSA_FIN[i], 20), [508, 614], [16, 34, 60]],
  ]),
  // Las tres flechas de transición van por separado y no como una pieza de tres
  // bandas: juntas, la ventana de medición abarca de y=240 a y=483 y el
  // descenso de grises ajusta contra 240 filas de glosa que esta pieza no
  // dibuja. Medido: 16,85 de MAE juntas contra 3-4 separadas.
  ["p02Flecha1", [[240, 249]], [500, 550], [14, 34, 70]],
  ["p02Flecha2", [[358, 367]], [500, 550], [14, 34, 70]],
  ["p02Flecha3", [[475, 483]], [500, 550], [14, 34, 70]],

  // ── 05. WAVEFORMS & RESONANCE GRAPHS ────────────────────────────────────
  ["p05Titulo", AUTO(584, 600, 16), [20, 470], [16, 34, 60]],
  ["p05RotA", AUTO(606, 620, 16), [22, 246], [16, 34, 60]],
  ["p05PieA", AUTO(661, 674, 16), [22, 246], [16, 34, 60]],
  ["p05RotB", AUTO(606, 620, 16), [254, 486], [16, 34, 60]],
  ["p05PieB", AUTO(661, 674, 16), [254, 486], [16, 34, 60]],
  ["p05RotC", AUTO(683, 696, 16), [22, 246], [16, 34, 60]],
  // F1..F4 viven DENTRO del área del gráfico; se trazan aparte para que el
  // canvas no tenga que fingir tipografía a 8 px.
  ["p05EjeCy", [[700, 780]], [22, 46], [14, 30, 55]],
  ["p05EjeCx", AUTO(778, 800, 16), [22, 246], [14, 30, 55]],
  ["p05RotD", AUTO(683, 696, 16), [254, 486], [16, 34, 60]],
  ["p05EjeDy", [[695, 792]], [458, 486], [14, 30, 55]],
  ["p05EjeDx", AUTO(788, 800, 16), [254, 457], [14, 30, 55]],
  ["p05Metricas", AUTO(805, 836, 16), [20, 486], [16, 34, 60]],

  // ── 06. UNIFORM MAP · rebanada que cae en esta caja ─────────────────────
  ["p06Titulo", AUTO(584, 600, 16), [500, 620], [16, 34, 60]],
  ["p06Codigo", AUTO(610, 832, 14), [500, 620], [14, 30, 55]],
];

const UMBRALES = [10, 14, 18, 22, 26, 30, 36, 44, 55, 70, 90];

const bandasDe = (spec, xr) => (Array.isArray(spec) ? spec : bandas(xr[0], xr[1], ...spec.auto));

if (process.argv.includes("--cajas")) {
  for (const [nombre, spec, xr] of PIEZAS) {
    const bs = bandasDe(spec, xr);
    if (!bs.length) { console.log(nombre.padEnd(13), "SIN RENGLONES"); continue; }
    const v = ventana(bs, xr);
    let ax = 1e9, bx = -1, n = 0;
    for (let y = v.y0; y <= v.y1; y++) for (let x = v.x0; x <= v.x1; x++) if (lum(x, y) > 22) { n++; if (x < ax) ax = x; if (x > bx) bx = x; }
    console.log(nombre.padEnd(13), `${bs.length} bandas  ${v.x0}..${v.x1} × ${v.y0}..${v.y1}`.padEnd(34), n ? `tinta x${ax}..${bx}` : "SIN TINTA", JSON.stringify(bs).slice(0, 90));
  }
  for (const [nombre, [x0, x1, y0, y1, eje]] of TIRAS) console.log(nombre.padEnd(13), `tira ${eje} ${x0}..${x1} × ${y0}..${y1}`.padEnd(34), `${tira(x0, x1, y0, y1, { eje }).length} tramos`);
  process.exit(0);
}

if (process.argv.includes("--barrer")) {
  const i = process.argv.indexOf("--pieza");
  const filtro = i > -1 ? process.argv[i + 1] : null;
  for (const [nombre, spec, xr, us, opc] of PIEZAS) {
    if (filtro && nombre !== filtro) continue;
    if (us.length > 1 && !filtro) { console.log(nombre.padEnd(13), "capas — el barrido lineal no aplica"); continue; }
    const bs = bandasDe(spec, xr);
    const v = ventana(bs, xr);
    const filas = [];
    for (const u of UMBRALES) {
      const g = await trazar(bs, xr, u, opc);
      if (!g.length) { filas.push({ u, mae: Infinity, grises: [0], n: 0 }); continue; }
      filas.push({ u, ...ajustarGrises(await mascaras([g], v), v), n: g.length });
    }
    filas.sort((a, b) => a.mae - b.mae);
    console.log(nombre.padEnd(13), filas.slice(0, 4).map((f) => `u${f.u}/g${f.grises[0]}=${f.mae.toFixed(2)}(${f.n})`).join("  "));
  }
  rmSync(TMP, { recursive: true, force: true });
  process.exit(0);
}

const arte = {};
const informe = [];
for (const [nombre, spec, xr, us, opc] of PIEZAS) {
  const bs = bandasDe(spec, xr);
  if (!bs.length) { console.warn("SIN RENGLONES", nombre); continue; }
  const v = ventana(bs, xr);
  const capas = [];
  for (const u of us) capas.push(await trazar(bs, xr, u, opc));
  const vivas = capas.filter((c) => c.length);
  if (!vivas.length) { console.warn("VACÍA", nombre); continue; }
  const { grises, mae } = ajustarGrises(await mascaras(vivas, v), v);
  arte[nombre] = vivas.map((glifos, i) => ({ c: tono(v, grises[i], us[Math.min(i, us.length - 1)]), g: glifos }));
  const nodos = vivas.reduce((a, c) => a + c.reduce((b, g) => b + g.d.length, 0), 0);
  informe.push(` *   ${nombre.padEnd(13)} ${String(bs.length).padStart(2)} bandas  ${us.join("/").padEnd(18)} ${grises.join("/").padEnd(20)} ${mae.toFixed(2).padStart(6)}  ${String(nodos).padStart(5)}`);
  process.stdout.write(`${nombre} `);
}
console.log();

const reticula = {};
for (const [nombre, [x0, x1, y0, y1, eje]] of TIRAS) reticula[nombre] = tira(x0, x1, y0, y1, { eje });
const tramos = Object.values(reticula).reduce((a, t) => a + t.length, 0);

const cab = `/**
 * t01-06 · BLOQUE IZQUIERDA · ARTE FIJA TRAZADA — NO SE EDITA A MANO.
 *
 * Generado desde reference/canon/${SLUG}.png con
 * scripts/lamina/arte-t01-06-izq.mjs. Coordenadas en el sistema de la caja del
 * bloque (left:4 top:88), o sea corridas −4,−88 respecto del póster.
 *
 * Acá está SOLO EL CHROME: rótulos, micrografía de la regla, la tira de ocho
 * glifos, las flechas de transición y la retícula. El dispositivo despiezado,
 * los cuatro discos de estado y las tres ondas son el ORGANISMO del bloque y
 * se dibujan por código en Izquierda.astro. Trazarlos bajaría el error a casi
 * cero y sería escribir el mapa de bits como SVG.
 *
 * Ningún relleno está elegido a ojo: cada pieza se rasteriza sobre negro y un
 * descenso por coordenadas busca la luminancia que menos error absoluto medio
 * deja contra el original; el tono sale del promedio RGB de la tinta real.
 *
 *   pieza                   umbrales           rellenos                MAE  nodos
${informe.join("\n")}
 *
 * La RETÍCULA (${tramos} tramos en ${TIRAS.length} tiras) se lee línea por línea con su RGB
 * medido, igual que un código de barras pero en las dos orientaciones. Las seis
 * líneas de guía A-F entran acá y no en el canvas: son reglas de 2 px con un
 * cuadradito de color al final, unidimensionales por construcción.
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
