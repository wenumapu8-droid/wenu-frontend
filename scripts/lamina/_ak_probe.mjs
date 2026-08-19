import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
const img = PNG.sync.read(readFileSync(process.argv[2] || "reference/pendientes/akashic-crown.png"));
const { width: W, height: H, data } = img;
const lum = (x, y) => { const i = (y * W + x) * 4; return (data[i]*77 + data[i+1]*150 + data[i+2]*29) >> 8; };
const mode = process.argv[3];
const num = (s)=>s.split(",").map(Number);

if (mode === "rows") { // filas con corrida horizontal larga dentro de x0..x1
  const [x0,x1] = num(process.argv[4]); const [y0,y1] = num(process.argv[5]);
  const umbral = +(process.argv[6]||18); const frac = +(process.argv[7]||0.75);
  for (let y=y0;y<y1;y++){ let n=0; for(let x=x0;x<x1;x++) if(lum(x,y)>umbral) n++;
    const f=n/(x1-x0); if(f>frac) console.log(`y=${y}  ${(f*100).toFixed(0)}%`); }
}
if (mode === "cols") {
  const [x0,x1] = num(process.argv[4]); const [y0,y1] = num(process.argv[5]);
  const umbral = +(process.argv[6]||18); const frac = +(process.argv[7]||0.75);
  for (let x=x0;x<x1;x++){ let n=0; for(let y=y0;y<y1;y++) if(lum(x,y)>umbral) n++;
    const f=n/(y1-y0); if(f>frac) console.log(`x=${x}  ${(f*100).toFixed(0)}%`); }
}
if (mode === "perfil-fila") { // media de luminancia por fila
  const [x0,x1] = num(process.argv[4]); const [y0,y1] = num(process.argv[5]);
  const paso = +(process.argv[6]||1);
  for (let y=y0;y<y1;y+=paso){ let s=0,c=0; for(let x=x0;x<x1;x++){s+=lum(x,y);c++;}
    console.log(`${y}\t${(s/c).toFixed(1)}`); }
}
if (mode === "perfil-col") {
  const [x0,x1] = num(process.argv[4]); const [y0,y1] = num(process.argv[5]);
  const paso = +(process.argv[6]||1);
  for (let x=x0;x<x1;x+=paso){ let s=0,c=0; for(let y=y0;y<y1;y++){s+=lum(x,y);c++;}
    console.log(`${x}\t${(s/c).toFixed(1)}`); }
}
if (mode === "tinta") { // bandas de tinta (texto) en x0..x1, y0..y1
  const [x0,x1] = num(process.argv[4]); const [y0,y1] = num(process.argv[5]);
  const umbral = +(process.argv[6]||70);
  let ini=null;
  for (let y=y0;y<y1;y++){ let n=0; for(let x=x0;x<x1;x++) if(lum(x,y)>umbral) n++;
    if(n>1){ if(ini===null) ini=y; } else { if(ini!==null){ console.log(`banda y${ini}..${y-1}  alto ${y-ini}`); ini=null; } } }
  if(ini!==null) console.log(`banda y${ini}..${y1-1}`);
}
if (mode === "tinta-x") {
  const [x0,x1] = num(process.argv[4]); const [y0,y1] = num(process.argv[5]);
  const umbral = +(process.argv[6]||70); const sep = +(process.argv[7]||1);
  let ini=null, gap=0;
  for (let x=x0;x<x1;x++){ let n=0; for(let y=y0;y<y1;y++) if(lum(x,y)>umbral) n++;
    if(n>0){ if(ini===null) ini=x; gap=0; } else if(ini!==null){ gap++; if(gap>sep){ console.log(`tramo x${ini}..${x-gap}  ancho ${x-gap-ini+1}`); ini=null; gap=0; } } }
  if(ini!==null) console.log(`tramo x${ini}..${x1-1}`);
}
if (mode === "color") { // color medio y pico en caja
  const [x0,x1] = num(process.argv[4]); const [y0,y1] = num(process.argv[5]);
  let r=0,g=0,b=0,c=0, best=-1, bc=[0,0,0];
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*W+x)*4; r+=data[i];g+=data[i+1];b+=data[i+2];c++;
    const l=lum(x,y); if(l>best){best=l;bc=[data[i],data[i+1],data[i+2]];}}
  console.log(`medio rgb(${(r/c).toFixed(0)},${(g/c).toFixed(0)},${(b/c).toFixed(0)})  pico ${best} rgb(${bc.join(",")})`);
}
