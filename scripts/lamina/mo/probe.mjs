import sharp from "sharp";
const src = process.argv[2] || "reference/pendientes/mycelial-oracle.png";
const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, C = info.channels;
const lum = (x,y)=>{const i=(y*W+x)*C;return 0.299*data[i]+0.587*data[i+1]+0.114*data[i+2];};
const modo = process.argv[3];
if (modo === "filas") {
  const x0=+process.argv[4], x1=+process.argv[5], y0=+process.argv[6], y1=+process.argv[7], umbral=+(process.argv[8]||60);
  for (let y=y0;y<y1;y++){let c=0,s=0;for(let x=x0;x<x1;x++){const l=lum(x,y);if(l>umbral)c++;s+=l;}
    console.log(`${y}\t${c}\t${(s/(x1-x0)).toFixed(1)}`);}
} else if (modo === "cols") {
  const x0=+process.argv[4], x1=+process.argv[5], y0=+process.argv[6], y1=+process.argv[7], umbral=+(process.argv[8]||60);
  for (let x=x0;x<x1;x++){let c=0,s=0;for(let y=y0;y<y1;y++){const l=lum(x,y);if(l>umbral)c++;s+=l;}
    console.log(`${x}\t${c}\t${(s/(y1-y0)).toFixed(1)}`);}
} else if (modo === "bandas") {
  // luminancia media por celda en rejilla NxM
  const nx=+(process.argv[4]||12), ny=+(process.argv[5]||16);
  for(let j=0;j<ny;j++){const fila=[];
    for(let i=0;i<nx;i++){
      const ax=Math.floor(i*W/nx), bx=Math.floor((i+1)*W/nx);
      const ay=Math.floor(j*H/ny), by=Math.floor((j+1)*H/ny);
      let s=0,n=0;for(let y=ay;y<by;y+=2)for(let x=ax;x<bx;x+=2){s+=lum(x,y);n++;}
      fila.push((s/n).toFixed(1).padStart(5));}
    console.log(`y${String(Math.floor(j*H/ny)).padStart(4)} ${fila.join(" ")}`);}
} else if (modo === "color") {
  const x0=+process.argv[4], y0=+process.argv[5], x1=+process.argv[6], y1=+process.argv[7];
  let best=-1,bi=0; const hist={};
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*W+x)*C;const l=lum(x,y);
    if(l>best){best=l;bi=i;}}
  console.log("pico",data[bi],data[bi+1],data[bi+2],"lum",best.toFixed(1));
  // media de los pixeles con lum > 60% del pico
  let r=0,g=0,b=0,n=0;
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*W+x)*C;if(lum(x,y)>best*0.6){r+=data[i];g+=data[i+1];b+=data[i+2];n++;}}
  console.log("media alto",(r/n).toFixed(0),(g/n).toFixed(0),(b/n).toFixed(0),"n",n);
}
