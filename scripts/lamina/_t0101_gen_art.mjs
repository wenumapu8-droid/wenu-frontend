/**
 * t01-01 · generador de ARTE FIJA TRAZADA para el bloque cabecera/pie/banda.
 *
 * Traza cada pieza con scripts/lamina/glyphs.mjs (vtracer sobre el original
 * sobremuestreado ×8) y elige el umbral BARRIENDO: para cada candidato rasteriza
 * el trazo sobre negro y lo compara contra la misma banda del PNG de referencia
 * con el mismo pixelmatch que usa el banco. Gana el que menos residuo deja.
 *
 * El color de cada glifo NO se elige: es la media de los píxeles de la
 * referencia que quedan por encima del umbral dentro de su caja, que es
 * exactamente la región que la silueta trazada cubre. Esta lámina lleva glifos
 * rojos y grises mezclados en la misma fila (los iconos), así que un color por
 * pieza no alcanza.
 *
 * Uso: node scripts/lamina/_t0101_gen_art.mjs [pieza...]
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import sharp from "sharp";
import pixelmatch from "pixelmatch";

const SLUG = "t01-01-threshold-portal";
const REF = `reference/canon/${SLUG}.png`;
const ref = PNG.sync.read(readFileSync(REF));
const { width: W, data } = ref;
const lum = (x, y) => { const i = (y * W + x) * 4; return (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8; };
const rgb = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
const hex = (c) => "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");

/** Media de color de los píxeles con luminancia > umbral dentro de una caja. */
function tinta(caja, umbral) {
  let a = [0, 0, 0], n = 0;
  for (let y = caja.y; y < caja.y + caja.h; y++)
    for (let x = caja.x; x < caja.x + caja.w; x++)
      if (lum(x, y) > umbral) { const c = rgb(x, y); a[0] += c[0]; a[1] += c[1]; a[2] += c[2]; n++; }
  return n ? a.map((v) => v / n) : [128, 128, 128];
}

/** Traza una banda y devuelve los glifos en coordenadas del póster. */
function trazar(band, xr, umbral) {
  execFileSync("node", ["scripts/lamina/glyphs.mjs", SLUG, "--band", band, "--x", xr, "--umbral", String(umbral)], { stdio: "pipe" });
  const man = JSON.parse(readFileSync(`scripts/lamina/glyphs/${SLUG}/manifiesto.json`, "utf8"));
  return man.glifos.map((g) => {
    const svg = readFileSync(`scripts/lamina/glyphs/${SLUG}/${g.id}.svg`, "utf8");
    const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
    /* El trazador emite cada path con su propio transform="translate(..)".
       Perderlo desarma el glifo: la contraforma de la O queda fuera de sitio. */
    const ds = [...svg.matchAll(/<path d="([^"]+)"(?:[^>]*transform="([^"]+)")?/g)].map((m) => [m[1], m[2] ?? ""]);
    return { x: g.caja.x, y: g.caja.y, w: g.caja.w, h: g.caja.h, vw: +vb[1], vh: +vb[2], c: hex(tinta(g.caja, umbral)), d: ds };
  });
}

/** Rasteriza los glifos sobre negro dentro de la ventana dada. */
async function pintar(glifos, win) {
  const cuerpo = glifos.map((g) =>
    `<svg x="${g.x - win.x}" y="${g.y - win.y}" width="${g.w}" height="${g.h}" viewBox="0 0 ${g.vw} ${g.vh}" preserveAspectRatio="none">` +
    g.d.map(([d, tr]) => `<path d="${d}" transform="${tr}" fill="${g.c}"/>`).join("") + `</svg>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${win.w}" height="${win.h}" viewBox="0 0 ${win.w} ${win.h}">` +
    `<rect width="${win.w}" height="${win.h}" fill="#000"/>${cuerpo}</svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * Residuo del trazo contra la referencia, con la MISMA métrica combinada que
 * score-panel.mjs: media del diff píxel a píxel y del error de luminancia por
 * bloques de 8. Barrer con otra fórmula que el banco es afinar contra un número
 * que después no se cobra.
 *
 * El término estructural no es decorativo acá: con la tolerancia del diff
 * (0,12) un negro y un gris #4C4C4C cuentan como iguales, y media lámina
 * —el emblema, el pie entero— es tinta de luminancia 76-113. Barriendo sólo con
 * el diff, "no dibujar el emblema" salía 0,04 % y ganaba el barrido.
 */
async function residuo(glifos, win) {
  const [a, b] = await Promise.all([
    sharp(REF).extract({ left: win.x, top: win.y, width: win.w, height: win.h }).png().toBuffer(),
    pintar(glifos, win),
  ]);
  const pa = PNG.sync.read(a), pb = PNG.sync.read(b);
  const bad = pixelmatch(pa.data, pb.data, null, win.w, win.h, { threshold: 0.12, includeAA: false });

  const BLOQUE = 8;
  const lumAt = (img, px, py) => { const i = (py * win.w + px) * 4; return (img.data[i] * 77 + img.data[i + 1] * 150 + img.data[i + 2] * 29) >> 8; };
  let acum = 0, bloques = 0;
  for (let by = 0; by < win.h; by += BLOQUE) for (let bx = 0; bx < win.w; bx += BLOQUE) {
    let sa = 0, sb = 0, c = 0;
    for (let yy = by; yy < Math.min(by + BLOQUE, win.h); yy++) for (let xx = bx; xx < Math.min(bx + BLOQUE, win.w); xx++) { sa += lumAt(pa, xx, yy); sb += lumAt(pb, xx, yy); c++; }
    if (c) { acum += Math.abs(sa / c - sb / c) / 255; bloques++; }
  }
  const est = bloques ? (acum / bloques) * 100 : 0;
  const pm = (bad / (win.w * win.h)) * 100;
  return { mae: +((pm + est) / 2).toFixed(4), pm, est };
}

/** Barre umbrales y se queda con el que menos residuo deja. */
async function barrer(nombre, band, xr, umbrales) {
  const [y0, y1] = band.split(",").map(Number);
  const [x0, x1] = xr.split(",").map(Number);
  const win = { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  let mejor = null;
  for (const u of umbrales) {
    const g = trazar(band, xr, u);
    const r = await residuo(g, win);
    if (!mejor || r.mae < mejor.mae) mejor = { u, ...r, g };
  }
  console.log(`  ${nombre.padEnd(11)} banda ${band.padEnd(9)} umbral ${String(mejor.u).padStart(3)}  ${mejor.mae.toFixed(2)}%  (pixel ${mejor.pm.toFixed(2)} · estructural ${mejor.est.toFixed(2)})  ${mejor.g.length} glifos`);
  return { ...mejor, nombre, band };
}

/**
 * Como barrer(), pero con varios tramos de x en la misma banda y un solo
 * umbral para todos. Hace falta en la tabla del encabezado: sus rótulos están
 * separados por divisorias verticales de 1 px que corren de y=21 a y=57, y una
 * banda continua se las llevaría puestas como si fueran glifos.
 */
async function barrerTramos(nombre, band, tramos, umbrales) {
  const [y0, y1] = band.split(",").map(Number);
  const x0 = Math.min(...tramos.map((t) => +t.split(",")[0]));
  const x1 = Math.max(...tramos.map((t) => +t.split(",")[1]));
  const win = { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  let mejor = null;
  for (const u of umbrales) {
    const g = tramos.flatMap((xr) => trazar(band, xr, u));
    const r = await residuo(g, win);
    if (!mejor || r.mae < mejor.mae) mejor = { u, ...r, g };
  }
  console.log(`  ${nombre.padEnd(11)} banda ${band.padEnd(9)} umbral ${String(mejor.u).padStart(3)}  ${mejor.mae.toFixed(2)}%  (pixel ${mejor.pm.toFixed(2)} · estructural ${mejor.est.toFixed(2)})  ${mejor.g.length} glifos`);
  return { ...mejor, nombre, band };
}

/** Columnas de un código de barras en luminancia 0-255, comprimidas por tramos. */
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

/** Corre las y al origen de la caja del panel. */
const correr = (gs, dy) => gs.map((g) => ({ ...g, y: g.y - dy }));

const PIEZAS = {
  hdrMarca:  () => barrer("hdrMarca",  "16,60",   "14,730",    [74, 78, 82, 85, 88, 92, 96]),
  hdrBajada: () => barrer("hdrBajada", "64,80",   "14,345",    [25, 32, 40, 50, 60]),
  hdrLema:   () => barrer("hdrLema",   "24,56",   "1395,1562", [14, 18, 22, 26, 30, 36]),
  hdrAla:    () => barrer("hdrAla",    "22,56",   "1563,1662", [8, 11, 14, 18, 22, 28]),
  ftrMarca:  () => barrer("ftrMarca",  "890,922", "14,172",    [24, 30, 34, 38, 44, 50]),
  ftrLema:   () => barrer("ftrLema",   "897,915", "636,875",   [12, 16, 20, 24, 28, 34]),
  ftrPpp:    () => barrer("ftrPpp",    "898,916", "1198,1412", [12, 16, 20, 24, 28, 34]),
  ftrAla:    () => barrer("ftrAla",    "892,930", "1478,1662", [6, 8, 10, 12, 14, 18]),
  icoUno:    () => barrer("icoUno",    "815,839", "1160,1656", [10, 14, 18, 22, 26, 32]),
  icoDos:    () => barrer("icoDos",    "840,862", "1160,1656", [10, 14, 18, 22, 26, 32]),
  /* Los títulos de la banda inferior van trazados SIN su ordinal: "09." "10."
     y "11." son cifras y el canon las quiere como texto de verdad. Las bandas
     arrancan después del punto del ordinal. La de ICON CLUSTERS muere en 811
     para no tragarse la regla del panel, que vive en 812-813. */
  titDT:     () => barrer("titDT",     "794,809", "45,240",    [18, 24, 30, 38, 46, 55]),
  titCP:     () => barrer("titCP",     "796,812", "800,950",   [18, 24, 30, 38, 46, 55]),
  titIC:     () => barrer("titIC",     "795,811", "1190,1410", [18, 24, 30, 38, 46, 55]),
  /* Rótulos de la tabla del encabezado. Se trazan porque no llevan cifras; sus
     VALORES no están acá y siguen siendo texto. Cuatro tramos y no una banda:
     entre celda y celda corren las divisorias del panel. */
  hdrClaves: () => barrerTramos("hdrClaves", "24,38", ["940,1000", "1050,1092", "1155,1192", "1268,1335"], [24, 32, 40, 50, 62, 75]),
};

const pedidas = process.argv.slice(2);
const nombres = pedidas.length ? pedidas : Object.keys(PIEZAS);

console.log("\n  barrido de umbrales (residuo = la métrica del banco sobre la banda)\n");
const res = {};
for (const n of nombres) res[n] = await PIEZAS[n]();

/* dy por pieza: origen de la caja del panel a la que pertenece. */
const DY = { hdrClaves: 0, hdrMarca: 0, hdrBajada: 0, hdrLema: 0, hdrAla: 0, ftrMarca: 880, ftrLema: 880, ftrPpp: 880, ftrAla: 880, icoUno: 792, icoDos: 792, titDT: 792, titCP: 792, titIC: 792 };
const DX = { icoUno: 1152, icoDos: 1152, titDT: 9, titCP: 769, titIC: 1152 };

/* Arranca de lo que ya hay en arte.ts: correr el generador para una sola pieza
   no puede borrar las otras nueve. */
const salida = {};
try {
  const previo = readFileSync("src/components/kodex/lamina/t01-01/arte.ts", "utf8");
  for (const m of previo.matchAll(/export const (\w+) = (\[.*?\]|\{.*?\}) as unknown/gs)) salida[m[1]] = JSON.parse(m[2]);
} catch { /* primera corrida */ }

for (const [n, v] of Object.entries(res)) {
  salida[n] = correr(v.g, DY[n]).map((g) => (DX[n] ? { ...g, x: g.x - DX[n] } : g));
}
salida.hdrBarras = barras(743, 893, 25, 54, 0);
salida.ftrBarras = barras(408, 568, 896, 916, 880);

const tabla = Object.values(res)
  .map((v) => ` *   ${v.nombre.padEnd(10)} ${v.band.padEnd(9)} ${String(v.u).padStart(6)} ${(v.mae.toFixed(2) + " %").padStart(9)}`)
  .join("\n");

const cab = `/**
 * t01-01 · ARTE FIJA TRAZADA — NO SE EDITA A MANO.
 *
 * Generado por scripts/lamina/_t0101_gen_art.mjs desde
 * reference/canon/t01-01-threshold-portal.png (vtracer sobre el original
 * sobremuestreado ×8). El umbral de cada pieza NO se eligió por criterio: se
 * barrieron varios y ganó el que menos residuo dejó contra su propia banda del
 * original, medido con el mismo pixelmatch del banco. Esta lámina es roja
 * intensa y los umbrales que sirvieron en SIGNAL BLOOM acá no sirven.
 *
 *   pieza      banda     umbral   residuo
${tabla}
 *
 * El color de cada glifo tampoco se eligió: es la media de los píxeles del
 * original por encima del umbral dentro de su caja, que es exactamente lo que
 * la silueta cubre. Va por glifo y no por pieza porque en los ICON CLUSTERS
 * conviven iconos rojos y grises en la misma fila.
 *
 * Coordenadas: x del póster salvo los iconos, que van corridos −1152 (origen de
 * su caja). Las y ya vienen corridas al origen de la caja de su panel.
 *
 * Los códigos de barras no son un patrón inventado: son la luminancia media por
 * columna del original, comprimida por tramos.
 *
 * La tabla de metadatos del encabezado NO está acá y no debe estarlo: sus
 * valores son cifras y el canon pide que las cifras vayan como texto de verdad
 * dentro de un contenedor data-symbolic, no como dibujo.
 */
export type Glifo = { x: number; y: number; w: number; h: number; vw: number; vh: number; c: string; d: [string, string][] };
export type Barras = { y: number; h: number; tramos: number[][] };
`;

const cuerpo = Object.entries(salida)
  .map(([k, v]) => `export const ${k} = ${JSON.stringify(v)} as unknown as ${k.includes("Barras") ? "Barras" : "Glifo[]"};`)
  .join("\n\n");

writeFileSync("src/components/kodex/lamina/t01-01/arte.ts", cab + "\n" + cuerpo + "\n");
console.log("\n  → src/components/kodex/lamina/t01-01/arte.ts\n");
