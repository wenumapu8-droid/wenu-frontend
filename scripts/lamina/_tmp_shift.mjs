import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
const R = PNG.sync.read(readFileSync("/Users/galvazincia/kodex-work/reference/canon/t01-03-descent-tunnel.png"));
const A = PNG.sync.read(readFileSync(process.argv[2]));
function box(x0,y0,w,h,dx,dy){
  const a=new PNG({width:w,height:h}), b=new PNG({width:w,height:h});
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const si=((y+y0)*R.width+(x+x0))*4, di=(y*w+x)*4;
    const sj=((y+y0+dy)*R.width+(x+x0+dx))*4;
    for(let k=0;k<4;k++){a.data[di+k]=A.data[sj+k];b.data[di+k]=R.data[si+k];}
  }
  const d=new PNG({width:w,height:h});
  return 100*pixelmatch(a.data,b.data,d.data,w,h,{threshold:0.12,includeAA:false})/(w*h);
}
let best=[99,0,0];
for(let dy=-2;dy<=8;dy++)for(let dx=-2;dx<=10;dx++){
  const v=box(1110,343,173,74,dx,dy);
  if(v<best[0])best=[v,dx,dy];
}
console.log('r07c09 best',best[0].toFixed(2),'dx',best[1],'dy',best[2]);
let b2=[99,0,0];
for(let dy=-2;dy<=8;dy++)for(let dx=-2;dx<=10;dx++){
  const v=box(1112,336,533,106,dx,dy);
  if(v<b2[0])b2=[v,dx,dy];
}
console.log('panel best',b2[0].toFixed(2),'dx',b2[1],'dy',b2[2]);
