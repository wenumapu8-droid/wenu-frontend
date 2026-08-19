import sharp from "sharp";
const img=process.argv[2];
const cajas=process.argv.slice(3);
const {data,info}=await sharp(img).raw().toBuffer({resolveWithObject:true});
const W=info.width, ch=info.channels;
for(const c of cajas){
  const [x,y,w,h]=c.split(",").map(Number);
  let r=0,g=0,b=0,n=0,mx=0,mr=0,mg=0,mb=0;
  for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){const i=(yy*W+xx)*ch;r+=data[i];g+=data[i+1];b+=data[i+2];n++;
    const l=0.299*data[i]+0.587*data[i+1]+0.114*data[i+2]; if(l>mx){mx=l;mr=data[i];mg=data[i+1];mb=data[i+2];}}
  console.log(`${c}\tmedia=rgb(${(r/n).toFixed(0)},${(g/n).toFixed(0)},${(b/n).toFixed(0)})\tpico=rgb(${mr},${mg},${mb}) lum${mx.toFixed(0)}`);
}
