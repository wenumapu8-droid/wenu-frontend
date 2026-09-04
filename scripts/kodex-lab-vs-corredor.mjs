#!/usr/bin/env node
/**
 * KODEX-∞ · QUE HAY ENTERRADO EN lab/
 * 2026-09-03
 *
 * Ocin: "de un momento a otro desaparecio."
 *
 * La hipotesis a medir: no desaparecio, dejo de ser ALCANZABLE. Hay
 * versiones resueltas viviendo en /kodex/lab/ con cero enlaces entrantes,
 * mientras la version conectada del corredor siguio acumulando chasis.
 *
 * Este script no opina sobre cual es mejor. Mide las dos con el MISMO
 * instrumento que usa el gate -- navegador real, 390x844 -- e informa los
 * enlaces entrantes de cada una. "Mejor" lo decide el creador mirando el
 * PNG lado a lado; esto solo dice donde mirar.
 *
 * Uso: node scripts/kodex-lab-vs-corredor.mjs [dist]
 */
import { readFileSync, existsSync, readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { createServer } from 'node:http';
import { MEDIR_EN_PAGINA } from './kodex-visual-fidelity-gate.mjs';

const DIST = process.argv[2] || 'dist';
const SALIDA = 'reports/lab';

/* ── todas las paginas construidas ─────────────────────────────────── */
function paginas(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const f = join(dir, e);
    if (statSync(f).isDirectory()) paginas(f, acc);
    else if (e === 'index.html') acc.push(f);
  }
  return acc;
}

/* ── quien enlaza a quien ──────────────────────────────────────────────
   Un href puede ser relativo, absoluto o llevar barra final. Se normaliza
   todo a una ruta absoluta con barra, si no los conteos dan cero por
   diferencias de escritura y no por falta de enlaces.                    */
function grafoDeEnlaces(todas) {
  const entrantes = new Map();
  const normal = (u) => ('/' + u.replace(/^\/+/, '').replace(/index\.html$/, '').replace(/\/+$/, '') + '/').replace(/^\/+/, '/');
  for (const f of todas) entrantes.set(normal('/' + relative(DIST, f)), new Set());
  for (const f of todas) {
    const desde = normal('/' + relative(DIST, f));
    const html = readFileSync(f, 'utf8');
    for (const m of html.matchAll(/href\s*=\s*["']([^"'#?]+)/g)) {
      let h = m[1];
      if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(h)) continue;
      if (!h.startsWith('/')) {
        const base = '/' + relative(DIST, f).replace(/index\.html$/, '');
        h = new URL(h, 'http://x' + base).pathname;
      }
      const dest = normal(h);
      if (entrantes.has(dest) && dest !== desde) entrantes.get(dest).add(desde);
    }
  }
  return entrantes;
}

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.avif': 'image/avif', '.woff2': 'font/woff2',
  '.woff': 'font/woff', '.mp4': 'video/mp4', '.ico': 'image/x-icon' };

function servir(raiz) {
  return new Promise((res) => {
    const s = createServer((req, rp) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      let f = join(raiz, p);
      if (existsSync(f) && !extname(f)) f = join(f, 'index.html');
      else if (!existsSync(f) && existsSync(f + '/index.html')) f = f + '/index.html';
      if (!existsSync(f) || !extname(f)) { rp.writeHead(404); return rp.end('no'); }
      try {
        rp.writeHead(200, { 'content-type': MIME[extname(f)] || 'application/octet-stream' });
        rp.end(readFileSync(f));
      } catch { rp.writeHead(500); rp.end('e'); }
    });
    s.listen(0, '127.0.0.1', () => res({ s, puerto: s.address().port }));
  });
}

/* ── el corredor conectado, para comparar contra el ────────────────── */
const CORREDOR = [
  ['THRESHOLD', '/kodex/'],
  ['PROLOGUE',  '/kodex/folio/i/'],
  ['DESCENT',   '/kodex/folio/ii/'],
  ['ARCHIVE',   '/kodex/folio/iii/'],
  ['MACHINE',   '/kodex/folio/iv/'],
  ['COSMOLOGY', '/kodex/folio/v/'],
  ['RETURN',    '/kodex/folio/vi/'],
];

async function main() {
  const todas = paginas(DIST);
  const entrantes = grafoDeEnlaces(todas);
  const rutasLab = todas
    .map((f) => '/' + relative(DIST, f).replace(/index\.html$/, ''))
    .filter((u) => u.startsWith('/kodex/lab/') || u === '/kodex/lab/')
    .sort();

  mkdirSync(SALIDA, { recursive: true });
  const { chromium } = await import('playwright');
  let nav = null;
  for (const o of [{}, { channel: 'chromium' }, { channel: 'chrome' }]) {
    try { nav = await chromium.launch(o); break; } catch { /* siguiente */ }
  }
  if (!nav) { console.error('sin navegador: no se puede medir. npx playwright install chromium'); process.exit(1); }

  const { s, puerto } = await servir(DIST);
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const pag = await ctx.newPage();

  async function medir(url) {
    await pag.goto(`http://127.0.0.1:${puerto}${url}`, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
    await pag.evaluate(() => document.fonts?.ready).catch(() => {});
    await pag.waitForTimeout(700);
    /* dos tomas: si no coinciden en textos, la pantalla sigue moviendose */
    const a = await pag.evaluate(MEDIR_EN_PAGINA);
    await pag.waitForTimeout(600);
    const b = await pag.evaluate(MEDIR_EN_PAGINA);
    return { ...b, movil: a.textosVisibles !== b.textosVisibles ? `${a.textosVisibles}/${b.textosVisibles}` : null };
  }

  const pesoDe = (url) => {
    const f = join(DIST, url.replace(/^\//, ''), 'index.html');
    if (!existsSync(f)) return { kb: 0, elem: 0 };
    const h = readFileSync(f, 'utf8');
    return { kb: Math.round(h.length / 1024), elem: (h.match(/<[a-zA-Z]/g) || []).length };
  };

  const filas = [];
  for (const [nom, url] of CORREDOR) {
    const m = await medir(url); const p = pesoDe(url);
    filas.push({ zona: 'CORREDOR', nombre: nom, url, entrantes: (entrantes.get(url) || new Set()).size, m, p });
  }
  for (const url of rutasLab) {
    const m = await medir(url); const p = pesoDe(url);
    filas.push({ zona: 'LAB', nombre: url.replace('/kodex/lab/', '').replace(/\/$/, '') || '(indice)',
      url, entrantes: (entrantes.get(url) || new Set()).size, m, p });
  }

  await ctx.close(); await nav.close(); s.close();

  const pct = (v) => (v * 100).toFixed(0) + '%';
  const linea = (f) => `${String(f.entrantes).padStart(3)}  ${String(f.m.textosVisibles).padStart(4)}  `
    + `${pct(f.m.obraOcupa).padStart(5)}  ${String(f.m.textosPisados).padStart(4)}  `
    + `${String(f.p.kb).padStart(4)}  ${String(f.p.elem).padStart(4)}  ${f.nombre}${f.m.movil ? '  ~' + f.m.movil : ''}`;

  console.log('\nQUE HAY ENTERRADO EN lab/ · KODEX−∞');
  console.log(`390×844 sobre ${DIST} · el mismo instrumento que el gate\n`);
  console.log(' ent  txt   obra  pisa    KB  elem  pagina');
  console.log(' ───  ───  ─────  ────  ────  ────  ──────────────────────────');
  console.log('CORREDOR (lo que se ve hoy)');
  for (const f of filas.filter((x) => x.zona === 'CORREDOR')) console.log(linea(f));
  console.log('\nLAB (construido, medido, y con los enlaces que tenga)');
  for (const f of filas.filter((x) => x.zona === 'LAB').sort((a, b) => a.m.textosVisibles - b.m.textosVisibles)) console.log(linea(f));

  const huerfanas = filas.filter((f) => f.zona === 'LAB' && f.entrantes === 0);
  const limpias = huerfanas.filter((f) => f.m.textosVisibles <= 12 && f.m.textosPisados === 0);
  console.log(`\n${huerfanas.length} de ${filas.filter((f) => f.zona === 'LAB').length} paginas de lab tienen CERO enlaces entrantes.`);
  console.log(`${limpias.length} de esas cumplen el umbral del gate en textos (≤12) y no pisan nada:`);
  for (const f of limpias) console.log(`   ${f.url}   ${f.m.textosVisibles} textos · obra ${pct(f.m.obraOcupa)} · ${f.p.kb} KB`);

  writeFileSync(join(SALIDA, 'lab-vs-corredor.json'), JSON.stringify({ fecha: new Date().toISOString(), filas }, null, 2));
  console.log(`\ndetalle en ${SALIDA}/lab-vs-corredor.json`);
  console.log('\n"ent" = paginas del sitio que enlazan a esta. Cero = construida,');
  console.log('servida, y inalcanzable navegando. Eso NO dice que sea mejor:');
  console.log('dice donde hay que mirar antes de volver a construir algo.\n');
}
main().catch((e) => { console.error('se rompio:', e); process.exit(1); });
