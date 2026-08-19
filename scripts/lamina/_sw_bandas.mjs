import sharp from "sharp";
const A="scripts/lamina/out/soul-weaver/actual.png", R="reference/pendientes/soul-weaver.png";
const X0=+process.argv[2],Y0=+process.argv[3],W=+process.argv[4],H=+process.argv[5],P=+(process.argv[6]||40);
const modo=process.argv[7]||"filas";
const car=async(f)=>{const{data,info}=await sharp(f).raw().toBuffer({resolveWithObject:true});return{data,W:info.width,ch:info.channels};};
const r=await car(R),a=await car(A);
const m=(o,x,y,w,h)=>{let s=0,n=0;for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){const i=(yy*o.W+xx)*o.ch;s+=0.299*o.data[i]+0.587*o.data[i+1]+0.114*o.data[i+2];n++;}return s/n;};
if(modo==="filas"){for(let y=Y0;y<Y0+H;y+=P){const h=Math.min(P,Y0+H-y);const A1=m(r,X0,y,W,h),B1=m(a,X0,y,W,h);
 console.log(`y${String(y).padStart(4)}  ref ${A1.toFixed(1).padStart(6)}  act ${B1.toFixed(1).padStart(6)}  d ${(B1-A1).toFixed(1).padStart(6)}`);}}
else {for(let x=X0;x<X0+W;x+=P){const w=Math.min(P,X0+W-x);const A1=m(r,x,Y0,w,H),B1=m(a,x,Y0,w,H);
 console.log(`x${String(x).padStart(4)}  ref ${A1.toFixed(1).padStart(6)}  act ${B1.toFixed(1).padStart(6)}  d ${(B1-A1).toFixed(1).padStart(6)}`);}}
