import fs from 'node:fs'; import sharp from 'sharp';
const manifest = JSON.parse(fs.readFileSync('/tmp/catalog-scan/opts/manifest.json','utf8'));
const entries=[];
for(const [sku,files] of Object.entries(manifest)) files.forEach((f,i)=>entries.push({sku,file:f,opt:i+1,n:files.length}));
const cell=280, cols=4, pad=8, labelH=28;
const rowsN=Math.ceil(entries.length/cols);
const W=cols*(cell+pad)+pad, H=rowsN*(cell+labelH+pad)+pad;
const comp=[];
for(let k=0;k<entries.length;k++){
  const e=entries[k], c=k%cols, r=Math.floor(k/cols);
  const x=pad+c*(cell+pad), y=pad+r*(cell+labelH+pad);
  try{ const img=await sharp(fs.readFileSync(e.file)).resize(cell,cell,{fit:'contain',background:'#141414'}).toBuffer(); comp.push({input:img,left:x,top:y}); }catch(err){}
  const lbl=e.n>1?`${e.sku} · opción ${e.opt}`:`${e.sku}`;
  comp.push({input:Buffer.from(`<svg width="${cell}" height="${labelH}"><rect width="100%" height="100%" fill="#000"/><text x="5" y="20" font-family="sans-serif" font-size="16" fill="#8ac96a">${lbl}</text></svg>`),left:x,top:y+cell});
}
await sharp({create:{width:W,height:H,channels:3,background:'#000'}}).composite(comp).jpeg({quality:85}).toFile('/tmp/catalog-scan/options.jpg');
console.log('OK',entries.length,'opciones',W+'x'+H);
