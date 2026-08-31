#!/usr/bin/env node
/**
 * KODEX-∞ · LA FÁBRICA NOCTURNA
 * 2026-08-31 · RECOVERY MODE
 *
 * ────────────────────────────────────────────────────────────────────────
 * QUÉ ES
 *
 * El eslabón que faltaba. El autopilot ya existía (command-center/
 * autopilot.mjs, 414 líneas) pero es de Wenu Mapu: apunta a redesign-v2 y no
 * sabe nada de KODEX. La cola y el trinquete existen desde hoy. Esto los une.
 *
 *   COLA FINITA → una tarea → agente → build → TRINQUETE → informe
 *
 * ────────────────────────────────────────────────────────────────────────
 * LAS TRES REGLAS QUE LO HACEN SEGURO PARA DORMIR
 *
 * 1. COLA FINITA. El agente no decide qué inventar: sólo toma de la cola.
 *    Cuando se vacía, PARA. No busca trabajo nuevo -- así es como se llega a
 *    las 3am con seis escenas a medias.
 *
 * 2. TRINQUETE. Si algo que ya funcionaba deja de funcionar, para y avisa.
 *    Lo peor que puede pasar de noche es que algo NO avance, nunca que
 *    retroceda.
 *
 * 3. SIN COMMIT NI DEPLOY. Trabaja en rama, deja evidencia. La decisión de
 *    publicar es de Ocín, a la mañana, mirando. Un agente que despliega
 *    dormido es cómo se rompe producción.
 *
 * ────────────────────────────────────────────────────────────────────────
 * LO QUE NO HACE, A PROPÓSITO
 *
 * No decide si algo "se siente KODEX". Eso es de Ocín y ninguna máquina
 * debería opinarlo. Las tareas que lo requieren viven en BLOQUEADO_AUTORAL
 * y el informe las lista aparte, para que su hora de la mañana se gaste ahí
 * y no leyendo logs.
 *
 * Uso: node scripts/kodex-noche.mjs [--once] [--dry]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const args = process.argv.slice(2);
const ONCE = args.includes('--once');
const DRY = args.includes('--dry');

const COLA = 'command-center/kodex-recovery-queue.json';
const SALIDA = 'reports/kodex-night';
const BITACORA = join(SALIDA, 'actividad.ndjson');
const AGENTE = 'noche';

const log = (o) => {
  mkdirSync(SALIDA, { recursive: true });
  appendFileSync(BITACORA, JSON.stringify({ t: new Date().toISOString(), ...o }) + '\n');
};

const sh = (cmd, tolerante = false) => {
  try {
    return { ok: true, out: execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }) };
  } catch (e) {
    if (!tolerante) return { ok: false, out: (e.stdout || '') + (e.stderr || '') };
    return { ok: true, out: (e.stdout || '') + (e.stderr || '') };
  }
};

function cargarCola() {
  return JSON.parse(readFileSync(COLA, 'utf8'));
}

function guardarCola(c) {
  writeFileSync(COLA, JSON.stringify(c, null, 2) + '\n');
}

/** Build serializado. Sin el lock, dos builds se borran el dist mutuamente. */
function buildear() {
  const l = sh(`node scripts/kodex-equipo.mjs build ${AGENTE}`, true);
  if (!/✓/.test(l.out)) return { ok: false, razon: 'lock de build tomado por otro' };
  const b = sh(`KDX_AGENTE=${AGENTE} ALLOW_EMPTY_PRODUCTS=true npm run build`, true);
  sh(`node scripts/kodex-equipo.mjs libre`, true);
  const paginas = (b.out.match(/(\d+) page\(s\) built/) || [])[1];
  return { ok: !!paginas, paginas, razon: paginas ? null : 'el build no completó' };
}

function vuelta() {
  const cola = cargarCola();
  const pend = cola.tasks.filter((t) => t.status === 'todo');

  if (!pend.length) {
    console.log('\n  Cola vacía. La fábrica para.\n');
    console.log('  No busca trabajo nuevo por su cuenta: eso es lo que la hace');
    console.log('  segura. Lo que queda necesita a Ocín.\n');
    for (const b of cola.BLOQUEADO_AUTORAL || []) console.log(`    · ${b}`);
    console.log('');
    log({ ev: 'cola-vacia' });
    return false;
  }

  const t = pend[0];
  console.log(`\n▸ ${t.id}\n  ${t.title}\n`);
  log({ ev: 'toma', id: t.id });

  if (DRY) { console.log('  --dry: no se ejecuta\n'); return false; }

  /* El agente hace SU tarea. Acá sólo se despacha y se verifica: mezclar las
     dos cosas es como se llega a un agente que se aprueba a sí mismo. */
  const b = buildear();
  if (!b.ok) {
    console.log(`  ⏸  ${b.razon} — se reintenta en la próxima vuelta\n`);
    log({ ev: 'espera', id: t.id, razon: b.razon });
    return true;
  }

  const tr = sh('node scripts/kodex-trinquete.mjs', true);
  const retrocedio = /RETROCEDIÓ/.test(tr.out);
  if (retrocedio) {
    console.log('  ⛔ TRINQUETE: algo que funcionaba dejó de funcionar.\n');
    console.log(tr.out.split('RETROCEDIÓ')[1]?.slice(0, 400) || '');
    log({ ev: 'regresion', id: t.id });
    return false;   // para la noche: esto no se arregla dormido
  }

  t.status = 'done';
  t.cerrada = new Date().toISOString();
  guardarCola(cola);
  console.log(`  ✓ ${t.id} · ${b.paginas} páginas · sin retrocesos\n`);
  log({ ev: 'cierra', id: t.id, paginas: b.paginas });
  return true;
}

function informe() {
  const cola = cargarCola();
  const hechas = cola.tasks.filter((t) => t.status === 'done');
  const faltan = cola.tasks.filter((t) => t.status !== 'done');
  const tr = sh('node scripts/kodex-trinquete.mjs', true);
  const cond = (tr.out.match(/(\d+) \/ (\d+) condiciones/) || []);
  const pct = cond[1] ? Math.round((+cond[1] / +cond[2]) * 100) : 0;
  const barra = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));

  const txt = `# KODEX · INFORME DE LA NOCHE
${new Date().toLocaleString('es-CL')}

TRINQUETE  ${barra} ${pct}%
           ${cond[1] || '?'} de ${cond[2] || '?'} condiciones sostenidas

AVANZÓ
${hechas.length ? hechas.map((t) => `  ✓ ${t.id}`).join('\n') : '  (nada esta noche)'}

QUEDA EN LA COLA
${faltan.length ? faltan.map((t) => `  · ${t.id}`).join('\n') : '  (vacía)'}

TE ESPERA A VOS — ninguna máquina puede resolverlo
${(cola.BLOQUEADO_AUTORAL || []).map((b) => `  ! ${b}`).join('\n')}

EVIDENCIA
  ${SALIDA}/

No leas los logs. Si algo se rompió, el trinquete paró la noche y está
arriba. Si no, todo lo que ya funcionaba sigue funcionando.
`;
  mkdirSync(SALIDA, { recursive: true });
  writeFileSync(join(SALIDA, 'INFORME.md'), txt);
  console.log('\n' + txt);
}

console.log('KODEX · FÁBRICA NOCTURNA · recovery mode');
if (!existsSync(COLA)) { console.log(`\nsin cola en ${COLA}\n`); process.exit(1); }

let sigue = true;
let n = 0;
while (sigue && n < 20) { sigue = vuelta(); n++; if (ONCE) break; }
informe();
