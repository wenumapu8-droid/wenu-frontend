#!/usr/bin/env node
/**
 * KODEX-∞ · GATE DE FIDELIDAD VISUAL · EL GATE QUE MIRA
 * 2026-09-03 · reescrito
 *
 * ────────────────────────────────────────────────────────────────────────
 * POR QUE SE REESCRIBIO
 *
 * La version anterior (2026-08-30, 165 lineas) tenia CERO referencias a una
 * imagen. Medía presencia de strings en el HTML. Su propio comentario lo
 * confesaba: "no se puede medir el layout renderizado desde el HTML" -- y
 * despues aproximaba la proporcion del organismo mirando un padding en el CSS.
 *
 * Consecuencia medida: el 2026-08-31 dio 7/7 con el organismo al 11% del
 * viewport. Y el 2026-09-02 dos sesiones firmaron "10 de 10 collages" que
 * median 0x0 px, porque las dos contaron en el HTML.
 *
 * Un plano que no esta cableado a un gate es una sugerencia.
 * Y un gate que no puede VER no puede exigir un plano visual.
 *
 * Por eso este gate abre un navegador de verdad en 390x844, saca la captura,
 * abre el MOCKUP del umbral, y mide LOS DOS CON LA MISMA FUNCION. Los
 * umbrales no son constantes de gusto: salen de medir el corpus de
 * referencia que Ocin ya entrego.
 *
 * Uso:
 *   node scripts/kodex-visual-fidelity-gate.mjs [dist] [--escena PROLOGUE]
 *
 * Sale 0 si todas las escenas pedidas pasan. Sale 1 si alguna falla, y
 * TAMBIEN si no puede ver -- un gate ciego no aprueba nada.
 */
import { readFileSync, existsSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { createServer } from 'node:http';
import sharp from 'sharp';

const DIST = process.argv[2]?.startsWith('--') ? 'dist' : (process.argv[2] || 'dist');
const soloEscena = (() => {
  const i = process.argv.indexOf('--escena');
  return i > -1 ? process.argv[i + 1]?.toUpperCase() : null;
})();

const VIEWPORT = { width: 390, height: 844 };
const SALIDA = 'reports/fidelidad';

/* ───────────────────────────────────────────────────────────────────────
   EL CORREDOR, Y QUE MOCKUP LE CORRESPONDE A CADA UMBRAL

   `confianza` NO es decoracion. Dice si el mapeo escena→mockup esta
   confirmado por el nombre del archivo o si lo inferi yo. Un mapeo inferido
   compara contra la referencia equivocada, y eso es peor que no comparar:
   da un numero con cara de medicion. Los marcados INFERIDO necesitan que
   Ocin los confirme antes de que su comparacion cuente como autoridad.     */
const ESCENAS = [
  { id: 'THRESHOLD', ruta: 'kodex/index.html',        mockup: '01_homepage_portal.png',    confianza: 'NOMBRE' },
  { id: 'PROLOGUE',  ruta: 'kodex/folio/i/index.html',   mockup: '03_transicion_entrada.png', confianza: 'INFERIDO' },
  { id: 'DESCENT',   ruta: 'kodex/folio/ii/index.html',  mockup: '02_indice_estratos.png',    confianza: 'INFERIDO' },
  { id: 'ARCHIVE',   ruta: 'kodex/folio/iii/index.html', mockup: '04_archivo_capitulo.png',   confianza: 'NOMBRE' },
  { id: 'MACHINE',   ruta: 'kodex/folio/iv/index.html',  mockup: '06_experiencia_loop.png',   confianza: 'INFERIDO' },
  { id: 'COSMOLOGY', ruta: 'kodex/folio/v/index.html',   mockup: '07_lectura_sistema.png',    confianza: 'INFERIDO' },
  { id: 'RETURN',    ruta: 'kodex/folio/vi/index.html',  mockup: '08_siguiente_capitulo.png', confianza: 'INFERIDO' },
];

const DIR_MOCKUP = 'kodex-source/reference-drive';

/* ───────────────────────────────────────────────────────────────────────
   UMBRALES

   `pasaSi` es la condicion de aprobacion. `referencia` es lo que el gate
   MIDE en el corpus de Ocin, para que el numero de al lado no sea una
   opinion sino una cita. Cuando la referencia no se puede medir desde la
   imagen -- el conteo de textos necesita ojos, no pixeles -- queda
   declarado como HUECO en vez de inventado.                               */
const UMBRALES = {
  textosVisibles: {
    pasaSi: (v) => v <= 12,
    dice: '≤ 12',
    referencia: 'HUECO — contado a ojo el 2026-09-03 sobre 4 mockups: 9 el mas '
      + 'limpio (01 portal), 19 el mas cargado (04 archivo, con su indice de 6). '
      + 'Ningun pixel puede contar esto: el umbral 12 es decision, no medicion.',
  },
  obraOcupa: {
    pasaSi: (v) => v >= 0.45,
    dice: '≥ 45 % del viewport',
    referencia: 'DECLARADO por Ocin. No se puede medir sobre el mockup: ver abajo.',
    /* 2026-09-03 · ESTE UMBRAL YA SE MIDIO MAL DOS VECES, EL MISMO DIA.
     * La primera version tomaba la caja DOM del elemento pictorico mas
     * grande y daba 100 % en las 7 escenas: ganaba `canvas.kdx-materia`,
     * el campo atmosferico que ocupa el viewport entero por definicion.
     * Un gate que aprueba gratis es el mismo bug que veniamos a matar.
     *
     * El segundo intento fue medir la obra en PIXELES, por textura, con la
     * misma funcion que mide el mockup -- para que los dos lados fueran
     * comparables. Tambien falla, y se puede mostrar: bajando el umbral de
     * textura hasta que el arte oscuro de Ocin registre (stddev>6), la
     * captura de ARCHIVE da 97 % de "obra" en una pantalla que casi no
     * tiene obra. El detector no distingue arte de un muro de texto chico.
     *
     * Asi que NO HAY UN INSTRUMENTO QUE MIDA LOS DOS LADOS. Se dice, en
     * vez de elegir el numero que quede mejor:
     *   - lo que BLOQUEA es la caja DOM del nodo pictorico, descontando el
     *     campo de fondo. Es exacto y quiere decir algo concreto.
     *   - la textura en pixeles se informa como CONTEXTO en los dos lados,
     *     con su limite escrito al lado.
     *   - la comparacion de verdad la hace el ojo, sobre el PNG lado a lado. */
  },
  fondoOscuro: {
    pasaSi: (v) => v >= 0.85,
    dice: '≥ 85 % de pixeles oscuros',
    referencia: 'MEDIDA sobre el mockup del umbral con la misma funcion',
  },
  desbordeH: {
    pasaSi: (v) => v === 0,
    dice: '= 0 px',
    referencia: 'no aplica a una imagen: solo el runtime desborda',
  },
  toqueMinimo: {
    pasaSi: (v) => v === null || v >= 44,
    dice: '≥ 44 px',
    referencia: 'no aplica a una imagen: solo el runtime tiene blancos de toque',
  },
  textosPisados: {
    pasaSi: (v) => v === 0,
    dice: '= 0 pares',
    referencia: 'no aplica a una imagen',
  },
};

/* ═══════════════════════════════════════════════════════════════════════
   MEDICIONES SOBRE PIXELES
   Las mismas dos funciones corren sobre la captura y sobre el mockup. Si
   midieran distinto, la comparacion no significaria nada.
   ═══════════════════════════════════════════════════════════════════════ */

/** Fraccion de pixeles oscuros. Luminancia Rec.709 sobre sRGB crudo. */
async function fondoOscuro(buffer) {
  const { data, info } = await sharp(buffer)
    .removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let oscuros = 0;
  const total = info.width * info.height;
  for (let i = 0; i < data.length; i += 3) {
    const l = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
    if (l < 0.18) oscuros++;
  }
  return oscuros / total;
}

/**
 * Cuanto del cuadro ocupa la obra.
 *
 * "Obra" = la region con TEXTURA. No sirve buscar pixeles no-negros: el arte
 * de Ocin es linea blanca sobre negro y un texto tambien es blanco sobre
 * negro. Lo que separa arte de tipografia es que el arte llena una region
 * CONTINUA de alta varianza, y el texto deja renglones vacios entremedio.
 *
 * Metodo: bloques de 32 px, se marca el bloque cuyo desvio estandar supera
 * el umbral, y se toma la caja de la componente conexa mas grande.
 *
 * LIMITE CONOCIDO, declarado y no maquillado: sub-lee el arte a sangre muy
 * oscuro. Medido el 2026-09-03 sobre 01_homepage_portal dio 16.6% cuando a
 * ojo el campo llena el tercio superior. Cuando el mockup mide por debajo de
 * la referencia, el gate lo dice en vez de fingir precision.
 */
async function areaDeObra(buffer) {
  const B = 32;
  const { data, info } = await sharp(buffer).greyscale().raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const gw = Math.floor(W / B), gh = Math.floor(H / B);
  if (gw < 2 || gh < 2) return { area: 0, caja: null };

  const marca = new Uint8Array(gw * gh);
  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      let s = 0, s2 = 0;
      for (let y = gy * B; y < gy * B + B; y++) {
        for (let x = gx * B; x < gx * B + B; x++) {
          const v = data[y * W + x]; s += v; s2 += v * v;
        }
      }
      const n = B * B, media = s / n;
      marca[gy * gw + gx] = Math.sqrt(Math.max(0, s2 / n - media * media)) > 18 ? 1 : 0;
    }
  }

  const visto = new Uint8Array(gw * gh);
  let mejor = null;
  for (let i = 0; i < gw * gh; i++) {
    if (!marca[i] || visto[i]) continue;
    const cola = [i]; visto[i] = 1; const celdas = [];
    while (cola.length) {
      const c = cola.pop(); celdas.push(c);
      const cy = Math.floor(c / gw), cx = c % gw;
      for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ny = cy + dy, nx = cx + dx;
        if (ny < 0 || ny >= gh || nx < 0 || nx >= gw) continue;
        const j = ny * gw + nx;
        if (marca[j] && !visto[j]) { visto[j] = 1; cola.push(j); }
      }
    }
    if (!mejor || celdas.length > mejor.length) mejor = celdas;
  }
  if (!mejor) return { area: 0, caja: null };

  let y0 = Infinity, y1 = -1, x0 = Infinity, x1 = -1;
  for (const c of mejor) {
    const cy = Math.floor(c / gw), cx = c % gw;
    if (cy < y0) y0 = cy; if (cy > y1) y1 = cy;
    if (cx < x0) x0 = cx; if (cx > x1) x1 = cx;
  }
  const caja = { x: x0 * B, y: y0 * B, w: (x1 - x0 + 1) * B, h: (y1 - y0 + 1) * B };
  return { area: (caja.w * caja.h) / (W * H), caja };
}

/* ═══════════════════════════════════════════════════════════════════════
   MEDICIONES DENTRO DE LA PAGINA VIVA
   Todo esto corre en el navegador, sobre geometria real. Nada se cuenta
   en el HTML: ese fue exactamente el error del 2026-09-02.
   ═══════════════════════════════════════════════════════════════════════ */
const MEDIR_EN_PAGINA = `(() => {
  const VW = window.innerWidth, VH = window.innerHeight;

  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse') return false;
    if (parseFloat(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width >= 1 && r.height >= 1;
  };
  const enPantalla = (r) => r.bottom > 0 && r.top < VH && r.right > 0 && r.left < VW;

  /* Un "texto" es el elemento MAS PROFUNDO que tiene texto propio. Contar
     contenedores contaria la misma frase cinco veces y daria un numero
     inflado que no se corresponde con lo que el ojo ve.                 */
  const conTextoPropio = [];
  for (const el of document.body.querySelectorAll('*')) {
    if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|TITLE)$/.test(el.tagName)) continue;
    let propio = '';
    for (const n of el.childNodes) if (n.nodeType === 3) propio += n.nodeValue;
    if (!propio.trim()) continue;
    if (el.closest('[aria-hidden="true"]')) continue;
    if (!visible(el)) continue;
    conTextoPropio.push({ el, r: el.getBoundingClientRect() });
  }

  const enViewport = conTextoPropio.filter((t) => enPantalla(t.r));

  /* Solapes: pares de texto visible cuyas cajas se pisan. Se descartan los
     pares donde uno contiene al otro -- eso es anidamiento, no colision. */
  let pisados = 0;
  const muestras = [];
  for (let i = 0; i < enViewport.length; i++) {
    for (let j = i + 1; j < enViewport.length; j++) {
      const a = enViewport[i], b = enViewport[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (w > 2 && h > 2) {
        pisados++;
        if (muestras.length < 5) muestras.push(
          (a.el.className || a.el.tagName) + ' × ' + (b.el.className || b.el.tagName));
      }
    }
  }

  /* La obra: el elemento pictorico visible que mas viewport ocupa,
     DESCONTANDO el campo atmosferico. El canvas kdx-materia cubre el
     viewport entero por diseno: si cuenta, el gate da 100 % en las 7
     escenas y aprueba gratis -- que es el bug que veniamos a matar. */
  let obraMax = 0, obraQue = null, campoDescartado = null;
  const pict = [...document.querySelectorAll('img,canvas,video,svg,picture')];
  for (const el of document.body.querySelectorAll('*')) {
    const bi = getComputedStyle(el).backgroundImage;
    if (bi && bi !== 'none' && !bi.startsWith('linear-gradient') && !bi.startsWith('radial-gradient')) pict.push(el);
  }
  for (const el of pict) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (!enPantalla(r)) continue;
    const w = Math.min(r.right, VW) - Math.max(r.left, 0);
    const h = Math.min(r.bottom, VH) - Math.max(r.top, 0);
    const frac = Math.max(0, w) * Math.max(0, h) / (VW * VH);
    const nombre = el.tagName.toLowerCase() + '.' + (el.className || '').toString().split(' ')[0];
    /* Un elemento que cubre casi todo el viewport es fondo, no obra.
       Y el campo persistente se llama por su nombre: kdx-campo y
       kdx-materia SON el campo atmosferico -- asi los nombra el propio
       componente CampoPersistente. Descartarlos por nombre y no solo por
       tamano evita que un frame donde el campo mide 88 % en vez de 100 %
       lo cuele como si fuera la obra. Medido: pasa entre corrida y corrida. */
    if (frac >= 0.85 || /kdx-campo|kdx-materia|kx-campo|__fondo|--fondo/.test(nombre)) {
      if (!campoDescartado) campoDescartado = nombre + ' (' + (frac * 100).toFixed(0) + '%)';
      continue;
    }
    if (frac > obraMax) { obraMax = frac; obraQue = nombre; }
  }

  /* Blancos de toque en la primera pantalla. */
  let toqueMin = null, toqueQue = null;
  const sel = 'a[href],button,[role="button"],input,select,textarea,[tabindex]:not([tabindex="-1"])';
  for (const el of document.querySelectorAll(sel)) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (!enPantalla(r)) continue;
    const m = Math.min(r.width, r.height);
    if (toqueMin === null || m < toqueMin) { toqueMin = m; toqueQue = (el.className || el.tagName).toString().split(' ')[0]; }
  }

  return {
    textosVisibles: enViewport.length,
    textosPaginaEntera: conTextoPropio.length,
    obraOcupa: obraMax,
    obraQue,
    campoDescartado,
    desbordeH: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    toqueMinimo: toqueMin === null ? null : Math.round(toqueMin * 10) / 10,
    toqueQue,
    textosPisados: pisados,
    muestrasPisadas: muestras,
    ocultosPorAncestro: [...document.querySelectorAll('img')]
      .filter((i) => i.getBoundingClientRect().height === 0).length,
  };
})()`;

/* ═══════════════════════════════════════════════════════════════════════ */

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
      } catch { rp.writeHead(500); rp.end('err'); }
    });
    s.listen(0, '127.0.0.1', () => res({ s, puerto: s.address().port }));
  });
}

async function abrirNavegador() {
  const { chromium } = await import('playwright');
  const intentos = [
    ['headless shell', {}],
    ['chromium',       { channel: 'chromium' }],
    ['Google Chrome',  { channel: 'chrome' }],
  ];
  const fallos = [];
  for (const [nombre, opts] of intentos) {
    try { return { b: await chromium.launch(opts), motor: nombre }; }
    catch (e) { fallos.push(`${nombre}: ${e.message.split('\n')[0]}`); }
  }
  throw new Error('ningun navegador arranco.\n  ' + fallos.join('\n  '));
}

/* ═══════════════════════════════════════════════════════════════════════ */
async function main() {
  const pedidas = soloEscena ? ESCENAS.filter((e) => e.id === soloEscena) : ESCENAS;
  if (!pedidas.length) {
    console.error(`escena '${soloEscena}' no esta en el corredor. Hay: ${ESCENAS.map((e) => e.id).join(', ')}`);
    process.exit(1);
  }
  mkdirSync(SALIDA, { recursive: true });

  let nav;
  try { nav = await abrirNavegador(); }
  catch (e) {
    console.error('\n❌ EL GATE NO PUEDE VER — y un gate ciego no aprueba nada.\n');
    console.error('   ' + e.message);
    console.error('\n   Instalar con:  npx playwright install chromium\n');
    process.exit(1);
  }

  const { s, puerto } = await servir(DIST);
  const ctx = await nav.b.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const pag = await ctx.newPage();

  const filas = [];
  for (const esc of pedidas) {
    if (!existsSync(join(DIST, esc.ruta))) {
      filas.push({ esc, ausente: true }); continue;
    }
    const url = `http://127.0.0.1:${puerto}/${esc.ruta.replace(/index\.html$/, '')}`;
    await pag.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
    await pag.evaluate(() => document.fonts?.ready).catch(() => {});
    await pag.waitForTimeout(900);

    /* TRES TOMAS, NO UNA.
       2026-09-03 · medido: tres corridas del mismo codigo sobre THRESHOLD
       dieron 64 / 63 / 7 textos visibles y la obra al 2.5 % / 88.4 % / 88.4 %,
       porque la pantalla sigue animandose cuando se la mide. Un numero que
       no se repite no puede bloquear un build. Se toma la MEDIANA para
       juzgar, y la dispersion se informa: una pantalla que no se deja medir
       dos veces igual tampoco se puede firmar. */
    const tomas = [];
    for (let i = 0; i < 3; i++) {
      if (i) await pag.waitForTimeout(700);
      tomas.push(await pag.evaluate(MEDIR_EN_PAGINA));
    }
    const mediana = (xs) => { const v = xs.filter((x) => x !== null).sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : null; };
    const m = { ...tomas[1] };
    const disp = {};
    for (const k of ['textosVisibles', 'textosPaginaEntera', 'obraOcupa', 'desbordeH', 'toqueMinimo', 'textosPisados']) {
      const vals = tomas.map((t) => t[k]);
      m[k] = mediana(vals);
      /* La prueba correcta no es cuanto varia el numero, sino si las tres
         tomas COINCIDEN EN EL VEREDICTO. Medido el 2026-09-03: THRESHOLD dio
         toque minimo 44 px (pasa) en una corrida y 41.4 px (falla) en otra.
         Una dispersion del 6 % que da vuelta un veredicto importa mas que
         una del 40 % que no lo mueve. */
      const u = UMBRALES[k];
      if (u) {
        const veredictos = new Set(vals.map((v) => u.pasaSi(v)));
        if (veredictos.size > 1) {
          const num = vals.filter((v) => typeof v === 'number');
          disp[k] = `${Math.min(...num)} … ${Math.max(...num)} — las tomas no coinciden en si pasa`;
        }
      }
    }
    m.inestable = Object.keys(disp).length ? disp : null;
    const captura = await pag.screenshot({ type: 'png' });
    writeFileSync(join(SALIDA, `${esc.id}-captura.png`), captura);

    m.fondoOscuro = await fondoOscuro(captura);
    const obraPix = await areaDeObra(captura);
    /* El DOM dice que nodo manda; los pixeles dicen cuanto se VE.
       El segundo es el que juzga -- ver el comentario en UMBRALES. */
    m.texturaPantalla = obraPix.area;
    m.texturaCaja = obraPix.caja;

    /* El mockup, medido con LAS MISMAS funciones. */
    let ref = null;
    const rutaMock = join(DIR_MOCKUP, esc.mockup);
    if (existsSync(rutaMock)) {
      const buf = readFileSync(rutaMock);
      ref = { fondoOscuro: await fondoOscuro(buf), obra: (await areaDeObra(buf)).area };
      /* Captura y mockup lado a lado, a la misma altura: para mirar, no para
         firmar. El gate mide; el ojo decide si se parece.                  */
      const H = 1200;
      const a = await sharp(captura).resize({ height: H }).toBuffer();
      const b = await sharp(buf).resize({ height: H }).toBuffer();
      const ma = await sharp(a).metadata(), mb = await sharp(b).metadata();
      await sharp({ create: { width: ma.width + mb.width + 24, height: H, channels: 3, background: '#202024' } })
        .composite([{ input: a, left: 0, top: 0 }, { input: b, left: ma.width + 24, top: 0 }])
        .png().toFile(join(SALIDA, `${esc.id}-comparacion.png`));
    }

    const juicio = {};
    for (const [k, u] of Object.entries(UMBRALES)) juicio[k] = u.pasaSi(m[k]);
    const estable = !m.inestable;
    filas.push({ esc, m, ref, obraPix, juicio, pasa: estable && Object.values(juicio).every(Boolean) });
  }

  await ctx.close(); await nav.b.close(); s.close();

  /* ── informe ─────────────────────────────────────────────────────── */
  const pct = (v) => (v * 100).toFixed(1) + ' %';
  console.log('\nGATE DE FIDELIDAD VISUAL · KODEX−∞');
  console.log(`navegador ${nav.motor} · viewport ${VIEWPORT.width}×${VIEWPORT.height} · base ${DIST}\n`);

  for (const f of filas) {
    if (f.ausente) { console.log(`❌ AUSENTE  ${f.esc.id}  — no existe ${f.esc.ruta}\n`); continue; }
    const { m, ref, juicio } = f;
    console.log(`${f.pasa ? '✅ PASA   ' : '❌ FALLA  '} ${f.esc.id}`);
    console.log(`            mockup: ${f.esc.mockup}  [mapeo ${f.esc.confianza}]`);
    const linea = (ok, nom, val, umb, refv) =>
      console.log(`   ${ok ? '·' : '✗'} ${nom.padEnd(16)} ${String(val).padStart(9)}   pasa si ${umb.padEnd(22)} ${refv}`);
    linea(juicio.textosVisibles, 'textos visibles', m.textosVisibles, UMBRALES.textosVisibles.dice,
      `(pagina entera: ${m.textosPaginaEntera})`);
    linea(juicio.obraOcupa, 'la obra ocupa', pct(m.obraOcupa), UMBRALES.obraOcupa.dice,
      m.obraQue ? `es ${m.obraQue}` : 'no hay nodo pictorico en pantalla');
    if (m.campoDescartado) console.log(`     (descartado ${m.campoDescartado}: cubre el viewport entero, es campo de fondo)`);
    console.log(`     textura en pantalla: ${pct(m.texturaPantalla)}${ref ? `  ·  mockup: ${pct(ref.obra)}` : ''}   ← CONTEXTO, no criterio`);
    linea(juicio.fondoOscuro, 'fondo oscuro', pct(m.fondoOscuro), UMBRALES.fondoOscuro.dice,
      ref ? `mockup: ${pct(ref.fondoOscuro)}` : 'sin mockup');
    linea(juicio.desbordeH, 'desborde H', m.desbordeH + ' px', UMBRALES.desbordeH.dice, '');
    linea(juicio.toqueMinimo, 'toque minimo', m.toqueMinimo === null ? 'sin toques' : m.toqueMinimo + ' px',
      UMBRALES.toqueMinimo.dice, m.toqueQue ? `el mas chico: .${m.toqueQue}` : '');
    linea(juicio.textosPisados, 'textos pisados', m.textosPisados, UMBRALES.textosPisados.dice,
      m.muestrasPisadas?.[0] || '');
    if (m.obraQue) console.log(`     obra dominante: ${m.obraQue}`);
    if (m.ocultosPorAncestro) console.log(`     ⚠ ${m.ocultosPorAncestro} <img> con altura 0 — ancestro oculto`);
    if (m.inestable) {
      console.log('   ✗ INESTABLE       la pantalla no da el mismo numero en 3 tomas:');
      for (const [k, r] of Object.entries(m.inestable)) console.log(`                     ${k}: ${r}`);
      console.log('                     sigue animandose al medirla. No se puede firmar lo que no se repite.');
    }
    console.log('');
  }

  writeFileSync(join(SALIDA, 'medicion.json'), JSON.stringify(
    { fecha: new Date().toISOString(), navegador: nav.motor, viewport: VIEWPORT, dist: DIST,
      filas: filas.map((f) => ({ escena: f.esc.id, mockup: f.esc.mockup, confianza: f.esc.confianza,
        ausente: !!f.ausente, medido: f.m, referencia: f.ref, pasa: f.pasa })) }, null, 2));

  const pasan = filas.filter((f) => f.pasa).length;
  console.log(`${pasan}/${filas.length} pasan`);
  console.log(`capturas y comparaciones lado a lado en ${SALIDA}/\n`);
  console.log('SOBRE EL CONTEO DE TEXTOS: ningun pixel sabe contar frases. El');
  console.log('umbral 12 es una decision tomada mirando los mockups a ojo el');
  console.log('2026-09-03 (9 el mas limpio, 19 el mas cargado). Esta declarado');
  console.log('como HUECO, no como medicion, y por eso se puede discutir.\n');
  console.log('ESTE GATE NO DICE SI ALGO ES LINDO. Dice si la pantalla esta en');
  console.log('el rango de sus referencias. Antes de firmar hay que abrir');
  console.log(`${SALIDA}/<escena>-comparacion.png y mirar los dos lados.\n`);

  process.exit(filas.every((f) => f.pasa) ? 0 : 1);
}

main().catch((e) => { console.error('\n❌ el gate se rompio:', e); process.exit(1); });
