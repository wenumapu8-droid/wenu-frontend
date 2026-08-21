/**
 * BARRIDO DE LAS 39 LÁMINAS — con los tres detectores ya corregidos
 *
 * El barrido anterior encontró 21 láminas con problemas, pero sus números NO
 * VALEN: los tres instrumentos se corrigieron después, y cada corrección
 * cambió cifras que ya se habían dado por ciertas.
 *
 *   1. RECORTE POR ANCESTROS — un elemento dentro de un contenedor con scroll,
 *      corrido fuera, sigue devolviendo su posición geométrica. Inventaba
 *      solapamientos que nadie ve.
 *   2. PRUEBA DE IMPACTO — dos rectángulos pueden cruzarse sin verse, si una
 *      tercera capa los tapa a los dos. `elementFromPoint` lo resuelve.
 *   3. `checkVisibility` — `getComputedStyle(hijo).display` NO hereda el
 *      `none` del padre. Contaba como visibles hijos de contenedores ocultos.
 *
 * Mide cinco cosas por lámina, en tres vistas:
 *   solapamientos de texto realmente visibles
 *   controles con área táctil menor a 44px (incluyendo el pseudo-elemento)
 *   desborde horizontal y desplazamiento del documento
 *   errores de consola
 *   integridad de la obra: imágenes o lienzos con la proporción deformada
 */
import { chromium } from 'playwright';
import { readdirSync } from 'node:fs';

const B = process.env.KDX_BASE || 'http://127.0.0.1:4620';
const LAMS = readdirSync('src/pages/kodex/lamina')
  .filter((f) => f.endsWith('.astro') && f !== 'index.astro' && f !== 'kit.astro')
  .map((f) => f.replace('.astro', ''));
const VISTAS = [[390, 844], [412, 915], [1440, 900]];

const b = await chromium.launch();
const filas = [];

for (const lam of LAMS) {
  const fila = { lam, sol: 0, taps: 0, desb: 0, scroll: 0, err: 0, deform: 0, peor: '' };
  for (const [w, h] of VISTAS) {
    const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 600, hasTouch: w < 600 });
    const p = await c.newPage();
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e.message).slice(0, 50)));
    try {
      await p.goto(`${B}/kodex/lamina/${lam}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await p.waitForTimeout(6500);
      const d = await p.evaluate(() => {
        const vis = (x) => x.checkVisibility?.({ opacityProperty: true, visibilityProperty: true })
          && parseFloat(getComputedStyle(x).fontSize) > 1;
        const recorte = (el) => {
          const r = el.getBoundingClientRect();
          let x1 = r.left, y1 = r.top, x2 = r.right, y2 = r.bottom;
          for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
            const cs = getComputedStyle(a);
            if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
            const c = a.getBoundingClientRect();
            if (cs.overflowX !== 'visible') { x1 = Math.max(x1, c.left); x2 = Math.min(x2, c.right); }
            if (cs.overflowY !== 'visible') { y1 = Math.max(y1, c.top); y2 = Math.min(y2, c.bottom); }
            if (x2 - x1 <= 0 || y2 - y1 <= 0) return null;
          }
          return { left: x1, top: y1, right: x2, bottom: y2, width: x2 - x1, height: y2 - y1 };
        };
        const T = [];
        for (const el of document.querySelectorAll('body *')) {
          if (!vis(el)) continue;
          const t = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
          if (t.length < 2) continue;
          const rc = recorte(el);
          if (!rc || rc.width < 4 || rc.height < 4 || rc.bottom < 0 || rc.top > innerHeight) continue;
          T.push({ el, rc, t });
        }
        let sol = 0, peor = '', peorP = 0;
        for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) {
          const a = T[i], z = T[j];
          if (a.el.contains(z.el) || z.el.contains(a.el)) continue;
          const ox = Math.min(a.rc.right, z.rc.right) - Math.max(a.rc.left, z.rc.left);
          const oy = Math.min(a.rc.bottom, z.rc.bottom) - Math.max(a.rc.top, z.rc.top);
          if (ox <= 2 || oy <= 2) continue;
          const men = Math.min(a.rc.width * a.rc.height, z.rc.width * z.rc.height);
          const pct = ox * oy / men;
          if (pct < 0.22) continue;
          const cx = Math.max(a.rc.left, z.rc.left) + ox / 2, cy = Math.max(a.rc.top, z.rc.top) + oy / 2;
          const hit = document.elementFromPoint(cx, cy);
          if (!(hit && (a.el.contains(hit) || z.el.contains(hit) || hit === a.el || hit === z.el))) continue;
          sol++;
          if (pct > peorP) { peorP = pct; peor = `${Math.round(pct * 100)}% "${a.t.slice(0, 16)}"×"${z.t.slice(0, 16)}"`; }
        }
        const taps = [...document.querySelectorAll('a,button')].filter((x) => vis(x)).filter((x) => {
          const r = x.getBoundingClientRect(); if (!r.width) return false;
          const hp = parseFloat(getComputedStyle(x, '::after').height) || 0;
          return r.width < 44 || Math.max(r.height, hp) < 44;
        }).length;
        /* Integridad de la obra: proporción deformada. */
        let deform = 0;
        for (const im of document.querySelectorAll('img')) {
          if (!vis(im) || !im.naturalWidth) continue;
          const r = im.getBoundingClientRect(); if (r.width < 40) continue;
          const of = getComputedStyle(im).objectFit;
          if (of !== 'fill' && of !== 'none') continue;
          if (Math.abs(im.naturalWidth / im.naturalHeight - r.width / r.height) / (im.naturalWidth / im.naturalHeight) > 0.04) deform++;
        }
        for (const cv of document.querySelectorAll('canvas')) {
          if (!cv.checkVisibility?.({ opacityProperty: true }) || !cv.width) continue;
          const r = cv.getBoundingClientRect(); if (r.width < 40) continue;
          if (Math.abs(cv.width / cv.height - r.width / r.height) / (cv.width / cv.height) > 0.06) deform++;
        }
        window.scrollTo(0, 600);
        const mueve = window.scrollY; window.scrollTo(0, 0);
        return { sol, peor, taps, deform, mueve,
          desb: document.documentElement.scrollWidth - document.documentElement.clientWidth };
      });
      fila.sol += d.sol; fila.taps += d.taps; fila.deform += d.deform;
      fila.desb = Math.max(fila.desb, d.desb); fila.scroll = Math.max(fila.scroll, d.mueve);
      if (d.peor && !fila.peor) fila.peor = `${w}: ${d.peor}`;
    } catch (e) { errs.push(String(e).slice(0, 40)); }
    fila.err += errs.length;
    await c.close();
  }
  filas.push(fila);
  const mal = fila.sol || fila.taps || fila.desb || fila.scroll || fila.err || fila.deform;
  console.log(`${mal ? '✗' : '·'} ${fila.lam.padEnd(24)} sol ${String(fila.sol).padStart(2)} · taps ${String(fila.taps).padStart(2)} · desb ${fila.desb} · scroll ${fila.scroll} · deform ${fila.deform} · err ${fila.err}${fila.peor ? '  ' + fila.peor : ''}`);
}
await b.close();

const malas = filas.filter((f) => f.sol || f.taps || f.desb || f.scroll || f.err || f.deform);
console.log(`\n${LAMS.length} láminas × 3 vistas · con algún defecto: ${malas.length}`);
console.log(`solapamientos ${filas.reduce((s, f) => s + f.sol, 0)} · taps<44 ${filas.reduce((s, f) => s + f.taps, 0)} · obra deformada ${filas.reduce((s, f) => s + f.deform, 0)} · errores ${filas.reduce((s, f) => s + f.err, 0)}`);
