/* delta actual − referencia por celdas: + sobra luz, − falta */
import sharp from "sharp";
const [,,X,Y,W0,H0,NX,NY]=process.argv;
const ref="reference/pendientes/genesis-cradle.png", act="scripts/lamina/out/genesis-cradle/actual.png";
const [A,B]=await Promise.all([ref,act].map(p=>sharp(p).raw().toBuffer({resolveWithObject:true})));
const W=A.info.width,C=A.info.channels,C2=B.info.channels;
const lum=(d,c,x,y)=>{const i=(y*W+x)*c;return 0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];};
const x0=+X,y0=+Y,w=+W0,h=+H0,nx=+NX,ny=+NY;
let hdr="      ";for(let i=0;i<nx;i++)hdr+=String(x0+Math.floor((i+0.5)*w/nx)).padStart(6);
console.log(hdr);
for(let j=0;j<ny;j++){const f=[];
 for(let i=0;i<nx;i++){let sa=0,sb=0,n=0;
  for(let y=y0+Math.floor(j*h/ny);y<y0+Math.floor((j+1)*h/ny);y+=2)
   for(let x=x0+Math.floor(i*w/nx);x<x0+Math.floor((i+1)*w/nx);x+=2){sa+=lum(A.data,C,x,y);sb+=lum(B.data,C2,x,y);n++;}
  const r=Math.round(sa/n),a=Math.round(sb/n);f.push(`${String(r).padStart(3)}${a-r>=0?"+":"-"}${String(Math.abs(a-r)).padStart(2)}`);}
 console.log(String(y0+Math.floor((j+0.5)*h/ny)).padStart(6)+f.join(""));}
