import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
const R = PNG.sync.read(readFileSync("/Users/galvazincia/kodex-work/reference/canon/t01-03-descent-tunnel.png"));
const A = PNG.sync.read(readFileSync(process.argv[2] || "cur.png"));
function box(x0,y0,w,h){
  const a=new PNG({width:w,height:h}), b=new PNG({width:w,height:h});
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const si=((y+y0)*R.width+(x+x0))*4, di=(y*w+x)*4;
    for(let k=0;k<4;k++){a.data[di+k]=A.data[si+k];b.data[di+k]=R.data[si+k];}
  }
  const d=new PNG({width:w,height:h});
  const bad=pixelmatch(a.data,b.data,d.data,w,h,{threshold:0.12,includeAA:false});
  return 100*bad/(w*h);
}
const boxes={panel:[1110,334,547,110],r07c09:[1110,343,173,74],r07c11:[1290,343,171,74],r07c13:[1469,343,179,74],
 t1:[1110,334,110,110],t2:[1220,334,110,110],t3:[1330,334,110,110],t4:[1440,334,110,110],t5:[1550,334,107,110]};
for(const [k,v] of Object.entries(boxes)) console.log(k, box(...v).toFixed(2));
