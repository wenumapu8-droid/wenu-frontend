#!/usr/bin/env node
/**
 * KODEX-∞ · EL TRINQUETE
 * 2026-08-31
 *
 * ────────────────────────────────────────────────────────────────────────
 * QUÉ RESUELVE
 *
 * "Una escena que llega a PROVEN no puede retroceder porque otro agente leyó
 *  un documento viejo."
 *
 * Eso pasó todo el día. Cinco veces. Un agente monta algo, otro lee una
 * versión anterior y lo deshace sin saberlo. El trabajo no se pierde: se
 * REPITE, que sale igual de caro y además desmoraliza.
 *
 * Sin trinquete no se puede dormir tranquilo con agentes corriendo. Con
 * trinquete, lo peor que puede pasar de noche es que algo NO avance --
 * nunca que retroceda.
 *
 * ────────────────────────────────────────────────────────────────────────
 * CÓMO FUNCIONA
 *
 * Guarda, por escena, las condiciones que YA se cumplieron alguna vez. En
 * cada corrida vuelve a medirlas. Si una que estaba en verde ahora falla,
 * eso es una REGRESIÓN y sale con código 1 -- el autopilot para.
 *
 * No mide calidad. Mide que lo ganado siga ganado.
 *
 * ────────────────────────────────────────────────────────────────────────
 * POR QUÉ NO CONFÍA EN QUE ALGUIEN LO ACTUALICE A MANO
 *
 * El estado se deriva del build, no se declara. Un agente no puede escribir
 * "PROVEN" en un archivo: tiene que hacer que la condición se cumpla y el
 * trinquete la ve sola. Lo que se declara se puede mentir, aun sin querer.
 *
 * Uso: node scripts/kodex-trinquete.mjs [dist]
 *      node scripts/kodex-trinquete.mjs --reset   olvida y vuelve a medir
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const args = process.argv.slice(2);
const RESET = args.includes('--reset');
const DIST = args.find((a) => !a.startsWith('--')) || 'dist';
const ESTADO = 'command-center/kodex-trinquete.json';

const ESCENAS = [
  ['00 THRESHOLD', 'kodex/index.html'],
  ['01 PROLOGUE',  'kodex/folio/i/index.html'],
  ['02 DESCENT',   'kodex/folio/ii/index.html'],
  ['03 ARCHIVE',   'kodex/folio/iii/index.html'],
  ['04 MACHINE',   'kodex/folio/iv/index.html'],
  ['05 COSMOLOGY', 'kodex/folio/v/index.html'],
  ['06 RETURN',    'kodex/folio/vi/index.html'],
];

/* Condiciones OBJETIVAS. Ninguna pregunta si algo se ve bien -- eso lo
   decide el creador y ningún script debería opinarlo. Preguntan si la pieza
   sigue montada. */
const COND = {
  chasis:   (h) => h.includes('kdx-riel__tit'),
  corredor: (h) => h.includes('kdx-traza__paso'),
  carril:   (h) => h.includes('data-estado-canonico'),
  campo:    (h) => h.includes('kdx-campo-materia'),
  senal:    (h) => h.includes('kdx-punto'),
  honesto:  (h) => !h.includes('kdx-riel__tit') || /data-fuente="(REAL|HUECO|MOCK)"/.test(h),
};

let previo = {};
if (!RESET && existsSync(ESTADO)) {
  try { previo = JSON.parse(readFileSync(ESTADO, 'utf8')).escenas || {}; } catch {}
}

const ahora = {};
const regresiones = [];
const ganancias = [];

for (const [nombre, ruta] of ESCENAS) {
  const p = join(DIST, ruta);
  if (!existsSync(p)) {
    /* Un dist incompleto NO es una regresión: es un build a medias. Marcarlo
       como retroceso haría que el trinquete grite cada vez que alguien
       buildea al lado -- que es exactamente el falso positivo que nos costó
       el día. Se salta y se conserva lo que ya se sabía. */
    ahora[nombre] = previo[nombre] || {};
    continue;
  }
  const h = readFileSync(p, 'utf8');
  ahora[nombre] = {};
  for (const [k, fn] of Object.entries(COND)) {
    const ok = fn(h);
    ahora[nombre][k] = ok;
    const antes = previo[nombre]?.[k];
    if (antes === true && !ok) regresiones.push(`${nombre} · ${k}`);
    if (antes !== true && ok) ganancias.push(`${nombre} · ${k}`);
  }
}

/* El trinquete sólo avanza: una condición que estuvo en verde queda anotada
   como conseguida aunque el build de hoy no la vea. Si de verdad se rompió,
   sale en `regresiones` y alguien lo mira. */
const fusion = {};
for (const [esc, cs] of Object.entries(ahora)) {
  fusion[esc] = { ...(previo[esc] || {}) };
  for (const [k, v] of Object.entries(cs)) if (v) fusion[esc][k] = true;
}

mkdirSync(dirname(ESTADO), { recursive: true });
writeFileSync(ESTADO, JSON.stringify({
  actualizado: new Date().toISOString(),
  _doc: 'Lo ganado queda ganado. Derivado del build, nunca declarado a mano.',
  escenas: fusion,
}, null, 2) + '\n');

const total = ESCENAS.length * Object.keys(COND).length;
const conseguidas = Object.values(fusion).reduce((s, c) => s + Object.values(c).filter(Boolean).length, 0);

console.log(`\nTRINQUETE · KODEX−∞\n`);
console.log(`  ${conseguidas} / ${total} condiciones conseguidas`);
if (ganancias.length) {
  console.log(`\n  GANÓ`);
  for (const g of ganancias) console.log(`    + ${g}`);
}
if (regresiones.length) {
  console.log(`\n  ⚠️  RETROCEDIÓ  — algo que ya funcionaba dejó de funcionar`);
  for (const r of regresiones) console.log(`    − ${r}`);
  console.log(`\n  El autopilot para acá. Esto no se arregla de noche:`);
  console.log(`  alguien tiene que mirar qué lo deshizo.\n`);
  process.exit(1);
}
console.log(`\n  Sin retrocesos.\n`);
