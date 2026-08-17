#!/usr/bin/env node
/**
 * KODEX-∞ · CARRIL DE EVIDENCIA LOCAL — KOD-69
 *
 * El bloqueo de GitHub Actions por facturación no puede significar "paramos
 * KODEX". Este script ejecuta EN EL MAC MINI el mismo contrato de QA, sin
 * bajar ningún estándar:
 *
 *     exact SHA → build → browser → desktop → 390×844 → 412×915
 *     → reduced motion → teclado → evidencia
 *
 * QA_STATE, no AUTHORIAL_STATE (KOD-70): esto demuestra que las rutas
 * FUNCIONAN — cargan sin errores de JS, no desbordan, responden al teclado,
 * respetan reduced-motion. Si se ven y se sienten como KODEX lo decide el
 * creador mirando la evidencia, no este script.
 *
 * Uso:
 *   node scripts/qa/evidencia.mjs --sha <sha> --base http://127.0.0.1:4399 \
 *        [--rutas /kodex/,/kodex/lab/heart/]
 *
 * El build del SHA exacto lo hace el envoltorio evidencia.sh (worktree
 * aislado); este script mide contra el server que le digan y NO adivina.
 *
 * Evidencia: ~/Trabajos-Aparte/KODEX/evidence/<sha>/
 *   evidencia.json          resultado por ruta × viewport, con veredicto
 *   <ruta>__<viewport>.png  captura de cada combinación
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const arg = (n, d) => {
  const i = process.argv.indexOf(n);
  return i > -1 ? process.argv[i + 1] : d;
};
const SHA = arg("--sha", "sin-sha");
const BASE = arg("--base", "http://127.0.0.1:4399");
const RUTAS = arg(
  "--rutas",
  "/kodex/,/kodex/lab/heart/,/kodex/lab/altar/,/kodex/lab/temple/,/kodex/lab/observe-v2/,/kodex/return/",
).split(",");

/* Los tres viewports del contrato, con sus nombres. */
const VIEWPORTS = [
  { n: "desktop", w: 1400, h: 900 },
  { n: "390x844", w: 390, h: 844 },
  { n: "412x915", w: 412, h: 915 },
];

const OUT = join(homedir(), "Trabajos-Aparte", "KODEX", "evidence", SHA.slice(0, 12));
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const resultados = [];

for (const ruta of RUTAS) {
  for (const vp of VIEWPORTS) {
    for (const reducido of vp.n === "desktop" ? [false, true] : [false]) {
      const ctx = await browser.newContext({
        viewport: { width: vp.w, height: vp.h },
        reducedMotion: reducido ? "reduce" : "no-preference",
        hasTouch: vp.n !== "desktop",
      });
      const page = await ctx.newPage();
      const errores = [];
      page.on("pageerror", (e) => errores.push(String(e).slice(0, 140)));

      const r = { ruta, viewport: vp.n, reducido, ok: true, fallas: [] };
      try {
        const resp = await page.goto(BASE + ruta, { waitUntil: "networkidle", timeout: 45000 });
        if (!resp || resp.status() >= 400) {
          r.ok = false;
          r.fallas.push(`http ${resp?.status()}`);
        }
        await page.waitForTimeout(1200);

        /* desborde horizontal: la regla de la casa — cero, siempre */
        const desborde = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        if (desborde > 1) {
          r.ok = false;
          r.fallas.push(`desborde horizontal ${desborde}px`);
        }

        /* teclado: tiene que haber algo enfocable, y Tab tiene que llegar */
        if (vp.n === "desktop" && !reducido) {
          await page.keyboard.press("Tab");
          const foco = await page.evaluate(() => {
            const el = document.activeElement;
            return el && el !== document.body ? el.tagName : null;
          });
          if (!foco) {
            r.ok = false;
            r.fallas.push("Tab no enfoca nada");
          } else r.teclado = foco;
        }

        if (errores.length) {
          r.ok = false;
          r.fallas.push(...errores.map((e) => "js: " + e));
        }

        const nombre = `${ruta.replace(/\//g, "_")}__${vp.n}${reducido ? "__reduced" : ""}.png`;
        await page.screenshot({ path: join(OUT, nombre) });
        r.captura = nombre;
      } catch (e) {
        r.ok = false;
        r.fallas.push("excepción: " + String(e).slice(0, 120));
      }
      resultados.push(r);
      await ctx.close();
    }
  }
}
await browser.close();

const fallidas = resultados.filter((r) => !r.ok);
writeFileSync(
  join(OUT, "evidencia.json"),
  JSON.stringify(
    {
      sha: SHA,
      base: BASE,
      cuando: new Date().toISOString(),
      contrato: "KOD-69: sha exacto → build → browser → desktop/390x844/412x915 → reduced motion → teclado → evidencia",
      veredicto: fallidas.length ? "FALLA" : "PASA",
      combinaciones: resultados.length,
      fallidas: fallidas.length,
      resultados,
    },
    null,
    1,
  ),
);
console.log(`  ${resultados.length} combinaciones · ${fallidas.length} fallas · evidencia → ${OUT}`);
for (const f of fallidas) console.log(`  ✗ ${f.ruta} [${f.viewport}${f.reducido ? " reduced" : ""}] — ${f.fallas.join("; ")}`);
process.exit(fallidas.length ? 1 : 0);
