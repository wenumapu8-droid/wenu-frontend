/* Banco de tipos: mide ancho y altura de versal de un texto en varias
   familias, para elegir la que entra en la caja MEDIDA en vez de
   ajustar a ojo. */
import { chromium } from "playwright";
const texto = process.argv[2] || "GAIA SENTINEL";
const familias = process.argv.slice(3);
const b = await chromium.launch();
const p = await b.newPage();
await p.setContent("<div id=c></div>");
const r = await p.evaluate(({ texto, familias }) => {
  const out = [];
  for (const fam of familias) {
    const s = document.createElement("span");
    s.textContent = texto;
    s.style.cssText = `font-family:${fam};font-size:100px;font-weight:400;letter-spacing:0;white-space:nowrap;position:absolute;`;
    document.body.appendChild(s);
    const w = s.getBoundingClientRect().width;
    /* altura de versal por canvas */
    const cv = document.createElement("canvas");
    const g = cv.getContext("2d");
    g.font = `400 100px ${fam}`;
    const m = g.measureText("H");
    out.push({ fam, ancho: +w.toFixed(1), versal: +(m.actualBoundingBoxAscent).toFixed(1) });
    s.remove();
  }
  return out;
}, { texto, familias });
console.log(JSON.stringify(r, null, 1));
await b.close();
