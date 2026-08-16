#!/usr/bin/env node
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
const img = PNG.sync.read(readFileSync("reference/canon/t01-06-ritual-device.png"));
const { width: W, height: H, data } = img;
const lum=(x,y)=>{const i=(y*W+x)*4;return (data[i]*77+data[i+1]*150+data[i+2]*29)>>8;};
const rgb=(x,y)=>{const i=(y*W+x)*4;return [data[i],data[i+1],data[i+2]];};
const hex=(x,y)=>"#"+rgb(x,y).map(v=>v.toString(16).padStart(2,"0")).join("");
// filas con tinta en ventana
function filas(x0,x1,y0,y1,thr){const o=[];let s=null;for(let y=y0;y<=y1;y++){let n=0;for(let x=x0;x<=x1;x++) if(lum(x,y)>thr)n++;
 if(n>0&&s===null)s=y; if(n===0&&s!==null){o.push([s,y-1]);s=null;}}if(s!==null)o.push([s,y1]);return o;}
function cols(x0,x1,y0,y1,thr,hueco=2){const o=[];let run=null;for(let x=x0;x<=x1;x++){let n=0;for(let y=y0;y<=y1;y++) if(lum(x,y)>thr)n++;
 if(n>0) run=run?[run[0],x]:[x,x]; else if(run&&x-run[1]>hueco){o.push(run);run=null;}}if(run)o.push(run);return o;}
function bbox(x0,x1,y0,y1,thr){let ax=1e9,bx=-1,ay=1e9,by=-1,n=0,s=[0,0,0],mx=0;
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const v=lum(x,y); if(v>thr){n++;if(x<ax)ax=x;if(x>bx)bx=x;if(y<ay)ay=y;if(y>by)by=y;const p=rgb(x,y);s[0]+=p[0];s[1]+=p[1];s[2]+=p[2];if(v>mx)mx=v;}}
 return n?{x:ax,y:ay,w:bx-ax+1,h:by-ay+1,n,max:mx,med:"#"+s.map(q=>Math.round(q/n).toString(16).padStart(2,"0")).join("")}:null;}
const cmd=process.argv[2];
const N=(i)=>Number(process.argv[i]);
if(cmd==="filas") console.log(JSON.stringify(filas(N(3),N(4),N(5),N(6),N(7)??10)));
if(cmd==="cols") console.log(JSON.stringify(cols(N(3),N(4),N(5),N(6),N(7)??10,N(8)??2)));
if(cmd==="bbox") console.log(JSON.stringify(bbox(N(3),N(4),N(5),N(6),N(7)??10)));
if(cmd==="hex") console.log(hex(N(3),N(4)), lum(N(3),N(4)));
if(cmd==="perfilY"){const o=[];for(let y=N(5);y<=N(6);y++){let n=0,mx=0;for(let x=N(3);x<=N(4);x++){const v=lum(x,y);if(v>(N(7)??10))n++;if(v>mx)mx=v;}o.push(`${y}:${n}/${mx}`);}console.log(o.join(" "));}
if(cmd==="perfilX"){const o=[];for(let x=N(3);x<=N(4);x++){let n=0,mx=0;for(let y=N(5);y<=N(6);y++){const v=lum(x,y);if(v>(N(7)??10))n++;if(v>mx)mx=v;}o.push(`${x}:${n}/${mx}`);}console.log(o.join(" "));}
