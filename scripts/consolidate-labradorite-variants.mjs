#!/usr/bin/env node
// consolidate-labradorite-variants.mjs
// Consolida los plugs de LABRADORITA (mismo material + diseño, distinta medida)
// en UN producto VARIABLE con eje Size, según contrato-variantes-wc.md.
//
// Parent: WM-PLG-015 (Labradorite Stone Plug Collection) — ya tiene la galería rica.
// Variaciones (eje "Size"): 8mm / 10mm / 16mm / 22mm.
//   8mm  <- WM-PLG-032  $40  (RESERVED -> outofstock)
//   10mm <- WM-PLG-034  $60  (RESERVED -> outofstock)   [WC id 1811]
//   16mm <- WM-PLG-023  $85  (RESERVED -> outofstock)   [WC id 2711]
//   22mm <- WM-PLG-028  $95  (RESERVED -> outofstock)
//
// Acciones (todas reversibles, ADITIVAS salvo el draft de los hijos):
//   1. PUT WM-PLG-015 -> type=variable + attribute Size (variation:true) con las 4 medidas.
//   2. POST variations 8/10/16/22 con precio + stock_status (sku propio del hijo).
//   3. Los productos simples hijos (WM-PLG-023 id 2711, WM-PLG-034 id 1811) -> status=draft
//      (NO se borran; quedan como referencia/redirect). Sus SKU se mueven a la variación.
//
// Dry-run por default. --apply para ejecutar. --skip-drafts para no despublicar hijos.
//
// Log: /Users/user1/wenu-frontend/logs/consolidate-labradorite-YYYYMMDD-HHMMSS.json

import fs from 'node:fs';
import path from 'node:path';

const FE_ENV='/Users/user1/wenu-frontend/.env';
const LOG_DIR='/Users/user1/wenu-frontend/logs';
const WC_BASE='https://www.wenumapuonline.com';
const APPLY=process.argv.includes('--apply');
const SKIP_DRAFTS=process.argv.includes('--skip-drafts');
const MODE=APPLY?'APPLY':'DRY-RUN';

function loadEnv(p){const o={};for(const l of fs.readFileSync(p,'utf8').split('\n')){const m=l.match(/^([A-Z0-9_]+)=(.*)$/);if(!m)continue;let v=m[2];if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1);o[m[1]]=v;}return o;}
const fe=loadEnv(FE_ENV);
const WC_AUTH='Basic '+Buffer.from(`${fe.WC_CONSUMER_KEY}:${fe.WC_CONSUMER_SECRET}`).toString('base64');

const PARENT_ID=1826; // WM-PLG-015
const VARIANTS=[
  { size:'8mm',  sku:'WM-PLG-032', price:'40', stock:'outofstock' },
  { size:'10mm', sku:'WM-PLG-034', price:'60', stock:'outofstock', child_id:1811 },
  { size:'16mm', sku:'WM-PLG-023', price:'85', stock:'outofstock', child_id:2711 },
  { size:'22mm', sku:'WM-PLG-028', price:'95', stock:'outofstock' },
];

async function wc(method,pathq,body){
  const r=await fetch(`${WC_BASE}/wp-json/wc/v3/${pathq}`,{method,headers:{Authorization:WC_AUTH,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
  const txt=await r.text();
  if(!r.ok) throw new Error(`${method} ${pathq} -> ${r.status} ${txt.slice(0,300)}`);
  return JSON.parse(txt);
}
function ts(){const d=new Date(),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;}

(async()=>{
  fs.mkdirSync(LOG_DIR,{recursive:true});
  const log={started:new Date().toISOString(),mode:MODE,steps:[]};
  console.log(`\n=== consolidate-labradorite-variants [${MODE}] ===\n`);

  // snapshot parent
  const before=await wc('GET',`products/${PARENT_ID}?_fields=id,sku,name,type,price,attributes,images,status`);
  log.parent_before={id:before.id,sku:before.sku,type:before.type,status:before.status,nimg:(before.images||[]).length,attributes:before.attributes};
  console.log(`Parent ${before.sku} (${before.id}) type=${before.type} status=${before.status} imgs=${(before.images||[]).length}`);
  if(before.type==='variable') console.log('  (ya es variable — se actualizarán/crearán variaciones)');

  // build Size attribute preserving existing attributes
  const existingAttrs=(before.attributes||[]).filter(a=>!/^(size|gauge|talle|medida)$/i.test(a.name||''));
  const sizeAttr={ name:'Size', visible:true, variation:true, options:VARIANTS.map(v=>v.size) };
  const newAttrs=[...existingAttrs.map(a=>({id:a.id,name:a.name,options:a.options,visible:a.visible,variation:a.variation})), sizeAttr];

  // step 1: make variable
  const step1={action:'PUT parent -> variable + Size attribute', size_options:sizeAttr.options};
  if(APPLY){
    const up=await wc('PUT',`products/${PARENT_ID}`,{type:'variable',attributes:newAttrs});
    step1.result='ok'; step1.type_now=up.type;
  }else step1.result='planned';
  log.steps.push(step1);
  console.log(`[${step1.result}] set variable + Size=[${sizeAttr.options.join(', ')}]`);

  // step 2: FIRST draft the child simples + free their SKU (para no colisionar con la variación)
  if(!SKIP_DRAFTS){
    for(const v of VARIANTS.filter(x=>x.child_id)){
      const dstep={action:'child simple -> draft + sku->legacy',child_id:v.child_id,sku:v.sku};
      if(APPLY){
        try{ await wc('PUT',`products/${v.child_id}`,{status:'draft',sku:`${v.sku}-legacy`}); dstep.result='ok'; }
        catch(e){ dstep.result='error'; dstep.error=e.message; }
      }else dstep.result='planned';
      log.steps.push(dstep);
      console.log(`  [${dstep.result}] child ${v.sku} (${v.child_id}) -> draft, sku->${v.sku}-legacy ${dstep.error||''}`);
    }
  }

  // step 3: variations (ahora los SKU están libres)
  for(const v of VARIANTS){
    const vstep={action:'create variation',size:v.size,sku:v.sku,price:v.price,stock:v.stock};
    if(APPLY){
      try{
        const created=await wc('POST',`products/${PARENT_ID}/variations`,{
          regular_price:v.price, sku:v.sku, status:'publish',
          stock_status:v.stock, manage_stock:false,
          attributes:[{name:'Size',option:v.size}],
        });
        vstep.result='ok'; vstep.variation_id=created.id;
      }catch(e){ vstep.result='error'; vstep.error=e.message; }
    }else vstep.result='planned';
    log.steps.push(vstep);
    console.log(`  [${vstep.result}] variation Size=${v.size} sku=${v.sku} $${v.price} ${v.stock} ${vstep.error||''}`);
  }

  log.finished=new Date().toISOString();
  const lp=path.join(LOG_DIR,`consolidate-labradorite-${ts()}.json`);
  fs.writeFileSync(lp,JSON.stringify(log,null,2));
  console.log(`\nLog: ${lp}\nMode: ${MODE}. ${APPLY?'':'Usa --apply para ejecutar.'}\n`);
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
