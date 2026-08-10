#!/usr/bin/env node
/* Caja de tinta por FAMILIA DE COLOR dentro de una region. Sirve para separar
   los tramos verde / gris / rojo de un mismo renglon de titulo. */
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const img = PNG.sync.read(readFileSync(join(ROOT, "reference", "canon", "t01-04-archive-tree.png")));
const { width: W, data } = img;
const at = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i+1], data[i+2]]; };
const lum = (r,g,b) => (r*77 + g*150 + b*29) >> 8;

const [x0,x1,y0,y1,T] = process.argv.slice(2,7).map(Number);
const fam = (r,g,b) => {
  if (r > g * 1.6 && r > 30) return "rojo";
  if (g > r * 1.12 && g > b * 1.6) return "verde";
  return "gris";
};
const acc = {};
for (let y=y0;y<=y1;y++) for (let x=x0;x<=x1;x++){
  const [r,g,b]=at(x,y); const v=lum(r,g,b); if (v<=T) continue;
  const f=fam(r,g,b); const a=acc[f] ??= {x0:1e9,x1:-1,y0:1e9,y1:-1,n:0,sr:0,sg:0,sb:0,mv:0,pico:null,cols:new Set()};
  a.n++; a.sr+=r;a.sg+=g;a.sb+=b; a.cols.add(x);
  if(x<a.x0)a.x0=x; if(x>a.x1)a.x1=x; if(y<a.y0)a.y0=y; if(y>a.y1)a.y1=y;
  if(v>a.mv){a.mv=v;a.pico=[r,g,b];}
}
for (const [f,a] of Object.entries(acc)) {
  // huecos entre columnas -> tramos
  const cs=[...a.cols].sort((p,q)=>p-q); const tr=[]; let s=cs[0],p=cs[0];
  for (const c of cs.slice(1)) { if (c-p>4) { tr.push([s,p]); s=c; } p=c; }
  tr.push([s,p]);
  console.log(f.padEnd(6), JSON.stringify({x:[a.x0,a.x1],y:[a.y0,a.y1],n:a.n,
    medio:[Math.round(a.sr/a.n),Math.round(a.sg/a.n),Math.round(a.sb/a.n)],pico:a.pico,lum:a.mv, tramos:tr}));
}
