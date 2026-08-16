import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
const ref = PNG.sync.read(readFileSync(new URL("../../reference/canon/u03-return.png", import.meta.url)));
const act = PNG.sync.read(readFileSync(new URL("./out/u03-return/actual.png", import.meta.url)));
const lum = (img, x, y) => { const i = (y * img.width + x) * 4; return (img.data[i]*77+img.data[i+1]*150+img.data[i+2]*29)>>8; };
const perfil = (img) => {
  const out = [];
  for (let r = 0; r < 280; r += 10) {
    let s = 0, n = 0;
    for (let a = 0; a < 360; a += 2) {
      const x = Math.round(561 + r * Math.cos(a*Math.PI/180));
      const y = Math.round(645 + r * Math.sin(a*Math.PI/180));
      s += lum(img, x, y); n++;
    }
    out.push(s / n);
  }
  return out;
};
const pr = perfil(ref), pa = perfil(act);
for (let i = 0; i < pr.length; i++)
  console.log(String(i*10).padStart(3), "ref", pr[i].toFixed(0), "act", pa[i].toFixed(0), "d", (pa[i]-pr[i]).toFixed(0));
