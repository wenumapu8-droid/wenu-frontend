#!/usr/bin/env node
/**
 * KODEX-∞ · BUS DE EQUIPO
 * 2026-08-30
 *
 * Ocin: "no entiendo por que no pueden hablarse y ser un equipo".
 *
 * La razon tecnica: las sesiones no comparten proceso ni memoria, y las
 * peer-sessions estan offline casi siempre. No hay canal sincronico.
 *
 * Pero un equipo no necesita hablar en tiempo real: necesita saber quien
 * esta haciendo que, y no pisarse. Los equipos humanos distribuidos
 * resuelven esto igual -- con un tablero, no con una llamada permanente.
 *
 * Este es ese tablero. Vive en disco, lo lee cualquier agente en cualquier
 * maquina, y usa locks reales para que dos no tomen lo mismo.
 *
 * LO QUE ARREGLA, medido hoy:
 *   · dos agentes descubrieron ORIGIN VECTOR sin cablear con un dia de
 *     diferencia, sin saber uno del otro
 *   · un build concurrente vacio el dist a mitad de una verificacion
 *   · el terminal recomendo "tomar el manifest del Mini", que habria
 *     borrado 914 veredictos de triaje del otro carril
 *
 * USO
 *   node scripts/kodex-equipo.mjs quien                     ver el tablero
 *   node scripts/kodex-equipo.mjs tomar <agente> <unidad>   reclamar trabajo
 *   node scripts/kodex-equipo.mjs soltar <agente> <estado>  liberar
 *   node scripts/kodex-equipo.mjs build <agente>            pedir el build
 *   node scripts/kodex-equipo.mjs libre                     soltar el build
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { hostname } from 'node:os';

const DIR = join(process.env.HOME, 'kodex-relevo');
const TABLERO = join(DIR, 'EQUIPO.json');
const BUILD = join(DIR, '.build-lock');
/* Un lock sin caducidad es un lock que alguien se lleva cuando le cortan la
   sesion. 25 min cubre un build de 3 min con margen de sobra. */
const CADUCA_MS = 25 * 60 * 1000;

if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });

const leer = () => (existsSync(TABLERO) ? JSON.parse(readFileSync(TABLERO, 'utf8')) : { agentes: {}, historial: [] });
const escribir = (d) => writeFileSync(TABLERO, JSON.stringify(d, null, 2));
const ahora = () => new Date().toISOString();
const vivo = (t) => Date.now() - new Date(t).getTime() < CADUCA_MS;

const [, , cmd, agente, ...resto] = process.argv;
const d = leer();

switch (cmd) {
  case 'quien': {
    const act = Object.entries(d.agentes).filter(([, a]) => a.unidad && vivo(a.desde));
    console.log('\nEQUIPO KODEX · tablero\n');
    if (!act.length) console.log('  nadie tiene trabajo tomado\n');
    for (const [n, a] of act) {
      const min = Math.round((Date.now() - new Date(a.desde).getTime()) / 60000);
      console.log(`  ${n.padEnd(14)} ${a.unidad.padEnd(30)} ${min}min  @${a.host}`);
    }
    const e = d.escritura || {};
    const eVivo = e.desde && (Date.now() - new Date(e.desde).getTime() < 90 * 60 * 1000);
    console.log(eVivo && e.agente
      ? `  ESCRITURA · ${e.agente}${e.sobre ? ' · ' + e.sobre : ''}   (el resto puede LEER)`
      : '  ESCRITURA · libre');

    const creando = Object.entries(d.creando || {}).filter(([, c]) => c.archivo && vivo(c.desde));
    if (creando.length) {
      console.log('\n  archivos NUEVOS reclamados:');
      for (const [n, c] of creando) console.log(`    ${n.padEnd(14)} ${c.archivo}`);
    }
    if (existsSync(BUILD)) {
      const b = JSON.parse(readFileSync(BUILD, 'utf8'));
      console.log(vivo(b.desde) ? `\n  BUILD tomado por ${b.agente}` : '\n  BUILD: lock vencido, libre');
    } else console.log('\n  BUILD libre');
    const h = (d.historial || []).slice(-6);
    if (h.length) {
      console.log('\n  ultimo trabajo cerrado:');
      for (const x of h) console.log(`    ${x.agente.padEnd(12)} ${x.unidad.padEnd(28)} ${x.estado}`);
    }
    console.log('');
    break;
  }

  /* CREAR · reclamar un ARCHIVO que todavía no existe.
   *
   * Propuesta del peer tras la ironía de la noche: los dos construimos
   * scripts/kodex-trinquete.mjs con una hora de diferencia -- duplicamos
   * exactamente la pieza que existe para impedir que se duplique trabajo.
   * Mi commit sobreescribió el suyo sin que ninguno lo notara.
   *
   * Y no fue por falta de tablero: él tenía tomado "carril de estados" y yo
   * "chasis". El trinquete no era de ninguno, así que ninguno lo reclamó.
   *
   * LAS ESTACIONES CUBREN ARCHIVOS QUE EXISTEN. No cubren los que todavía
   * no existen -- ese es el agujero, y es el mismo que dio EscenaPrologue
   * montada dos veces.
   *
   * Cuesta cinco segundos y nos habría ahorrado las dos duplicaciones. */
  /* ESCRITURA · el lease único sobre el worktree.
   *
   * Ley adoptada 2026-09-02: READ PARALLEL · WRITE SERIAL.
   *
   * Anthropic midió que la investigación multiagente supera al agente
   * único, pero que CODING no se paraleliza igual: hay demasiadas
   * dependencias y contexto compartido. Y que un sistema multiagente
   * consume ~15× más tokens.
   *
   * Hoy lo vivimos: cinco sesiones, un fix propuesto que ya estaba hecho,
   * un extractor casi reconstruido, una atribución falsa a punto de
   * escribirse como autoridad, un build muerto por contención, y el sitio
   * publicado desincronizado del código.
   *
   * Nada de eso fue mala fe. Fue escribir en paralelo.
   *
   * Leer, auditar, medir, investigar: TODOS a la vez, sin pedir permiso.
   * Escribir en el worktree: UNO. Este comando es ese uno.
   *
   * El lease dura 45 min y caduca solo. Un lease sin caducidad se lo lleva
   * quien pierda la sesión, y entonces nadie escribe nunca más. */
  case 'escritura': {
    d.escritura = d.escritura || {};
    const actual = d.escritura.agente;
    const vivoAun = d.escritura.desde && (Date.now() - new Date(d.escritura.desde).getTime() < 90 * 60 * 1000);

    if (resto[0] === 'soltar') {
      if (actual === agente) { d.escritura = {}; escribir(d); console.log(`✓ ${agente} suelta la escritura`); }
      else console.log(`no la tenías vos (la tiene ${actual || 'nadie'})`);
      break;
    }
    if (vivoAun && actual && actual !== agente) {
      console.log(`✗ ESCRITURA tomada por ${actual} desde ${d.escritura.desde}`);
      console.log('  Podés LEER, auditar, medir e investigar todo lo que quieras.');
      console.log('  Escribir en el worktree, no. Es la ley que evita que cinco');
      console.log('  agentes produzcan cinco versiones de lo mismo.');
      console.log(`  Cuando suelte, tomala:  kodex-equipo.mjs escritura ${agente}`);
      process.exit(1);
    }
    d.escritura = { agente, desde: ahora(), host: hostname(), sobre: resto.join(' ') || 'worktree' };
    escribir(d);
    console.log(`✓ ${agente} tiene la ESCRITURA${resto.length ? ' sobre ' + resto.join(' ') : ''}`);
    console.log('  Soltala al terminar:  kodex-equipo.mjs escritura ' + agente + ' soltar');
    break;
  }

  case 'crear': {
    const archivo = resto.join(' ');
    if (!archivo) { console.log('uso: crear <agente> <ruta/del/archivo>'); process.exit(1); }
    d.creando = d.creando || {};
    const otro = Object.entries(d.creando).find(
      ([n, c]) => n !== agente && c.archivo === archivo && vivo(c.desde),
    );
    if (otro) {
      console.log(`✗ "${archivo}" lo está creando ${otro[0]} desde ${otro[1].desde}`);
      console.log('  No lo escribas: hablá con él. Dos versiones del mismo archivo');
      console.log('  nuevo es el error que este comando existe para evitar.');
      process.exit(1);
    }
    if (existsSync(archivo)) {
      console.log(`⚠ "${archivo}" YA EXISTE. Esto no es crear, es editar.`);
      console.log('  Antes de tocarlo: ¿de quién es la estación? ¿ya hace lo que ibas a hacer?');
      console.log('  Mirá también: npm run kodex:inventario');
    }
    d.creando[agente] = { archivo, desde: ahora(), host: hostname() };
    escribir(d);
    console.log(`✓ ${agente} va a crear "${archivo}"`);
    break;
  }

  case 'tomar': {
    const unidad = resto.join(' ');
    /* Si otro la tiene y su lock sigue vivo, NO se pisa. Ese es el punto
       entero: el tablero solo sirve si decir "esta tomada" tiene efecto. */
    const choque = Object.entries(d.agentes).find(
      ([n, a]) => n !== agente && a.unidad === unidad && vivo(a.desde),
    );
    if (choque) {
      console.log(`✗ "${unidad}" ya la tiene ${choque[0]} desde ${choque[1].desde}`);
      console.log('  Toma otra. Dos agentes en la misma unidad es el error de ayer.');
      process.exit(1);
    }
    d.agentes[agente] = { unidad, desde: ahora(), host: hostname() };
    escribir(d);
    console.log(`✓ ${agente} toma "${unidad}"`);
    break;
  }

  case 'soltar': {
    const a = d.agentes[agente];
    if (!a?.unidad) { console.log('no tenias nada tomado'); break; }
    d.historial = [...(d.historial || []), { agente, unidad: a.unidad, estado: resto.join(' ') || 'CERRADA', cuando: ahora() }];
    d.agentes[agente] = { unidad: null, desde: ahora(), host: hostname() };
    escribir(d);
    console.log(`✓ ${agente} suelta "${a.unidad}"`);
    break;
  }

  case 'build': {
    /* El build es el recurso serializado. Hoy un build concurrente vacio el
       dist a mitad de una verificacion y el gate reporto 0/7 falsos. */
    if (existsSync(BUILD)) {
      const b = JSON.parse(readFileSync(BUILD, 'utf8'));
      if (vivo(b.desde) && b.agente !== agente) {
        console.log(`✗ build tomado por ${b.agente} desde ${b.desde}`);
        console.log('  ESPERA. Dos builds a la vez se corrompen y tumban la iMac.');
        process.exit(1);
      }
    }
    writeFileSync(BUILD, JSON.stringify({ agente, desde: ahora(), host: hostname() }, null, 2));
    console.log(`✓ ${agente} toma el build`);
    break;
  }

  case 'libre': {
    /* ── SOLTAR EXIGE SER EL DUEÑO · 2026-09-02 ──────────────────────────
     *
     * `libre` soltaba el lock de cualquiera sin preguntar de quién era. En
     * un solo día eso rompió el trabajo dos veces:
     *
     *   1. un agente vio "lock vencido" en el tablero y soltó uno ajeno
     *   2. otro encadenó `build && npm run build ; libre` con punto y coma,
     *      así que el `libre` corrió AUNQUE el build hubiera sido bloqueado
     *      -- y soltó el lock del agente que sí estaba construyendo
     *
     * El segundo es el importante: el guión hizo exactamente lo que decía.
     * La falla no fue del agente, fue del comando, que permitía soltar algo
     * que no era suyo. Un lock que cualquiera puede abrir no es un lock.
     *
     * Ahora `libre` exige nombre y sólo suelta lo propio. Para el caso real
     * de un lock huérfano (un agente que murió sin soltar) está `libre
     * <agente> forzar`, que obliga a escribir a quién le estás sacando el
     * lock -- y eso, escrito, ya no se hace por accidente. */
    if (!existsSync(BUILD)) { console.log('✓ build libre'); break; }
    const b = JSON.parse(readFileSync(BUILD, 'utf8'));
    const quien = process.argv[3];
    const forzar = process.argv[4] === 'forzar';

    if (!b.agente) { console.log('✓ build ya estaba libre'); break; }
    if (!quien) {
      console.log(`✗ ¿quién sos? el build lo tiene ${b.agente}`);
      console.log(`  uso:  libre <tu-nombre>            soltar el tuyo`);
      console.log(`        libre <tu-nombre> forzar     sacárselo a ${b.agente}`);
      process.exit(1);
    }
    if (b.agente !== quien && !forzar) {
      console.log(`✗ el build lo tiene ${b.agente}, no vos (${quien}).`);
      console.log('  Si soltás ahora y está construyendo, otro agente puede');
      console.log('  entrar y borrarle el dist a mitad.');
      console.log(`  Si sabés que ${b.agente} ya no está:  libre ${quien} forzar`);
      process.exit(1);
    }
    writeFileSync(BUILD, JSON.stringify({ agente: null, desde: '1970-01-01T00:00:00.000Z' }, null, 2));
    console.log(forzar && b.agente !== quien
      ? `✓ build libre · ${quien} se lo forzó a ${b.agente}`
      : '✓ build libre');
    break;
  }

  default:
    console.log('uso: quien | escritura <agente> [soltar] | crear <agente> <archivo> | tomar <agente> <unidad> | soltar <agente> <estado> | build <agente> | libre');
}
