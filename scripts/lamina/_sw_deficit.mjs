import sharp from "sharp";
const A="scripts/lamina/out/soul-weaver/actual.png", R="reference/pendientes/soul-weaver.png";
const CW=+(process.argv[2]||40), CH=+(process.argv[3]||40);
const X0=+(process.argv[4]??0),Y0=+(process.argv[5]??0),W=+(process.argv[6]??1229),H=+(process.argv[7]??1536);
const load=async(f)=>{const{data,info}=await sharp(f).extract({left:X0,top:Y0,width:W,height:H}).resize(CW,CH,{fit:"fill"}).raw().toBuffer({resolveWithObject:true});return{data,ch:info.channels};};
const a=await load(A), r=await load(R);
const lum=(o,i)=>0.299*o.data[i*o.ch]+0.587*o.data[i*o.ch+1]+0.114*o.data[i*o.ch+2];
console.log("  filas = y ; celdas: '-' falta luz (ref mas clara), '+' sobra luz, '.' ok ; intensidad 1-9 = |dif|/25");
let hdr="     ";
for(let x=0;x<CW;x++) hdr += (x%10===0? String(Math.round(X0+(x+.5)*W/CW)).slice(-1):" ");
console.log(hdr);
for(let y=0;y<CH;y++){
  let l=String(Math.round(Y0+(y+.5)*H/CH)).padStart(4)+" ";
  for(let x=0;x<CW;x++){const i=y*CW+x;const d=lum(r,i)-lum(a,i);const m=Math.min(9,Math.round(Math.abs(d)/14));
    l += m===0?".":(d>0?"-":"+").repeat(1).replace(/./,c=>m>=5?(d>0?"▄":"█"):(d>0?"-":"+"));}
  console.log(l+"  ");
}
let sr=0,sa=0;for(let i=0;i<CW*CH;i++){sr+=lum(r,i);sa+=lum(a,i);}
console.log(`media ref=${(sr/(CW*CH)).toFixed(1)}  actual=${(sa/(CW*CH)).toFixed(1)}`);
