import sharp from "sharp";
const [x,y,w,h,s,out] = [Number(process.argv[2]),Number(process.argv[3]),Number(process.argv[4]),Number(process.argv[5]),Number(process.argv[6]),process.argv[7]];
await sharp("reference/canon/t01-05-specimen-skull.png").extract({left:x,top:y,width:w,height:h}).resize({width:w*s,kernel:"nearest"}).toFile(out);
console.log("ok");
