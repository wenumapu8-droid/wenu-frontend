#!/usr/bin/env node
/* Detector de marcos y reglas del bloque IZQUIERDA de t01-05.
   Una regla es una columna (o fila) con tinta en casi TODA la banda; el texto
   no lo es. Resuelve el reparto de tinta entre líneas vecinas igual que en
   t01-04: relleno = máximo, cobertura = media/máximo, ancho = suma. */
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
const img = PNG.sync.read(readFileSync("reference/canon/t01-05-specimen-skull.png"));
const { width: W, data } = img;
const lum = (x,y)=>{const i=(y*W+x)*4;return (data[i]*77+data[i+1]*150+data[i+2]*29)>>8;};
const a=(n,d)=>{const i=process.argv.indexOf(n);return i>-1?process.argv[i+1]:d;};
const [x0,x1]=a("--x","4,298").split(",").map(Number);
const [y0,y1]=a("--y","88,865").split(",").map(Number);
const eje=a("--eje","v");           // v = columnas (reglas verticales)
const COB=Number(a("--cob","0.85"));
const PISO=Number(a("--piso","6"));
const DX=4, DY=88;

const perfil=[];
if(eje==="v"){
  for(let x=x0;x<=x1;x++){let s=0,n=0;for(let y=y0;y<=y1;y++){const v=lum(x,y);s+=v;if(v>PISO)n++;}
    perfil.push({p:x,m:s/(y1-y0+1),c:n/(y1-y0+1)});}
}else{
  for(let y=y0;y<=y1;y++){let s=0,n=0;for(let x=x0;x<=x1;x++){const v=lum(x,y);s+=v;if(v>PISO)n++;}
    perfil.push({p:y,m:s/(x1-x0+1),c:n/(x1-x0+1)});}
}
// runs de líneas con cobertura alta
const runs=[]; let r=null;
for(const q of perfil){
  if(q.c>=COB){ r = r ? (r.push(q),r) : [q]; }
  else if(r){ runs.push(r); r=null; }
}
if(r)runs.push(r);
for(const g of runs){
  const max=Math.max(...g.map(q=>q.m));
  const cob=g.map(q=>q.m/max);
  const ancho=cob.reduce((a,b)=>a+b,0);
  // posición: centro de masa desplazado media anchura
  const cm=g.reduce((a,q,i)=>a+(q.p+0.5)*cob[i],0)/cob.reduce((a,b)=>a+b,0);
  const ini=cm-ancho/2;
  const o = eje==="v" ? DX : DY;
  console.log(`[${(ini-o).toFixed(3)}, ${ancho.toFixed(3)}, ${Math.round(max)}]  // ${eje==="v"?"x":"y"}=${g.map(q=>q.p).join("·")}  ${g.map(q=>q.m.toFixed(1)).join("·")}`);
}
