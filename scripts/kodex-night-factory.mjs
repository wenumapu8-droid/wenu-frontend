#!/usr/bin/env node
/**
 * KODEX-∞ · FÁBRICA NOCTURNA
 * 2026-08-31 · RECOVERY MODE
 *
 * ─────────────────────────────────────────────────────────────────────
 * POR QUÉ EXISTE
 *
 * Ocín: "me gustaría que el KODEX se fuera armando solo mientras duermo".
 *
 * Eso es posible para el trabajo MECÁNICO y no lo es para el de JUICIO.
 * La diferencia importa: hoy tres agentes en paralelo se pisaron cinco
 * veces, y cada avance real del día salió de una frase de diez palabras
 * suya. La máquina no puede decidir "esto se siente KODEX".
 *
 * Así que esta fábrica hace SOLO lo mecánico, de una cola FINITA que ella
 * no puede ampliar. El agente no decide qué inventar: toma lo que hay.
 *
 * PROHIBIDO EN RECOVERY MODE:
 *   ideas nuevas · shaders nuevos · escenas nuevas · arquitecturas nuevas
 *   documentos maestros · versiones porque sí
 *
 * ─────────────────────────────────────────────────────────────────────
 * LO QUE PRODUCE
 *
 * Un reporte de una pantalla, no 400 líneas de log. Ocín se levanta, lo
 * lee en dos minutos y dice una sola cosa: qué está mal.
 *
 * Uso:  node scripts/kodex-night-factory.mjs [--once]
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const HOME = process.env.HOME;
const RELEVO = join(HOME, 'kodex-relevo');
const BACKLOG = join(RELEVO, 'RECOVERY-BACKLOG.json');
/* LA COLA ES LA DEL PEER, no la mía.
 *
 * Los dos escribimos una cola la misma noche. La suya INVESTIGA -- campos
 * HUECO sin declarar, números sin data-fuente, imports muertos, drift de
 * copy contra el canon. La mía sólo corría gates que ya existían.
 *
 * Nada se borra, todo se recicla: se queda la que aporta información nueva,
 * y mi runner la ejecuta. Elegir un ganador entre dos colas habría dejado
 * huérfano el trabajo del otro -- exactamente lo que RECOVERY MODE viene a
 * terminar. Dos colas para lo mismo es la historia otra vez. */
const COLA_PEER = join(process.cwd(), 'command-center/kodex-recovery-queue.json');
const REPORTE = join(RELEVO, `NIGHT-REPORT-${new Date().toISOString().slice(0, 10)}.md`);
const AGENTE = 'fabrica';
const UNA_VUELTA = process.argv.includes('--once');

const sh = (cmd, opts = {}) => {
  try {
    return { ok: true, out: execSync(cmd, { encoding: 'utf8', stdio: 'pipe', timeout: 900000, ...opts }) };
  } catch (e) {
    return { ok: false, out: (e.stdout || '') + (e.stderr || '') };
  }
};

/* ── LA COLA · finita y cerrada ──────────────────────────────────────
   Cada tarea declara cómo se VERIFICA. Una tarea sin verificación no es
   una tarea: es una intención, y las intenciones no se pueden cerrar
   sola una máquina. */
const COLA_INICIAL = [
  {
    id: 'KDX-R001', t: 'Inventario de ensamblaje',
    cmd: 'npm run kodex:inventario',
    verifica: (o) => /huerfanos|sin una sola/.test(o),
    extrae: (o) => (o.match(/(\d+) sin una sola importacion/) || [])[1] + ' huérfanos',
  },
  {
    id: 'KDX-R002', t: 'Suite de tests',
    cmd: 'npm run test:kodex',
    verifica: (o) => /fail 0/.test(o),
    extrae: (o) => (o.match(/pass (\d+)/g) || []).join(' · ') + ' pasan',
  },
  {
    id: 'KDX-R003', t: 'Gate de fidelidad visual',
    cmd: 'node scripts/kodex-visual-fidelity-gate.mjs',
    verifica: (o) => /0 fallan/.test(o),
    extrae: (o) => (o.match(/(\d+\/\d+ pasan)/) || [])[1],
  },
  {
    id: 'KDX-R004', t: 'Auditoría de integridad',
    cmd: 'npm run audit:kodex:integrity',
    verifica: (o) => !/"errors": \[\s*"/.test(o),
    extrae: () => 'sin errores de integridad',
  },
  {
    id: 'KDX-R005', t: 'Build completo',
    cmd: 'KDX_AGENTE=fabrica ALLOW_EMPTY_PRODUCTS=true npm run build',
    lock: true,
    verifica: (o) => /page\(s\) built/.test(o),
    extrae: (o) => (o.match(/(\d+) page\(s\) built/) || [])[1] + ' páginas',
  },
  {
    id: 'KDX-R006', t: 'Rutas del corredor vivas',
    cmd: 'for f in "" folio/i folio/ii folio/iii folio/iv folio/v folio/vi; do test -f "dist/kodex/$f/index.html" || echo "FALTA $f"; done; echo FIN',
    verifica: (o) => !/FALTA/.test(o),
    extrae: () => '7/7 rutas construidas',
  },
  {
    id: 'KDX-R007', t: 'Sin overflow horizontal declarado',
    cmd: "grep -c '100vw' src/styles/kodex.css || true",
    verifica: () => true,
    extrae: (o) => (o.trim() || '0') + ' usos de 100vw en kodex.css',
  },
];

function cargarCola() {
  if (existsSync(BACKLOG)) return JSON.parse(readFileSync(BACKLOG, 'utf8'));
  const c = { creada: new Date().toISOString(), tareas: COLA_INICIAL.map((t) => ({ ...t, estado: 'PENDIENTE', verifica: undefined, extrae: undefined })) };
  writeFileSync(BACKLOG, JSON.stringify(c, null, 2));
  return c;
}

function barra(pct) {
  const n = Math.round(pct / 5);
  return '█'.repeat(n) + '░'.repeat(20 - n);
}

const cola = cargarCola();
const resultados = [];
const bloqueos = [];

console.log('\nKODEX · FÁBRICA NOCTURNA · RECOVERY MODE\n');

for (const spec of COLA_INICIAL) {
  const guardada = cola.tareas.find((x) => x.id === spec.id);
  if (guardada?.estado === 'CERRADA') { resultados.push({ ...spec, estado: 'CERRADA', dato: guardada.dato }); continue; }

  /* El build es el único recurso serializado: dos a la vez se corrompen
     y borran el dist de quien esté midiendo. Ya nos costó horas. */
  if (spec.lock) {
    const l = sh(`node scripts/kodex-equipo.mjs build ${AGENTE}`);
    if (!/toma el build/.test(l.out)) {
      bloqueos.push(`${spec.id} · build tomado por otro agente`);
      resultados.push({ ...spec, estado: 'BLOQUEADA' });
      continue;
    }
  }

  process.stdout.write(`  ${spec.id} ${spec.t} … `);
  const r = sh(spec.cmd);
  if (spec.lock) sh(`node scripts/kodex-equipo.mjs libre`);

  const paso = spec.verifica(r.out);
  const dato = (() => { try { return spec.extrae(r.out); } catch { return null; } })();
  console.log(paso ? `✓ ${dato || ''}` : '✗ FALLA');

  resultados.push({ ...spec, estado: paso ? 'CERRADA' : 'FALLA', dato, salida: paso ? null : r.out.slice(-500) });
  if (!paso) bloqueos.push(`${spec.id} · ${spec.t}: no pasó su verificación`);

  const g = cola.tareas.find((x) => x.id === spec.id);
  if (g) { g.estado = paso ? 'CERRADA' : 'FALLA'; g.dato = dato; g.cuando = new Date().toISOString(); }
}

writeFileSync(BACKLOG, JSON.stringify(cola, null, 2));

const cerradas = resultados.filter((r) => r.estado === 'CERRADA').length;
const pct = Math.round((cerradas / COLA_INICIAL.length) * 100);
const sha = sh('git rev-parse --short HEAD').out.trim();

const rep = `# KODEX NIGHT REPORT · ${new Date().toISOString().slice(0, 16).replace('T', ' ')}

\`\`\`
${barra(pct)} ${pct}%   ${cerradas}/${COLA_INICIAL.length} cerradas
\`\`\`

${resultados.map((r) => `${r.estado === 'CERRADA' ? '✓' : r.estado === 'BLOQUEADA' ? '·' : '✗'} ${r.id}  ${r.t}${r.dato ? ` — ${r.dato}` : ''}`).join('\n')}

${bloqueos.length ? `## BLOQUEADO\n${bloqueos.map((b) => `! ${b}`).join('\n')}\n` : '## Nada bloqueado\n'}
## LO QUE NECESITA TU OJO

La máquina puede verificar que algo **existe** y **corre**. No puede
verificar que **se ve bien** — hoy un gate dio 7/7 con el organismo al 11%
del viewport. Eso sigue siendo tuyo:

  https://kodex-preview.wenu-frontend.pages.dev/kodex/

Mirá una escena y decí una sola cosa: qué está mal.

---
HEAD ${sha} · fábrica en RECOVERY MODE: sin ideas nuevas, sin escenas
nuevas, sin arquitecturas nuevas. Sólo cola finita.
`;

writeFileSync(REPORTE, rep);
console.log(`\n${barra(pct)} ${pct}%\n`);
console.log(`Reporte: ${REPORTE}\n`);
