/**
 * u02-threshold · PIE · barrido de semilla para las dos ondas.
 *
 * Replica la matemática de `kit/rng.ts` + `kit/Waveform.astro` (variante peine)
 * para buscar semilla, densidad y envolvente SIN rebuildar el sitio: 20.000
 * semillas × 4 densidades × 3 envolventes en unos segundos, contra los ~15 s
 * que cuesta cada `npm run build`.
 *
 * El objetivo son los perfiles medidos sobre el PNG en las ventanas que NO
 * quedan tapadas por el rótulo del panel (x 230..412 a la izquierda, 708..880 a
 * la derecha): semi-amplitud media por cubo de 25 px, más la altura del pico.
 *
 *   node scripts/lamina/_u02_pie_semillas.mjs
 *
 * Ganadores en uso (ver Pie.astro):
 *   izquierda  semilla 0x45b8  n=150  envolvente 0,94
 *   derecha    semilla 0x1ff0  n=190  envolvente 0,94
 *
 * Si se toca `Waveform`, esto queda desactualizado y hay que volver a correrlo:
 * es una COPIA de su matemática, no una importación.
 */
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6d2b79f5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function serieSuave(seed,n,inercia=0.75,min=0,max=1){const r=rng(seed);const o=[];let v=0.5;
  for(let i=0;i<n;i++){v=v*inercia+r()*(1-inercia);o.push(min+v*(max-min));}return o;}

function agujas(semilla,n,inercia,envolvente,h,margen=1){
  const alto=h-margen*2;
  const base=serieSuave(semilla,n,inercia,0.06,1);
  const crudo=envolvente>0?serieSuave(semilla^0x2f6d,n,0.955,0,1):null;
  let env=null;
  if(crudo){const lo=Math.min(...crudo),hi=Math.max(...crudo),d=hi-lo||1;
    env=crudo.map(v=>Math.pow((v-lo)/d,1.7));}
  const vals=env?base.map((v,i)=>v*(1-envolvente+envolvente*env[i])):base;
  const r=rng(semilla^0x9e37);
  return vals.map(v=>{const a=(v*alto)/2;const off=(r()-0.5)*alto*0.18*(env?0.2+0.8*v:1);return {a,off};});
}

/* Perfil: media de semi-amplitud por cubo de 25 px, en la ventana sin rótulo. */
function perfil(ag,x0,w,winA,winB){
  const paso=w/(ag.length-1);
  const nb=Math.floor((winB-winA)/25);
  const out=[];
  for(let k=0;k<nb;k++){
    const a0=winA+k*25-x0, a1=winA+(k+1)*25-x0;
    let s=0,c=0;
    for(let i=0;i<ag.length;i++){const px=i*paso; if(px>=a0&&px<a1){s+=ag[i].a+Math.abs(ag[i].off)*0.5;c++;}}
    out.push(c?s/c:0);
  }
  return out;
}
const pico=ag=>Math.max(...ag.map(g=>g.a+Math.abs(g.off)));

const OBJ_IZQ=[1.75,3.15,3.60,1.25,2.70,1.45,2.30];
const OBJ_DER=[1.65,2.25,1.25,3.40,1.80,1.25];
const PICO_IZQ=16.5, PICO_DER=14.5;

function buscar(obj,picoObj,x0,w,winA,winB,label){
  let mejores=[];
  for(let s=1;s<=20000;s++){
    for(const n of [150,170,190,210]){
      for(const e of [0.9,0.94,0.97]){
        const ag=agujas(s,n,0.18,e,38);
        const p=perfil(ag,x0,w,winA,winB);
        let err=0;for(let i=0;i<obj.length;i++)err+=Math.abs(p[i]-obj[i]);
        err/=obj.length;
        err+=Math.abs(pico(ag)-picoObj)*0.12;
        mejores.push([err,s,n,e]);
      }
    }
    if(mejores.length>4000){mejores.sort((a,b)=>a[0]-b[0]);mejores=mejores.slice(0,5);}
  }
  mejores.sort((a,b)=>a[0]-b[0]);
  console.log(label, mejores.slice(0,5).map(m=>`err=${m[0].toFixed(3)} semilla=0x${m[1].toString(16)} n=${m[2]} env=${m[3]}`).join('\n  '+' '.repeat(4)));
  const b=mejores[0];const ag=agujas(b[1],b[2],0.18,b[3],38);
  console.log('   perfil', perfil(ag,x0,w,winA,winB).map(v=>v.toFixed(1)).join(' '), ' objetivo', obj.join(' '), ' pico', pico(ag).toFixed(1));
  return b;
}
buscar(OBJ_IZQ,PICO_IZQ,112,300,230,412,'IZQ:');
buscar(OBJ_DER,PICO_DER,708,300,708,880,'DER:');
