#!/usr/bin/env node
/* Extremos de una regla: hasta dónde llega su tinta. */
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
const img = PNG.sync.read(readFileSync("reference/canon/t01-05-specimen-skull.png"));
const { width: W, data } = img;
const lum=(x,y)=>{const i=(y*W+x)*4;return (data[i]*77+data[i+1]*150+data[i+2]*29)>>8;};
const a=(n,d)=>{const i=process.argv.indexOf(n);return i>-1?process.argv[i+1]:d;};
const eje=a("--eje","h"), piso=Number(a("--piso","5"));
const lineas=a("--l","").split(",").map(Number);
const [q0,q1]=a("--r","4,298").split(",").map(Number);
for(const L of lineas){
  let ini=-1, fin=-1, hueco=0;
  const v=[];
  for(let q=q0;q<=q1;q++){ const val = eje==="h"?lum(q,L):lum(L,q); v.push(val); }
  for(let i=0;i<v.length;i++) if(v[i]>piso){ if(ini<0)ini=q0+i; fin=q0+i; }
  // huecos internos > 4
  let runs=[],r=null;
  for(let i=0;i<v.length;i++){ if(v[i]>piso){ r=r?[r[0],q0+i]:[q0+i,q0+i]; } else if(r && q0+i-r[1]>4){ runs.push(r); r=null; } }
  if(r)runs.push(r);
  console.log(eje==="h"?"y="+L:"x="+L, "→", ini+".."+fin, " tramos:", runs.map(t=>t.join("-")).join(" "));
}
