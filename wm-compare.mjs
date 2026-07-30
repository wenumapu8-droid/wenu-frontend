import fs from 'node:fs'; import sharp from 'sharp';
const rows = fs.readFileSync('/tmp/catalog-scan/rows.tsv','utf8').trim().split('\n').map(l=>l.split('\t'));
const coverBySku = Object.fromEntries(rows.map(r=>[r[1],r[3]]));
const manifest = JSON.parse(fs.readFileSync('/tmp/catalog-scan/opts/manifest.json','utf8'));
const skus = Object.keys(manifest);
const cell=300, pad=8, labelH=30, cols=3;
const H = skus.length*(cell+labelH+pad)+pad, W = cols*(cell+pad)+pad;
const comp=[];
const label=(x,y,txt,color)=>({input:Buffer.from(`<svg width="${cell}" height="${labelH}"><rect width="100%" height="100%" fill="#000"/><text x="6" y="21" font-family="sans-serif" font-size="17" fill="${color}">${txt}</text></svg>`),left:x,top:y});
async function cellImg(srcOrFile,x,y,isUrl){
  try{
    const buf = isUrl ? Buffer.from(await (await fetch(srcOrFile)).arrayBuffer()) : fs.readFileSync(srcOrFile);
    const img = await sharp(buf).resize(cell,cell,{fit:'contain',background:'#141414'}).toBuffer();
    comp.push({input:img,left:x,top:y});
  }catch(e){}
}
let r=0;
for(const sku of skus){
  const y=pad+r*(cell+labelH+pad);
  // col0 = actual cover
  await cellImg(coverBySku[sku],pad,y,true);
  comp.push(label(pad,y+cell,`${sku} · ACTUAL ✗`,'#e05a4a'));
  // options
  const opts=manifest[sku];
  for(let i=0;i<opts.length && i<2;i++){
    const x=pad+(i+1)*(cell+pad);
    await cellImg(opts[i],x,y,false);
    comp.push(label(x,y+cell,`OPCIÓN ${i+1} (macro)`,'#8ac96a'));
  }
  r++;
}
await sharp({create:{width:W,height:H,channels:3,background:'#000'}}).composite(comp).jpeg({quality:84}).toFile('/tmp/catalog-scan/compare.jpg');
console.log('OK',skus.length,'filas',W+'x'+H);
