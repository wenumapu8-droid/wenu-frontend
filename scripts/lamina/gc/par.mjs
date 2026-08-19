/* referencia | actual, apilados y ampliados */
import sharp from "sharp";
const [,,x,y,w,h,out,esc]=process.argv;
const k=+(esc||2), W=+w, H=+h;
const [a,b]=await Promise.all([
  sharp("reference/pendientes/genesis-cradle.png").extract({left:+x,top:+y,width:W,height:H}).toBuffer(),
  sharp("scripts/lamina/out/genesis-cradle/actual.png").extract({left:+x,top:+y,width:W,height:H}).toBuffer(),
]);
await sharp({create:{width:W,height:H*2+8,channels:3,background:"#303030"}})
  .composite([{input:a,left:0,top:0},{input:b,left:0,top:H+8}])
  .resize({width:Math.round(W*k),kernel:"lanczos3"}).png().toFile(out);
console.log("ok",out);
