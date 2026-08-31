#!/usr/bin/env node
/**
 * KODEX-∞ · INVENTARIO DE ENSAMBLAJE
 * 2026-08-30
 *
 * La observacion de Ocin, que resulto ser la ley del proyecto:
 *   "ya está listo, no hay que hacer desde cero, hay que ensamblar --
 *    todo el KODEX sigue esa lógica"
 *
 * Es cierto y es medible. Todo el dia aparecieron piezas completas sin
 * cablear: ORIGIN VECTOR, SYSTEM LOG, tres organismos, la onda del umbral
 * (que ya tenia su animacion escrita esperandola), la voz, y la escena
 * nativa de PROLOGUE -- 34KB, tercer intento tras dos rechazos, montada en
 * cero paginas.
 *
 * Encontrarlas de a una es el cuello de botella. Este script las lista TODAS
 * de una vez: componentes, modulos y estilos construidos que nadie importa.
 *
 * No borra nada ni propone borrar. Nada se borra, todo se recicla: lo que
 * esta huerfano no es basura, es trabajo esperando su cable.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

const RAIZ = 'src';
const EXT = new Set(['.astro', '.ts', '.js', '.mjs']);

function recorrer(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) recorrer(p, out);
    else if (EXT.has(extname(e))) out.push({ p, size: st.size });
  }
  return out;
}

const archivos = recorrer(RAIZ);
/* Un solo pase de lectura: buscar cada nombre en cada archivo seria O(n²)
   sobre ~700 archivos y tardaria mas que el build. */
const corpus = archivos.map((a) => ({ ...a, txt: readFileSync(a.p, 'utf8') }));

const huerfanos = [];
const superados = [];
for (const a of corpus) {
  const nombre = basename(a.p, extname(a.p));
  /* Los tests, los .d.ts y los propios scripts no se "montan": se corren. */
  if (/\.(test|spec|d)$/.test(nombre) || a.p.includes('/pages/')) continue;

  /* Un archivo marcado SUPERSEDED esta huerfano A PROPOSITO: su funcion la
     cumple otro. Listarlo como pendiente haria que un agente lo monte y
     duplique lo que ya existe -- justo el error que la marca previene. */
  if (/SUPERSEDED/.test(a.txt)) { superados.push(a.p); continue; }

  const usos = corpus.filter((b) => b.p !== a.p && b.txt.includes(nombre)).length;
  if (usos === 0) huerfanos.push({ ...a, nombre });
}

huerfanos.sort((x, y) => y.size - x.size);

const kb = (n) => (n / 1024).toFixed(1).padStart(6) + ' KB';
console.log('\nINVENTARIO DE ENSAMBLAJE · KODEX−∞');
console.log(`${archivos.length} archivos revisados · ${huerfanos.length} sin una sola importacion\n`);

let total = 0;
for (const h of huerfanos) {
  total += h.size;
  console.log(`${kb(h.size)}  ${h.p}`);
}

console.log(`\n${kb(total)} de codigo construido y sin cablear.`);
if (superados.length) {
  console.log('\nSUPERSEDED · huerfanos A PROPOSITO, no montar:');
  for (const p of superados) console.log(`  ${p}`);
}

console.log('\nEsto NO es basura: es trabajo esperando su cable. Nada se borra.');
console.log('Antes de construir cualquier cosa, buscala aca primero.\n');
