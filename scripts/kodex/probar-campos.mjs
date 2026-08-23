/**
 * KODEX−∞ · ¿ARRANCA EL CAMPO DE CADA ESCENA?
 *
 * QUÉ MIDE. No compila archivos: pregunta por el estado que el propio cliente
 * deja escrito. `kodex-field-client.ts` ya anota `data-kdx-field-state` y
 * `data-kdx-field-error` cuando un preset no arranca, y cae al vórtice. Este
 * script recorre las escenas y reporta:
 *
 *   ok        el preset pedido arrancó
 *   fallback  no arrancó y se cayó al vórtice — la escena se ve, pero NO es la
 *             que se compuso. Cuenta como defecto.
 *   failed    ni el vórtice arrancó: escena sin campo.
 *
 * POR QUÉ NO COMPILA LOS .frag SUELTOS. Lo intenté y el instrumento mintió dos
 * veces seguidas. Primero le antepuse `#version 300 es` a todo, y reporté cinco
 * shaders rotos que no lo estaban — tres eran `#version 330 core` de escritorio
 * y dos GLSL ES 1.00 legítimos. Después, ya corregido, marqué esos tres como
 * «sin portar»: también falso, porque `toWebGL2()` los porta en caliente, les
 * injerta el bloque de grado y le cambia el nombre al `main`. Lo que llega a la
 * GPU no es el archivo. Compilar el archivo mide un archivo.
 *
 * La regla que queda escrita: medir lo que se sirve, con la instrumentación que
 * ya tiene lo que se sirve.
 *
 *   KDX_BASE=http://127.0.0.1:4342 node scripts/kodex/probar-campos.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.KDX_BASE || 'http://127.0.0.1:4342';
const RUTAS = [
  '/kodex/', '/kodex/folio/i/', '/kodex/folio/ii/', '/kodex/folio/iii/',
  '/kodex/folio/iv/', '/kodex/folio/v/', '/kodex/folio/vi/',
  '/kodex/interlude/archive-machine/', '/kodex/interlude/cosmology-return/',
  '/kodex/lamina/', '/kodex/lamina/genesis-cradle/', '/kodex/lab/organism-engine/',
];

const b = await chromium.launch();
const filas = [];
for (const r of RUTAS) {
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await c.newPage();
  await p.goto(BASE + r, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(5500);
  const campos = await p.evaluate(() =>
    [...document.querySelectorAll('[data-kdx-field]')].map((e) => ({
      preset: e.dataset.field ?? '(sin nombre)',
      estado: e.dataset.kdxFieldState ?? '(sin estado)',
      error: e.dataset.kdxFieldError ?? '',
    })));
  filas.push({ r, campos });
  await c.close();
}
await b.close();

let mal = 0;
for (const { r, campos } of filas) {
  if (!campos.length) { console.log(`  ${r.padEnd(38)} sin campos`); continue; }
  for (const c of campos) {
    const roto = c.estado === 'fallback' || c.estado === 'failed';
    if (roto) mal++;
    console.log(`  ${roto ? '✗' : '·'} ${r.padEnd(36)} ${c.estado.padEnd(9)} ${c.preset}${c.error ? `\n      ${c.error}` : ''}`);
  }
}
console.log(mal ? `\n${mal} campo(s) sin arrancar como se compusieron` : `\ntodos los campos arrancan con su propio preset`);
process.exit(mal ? 1 : 0);
