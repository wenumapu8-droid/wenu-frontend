import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
const img = PNG.sync.read(readFileSync("reference/canon/t01-05-specimen-skull.png"));
const { width:W, data } = img;
const [x0,y0,x1,y1]=process.argv.slice(2).map(Number);
const list=[];
for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=(y*W+x)*4;const r=data[i],g=data[i+1],b=data[i+2];const l=(r*77+g*150+b*29)>>8;if(l>20)list.push([l,r,g,b]);}
list.sort((a,b)=>b[0]-a[0]);
const pick=(f)=>list[Math.min(list.length-1,Math.floor(list.length*f))];
console.log("n",list.length,"p0.2%",pick(0.002),"p5%",pick(0.05),"p50%",pick(0.5));
