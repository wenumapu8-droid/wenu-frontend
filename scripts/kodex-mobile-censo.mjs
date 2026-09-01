#!/usr/bin/env node
/**
 * KODEX-∞ · CENSO DE MÓVIL
 * 2026-08-31 · RECOVERY MODE
 *
 * Ocín: "hay muchas más escenas que no están en la página real, o al menos
 *        no se han adaptado UX/UI a móvil y escritorio como se debe."
 *
 * La primera mitad resultó falsa y vale saberlo: hay 172 rutas de KODEX
 * publicadas sin contar volúmenes. No faltan escenas. Lo que falta es saber
 * CUÁLES sirven en un teléfono, y eso nunca se midió.
 *
 * Esto lo mide sobre el HTML construido. No mide belleza -- eso es de Ocín.
 * Mide tres cosas objetivas que, si fallan, la página no se puede usar:
 *
 *   ANCHO FIJO    declara un ancho mayor al viewport y lo desborda
 *   SIN MEDIA-Q   no tiene ni una regla para pantalla angosta
 *   TEXTO MICRO   fuentes bajo 11px, ilegibles en mano
 *
 * Excluye los 513 volúmenes: son fichas de catálogo con layout propio y
 * medirlas junto a las escenas ahogaría la señal.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = process.argv[2] || 'dist';
const RAIZ = join(DIST, 'kodex');
const MOVIL = 375;

function rutas(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) {
      if (e === 'vol') continue;           // catálogo, no escena
      rutas(p, acc);
    } else if (e === 'index.html') acc.push(p);
  }
  return acc;
}

if (!existsSync(RAIZ)) { console.log('sin dist/kodex'); process.exit(1); }

const filas = [];
for (const f of rutas(RAIZ)) {
  const h = readFileSync(f, 'utf8');
  const ruta = '/kodex/' + relative(RAIZ, f).replace(/index\.html$/, '');

  /* Se ignora lo que vive dentro de <svg>: ahí los números son coordenadas
     del sistema vectorial, no del layout. Contarlos daría falso positivo en
     cada página con arte. */
  const sinSvg = h.replace(/<svg[\s\S]*?<\/svg>/g, '');

  const anchos = [...sinSvg.matchAll(/width:\s*(\d{3,})px/g)].map((m) => +m[1]);
  const ancho = anchos.length ? Math.max(...anchos) : 0;
  const mq = (h.match(/@media[^{]*max-width/g) || []).length;
  const micro = [...sinSvg.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)]
    .map((m) => +m[1]).filter((n) => n < 11).length;
  /* Con andamio de ajuste el ancho es de la plancha y la cámara la escala. */
  const ajustada = h.includes('kdx-lam-fit') || h.includes('kdx-lam-camara');

  const fallas = [];
  if (!ajustada && ancho > MOVIL) fallas.push(`ancho ${ancho}px`);
  if (mq === 0) fallas.push('sin media-query');
  if (micro > 3) fallas.push(`${micro} textos <11px`);

  filas.push({ ruta, fallas, ancho, mq, micro, ajustada });
}

const rotas = filas.filter((f) => f.fallas.length);
const familias = {};
for (const f of rotas) {
  const fam = f.ruta.split('/')[2] || 'raíz';
  (familias[fam] ||= []).push(f);
}

console.log(`\nCENSO DE MÓVIL · ${MOVIL}px · ${filas.length} rutas (sin volúmenes)\n`);
console.log(`  ${filas.length - rotas.length} sirven en un teléfono`);
console.log(`  ${rotas.length} no\n`);

for (const [fam, fs] of Object.entries(familias).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${fam.padEnd(14)} ${String(fs.length).padStart(3)} rutas`);
  const causas = {};
  for (const f of fs) for (const c of f.fallas) {
    const k = c.replace(/\d+/g, 'N');
    causas[k] = (causas[k] || 0) + 1;
  }
  for (const [c, n] of Object.entries(causas)) console.log(`                   · ${c} en ${n}`);
}

console.log(`\nMide si la página SE PUEDE USAR en mano, no si se ve linda.`);
console.log(`Lo segundo lo decide Ocín mirando.\n`);
