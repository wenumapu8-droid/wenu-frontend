import sharp from "sharp";
import { readFileSync } from "node:fs";
const img = process.argv[2] || "reference/pendientes/soul-weaver.png";
const modo = process.argv[3] || "filas";
const X0 = +(process.argv[4] ?? 0), Y0 = +(process.argv[5] ?? 0);
const W = +(process.argv[6] ?? 1229), H = +(process.argv[7] ?? 1536);
const { data, info } = await sharp(img).extract({left:X0,top:Y0,width:W,height:H}).raw().toBuffer({resolveWithObject:true});
const ch = info.channels;
const lum = (x,y)=>{const i=(y*W+x)*ch; return 0.299*data[i]+0.587*data[i+1]+0.114*data[i+2];};
if (modo === "filas" || modo === "cols") {
  const n = modo==="filas"?H:W, m = modo==="filas"?W:H;
  for (let a=0;a<n;a++){
    let s=0,c=0,mx=0;
    for(let b=0;b<m;b++){const l=modo==="filas"?lum(b,a):lum(a,b); s+=l; if(l>26)c++; if(l>mx)mx=l;}
    console.log(`${a+ (modo==="filas"?Y0:X0)}\t${(s/m).toFixed(2)}\t${c}\t${mx.toFixed(0)}`);
  }
} else if (modo === "banda") {
  // histograma por bandas horizontales de 64 px: tinta% y color medio
  for (let y=0;y<H;y+=64){
    let r=0,g=0,b=0,c=0,n=0;
    for(let yy=y;yy<Math.min(y+64,H);yy++) for(let x=0;x<W;x++){const i=(yy*W+x)*ch; r+=data[i];g+=data[i+1];b+=data[i+2];n++; if(lum(x,yy)>26)c++;}
    console.log(`y${y+Y0}\tinк=${(c/n*100).toFixed(1)}%\trgb=${(r/n).toFixed(0)},${(g/n).toFixed(0)},${(b/n).toFixed(0)}`);
  }
} else if (modo === "vineta") {
  // luminancia media en anillos desde el centro
  const cx=W/2, cy=H/2, maxr=Math.hypot(cx,cy);
  const bins=new Array(20).fill(0), cnt=new Array(20).fill(0);
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){const d=Math.hypot(x-cx,y-cy)/maxr; const k=Math.min(19,Math.floor(d*20)); bins[k]+=lum(x,y); cnt[k]++;}
  bins.forEach((s,k)=>console.log(`r${(k/20).toFixed(2)}-${((k+1)/20).toFixed(2)}\t${(s/cnt[k]).toFixed(2)}`));
} else if (modo === "caja") {
  // media/tinta de la caja completa
  let s=0,c=0,n=0,r=0,g=0,b=0;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*ch;const l=lum(x,y);s+=l;n++;if(l>26)c++;r+=data[i];g+=data[i+1];b+=data[i+2];}
  console.log(`media=${(s/n).toFixed(2)} tinta=${(c/n*100).toFixed(1)}% rgb=${(r/n).toFixed(0)},${(g/n).toFixed(0)},${(b/n).toFixed(0)}`);
}
