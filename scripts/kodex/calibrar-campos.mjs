/**
 * KODEX−∞ · CALIBRAR LA GANANCIA DE CADA PRESET DE CAMPO
 *
 * DE DÓNDE SALE ESTA TAREA. La escribió otro agente en `[folio].astro`, al
 * explicar por qué DESCENT, MACHINE y COSMOLOGY corren las tres el mismo
 * vórtice en vez de sus presets propios:
 *
 *   «Compilan -- la sonda lo confirma, no hay error -- pero salen tan oscuros
 *    que las dos láminas quedaban con el fondo PLANO. (…) Los presets del lab
 *    quedan registrados y necesitan CALIBRACIÓN DE GANANCIA POR SHADER --
 *    trabajo real, no un parámetro al azar.»
 *
 * Eso es esto. Cada preset del lab se monta a varias ganancias y se MIDE cuánto
 * del cuadro queda oscuro. La receta maestra pide ~85% de fondo oscuro: por
 * debajo el campo se come la lámina, muy por encima el fondo queda plano y la
 * escena se ve «así de sobria» —que es como quedaron dos escenas durante meses—.
 *
 * SE MIDE SOBRE CAPTURA, NO CON readPixels. Con `preserveDrawingBuffer:false`
 * el buffer ya está compuesto cuando uno lo lee y devuelve negro: hoy me dio
 * max 0 en una máquina que en la captura se veía dorada y encendida. La captura
 * es lo que el visitante ve.
 *
 *   KDX_BASE=http://127.0.0.1:4342 node scripts/kodex/calibrar-campos.mjs
 */
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const BASE = process.env.KDX_BASE || 'http://127.0.0.1:4342';
/* La ruta tiene que TENER campo montado: se reescriben sus atributos antes de
   que arranque el cliente, y así se prueba el runtime real y no una maqueta. */
const RUTA = '/kodex/folio/ii/';
const PRESETS = [
  'network-vortex', 'split-corridor', 'archive-orbit', 'wrinkled-reality',
  'ripple-floor', 'threshold-portal', 'liquid-acid', 'signal-bloom',
  'mandelbrot-field', 'impossible-structure',
];
const GANANCIAS = [0.25, 0.4, 0.55, 0.7, 0.9, 1.2];
const OSCURO = 46;      // luminancia por debajo de la cual el píxel es "fondo"
const OBJETIVO = 0.85;  // la receta maestra

const b = await chromium.launch();
const filas = [];
for (const preset of PRESETS) {
  const medidas = [];
  for (const g of GANANCIAS) {
    const c = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    /* Antes de que el cliente arranque: el observer pisa los atributos en
       cuanto el nodo existe, y `boot()` corre recién en DOMContentLoaded. */
    await c.addInitScript(({ preset, g }) => {
      const pintar = (e) => { e.dataset.field = preset; e.dataset.intensity = String(g); };
      new MutationObserver(() => document.querySelectorAll('[data-kdx-field]').forEach(pintar))
        .observe(document.documentElement, { childList: true, subtree: true });
    }, { preset, g });
    const p = await c.newPage();
    await p.goto(BASE + RUTA, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
    await p.waitForTimeout(5000);
    const cv = await p.$('[data-kdx-field] canvas');
    let oscuro = null, estado = 'sin canvas';
    if (cv) {
      estado = await p.evaluate(() => document.querySelector('[data-kdx-field]')?.dataset.kdxFieldState ?? '?');
      const png = PNG.sync.read(await cv.screenshot({ type: 'png' }));
      let n = 0, bajo = 0;
      for (let i = 0; i < png.data.length; i += 4 * 37) {
        const l = png.data[i] * 0.299 + png.data[i + 1] * 0.587 + png.data[i + 2] * 0.114;
        if (l < OSCURO) bajo++;
        n++;
      }
      oscuro = bajo / n;
    }
    medidas.push({ g, oscuro, estado });
    await c.close();
  }
  /* La ganancia elegida es la que menos se aleja del objetivo. */
  const buenas = medidas.filter((m) => m.oscuro !== null);
  const mejor = buenas.sort((a, z) => Math.abs(a.oscuro - OBJETIVO) - Math.abs(z.oscuro - OBJETIVO))[0];
  filas.push({ preset, mejor, medidas });
  console.log(`  ${preset.padEnd(21)} ${medidas.map((m) => `${m.g}:${m.oscuro === null ? '—' : (m.oscuro * 100).toFixed(0) + '%'}`).join('  ')}`);
  console.log(`  ${' '.repeat(21)} → ganancia ${mejor ? mejor.g : '—'} (${mejor ? (mejor.oscuro * 100).toFixed(1) : '—'}% oscuro)  estado ${mejor?.estado ?? '—'}`);
}
await b.close();

console.log('\n── ganancia por preset, para llevar al mapa de escenas ──');
for (const f of filas) {
  const lejos = f.mejor && Math.abs(f.mejor.oscuro - OBJETIVO) > 0.08;
  console.log(`  ${f.preset.padEnd(21)} ${f.mejor ? f.mejor.g : '—'}${lejos ? '   ← no llega al objetivo a ninguna ganancia' : ''}`);
}
