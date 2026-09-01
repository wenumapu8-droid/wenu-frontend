#!/usr/bin/env node
/**
 * KODEX-∞ · QUÉ TENEMOS
 * 2026-08-31 · RECOVERY MODE
 *
 * ────────────────────────────────────────────────────────────────────────
 * PARA QUÉ
 *
 * Ocín: "auditar todo lo que tenemos e ir botando, para que todo empiece a
 *        funcionar y ver realmente lo que tenemos."
 *
 * Después de semanas, nadie podía contestar "¿qué hay?" sin abrir veinte
 * archivos. Esto lo contesta en una pantalla, con evidencia, y dice qué
 * sobra.
 *
 * ────────────────────────────────────────────────────────────────────────
 * LOS CUATRO VEREDICTOS
 *
 *   VIVO       tiene ruta pública y se puede visitar
 *   CABLEADO   lo usa algo que está vivo, aunque no tenga ruta propia
 *   HUÉRFANO   existe y nadie lo usa -- candidato a botar
 *   PESADO     vivo pero cuesta demasiado, hay que arreglarlo o botarlo
 *
 * ────────────────────────────────────────────────────────────────────────
 * LA REGLA QUE HACE HONESTO ESTO
 *
 * HUÉRFANO se decide siguiendo CADENAS de import, no importadores directos.
 * De 33 huérfanos aparentes de una auditoría anterior, 28 estaban integrados:
 * el acoplamiento acá es multi-hop -- página → .astro → script interno →
 * registry → adapter → runtime. Un grep de un salto no los ve y propone
 * botar cosas que están en uso.
 *
 * Y BOTAR NO ES BORRAR. Lo que sale del corredor se marca, no se elimina.
 * Nada se pierde: se deja de mantener.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, basename, extname } from 'node:path';

const DIST = 'dist';
const SRC = 'src';

/* ── 1 · qué se puede visitar ──────────────────────────────────────────── */
function rutasVivas(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) rutasVivas(p, acc);
    else if (e === 'index.html') acc.push(p);
  }
  return acc;
}
const vivas = rutasVivas(join(DIST, 'kodex'));
const vol = vivas.filter((r) => r.includes('/vol/')).length;
const escenas = vivas.length - vol;

/* ── 2 · todo el código fuente de KODEX ────────────────────────────────── */
function fuentes(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e.startsWith('.')) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) fuentes(p, acc);
    else if (/\.(astro|ts|js|mjs)$/.test(e) && !/\.test\./.test(e)) acc.push(p);
  }
  return acc;
}
const codigo = [
  ...fuentes(join(SRC, 'components/kodex')),
  ...fuentes(join(SRC, 'kodex')),
  ...fuentes(join(SRC, 'lib/kodex')),
  ...fuentes(join(SRC, 'pages/kodex')),
];

/* ── 3 · cadenas de import, no un salto ────────────────────────────────── */
const texto = new Map();
for (const f of codigo) { try { texto.set(f, readFileSync(f, 'utf8')); } catch {} }

const usadoPor = new Map();
for (const [f, t] of texto) {
  for (const otro of codigo) {
    if (otro === f) continue;
    const n = basename(otro, extname(otro));
    /* Se busca el nombre como identificador, no como substring: `Campo` no
       debe dar positivo dentro de `CampoPersistente`. */
    if (new RegExp(`\\b${n}\\b`).test(t)) {
      (usadoPor.get(otro) || usadoPor.set(otro, []).get(otro)).push(f);
    }
  }
}

/* Alcanzable = lo tocan las páginas, o algo que las páginas alcanzan. */
const paginas = codigo.filter((f) => f.includes('pages/kodex'));
const alcanzable = new Set(paginas);
let creció = true;
while (creció) {
  creció = false;
  for (const [f, usuarios] of usadoPor) {
    if (alcanzable.has(f)) continue;
    if (usuarios.some((u) => alcanzable.has(u))) { alcanzable.add(f); creció = true; }
  }
}
const huerfanos = codigo.filter((f) => !alcanzable.has(f));

/* ── 4 · lo que cuesta demasiado ───────────────────────────────────────── */
const pesadas = vivas
  .map((r) => ({ r: '/kodex/' + relative(join(DIST, 'kodex'), r).replace(/index\.html$/, ''), kb: Math.round(statSync(r).size / 1024) }))
  .filter((x) => x.kb > 500)
  .sort((a, b) => b.kb - a.kb);

/* ── 5 · el informe ────────────────────────────────────────────────────── */
const kb = (f) => Math.round((statSync(f).size / 1024) * 10) / 10;
const pesoHuerfano = huerfanos.reduce((s, f) => s + kb(f), 0);

console.log(`\n${'═'.repeat(58)}`);
console.log(`  KODEX · QUÉ TENEMOS`);
console.log(`${'═'.repeat(58)}\n`);

console.log(`  VIVO — se puede visitar hoy`);
console.log(`    ${String(escenas).padStart(4)} rutas de escena`);
console.log(`    ${String(vol).padStart(4)} fichas de volumen`);
console.log(`    ${String(vivas.length).padStart(4)} páginas en total\n`);

console.log(`  CÓDIGO`);
console.log(`    ${String(codigo.length).padStart(4)} archivos de KODEX`);
console.log(`    ${String(alcanzable.size).padStart(4)} alcanzables desde una página`);
console.log(`    ${String(huerfanos.length).padStart(4)} que nadie alcanza  ·  ${pesoHuerfano.toFixed(0)} KB\n`);

if (huerfanos.length) {
  console.log(`  CANDIDATOS A BOTAR — nadie los alcanza siguiendo cadenas`);
  for (const f of huerfanos.sort((a, b) => kb(b) - kb(a)).slice(0, 14)) {
    console.log(`    ${String(kb(f)).padStart(6)} KB  ${relative(SRC, f)}`);
  }
  if (huerfanos.length > 14) console.log(`    … y ${huerfanos.length - 14} más\n`);
  else console.log('');
}

if (pesadas.length) {
  console.log(`  PESADO — vivo pero cuesta demasiado`);
  for (const p of pesadas.slice(0, 8)) console.log(`    ${String(p.kb).padStart(6)} KB  ${p.r}`);
  console.log('');
}

console.log(`${'─'.repeat(58)}`);
console.log(`  BOTAR NO ES BORRAR. Lo que sale del corredor se MARCA, no se`);
console.log(`  elimina: nada se pierde, se deja de mantener. Y ningún archivo`);
console.log(`  se toca por este reporte sin que alguien lo mire primero --`);
console.log(`  de 33 huérfanos de una auditoría anterior, 28 estaban en uso.`);
console.log(`${'─'.repeat(58)}\n`);
