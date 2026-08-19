import sharp from "sharp";
const [,,src,modo,fijo,A,B]=process.argv;
const {data,info}=await sharp(src).raw().toBuffer({resolveWithObject:true});
const W=info.width,C=info.channels;
const lum=(x,y)=>{const i=(y*W+x)*C;return 0.299*data[i]+0.587*data[i+1]+0.114*data[i+2];};
const out=[];
for(let t=+A;t<+B;t++) out.push(`${t}:${(modo==="row"?lum(t,+fijo):lum(+fijo,t)).toFixed(0)}`);
console.log(out.join(" "));
