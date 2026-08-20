/**
 * Banco de KDX.LIFE. Mide el motor de vida sin abrir un navegador.
 *
 * Lo que tiene que demostrar, y que si no lo demuestra el motor no sirve:
 *   1. determinista — la misma lámina siempre la misma vida
 *   2. distinto por lámina — dos planchas no comparten constelación
 *   3. no se extingue ni se satura en el rango de ciclos que se ve en pantalla
 *   4. emerge una cantidad LEGIBLE de señales, no cien botones
 *   5. tocar muta de verdad: el campo después no es el campo antes
 */
import { build } from 'esbuild';
const r = await build({ entryPoints:['src/lib/kodex/vida/reglas.ts'], bundle:true, format:'esm', write:false, platform:'node' });
const V = await import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'));

const correr = (id, ciclos=40, bloque) => {
  let c = V.sembrar(id, 32, 18, bloque);
  const serie = [];
  let quieto=0;
  for (let k=0;k<ciclos;k++){
    c = V.latir(c);
    // el avivado no se dispara al primer ciclo sin señal: se le da tiempo a la
    // regla a producirlas sola. Sólo tras 6 ciclos callados entra la chispa.
    if (V.apagado(c)) { if(++quieto>=6){ c=V.avivar(c); quieto=0; } } else quieto=0;
    serie.push({vivas:c.celdas.filter(x=>x.viva).length, senales:V.senales(c).length});
  }
  return { c, serie };
};

const LAMS = ['null-knot','void-orchard','silence-engine','heart-chamber','origin-forge','akashic-crown'];

console.log('== por lamina (32x18 = 576 celdas) ==');
for (const l of LAMS){
  const { c, serie } = correr(l);
  const fin = serie[serie.length-1];
  const pico = Math.max(...serie.map(s=>s.senales));
  console.log(`  ${l.padEnd(16)} bloque ${c.bloque.nombre.padEnd(7)} vivas ${String(fin.vivas).padStart(3)} · senales fin ${fin.senales} pico ${pico} · extinto ${V.extinto(c)}`);
}

console.log('\n== determinismo y divergencia ==');
const a1=correr('null-knot').c, a2=correr('null-knot').c, b1=correr('void-orchard').c;
const huella=c=>c.celdas.map(x=>x.viva?1:0).join('');
console.log('  misma lamina dos veces identico:', huella(a1)===huella(a2));
const dif=[...huella(a1)].filter((ch,i)=>ch!==huella(b1)[i]).length;
console.log(`  dos laminas distintas: ${dif}/576 celdas difieren (${(dif/576*100).toFixed(0)}%)`);

console.log('\n== los cinco presets sobre la misma lamina ==');
for (const b of V.BLOQUES){
  const { c, serie } = correr('null-knot', 40, b);
  const prom = (serie.reduce((s,x)=>s+x.senales,0)/serie.length).toFixed(1);
  console.log(`  ${b.nombre.padEnd(7)} nace[${b.nace}] vive[${b.vive}] gesto ${b.gesto.padEnd(10)} vivas ${String(c.celdas.filter(x=>x.viva).length).padStart(3)} · senales prom ${prom} · extinto ${V.extinto(c)}`);
}

console.log('\n== el tacto muta ==');
for (const b of V.BLOQUES){
  let { c } = correr('null-knot', 12, b);
  const s = V.senales(c);
  if (!s.length){ console.log(`  ${b.nombre.padEnd(7)} sin senales que tocar`); continue; }
  const antes = huella(c); const sAntes = V.senales(c).length;
  const d = V.tocar(c, s[0].i);
  const cambio = [...huella(d)].filter((ch,i)=>ch!==antes[i]).length;
  // ACCELERATE no enciende celdas: envejece. Su efecto se ve en las señales,
  // no en el mapa de vivas — por eso se miden las dos cosas.
  const dS = V.senales(d).length - sAntes;
  console.log(`  ${b.nombre.padEnd(7)} gesto ${b.gesto.padEnd(10)} celdas ${String(cambio).padStart(2)} · senales ${dS>=0?'+':''}${dS} · mutacion ${d.celdas[s[0].i].mutacion}`);
}

console.log('\n== densidad de senales: nunca ruido ==');
let maxS=0, ceros=0, total=0;
for (const l of LAMS) for (const b of V.BLOQUES){
  const { c } = correr(l, 30, b);
  const n = V.senales(c).length; maxS=Math.max(maxS,n); if(!n) ceros++; total++;
}
console.log(`  maximo de senales simultaneas: ${maxS} (tope 7) · combinaciones sin ninguna: ${ceros}/${total}`);
