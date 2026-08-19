import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
const R=PNG.sync.read(readFileSync("reference/pendientes/akashic-crown.png"));
const A=PNG.sync.read(readFileSync("scripts/lamina/out/akashic-crown/actual.png"));
const W=R.width;
const L=(img,x,y)=>{const p=(y*W+x)*4;return 0.299*img.data[p]+0.587*img.data[p+1]+0.114*img.data[p+2];};
const bandas=[[300,360],[400,470],[490,560],[560,600],[620,670],[700,760],[760,820],[830,900],[900,970],[970,1050],[1050,1120],[1120,1180],[1190,1240],[1250,1300],[1300,1370],[1370,1430]];
let hdr="  banda   ";
for(let x=250;x<980;x+=36) hdr+=String(x).padStart(5);
console.log(hdr);
for(const [y0,y1] of bandas){
  let a="",b="",d="";
  for(let x=250;x<980;x+=36){let sr=0,sa=0,c=0;
    for(let y=y0;y<y1;y++)for(let xx=x;xx<x+36&&xx<980;xx++){sr+=L(R,xx,y);sa+=L(A,xx,y);c++;}
    a+=String(Math.round(sr/c)).padStart(5); b+=String(Math.round(sa/c)).padStart(5); d+=String(Math.round((sr-sa)/c)).padStart(5);}
  console.log((y0+"-"+y1).padEnd(10)+"ref"+a);
  console.log("          act"+b);
  console.log("          Δ  "+d);
}
