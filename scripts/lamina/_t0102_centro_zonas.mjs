import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
const t = PNG.sync.read(readFileSync("scripts/lamina/out/t01-02-observation-eye/paneles/Centro-triptico.png"));
const { width: W, data } = t;
const lum = (o,x,y)=>{const i=((y*W)+x+o)*4;return (data[i]*77+data[i+1]*150+data[i+2]*29)>>8;};
// diff estructural por bloques 8x8 sobre una caja
function err(x0,y0,x1,y1){
  let sp=0,np=0,se=0,ne=0;
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){ sp+=Math.abs(lum(0,x,y)-lum(720,x,y)); np++; }
  for(let by=y0;by+8<=y1;by+=8)for(let bx=x0;bx+8<=x1;bx+=8){
    let a=0,b=0; for(let y=by;y<by+8;y++)for(let x=bx;x<bx+8;x++){a+=lum(0,x,y);b+=lum(720,x,y);}
    se+=Math.abs(a-b)/64; ne++;
  }
  return [sp/np, se/ne];
}
const zonas = [
  ["p04 anillo r<25",320,225,376,281],
  ["p04 iris",180,85,516,421],
  ["p04 campo",1,6,644,463],
  ["p04 hud izq",1,40,120,460],
  ["p04 hud der",560,40,644,460],
  ["p04 titulo",1,6,644,34],
  ["subject",1,464,644,491],
  ["p07",1,496,361,757],
  ["p08",369,496,712,757],
  ["tira0506",654,6,712,491],
  ["thumb1",662,42,712,110],
  ["thumb2",662,148,712,223],
  ["onda1",661,283,712,324],
  ["onda2",661,326,712,369],
  ["onda3",661,371,712,415],
  ["onda4",661,417,712,479],
  ["05 titulo",654,6,712,40],
];
for(const [n,a,b,c,d] of zonas){const [p,e]=err(a,b,c,d);console.log(n.padEnd(18),"pixel",p.toFixed(2).padStart(6),"estruct",e.toFixed(2).padStart(6));}
