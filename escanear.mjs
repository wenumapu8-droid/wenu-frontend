import sharp from 'sharp';
import fs from 'node:fs';
const R2='https://pub-2b4562c758ed440ab047fe9523a2d99c.r2.dev/kodex-content/';
const m=JSON.parse(fs.readFileSync('./public/kodex-content/manifest.json','utf8'));
const vols=m.volumes.filter(v=>v.assets&&v.assets.length);
console.log('a revisar:', vols.length);

async function metricas(url){
  const r=await fetch(url); if(!r.ok) return {http:r.status};
  const buf=Buffer.from(await r.arrayBuffer());
  const W=160,H=352;
  const {data}=await sharp(buf).resize(W,H,{fit:'fill'}).greyscale().raw().toBuffer({resolveWithObject:true});
  const filas=[];
  for(let y=0;y<H;y++){ let s=0,s2=0; for(let x=0;x<W;x++){const v=data[y*W+x]; s+=v; s2+=v*v;}
    const mm=s/W; filas.push({m:mm, sd:Math.sqrt(Math.max(0,s2/W-mm*mm))}); }
  let saltos=0; for(let y=1;y<H;y++) if(Math.abs(filas[y].m-filas[y-1].m)>22) saltos++;
  const planas=filas.filter(f=>f.sd<8).length/H;
  let claros=0; for(let i=0;i<data.length;i++) if(data[i]>205) claros++;
  return { saltos, planas:+planas.toFixed(3), brillo:+(claros/data.length).toFixed(3) };
}

const res=[]; let hechos=0, fallos=0;
const N=14;
const cola=[...vols];
await Promise.all(Array.from({length:N},async()=>{
  while(cola.length){
    const v=cola.pop();
    const a=(v.assets[0]||'').replace(/cover\.webp$/,'cover-400.webp');
    try{
      const mm=await metricas(R2+a);
      if(mm.http) { fallos++; }
      else res.push({id:v.id, titulo:v.titulo_es||v.titulo_en||'', asset:a, ...mm});
    }catch(e){ fallos++; }
    if(++hechos%200===0) console.log('   '+hechos+'/'+vols.length);
  }
}));
res.sort((a,b)=>b.saltos-a.saltos);
fs.writeFileSync('escaneo-capturas.json', JSON.stringify(res,null,1));
const cap=res.filter(r=>r.saltos>=4);
const borde=res.filter(r=>r.saltos===2||r.saltos===3);
console.log('\nrevisadas:',res.length,'| fallos de descarga:',fallos);
console.log('CAPTURAS detectadas (≥4 cortes):', cap.length);
console.log('en el borde (2-3 cortes):', borde.length);
console.log('limpias (0-1):', res.filter(r=>r.saltos<=1).length);
console.log('\ntop 15:');
for(const c of cap.slice(0,15)) console.log(`   cortes=${String(c.saltos).padStart(3)}  ${c.id}`);
