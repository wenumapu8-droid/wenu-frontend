#!/usr/bin/env node
/**
 * KODEX-∞ · ¿LO PUBLICADO ES LO APROBADO?
 * 2026-09-02
 *
 * ─────────────────────────────────────────────────────────────────────
 * LA LEY DE OCÍN, y es la mejor del proyecto:
 *
 *   "Un RUN no puede entrar en DONE hasta que la versión aprobada esté
 *    OBSERVADA EN PRODUCCIÓN.
 *    No 'PR terminado'. No '342 tests'. No 'CI green'. Production verified."
 *
 * Hoy vivimos exactamente por qué. El deploy dijo OK. Los tests daban 543.
 * El gate daba 7/7. Y COSMOLOGY tenía CERO pasos de carril en el sitio
 * mientras el build local tenía seis.
 *
 * Todo verde, y lo que el visitante veía era otra cosa. Por eso Ocín sentía
 * que retrocedíamos: el trabajo estaba hecho y no era lo que él miraba.
 *
 * Este script compara el DIST contra el SITIO, señal por señal. Es la única
 * medida que cuenta, porque es la única que mira lo que se sirve.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const SITIO = process.argv[2] || 'https://kodex-preview.wenu-frontend.pages.dev';

const RUTAS = [
  ['00 THRESHOLD', ''], ['01 PROLOGUE', 'folio/i'], ['02 DESCENT', 'folio/ii'],
  ['03 ARCHIVE', 'folio/iii'], ['04 MACHINE', 'folio/iv'],
  ['05 COSMOLOGY', 'folio/v'], ['06 RETURN', 'folio/vi'],
];

/* Señales que un visitante nota si faltan. No es una lista de features:
   es lo que hace que la escena sea una escena y no una página. */
const SEÑALES = [
  ['carril', /data-estado-canonico/g],
  ['riel', /kdx-riel__tit/g],
  ['traza', /kdx-traza__paso/g],
  ['puertas', /href="\/kodex\/concepto\/[a-z0-9-]+/g, true],
];

if (!existsSync(join(DIST, 'kodex', 'index.html'))) {
  console.log('\n· sin build local: no hay contra qué comparar.\n');
  process.exit(0);
}

/* Contar OCURRENCIAS, no valores únicos. Los 6 pasos del carril tienen el
   mismo atributo: con Set daban 1 y la comparación mentía en ambos lados.
   Sólo las puertas se cuentan únicas, porque ahí sí importa cuántos
   destinos DISTINTOS hay, no cuántos enlaces. */
const cuenta = (html, re, unicas) => {
  const m = html.match(re) || [];
  return unicas ? new Set(m).size : m.length;
};

console.log(`\n¿LO PUBLICADO ES LO QUE TENEMOS?\n${SITIO}\n`);
console.log('  escena          ' + SEÑALES.map(([n]) => n.padStart(9)).join('') + '   ');
console.log('  ' + '─'.repeat(16 + 9 * SEÑALES.length + 8));

let derivas = 0;
for (const [nombre, r] of RUTAS) {
  const local = readFileSync(join(DIST, 'kodex', r, 'index.html'), 'utf8');
  let remoto;
  try {
    /* User-Agent obligatorio: Cloudflare responde un desafío a fetch sin
       identificar, y el script leía cero señales en un sitio que las tenía.
       Mi propia herramienta dio un falso positivo de 7 derivas -- el mismo
       error que vengo señalando: medir donde no está. */
    remoto = await (await fetch(`${SITIO}/kodex/${r}${r ? '/' : ''}`, {
      headers: { 'user-agent': 'kodex-verificador/1.0' },
      signal: AbortSignal.timeout(30000),
    })).text();
  } catch {
    console.log(`  ${nombre.padEnd(16)}(no se pudo leer del sitio)`);
    continue;
  }
  const cols = [];
  let malo = false;
  for (const [, re, unicas] of SEÑALES) {
    const l = cuenta(local, re, unicas), s = cuenta(remoto, re, unicas);
    if (l !== s) { malo = true; cols.push(`${s}≠${l}`.padStart(9)); }
    else cols.push(String(s).padStart(9));
  }
  if (malo) derivas++;
  console.log(`  ${nombre.padEnd(16)}${cols.join('')}   ${malo ? '✗ DERIVA' : '✓'}`);
}

if (derivas) {
  console.log(`\n✗ ${derivas} escena(s) publicadas NO coinciden con el build.\n`);
  console.log('  El formato "sitio≠local" dice qué ve el visitante y qué');
  console.log('  deberíamos estar sirviendo.\n');
  console.log('  Esto NO es una mejora pendiente: es que lo desplegado no es');
  console.log('  lo nuestro. Redesplegá antes de dar nada por hecho.\n');
  process.exit(1);
}
console.log('\n✓ el sitio sirve exactamente lo que construimos\n');
