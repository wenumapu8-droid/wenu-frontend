#!/usr/bin/env node
/* Sonda propia del bloque Centro de t01-04. No pisa salidas de otros agentes. */
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const img = PNG.sync.read(readFileSync(join(ROOT, "reference", "canon", "t01-04-archive-tree.png")));
const { width: W, height: H, data } = img;
const lum = (x, y) => { const i = (y * W + x) * 4; return (data[i]*77 + data[i+1]*150 + data[i+2]*29) >> 8; };
const px = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i+1], data[i+2]]; };

const cmd = process.argv[2];
const N = (i, d) => process.argv[i] !== undefined ? Number(process.argv[i]) : d;

if (cmd === "cols") { // perfil de columnas: media de luminancia en franja y0..y1
  const [x0,x1,y0,y1,t] = [N(3),N(4),N(5),N(6),N(7,0)];
  for (let x = x0; x <= x1; x++) {
    let s = 0, mx = 0, cnt = 0;
    for (let y = y0; y <= y1; y++) { const v = lum(x,y); s += v; if (v > mx) mx = v; if (v > 20) cnt++; }
    const avg = s/(y1-y0+1);
    if (avg >= t) console.log(x, avg.toFixed(1), "max", mx, "n>20", cnt);
  }
}
if (cmd === "rows") {
  const [x0,x1,y0,y1,t] = [N(3),N(4),N(5),N(6),N(7,0)];
  for (let y = y0; y <= y1; y++) {
    let s = 0, mx = 0, cnt = 0;
    for (let x = x0; x <= x1; x++) { const v = lum(x,y); s += v; if (v > mx) mx = v; if (v > 20) cnt++; }
    const avg = s/(x1-x0+1);
    if (avg >= t) console.log(y, avg.toFixed(1), "max", mx, "n>20", cnt);
  }
}
if (cmd === "px") { // pixel dump de una fila o columna
  const [x0,x1,y0,y1] = [N(3),N(4),N(5),N(6)];
  for (let y = y0; y <= y1; y++) {
    const row = [];
    for (let x = x0; x <= x1; x++) { const [r,g,b] = px(x,y); row.push(`${x}:${r},${g},${b}`); }
    console.log("y"+y, row.join(" "));
  }
}
if (cmd === "box") { // caja de tinta dentro de una region
  const [x0,x1,y0,y1,t] = [N(3),N(4),N(5),N(6),N(7,30)];
  let ax=1e9,ay=1e9,bx=-1,by=-1,n=0,sr=0,sg=0,sb=0,mx=0,mr=0,mg=0,mb=0;
  for (let y=y0;y<=y1;y++) for (let x=x0;x<=x1;x++){ const v=lum(x,y); if(v>t){ n++; if(x<ax)ax=x; if(x>bx)bx=x; if(y<ay)ay=y; if(y>by)by=y; const[r,g,b]=px(x,y); sr+=r;sg+=g;sb+=b; if(v>mx){mx=v;mr=r;mg=g;mb=b;} } }
  console.log(JSON.stringify({ x0:ax,x1:bx,y0:ay,y1:by,w:bx-ax+1,h:by-ay+1,n,
    medio:[Math.round(sr/n),Math.round(sg/n),Math.round(sb/n)], pico:[mr,mg,mb], lumPico:mx }));
}
if (cmd === "dens") { // densidad media de la region (para calibrar tinta global)
  const [x0,x1,y0,y1] = [N(3),N(4),N(5),N(6)];
  let s=0,n=0,h={};
  for (let y=y0;y<=y1;y++) for (let x=x0;x<=x1;x++){ const v=lum(x,y); s+=v;n++; const b=Math.min(15,v>>4); h[b]=(h[b]||0)+1; }
  console.log("media", (s/n).toFixed(2), "hist", JSON.stringify(h));
}
if (cmd === "grid") { // mapa ASCII de la region, submuestreado
  const [x0,x1,y0,y1,step,t] = [N(3),N(4),N(5),N(6),N(7,4),N(8,25)];
  for (let y=y0;y<=y1;y+=step) {
    let s = "";
    for (let x=x0;x<=x1;x+=step) { let mx=0; for(let j=0;j<step;j++) for(let i=0;i<step;i++){const v=lum(Math.min(x+i,W-1),Math.min(y+j,H-1)); if(v>mx)mx=v;}
      s += mx>t*3 ? "#" : mx>t*2 ? "+" : mx>t ? "." : " "; }
    console.log(String(y).padStart(4), s);
  }
}
