#!/usr/bin/env node
/**
 * KODEX-∞ · DETECTOR DE PANELES
 *
 * Lee una referencia y deduce su retícula: dónde están los marcos de los
 * paneles. Emite scripts/lamina/regions/<slug>.json, que es lo que usa
 * compare.mjs para puntuar por región.
 *
 * Por qué automático y no a ojo: son 17 láminas con entre 8 y 11 paneles cada
 * una. Tipear ~170 cajas a mano es lento, se equivoca y no se puede rehacer
 * cuando llegue una referencia nueva. Y sobre todo: las cajas medidas del
 * archivo son la verdad, mientras que las estimadas mirando la imagen son otra
 * capa de error metida justo en el instrumento de medición.
 *
 * Cómo: las láminas son marcos claros de 1px sobre negro. Una fila que es
 * mayoritariamente no-negra a lo ancho es una regla horizontal; lo mismo por
 * columnas. Cruzando reglas sale la retícula. No detecta paneles sin marco
 * — para esos queda el ajuste manual sobre el JSON, que es la excepción.
 *
 * Uso: node scripts/lamina/detect-regions.mjs <slug> [--min-run 0.55] [--dump]
 */

import { PNG } from "pngjs";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

const slug = process.argv[2];
if (!slug) {
  console.error("uso: node scripts/lamina/detect-regions.mjs <slug>");
  process.exit(2);
}
const arg = (n, d) => {
  const i = process.argv.indexOf(n);
  return i > -1 ? Number(process.argv[i + 1]) : d;
};
/**
 * Fracción del ancho/alto que un TRAMO CONTINUO debe cubrir para contar como
 * regla. Baja a propósito: el marco de un panel cruza su columna, no la lámina
 * entera. Con 0.55 solo se detecta el marco exterior — que fue justo lo que
 * pasó en la primera corrida.
 */
const MIN_RUN = arg("--min-run", 0.16);
/** Píxeles apagados que se toleran dentro de un tramo antes de darlo por roto. */
const GAP_TOL = arg("--gap", 6);
/** Luminancia por encima de la cual un píxel cuenta como "tinta". */
const INK = arg("--ink", 26);
/** Panel más chico que esto se descarta: es un separador, no un panel. */
const MIN_W = arg("--min-w", 90);
const MIN_H = arg("--min-h", 46);

const refPath = join(ROOT, "reference", "canon", `${slug}.png`);
if (!existsSync(refPath)) {
  console.error(`no existe la referencia: ${refPath}`);
  process.exit(2);
}

const img = PNG.sync.read(readFileSync(refPath));
const { width: W, height: H, data } = img;

const lum = new Uint8Array(W * H);
for (let i = 0, p = 0; i < data.length; i += 4, p++) {
  lum[p] = (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
}
const ink = (x, y) => lum[y * W + x] > INK;

/**
 * Una regla no es "muchos píxeles encendidos" sino "un tramo largo continuo".
 * Un panel lleno de texto también enciende media fila, pero en trocitos; se
 * distingue por el largo del tramo, no por el total.
 */
function longestRun(getter, n, gapTol = GAP_TOL) {
  let best = 0;
  let run = 0;
  let gap = 0;
  for (let i = 0; i < n; i++) {
    if (getter(i)) {
      // Un hueco corto no rompe el tramo: los marcos traen muescas, esquinas
      // cortadas y etiquetas encima del borde ("01. SCENE DESCRIPTION" se come
      // un pedazo de su propia línea superior). Sin esta tolerancia cada marco
      // se parte en cuatro tramos cortos y ninguno pasa el umbral.
      run += gap + 1;
      gap = 0;
      if (run > best) best = run;
    } else if (run > 0 && gap < gapTol) {
      gap++;
    } else {
      run = 0;
      gap = 0;
    }
  }
  return best;
}

const rowsRaw = [];
for (let y = 0; y < H; y++) {
  const r = longestRun((x) => ink(x, y), W) / W;
  if (r >= MIN_RUN) rowsRaw.push(y);
}
const colsRaw = [];
for (let x = 0; x < W; x++) {
  const r = longestRun((y) => ink(x, y), H) / H;
  if (r >= MIN_RUN) colsRaw.push(x);
}

/** Un marco de 1px sobre otro da dos líneas pegadas: se colapsan. */
function cluster(list, gap = 4) {
  const out = [];
  let start = null;
  let prev = null;
  for (const v of list) {
    if (start === null) { start = prev = v; continue; }
    if (v - prev <= gap) { prev = v; continue; }
    out.push(Math.round((start + prev) / 2));
    start = prev = v;
  }
  if (start !== null) out.push(Math.round((start + prev) / 2));
  return out;
}

const rows = cluster(rowsRaw);
const cols = cluster(colsRaw);
if (!rows.includes(0)) rows.unshift(0);
if (!cols.includes(0)) cols.unshift(0);
if (rows[rows.length - 1] < H - 1) rows.push(H - 1);
if (cols[cols.length - 1] < W - 1) cols.push(W - 1);

/** Densidad de tinta: una celda vacía no es un panel, es aire. */
function density(x, y, w, h) {
  let n = 0;
  const step = Math.max(1, Math.floor(Math.min(w, h) / 40));
  let seen = 0;
  for (let j = y; j < y + h; j += step) {
    for (let i = x; i < x + w; i += step) {
      seen++;
      if (ink(i, j)) n++;
    }
  }
  return seen ? n / seen : 0;
}

const regions = [];
for (let r = 0; r < rows.length - 1; r++) {
  for (let c = 0; c < cols.length - 1; c++) {
    const x = cols[c];
    const y = rows[r];
    const w = cols[c + 1] - x;
    const h = rows[r + 1] - y;
    if (w < MIN_W || h < MIN_H) continue;
    const d = density(x, y, w, h);
    if (d < 0.012) continue; // celda vacía
    regions.push({
      id: `r${String(r).padStart(2, "0")}c${String(c).padStart(2, "0")}`,
      nombre: null,
      x, y, w, h,
      densidad: +d.toFixed(3),
    });
  }
}

const outPath = join(HERE, "regions", `${slug}.json`);
mkdirSync(dirname(outPath), { recursive: true });

// Conserva los nombres ya puestos a mano: el detector se puede volver a correr
// sin perder el trabajo de etiquetado.
let previos = {};
if (existsSync(outPath)) {
  try {
    for (const r of JSON.parse(readFileSync(outPath, "utf8")).regions ?? []) {
      if (r.nombre) previos[r.id] = r.nombre;
    }
  } catch { /* archivo previo ilegible: se regenera */ }
}
for (const r of regions) if (previos[r.id]) r.nombre = previos[r.id];

writeFileSync(
  outPath,
  JSON.stringify(
    {
      _nota: "Generado por detect-regions.mjs desde la referencia. `nombre` se edita a mano y sobrevive a re-corridas.",
      slug,
      px: `${W}x${H}`,
      reglas: { horizontales: rows.length, verticales: cols.length },
      regions,
    },
    null,
    2
  )
);

console.log(`\n  ${slug}  ${W}x${H}`);
console.log(`  reglas: ${cols.length} verticales · ${rows.length} horizontales`);
console.log(`  paneles detectados: ${regions.length}`);
console.log(`  → scripts/lamina/regions/${slug}.json\n`);
for (const r of regions.slice(0, 40)) {
  console.log(`    ${r.id}  ${String(r.x).padStart(4)},${String(r.y).padStart(4)}  ${String(r.w).padStart(4)}x${String(r.h).padStart(3)}  densidad ${r.densidad}`);
}
