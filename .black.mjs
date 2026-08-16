import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
const ROOT="/Users/galvazincia/kodex-work";
const ref = PNG.sync.read(readFileSync(`${ROOT}/reference/canon/t01-03-descent-tunnel.png`));
const BX=317,BY=96,BW=776,BH=522;
function sub(p,x0,y0,w,h){const o=new PNG({width:w,height:h});for(let y=0;y<h;y++)for(let x=0;x<w;x++){const s=((y0+y)*p.width+(x0+x))*4,d=(y*w+x)*4;o.data[d]=p.data[s];o.data[d+1]=p.data[s+1];o.data[d+2]=p.data[s+2];o.data[d+3]=255;}return o;}
const r=sub(ref,BX,BY,BW,BH);
const blk=new PNG({width:BW,height:BH});
for(let i=0;i<blk.data.length;i+=4){blk.data[i]=3;blk.data[i+1]=2;blk.data[i+2]=2;blk.data[i+3]=255;}
const d=new PNG({width:BW,height:BH});
const n=pixelmatch(blk.data,r.data,d.data,BW,BH,{threshold:0.1});
console.log("BLACK panel pct", (100*n/(BW*BH)).toFixed(3));
