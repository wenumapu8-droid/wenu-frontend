#!/usr/bin/env node
/**
 * KODEX-∞ · MEDIDOR DE CAJAS
 *
 * Deduce la retícula de paneles de una referencia y emite su mapa de cajas.
 * Corre sobre las 17 sin tocar nada a mano.
 *
 * Reemplaza a detect-regions.mjs para el trabajo de producción, y arregla los
 * dos fallos que ese tenía y que costaron caro:
 *
 * ① UMBRAL FIJO. detect-regions usa tinta > 26, calibrado contra DESCENT
 *    TUNNEL, que tiene marcos naranja brillante. Los de SIGNAL BLOOM son
 *    magenta tenue con pico 23-28: con 26 la lámina entera sale sin paneles.
 *    Acá el umbral se deriva de la propia imagen (percentil de lo encendido),
 *    así cada lámina se mide con su propia escala.
 *
 * ② LA OBRA FABRICA REGLAS FALSAS. En SIGNAL BLOOM el detector marcó una
 *    "columna maestra" en x=835 que no es un marco: es el eje de simetría de la
 *    floración. Un organismo simétrico produce un tramo continuo perfecto y se
 *    lee como chrome. Acá se exige que la regla aparezca en VARIAS bandas
 *    horizontales distintas: un marco cruza toda la lámina, un eje de simetría
 *    solo existe donde está el organismo.
 *
 * Uso:
 *   node scripts/lamina/medir-cajas.mjs <slug>     # una
 *   node scripts/lamina/medir-cajas.mjs --todas    # las 17
 */

import { PNG } from "pngjs";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const CANON = join(ROOT, "reference", "canon");

/** Tramo continuo más largo, tolerando huecos cortos (muescas, etiquetas). */
function tramo(get, n, tol = 6) {
  let best = 0, run = 0, gap = 0;
  for (let i = 0; i < n; i++) {
    if (get(i)) { run += gap + 1; gap = 0; if (run > best) best = run; }
    else if (run > 0 && gap < tol) gap++;
    else { run = 0; gap = 0; }
  }
  return best;
}

function agrupar(lista, sep = 6) {
  const out = [];
  let a = null, b = null;
  for (const v of lista) {
    if (a === null) { a = b = v; continue; }
    if (v - b <= sep) { b = v; continue; }
    out.push(Math.round((a + b) / 2));
    a = b = v;
  }
  if (a !== null) out.push(Math.round((a + b) / 2));
  return out;
}

function medir(slug) {
  const p = join(CANON, `${slug}.png`);
  const img = PNG.sync.read(readFileSync(p));
  const { width: W, height: H, data } = img;
  const lum = (x, y) => {
    const i = (y * W + x) * 4;
    return (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
  };

  /**
   * Umbral por imagen, y va BAJO a propósito.
   *
   * El primer intento tomó el percentil 55 de la tinta y salió al revés: la
   * mayor parte de la tinta de una lámina es la OBRA —el organismo, que es lo
   * más brillante— mientras que los marcos son hilos apagados. Medido en SIGNAL
   * BLOOM, los marcos pican en 23-28 y el p55 dio 23: justo encima, así que la
   * lámina entera salió sin paneles.
   *
   * El chrome vive cerca del piso, no de la mediana. Se toma el percentil 12 de
   * lo no-negro, acotado a [7, 16]. Es agresivo, y puede: el ruido no sobrevive
   * ni al tramo continuo ni al voto por franjas.
   */
  const muestras = [];
  for (let y = 0; y < H; y += 3) for (let x = 0; x < W; x += 3) {
    const v = lum(x, y);
    if (v > 3) muestras.push(v);
  }
  muestras.sort((a, b) => a - b);
  const INK = Math.max(7, Math.min(16, muestras[Math.floor(muestras.length * 0.12)] ?? 9));

  /**
   * Reglas verticales confirmadas por bandas.
   * Se parte la altura en 5 franjas y se exige que la columna sea un tramo
   * largo en al menos 3. Así el eje de un organismo — que solo existe donde
   * está el organismo — no pasa, y un marco real sí.
   */
  const franjas = 5;
  const altoF = Math.floor(H / franjas);
  const votosV = new Int8Array(W);
  for (let f = 0; f < franjas; f++) {
    const y0 = f * altoF, hh = f === franjas - 1 ? H - y0 : altoF;
    for (let x = 0; x < W; x++) {
      if (tramo((k) => lum(x, y0 + k) > INK, hh) / hh > 0.75) votosV[x]++;
    }
  }
  const colsRaw = [];
  for (let x = 0; x < W; x++) if (votosV[x] >= 3) colsRaw.push(x);
  const cols = agrupar(colsRaw);

  // Reglas horizontales: se miden DENTRO de cada columna, que es donde viven.
  const bordes = [0, ...cols, W - 1].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
  const columnas = [];
  for (let i = 0; i < bordes.length - 1; i++) {
    const x0 = bordes[i], x1 = bordes[i + 1], w = x1 - x0;
    if (w < 60) continue;
    const filasRaw = [];
    for (let y = 0; y < H; y++) {
      if (tramo((k) => lum(x0 + k, y) > INK, w) / w > 0.88) filasRaw.push(y);
    }
    const filas = agrupar(filasRaw);
    if (filas.length < 2) continue;

    const paneles = [];
    for (let j = 0; j < filas.length - 1; j++) {
      const y0 = filas[j], y1 = filas[j + 1], h = y1 - y0;
      if (h < 40) continue;
      // Densidad: una celda vacía es aire entre paneles, no un panel.
      let n = 0, vistos = 0;
      const paso = Math.max(1, Math.floor(Math.min(w, h) / 30));
      for (let yy = y0; yy < y1; yy += paso) for (let xx = x0; xx < x1; xx += paso) {
        vistos++; if (lum(xx, yy) > INK) n++;
      }
      if (vistos && n / vistos < 0.015) continue;
      paneles.push({ x: x0, y: y0, w, h, densidad: +(n / vistos).toFixed(3) });
    }
    if (paneles.length) columnas.push({ x0, x1, paneles });
  }

  return { slug, px: `${W}x${H}`, umbral: INK, columnas: cols, bandas: columnas };
}

const arg = process.argv[2];
const slugs = arg === "--todas"
  ? readdirSync(CANON).filter((f) => f.endsWith(".png")).map((f) => f.replace(/\.png$/, "")).sort()
  : [arg];

if (!arg) { console.error("uso: node scripts/lamina/medir-cajas.mjs <slug> | --todas"); process.exit(2); }

mkdirSync(join(HERE, "cajas"), { recursive: true });
const resumen = [];

for (const slug of slugs) {
  if (!existsSync(join(CANON, `${slug}.png`))) { console.log(`  ${slug}: sin referencia`); continue; }
  const r = medir(slug);
  const total = r.bandas.reduce((a, b) => a + b.paneles.length, 0);
  writeFileSync(join(HERE, "cajas", `${slug}.json`), JSON.stringify(r, null, 2));
  resumen.push({ slug, umbral: r.umbral, columnas: r.columnas.length, paneles: total });
  console.log(
    `  ${slug.padEnd(26)} umbral ${String(r.umbral).padStart(2)}  ` +
    `${String(r.columnas.length).padStart(2)} columnas  ${String(total).padStart(2)} paneles`
  );
}

writeFileSync(join(HERE, "cajas", "_resumen.json"), JSON.stringify(resumen, null, 2));
console.log(`\n  ${resumen.length} láminas → scripts/lamina/cajas/\n`);
