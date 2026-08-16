import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
const t = PNG.sync.read(readFileSync("scripts/lamina/out/t01-02-observation-eye/paneles/Centro-triptico.png"));
const { width: W, data } = t;
const lum = (o, x, y) => { const i = (y * W + x + o) * 4; return (data[i]*77 + data[i+1]*150 + data[i+2]*29) >> 8; };
const CX = 348, CY = 253;
function perf(o) {
  const acc = new Float64Array(361), cnt = new Float64Array(361);
  for (let y = 6; y < 463; y++) for (let x = 1; x < 644; x++) {
    const dx = x - CX, dy = y - CY, r = Math.round(Math.hypot(dx, dy));
    if (r > 360 || r < 1) continue;
    if (Math.abs(dy) / r < 0.24) continue;
    acc[r] += lum(o, x, y); cnt[r]++;
  }
  return Array.from({length:361},(_,r)=>cnt[r]?acc[r]/cnt[r]:0);
}
const a = perf(0), b = perf(720);
const bandas = [[1,23],[24,44],[45,67],[68,77],[78,100],[101,135],[136,170],[171,210],[211,245],[246,300],[301,360]];
for (const [r0,r1] of bandas) {
  let sa=0,sb=0,n=0; for(let r=r0;r<=r1;r++){sa+=a[r];sb+=b[r];n++;}
  console.log(`r ${String(r0).padStart(3)}-${String(r1).padStart(3)}  ref ${(sa/n).toFixed(1).padStart(6)}   act ${(sb/n).toFixed(1).padStart(6)}   x${(sb/sa).toFixed(2)}`);
}
// franja horizontal
function banda(o,y0,y1){let s=0,n=0;for(let y=y0;y<y1;y++)for(let x=1;x<644;x++){s+=lum(o,x,y);n++;}return s/n;}
console.log("streak y225-281  ref",banda(0,225,281).toFixed(1)," act",banda(720,225,281).toFixed(1));
console.log("panel04 total    ref",banda(0,6,463).toFixed(1)," act",banda(720,6,463).toFixed(1));
function caja(n,x0,y0,x1,y1){let sa=0,sb=0,c=0;for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){sa+=lum(0,x,y);sb+=lum(720,x,y);c++;}
 console.log(n.padEnd(14),"ref",(sa/c).toFixed(1).padStart(6),"act",(sb/c).toFixed(1).padStart(6));}
caja("subject",1,464,644,490);
caja("p07",1,497,360,756);
caja("p08",370,497,712,756);
caja("tira0506",654,6,712,490);
caja("esq sup izq",5,35,120,120);
caja("esq inf izq",5,380,120,460);
caja("subj txt",1,464,170,490);
caja("subj barra",170,464,340,490);
caja("subj medio",340,464,440,490);
caja("subj obslog",440,464,600,490);
caja("subj sello",600,464,644,490);
caja("p07 tabla",1,520,360,700);
caja("p07 onda",1,700,360,756);
caja("p04 sup",1,6,644,60);
caja("p04 med",1,180,644,330);
