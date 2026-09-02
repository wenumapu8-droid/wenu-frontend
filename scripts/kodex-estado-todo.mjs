#!/usr/bin/env node
/**
 * KODEX-∞ · ESTADO DE TODO
 * 2026-08-31 · RECOVERY MODE
 *
 * Ocín: "cómo podemos ver todo lo que tenemos para ir marcando lo que
 *        funciona, lo que está bien, lo que falta mejorar, lo que no
 *        serviría, lo que está roto."
 *
 * El registro de componentes ya existía (kodex-system/03, 112 componentes)
 * pero contesta otra pregunta: si un componente está montado. No dice si la
 * PÁGINA sirve. Esto junta lo que ya medimos, por ruta, en un solo lugar:
 *
 *   móvil    ¿se puede usar en un teléfono?      censo
 *   peso     ¿carga con datos móviles?           tamaño del HTML
 *   chasis   ¿tiene el instrumento montado?      gate
 *   campo    ¿está viva o es una postal?         gate
 *
 * Emite JSON para que la vista lo pinte. No opina sobre si algo es lindo:
 * eso lo decide Ocín mirando, y ningún script debería reemplazarlo.
 */
import { readFileSync, existsSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const RAIZ = join(DIST, 'kodex');
const SALIDA = 'reports/kodex-estado.json';

function rutas(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) { if (e !== 'vol') rutas(p, acc); }
    else if (e === 'index.html') acc.push(p);
  }
  return acc;
}

const bundles = new Map();
const cssDe = (h) => {
  let css = '';
  for (const m of h.matchAll(/href="(\/_astro\/[^"]+\.css)"/g)) {
    const rel = m[1].slice(1);
    if (!bundles.has(rel)) {
      const p = join(DIST, rel);
      bundles.set(rel, existsSync(p) ? readFileSync(p, 'utf8') : '');
    }
    css += bundles.get(rel);
  }
  return css;
};

const items = [];
for (const f of rutas(RAIZ)) {
  const h = readFileSync(f, 'utf8');
  const css = cssDe(h);
  const kb = Math.round(statSync(f).size / 1024);
  const ruta = '/kodex/' + relative(RAIZ, f).replace(/index\.html$/, '');
  const fam = ruta.split('/')[2] || 'raíz';

  const sinSvg = h.replace(/<svg[\s\S]*?<\/svg>/g, '');
  const anchos = [...(sinSvg + css).matchAll(/(?<!max-|min-)width:\s*(\d{3,})px/g)].map((m) => +m[1]);
  const ancho = anchos.length ? Math.max(...anchos) : 0;
  const ajustada = h.includes('kdx-lam-fit') || h.includes('kdx-lam-camara');
  const angostos = (css.match(/@media[^{]*max-width[^{]*\{[\s\S]{0,4000}?\}\s*\}/g) || []).join('');
  const piso = /font-size:\s*max\(\s*1[1-9]px/.test(angostos) || /font-size:\s*1[1-9](?:\.\d+)?px/.test(angostos);
  const mq = ((h + css).match(/@media[^{]*max-width/g) || []).length;

  const movil = (ajustada || ancho <= 375) && mq > 0 && piso;
  const chasis = h.includes('kdx-riel__tit');
  const campo = h.includes('kdx-campo-materia');
  const corredor = h.includes('kdx-traza__paso');

  /* El veredicto es una escalera, y el orden importa: una página que no
     carga no puede estar "bien" aunque tenga todo montado. */
  let estado, porque;
  if (kb > 900)            { estado = 'ROTA';    porque = `${kb} KB: no carga con datos móviles`; }
  else if (!movil)         { estado = 'ROTA';    porque = 'no se puede usar en un teléfono'; }
  else if (kb > 400)       { estado = 'MEJORAR'; porque = `${kb} KB: pesada`; }
  else if (chasis && campo && corredor) { estado = 'BIEN'; porque = 'instrumento, campo y corredor'; }
  else if (chasis || campo)             { estado = 'MEJORAR'; porque = 'le falta parte del aparato'; }
  else                                  { estado = 'SIRVE';   porque = 'se usa, sin aparato KODEX'; }

  items.push({ ruta, fam, kb, estado, porque, movil, chasis, campo, corredor, ancho, ajustada });
}

const cuenta = {};
for (const i of items) cuenta[i.estado] = (cuenta[i.estado] || 0) + 1;

mkdirSync('reports', { recursive: true });
writeFileSync(SALIDA, JSON.stringify({ generado: new Date().toISOString(), cuenta, items }, null, 2));

console.log(`\nESTADO DE TODO · ${items.length} rutas\n`);
for (const [e, n] of Object.entries(cuenta).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}  ${e}`);
}
console.log(`\n  → ${SALIDA}\n`);
