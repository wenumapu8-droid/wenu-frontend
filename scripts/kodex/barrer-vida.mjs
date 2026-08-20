import { build } from 'esbuild';
const r = await build({ entryPoints:['src/lib/kodex/vida/reglas.ts'], bundle:true, format:'esm', write:false, platform:'node' });
const V = await import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'));
import { readdirSync } from 'node:fs';
const LAMS = readdirSync('src/pages/kodex/lamina').filter(f=>f.endsWith('.astro')&&f!=='index.astro').map(f=>f.replace('.astro',''));

// reglas candidatas conocidas por sostener vida, con nombre propio de KODEX
const CAND = [
  ['WEAVE',[3],[2,3]], ['BLOOM',[3,6],[2,3]], ['CORAL',[3],[4,5,6,7,8]],
  ['DRIFT',[3,4],[3,4]], ['EMBER',[3,4,5],[5]], ['MAZE',[3],[1,2,3,4,5]],
  ['LATTICE',[3,6,7,8],[3,4,5,6,7,8]], ['PULSE',[2,3],[2,3]],
  ['STRATA',[3,5,6,7,8],[4,5,6,7,8]], ['VEIN',[3,6],[2,3,4,5]],
];
const DENS = [0.14, 0.22, 0.30, 0.38, 0.46];

const evaluar = (nace, vive, dens) => {
  let sinSenal=0, extintos=0, sumS=0, n=0, saturados=0;
  for (const l of LAMS){
    // sembrar con densidad forzada
    let c = V.sembrar(l, 32, 18, {id:'x',nombre:'x',nace,vive,gesto:'COLOR'});
    const viv = Math.floor(576*dens);
    const vivasIni = c.celdas.filter(x=>x.viva).length;
    // ajustar densidad: encender/apagar deterministicamente hasta llegar
    const PHI=(1+Math.sqrt(5))/2, A=1/(PHI*PHI);
    let h=2166136261; for(const ch of l){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}
    const base=((h>>>0)%0xffff)/0xffff;
    c.celdas.forEach(x=>x.viva=false);
    for(let k=0;k<viv;k++) c.celdas[Math.floor(((base+k*A)%1)*576)%576].viva=true;
    let picoS=0;
    for(let k=0;k<40;k++){ c=V.latir(c); picoS=Math.max(picoS,V.senales(c).length); }
    const vivasFin=c.celdas.filter(x=>x.viva).length;
    if(V.extinto(c)) extintos++;
    if(picoS===0) sinSenal++;
    if(vivasFin>576*0.55) saturados++;
    sumS+=picoS; n++;
  }
  return {sinSenal, extintos, saturados, promPico:(sumS/n).toFixed(1)};
};

console.log('regla      dens  sinSenal extinto saturado picoProm   (sobre '+LAMS.length+' laminas)');
const buenas=[];
for (const [nom,nace,vive] of CAND) for (const d of DENS){
  const r=evaluar(nace,vive,d);
  const ok = r.sinSenal===0 && r.extintos===0 && r.saturados===0;
  if(ok) buenas.push({nom,nace,vive,d,...r});
  if(ok||r.sinSenal<3) console.log(`${nom.padEnd(9)} ${d.toFixed(2)}  ${String(r.sinSenal).padStart(6)} ${String(r.extintos).padStart(7)} ${String(r.saturados).padStart(8)} ${r.promPico.padStart(8)} ${ok?'  <-- sirve':''}`);
}
console.log('\ncombinaciones que sirven en las 39 laminas:', buenas.length);
buenas.forEach(b=>console.log(`  ${b.nom} B${b.nace.join('')}/S${b.vive.join('')} dens ${b.d}`));
