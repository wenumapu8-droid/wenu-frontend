import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
const img = PNG.sync.read(readFileSync("reference/canon/t01-05-specimen-skull.png"));
const { width: W, data } = img;
const [x0,y0,x1,y1,TOL,Q] = process.argv.slice(2).map(Number);
const w=x1-x0+1,h=y1-y0+1;
const q=(v)=>Math.min(255,Math.round(v/Q)*Q);
let runs=[],err=0,n=0;
for(let y=0;y<h;y++){
  let i=0;
  while(i<w){
    const p0=((y0+y)*W+x0+i)*4;
    let r=q(data[p0]),g=q(data[p0+1]),b=q(data[p0+2]);
    let j=i, sr=0,sg=0,sb=0,c=0;
    while(j<w){const p=((y0+y)*W+x0+j)*4;
      if(Math.abs(q(data[p])-r)>TOL||Math.abs(q(data[p+1])-g)>TOL||Math.abs(q(data[p+2])-b)>TOL) break;
      sr+=data[p];sg+=data[p+1];sb+=data[p+2];c++;j++;}
    const mr=q(sr/c),mg=q(sg/c),mb=q(sb/c);
    if(mr+mg+mb>6) runs.push([i,y,j-i,mr,mg,mb]);
    for(let k=i;k<j;k++){const p=((y0+y)*W+x0+k)*4;
      const rr=(mr+mg+mb>6)?[mr,mg,mb]:[0,0,0];
      err+=(Math.abs(rr[0]-data[p])+Math.abs(rr[1]-data[p+1])+Math.abs(rr[2]-data[p+2]))/3;n++;}
    i=j;
  }
}
const json=JSON.stringify(runs);
console.log("runs",runs.length,"bytes",json.length,"MAE",(err/n).toFixed(2));
