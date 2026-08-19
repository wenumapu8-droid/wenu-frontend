/* KODEX · GENESIS CRADLE · detector de reglas del cromo.
   Los marcos de esta lamina son de 1 px y muy tenues (lum 25..60): el
   umbral fijo de probe.mjs no los ve. Aca se busca la ESTRUCTURA: una
   columna es borde si tiene una corrida larga de pixeles mas claros que
   sus dos vecinas laterales. Igual para filas. */
import sharp from "sharp";
const [,,src,modo,X0,X1,Y0,Y1,MIN] = process.argv;
const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
const W = info.width, C = info.channels;
const lum=(x,y)=>{const i=(y*W+x)*C;return 0.299*data[i]+0.587*data[i+1]+0.114*data[i+2];};
const x0=+X0,x1=+X1,y0=+Y0,y1=+Y1,min=+(MIN||60);
if (modo==="v") {
  for (let x=x0;x<x1;x++){
    let run=0,best=0,ini=0,bini=0;
    for(let y=y0;y<y1;y++){
      const c=lum(x,y), l=lum(x-2,y), r=lum(x+2,y);
      if (c>l+4 && c>r+4 && c>14){ if(!run)ini=y; run++; if(run>best){best=run;bini=ini;} } else run=0;
    }
    if (best>=min) console.log(`x=${x}\trun=${best}\ty${bini}..${bini+best}`);
  }
} else {
  for (let y=y0;y<y1;y++){
    let run=0,best=0,ini=0,bini=0;
    for(let x=x0;x<x1;x++){
      const c=lum(x,y), a=lum(x,y-2), b=lum(x,y+2);
      if (c>a+4 && c>b+4 && c>14){ if(!run)ini=x; run++; if(run>best){best=run;bini=ini;} } else run=0;
    }
    if (best>=min) console.log(`y=${y}\trun=${best}\tx${bini}..${bini+best}`);
  }
}
