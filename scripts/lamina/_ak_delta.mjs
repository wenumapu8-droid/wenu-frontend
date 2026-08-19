import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
const R=PNG.sync.read(readFileSync("reference/pendientes/akashic-crown.png"));
const A=PNG.sync.read(readFileSync("scripts/lamina/out/akashic-crown/actual.png"));
const W=R.width;
const L=(img,x,y)=>{const p=(y*W+x)*4;return 0.299*img.data[p]+0.587*img.data[p+1]+0.114*img.data[p+2];};
const [X0,X1,Y0,Y1,NX,NY]=process.argv.slice(2).map(Number);
let hdr="        ";
for(let i=0;i<NX;i++) hdr+=String(Math.round(X0+(i+0.5)*(X1-X0)/NX)).padStart(6);
console.log("DELTA ref-actual (+ = FALTA luz)"); console.log(hdr);
for(let j=0;j<NY;j++){
  let row=String(Math.round(Y0+(j+0.5)*(Y1-Y0)/NY)).padStart(6)+"  ";
  for(let i=0;i<NX;i++){
    let sr=0,sa=0,c=0;
    for(let y=Math.round(Y0+j*(Y1-Y0)/NY);y<Math.round(Y0+(j+1)*(Y1-Y0)/NY);y+=2)
    for(let x=Math.round(X0+i*(X1-X0)/NX);x<Math.round(X0+(i+1)*(X1-X0)/NX);x+=2){ sr+=L(R,x,y); sa+=L(A,x,y); c++; }
    row+=String(Math.round((sr-sa)/c)).padStart(6);
  }
  console.log(row);
}
