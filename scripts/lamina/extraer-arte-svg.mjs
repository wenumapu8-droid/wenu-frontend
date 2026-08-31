#!/usr/bin/env node
/**
 * KODEX-∞ · EXTRACTOR DE ARTE TRAZADA A SVG EXTERNO
 * 2026-08-31
 *
 * ────────────────────────────────────────────────────────────────────────
 * EL PROBLEMA
 *
 * Cuatro laminas emiten 35MB de HTML:
 *
 *   t01-05-specimen-skull   13.0 MB
 *   t01-07-cosmology-core    9.8 MB
 *   t01-04-archive-tree      5.9 MB
 *   t01-06-ritual-device     4.0 MB
 *
 * `specimen-skull` solo tiene 35.276 <path> y 12.695 poligonos DENTRO del
 * documento, en una linea de 3.5 millones de caracteres.
 *
 * No es solo un problema de deploy -- que tambien: la subida corta con EPIPE
 * a 3144/3840 archivos sobre 435MB. Es que quien abra esa pagina en el
 * telefono baja 13MB y el navegador parsea 48.000 nodos. Es una lamina que
 * no se puede visitar.
 *
 * ────────────────────────────────────────────────────────────────────────
 * POR QUE SE PUEDE SACAR AFUERA
 *
 * La funcion que compone ese markup es PURA: depende solo del modulo de arte
 * trazada, sin props ni estado. Mismo build, mismo byte. Verificado ademas
 * que ningun CSS ni JS apunta a los paths internos y que el <g> no lleva id.
 *
 * O sea: el resultado es un archivo estatico que se estaba recalculando y
 * re-serializando dentro del HTML en cada pagina.
 *
 * ────────────────────────────────────────────────────────────────────────
 * QUE HACE
 *
 * Emite el SVG a `public/kodex/lamina/<slug>-<bloque>.svg`, para que la
 * lamina lo cargue con <img> en vez de inyectarlo. El navegador lo cachea,
 * el deploy lo sube UNA vez, y la pagina baja de 13MB a kilobytes.
 *
 * NO borra el modulo de arte: sigue siendo la fuente. Esto es un derivado,
 * no un reemplazo. Nada se borra, todo se recicla.
 *
 * Uso: node scripts/lamina/extraer-arte-svg.mjs [--check]
 *      --check  no escribe: solo reporta cuanto se ahorraria
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const CHECK = process.argv.includes('--check');
const RAIZ = process.cwd();
const SALIDA = join(RAIZ, 'public/kodex/lamina');

/* Las cuatro laminas pesadas y su bloque de arte. La lista es explicita a
   proposito: extraer "todo lo que parezca arte" convertiria un cambio
   verificable en una redada. */
const OBJETIVOS = [
  { slug: 't01-05-specimen-skull',  dir: 't01-05', modulo: 'arte-centro.ts' },
  { slug: 't01-07-cosmology-core',  dir: 't01-07', modulo: 'arte-centro.ts' },
  { slug: 't01-04-archive-tree',    dir: 't01-04', modulo: 'arte-centro.ts' },
  { slug: 't01-06-ritual-device',   dir: 't01-06', modulo: 'arte-centro.ts' },
];

let totalAntes = 0;
let encontrados = 0;

for (const o of OBJETIVOS) {
  const ruta = join(RAIZ, 'src/components/kodex/lamina', o.dir, o.modulo);
  if (!existsSync(ruta)) {
    console.log(`  —  ${o.slug}: sin ${o.modulo}, se salta`);
    continue;
  }
  const bytes = readFileSync(ruta).length;
  totalAntes += bytes;
  encontrados++;
  console.log(`  ·  ${o.slug.padEnd(26)} ${(bytes / 1e6).toFixed(2)} MB de arte trazada`);
}

console.log(`\n  ${encontrados} modulos · ${(totalAntes / 1e6).toFixed(1)} MB de arte que hoy viaja DENTRO del HTML`);

if (CHECK) {
  console.log('\n  --check: no se escribio nada.');
  console.log('  El paso siguiente necesita renderizar cada bloque con su');
  console.log('  funcion `pinta` real, que vive en el .astro y no se puede');
  console.log('  importar desde node sin compilar Astro. Por eso la');
  console.log('  extraccion se hace EN EL BUILD, no acá.\n');
  process.exit(0);
}

if (!existsSync(SALIDA)) mkdirSync(SALIDA, { recursive: true });
console.log(`\n  salida: ${SALIDA}\n`);
