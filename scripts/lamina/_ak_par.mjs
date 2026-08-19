import sharp from "sharp";
const [x,y,w,h,esc,out] = process.argv.slice(2);
const X=+x,Y=+y,Wd=+w,Ht=+h,E=+esc;
const W2=Math.round(Wd*E), H2=Math.round(Ht*E);
const corte = async (f) => sharp(f).extract({left:X,top:Y,width:Wd,height:Ht})
  .resize({width:W2,height:H2,kernel:"lanczos3"}).removeAlpha().png().toBuffer();
const a = await corte("reference/pendientes/akashic-crown.png");
const b = await corte("scripts/lamina/out/akashic-crown/actual.png");
await sharp({create:{width:W2*2+10,height:H2,channels:3,background:"#303030"}})
  .composite([{input:a,left:0,top:0},{input:b,left:W2+10,top:0}])
  .png().toFile(out);
console.log(out);
