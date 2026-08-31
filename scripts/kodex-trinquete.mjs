#!/usr/bin/env node
/**
 * KODEX-∞ · TRINQUETE
 * 2026-08-31 · RECOVERY MODE
 *
 * ─────────────────────────────────────────────────────────────────────
 * EL DIAGNÓSTICO DE OCÍN, QUE ES EL CORRECTO
 *
 *   "había progreso técnico real, pero no progreso acumulativo visible.
 *    Cada vez que resolvíamos algo podía quedar huérfano, otra versión
 *    seguía siendo la autoridad, o el gate verificaba 'build correcto' en
 *    vez de 'KODEX realmente mejoró'. Trabajabas muchísimo y el producto
 *    parecía casi igual."
 *
 *   "Una escena que llega a PROVEN no puede retroceder porque otro agente
 *    leyó un documento viejo."
 *
 * Eso es lo que este archivo impide, y es distinto de todo lo que ya
 * teníamos. Los gates de antes preguntan "¿está bien?". El trinquete
 * pregunta **"¿está mejor o igual que la última vez que estuvo bien?"**.
 *
 * Un gate se puede pasar volviendo al estado anterior. Un trinquete no.
 *
 * ─────────────────────────────────────────────────────────────────────
 * CÓMO FUNCIONA
 *
 * Mide propiedades OBSERVABLES del build y guarda la MEJOR marca de cada
 * una. Si una medición nueva es peor que la marca guardada, FALLA y dice
 * exactamente qué retrocedió y cuánto.
 *
 * El diente sólo avanza. Para bajarlo hace falta una decisión explícita
 * de Ocín con `--rebajar <clave> "<razón>"` -- que queda escrita, con
 * fecha y motivo, para que nadie afloje un mínimo sin dejar rastro.
 *
 * ─────────────────────────────────────────────────────────────────────
 * LO QUE NO HACE, Y ES IMPORTANTE
 *
 * No mide si algo se VE bien. Hoy un gate dio 7/7 con el organismo al 11%
 * del viewport porque medía presencia y no proporción. El trinquete puede
 * cuidar un número que Ocín ya aprobó; no puede decidir cuál número
 * merece cuidarse. Eso sigue siendo dirección, y la dirección es suya.
 *
 * Uso:
 *   node scripts/kodex-trinquete.mjs            medir y verificar
 *   node scripts/kodex-trinquete.mjs --marcar   fijar el estado actual
 *   node scripts/kodex-trinquete.mjs --rebajar <clave> "<razón>"
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const MARCAS = join(process.env.HOME, 'kodex-relevo', 'TRINQUETE.json');
const DIST = 'dist';

const sh = (c) => { try { return execSync(c, { encoding: 'utf8', stdio: 'pipe' }); } catch (e) { return (e.stdout || '') + (e.stderr || ''); } };
const leerDist = (p) => { try { return readFileSync(join(DIST, p), 'utf8'); } catch { return ''; } };
const contarPaginas = (dir) => { try { return readdirSync(join(DIST, dir)).filter((d) => existsSync(join(DIST, dir, d, 'index.html'))).length; } catch { return 0; } };

/* Cada medición declara si MÁS es mejor. Sin eso el trinquete no sabe
   para qué lado gira, y un trinquete que gira para los dos lados es una
   rueda libre. */
const MEDIDAS = [
  { k: 'paginas', desc: 'páginas construidas', mas_es_mejor: true,
    m: () => (sh(`find ${DIST} -name index.html | wc -l`).trim() | 0) },
  { k: 'tests', desc: 'tests que pasan', mas_es_mejor: true,
    m: () => { const o = sh('npm run test:kodex 2>&1'); return (o.match(/pass (\d+)/g) || []).reduce((s, x) => s + (+x.split(' ')[1]), 0); } },
  { k: 'escenas_con_riel', desc: 'escenas con riel de instrumento', mas_es_mejor: true,
    m: () => ['index', 'folio/i', 'folio/ii', 'folio/iii', 'folio/iv', 'folio/v', 'folio/vi']
      .filter((r) => leerDist(`kodex/${r === 'index' ? '' : r}/index.html`).includes('kdx-riel__tit')).length },
  { k: 'escenas_con_traza', desc: 'escenas con barra de las siete', mas_es_mejor: true,
    m: () => ['index', 'folio/i', 'folio/ii', 'folio/iii', 'folio/iv', 'folio/v', 'folio/vi']
      .filter((r) => leerDist(`kodex/${r === 'index' ? '' : r}/index.html`).includes('kdx-traza__paso')).length },
  { k: 'escenas_con_campo', desc: 'escenas con campo de materia', mas_es_mejor: true,
    m: () => ['index', 'folio/i', 'folio/ii', 'folio/iii', 'folio/iv', 'folio/v', 'folio/vi']
      .filter((r) => leerDist(`kodex/${r === 'index' ? '' : r}/index.html`).includes('kdx-campo-materia')).length },
  { k: 'chambers', desc: 'chambers con ruta', mas_es_mejor: true,
    m: () => contarPaginas('kodex/chamber') },
  { k: 'laminas_con_camara', desc: 'láminas con cámara temporal', mas_es_mejor: true,
    m: () => { let n = 0; try { for (const d of readdirSync(join(DIST, 'kodex/lamina'))) if (leerDist(`kodex/lamina/${d}/index.html`).includes('data-escena-lamina')) n++; } catch {} return n; } },
  { k: 'huerfanos', desc: 'componentes sin cablear', mas_es_mejor: false,
    m: () => +((sh('node scripts/kodex-inventario-ensamblaje.mjs 2>&1').match(/(\d+) sin una sola importacion/) || [])[1] || 0) },
  { k: 'pagina_mas_pesada_kb', desc: 'KB de la página más pesada', mas_es_mejor: false,
    m: () => { let max = 0; const walk = (d) => { for (const e of readdirSync(d)) { const p = join(d, e); const s = statSync(p); if (s.isDirectory()) walk(p); else if (e === 'index.html') max = Math.max(max, Math.round(s.size / 1024)); } }; try { walk(join(DIST, 'kodex')); } catch {} return max; } },
];

const marcas = existsSync(MARCAS) ? JSON.parse(readFileSync(MARCAS, 'utf8')) : { creado: new Date().toISOString(), dientes: {} };
const args = process.argv.slice(2);

if (args[0] === '--rebajar') {
  const [, clave, razon] = args;
  if (!clave || !razon) { console.error('uso: --rebajar <clave> "<razón>"'); process.exit(1); }
  if (!marcas.dientes[clave]) { console.error(`no existe el diente "${clave}"`); process.exit(1); }
  marcas.dientes[clave].rebajas = [...(marcas.dientes[clave].rebajas || []), { cuando: new Date().toISOString(), razon, desde: marcas.dientes[clave].mejor }];
  delete marcas.dientes[clave].mejor;
  writeFileSync(MARCAS, JSON.stringify(marcas, null, 2));
  console.log(`✓ diente "${clave}" rebajado. Razón registrada: ${razon}`);
  process.exit(0);
}

console.log('\nTRINQUETE · KODEX−∞\n');
const medido = {};
let retrocesos = [];
let avances = [];

for (const d of MEDIDAS) {
  const v = d.m();
  medido[d.k] = v;
  const diente = marcas.dientes[d.k];
  const mejor = diente?.mejor;

  if (mejor === undefined) {
    console.log(`  ·  ${d.desc.padEnd(34)} ${String(v).padStart(6)}   (primer diente)`);
    continue;
  }
  const peor = d.mas_es_mejor ? v < mejor : v > mejor;
  const mejoro = d.mas_es_mejor ? v > mejor : v < mejor;

  if (peor) {
    retrocesos.push({ ...d, v, mejor });
    console.log(`  ✗  ${d.desc.padEnd(34)} ${String(v).padStart(6)}   RETROCEDE desde ${mejor}`);
  } else if (mejoro) {
    avances.push({ ...d, v, mejor });
    console.log(`  ↑  ${d.desc.padEnd(34)} ${String(v).padStart(6)}   avanza desde ${mejor}`);
  } else {
    console.log(`  =  ${d.desc.padEnd(34)} ${String(v).padStart(6)}`);
  }
}

/* El diente avanza solo. Nunca baja por sí mismo: para eso está --rebajar,
   que obliga a escribir la razón. */
if (args.includes('--marcar') || !existsSync(MARCAS)) {
  for (const d of MEDIDAS) {
    const cur = marcas.dientes[d.k]?.mejor;
    const v = medido[d.k];
    const sube = cur === undefined || (d.mas_es_mejor ? v > cur : v < cur);
    marcas.dientes[d.k] = { ...(marcas.dientes[d.k] || {}), desc: d.desc, mas_es_mejor: d.mas_es_mejor, mejor: sube ? v : cur, actualizado: sube ? new Date().toISOString() : marcas.dientes[d.k]?.actualizado };
  }
  writeFileSync(MARCAS, JSON.stringify(marcas, null, 2));
  console.log('\n✓ dientes fijados en la mejor marca conocida');
} else if (avances.length) {
  for (const a of avances) marcas.dientes[a.k].mejor = a.v, marcas.dientes[a.k].actualizado = new Date().toISOString();
  writeFileSync(MARCAS, JSON.stringify(marcas, null, 2));
  console.log(`\n✓ ${avances.length} diente(s) avanzaron y quedaron fijados`);
}

if (retrocesos.length) {
  console.log(`\n✗ TRINQUETE ROTO · ${retrocesos.length} retroceso(s)\n`);
  for (const r of retrocesos) console.log(`  ${r.desc}: ${r.v} — antes fue ${r.mejor}`);
  console.log('\nAlgo que ya funcionaba dejó de funcionar. No es una mejora que');
  console.log('todavía no llega: es terreno perdido.');
  console.log('\nSi el retroceso es deliberado y está decidido, registralo:');
  console.log(`  node scripts/kodex-trinquete.mjs --rebajar ${retrocesos[0].k} "por qué"\n`);
  process.exit(1);
}

console.log('\n✓ el trinquete sostiene: nada retrocedió\n');
