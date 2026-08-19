import sharp from "sharp";
const src = process.argv[2];
const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
const W=info.width,H=info.height,C=info.channels;
const lum=(x,y)=>{const i=(y*W+x)*C;return 0.299*data[i]+0.587*data[i+1]+0.114*data[i+2];};
const zonas={ todo:[0,0,W,H], arte:[226,335,750,915], rielIzq:[0,180,230,1300], rielDer:[975,180,254,1300], cabecera:[0,0,W,180], pie:[226,1250,750,180], barra:[0,1455,W,81] };
for(const [n,[x,y,w,h]] of Object.entries(zonas)){
  let t=0,s=0,n2=0;
  for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++){const l=lum(i,j); if(l>26)t++; s+=l; n2++;}
  console.log(`${n.padEnd(10)} tinta ${String(t).padStart(9)}  (${(100*t/n2).toFixed(1)}% del area)  lum media ${(s/n2).toFixed(1)}`);
}
