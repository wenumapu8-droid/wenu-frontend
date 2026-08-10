#!/usr/bin/env node
/**
 * Medición por bandas, semiautomática. Es el paso que reemplaza estimar cajas
 * a ojo — que en la lámina 1 costó dos vueltas enteras.
 *
 * No es totalmente automático a propósito: el detector global falla en láminas
 * de marcos tenues y confunde el eje de simetría de un organismo con una regla.
 * Acá se imprime la evidencia y la decisión de qué es panel la toma quien mira.
 */
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const slug = process.argv[2];
const img = PNG.sync.read(readFileSync(join(ROOT, "reference", "canon", `${slug}.png`)));
const { width: W, height: H, data } = img;
const lum = (x, y) => { const i = (y * W + x) * 4; return (data[i]*77 + data[i+1]*150 + data[i+2]*29) >> 8; };

// El umbral sale de la imagen: se busca el pico de los marcos, que viven bajo.
const m = [];
for (let y = 0; y < H; y += 3) for (let x = 0; x < W; x += 3) { const v = lum(x,y); if (v > 3) m.push(v); }
m.sort((a,b)=>a-b);
const INK = Math.max(7, Math.min(14, m[Math.floor(m.length*0.10)] ?? 9));

const tramo = (g,n,tol=6)=>{let b=0,r=0,gp=0;for(let i=0;i<n;i++){if(g(i)){r+=gp+1;gp=0;if(r>b)b=r;}else if(r>0&&gp<tol)gp++;else{r=0;gp=0;}}return b;};
const cl = (l,s=6)=>{const o=[];let a=null,b=null;for(const v of l){if(a===null){a=b=v;continue;}if(v-b<=s){b=v;continue;}o.push(Math.round((a+b)/2));a=b=v;}if(a!==null)o.push(Math.round((a+b)/2));return o;};
const vert=(y0,y1,t)=>{const h=y1-y0,o=[];for(let x=0;x<W;x++){if(tramo(k=>lum(x,y0+k)>INK,h)/h>t)o.push(x);}return cl(o);};
const horz=(x0,x1,t)=>{const w=x1-x0,o=[];for(let y=0;y<H;y++){if(tramo(k=>lum(x0+k,y)>INK,w)/w>t)o.push(y);}return cl(o);};

console.log(`\n  ${slug}  ${W}x${H}  · umbral de tinta ${INK}\n`);
console.log("  columnas (banda central, sin cabecera ni pie):");
const cols = vert(Math.round(H*0.12), Math.round(H*0.90), 0.80);
console.log("    " + cols.join(" "));
const bordes = [0, ...cols, W-1].filter((v,i,a)=>a.indexOf(v)===i).sort((a,b)=>a-b);
for (let i = 0; i < bordes.length-1; i++) {
  const x0=bordes[i], x1=bordes[i+1];
  if (x1-x0 < 120) continue;
  console.log(`  filas en x${x0}-${x1} (ancho ${x1-x0}):`);
  console.log("    " + horz(x0+3, x1-3, 0.86).join(" "));
}
console.log();
