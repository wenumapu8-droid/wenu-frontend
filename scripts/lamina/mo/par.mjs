import sharp from "sharp";
const [,,x,y,w,h,esc,out]=process.argv;
const e=+(esc||2);
const box={left:+x,top:+y,width:+w,height:+h};
const [a,b]=await Promise.all([
  sharp("reference/pendientes/mycelial-oracle.png").extract(box).resize({width:Math.round(+w*e),kernel:"lanczos3"}).png().toBuffer(),
  sharp("scripts/lamina/out/mycelial-oracle/actual.png").extract(box).resize({width:Math.round(+w*e),kernel:"lanczos3"}).png().toBuffer(),
]);
const W=Math.round(+w*e), H=Math.round(+h*e);
await sharp({create:{width:W*2+14,height:H,channels:3,background:"#333"}})
  .composite([{input:a,left:0,top:0},{input:b,left:W+14,top:0}]).png().toFile(out||"scripts/lamina/out/mycelial-oracle/par.png");
console.log("ok");
