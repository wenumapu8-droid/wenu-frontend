import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const img = PNG.sync.read(readFileSync(join(ROOT, "reference", "canon", "t01-02-observation-eye.png")));
const { width: W, height: H, data } = img;
const lum = (x, y) => { const i = (y * W + x) * 4; return (data[i]*77 + data[i+1]*150 + data[i+2]*29) >> 8; };
const X0=468, X1=1180, Y0=88, Y1=866;
const cmd = process.argv[2];

if (cmd === "rows") {
  const t = Number(process.argv[3]||14);
  // fraction of pixels above t per row, plus longest run
  for (let y=Y0; y<Y1; y++){
    let n=0, best=0, run=0;
    for(let x=X0;x<X1;x++){ if(lum(x,y)>t){n++;run++;if(run>best)best=run;} else run=0; }
    if (best > (X1-X0)*0.5 || n > (X1-X0)*0.75) console.log(y, "n="+n, "run="+best);
  }
}
if (cmd === "cols") {
  const t = Number(process.argv[3]||14);
  const ya=Number(process.argv[4]||Y0), yb=Number(process.argv[5]||Y1);
  for (let x=X0; x<X1; x++){
    let n=0, best=0, run=0;
    for(let y=ya;y<yb;y++){ if(lum(x,y)>t){n++;run++;if(run>best)best=run;} else run=0; }
    if (best > (yb-ya)*0.5 || n > (yb-ya)*0.7) console.log(x, "n="+n, "run="+best);
  }
}
if (cmd === "prof") { // luminance profile along a row or col
  const kind=process.argv[3], v=Number(process.argv[4]), a=Number(process.argv[5]), b=Number(process.argv[6]);
  const out=[];
  for(let i=a;i<b;i++) out.push((kind==="row"?lum(i,v):lum(v,i)));
  console.log(out.join(","));
}
if (cmd === "ink") { // ink density in a box: x0 y0 x1 y1
  const [a,b,c,d]=process.argv.slice(3).map(Number);
  let n=0,tot=0,sr=0,sg=0,sb=0;
  for(let y=b;y<d;y++)for(let x=a;x<c;x++){const i=(y*W+x)*4;sr+=data[i];sg+=data[i+1];sb+=data[i+2];tot++;if(lum(x,y)>18)n++;}
  console.log(`box ${a},${b} ${c-a}x${d-b} media ${(sr/tot).toFixed(1)} ${(sg/tot).toFixed(1)} ${(sb/tot).toFixed(1)} · ${(100*n/tot).toFixed(1)}%`);
}
if (cmd === "seg") { // find horizontal segments (runs of ink) on a given row
  const y=Number(process.argv[3]), t=Number(process.argv[4]||14);
  let start=-1; const out=[];
  for(let x=X0;x<=X1;x++){ const on = x<X1 && lum(x,y)>t;
    if(on&&start<0)start=x; else if(!on&&start>=0){ if(x-start>3) out.push(`${start}-${x-1}(${x-start})`); start=-1; } }
  console.log(`y=${y}: `+out.join(" "));
}
if (cmd === "vseg") {
  const x=Number(process.argv[3]), t=Number(process.argv[4]||14);
  let start=-1; const out=[];
  for(let y=Y0;y<=Y1;y++){ const on = y<Y1 && lum(x,y)>t;
    if(on&&start<0)start=y; else if(!on&&start>=0){ if(y-start>3) out.push(`${start}-${y-1}(${y-start})`); start=-1; } }
  console.log(`x=${x}: `+out.join(" "));
}
if (cmd === "brightest") { // max luminance and its position within box
  const [a,b,c,d]=process.argv.slice(3).map(Number);
  let bx=0,by=0,bv=-1;
  for(let y=b;y<d;y++)for(let x=a;x<c;x++){const v=lum(x,y); if(v>bv){bv=v;bx=x;by=y;}}
  console.log("max",bv,"at",bx,by);
}
if (cmd === "radial") { // radial ink profile from cx,cy
  const cx=Number(process.argv[3]), cy=Number(process.argv[4]), rmax=Number(process.argv[5]||360);
  const acc=new Float64Array(rmax+1), cnt=new Float64Array(rmax+1);
  for(let y=Y0;y<Y1;y++)for(let x=X0;x<X1;x++){
    const r=Math.round(Math.hypot(x-cx,y-cy)); if(r<=rmax){acc[r]+=lum(x,y);cnt[r]++;}
  }
  const out=[];
  for(let r=0;r<=rmax;r++) out.push(r+":"+(cnt[r]?(acc[r]/cnt[r]).toFixed(1):"-"));
  console.log(out.join(" "));
}
if (cmd === "txt") { // find text lines in a sub-box: x0 y0 x1 y1 [t]
  const [a,b,c,d]=process.argv.slice(3,7).map(Number); const t=Number(process.argv[7]||14);
  let start=-1;
  for(let y=b;y<=d;y++){
    let n=0; for(let x=a;x<c;x++) if(lum(x,y)>t) n++;
    const on = y<d && n>1;
    if(on&&start<0)start=y; else if(!on&&start>=0){
      // extent in x
      let xa=c, xb=a;
      for(let yy=start;yy<y;yy++)for(let x=a;x<c;x++) if(lum(x,yy)>t){ if(x<xa)xa=x; if(x>xb)xb=x; }
      console.log(`y ${start}-${y-1} (h${y-start})  x ${xa}-${xb} (w${xb-xa+1})`);
      start=-1;
    }
  }
}
if (cmd === "bars") { // x0 x1 y0 y1 t → run-length of ink columns
  const [a,b,c,d]=process.argv.slice(3,7).map(Number); const t=Number(process.argv[7]||20);
  const on=[];
  for(let x=a;x<b;x++){ let s=0; for(let y=c;y<d;y++) s+=lum(x,y); on.push(s/(d-c)>t?1:0); }
  // print compact runs
  let out=[], cur=on[0], n=0, start=a;
  for(let i=0;i<=on.length;i++){ if(i<on.length&&on[i]===cur){n++;continue;} out.push((cur?"#":".")+n); cur=on[i];n=1; }
  console.log("start="+a, out.join(" "));
  console.log("bits="+on.join(""));
}
if (cmd === "rows2") { // x0 x1 y0 y1 t  → per-row ink count
  const [a,b,c,d]=process.argv.slice(3,7).map(Number); const t=Number(process.argv[7]||14);
  for(let y=c;y<d;y++){ let n=0,run=0,best=0; for(let x=a;x<b;x++){ if(lum(x,y)>t){n++;run++;if(run>best)best=run;} else run=0; }
    if(best>(b-a)*0.6) console.log(y,"n="+n,"run="+best); }
}
if (cmd === "avgx") { const [a,b,c,d]=process.argv.slice(3,7).map(Number);
  const o=[]; for(let x=a;x<b;x++){let s=0;for(let y=c;y<d;y++)s+=lum(x,y); o.push(x+":"+(s/(d-c)).toFixed(2));} console.log(o.join(" ")); }
if (cmd === "avgy") { const [a,b,c,d]=process.argv.slice(3,7).map(Number);
  const o=[]; for(let y=c;y<d;y++){let s=0;for(let x=a;x<b;x++)s+=lum(x,y); o.push(y+":"+(s/(b-a)).toFixed(2));} console.log(o.join(" ")); }
if (cmd === "perfil") { // cx cy rmax  → mean lum per r excluding +-14deg of horizontal, clipped to panel
  const cx=Number(process.argv[3]), cy=Number(process.argv[4]), rmax=Number(process.argv[5]||360);
  const acc=new Float64Array(rmax+1), cnt=new Float64Array(rmax+1);
  const PX0=469, PX1=1112, PY0=94, PY1=579;
  for(let y=PY0;y<PY1;y++)for(let x=PX0;x<PX1;x++){
    const dx=x-cx, dy=y-cy; const r=Math.round(Math.hypot(dx,dy)); if(r>rmax||r<1) continue;
    const s=Math.abs(dy)/r; if(s<0.24) continue;           // fuera la banda horizontal
    acc[r]+=lum(x,y); cnt[r]++;
  }
  const out=[]; for(let r=0;r<=rmax;r++) out.push(cnt[r]?Number((acc[r]/cnt[r]).toFixed(2)):0);
  console.log(JSON.stringify(out));
}
if (cmd === "ang") { // cx cy r0 r1 → mean lum per angle bucket (72)
  const cx=Number(process.argv[3]), cy=Number(process.argv[4]), r0=Number(process.argv[5]), r1=Number(process.argv[6]);
  const N=72, acc=new Float64Array(N), cnt=new Float64Array(N);
  for(let y=94;y<579;y++)for(let x=469;x<1112;x++){
    const dx=x-cx, dy=y-cy; const r=Math.hypot(dx,dy); if(r<r0||r>=r1) continue;
    let a=Math.atan2(dy,dx); if(a<0)a+=Math.PI*2; const b=Math.floor(a/(Math.PI*2)*N)%N;
    acc[b]+=lum(x,y); cnt[b]++;
  }
  console.log(Array.from({length:N},(_,i)=>(i*5)+":"+(cnt[i]?(acc[i]/cnt[i]).toFixed(1):"-")).join(" "));
}
