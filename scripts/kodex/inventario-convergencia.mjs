#!/usr/bin/env node
/* INVENTARIO DE CONVERGENCIA · KODEX−∞
 *
 * Contesta la pregunta 2 del plan -- "qué es vigente y qué es histórico" -- sin
 * opinar: parte de las páginas y los layouts, sigue cada import y declara
 * huérfano a todo lo que nadie alcanza.
 *
 * No borra nada. Lo huérfano no es basura: son 41 shaders y 17 archivos de
 * gramática que existen, funcionan y no están cableados. El valor de esta lista
 * es saber cuál es cuál.
 *
 * Criterio de salida de la fase P1: este script corre en CI y falla si aparece
 * un huérfano nuevo que no esté declarado en HUERFANOS-DECLARADOS.
 */
import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, normalize } from 'node:path';

const RAIZ = 'src';
const EXT = ['.astro', '.ts', '.js', '.mjs', '.css', '.frag', '.vert', '.glsl'];

const todos = new Set();
(function recorrer(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) recorrer(p);
    else if (EXT.some((x) => e.endsWith(x))) todos.add(normalize(p));
  }
})(RAIZ);

const IMPORTA = /(?:from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"])/g;
const SUFIJOS = ['', '.astro', '.ts', '.js', '.mjs', '.css', '/index.ts', '/index.js', '/index.astro'];

function resolver(base, spec) {
  if (/^(https?:|data:|node:)/.test(spec)) return null;
  if (spec.startsWith('@/') || spec.startsWith('~/')) { spec = 'src/' + spec.slice(2); base = ''; }
  let cand;
  if (spec.startsWith('/')) cand = normalize('src' + spec);
  else if (spec.startsWith('.')) cand = normalize(join(dirname(base), spec));
  else if (spec.startsWith('src/')) cand = normalize(spec);
  else return null;
  for (const s of SUFIJOS) if (todos.has(cand + s)) return cand + s;
  return null;
}

const grafo = new Map();
for (const f of todos) {
  const txt = existsSync(f) ? readFileSync(f, 'utf8') : '';
  const hijos = new Set();
  for (const m of txt.matchAll(IMPORTA)) {
    const spec = m[1] || m[2] || m[3];
    const r = spec && resolver(f, spec);
    if (r) hijos.add(r);
  }
  grafo.set(f, hijos);
}

const vivos = new Set();
const pila = [...todos].filter((f) => f.startsWith('src/pages') || f.startsWith('src/layouts'));
while (pila.length) {
  const n = pila.pop();
  if (vivos.has(n)) continue;
  vivos.add(n);
  pila.push(...(grafo.get(n) ?? []));
}

const huerfanos = [...todos].filter((f) => !vivos.has(f)).sort();
const porCarpeta = huerfanos.reduce((a, h) => ((a[dirname(h)] = (a[dirname(h)] ?? 0) + 1), a), {});

console.log(`rastreables : ${todos.size}`);
console.log(`vivos       : ${vivos.size}`);
console.log(`huérfanos   : ${huerfanos.length}  (${Math.round((100 * huerfanos.length) / todos.size)}%)`);
console.log('\nhuérfanos por carpeta:');
for (const [d, n] of Object.entries(porCarpeta).sort((a, b) => b[1] - a[1]).slice(0, 16))
  console.log(`  ${String(n).padStart(4)}  ${d}`);
if (process.argv.includes('--lista')) console.log('\n' + huerfanos.join('\n'));
