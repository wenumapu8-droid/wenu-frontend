import sharp from "sharp";
const img = process.argv[2];
const CW = +(process.argv[3]||48), CH = +(process.argv[4]||60);
const X0=+(process.argv[5]??0), Y0=+(process.argv[6]??0), W=+(process.argv[7]??1229), H=+(process.argv[8]??1536);
const { data, info } = await sharp(img).extract({left:X0,top:Y0,width:W,height:H}).resize(CW,CH,{fit:"fill"}).raw().toBuffer({resolveWithObject:true});
const ch=info.channels;
const esc=" .:-=+*#%@";
let out="     ";
for(let x=0;x<CW;x++) out+= (x%10===0? String(Math.round(X0+ (x+0.5)*W/CW)).padStart(1).slice(-1) : " ");
console.log(out);
for(let y=0;y<CH;y++){
  let l=String(Math.round(Y0+(y+0.5)*H/CH)).padStart(4)+" ";
  for(let x=0;x<CW;x++){const i=(y*CW+x)*ch;const v=0.299*data[i]+0.587*data[i+1]+0.114*data[i+2];l+=esc[Math.min(9,Math.floor(v/25.6))];}
  console.log(l);
}
