#!/usr/bin/env node
/**
 * KODEX-∞ · u10-commons · ¿DÓNDE ESTÁ EL CENTRO DEL CAMPO?
 *
 * `hero-center` es una franja vertical de 256 px que pasa por el eje del campo.
 * Su tinta está 13 % de más y, sobre todo, MAL REPARTIDA: sobra en el medio y
 * falta arriba. Antes de mover nada hay que saber si el eje del render está
 * donde el de la referencia.
 *
 * El dato que dispara esto: `scripts/lamina/campo/u10-commons.json` declara
 * `centro: [561, 760]`, pero eso NO se midió — `extraer-campo.mjs:58` lo toma
 * por defecto como `W/2, H*0.542` cuando no se le pasa `--centro`. O sea que
 * todo el campo está anclado a una constante inventada.
 *
 * Mide tres cosas, sobre referencia y render:
 *   1. centroide de tinta de la región del héroe
 *   2. centro por simetría: el (cx,cy) que iguala la tinta a cada lado
 *   3. perfil de tinta por filas y por columnas, en bandas
 *
 * Uso: node scripts/lamina/_u10_centro.mjs [slug] [--umbral 26]
 */
import { PNG } from "pngjs";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const slug = process.argv[2]?.startsWith("--") ? "u10-commons" : (process.argv[2] ?? "u10-commons");
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const UMBRAL = Number(arg("--umbral", 26));

const regiones = JSON.parse(readFileSync(join(ROOT, "scripts/lamina/regions", `${slug}.json`), "utf8"));
const lista = Array.isArray(regiones) ? regiones : (regiones.regions ?? regiones.regiones);
const cajas = Object.fromEntries(lista.map((r) => [r.id, r]));
/* La región del campo son las tres franjas del héroe juntas. */
const L = cajas["hero-left"], C = cajas["hero-center"], R = cajas["hero-right"];
const CAJA = { x: L.x, y: L.y, w: R.x + R.w - L.x, h: L.h };

function cargar(ruta) {
  const png = PNG.sync.read(readFileSync(ruta));
  const { width: W, data } = png;
  return {
    W, H: png.height,
    lum: (x, y) => {
      const i = (y * W + x) * 4;
      return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    },
  };
}

/** Centroide de tinta y perfiles de una caja. */
function medir(img, caja) {
  let n = 0, sx = 0, sy = 0;
  const filas = new Float64Array(caja.h);
  const cols = new Float64Array(caja.w);
  for (let y = caja.y; y < caja.y + caja.h; y++) {
    for (let x = caja.x; x < caja.x + caja.w; x++) {
      if (img.lum(x, y) > UMBRAL) {
        n++; sx += x; sy += y;
        filas[y - caja.y]++; cols[x - caja.x]++;
      }
    }
  }
  return { n, cx: sx / n, cy: sy / n, filas, cols };
}

/** Mediana ponderada de un perfil: parte la tinta en dos mitades iguales. */
function mediana(perfil, off) {
  let tot = 0;
  for (const v of perfil) tot += v;
  let acc = 0;
  for (let i = 0; i < perfil.length; i++) {
    acc += perfil[i];
    if (acc >= tot / 2) return i + off;
  }
  return off + perfil.length / 2;
}

const ref = cargar(join(ROOT, "reference", "canon", `${slug}.png`));
const actPath = join(ROOT, "scripts/lamina/out", slug, "actual.png");
const act = existsSync(actPath) ? cargar(actPath) : null;

console.log(`\n  ${slug} · campo x ${CAJA.x}..${CAJA.x + CAJA.w} y ${CAJA.y}..${CAJA.y + CAJA.h} · umbral ${UMBRAL}\n`);

const mr = medir(ref, CAJA);
const ma = act ? medir(act, CAJA) : null;

const fila = (t, m) =>
  `  ${t.padEnd(12)} tinta ${String(m.n).padStart(6)}   ` +
  `centroide (${m.cx.toFixed(1)}, ${m.cy.toFixed(1)})   ` +
  `mediana (${mediana(m.cols, CAJA.x)}, ${mediana(m.filas, CAJA.y)})`;
console.log(fila("REFERENCIA", mr));
if (ma) {
  console.log(fila("RENDER", ma));
  console.log(`\n  Δ centroide  x ${(ma.cx - mr.cx).toFixed(1)}   y ${(ma.cy - mr.cy).toFixed(1)}`);
  console.log(`  Δ mediana    x ${mediana(ma.cols, CAJA.x) - mediana(mr.cols, CAJA.x)}   y ${mediana(ma.filas, CAJA.y) - mediana(mr.filas, CAJA.y)}`);
}

/* Perfil por filas en bandas de 60 px: dónde vive la masa de cada lado. */
console.log(`\n  tinta por banda de 60 px (y absoluto de lámina):`);
console.log(`    y        ref   render     Δ`);
for (let b = 0; b < CAJA.h; b += 60) {
  let r = 0, a = 0;
  for (let k = b; k < Math.min(b + 60, CAJA.h); k++) { r += mr.filas[k]; if (ma) a += ma.filas[k]; }
  const d = ma ? a - r : 0;
  const marca = ma && Math.abs(d) > r * 0.25 ? (d > 0 ? "  ← sobra" : "  ← falta") : "";
  console.log(`    ${String(CAJA.y + b).padStart(4)}  ${String(r).padStart(6)}  ${String(a).padStart(6)}  ${String(d).padStart(6)}${marca}`);
}
