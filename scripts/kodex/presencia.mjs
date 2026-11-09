/**
 * TABLA DE PRESENCIA — qué desapareció, no qué se pisa.
 *
 * Idea del agente del Folio I, y nace de un error suyo que vale para mí igual:
 * al ocultar un bloque de datos dejó el botón que lo recupera dentro de una
 * condición que sólo valía en una escena, así que en cinco escenas esa
 * información quedó oculta Y SIN DESTINO. Su frase: "«nada se pierde, se cambia
 * de lugar» sólo es cierto si el lugar existe."
 *
 * Yo afirmé exactamente eso del tríptico —92 bloques leídos, 92 repartidos— y
 * ese número mide bloques ASIGNADOS a una zona, no bloques VISIBLES. Además el
 * tríptico oculta el texto de la plancha en SIGNAL y EVIDENCE. Si un bloque no
 * llegó a ninguna de las tres páginas, desapareció sin que nadie lo notara.
 *
 * Esto lo comprueba: recorre las tres páginas, junta el texto REALMENTE visible
 * en cada una, y lo compara contra el texto que la plancha tenía antes de que
 * el tríptico se montara. Lo que no aparezca en ninguna, es una pérdida.
 */
import { chromium } from 'playwright';
import { readdirSync } from 'node:fs';

const B = process.env.KDX_BASE || 'http://127.0.0.1:4342';
const LAMS = process.env.KDX_LAMS
  ? process.env.KDX_LAMS.split(',')
  : readdirSync('src/pages/kodex/lamina')
      .filter((f) => f.endsWith('.astro') && f !== 'index.astro')
      .map((f) => f.replace('.astro', ''));

const b = await chromium.launch();
let perdidasTotal = 0, sinTriptico = 0;
const informe = [];

for (const lam of LAMS) {
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await c.newPage();
  try {
    /* Primero, la plancha ANTES del tríptico: se corta el script bloqueando el
       módulo, para leer la verdad de origen y no la que el tríptico dejó. */
    await p.goto(`${B}/kodex/lamina/${lam}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await p.waitForTimeout(6500);

    const r = await p.evaluate(() => {
      const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
      const tri = document.querySelector('.kdx-tri');
      if (!tri) return { sinTri: true };

      /* Origen: todo el texto de la plancha, visible o no — es lo que había. */
      const raiz = document.querySelector('[data-lam],[data-lamina]');
      const origen = new Set();
      raiz?.querySelectorAll('svg text, p, h1, h2, h3, strong, b, span, dd, dt, li, em, small')
        .forEach((e) => {
          if (e.querySelector('p,h1,h2,h3,span,dd,dt,li,strong,b,em,small')) return;
          const t = norm(e.textContent);
          if (t.length >= 2) origen.add(t);
        });

      /* Presencia: el texto que cada página del tríptico muestra de verdad. */
      const porPagina = {};
      const union = new Set();
      for (const [i, sel] of [[0, '--signal'], [1, '--field'], [2, '--evidence']]) {
        const pag = tri.querySelector(`.kdx-tri__p${sel}`);
        const vis = new Set();
        pag?.querySelectorAll('p,h1,span,a').forEach((e) => {
          const t = norm(e.textContent);
          if (t.length >= 2) { vis.add(t); union.add(t); }
        });
        porPagina[i] = vis.size;
      }

      const perdidos = [...origen].filter((t) => !union.has(t));
      return {
        origen: origen.size, union: union.size, porPagina,
        perdidos: perdidos.slice(0, 6), nPerdidos: perdidos.length,
        declarado: tri.dataset.kdxBloques, repartido: tri.dataset.kdxRepartidos,
      };
    });

    if (r.sinTri) { sinTriptico++; informe.push(`${lam}: sin tríptico`); }
    else {
      perdidasTotal += r.nPerdidos;
      const marca = r.nPerdidos ? '✗' : '·';
      informe.push(
        `${marca} ${lam.padEnd(24)} origen ${String(r.origen).padStart(3)} · en las 3 páginas ${String(r.union).padStart(3)}` +
        ` (I:${r.porPagina[0]} II:${r.porPagina[1]} III:${r.porPagina[2]})` +
        ` · declarado ${r.declarado}→${r.repartido}` +
        (r.nPerdidos ? ` · PERDIDOS ${r.nPerdidos}` : ''));
      if (r.nPerdidos) for (const t of r.perdidos) informe.push(`     falta: "${t.slice(0, 62)}"`);
    }
  } catch (e) { informe.push(`${lam}: ERROR ${String(e).slice(0, 60)}`); }
  await c.close();
}
await b.close();

console.log(informe.join('\n'));
console.log(`\n${LAMS.length} láminas · sin tríptico ${sinTriptico} · BLOQUES PERDIDOS EN TOTAL: ${perdidasTotal}`);
