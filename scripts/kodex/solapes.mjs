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
    /* ── QUINTA CORRECCIÓN AL INSTRUMENTO: MEDIR LETRAS, NO CAJAS ──────
       La encontró el agente del corredor y me corrige a mí. El detector
       comparaba la CAJA del elemento, y la caja de un bloque va de borde a
       borde aunque su texto ocupe sólo la punta izquierda. Un rótulo ancho con
       tres palabras a la izquierda "se solapaba" con cualquier cosa a su
       derecha, aunque entre las letras hubiera doscientos píxeles de aire.

       En `genesis-cradle` esto convirtió 8 supuestas superposiciones al 63% en
       CERO: eran etiquetas de bloque con su valor al lado, dentro de la misma
       caja y sin tocarse nunca.

       Un `Range` sobre los nodos de texto devuelve el rectángulo que ocupan las
       letras de verdad. Es lo que hay que comparar, porque es lo único que el
       ojo ve encimado. Todos mis números de solapes ANTERIORES a esta línea
       llevan el sesgo y no valen. */
    const rectoLetras = (el) => {
      let x1=Infinity, y1=Infinity, x2=-Infinity, y2=-Infinity, hubo=false;
      for (const n of el.childNodes) {
        if (n.nodeType !== 3 || !n.textContent.trim()) continue;
        const rg = document.createRange();
        rg.selectNodeContents(n);
        for (const q of rg.getClientRects()) {
          if (q.width <= 0 || q.height <= 0) continue;
          hubo = true;
          x1=Math.min(x1,q.left); y1=Math.min(y1,q.top);
          x2=Math.max(x2,q.right); y2=Math.max(y2,q.bottom);
        }
        rg.detach?.();
      }
      /* Sin nodos de texto medibles —un <text> de SVG, por ejemplo— se cae a la
         caja del elemento, que es peor pero es lo que hay. */
      if (!hubo) return el.getBoundingClientRect();
      return ceñirATinta(el, { left:x1, top:y1, right:x2, bottom:y2, width:x2-x1, height:y2-y1 });
    };

    /* ── SEXTA CORRECCIÓN: LA CAJA DE LÍNEA TAMPOCO ES LA TINTA ────────
       El `Range` fue un avance —292 solapamientos pasaron a 19— pero no
       alcanzó, y lo confirmé MIRANDO: el detector reportaba "Akashic Crown"
       encima de "Corona Akáshica" al 68%, y en la captura los dos títulos
       están apilados limpios, sin tocarse.

       El motivo: `getClientRects()` devuelve la CAJA DE LÍNEA, no la mancha.
       En una serif de 150px con `line-height:1` sobran ~20px de caja sin una
       gota de tinta debajo de la base, y "Akashic Crown" ni siquiera tiene
       letras con descendente.

       `measureText` sí sabe dónde está la tinta: `actualBoundingBoxAscent` y
       `actualBoundingBoxDescent` se miden sobre las letras REALES de esa
       cadena en esa fuente. Con eso se reconstruye la caja de tinta alrededor
       de la línea de base.

       Tres veces se equivocó este instrumento en la misma dirección: siempre
       reportando de más, siempre sobre la composición del creador. Un detector
       que inventa defectos en la obra es peor que no tener detector, porque
       manda a corregir lo que está bien. */
    const lienzoMedidor = document.createElement('canvas').getContext('2d');
    const ceñirATinta = (el, r) => {
      try {
        const cs = getComputedStyle(el);
        const texto = (el.textContent ?? '').trim();
        if (!texto || !lienzoMedidor) return r;
        lienzoMedidor.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize}/${cs.fontSize} ${cs.fontFamily}`;
        const m = lienzoMedidor.measureText(texto);
        const subeF = m.fontBoundingBoxAscent, bajaF = m.fontBoundingBoxDescent;
        const subeT = m.actualBoundingBoxAscent, bajaT = m.actualBoundingBoxDescent;
        if (![subeF, bajaF, subeT, bajaT].every(Number.isFinite)) return r;
        /* La base cae centrada dentro de la caja de línea. */
        const base = r.top + (r.height - (subeF + bajaF)) / 2 + subeF;
        const top = Math.max(r.top, base - subeT);
        const bottom = Math.min(r.bottom, base + bajaT);
        if (bottom - top <= 0) return r;
        return { left:r.left, top, right:r.right, bottom, width:r.width, height:bottom - top };
      } catch { return r; }
    };

    const rectoVisible = (el) => {
      let r = rectoLetras(el);
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
      /* ── CUARTA CORRECCIÓN AL INSTRUMENTO ─────────────────────────────
         `getComputedStyle(hijo).display` NO hereda el `none` del padre: un
         <span> dentro de un <p hidden> reporta `inline` y el filtro lo dejaba
         pasar. Así conté «DEPTH 0 / 7» y «ROUTE D8A4» como visibles en
         producción cuando su contenedor estaba oculto — y casi reporto una
         regresión que no existía.
         `checkVisibility` es la pregunta correcta: la hace el navegador
         mirando toda la cadena, no una propiedad suelta. */
      if (typeof e.checkVisibility === 'function'
        && !e.checkVisibility({ contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true })) continue;
      const cs = getComputedStyle(e);
      if (cs.display==='none' || cs.visibility==='hidden' || parseFloat(cs.opacity) < 0.12) continue;
      /* y el texto a cuerpo cero no es texto a la vista */
      if (parseFloat(cs.fontSize) < 1) continue;
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
    /* ── PRUEBA DE IMPACTO ───────────────────────────────────────────────
       Segundo fallo del instrumento, también hallado por el agente del Folio I:
       dos rectángulos pueden intersecarse y aun así NO verse encimados, porque
       una tercera capa los tapa a los dos. En su umbral el velo cubre la escena
       entera —ese es su trabajo— y el detector lo contaba como choque: su cifra
       base real era 10, no 231. Casi cambia una portada aprobada por un
       artefacto de medición.

       Intersecar rectángulos dice si COMPARTEN ESPACIO. `elementFromPoint` dice
       si alguno de los dos SE VE ahí. Sólo lo segundo es un solapamiento
       visible, que es lo que el creador pidió que no ocurriera.

       Se muestrean nueve puntos del área común: si en ninguno el impacto cae
       sobre uno de los dos elementos (o un descendiente suyo), los dos están
       tapados por otra cosa y el par no cuenta. */
    const seVe = (a, z, x1, y1, x2, y2) => {
      for (let i = 1; i <= 3; i++) for (let j = 1; j <= 3; j++) {
        const x = x1 + ((x2 - x1) * i) / 4, y = y1 + ((y2 - y1) * j) / 4;
        const hit = document.elementFromPoint(x, y);
        if (!hit) continue;
        if (a.e.contains(hit) || z.e.contains(hit) || hit === a.e || hit === z.e) return true;
      }
      return false;
    };

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
      /* y por último: ¿alguno de los dos se ve realmente ahí? */
      if (!seVe(a, z, Math.max(a.x,z.x), Math.max(a.y,z.y), Math.min(a.r,z.r), Math.min(a.b,z.b))) continue;
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
