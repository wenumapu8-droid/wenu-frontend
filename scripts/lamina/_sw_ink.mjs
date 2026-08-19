import sharp from "sharp";
const A="scripts/lamina/out/soul-weaver/actual.png", R="reference/pendientes/soul-weaver.png";
const cajas=JSON.parse(process.argv[2]);
const car=async(f)=>{const{data,info}=await sharp(f).raw().toBuffer({resolveWithObject:true});return{data,W:info.width,ch:info.channels};};
const r=await car(R),a=await car(A);
const ink=(o,x,y,w,h)=>{let c=0,n=0,s=0;for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){const i=(yy*o.W+xx)*o.ch;const l=0.299*o.data[i]+0.587*o.data[i+1]+0.114*o.data[i+2];n++;s+=l;if(l>26)c++;}return[(c/n*100).toFixed(1),(s/n).toFixed(1)];};
for(const b of cajas){const [x,y,w,h]=b.c;const A1=ink(r,x,y,w,h),B1=ink(a,x,y,w,h);
 console.log(`${b.n.padEnd(20)} REF tinta ${A1[0].padStart(5)}% lum ${A1[1].padStart(5)}   ACT tinta ${B1[0].padStart(5)}% lum ${B1[1].padStart(5)}`);}
