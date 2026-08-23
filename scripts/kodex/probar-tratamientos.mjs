/**
 * KODEX−∞ · ¿LE TOCA A ALGÚN VISITANTE UNA MÁQUINA ROTA?
 *
 * POR QUÉ EXISTE. `src/kodex/treatments/chain.ts` son 380 líneas con los ocho
 * tratamientos del pliego maestro, y estuvo huérfano: ningún módulo lo
 * importaba. Al enchufarlo a MACHINE apareció el motivo — `glitch-break.frag`
 * declaraba `float active`, y `active` es palabra RESERVADA en GLSL ES 3.00.
 * El shader NUNCA compiló. No falló en producción porque nunca corrió, y no se
 * arregló porque nunca corrió.
 *
 * Un shader sin compilar no es código muerto: es una trampa esperando al
 * visitante cuya ruta arme justo esa cadena. Medido antes del arreglo: caía
 * uno de cada seis recorridos probados.
 *
 * CÓMO PRUEBA. No compila los `.frag` sueltos: eso probaría archivos. Abre la
 * escena MACHINE tal como se sirve, con N recorridos sintéticos distintos en
 * `localStorage`, y mira la línea de salida. `STATUS UNTREATED` significa que a
 * ese visitante la máquina no le funcionó.
 *
 *   KDX_BASE=http://127.0.0.1:4342 node scripts/kodex/probar-tratamientos.mjs
 *
 * Sale distinto de cero si algún recorrido queda sin tratar. Es la compuerta
 * que faltaba: con 24 recorridos se recorren de sobra las 8 combinaciones que
 * el ángulo áureo puede repartir.
 */
import { chromium } from 'playwright';

const BASE = process.env.KDX_BASE || 'http://127.0.0.1:4342';
const ESCENAS = ['threshold', 'prologue', 'descent', 'archive', 'machine', 'cosmology', 'return', 'heart'];

/* 24 recorridos deterministas y distintos entre sí. Sin `Math.random`: una
   compuerta que falla distinto en cada corrida no es una compuerta. */
const RECORRIDOS = Array.from({ length: 24 }, (_, i) => {
  const largo = 1 + (i % 6);
  return Array.from({ length: largo }, (_, k) => ESCENAS[(i * 3 + k * 5) % ESCENAS.length]);
});

const b = await chromium.launch();
const filas = [];
for (const views of RECORRIDOS) {
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await c.addInitScript((v) => {
    try {
      localStorage.setItem('kx-journey', JSON.stringify({
        views: v, effects: [], signal: 0, cycle: 0,
        eventos: v.map((id) => ({ type: 'view', id })),
      }));
    } catch { /* modo privado: la prueba sigue, el sitio también */ }
  }, views);
  const p = await c.newPage();
  await p.goto(`${BASE}/kodex/folio/iv/`, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(7500);
  const btn = await p.$('[data-kdx-drawer-open="machine"]');
  if (btn) { await btn.click({ force: true }).catch(() => {}); await p.waitForTimeout(3500); }
  filas.push(await p.evaluate(() => {
    const caja = document.querySelector('[data-machine-output]');
    const t = caja?.querySelector('.kx-machine-output__linea')?.textContent ?? '';
    return {
      metodo: (t.match(/METHOD (.+?) · STATUS/) ?? [])[1] ?? '—',
      estado: (t.match(/STATUS (\S+)/) ?? [])[1] ?? 'SIN LÍNEA',
      falla: caja?.dataset?.kdxMaquinaFalla ?? '',
    };
  }));
  await c.close();
}
await b.close();

const rotos = filas.filter((f) => f.estado !== 'RUNNING' && f.estado !== 'HELD');
const cadenas = new Set(filas.map((f) => f.metodo));
for (const [i, f] of filas.entries()) {
  const mal = rotos.includes(f);
  if (mal) console.log(`  ROTO   [${RECORRIDOS[i].join('>')}] ${f.estado}\n      ${f.falla || '(sin motivo)'}`);
}
console.log(`\n${filas.length} recorridos · ${cadenas.size} cadenas distintas · ${rotos.length} rotos`);
process.exit(rotos.length ? 1 : 0);
