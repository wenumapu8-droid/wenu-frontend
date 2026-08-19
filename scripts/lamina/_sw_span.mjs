import sharp from "sharp";
const A="scripts/lamina/out/soul-weaver/actual.png", R="reference/pendientes/soul-weaver.png";
const bandas = JSON.parse(process.argv[2]);
const U = +(process.argv[3] || 110);
const cargar=async(f)=>{const{data,info}=await sharp(f).raw().toBuffer({resolveWithObject:true});return{data,W:info.width,ch:info.channels};};
const r=await cargar(R), a=await cargar(A);
const span=(o,x0,y0,w,h)=>{let i0=-1,i1=-1;
 for(let x=x0;x<x0+w;x++){let hay=false;
  for(let y=y0;y<y0+h;y++){const i=(y*o.W+x)*o.ch;if(0.299*o.data[i]+0.587*o.data[i+1]+0.114*o.data[i+2]>U){hay=true;break;}}
  if(hay){if(i0<0)i0=x;i1=x;}}
 return i0<0?"-":`${i0}..${i1} (${i1-i0})`;};
for(const b of bandas){
 console.log(`${b.n.padEnd(22)} REF ${String(span(r,b.x,b.y,b.w,b.h)).padEnd(22)} ACT ${span(a,b.x,b.y,b.w,b.h)}`);
}
