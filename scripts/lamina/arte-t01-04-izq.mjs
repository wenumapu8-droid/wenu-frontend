#!/usr/bin/env node
/**
 * KODEX-∞ · t01-04 ARCHIVE TREE · ARTE FIJA DEL BLOQUE IZQUIERDA
 *
 * Genera src/components/kodex/lamina/t01-04/arte-izq.ts trazando desde
 * reference/canon/t01-04-archive-tree.png todo lo fijo de los paneles 01, 06 y
 * la mitad izquierda del 07. El .ts NO se edita a mano: se corre esto.
 *
 *   node scripts/lamina/arte-t01-04-izq.mjs            # genera arte-izq.ts
 *   node scripts/lamina/arte-t01-04-izq.mjs --barrer   # barre umbrales
 *
 * Escribe en un archivo propio y en un temporal propio: la lámina la arman
 * cinco agentes a la vez y `scripts/lamina/glyphs/<slug>/` es un cajón único
 * que ya se pisaron entre sí una vez. Nadie más toca arte-izq.ts.
 *
 * Tres cosas que este generador hace y el de la cabecera no las necesitaba:
 *
 *  1. BANDAS MÚLTIPLES POR PIEZA. Los rótulos de la ficha del espécimen son
 *     seis renglones verdes intercalados con seis renglones grises de valores.
 *     Trazar renglón por renglón daría doce piezas y doce barridos; trazar la
 *     columna entera de rótulos como UNA pieza de seis bandas da una, con un
 *     solo color. El corte es por columna de tinta dentro de cada banda.
 *
 *  2. ORGANISMOS POR CAPAS. La cabeza de ramas y las seis miniaturas no son
 *     tipografía: son masas con degradado. Un trazo binario las aplana a un
 *     solo gris y el diff estructural por bloques de 8×8 lo cobra. Se trazan
 *     con tres umbrales y se apilan —el halo tenue abajo, el núcleo brillante
 *     arriba—, y los tres rellenos salen de un descenso por coordenadas contra
 *     la referencia, no de elegirlos.
 *
 *  3. COLOR POR PIEZA, MEDIDO. El barrido devuelve una LUMINANCIA óptima; el
 *     tono sale del promedio RGB de la tinta real de esa pieza, reescalado a
 *     esa luminancia. Así el verde ácido sigue siendo verde ácido y el rojo del
 *     sello sigue siendo rojo, sin que nadie elija un hex a ojo.
 *
 * Los códigos de barras NO se trazan: se leen columna por columna. El contorno
 * les inventa esquinas y pierde ~38 % de la tinta (lección ya pagada).
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { PNG } from "pngjs";
import sharp from "sharp";
import { vectorize, ColorMode, PathSimplifyMode, Hierarchical } from "@neplex/vectorizer";

const SLUG = "t01-04-archive-tree";
const REF = `reference/canon/${SLUG}.png`;
const TMP = "scripts/lamina/out/_t0104_izq";
const DESTINO = "src/components/kodex/lamina/t01-04/arte-izq.ts";

/* Origen de la caja del bloque: left:4px top:88px. Todas las coordenadas que
   salen de acá están en el sistema del componente, no en el del póster. */
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
 * 2 px alcanza; en un organismo hay que subirlo o la masa se parte en cien
 * SVG anidados que no comparten viewBox y se deforman cada uno por su lado.
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

/** Rasteriza una lista de capas [{glifos}] sobre negro y devuelve la máscara
 *  de cada capa como Uint8 (0..255) en la ventana. */
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

/** Descenso por coordenadas sobre los grises de las capas. Con una sola capa
 *  es exactamente el barrido lineal del generador de la cabecera. */
function ajustarGrises(ms, v) {
  const n = ms.m.length;
  const g = new Array(n).fill(120);
  let mae = error(ms, g, v);
  for (let vuelta = 0; vuelta < 4; vuelta++) {
    for (let k = 0; k < n; k++) {
      let mejor = g[k], mejorE = mae;
      for (let cand = 20; cand <= 245; cand += 5) {
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
 *  luminancia que pidió el barrido. Nadie elige un hex. */
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

// ── códigos de barras ──────────────────────────────────────────────────────

/**
 * Un código de barras es una función de UNA variable: se lee columna por
 * columna y se comprime por tramos de brillo parecido. Trazarlo con vtracer le
 * inventa esquinas y le come tinta.
 */
function barras(x0, x1, y0, y1, { piso = 8, salto = 6, color = false } = {}) {
  const cols = [];
  for (let x = x0; x <= x1; x++) {
    let s = 0, sc = [0, 0, 0];
    for (let y = y0; y <= y1; y++) { s += lum(x, y); const p = rgbAt(x, y); sc[0] += p[0]; sc[1] += p[1]; sc[2] += p[2]; }
    const n = y1 - y0 + 1;
    cols.push({ v: Math.round(s / n), rgb: sc.map((q) => Math.round(q / n)) });
  }
  const tramos = [];
  let i = 0;
  while (i < cols.length) {
    let j = i;
    while (j + 1 < cols.length && Math.abs(cols[j + 1].v - cols[i].v) <= salto) j++;
    const trozo = cols.slice(i, j + 1);
    const v = Math.round(trozo.reduce((a, b) => a + b.v, 0) / trozo.length);
    if (v > piso) {
      /* Las reglas rojas del panel 07 son tinta de color, no gris: para ésas se
         guarda el RGB medido y no la luminancia, que las dejaría plomizas. */
      if (color) {
        const m = [0, 1, 2].map((k) => Math.round(trozo.reduce((a, b) => a + b.rgb[k], 0) / trozo.length));
        tramos.push([x0 + i - DX, j - i + 1, m[0], m[1], m[2]]);
      } else tramos.push([x0 + i - DX, j - i + 1, v]);
    }
    i = j + 1;
  }
  return { y: y0 - DY, h: y1 - y0 + 1, tramos, color };
}

/**
 * El QR es la extensión a dos variables del mismo criterio que el código de
 * barras: se LEE, no se traza ni se inventa un patrón. Se lee a resolución de
 * píxel y se fusionan los tramos horizontales de igual brillo.
 *
 * A resolución de MÓDULO no funciona, y es un detalle que cuesta caro: sus 34×22
 * px no se reparten en un número entero de módulos, así que las celdas caen en
 * fronteras fraccionarias. Dos rectángulos vecinos que comparten una frontera
 * a mitad de píxel no suman su cobertura —el navegador los compone uno sobre
 * otro, no los acumula— y el bloque entero salía un 19 % más oscuro que el
 * original. Con celdas de 1 px la frontera es entera y no hay pérdida.
 */
function retabla(x0, y0, w, h) {
  const celdas = [];
  for (let r = 0; r < h; r++) {
    let c = 0;
    while (c < w) {
      const v = lum(x0 + c, y0 + r);
      let k = c;
      while (k + 1 < w && lum(x0 + k + 1, y0 + r) === v) k++;
      if (v > 10) celdas.push([c, r, k - c + 1, v]);
      c = k + 1;
    }
  }
  return { x: x0 - DX, y: y0 - DY, w, h, celdas };
}

// ── piezas ─────────────────────────────────────────────────────────────────
/**
 * [nombre, bandas, rango x, umbral(es), opciones].
 * Con un umbral la pieza es plana (tipografía, reglas, iconos de línea); con
 * tres es un organismo por capas. Todo en coordenadas del PÓSTER: la resta del
 * origen del bloque la hace el trazador.
 */
const PIEZAS = [
  // ── 01. SPECIMEN DOSSIER ────────────────────────────────────────────────
  ["p01Titulo",  [[91, 105]],   [18, 250],  [22, 55, 95]],
  ["p01Marca",   [[119, 153]],  [20, 250],  [30, 80, 140]],
  ["p01Sub",     [[154, 169]],  [20, 250],  [16, 34, 60]],
  ["p01Subject", [[121, 134]],  [252, 392], [16, 32, 55]],
  ["p01Rot",     [[147, 157], [161, 171], [177, 187], [201, 211], [217, 227]], [256, 313], [16, 34, 60]],
  ["p01Val",     [[147, 157], [161, 171], [177, 187], [188, 198], [201, 211], [217, 227]], [314, 392], [16, 34, 60]],
  ["p01Threat",  [[240, 250]],  [256, 313], [12, 26, 45]],
  ["p01C5",      [[226, 264]],  [316, 392], [14, 30, 55], { hueco: 12 }],
  ["p01Cabeza",  [[171, 381]],  [18, 252],  [13, 26, 45, 75, 120, 168], { hueco: 260, escala: 5, mota: 3, precision: 1 }],
  ["p01MiniA",   [[268, 322]],  [256, 312], [13, 26, 45, 75], { hueco: 60, escala: 5, mota: 3, precision: 1 }],
  ["p01MiniB",   [[268, 322]],  [313, 332], [13, 26, 45, 75], { hueco: 30, escala: 6, mota: 3, precision: 1 }],
  ["p01MiniC",   [[268, 322]],  [333, 392], [11, 20, 34, 55], { hueco: 62, escala: 5, mota: 3, precision: 1 }],
  ["p01Id",      [[332, 344]],  [256, 340], [16, 34, 60]],
  ["p01Sello",   [[331, 384]],  [341, 392], [12, 24, 42, 70], { hueco: 55, escala: 6, mota: 3, precision: 1 }],
  ["p01Notas",   [[369, 380], [380, 390], [390, 400], [400, 411]], [55, 254], [16, 34, 60]],

  // ── 06. DATA TAGS & INDEX ───────────────────────────────────────────────
  ["p06Titulo",  [[462, 476]],  [18, 320],  [18, 40, 70]],
  ["p06Marcas",  [[489, 555]],  [18, 60],   [14, 28, 50], { hueco: 6 }],
  ["p06IcoA",    [[489, 555]],  [61, 92],   [14, 28, 50], { hueco: 6 }],
  ["p06RotA",    [[491, 503], [507, 519], [524, 536], [540, 553]], [93, 124], [14, 28, 50]],
  ["p06RotB",    [[491, 503], [507, 519]], [128, 210], [16, 34, 60]],
  ["p06IcoC",    [[489, 555]],  [214, 240], [14, 28, 50], { hueco: 6 }],
  ["p06RotC",    [[491, 503], [507, 519], [524, 536], [540, 553]], [241, 277], [16, 34, 60]],
  ["p06ValC",    [[491, 503], [507, 519], [524, 536], [540, 553]], [285, 392], [14, 30, 55]],
  ["p06Aviso",   [[560, 572], [572, 584]], [222, 292], [14, 28, 50]],
  /* Los dos guiones rojos junto a «98.7%» tienen tinta media 4: con el piso de
     los demás rótulos desaparecen, y son 70 px de ancho. Ventana sin el canto
     derecho del panel, que si no entra el marco como si fuera glifo. */
  ["p06Rayas",   [[542, 553]],  [318, 388], [8, 15, 25]],
  ["p06Ico",     [[558, 584]],  [293, 320], [12, 24, 45], { hueco: 8 }],

  // ── 07. MOTION NOTES & BEHAVIOR (mitad izquierda) ───────────────────────
  ["p07Titulo",  [[601, 615]],  [18, 345],  [18, 40, 70]],
  ["p07Iconos",  [[625, 648]],  [18, 399],  [14, 30, 55], { hueco: 4 }],
  ["p07Texto",   [[648, 659], [661, 673]], [18, 399], [16, 34, 60]],
  ["p07ThumbA",  [[684, 781]],  [24, 123],  [13, 26, 45, 75, 120, 168], { hueco: 102, escala: 5, mota: 3, precision: 1 }],
  ["p07ThumbB",  [[684, 781]],  [132, 231], [13, 26, 45, 75, 120, 168], { hueco: 102, escala: 5, mota: 3, precision: 1 }],
  ["p07ThumbC",  [[684, 781]],  [240, 339], [13, 26, 45, 75, 120, 168], { hueco: 102, escala: 5, mota: 3, precision: 1 }],
  ["p07ThumbD",  [[684, 781]],  [348, 399], [12, 22, 38, 62, 100], { hueco: 55, escala: 5, mota: 3, precision: 1 }],
  ["p07Sec",     [[803, 815]],  [18, 399],  [16, 34, 60]],
  ["p07Nombre",  [[818, 831]],  [18, 399],  [16, 34, 60]],
];

const UMBRALES = [12, 16, 20, 26, 30, 34, 40, 50, 60, 70, 80, 95];

if (process.argv.includes("--cajas")) {
  /* Verificación de encuadre: imprime la caja de tinta REAL de cada ventana.
     Existe porque el primer reparto de bandas metió el remate del logotipo y
     media línea de "SUBJECT" dentro de la pieza del título del panel 01: dos
     piezas trazando la misma tinta y una tercera sin trazar ninguna. Una banda
     mal puesta no falla, sale fea. */
  for (const [nombre, bandas, xr] of PIEZAS) {
    const v = ventana(bandas, xr);
    let ax = 1e9, bx = -1, ay = 1e9, by = -1, n = 0;
    for (let y = v.y0; y <= v.y1; y++) for (let x = v.x0; x <= v.x1; x++) if (lum(x, y) > 22) {
      n++; if (x < ax) ax = x; if (x > bx) bx = x; if (y < ay) ay = y; if (y > by) by = y;
    }
    const holgura = n ? `x +${ax - v.x0}/-${v.x1 - bx}  y +${ay - v.y0}/-${v.y1 - by}` : "SIN TINTA";
    console.log(nombre.padEnd(11), `ventana ${v.x0}..${v.x1} × ${v.y0}..${v.y1}`.padEnd(30), holgura);
  }
  process.exit(0);
}

if (process.argv.includes("--barrer")) {
  const soloA = process.argv.indexOf("--pieza");
  const filtro = soloA > -1 ? process.argv[soloA + 1] : null;
  for (const [nombre, bandas, xr, us, opc] of PIEZAS) {
    if (filtro && nombre !== filtro) continue;
    if (us.length > 1) { console.log(nombre.padEnd(11), "capas — el barrido lineal no aplica"); continue; }
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
    ` *   ${nombre.padEnd(11)} ${us.join("/").padEnd(11)} ${grises.join("/").padEnd(12)} ${mae.toFixed(2).padStart(6)}   ${String(nodos).padStart(5)}`
  );
  process.stdout.write(`${nombre} `);
}
console.log();

/* Códigos de barras, QR y reglas rojas: leídos columna por columna, no trazados.
   Las cajas salen de barrer la referencia con umbral 25 (ver la sonda
   scripts/lamina/_t0104_izq_probe.mjs), no de mirarlas. */
arte.p01Barras = barras(259, 336, 353, 371, { piso: 2 });
arte.p01BarrasG = barras(69, 391, 423, 438, { piso: 2 });
arte.p06Barras = barras(26, 212, 563, 578, { piso: 2 });
arte.p06Qr = retabla(343, 561, 34, 22);

/* Las dos reglas rojas del panel 07 son 2 px de alto y las cuatro columnas las
   cortan en cuatro tramos; el piso baja a 4 porque su tinta media es 9-16, muy
   por debajo del de un código de barras, y con el piso normal desaparecen. */
arte.p07Rojo1 = barras(20, 399, 795, 796, { piso: 4, salto: 3, color: true });
arte.p07Rojo2 = barras(20, 399, 837, 838, { piso: 4, salto: 3, color: true });

const cab = `/**
 * t01-04 · BLOQUE IZQUIERDA · ARTE FIJA TRAZADA — NO SE EDITA A MANO.
 *
 * Generado desde reference/canon/t01-04-archive-tree.png con
 * scripts/lamina/arte-t01-04-izq.mjs. Las coordenadas están en el sistema de
 * la caja del bloque (left:4 top:88), o sea corridas −4,−88 respecto del
 * póster.
 *
 * Ningún relleno de acá está elegido a ojo. Cada pieza se rasteriza sobre
 * negro y un descenso por coordenadas busca la luminancia —o las tres, si es
 * un organismo por capas— que menos error absoluto medio deja contra el
 * original. El TONO sale del promedio RGB de la tinta real de esa ventana,
 * reescalado a esa luminancia.
 *
 *   pieza       umbrales    rellenos      MAE   nodos
${informe.join("\n")}
 *
 * Los dos códigos de barras se leen COLUMNA POR COLUMNA y el QR celda por
 * celda: vtracer les inventa esquinas y les come ~38 % de la tinta.
 *
 * Las cifras del póster que van como texto de verdad (los valores de la ficha,
 * los tiempos del panel 07) NO están acá: el canon pide que las cifras se
 * presenten como texto dentro de un contenedor data-symbolic, no como dibujo.
 * Lo que está acá son masas y rótulos sin cifras.
 */
export type Glifo = { x: number; y: number; w: number; h: number; vw: number; vh: number; d: [string, string][] };
export type Capa = { c: string; g: Glifo[] };
export type Barras = { y: number; h: number; tramos: number[][] };
export type Retabla = { x: number; y: number; w: number; h: number; celdas: number[][] };
`;

const tipo = (k) => (k === "p06Qr" ? "Retabla" : k.includes("Barras") ? "Barras" : "Capa[]");
const cuerpo = Object.entries(arte)
  .map(([k, v]) => `export const ${k} = ${JSON.stringify(v)} as unknown as ${tipo(k)};`)
  .join("\n\n");

writeFileSync(DESTINO, cab + "\n" + cuerpo + "\n");
rmSync(TMP, { recursive: true, force: true });
console.log("ok →", DESTINO);
