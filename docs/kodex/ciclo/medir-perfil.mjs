import { chromium } from '/Users/galvazincia/kodex-converge/node_modules/playwright/index.mjs';
import { PNG } from '/Users/galvazincia/kodex-converge/node_modules/pngjs/lib/png.js';
import { readFileSync } from 'node:fs';
/* MÉTRICA DEFINITIVA — en RADIOS DEL PÓSTER, el sistema en que la lámina
   declara su propio perfil. Estable: no depende del brillo, así que un cambio
   de tinta no mueve el marco de medición. Las zonas son las del perfil medido
   en t01-02/Centro.astro. */
const ZONAS=[['pupila',9,23],['collar',24,44],['valle',45,67],['limbo',68,77],
             ['filamento',78,135],['datos',136,245],['coronas',246,340]];
const anillo=(lee,r)=>{const m=[];
  for(let a=0;a<360;a+=1) m.push(lee(r,a));
  const mu=m.reduce((x,y)=>x+y,0)/m.length;
  const sd=Math.sqrt(m.reduce((x,y)=>x+(y-mu)**2,0)/m.length);
  return{lum:mu, va:sd/(mu||0.001)};};
const zona=(lee,z0,z1)=>{let L=0,V=0,n=0;
  for(let r=z0;r<=z1;r+=2){const x=anillo(lee,r); L+=x.lum; V+=x.va; n++;}
  return{lum:L/n, va:V/n};};

const g=PNG.sync.read(readFileSync('/tmp/kdxVID/REF-observation-eye.png'));
const leeRef=(r,a)=>{const x=Math.round(816+Math.cos(a*Math.PI/180)*r), y=Math.round(341+Math.sin(a*Math.PI/180)*r);
  if(x<0||y<0||x>=g.width||y>=g.height) return 0;
  const i=(g.width*y+x)<<2; return 0.2126*g.data[i]+0.7152*g.data[i+1]+0.0722*g.data[i+2];};

const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1672,height:941},deviceScaleFactor:1});
const p=await c.newPage();
await p.goto('http://localhost:4500/kodex/folio/i',{waitUntil:'load'}); await p.waitForTimeout(3200);
const bx=await p.locator('[data-kdx-observacion]').boundingBox();
await p.mouse.move(bx.x+bx.width/2,bx.y+bx.height/2); await p.mouse.down(); await p.waitForTimeout(800);
await p.mouse.move(bx.x+bx.width/2+30,bx.y+bx.height/2+15,{steps:8}); await p.waitForTimeout(700);
const run=await p.evaluate((Z)=>{
  const cv=document.querySelector('[data-kdx-organismo-ojo]'), g2=cv.getContext('2d');
  const W=cv.width,H=cv.height, d=g2.getImageData(0,0,W,H).data;
  const cx=W/2, cy=H/2, k=Math.min(W,H)/2/360;   // misma escala que usa el dibujo
  const lee=(r,a)=>{const x=Math.round(cx+Math.cos(a*Math.PI/180)*r*k), y=Math.round(cy+Math.sin(a*Math.PI/180)*r*k);
    if(x<0||y<0||x>=W||y>=H) return 0;
    const i=(W*y+x)<<2; return (d[i+3]/255)*(0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2]);};
  const out={};
  for(const [n,z0,z1] of Z){let L=0,V=0,c2=0;
    for(let r=z0;r<=z1;r+=2){const m=[];
      for(let a=0;a<360;a+=1) m.push(lee(r,a));
      const mu=m.reduce((x,y)=>x+y,0)/m.length;
      const sd=Math.sqrt(m.reduce((x,y)=>x+(y-mu)**2,0)/m.length);
      L+=mu; V+=sd/(mu||0.001); c2++;}
    out[n]={lum:L/c2, va:V/c2};}
  return out;},ZONAS);
await p.mouse.up(); await b.close();

console.log('zona del perfil     lámina           runtime          razón');
for(const [n,z0,z1] of ZONAS){
  const R=zona(leeRef,z0,z1), T=run[n];
  const razon=T.lum/(R.lum||0.001);
  const marca = razon>0.6 && razon<1.7 ? 'ok' : (razon<0.6?'FALTA':'SOBRA');
  console.log(`${(n+' r'+z0+'-'+z1).padEnd(20)}${R.lum.toFixed(1).padStart(6)} ${R.va.toFixed(2).padStart(5)}   ${T.lum.toFixed(1).padStart(6)} ${T.va.toFixed(2).padStart(5)}   x${razon.toFixed(2).padStart(5)} ${marca}`);
}
