import sharp from "sharp";
const A = "scripts/lamina/out/mycelial-oracle/actual.png";
const R = "reference/pendientes/mycelial-oracle.png";
const load = async (f) => { const {data,info}=await sharp(f).raw().toBuffer({resolveWithObject:true}); return {data,W:info.width,C:info.channels}; };
const a = await load(A), r = await load(R);
const lum=(o,x,y)=>{const i=(y*o.W+x)*o.C;return 0.299*o.data[i]+0.587*o.data[i+1]+0.114*o.data[i+2];};
const x0=226,y0=335,w=751,h=940,nx=15,ny=18;
let hdr="      ";for(let i=0;i<nx;i++)hdr+=String(x0+Math.floor((i+0.5)*w/nx)).padStart(6);
console.log("  DELTA actual − referencia (positivo = me sobra luz)");
console.log(hdr);
for(let j=0;j<ny;j++){const f=[];
 for(let i=0;i<nx;i++){let sa=0,sr=0,n=0;
  for(let y=y0+Math.floor(j*h/ny);y<y0+Math.floor((j+1)*h/ny);y+=2)
   for(let x=x0+Math.floor(i*w/nx);x<x0+Math.floor((i+1)*w/nx);x+=2){sa+=lum(a,x,y);sr+=lum(r,x,y);n++;}
  const d=(sa-sr)/n;
  f.push(((d>0?"+":"")+d.toFixed(0)).padStart(6));}
 console.log(String(y0+Math.floor((j+0.5)*h/ny)).padStart(6)+f.join(""));}
