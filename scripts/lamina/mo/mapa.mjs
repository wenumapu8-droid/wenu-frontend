import sharp from "sharp";
const [,,src,X,Y,W0,H0,NX,NY]=process.argv;
const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
const W=info.width,C=info.channels;
const lum=(x,y)=>{const i=(y*W+x)*C;return 0.299*data[i]+0.587*data[i+1]+0.114*data[i+2];};
const x0=+X,y0=+Y,w=+W0,h=+H0,nx=+NX,ny=+NY;
let hdr="      ";for(let i=0;i<nx;i++)hdr+=String(x0+Math.floor((i+0.5)*w/nx)).padStart(5);
console.log(hdr);
for(let j=0;j<ny;j++){const f=[];
 for(let i=0;i<nx;i++){let s=0,n=0;
  for(let y=y0+Math.floor(j*h/ny);y<y0+Math.floor((j+1)*h/ny);y+=2)
   for(let x=x0+Math.floor(i*w/nx);x<x0+Math.floor((i+1)*w/nx);x+=2){s+=lum(x,y);n++;}
  f.push((s/n).toFixed(0).padStart(5));}
 console.log(String(y0+Math.floor((j+0.5)*h/ny)).padStart(6)+f.join(""));}
