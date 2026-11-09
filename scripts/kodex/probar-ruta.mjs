import { readFileSync } from 'node:fs';
import { build } from 'esbuild';
const r = await build({ entryPoints:['src/lib/kodex/ruta.ts'], bundle:true, format:'esm', write:false, platform:'node' });
const mod = await import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'));
const C = JSON.parse(readFileSync('public/kodex-content/ramas.json','utf8'));
const corpus = { nodos:C.nodos, vecinos:C.vecinos, indice:C.indice };

function descender(escena, semilla, mem){
  let v = { escena, profundidad:0, aqui:null, visitados:[], firma:mod.firmar(semilla), memoria:mem };
  const ruta=[];
  while (v.profundidad < mod.PROFUNDIDAD_CORAZON){
    const p = mod.bifurcar(v, corpus); if(!p.length) break;
    const k = mod.firmar(semilla+v.profundidad) % p.length;
    ruta.push({ id:p[k].nodo.id, papel:p[k].papel, razon:p[k].razon, papeles:p.map(x=>x.papel).join('/'), n:p.length });
    v = { ...v, profundidad:v.profundidad+1, aqui:p[k].nodo.id, visitados:[...v.visitados,p[k].nodo.id] };
  }
  return { ruta, llego:mod.enElCorazon(v) };
}
const cero={archiveDepth:0,routeDiversity:0,returnCount:0}, hondo={archiveDepth:14,routeDiversity:9,returnCount:3};
const A=descender('i','persona-A',cero), B=descender('i','persona-B',cero), C2=descender('i','persona-A',hondo);
console.log('A llega al corazon:',A.llego,'· pasos',A.ruta.length);
console.log('A:',A.ruta.map(r=>`${r.papel[0]}:${r.id}`).join(' > '));
console.log('B:',B.ruta.map(r=>`${r.papel[0]}:${r.id}`).join(' > '));
console.log('puertas por nivel:',A.ruta.map(r=>r.papeles).join('  '));
console.log('solapamiento A/B:',A.ruta.filter((r,i)=>B.ruta[i]?.id===r.id).length+'/7');
console.log('misma persona memoria honda:',A.ruta.filter((r,i)=>C2.ruta[i]?.id===r.id).length+'/7');
console.log('siempre 3 puertas:',[...new Set([...A.ruta,...B.ruta].map(r=>r.n))].join(','));
const alc=new Set(); for(let i=0;i<200;i++) descender('i','p'+i,cero).ruta.forEach(r=>alc.add(r.id));
console.log(`cobertura: ${alc.size} nodos distintos en 200 viajes`);
const P={}; for(let i=0;i<200;i++) descender('i','p'+i,cero).ruta.forEach(r=>P[r.papel]=(P[r.papel]||0)+1);
console.log('papeles elegidos:',JSON.stringify(P));
const D1=descender('iii','x',cero),D2=descender('iii','x',cero);
console.log('determinista:',JSON.stringify(D1.ruta)===JSON.stringify(D2.ruta));
console.log('sin repetir dentro del descenso:',[A,B,C2,D1].every(d=>new Set(d.ruta.map(r=>r.id)).size===d.ruta.length));
