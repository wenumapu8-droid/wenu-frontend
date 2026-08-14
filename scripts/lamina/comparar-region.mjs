#!/usr/bin/env node
/**
 * KODEX-∞ · REFERENCIA CONTRA RENDER, POR REGIÓN
 *
 * `_medir_region_components.mjs` mide la referencia. Éste mide las dos y las
 * enfrenta: cuántos elementos hay de cada lado, cuánta tinta, y en qué franjas
 * de la región falta o sobra.
 *
 * Por qué existe: en `u10-commons` la región `hero-center` llevaba 2 h 23 de
 * ajustes a ojo con resultado plano. La causa apareció en la primera corrida de
 * esta comparación — la referencia tiene 35 componentes y el render 2, con 77 %
 * menos de tinta. La región no estaba descalibrada, estaba vacía; y no hay
 * ajuste de posición, tamaño ni opacidad que llene lo que no está dibujado.
 * Subir la opacidad, de hecho, empeoraba: engordaba el único borrón.
 *
 * La pregunta que contesta es la primera que hay que hacerse en una región que
 * no baja: **¿el problema es que está mal puesto, o que no está?**
 *
 * Uso:
 *   node scripts/lamina/comparar-region.mjs <slug> <region-id> [--umbral 26]
 */
import { PNG } from "pngjs";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

const [slug, regionId] = process.argv.slice(2);
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const UMBRAL = Number(arg("--umbral", 26));
const MIN_AREA = 80;

if (!slug || !regionId) {
  console.error("uso: node scripts/lamina/comparar-region.mjs <slug> <region-id> [--umbral 26]");
  process.exit(2);
}

const regionesPath = join(ROOT, "scripts", "lamina", "regions", `${slug}.json`);
const region = JSON.parse(readFileSync(regionesPath, "utf8")).regions.find(r => r.id === regionId);
if (!region) { console.error(`no existe la región ${regionId} en ${slug}`); process.exit(2); }

const ref = join(ROOT, "reference", "canon", `${slug}.png`);
const render = join(ROOT, "scripts", "lamina", "out", slug, "actual.png");
if (!existsSync(render)) {
  console.error(`no hay render: ${render}\ncorré primero  node scripts/lamina/iterate.mjs ${slug}`);
  process.exit(2);
}

/** Componentes conectados y perfil por filas dentro de la región. */
function medir(file) {
  const png = PNG.sync.read(readFileSync(file));
  const W = png.width;
  const { x: X0, y: Y0, w, h } = region;
  const lum = (x, y) => {
    const i = ((Y0 + y) * W + (X0 + x)) * 4;
    return 0.299 * png.data[i] + 0.587 * png.data[i + 1] + 0.114 * png.data[i + 2];
  };

  const mask = new Uint8Array(w * h);
  const filas = new Array(h).fill(0);
  let tinta = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (lum(x, y) > UMBRAL) { mask[y * w + x] = 1; filas[y]++; tinta++; }
    }
  }

  const parent = new Int32Array(w * h).fill(-1);
  const find = a => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
  const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[rb] = ra; };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!mask[i]) continue;
      parent[i] = i;
      if (x > 0 && mask[i - 1]) union(i, i - 1);
      if (y > 0 && mask[i - w]) union(i, i - w);
    }
  }
  const mapa = new Map();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!mask[i]) continue;
      const r = find(i);
      let c = mapa.get(r);
      if (!c) { c = { a: 0, x0: x, x1: x, y0: y, y1: y }; mapa.set(r, c); }
      c.a++;
      if (x < c.x0) c.x0 = x; if (x > c.x1) c.x1 = x;
      if (y < c.y0) c.y0 = y; if (y > c.y1) c.y1 = y;
    }
  }
  const comps = [...mapa.values()]
    .filter(c => c.a >= MIN_AREA && c.x0 > 0 && c.y0 > 0 && c.x1 < w - 1 && c.y1 < h - 1)
    .sort((a, b) => b.a - a.a);
  return { comps, filas, tinta, w, h };
}

const R = medir(ref);
const A = medir(render);
const pct = (a, b) => b === 0 ? "—" : `${((a / b - 1) * 100).toFixed(0)} %`;

console.log(`\n  ${slug} · ${regionId} · ${region.w}×${region.h} px · umbral ${UMBRAL}\n`);
console.log(`  componentes   referencia ${String(R.comps.length).padStart(4)}    render ${String(A.comps.length).padStart(4)}`);
console.log(`  tinta         referencia ${String(R.tinta).padStart(6)} px  render ${String(A.tinta).padStart(6)} px   ${pct(A.tinta, R.tinta)}`);

// El veredicto grueso, que es el que decide qué clase de trabajo toca.
const faltanComps = R.comps.length - A.comps.length;
const razonTinta = R.tinta ? A.tinta / R.tinta : 1;
console.log("");
if (razonTinta < 0.6 || faltanComps > R.comps.length * 0.4) {
  console.log("  → La región está VACÍA, no descalibrada. Faltan elementos: hay que");
  console.log("    construirlos. Ningún ajuste de posición, tamaño u opacidad llena");
  console.log("    lo que no está dibujado, y subir la opacidad sólo engorda lo que ya hay.");
} else if (razonTinta > 1.4) {
  console.log("  → El render tiene MÁS tinta que la referencia: sobra densidad.");
  console.log("    Buscá qué se está dibujando de más antes de mover lo que ya calza.");
} else {
  console.log("  → Cantidad de tinta comparable: acá sí el problema es de forma y");
  console.log("    posición. Compará los componentes uno a uno.");
}

const FRANJA = Math.max(50, Math.round(R.h / 12));
console.log(`\n  por franjas de ${FRANJA} px (y relativo a la región):`);
for (let b = 0; b * FRANJA < R.h; b++) {
  const suma = f => f.slice(b * FRANJA, (b + 1) * FRANJA).reduce((s, v) => s + v, 0);
  const sr = suma(R.filas), sa = suma(A.filas);
  if (!sr && !sa) continue;
  let nota = "";
  if (sr > 200 && sa === 0) nota = "  ← el render no dibuja NADA acá";
  else if (sr > 200 && sa < sr * 0.25) nota = "  ← casi vacío";
  else if (sa > sr * 1.6 && sa > 200) nota = "  ← el render carga de más";
  console.log(`    y ${String(b * FRANJA).padStart(4)}-${String(Math.min((b + 1) * FRANJA, R.h) - 1).padStart(4)}   ref ${String(sr).padStart(5)}   render ${String(sa).padStart(5)}${nota}`);
}

console.log(`\n  elementos de la referencia y qué hay cerca en el render:`);
console.log("   #  referencia                     render más cercano             dist");
const f = c => `(${c.x0},${c.y0}) ${c.x1 - c.x0 + 1}×${c.y1 - c.y0 + 1} a=${c.a}`;
for (const [i, r] of R.comps.slice(0, 15).entries()) {
  const rc = [(r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2];
  let mej = null, md = Infinity;
  for (const a of A.comps) {
    const d = Math.hypot(rc[0] - (a.x0 + a.x1) / 2, rc[1] - (a.y0 + a.y1) / 2);
    if (d < md) { md = d; mej = a; }
  }
  const lejos = md > 20 ? "  ← sin correspondencia" : "";
  console.log(`  ${String(i + 1).padStart(2)}. ${f(r).padEnd(30)} ${(mej ? f(mej) : "—").padEnd(29)} ${md === Infinity ? "—" : md.toFixed(0)}${lejos}`);
}
console.log("");
