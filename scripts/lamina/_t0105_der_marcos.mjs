/* Detección de marcos del bloque Derecha de t01-05. Uso:
   node scripts/lamina/_t0105_der_marcos.mjs x0 y0 x1 y1 [cov] [umbral] */
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
const png = PNG.sync.read(readFileSync("reference/canon/t01-05-specimen-skull.png"));
const { width: W, data } = png;
const px = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i+1], data[i+2]]; };
const L = (x, y) => { const [r,g,b] = px(x,y); return (r*77+g*150+b*29)>>8; };
const [X0,Y0,X1,Y1] = process.argv.slice(2,6).map(Number);
const COV = Number(process.argv[6] ?? 0.7), U = Number(process.argv[7] ?? 7);
const seg = [];
for (let y=Y0;y<=Y1;y++){let c=0;for(let x=X0;x<=X1;x++) if(L(x,y)>U)c++;
  const f=c/(X1-X0+1); if(f>=COV){let r=0,g=0,b=0,n=0;for(let x=X0;x<=X1;x++){const p=px(x,y);if(L(x,y)>U){r+=p[0];g+=p[1];b+=p[2];n++;}}
  seg.push(['H',y,f.toFixed(2),`#${[r/n,g/n,b/n].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')}`]);}}
for (let x=X0;x<=X1;x++){let c=0;for(let y=Y0;y<=Y1;y++) if(L(x,y)>U)c++;
  const f=c/(Y1-Y0+1); if(f>=COV){let r=0,g=0,b=0,n=0;for(let y=Y0;y<=Y1;y++){const p=px(x,y);if(L(x,y)>U){r+=p[0];g+=p[1];b+=p[2];n++;}}
  seg.push(['V',x,f.toFixed(2),`#${[r/n,g/n,b/n].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')}`]);}}
for(const s of seg) console.log(s.join(' '));
