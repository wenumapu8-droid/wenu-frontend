import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
const p = PNG.sync.read(readFileSync("scripts/lamina/out/t01-05-specimen-skull/paneles/Derecha-triptico.png"));
const {width:W,height:H,data}=p;
const w=727,h=778,OA=735;
const L=(x,y)=>{const i=(y*W+x)*4;return (data[i]*77+data[i+1]*150+data[i+2]*29)>>8;};
const S=Number(process.argv[2]||32);
const cells=[];
for(let by=0;by<h;by+=S)for(let bx=0;bx<w;bx+=S){
  let e=0,n=0;
  for(let y=by;y<Math.min(h,by+S);y++)for(let x=bx;x<Math.min(w,bx+S);x++){
    e+=Math.abs(L(x,y)-L(OA+x,y));n++;}
  cells.push([e/n,bx+941,by+88]);
}
cells.sort((a,b)=>b[0]-a[0]);
console.log(cells.slice(0,28).map(c=>`${c[0].toFixed(1)}@${c[1]},${c[2]}`).join("  "));
let tot=0,cnt=0;
for(let y=0;y<h;y++)for(let x=0;x<w;x++){tot+=Math.abs(L(x,y)-L(OA+x,y));cnt++;}
console.log("MAE global",(tot/cnt).toFixed(2));
