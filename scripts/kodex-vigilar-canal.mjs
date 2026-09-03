#!/usr/bin/env node
/**
 * KODEX-∞ · VIGILANTE DEL CANAL
 * 2026-09-03
 *
 * Ocín: "la única pieza todavía no automática es detectar cuándo Claude
 * publica el siguiente canal. Podemos vigilar esa carpeta cada hora y,
 * cuando aparezca un documento nuevo, leerlo y avisarte sin que vuelvas a
 * transportar muros de texto."
 *
 * Eso es exactamente el trabajo que Ocín viene haciendo A MANO: copiar y
 * pegar documentos entre ChatGPT y Claude Code. Cada vez que lo hace, gasta
 * minutos suyos en transporte en vez de en dirección.
 *
 * Este script no lee Drive por sí solo -- no tengo credenciales fuera de la
 * sesión. Lo que hace es dejar el registro de qué canales conoce, para que
 * cualquier sesión con acceso a Drive detecte el nuevo en un comando y
 * sepa que hay algo sin leer.
 *
 * Uso:
 *   node scripts/kodex-vigilar-canal.mjs                  ver el estado
 *   node scripts/kodex-vigilar-canal.mjs registrar <id> <titulo>
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const REG = join(process.env.HOME, 'kodex-relevo', 'CANAL-KODEX.json');
const r = existsSync(REG) ? JSON.parse(readFileSync(REG, 'utf8')) : { canales: [] };
const [, , cmd, id, ...t] = process.argv;

if (cmd === 'registrar') {
  if (!id) { console.error('uso: registrar <numero> <titulo>'); process.exit(1); }
  if (r.canales.some((c) => c.id === id)) { console.log(`${id} ya registrado`); process.exit(0); }
  r.canales.push({ id, titulo: t.join(' '), visto: new Date().toISOString() });
  r.canales.sort((a, b) => a.id.localeCompare(b.id));
  writeFileSync(REG, JSON.stringify(r, null, 2));
  console.log(`✓ ${id} registrado`);
  process.exit(0);
}

console.log('\nCANAL KODEX · ChatGPT ⇄ Claude Code\n');
if (!r.canales.length) console.log('  (ningún canal registrado)\n');
for (const c of r.canales) {
  const quien = Number(c.id.replace(/\D/g, '')) % 2 ? 'CLAUDE' : 'CHATGPT';
  console.log(`  ${c.id.padEnd(20)} ${quien.padEnd(8)} ${c.titulo}`);
}

/* La regla de turnos: impar = Claude, par = ChatGPT. Si el último es par,
   el turno es de Claude y hay trabajo pendiente de nuestro lado. */
const ult = r.canales.at(-1);
if (ult) {
  const n = Number(ult.id.replace(/\D/g, ''));
  const meToca = n % 2 === 0;
  console.log(`\n  último: ${ult.id}`);
  console.log(meToca
    ? `  → TURNO DE CLAUDE. Responder con KDX-CANAL-${String(n + 1).padStart(4, '0')}-CLAUDE`
    : `  → turno de ChatGPT. Esperando KDX-CANAL-${String(n + 1).padStart(4, '0')}-CHATGPT`);
}

console.log(`
  Carpeta en Drive: la misma donde vive KDX-CANAL-0002-CHATGPT.
  Para detectar uno nuevo desde una sesión con Drive:
    buscar títulos que empiecen con "KDX-CANAL-" y comparar contra esta lista.
`);
