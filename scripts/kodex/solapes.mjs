/**
 * Detector de solapamientos de TEXTO. Escrito por el agente del Folio I y
 * adaptado acá para recorrer las 39 láminas.
 *
 * Ocín, textual: "no quiero que se sobrepongan elementos como palabras con
 * signos y con iconos o infográficos".
 *
 * Por qué existe: ninguna métrica de layout ve esto. Una página puede tener
 * cero desborde, cero tap-target chico y cero error JS, y aun así tener el
 * título encima de un rótulo. Sólo se veía mirando cada captura, una por una.
 *
 * Lo importante del algoritmo es lo que DESCARTA: el anidamiento padre-hijo.
 * Sin eso el 70% son falsos positivos —un span dentro de su propia etiqueta—
 * y el informe se vuelve inútil.
 */
import { chromium } from 'playwright';
import { readdirSync } from 'node:fs';
const B = process.env.KDX_BASE || 'http://127.0.0.1:4342';
const LAMS = process.env.KDX_LAMS
  ? process.env.KDX_LAMS.split(',')
  : readdirSync('src/pages/kodex/lamina')
      .filter((f) => f.endsWith('.astro') && f !== 'index.astro')
      .map((f) => f.replace('.astro', ''));
const VP = [
  { n:'390x844',  w:390,  h:844,  m:true },
  { n:'844x390',  w:844,  h:390,  m:true },
  { n:'1440x900', w:1440, h:900,  m:false },
];
const b = await chromium.launch();
const informe = [];
for (const v of VP) {
  const c = await b.newContext({ viewport:{width:v.w,height:v.h}, isMobile:v.m, hasTouch:v.m });
for (const lam of LAMS) {
  const p = await c.newPage();
  try {
  await p.goto(`${B}/kodex/lamina/${lam}/`, { waitUntil:'domcontentloaded', timeout:30000 });
  /* 6,5s y no 2,5: la capa de vida necesita cuatro ciclos para que emerjan las
     señales, y son justo los elementos que podrían pisar el cromo. Medir antes
     de que existan sería medir una página que nadie ve. */
  await p.waitForTimeout(6500);
  const R = await p.evaluate(() => {
    /* ── EL RECTÁNGULO REALMENTE VISIBLE ────────────────────────────────
       Hallazgo del agente del Folio I, y es un fallo del INSTRUMENTO, no de
       las páginas: un elemento dentro de un contenedor con scroll, corrido
       fuera de la parte visible, está recortado en pantalla pero
       `getBoundingClientRect` sigue devolviendo su posición geométrica. El
       detector lo reportaba encima de cosas que nunca llegan a tocarse.

       En su corredor eran seis superposiciones inexistentes y estuvo
       arreglando fantasmas. Acá el riesgo es el mismo y peor: el tríptico
       tiene páginas con `overflow-y:auto`, así que estos números había que
       rehacerlos antes de creerles.

       La corrección: recortar contra cada ancestro que recorta. Si el
       rectángulo queda vacío, el elemento no está a la vista y no cuenta. */
    const rectoVisible = (el) => {
      let r = el.getBoundingClientRect();
      let x1 = r.left, y1 = r.top, x2 = r.right, y2 = r.bottom;
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        const cs = getComputedStyle(a);
        const cortaX = cs.overflowX !== 'visible';
        const cortaY = cs.overflowY !== 'visible';
        if (!cortaX && !cortaY) continue;
        const c = a.getBoundingClientRect();
        if (cortaX) { x1 = Math.max(x1, c.left); x2 = Math.min(x2, c.right); }
        if (cortaY) { y1 = Math.max(y1, c.top); y2 = Math.min(y2, c.bottom); }
        if (x2 - x1 <= 0 || y2 - y1 <= 0) return null;
      }
      return { left: x1, top: y1, right: x2, bottom: y2, width: x2 - x1, height: y2 - y1 };
    };
    const vis = [];
    for (const e of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(e);
      if (cs.display==='none' || cs.visibility==='hidden' || parseFloat(cs.opacity) < 0.12) continue;
      if (e.getAttribute('aria-hidden')==='true') continue;
      // solo elementos que llevan texto propio
      const txt = [...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').trim();
      if (txt.length < 2) continue;
      const r = rectoVisible(e);
      if (!r) continue;
      if (r.width<4 || r.height<4 || r.bottom<0 || r.top>innerHeight || r.right<0 || r.left>innerWidth) continue;
      vis.push({ e, t:txt.slice(0,32), x:r.left, y:r.top, r:r.right, b:r.bottom, w:r.width, h:r.height,
                 cls:(e.className||'').toString().slice(0,34) });
    }
    const pares = [];
    for (let i=0;i<vis.length;i++) for (let j=i+1;j<vis.length;j++) {
      const a=vis[i], z=vis[j];
      // padre conteniendo a su hijo NO es un solapamiento, es anidamiento
      if (a.e.contains(z.e) || z.e.contains(a.e)) continue;
      const ox = Math.min(a.r,z.r) - Math.max(a.x,z.x);
      const oy = Math.min(a.b,z.b) - Math.max(a.y,z.y);
      if (ox<=2 || oy<=2) continue;
      const area = ox*oy, menor = Math.min(a.w*a.h, z.w*z.h);
      if (area/menor < 0.22) continue;                 // roces mínimos no cuentan
      pares.push({ a:a.t, ca:a.cls, z:z.t, cz:z.cls, cubre:+(100*area/menor).toFixed(0) });
    }
    return pares.sort((x,y)=>y.cubre-x.cubre).slice(0,10);
  });
  if (R.length) informe.push({ vp:v.n, lam, pares:R });
  } catch (e) { informe.push({ vp:v.n, lam, error:String(e).slice(0,60) }); }
  await p.close();
}
  await c.close();
}
await b.close();

let total = 0;
for (const v of VP) {
  const de = informe.filter((x) => x.vp === v.n);
  const n = de.reduce((s, x) => s + (x.pares?.length ?? 0), 0);
  total += n;
  console.log(`\n### ${v.n} — ${n} solapamientos en ${de.length} de ${LAMS.length} láminas`);
  for (const d of de) {
    if (d.error) { console.log(`  ${d.lam}: ERROR ${d.error}`); continue; }
    console.log(`  ${d.lam}:`);
    for (const s of d.pares.slice(0, 4))
      console.log(`     ${String(s.cubre).padStart(3)}%  "${s.a}" [${s.ca}]  sobre  "${s.z}" [${s.cz}]`);
  }
}
console.log(`\nTOTAL: ${total} solapamientos de texto en ${LAMS.length} láminas × ${VP.length} viewports`);
