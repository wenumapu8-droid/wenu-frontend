import { readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import sharp from "sharp";
import { vectorize, ColorMode, PathSimplifyMode, Hierarchical } from "@neplex/vectorizer";
const img = PNG.sync.read(readFileSync("reference/canon/t01-05-specimen-skull.png"));
const { width: W, data } = img;
const [x0,y0,x1,y1,esc,prec,speck,pp] = process.argv.slice(2).map(Number);
const w = x1-x0+1, h = y1-y0+1;
const raw = Buffer.alloc(w*h*3);
for (let y=0;y<h;y++) for(let x=0;x<w;x++){const i=((y0+y)*W+x0+x)*4; raw[(y*w+x)*3]=data[i];raw[(y*w+x)*3+1]=data[i+1];raw[(y*w+x)*3+2]=data[i+2];}
const up = await sharp(raw,{raw:{width:w,height:h,channels:3}}).resize({width:w*esc,height:h*esc,kernel:"nearest"}).png().toBuffer();
const t=Date.now();
const svg = await vectorize(up, { colorMode: ColorMode.Color, hierarchical: Hierarchical.Stacked, filterSpeckle: speck, colorPrecision: prec, layerDifference: 16, mode: PathSimplifyMode.Spline, cornerThreshold: 60, lengthThreshold: 4, maxIterations: 10, spliceThreshold: 45, pathPrecision: pp||2 });
console.log("ms",Date.now()-t,"bytes",svg.length,"paths",(svg.match(/<path/g)||[]).length);
writeFileSync("/private/tmp/kdx-t0105-der/test.svg", svg);
// render back and measure MAE
const png2 = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w*esc} ${h*esc}"><rect width="${w*esc}" height="${h*esc}" fill="#000"/>${svg.replace(/^[\s\S]*?<svg[^>]*>/,"").replace(/<\/svg>\s*$/,"")}</svg>`)).raw().toBuffer({resolveWithObject:true});
let e=0; const d2=png2.data;
for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=((y0+y)*W+x0+x)*4,j=(y*w+x)*png2.info.channels;
 e+=(Math.abs(d2[j]-data[i])+Math.abs(d2[j+1]-data[i+1])+Math.abs(d2[j+2]-data[i+2]))/3;}
console.log("MAE",(e/(w*h)).toFixed(2));
