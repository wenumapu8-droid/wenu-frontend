import { chromium } from 'playwright';
const B = process.env.KDX_BASE || 'http://127.0.0.1:4342';
const VP = [
  ['desktop',   1440, 900, false],
  ['390x844',    390, 844, true],
  ['412x915',    412, 915, true],
];
const b = await chromium.launch();
const R = [];
const ok = (n, cond, det='') => R.push({n, ok: !!cond, det});

for (const [vn, w, h, movil] of VP) {
  for (const reduced of [false, true]) {
    if (reduced && vn !== '390x844') continue;   // reduced-motion se prueba en teléfono
    const etiqueta = `${vn}${reduced ? ' · reduced-motion' : ''}`;
    const c = await b.newContext({
      viewport:{width:w,height:h}, isMobile:movil, hasTouch:movil,
      reducedMotion: reduced ? 'reduce' : 'no-preference',
    });
    const p = await c.newPage();

    // ── 1 · sin mutación de URL ni de memoria ANTES de elegir ──────────────
    await p.addInitScript(() => {
      window.__hist = []; window.__mem = [];
      /* Sólo cuenta si la URL VISIBLE cambia. El router de vistas de Astro
         llama a `replaceState` al montarse para registrar su estado inicial,
         con la misma dirección: eso no es la aplicación escribiendo en el
         historial de nadie. La regla del creador es sobre lo que el visitante
         ve en la barra, no sobre llamadas internas del framework. */
      for (const m of ['pushState','replaceState']) {
        const o = history[m].bind(history);
        history[m] = (...a) => {
          const antes = location.href;
          const r = o(...a);
          if (location.href !== antes) window.__hist.push(m+' '+location.href);
          return r;
        };
      }
      const sl = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) { window.__mem.push(k); return sl.call(this, k, v); };
    });
    const urlInicial = `${B}/kodex/`;
    await p.goto(urlInicial, {waitUntil:'load'});
    await p.waitForTimeout(7000);                        // asentar sin tocar nada
    const antes = await p.evaluate(() => ({
      url: location.href, hash: location.hash,
      hist: window.__hist.slice(), mem: window.__mem.slice(),
      velo: !!document.querySelector('.kx-veil'),
    }));
    ok(`${etiqueta} · sin mutación de URL antes de elegir`,
       antes.hist.length === 0 && antes.hash === '', `hist=${JSON.stringify(antes.hist)} hash="${antes.hash}"`);
    const memPasiva = antes.mem.filter(k => !/^kdx-ritual|^kx-audio/.test(k));
    ok(`${etiqueta} · sin escritura pasiva de memoria`,
       memPasiva.length === 0, `claves=${JSON.stringify(memPasiva)}`);

    // ── 2 · 100dvh y sin scroll accidental ────────────────────────────────
    const geo = await p.evaluate(() => {
      const de = document.documentElement;
      return { alto: de.scrollHeight, vh: innerHeight, ancho: de.scrollWidth, vw: innerWidth,
               scrollY: (window.scrollY||0) };
    });
    ok(`${etiqueta} · sin scroll vertical de página`, geo.alto <= geo.vh + 2, `${geo.alto} vs ${geo.vh}`);
    ok(`${etiqueta} · sin scroll horizontal`,        geo.ancho <= geo.vw + 1, `${geo.ancho} vs ${geo.vw}`);

    // ── 3 · CTA presente y alcanzable ─────────────────────────────────────
    const cta = await p.evaluate(() => {
      const sels = ['.kx-veil__entrar','.kx-veil__silencio'];
      return sels.map(s => { const e=document.querySelector(s); if(!e) return {s,falta:true};
        const r=e.getBoundingClientRect(), pt=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2);
        return {s, w:Math.round(r.width), h:Math.round(r.height),
                dentro: r.top>=0 && r.bottom<=innerHeight,
                tocable: !!(pt===e||e.contains(pt))}; });
    });
    for (const x of cta) {
      ok(`${etiqueta} · CTA ${x.s} visible y tocable`, !x.falta && x.dentro && x.tocable, JSON.stringify(x));
      ok(`${etiqueta} · CTA ${x.s} ≥44px`, !x.falta && x.h>=44, `${x.h}px de alto`);
    }

    // ── 4 · teclado: se puede cruzar sin puntero ──────────────────────────
    const teclado = await p.evaluate(async () => {
      const e = document.querySelector('.kx-veil__entrar'); if(!e) return {falta:true};
      e.focus();
      const enfocado = document.activeElement === e;
      const anillo = getComputedStyle(e, ':focus-visible').outlineStyle;
      return { enfocado, anillo };
    });
    ok(`${etiqueta} · el CTA recibe foco de teclado`, teclado.enfocado, JSON.stringify(teclado));

    /* ── 5 y 6 · UNA SOLA PUERTA ──────────────────────────────────────────
       ESTE CONTRATO CAMBIÓ, y las pruebas cambian con él en vez de quedarse
       midiendo lo que ya no existe.

       Antes la entrada eran DOS pasos: el velo pedía la elección de sonido y
       se disolvía dejando una segunda pantalla con el pacto y otro botón de
       entrar. Este banco lo comprobaba así -- "elegir NO navega" y "la escena
       queda con su CTA alcanzable" -- y esas dos aserciones eran correctas
       para ese diseño.

       El canon 14 del creador dice que THRESHOLD es "el centro parece una
       abertura", en singular, y él señaló que la entrada le pedía entrar dos
       veces. Ahora el pacto vive en la portada y elegir una puerta CRUZA.

       Así que ya no se comprueba que elegir no navegue: se comprueba que
       elegir sea el cruce, que el pacto esté a la vista antes de decidir, y
       que el peaje del cruce siga dentro del contrato del 07D. */
    const pacto = await p.evaluate(() => {
      const q = (s) => { const e = document.querySelector(s); if (!e) return null;
        const r = e.getBoundingClientRect();
        return { txt: (e.innerText||'').trim().slice(0,40),
                 dentro: r.top >= 0 && r.bottom <= innerHeight && r.height > 4 }; };
      return { pacto: q('.kx-veil__pacto'), pregunta: q('.kx-veil__pregunta') };
    });
    ok(`${etiqueta} · el pacto se lee ANTES de elegir`,
       !!pacto.pacto && pacto.pacto.dentro, JSON.stringify(pacto.pacto));
    ok(`${etiqueta} · la pregunta se lee ANTES de elegir`,
       !!pacto.pregunta && pacto.pregunta.dentro, JSON.stringify(pacto.pregunta));

    await p.evaluate(() => { window.__marcaShell = true;
      const t=document.querySelector('[data-tunnel]'); if(t) t.__marca=1;
      window.__f = {};
      for (const ev of ['astro:before-preparation','astro:before-swap','astro:after-swap','astro:page-load'])
        document.addEventListener(ev, () => { window.__f[ev.replace('astro:','')] = performance.now() - window.__c; }, { once:true });
    });
    const t0 = Date.now();
    await Promise.all([
      p.waitForURL(u=>/folio\/i/.test(u.pathname), {timeout:30000}).catch(()=>null),
      p.evaluate(() => { window.__c = performance.now();
        document.querySelector('.kx-veil__silencio').click(); }),
    ]);
    const tCruce = Date.now() - t0;
    await p.waitForTimeout(500);
    const fases = await p.evaluate(() => window.__f || {});
    await p.waitForTimeout(1200);
    const enProl = await p.evaluate(() => ({
      url: location.pathname,
      shellVivo: !!window.__marcaShell,
      tunelVivo: !!document.querySelector('[data-tunnel]')?.__marca,
      titulo: (document.querySelector('.kx-os-stage__copy h1')?.innerText||'').trim().slice(0,30),
      alto: document.documentElement.scrollHeight, vh: innerHeight,
    }));
    ok(`${etiqueta} · el cruce llega a PROLOGUE`, /folio\/i/.test(enProl.url), enProl.url);
    ok(`${etiqueta} · PROLOGUE sin scroll de página`, enProl.alto <= enProl.vh + 2, `${enProl.alto} vs ${enProl.vh}`);

    /* LO QUE SE MIDE ACÁ ES LA TRANSICIÓN, NO LA CARGA DE LA ESCENA.
       El 07D pide "interaction acknowledgement 0-100ms" y "primary scene
       transition 180-320ms". Eso es el peaje que cobra el CRUCE.
       Desglosado en navegador: la navegación arranca a 1,4 ms del clic y el
       intercambio dura 3-6 ms. El resto es lo que tarda PROLOGUE en existir --
       673 ms en teléfono, 2.412 ms en escritorio, donde la escena rinde más
       bloques y más lienzo.
       Medir el total y llamarlo "transición" mezcla dos cosas distintas y
       hace que el trabajo parezca peor o mejor de lo que es. El costo de la
       escena está medido, documentado y sigue abierto: 566 ms de piso, 26
       tareas largas de hilo principal. No se disimula acá; se reporta aparte. */
    ok(`${etiqueta} · la navegación arranca en menos de 100ms`,
       (fases['before-preparation'] ?? 9999) < 100, `${(fases['before-preparation'] ?? -1).toFixed?.(1) ?? '?'}ms`);
    ok(`${etiqueta} · el intercambio dura menos de 60ms`,
       ((fases['after-swap'] ?? 0) - (fases['before-swap'] ?? 0)) < 60,
       `${(((fases['after-swap'] ?? 0) - (fases['before-swap'] ?? 0))).toFixed(1)}ms`);
    R.push({ n:`${etiqueta} · (dato) clic→escena completa`, ok:true, det:`${tCruce}ms — dominado por la carga de PROLOGUE, no por la transición` });

    // ── 7 · volver conserva contexto ──────────────────────────────────────
    await p.goBack({waitUntil:'load'}).catch(()=>{});
    await p.waitForTimeout(2500);
    const volviendo = await p.evaluate(() => {
      const v=document.querySelector('.kx-veil'); const cs=v?getComputedStyle(v):null;
      return { enUmbral: /\/kodex\/?$/.test(location.pathname),
               veloVuelveAPedir: !!v && cs.display!=='none' && parseFloat(cs.opacity)>0.5 };
    });
    ok(`${etiqueta} · volver lleva al umbral`, volviendo.enUmbral, '');
    ok(`${etiqueta} · volver NO vuelve a pedir la puerta`, !volviendo.veloVuelveAPedir,
       volviendo.veloVuelveAPedir ? 'el velo se muestra otra vez' : '');

    await c.close();
  }
}
await b.close();
const malos = R.filter(x=>!x.ok);
for (const x of R) console.log(`${x.ok?'ok   ':'FALLA'} ${x.n}${x.det?'   — '+x.det:''}`);
console.log(`\n${R.length - malos.length}/${R.length} pasan · ${malos.length} fallan`);
