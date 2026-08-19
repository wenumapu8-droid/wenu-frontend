/* agrupa filas con tinta en BANDAS: sale una linea por bloque de texto */
import sharp from "sharp";
const [,,src,x0,x1,y0,y1,U,MIN]=process.argv;
const {data,info}=await sharp(src).raw().toBuffer({resolveWithObject:true});
const W=info.width,C=info.channels;
const lum=(x,y)=>{const i=(y*W+x)*C;return 0.299*data[i]+0.587*data[i+1]+0.114*data[i+2];};
const u=+(U||70), min=+(MIN||2);
let ini=-1;
for(let y=+y0;y<=+y1;y++){
  let c=0; for(let x=+x0;x<+x1;x++) if(lum(x,y)>u)c++;
  const hay = c>=min && y<+y1;
  if(hay && ini<0) ini=y;
  if(!hay && ini>=0){ if(y-ini>=2) console.log(`y${ini}..${y-1}\talto ${y-ini}`); ini=-1; }
}
