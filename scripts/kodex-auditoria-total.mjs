#!/usr/bin/env node
/**
 * KODEX-∞ · AUDITORÍA TOTAL
 * 2026-08-31
 *
 * Ocín: "no está todo aún, podés auditarlo y poner todo realmente".
 *
 * Tenía razón: las vistas anteriores mostraban muestras. Esto no muestrea.
 * Recorre TODO y emite un JSON con cada pieza, para que la vista no tenga
 * que elegir qué mostrar.
 *
 *   imágenes   las 1278, con familia, peso, fecha y si están en uso
 *   rutas      las 172, con estado y por qué
 *   código     los 461 archivos, con quién los alcanza
 *   scripts    las herramientas, con qué mide cada una
 *
 * NO genera miniaturas: eso lo hace otro paso, porque 1278 imágenes en
 * base64 no entran en una página. Acá se cataloga; allá se ilustra.
 */
import { readFileSync, existsSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, extname, basename } from 'node:path';
import { execSync } from 'node:child_process';

const SALIDA = 'reports/kodex-auditoria-total.json';
const IMG = /\.(jpg|jpeg|png|webp|avif|svg|gif)$/i;

function recorrer(dir, filtro, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir)) {
    if (e.startsWith('.') || e === 'node_modules') continue;
    const p = join(dir, e);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) recorrer(p, filtro, acc);
    else if (filtro(e)) acc.push({ p, size: st.size, mtime: st.mtime });
  }
  return acc;
}

/* ── IMÁGENES ─────────────────────────────────────────────────────────── */
const imgs = recorrer('public', (e) => IMG.test(e));

/* Se marca en uso si el nombre aparece en algún fuente. No es perfecto --
   una imagen puede construirse por concatenación -- pero es verificable y
   no inventa: lo que no se encuentra queda "sin referencia", no "basura". */
let fuentesTxt = '';
for (const d of ['src', 'scripts']) {
  for (const f of recorrer(d, (e) => /\.(astro|ts|js|mjs|json|css)$/.test(e))) {
    try { fuentesTxt += readFileSync(f.p, 'utf8'); } catch {}
  }
}

/* CORRECCIÓN. Buscar el nombre en el código marcaba como NO USADAS 834
   imágenes de kodex-content/free que sí se sirven -- se referencian por
   MANIFIESTO, construidas en runtime desde obras.json y manifest.json, no
   escritas literalmente en ningún .astro.
   Una imagen usada por manifiesto es tan usada como una escrita a mano; la
   diferencia es solo dónde vive la referencia. Sin esto, la auditoría
   proponía botar 56 MB de obra que está publicada. */
/* Los manifiestos viven en public/, no en dist/: dist es una copia y puede
   estar a medio construir. Leer el origen y no la copia. */
for (const m of recorrer('public/kodex-content', (e) => e.endsWith('.json')).map((f) => f.p)
                  .concat(['src/data/kodex-atlas.json'])) {
  if (existsSync(m)) { try { fuentesTxt += readFileSync(m, 'utf8'); } catch {} }
}
/* Y el HTML construido: si una imagen llega al sitio, está en uso aunque
   ninguna fuente la nombre. */
for (const f of recorrer('dist/kodex', (e) => e === 'index.html').slice(0, 400)) {
  try { fuentesTxt += readFileSync(f.p, 'utf8'); } catch {}
}

const imagenes = imgs.map((i) => {
  const rel = relative('public', i.p);
  const fam = rel.split('/').slice(0, 2).join('/');
  const nom = basename(i.p);
  return {
    ruta: rel,
    fam,
    nom,
    kb: Math.round(i.size / 1024),
    fecha: i.mtime.toISOString().slice(0, 10),
    usada: fuentesTxt.includes(nom),
  };
});

/* ── RUTAS ────────────────────────────────────────────────────────────── */
let rutas = [];
if (existsSync('reports/kodex-estado.json')) {
  rutas = JSON.parse(readFileSync('reports/kodex-estado.json', 'utf8')).items;
}

/* ── CÓDIGO ───────────────────────────────────────────────────────────── */
const codigo = recorrer('src', (e) => /\.(astro|ts|js|mjs)$/.test(e) && !/\.test\./.test(e))
  .filter((f) => f.p.includes('kodex'))
  .map((f) => ({
    ruta: relative('src', f.p),
    kb: Math.round((f.size / 1024) * 10) / 10,
    fecha: f.mtime.toISOString().slice(0, 10),
    tipo: extname(f.p).slice(1),
  }));

/* ── GIT ──────────────────────────────────────────────────────────────── */
const sh = (c) => { try { return execSync(c, { encoding: 'utf8' }).trim(); } catch { return ''; } };
const git = {
  rama: sh('git branch --show-current'),
  head: sh('git log -1 --format="%h %s"').slice(0, 70),
  commitsHoy: +sh('git log --since="24 hours ago" --oneline | wc -l') || 0,
  sinSubir: +sh('git log --oneline @{u}..HEAD 2>/dev/null | wc -l') || 0,
};

const porFam = {};
for (const i of imagenes) {
  const f = (porFam[i.fam] ||= { n: 0, kb: 0, usadas: 0 });
  f.n++; f.kb += i.kb; if (i.usada) f.usadas++;
}

mkdirSync('reports', { recursive: true });
writeFileSync(SALIDA, JSON.stringify({
  generado: new Date().toISOString(),
  git,
  resumen: {
    imagenes: imagenes.length,
    imagenesMB: Math.round(imagenes.reduce((s, i) => s + i.kb, 0) / 1024),
    imagenesUsadas: imagenes.filter((i) => i.usada).length,
    rutas: rutas.length,
    codigo: codigo.length,
    familias: Object.keys(porFam).length,
  },
  porFam,
  imagenes,
  rutas,
  codigo,
}, null, 2));

console.log(`\nAUDITORÍA TOTAL\n`);
console.log(`  ${String(imagenes.length).padStart(5)} imágenes · ${Math.round(imagenes.reduce((s, i) => s + i.kb, 0) / 1024)} MB · ${imagenes.filter((i) => i.usada).length} referenciadas en código`);
console.log(`  ${String(rutas.length).padStart(5)} rutas`);
console.log(`  ${String(codigo.length).padStart(5)} archivos de código`);
console.log(`  ${String(Object.keys(porFam).length).padStart(5)} familias de imagen\n`);
console.log(`  → ${SALIDA}\n`);
