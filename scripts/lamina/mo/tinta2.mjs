import sharp from "sharp";
const load = async (f) => { const {data,info}=await sharp(f).raw().toBuffer({resolveWithObject:true}); return {data,W:info.width,C:info.channels}; };
const a=await load("scripts/lamina/out/mycelial-oracle/actual.png"), r=await load("reference/pendientes/mycelial-oracle.png");
const lum=(o,x,y)=>{const i=(y*o.W+x)*o.C;return 0.299*o.data[i]+0.587*o.data[i+1]+0.114*o.data[i+2];};
const zonas = JSON.parse(process.argv[2]);
for (const [n,[x,y,w,h]] of Object.entries(zonas)) {
  let ta=0,tr=0,sa=0,sr=0,c=0;
  for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++){const la=lum(a,i,j),lr=lum(r,i,j);if(la>26)ta++;if(lr>26)tr++;sa+=la;sr+=lr;c++;}
  console.log(`${n.padEnd(16)} tinta act ${String(ta).padStart(7)} ref ${String(tr).padStart(7)}  (${(100*ta/(tr||1)).toFixed(0)}%)   lum act ${(sa/c).toFixed(1)} ref ${(sr/c).toFixed(1)}`);
}
