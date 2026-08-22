#!/usr/bin/env node
/* EL CIRCUITO · KODEX−∞
 *
 * Cuatro archivos que todos los agentes leen y escriben, para no tener que
 * avisarse entre sí. Se GENERAN desde los datos reales del repositorio, no se
 * escriben a mano: un registro escrito a mano se pudre en una semana y después
 * nadie sabe si lo que dice sigue siendo cierto.
 *
 *   estado/CURRENT_STATE.json       qué está publicado y verificado
 *   estado/CONTENT_REGISTRY.json    qué material existe y cuánto
 *   estado/EXPERIENCE_REGISTRY.json las 7 escenas y su estado real
 *   estado/CONTENT_GAPS.md          lo que sólo puede decidir un humano
 *
 * Lo que NO se genera va marcado `"fuente": "humano"` y se conserva entre
 * corridas. Todo lo demás se recalcula y se pisa.
 *
 *   node scripts/kodex/estado-circuito.mjs
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const sh = (c) => { try { return execSync(c, { encoding: 'utf8' }).trim(); } catch { return ''; } };
const leerJson = (p, x = null) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return x; } };
const contar = (d, f = () => true) => { try { return readdirSync(d).filter(f).length; } catch { return 0; } };

/* ── conservar lo que puso un humano ───────────────────────────────────── */
const previo = leerJson('estado/EXPERIENCE_REGISTRY.json', {});
const decisiones = previo.decisiones_humanas ?? {};

/* ── qué está publicado ────────────────────────────────────────────────── */
const estado = {
  generado: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
  nota: 'GENERADO por scripts/kodex/estado-circuito.mjs. No editar a mano: se pisa.',
  repositorio: {
    rama: sh('git rev-parse --abbrev-ref HEAD'),
    head: sh('git rev-parse HEAD'),
    head_corto: sh('git rev-parse --short HEAD'),
    limpio: sh('git status --porcelain') === '',
    ultimo_commit: sh("git log -1 --format='%s'").slice(0, 90),
  },
  linajes: {
    nota: 'converge/kodex-todo es la confluencia, no una tercera línea.',
    'redesign-v2_atras_de_converge': Number(sh('git rev-list --count origin/redesign-v2..HEAD') || 0),
    'PR101_atras_de_converge': Number(sh('git rev-list --count origin/feat/kodex-manifestation-recipe-p0-4..HEAD') || 0),
    'converge_atras_de_PR101': Number(sh('git rev-list --count HEAD..origin/feat/kodex-manifestation-recipe-p0-4') || 0),
  },
  portones_de_publicacion: {
    'dist/p_debe_dar': 174,
    'dist/p_actual': contar('dist/p'),
    nota: 'Un dist con ALLOW_EMPTY_PRODUCTS=true da 0 y sube sin protestar, borrando la tienda.',
  },
  produccion: {
    url: 'https://wenumapuonline.com/kodex/',
    despliegue: decisiones.despliegue_actual ?? 'ver `wrangler pages deployment list`',
    sube_desde: 'Mac mini. Wrangler falla en el iMac: macOS 12.6 no soportado, EPIPE en 3415/3952.',
  },
  verificacion: decisiones.verificacion ?? {
    nota: 'lo pone quien corra el arnés; ver scripts/kodex/qa-barrido.mjs y qa-banco.mjs',
  },
  defectos_abiertos: decisiones.defectos_abiertos ?? [],
  deudas_de_arnes: [
    'El barrido no detecta TEXTO SOBRE OBRA. Costó un porte revertido: los números daban 0 y PROLOGUE estaba roto.',
    'El barrido no cubre el estado posterior a cruzar el velo salvo por el banco.',
  ],
};

/* ── qué material existe ───────────────────────────────────────────────── */
const ramas = leerJson('public/kodex-content/ramas.json', {});
const obras = leerJson('public/kodex-content/obras.json', {});
const marcas = leerJson('public/kodex-content/marcas.json', {});
const recetas = leerJson('src/lib/kodex/grammar/kdx_scene_recipes.json', []);
const movs = leerJson('src/lib/kodex/grammar/kdx_motion_presets.json', {});
const elems = leerJson('src/lib/kodex/grammar/kdx_element_registry.v0.1.json', {});
const inv = sh('node scripts/kodex/inventario-convergencia.mjs');
const num = (re) => Number((inv.match(re) ?? [])[1] ?? 0);

const contenido = {
  generado: estado.generado,
  nota: estado.nota,
  grafo: {
    nodos: Object.keys(ramas.nodos ?? {}).length,
    con_vecinos: Object.keys(ramas.vecinos ?? {}).length,
    archivo: 'public/kodex-content/ramas.json',
  },
  obra_del_creador: {
    curadas: (obras.obras ?? []).length,
    archivo: 'public/kodex-content/obras.json',
    filtro: 'saturación < 0.05 Y llena el cuadro. Verificado a ojo en hoja de contactos.',
  },
  atomos: {
    marcas_extraidas: (marcas.marcas ?? []).length,
    de_planchas: 13,
    archivo: 'public/kodex-content/marcas.json',
    nota: 'Primer eslabón de ATOMS. P13 no arranca de cero.',
  },
  gramatica: {
    recetas_de_escena: Array.isArray(recetas) ? recetas.length : Object.keys(recetas).length,
    presets_de_movimiento: Object.keys(movs.presets ?? movs).length,
    elementos_registrados: (elems.elements ?? []).length,
    nota: 'El registro de elementos está HUÉRFANO: el ensamblador no valida contra su lista de piezas.',
  },
  codigo: {
    rastreables: num(/rastreables\s*:\s*(\d+)/),
    vivos: num(/vivos\s*:\s*(\d+)/),
    huerfanos: num(/huérfanos\s*:\s*(\d+)/),
    laminas_a_mano: contar('src/pages/kodex/lamina', (f) => f.endsWith('.astro')),
    nota: 'Huérfano no es basura: es material escrito que nadie cableó.',
  },
};

/* ── las siete escenas ─────────────────────────────────────────────────── */
const ESCENAS = [
  ['U1', 'threshold', '/kodex/', 'absorción', 'el campo del prototipo'],
  ['U2', 'prologue', '/kodex/folio/i/', 'observación', 'la obra que observa'],
  ['U3', 'descent', '/kodex/folio/ii/', 'caída', 'las capas que se multiplican'],
  ['U4', 'archive', '/kodex/folio/iii/', 'expansión en capas', 'el registro dentro del registro'],
  ['U5', 'machine', '/kodex/folio/iv/', 'ensamblaje', 'la obra que se transmuta'],
  ['U6', 'cosmology', '/kodex/folio/v/', 'apertura infinita', 'el mapa orbital'],
  ['U7', 'return', '/kodex/folio/vi/', 'convergencia', 'el espécimen del visitante'],
];
const experiencia = {
  generado: estado.generado,
  nota: estado.nota + ' Lo puesto por un humano vive en `decisiones_humanas` y se conserva.',
  escenas: ESCENAS.map(([u, id, ruta, funcion, dominante]) => ({
    umbral: u, id, ruta, funcion,
    objeto_dominante: dominante,
    obra_asignada: decisiones.obras_por_escena?.[id] ?? null,
    obra_estado: decisiones.obras_por_escena?.[id] ? 'APROBADA' : 'PENDIENTE_DE_OCIN',
    existe: existsSync(`dist${ruta}index.html`) || existsSync(`dist-after${ruta}index.html`),
  })),
  decisiones_humanas: decisiones,
};

writeFileSync('estado/CURRENT_STATE.json', JSON.stringify(estado, null, 2) + '\n');
writeFileSync('estado/CONTENT_REGISTRY.json', JSON.stringify(contenido, null, 2) + '\n');
writeFileSync('estado/EXPERIENCE_REGISTRY.json', JSON.stringify(experiencia, null, 2) + '\n');
console.log('escritos los tres JSON en estado/');
console.log(`  grafo ${contenido.grafo.nodos} nodos · obras ${contenido.obra_del_creador.curadas} · código ${contenido.codigo.vivos}/${contenido.codigo.rastreables} vivos`);
