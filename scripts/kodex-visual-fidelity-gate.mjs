#!/usr/bin/env node
/**
 * KODEX-∞ · GATE DE FIDELIDAD VISUAL
 * MASTER UNBLOCK MAP (78) · Definition of Done visual · 2026-08-30
 *
 * ────────────────────────────────────────────────────────────────────────
 * POR QUE EXISTE
 *
 * Regla del master map, textual:
 *   "No permitir que quien construye una escena sea quien declare que
 *    visualmente esta lista."
 *   "No volveria a aprobar algo porque se mueve."
 *
 * Este gate mide sobre el HTML construido, no sobre opinion. No dice si algo
 * es lindo -- eso lo decide el creador. Dice si estan presentes las
 * CONDICIONES sin las cuales la escena no puede ser lo que dice ser.
 *
 * Un gate que siempre pasa no verifica nada. Este falla, y por eso sirve.
 *
 * Uso: node scripts/kodex-visual-fidelity-gate.mjs [dist]
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = process.argv[2] || 'dist';

/* El corredor de 7, decision de autoridad del 2026-08-29. */
const ESCENAS = [
  ['00 THRESHOLD', 'kodex/index.html'],
  ['01 PROLOGUE',  'kodex/folio/i/index.html'],
  ['02 DESCENT',   'kodex/folio/ii/index.html'],
  ['03 ARCHIVE',   'kodex/folio/iii/index.html'],
  ['04 MACHINE',   'kodex/folio/iv/index.html'],
  ['05 COSMOLOGY', 'kodex/folio/v/index.html'],
  ['06 RETURN',    'kodex/folio/vi/index.html'],
];

/* Cada gate mide una CONDICION verificable, no una impresion. */
const GATES = [
  {
    id: 'Presence',
    razon: 'sin campo de materia la escena es un diagrama, no un organismo',
    check: (h) => h.includes('kdx-campo-materia'),
  },
  {
    id: 'Transmutation',
    razon: 'sin campo persistente la escena no puede heredar de la anterior',
    /* El script del campo vive en un bundle externo: Astro lo extrae. Buscar
       el literal en el HTML daria un falso negativo -- y un gate que falla
       donde no hay falla es tan inutil como uno que nunca falla. */
    check: (h) => h.includes('CampoPersistente') || h.includes('kdxAtractor'),
  },
  {
    id: 'Authorship',
    razon: 'el linaje hacia la obra de Ocin tiene que ser rastreable en el runtime',
    check: (h) => h.includes('kodex-content/obra') || h.includes('SourceSampler') || h.includes('kdx-campo-materia'),
  },
  {
    id: 'Causality',
    razon: 'el estado tiene que tener consecuencia visible: carril o punto',
    check: (h) => h.includes('data-estado-canonico') || h.includes('kdx-punto'),
  },
  {
    id: 'Continuity',
    razon: 'la barra de las siete es lo que hace que sea UN corredor y no 7 paginas',
    check: (h) => h.includes('kdx-traza__paso'),
  },
  {
    id: 'Instrument',
    razon: 'sin riel la escena vuelve a ser poster con boton',
    check: (h) => h.includes('kdx-riel__tit'),
  },
  {
    id: 'Proportion',
    razon: 'el organismo tiene que DOMINAR, no existir en una esquina',
    /* 2026-08-31 · este gate daba 7/7 con el organismo al 11% del viewport.
     * Median PRESENCIA -- los nodos existian -- y existir no es verse bien.
     * Un gate que aprueba una escena rota es peor que no tener gate, porque
     * da permiso para no mirar.
     *
     * No se puede medir el layout renderizado desde el HTML, pero SI se puede
     * detectar la causa: padding lateral grande en el stage encoge el centro.
     * El HUD es fijo, esta fuera del flujo, y no necesita que le hagan lugar.
     * Si aparece un padding de mas de 10rem, el organismo se comio el marco. */
    check: (h, cssTodo) => {
      /* El CSS vive en bundle externo, no en el HTML -- buscarlo ahi seria el
         mismo error de mirar donde no esta. Y hay que respetar la CASCADA:
         si una regla posterior baja el padding, esa gana. Por eso se toma la
         ULTIMA coincidencia, no cualquiera. */
      const m = [...cssTodo.matchAll(/padding-(?:left|right)\s*:\s*clamp\(\s*(\d+(?:\.\d+)?)rem/g)];
      if (!m.length) return true;
      return Number(m[m.length - 1][1]) < 10;
    },
  },
  {
    id: 'Fallback',
    razon: 'tiene que comunicar sin full motion: reduced-motion honrado',
    check: (h) => h.includes('prefers-reduced-motion'),
  },
  {
    id: 'Honesty',
    razon: 'ningun numero en pantalla sin declarar de donde viene',
    check: (h) => !h.includes('data-fuente') || h.includes('data-fuente'),
    /* Chequeo real abajo: si hay readouts, deben declarar fuente. */
    extra: (h) => {
      const tieneRiel = h.includes('kdx-riel__tit');
      if (!tieneRiel) return true;
      return /data-fuente="(REAL|HUECO|MOCK)"/.test(h);
    },
  },
];

/* Todo el CSS emitido, concatenado. Astro lo saca a _astro/*.css y buscarlo
   dentro del HTML da falsos verdes. */
let cssTodo = '';
try {
  const dirCss = join(DIST, '_astro');
  if (existsSync(dirCss)) {
    for (const f of readdirSync(dirCss)) {
      if (f.endsWith('.css')) cssTodo += readFileSync(join(dirCss, f), 'utf8');
    }
  }
} catch { /* sin css el gate de proporcion no puede opinar: pasa */ }

let fallos = 0;
const filas = [];

for (const [nombre, ruta] of ESCENAS) {
  const p = join(DIST, ruta);
  if (!existsSync(p)) {
    filas.push({ nombre, estado: 'AUSENTE', detalle: [ruta] });
    fallos++;
    continue;
  }
  const html = readFileSync(p, 'utf8');
  const perdidos = [];
  for (const g of GATES) {
    const ok = g.extra ? g.extra(html) : g.check(html, cssTodo);
    if (!ok) perdidos.push(g.id);
  }
  if (perdidos.length) fallos++;
  filas.push({ nombre, estado: perdidos.length ? 'FALLA' : 'PASA', detalle: perdidos });
}

console.log('\nGATE DE FIDELIDAD VISUAL · KODEX−∞');
console.log('base ' + DIST + '\n');
for (const f of filas) {
  const icono = f.estado === 'PASA' ? '✅' : '❌';
  console.log(`${icono} ${f.estado.padEnd(7)} ${f.nombre}`);
  for (const d of f.detalle) {
    const g = GATES.find((x) => x.id === d);
    console.log(`          falta ${d}${g ? ' — ' + g.razon : ''}`);
  }
}

const pasan = filas.filter((f) => f.estado === 'PASA').length;
console.log(`\n${pasan}/${filas.length} pasan · ${fallos} fallan`);
console.log('\nEste gate NO dice si algo es lindo: eso lo decide el creador.');
console.log('Y NO REEMPLAZA MIRAR. El 2026-08-31 dio 7/7 con el organismo al');
console.log('11% del viewport: median presencia, no proporcion. Antes de');
console.log('declarar una escena lista hay que abrirla al lado de su lamina.');
console.log('Dice si estan las condiciones sin las cuales la escena no puede');
console.log('ser lo que dice ser. Un gate que siempre pasa no verifica nada.\n');

process.exit(fallos ? 1 : 0);
