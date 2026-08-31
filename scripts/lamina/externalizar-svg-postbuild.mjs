#!/usr/bin/env node
/**
 * KODEX-∞ · EXTERNALIZAR ARTE TRAZADA · postbuild
 * 2026-08-31
 *
 * ────────────────────────────────────────────────────────────────────────
 * EL PROBLEMA MEDIDO
 *
 *   t01-05-specimen-skull/index.html   13.0 MB
 *   t01-07-cosmology-core/index.html    9.8 MB
 *   t01-04-archive-tree/index.html      5.9 MB
 *   t01-06-ritual-device/index.html     4.0 MB   = 35 MB de HTML
 *
 * En specimen-skull: 35.276 <path> y 12.695 poligonos DENTRO del documento,
 * en una linea de 3.5 millones de caracteres. No es base64 -- verificado,
 * cero. Es arte vectorial trazada, serializada en el HTML.
 *
 * Rompe el deploy (EPIPE a 3144/3840 archivos sobre 435MB) y rompe la
 * pagina: en un telefono son 13MB de descarga y 48.000 nodos que parsear.
 * Es una lamina que no se puede visitar.
 *
 * ────────────────────────────────────────────────────────────────────────
 * POR QUE ESTO CORRE EN POSTBUILD Y NO ANTES
 *
 * La funcion que compone ese markup vive dentro del .astro y es PURA --
 * depende solo del modulo de arte, sin props ni estado. Pero importarla
 * desde node exigiria compilar Astro a mano. Sobre el HTML YA construido el
 * resultado es el mismo y ademas es verificable byte a byte.
 *
 * Se comprobo antes de tocar nada: ningun CSS ni JS apunta a los paths
 * internos, y el <g> que los contiene no lleva id ni clase. Nadie los
 * estiliza, asi que sacarlos a un <img> no cambia el render.
 *
 * ────────────────────────────────────────────────────────────────────────
 * QUE HACE
 *
 *   1. encuentra el <svg> gigante de cada lamina pesada
 *   2. lo escribe como archivo .svg propio
 *   3. lo reemplaza por un <img> que lo apunta
 *
 * NADA SE BORRA. El modulo de arte sigue siendo la fuente; el .svg es un
 * derivado del build. Si esto se revierte, la lamina vuelve a inlinear.
 *
 * Uso: node scripts/lamina/externalizar-svg-postbuild.mjs [dist] [--dry]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const DIST = args.find((a) => !a.startsWith('--')) || 'dist';

/* Umbral: por debajo de 1MB no vale la pena -- el <img> agrega un request y
   para un SVG chico eso es peor que inlinearlo. */
const UMBRAL = 1_000_000;

const LAMINAS = [
  't01-05-specimen-skull',
  't01-07-cosmology-core',
  't01-04-archive-tree',
  't01-06-ritual-device',
];

let ahorro = 0;
let tocadas = 0;

for (const slug of LAMINAS) {
  const html = join(DIST, 'kodex/lamina', slug, 'index.html');
  if (!existsSync(html)) {
    console.log(`  —  ${slug}: no esta en ${DIST}`);
    continue;
  }

  const antes = statSync(html).size;
  let doc = readFileSync(html, 'utf8');
  /* Los bloques pesados no son UN svg grande: son miles de <svg> chicos
     anidados dentro de uno externo. Una regex no-greedy agarra el interno y
     no ahorra nada -- por eso hace falta un escaner balanceado que tome el
     <svg> de afuera con todo su contenido. */
  const salidaDir = join(DIST, 'kodex/lamina', slug);
  let n = 0;
  let cursor = 0;
  const trozos = [];

  while (true) {
    const ini = doc.indexOf('<svg', cursor);
    if (ini === -1) { trozos.push(doc.slice(cursor)); break; }

    // recorrer hasta el </svg> que cierra ESTE, contando anidados
    let prof = 0;
    let i = ini;
    let fin = -1;
    while (i < doc.length) {
      const abre = doc.indexOf('<svg', i);
      const cierra = doc.indexOf('</svg>', i);
      if (cierra === -1) break;
      if (abre !== -1 && abre < cierra) { prof++; i = abre + 4; continue; }
      prof--;
      if (prof === 0) { fin = cierra + 6; break; }
      i = cierra + 6;
    }
    if (fin === -1) { trozos.push(doc.slice(cursor)); break; }

    const todo = doc.slice(ini, fin);
    trozos.push(doc.slice(cursor, ini));

    if (todo.length < UMBRAL) {
      trozos.push(todo);
    } else {
      n++;
      const nombre = `arte-${n}.svg`;
      const viewBox = (todo.match(/viewBox="([^"]+)"/) || [])[1] || '';
      const w = (todo.match(/\swidth="(\d+)"/) || [])[1] || '';
      const h = (todo.match(/\sheight="(\d+)"/) || [])[1] || '';
      if (!DRY) {
        const svg = todo.startsWith('<svg xmlns')
          ? todo
          : todo.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        mkdirSync(salidaDir, { recursive: true });
        writeFileSync(join(salidaDir, nombre), svg);
      }
      ahorro += todo.length;
      /* aria-hidden porque el bloque original tambien lo era: es arte, no
         informacion. eager porque ES la escena, no un adorno de abajo. */
      trozos.push(
        `<img src="./${nombre}"${w ? ` width="${w}"` : ''}${h ? ` height="${h}"` : ''}` +
        ` alt="" aria-hidden="true" loading="eager" decoding="async"` +
        ` style="display:block" data-kdx-arte-externa="${viewBox}">`,
      );
    }
    cursor = fin;
  }
  doc = trozos.join('');

  if (n === 0) {
    console.log(`  ·  ${slug.padEnd(26)} sin bloques sobre el umbral`);
    continue;
  }

  if (!DRY) writeFileSync(html, doc);
  const despues = DRY ? antes : statSync(html).size;
  tocadas++;
  console.log(
    `  ${DRY ? '·' : '✓'}  ${slug.padEnd(26)} ` +
    `${(antes / 1e6).toFixed(1)} MB → ${(despues / 1e6).toFixed(2)} MB` +
    `   (${n} bloque${n > 1 ? 's' : ''} afuera)`,
  );
}

console.log(
  `\n  ${tocadas} laminas · ${(ahorro / 1e6).toFixed(1)} MB fuera del HTML` +
  `${DRY ? '  [--dry: no se escribio nada]' : ''}\n`,
);
