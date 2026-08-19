import sharp from "sharp";
/* sharp aplica resize ANTES de composite en su pipeline: si se encadenan,
   el lienzo se encoge y las piezas ya no entran. Van en dos etapas. */
const [x,y,w,h,esc,out]=process.argv.slice(2);
const X=+x,Y=+y,W=+w,H=+h,E=+esc;
const cut=(f)=>sharp(f).extract({left:X,top:Y,width:W,height:H}).removeAlpha().png().toBuffer();
const [a,b]=await Promise.all([cut("reference/pendientes/soul-weaver.png"),cut("scripts/lamina/out/soul-weaver/actual.png")]);
const par=await sharp({create:{width:W*2+10,height:H,channels:3,background:"#303030"}})
 .composite([{input:a,left:0,top:0},{input:b,left:W+10,top:0}]).png().toBuffer();
await sharp(par).resize({width:Math.round((W*2+10)*E)}).png().toFile(out);
console.log("ok",out);
