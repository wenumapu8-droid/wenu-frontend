#!/usr/bin/env node
/**
 * KODEX-∞ · ¿QUÉ LÁMINAS DESBORDAN EN UN TELÉFONO?
 * 2026-08-31
 *
 * 21 de 29 láminas no-t01 no tienen NI UNA media query: son solo-escritorio.
 * Pero "no tiene media query" no es lo mismo que "desborda" -- una lámina de
 * ancho fluido no necesita ninguna. Antes de tocar 21 archivos hay que saber
 * cuáles tienen el problema de verdad.
 *
 * Mide sobre el HTML CONSTRUIDO el ancho fijo más grande que declara cada
 * lámina, y lo compara contra 375px, que es el iPhone más angosto en uso.
 *
 * NO mide el render: para eso hace falta un navegador. Mide la DECLARACIÓN,
 * que es lo que se puede verificar sin él. Un ancho fijo de 1672px en un
 * viewport de 375 desborda sí o sí; uno de 320 no. Lo que quede en el medio
 * necesita ojo humano, y se reporta como tal en vez de adivinar.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = process.argv[2] || 'dist';
const MOVIL = 375;
const dir = join(DIST, 'kodex/lamina');
if (!existsSync(dir)) { console.log('sin dist/kodex/lamina'); process.exit(1); }

const filas = [];
for (const slug of readdirSync(dir)) {
  const f = join(dir, slug, 'index.html');
  if (!existsSync(f)) continue;
  const h = readFileSync(f, 'utf8');

  /* Anchos fijos declarados. Se ignoran los que viven dentro de un viewBox
     de SVG: ahí el ancho es del sistema de coordenadas, no del layout, y
     contarlos daría falsos positivos en cada lámina con arte vectorial. */
  const sinSvg = h.replace(/<svg[\s\S]*?<\/svg>/g, '');
  const anchos = [...sinSvg.matchAll(/width:\s*(\d{3,})px/g)].map((m) => +m[1]);
  const max = anchos.length ? Math.max(...anchos) : 0;
  const mq = (h.match(/@media/g) || []).length;

  /* Una lámina con andamio de ajuste (kdx-lam-fit / EscenaLamina) declara el
     ancho de la PLANCHA, no el del layout: la cámara la escala para que
     entre. Contarla como desborde sería un falso positivo -- y una auditoría
     que grita donde no hay fuego enseña a ignorarla. */
  const ajustada = h.includes('kdx-lam-fit') || h.includes('kdx-lam-camara');

  let estado;
  if (ajustada) estado = 'AJUSTADA';
  else if (max === 0) estado = 'FLUIDA';
  else if (max > MOVIL * 1.5) estado = 'DESBORDA';
  else if (max > MOVIL) estado = 'JUSTO';
  else estado = 'CABE';

  filas.push({ slug, max, mq, estado });
}

const orden = { DESBORDA: 0, JUSTO: 1, CABE: 2, FLUIDA: 3, AJUSTADA: 4 };
filas.sort((a, b) => orden[a.estado] - orden[b.estado] || b.max - a.max);

console.log(`\nOVERFLOW EN MÓVIL · ${MOVIL}px · ${filas.length} láminas\n`);
for (const f of filas) {
  const i = f.estado === 'DESBORDA' ? '❌' : f.estado === 'JUSTO' ? '⚠️ ' : f.estado === 'AJUSTADA' ? '🎥' : '✅';
  console.log(`${i} ${f.estado.padEnd(9)} ${f.slug.padEnd(28)} ${String(f.max).padStart(5)}px  ${f.mq} media-q`);
}

const d = filas.filter((f) => f.estado === 'DESBORDA').length;
const j = filas.filter((f) => f.estado === 'JUSTO').length;
console.log(`\n${d} desbordan · ${j} justas · ${filas.length - d - j} bien\n`);
console.log('Mide la DECLARACIÓN, no el render. Lo que sale JUSTO necesita');
console.log('ojo humano: un script no puede decidir eso sin un navegador.\n');
process.exit(d ? 1 : 0);
