/* Cajas reales de los elementos de la lámina servida: dice DÓNDE está
   cada bloque y con QUÉ familia se está pintando de verdad. Sin esto se
   ajusta a ciegas contra un font-family que quizá ni resolvió. */
import { chromium } from "playwright";
const url = process.env.KDX_URL || "http://127.0.0.1:4427/kodex/lamina/gaia-sentinel/";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1229, height: 1536 }, deviceScaleFactor: 1 });
await p.goto(url, { waitUntil: "networkidle" });
const sels = process.argv.slice(2);
const r = await p.evaluate((sels) => {
  const lam = document.querySelector(".lam");
  const base = lam.getBoundingClientRect();
  return sels.map((s) => {
    const e = document.querySelector(s);
    if (!e) return { s, no: true };
    const c = e.getBoundingClientRect();
    const cs = getComputedStyle(e);
    return {
      s,
      x: +(c.left - base.left).toFixed(1), y: +(c.top - base.top).toFixed(1),
      w: +c.width.toFixed(1), h: +c.height.toFixed(1),
      fam: cs.fontFamily.split(",")[0], size: cs.fontSize, peso: cs.fontWeight, ls: cs.letterSpacing,
    };
  });
}, sels);
for (const o of r) console.log(o.no ? `${o.s}  (no existe)` :
  `${o.s.padEnd(30)} x${String(o.x).padStart(7)} y${String(o.y).padStart(7)} w${String(o.w).padStart(7)} h${String(o.h).padStart(6)}  ${o.fam} ${o.size}/${o.peso} ls=${o.ls}`);
await b.close();
