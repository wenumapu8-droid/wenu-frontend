#!/usr/bin/env node
/* Sonda del bloque IZQUIERDA de t01-05. Medias de columna y de fila. */
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
const img = PNG.sync.read(readFileSync("reference/canon/t01-05-specimen-skull.png"));
const { width: W, data } = img;
const lum = (x,y)=>{const i=(y*W+x)*4;return (data[i]*77+data[i+1]*150+data[i+2]*29)>>8;};
const a=(n,d)=>{const i=process.argv.indexOf(n);return i>-1?process.argv[i+1]:d;};
const [x0,x1]=a("--x","4,299").split(",").map(Number);
const [y0,y1]=a("--y","88,866").split(",").map(Number);
const modo=a("--modo","col");
const min=Number(a("--min","6"));
if(modo==="col"){
  for(let x=x0;x<=x1;x++){let s=0;for(let y=y0;y<=y1;y++)s+=lum(x,y);const m=s/(y1-y0+1);
    if(m>=min)console.log(x, m.toFixed(1));}
}else if(modo==="fil"){
  for(let y=y0;y<=y1;y++){let s=0;for(let x=x0;x<=x1;x++)s+=lum(x,y);const m=s/(x1-x0+1);
    if(m>=min)console.log(y, m.toFixed(1));}
}else if(modo==="filall"){
  for(let y=y0;y<=y1;y++){let s=0,n=0;for(let x=x0;x<=x1;x++){const v=lum(x,y);s+=v;if(v>25)n++;}
    console.log(y, (s/(x1-x0+1)).toFixed(1), n);}
}else if(modo==="colall"){
  for(let x=x0;x<=x1;x++){let s=0,n=0;for(let y=y0;y<=y1;y++){const v=lum(x,y);s+=v;if(v>25)n++;}
    console.log(x, (s/(y1-y0+1)).toFixed(1), n);}
}
