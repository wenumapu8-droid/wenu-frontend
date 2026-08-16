import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
const img = PNG.sync.read(readFileSync("reference/canon/t01-05-specimen-skull.png"));
const { width: W, data } = img;
const px=(x,y)=>{const i=(y*W+x)*4;return [data[i],data[i+1],data[i+2]];};
const L=(x,y)=>{const[r,g,b]=px(x,y);return (r*77+g*150+b*29)>>8;};
const [X0,Y0,X1,Y1,MIN,MAXL,U]=process.argv.slice(2).map(Number);
const out=[];
const scan=(dir)=>{
  const a0=dir==='H'?Y0:X0, a1=dir==='H'?Y1:X1, b0=dir==='H'?X0:Y0, b1=dir==='H'?X1:Y1;
  for(let a=a0;a<=a1;a++){
    let s=null;
    for(let b=b0;b<=b1+1;b++){
      const on = b<=b1 && L(dir==='H'?b:a, dir==='H'?a:b) > U;
      if(on){ if(s===null)s=b; }
      else if(s!==null){
        const len=b-s;
        if(len>=MIN){
          let r=0,g=0,bl=0;
          for(let k=s;k<b;k++){const p=px(dir==='H'?k:a, dir==='H'?a:k); r+=p[0];g+=p[1];bl+=p[2];}
          r/=len;g/=len;bl/=len;
          const lm=(r*77+g*150+bl*29)/256;
          if(lm<=MAXL) out.push([dir,a,s,len,`#${[r,g,bl].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')}`,lm.toFixed(0)]);
        }
        s=null;
      }
    }
  }
};
scan('H'); scan('V');
console.log("total",out.length);
for(const o of out) console.log(o.join(' '));
