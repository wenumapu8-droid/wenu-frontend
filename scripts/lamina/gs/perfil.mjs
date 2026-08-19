/* Perfil de tinta sobre CUALQUIER png: sirve para medir la captura con
   la misma vara que la referencia. */
import sharp from "sharp";
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? Number(process.argv[i+1]) : d; };
const img = process.argv[2], modo = process.argv[3] || "row";
const { data, info } = await sharp(img).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const lum = (x, y) => { const i = (y*W+x)*C; return (data[i]*77 + data[i+1]*150 + data[i+2]*29) >> 8; };
const x0 = arg("--x0",0), x1 = arg("--x1",W), y0 = arg("--y0",0), y1 = arg("--y1",H), u = arg("--u",80), min = arg("--min",1);
if (modo === "row") for (let y=y0;y<y1;y++){let n=0;for(let x=x0;x<x1;x++) if(lum(x,y)>u)n++; if(n>=min)console.log(y+"\t"+n);}
else for (let x=x0;x<x1;x++){let n=0;for(let y=y0;y<y1;y++) if(lum(x,y)>u)n++; if(n>=min)console.log(x+"\t"+n);}
