import { chromium } from 'playwright';
const B = process.env.KDX_BASE || 'http://127.0.0.1:4342';
const ESPERA = 6500;   // la capa de vida necesita sus ciclos: medir antes es medir una pagina que nadie ve
const RUTAS = ['/kodex/','/kodex/folio/i/','/kodex/folio/ii/','/kodex/folio/iii/','/kodex/folio/iv/',
               '/kodex/folio/v/','/kodex/folio/vi/','/kodex/interlude/archive-machine/','/kodex/interlude/cosmology-return/'];
/* 412x915 entra porque es el tamaño donde el otro Claude midió 12 solapes en
   COSMOLOGY y yo medía 0 en 390: un teléfono más ancho y más alto reacomoda
   los carriles y saca choques que el estrecho esconde. Si no está en el
   barrido, no existe para nosotros. */
const VP = [{n:'390',w:390,h:844,m:true},{n:'412',w:412,h:915,m:true},
            {n:'844L',w:844,h:390,m:true},{n:'1440',w:1440,h:900,m:false}];
const b = await chromium.launch();
const filas = [];
for (const r of RUTAS) {
  for (const v of VP) {
    const c = await b.newContext({viewport:{width:v.w,height:v.h},isMobile:v.m,hasTouch:v.m});
    const p = await c.newPage();
    const errs = [];
    p.on('pageerror', e => errs.push(String(e).split('\n')[0].slice(0,80)));
    await p.goto(B+r, {waitUntil:'load', timeout:60000}).catch(()=>{});
    await p.waitForTimeout(ESPERA);
    const m = await p.evaluate(() => {
      /* Un elemento puede tener rectángulo dentro del viewport y aun así ser
         INVISIBLE: si vive dentro de un contenedor con scroll y está corrido
         fuera de él, el navegador lo recorta pero `getBoundingClientRect`
         sigue devolviendo su posición geométrica.
         Sin esto el detector inventa superposiciones. Pasó con la cartografía
         de COSMOLOGY: sus portales quedaban recortados dentro de una caja de
         302px y el detector los reportaba encima de la navegación porque su
         rectángulo decía y=766. Seis superposiciones que no existían.
         Acá se recorta el rectángulo contra cada ancestro que recorta. */
      /* Un elemento tapado por una capa opaca ARRIBA de él no es visible,
         aunque su rectángulo esté perfecto. El umbral del KODEX lo demuestra:
         su velo -- la portada aprobada, con la puerta de consentimiento de
         sonido -- cubre la escena entera, y la escena sigue debajo con todos
         sus rectángulos intactos. Sin esta prueba el detector reporta que el
         velo "se pisa" con lo que tapa, que es literalmente su trabajo.
         Casi recomiendo cambiar la portada del creador por un artefacto de
         medición. Se comprueba con puntos de impacto: si en ningún punto de su
         área el navegador devuelve al elemento, a un hijo o a un ancestro,
         está tapado. */
      /* Y ACÁ ESTABA EL PUNTO CIEGO, que no encontró ningún número: encontró
         mirar la captura. La boca del descenso aterrizó ENCIMA del título de
         COSMOLOGY, tapándolo entero, y este barrido informó cero
         superposiciones. Porque `tapado` descartaba el título por "no visible"
         en vez de contarlo -- o sea, el peor choque posible, un panel opaco
         sobre la frase más grande de la escena, se filtraba como si fuera un
         acierto.
         La diferencia entre el velo y la boca no es de tipo: es de TAMAÑO. Una
         cortina cubre la escena y esconder lo de atrás es su trabajo. Un panel
         chico que tapa un texto es un defecto. Se separa por área. */
      const CORTINA = 0.72;   // fracción de la ventana a partir de la cual tapar es el trabajo
      const tapado = (el, r, registro) => {
        const px = [0.5, 0.2, 0.8], py = [0.5, 0.25, 0.75];
        let culpable = null;
        for (const fx of px) for (const fy of py) {
          const x = r.left + r.width * fx, y = r.top + r.height * fy;
          if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
          const en = document.elementFromPoint(x, y);
          if (!en) continue;
          if (en === el || el.contains(en) || en.contains(el)) return false;
          if (!culpable) culpable = en;
        }
        if (registro && culpable) {
          const cr = culpable.getBoundingClientRect();
          const cubre = (cr.width * cr.height) / (innerWidth * innerHeight);
          /* Dos filtros más, porque la primera versión trajo ruido: informaba
             "tapado por" elementos que cubrían el 0% de la pantalla. Eso no es
             un tapador, es un VECINO -- la caja del texto es más ancha que sus
             letras y el punto de muestra cae al lado.
             Un tapador de verdad cumple dos cosas: cubre casi todo el
             rectángulo del texto, y es OPACO. Si se ve a través suyo, no tapa. */
          const solape = Math.max(0, Math.min(cr.right,r.right)-Math.max(cr.left,r.left))
                       * Math.max(0, Math.min(cr.bottom,r.bottom)-Math.max(cr.top,r.top));
          const encima = solape / Math.max(1, r.width*r.height);
          const cs2 = getComputedStyle(culpable);
          const fondo = cs2.backgroundColor || '';
          const alfa = (fondo.match(/rgba?\(([^)]+)\)/)||[])[1];
          const opaco = (cs2.backdropFilter && cs2.backdropFilter !== 'none')
                     || (alfa ? (alfa.split(',')[3] === undefined || parseFloat(alfa.split(',')[3]) > 0.5) : false);
          if (cubre < CORTINA && encima >= 0.45 && opaco) {
            const suyo = [...culpable.childNodes].filter(n=>n.nodeType===3)
              .map(n=>n.textContent.trim()).join(' ').trim()
              || (culpable.innerText||'').trim();
            registro.push({ que: (el.innerText||el.textContent||'').trim().replace(/\s+/g,' ').slice(0,26),
                            porQuien: (suyo||culpable.className.toString()||culpable.tagName).slice(0,26),
                            cubre: Math.round(cubre*100) });
          }
        }
        return true;
      };

      const rectoVisible = (el) => {
        let r = el.getBoundingClientRect();
        let t = { x: r.left, y: r.top, r: r.right, b: r.bottom };
        for (let n = el.parentElement; n && n !== document.documentElement; n = n.parentElement) {
          const cs = getComputedStyle(n);
          if (cs.overflow === 'visible' && cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
          const nr = n.getBoundingClientRect();
          t.x = Math.max(t.x, nr.left); t.y = Math.max(t.y, nr.top);
          t.r = Math.min(t.r, nr.right); t.b = Math.min(t.b, nr.bottom);
          if (t.r - t.x <= 0 || t.b - t.y <= 0) return null;
        }
        return { left: t.x, top: t.y, right: t.r, bottom: t.b, width: t.r - t.x, height: t.b - t.y };
      };

      const tapados=[];
      const vis=[];
      for (const e of document.querySelectorAll('body *')) {
        const cs=getComputedStyle(e);
        if (cs.display==='none'||cs.visibility==='hidden'||parseFloat(cs.opacity)<0.12) continue;
        if (e.getAttribute('aria-hidden')==='true') continue;
        /* "Texto propio" dejaba afuera justo al titular. Los títulos cinéticos
           reparten una letra por hijo, así que el <h1> no tiene ni un nodo de
           texto directo y el barrido nunca lo miró -- la frase más grande de
           cada escena era invisible para su propio control de calidad.
           Los titulares y los controles entran por lo que MUESTRAN. */
        const propio=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').trim();
        const titular=/^(H1|H2|A|BUTTON)$/.test(e.tagName) ? (e.innerText||'').trim().replace(/\s+/g,' ') : '';
        const t = propio.length>=2 ? propio : titular;
        if (t.length<2) continue;
        const r=rectoVisible(e);
        if (!r) continue;
        if (r.width<4||r.height<4||r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth) continue;
        if (tapado(e, r, tapados)) continue;
        /* Y AÚN ASÍ SE ESCAPABA EL PEOR CASO. `tapado` devuelve "se ve" apenas
           UNO de sus nueve puntos alcanza al elemento, así que un panel que
           cubre la banda central de un título de dos renglones lo deja pasar:
           las esquinas asoman. Y el cruce por pares tampoco lo agarra, porque
           el panel de la boca no tiene texto PROPIO -- su frase vive en un hijo
           -- y este barrido sólo compara elementos con texto propio.
           Resultado real: la boca del descenso aterrizó sobre "NOTHING HERE
           STANDS ALONE" tapándolo entero y el informe dijo cero.
           Se mide aparte, por el centro, sin salida anticipada. */
        (() => {
          const cx = r.left + r.width/2, cy = r.top + r.height/2;
          if (cx<0||cy<0||cx>innerWidth||cy>innerHeight) return;
          const en = document.elementFromPoint(cx, cy);
          if (!en || en===e || e.contains(en) || en.contains(e)) return;
          const cr = en.getBoundingClientRect();
          if ((cr.width*cr.height)/(innerWidth*innerHeight) >= CORTINA) return;   // es cortina
          const sol = Math.max(0, Math.min(cr.right,r.right)-Math.max(cr.left,r.left))
                    * Math.max(0, Math.min(cr.bottom,r.bottom)-Math.max(cr.top,r.top));
          if (sol / Math.max(1, r.width*r.height) < 0.45) return;
          const cs2 = getComputedStyle(en); const f=cs2.backgroundColor||'';
          const al=(f.match(/rgba?\(([^)]+)\)/)||[])[1];
          const opaco=(cs2.backdropFilter&&cs2.backdropFilter!=='none')
                    ||(al?(al.split(',')[3]===undefined||parseFloat(al.split(',')[3])>0.5):false);
          if(!opaco) return;
          tapados.push({ que:(e.innerText||e.textContent||'').trim().replace(/\s+/g,' ').slice(0,26),
                         porQuien:((en.innerText||'').trim().replace(/\s+/g,' ')||en.className.toString()||en.tagName).slice(0,26),
                         cubre: Math.round(100*(cr.width*cr.height)/(innerWidth*innerHeight)) });
        })();
        vis.push({e,t:t.slice(0,26),x:r.left,y:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height});
      }
      let solapes=0; const ej=[];
      for(let i=0;i<vis.length;i++)for(let j=i+1;j<vis.length;j++){
        const a=vis[i],z=vis[j];
        if(a.e.contains(z.e)||z.e.contains(a.e))continue;
        const ox=Math.min(a.r,z.r)-Math.max(a.x,z.x), oy=Math.min(a.b,z.b)-Math.max(a.y,z.y);
        if(ox<=2||oy<=2)continue;
        const ar=ox*oy, mn=Math.min(a.w*a.h,z.w*z.h);
        if(ar/mn<0.22)continue;
        solapes++; ej.push({d:`"${a.t}"×"${z.t}"`, p:Math.round(100*ar/mn)});
      }
      /* Mostraba los dos PRIMEROS pares encontrados, no los peores. El conteo
         siempre estuvo bien, pero el ejemplo que se lee arriba es el que uno
         va a arreglar -- y era arbitrario. Se ordena por daño. */
      ej.sort((x,y)=>y.p-x.p);

      // controles fijos demasiado chicos
      let chicos=0;
      for (const e of document.querySelectorAll('a[href],button,[role="button"]')) {
        const cs=getComputedStyle(e); const r=rectoVisible(e);
        if(!r||r.width<4||r.height<4||cs.display==='none'||cs.visibility==='hidden')continue;
        if(tapado(e,r))continue;
        if(r.top>innerHeight||r.bottom<0)continue;
        if(r.height<44||r.width<44)chicos++;
      }
      const de=document.documentElement;
      /* un mismo texto puede dar varios puntos; se cuenta una vez */
      const vistosT=new Set(); const tap=tapados.filter(t=>{const k=t.que+'|'+t.porQuien;
        if(vistosT.has(k)||!t.que)return false; vistosT.add(k); return true;});
      return { solapes, ej, chicos, tap,
               desbY: de.scrollHeight-innerHeight, desbX: de.scrollWidth-innerWidth,
               contrato: document.querySelector('[data-kdx-plate-contract]')?1:0,
               texto:(document.body.innerText||'').trim().length };
    });
    filas.push({ruta:r, vp:v.n, ...m, errs:errs.length, err1:errs[0]||''});
    await c.close();
  }
}
await b.close();
console.log('ruta                              vp    contrato solap tapado taps<44 desbY desbX texto err');
for (const f of filas) {
  const alerta = (f.solapes>0||f.tap.length>0||f.desbX>1||f.errs>0||f.texto<50) ? ' <<<' : '';
  console.log(`${f.ruta.padEnd(34)}${f.vp.padEnd(6)}${String(f.contrato).padEnd(9)}${String(f.solapes).padEnd(6)}${String(f.tap.length).padEnd(7)}${String(f.chicos).padEnd(8)}${String(f.desbY).padEnd(6)}${String(f.desbX).padEnd(6)}${String(f.texto).padEnd(6)}${f.errs}${alerta}`);
  if (f.solapes>0) for(const e of f.ej.slice(0,3)) console.log(`        · ${e.d} ${e.p}%`);
  for(const t of f.tap.slice(0,3)) console.log(`        ▪ TAPADO "${t.que}" por "${t.porQuien}" (${t.cubre}% de pantalla)`);
  if (f.err1) console.log('        ! '+f.err1);
}
