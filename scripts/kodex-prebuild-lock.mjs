#!/usr/bin/env node
/**
 * KODEX-∞ · EL LOCK DE BUILD SE VUELVE OBLIGATORIO
 * 2026-08-31
 *
 * EL PROBLEMA, medido dos veces hoy:
 * `astro build` BORRA dist al arrancar. Cualquier build lo vacia para todos
 * los que esten midiendo. Dos veces se reporto "gate 0/7" y "carril 0 en las
 * 7 escenas" -- los dos falsos negativos, los dos por medir sobre un dist
 * que otro estaba reescribiendo.
 *
 * El tablero avisaba, pero avisar no alcanza: un lock que se puede ignorar
 * por olvido no es un lock, es una convencion. Y las convenciones fallan
 * justo cuando hay prisa, que es cuando mas duelen.
 *
 * ESTO LO HACE OBLIGATORIO. Corre en `prebuild`, asi que no hay forma de
 * buildear sin pasar por aca -- ni a proposito ni por distraccion.
 *
 * En hosts compartidos se identifica con KDX_AGENTE. GitHub Actions queda
 * fuera del lock local: cada job corre en un workspace aislado y no comparte
 * `dist` ni `~/kodex-relevo/.build-lock` con los agentes de la maquina viva.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

if (process.env.GITHUB_ACTIONS === 'true') {
  console.log('✓ build autorizado · GitHub Actions usa un workspace aislado');
  process.exit(0);
}

const LOCK = join(process.env.HOME, 'kodex-relevo', '.build-lock');
const yo = process.env.KDX_AGENTE;
const CADUCA_MS = 25 * 60 * 1000;

if (!yo) {
  console.error('\n✗ BUILD BLOQUEADO · no dijiste quien sos\n');
  console.error('  Dos veces hoy un build borro el dist mientras otro medía,');
  console.error('  y los dos reportaron gates en cero que eran falsos.\n');
  console.error('  Tomá el lock y decí tu nombre:\n');
  console.error('    node scripts/kodex-equipo.mjs build <tu-nombre>');
  console.error('    KDX_AGENTE=<tu-nombre> ALLOW_EMPTY_PRODUCTS=true npm run build');
  console.error('    node scripts/kodex-equipo.mjs libre\n');
  process.exit(1);
}

if (existsSync(LOCK)) {
  const b = JSON.parse(readFileSync(LOCK, 'utf8'));
  const vivo = Date.now() - new Date(b.desde).getTime() < CADUCA_MS;
  if (vivo && b.agente && b.agente !== yo) {
    console.error(`\n✗ BUILD BLOQUEADO · lo tiene ${b.agente} desde ${b.desde}\n`);
    console.error('  Si buildeás ahora le borrás el dist y su medición miente.');
    console.error('  Esperá a que suelte, o pedíselo.\n');
    process.exit(1);
  }
  if (vivo && b.agente === yo) {
    console.log(`✓ build autorizado · ${yo} tiene el lock`);
    process.exit(0);
  }
}

console.error(`\n✗ BUILD BLOQUEADO · ${yo} no tiene el lock tomado\n`);
console.error('  Tomalo primero:  node scripts/kodex-equipo.mjs build ' + yo + '\n');
process.exit(1);
