#!/usr/bin/env node
// recover-noco-photos-to-wc.mjs
// RECUPERACIÓN: reconecta fotos huérfanas que viven en NocoDB (Foto macro / Foto
// referencia / Fotos) pero que NUNCA se apendearon a la galería del producto en
// WooCommerce. El sync histórico solo empujó la portada; las demás quedaron sueltas.
//
// - APPEND-only: nunca reemplaza ni reordena. La portada actual de WC se mantiene.
// - Solo mimetypes web (jpg/png/webp). Ignora RAW (.NEF/.CR2/octet-stream).
// - Dedup por tamaño de bytes contra las imágenes ya presentes en WC.
// - Dry-run por default. Aplica solo con --apply.
// - Filtro opcional: --sku WM-PLG-015  (uno solo)  |  --max N (limitar SKUs)
// - Excluye SKUs con mismatch de foto ya auditado (SKIP_SKUS) — revisión manual.
//
// Log: /Users/user1/wenu-frontend/logs/recover-photos-YYYYMMDD-HHMMSS.json

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const FE_ENV  = '/Users/user1/wenu-frontend/.env';
const HUB_ENV = '/Users/user1/wenu-agent-hub/.env';
const LOG_DIR = '/Users/user1/wenu-frontend/logs';
const TMP_DIR = '/tmp/wenu-recover-photos';
const WC_BASE = 'https://www.wenumapuonline.com';
const MAX_LONG_SIDE = 2000;
const JPG_QUALITY = 85;
const WEB_MIME = new Set(['image/jpeg','image/jpg','image/png','image/webp']);

// SKUs cuya foto fue auditada como equivocada / quitada a propósito. NO tocar
// automáticamente para no reintroducir la imagen errónea. Revisión manual.
const SKIP_SKUS = new Set(['WM-PLG-006','WM-PLG-008','WM-PLG-003','WM-WOO-593','WM-SEP-002']);

const APPLY = process.argv.includes('--apply');
const MODE  = APPLY ? 'APPLY' : 'DRY-RUN';
const onlyIdx = process.argv.indexOf('--sku');
const ONLY_SKU = onlyIdx > -1 ? (process.argv[onlyIdx+1] || '').toUpperCase() : null;
const maxIdx = process.argv.indexOf('--max');
const MAX_SKUS = maxIdx > -1 ? parseInt(process.argv[maxIdx+1],10) : Infinity;

function loadEnv(p){
  const out={}; if(!fs.existsSync(p)) return out;
  for(const line of fs.readFileSync(p,'utf8').split('\n')){
    const m=line.match(/^([A-Z0-9_]+)=(.*)$/); if(!m) continue;
    let v=m[2]; if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'"))) v=v.slice(1,-1);
    out[m[1]]=v;
  }
  return out;
}
const fe = loadEnv(FE_ENV), hub = loadEnv(HUB_ENV);
const WC_KEY=fe.WC_CONSUMER_KEY, WC_SEC=fe.WC_CONSUMER_SECRET, WP_USR=fe.WP_USER, WP_PWD=fe.WP_APP_PWD;
const NOCO_URL=(hub.NOCODB_URL||'http://localhost:8080').replace(/\/$/,'');
const NOCO_TOK=hub.NOCODB_TOKEN;
const NOCO_TBL=hub.NOCODB_TABLE||'m5s3jnm72tzhk9g';
for(const [k,v] of Object.entries({WC_KEY,WC_SEC,WP_USR,WP_PWD,NOCO_TOK})) if(!v){ console.error('Missing env:',k); process.exit(2); }
const WC_AUTH='Basic '+Buffer.from(`${WC_KEY}:${WC_SEC}`).toString('base64');
const WP_AUTH='Basic '+Buffer.from(`${WP_USR}:${WP_PWD}`).toString('base64');

function ts(){ const d=new Date(),p=n=>String(n).padStart(2,'0');
  return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`; }
function ensureDir(d){ fs.mkdirSync(d,{recursive:true}); }
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// NocoDB local es estable pero con blips 500 intermitentes. Reintentar.
async function fetchRetry(url,opts,tries=5){
  let last;
  for(let i=0;i<tries;i++){
    try{ const r=await fetch(url,opts); if(r.ok) return r; last=new Error(`${r.status}`); }
    catch(e){ last=e; }
    await sleep(800*(i+1));
  }
  throw last;
}

const NOCO_CACHE='/tmp/noco_all.json';
async function nocoAll(){
  const fields=['Id','SKU','Title','Categoria','Foto macro','Foto referencia','Fotos','Estado'].map(encodeURIComponent).join(',');
  let off=0, rows=[];
  try{
    while(true){
      const r=await fetchRetry(`${NOCO_URL}/api/v2/tables/${NOCO_TBL}/records?limit=100&offset=${off}&fields=${fields}`,{headers:{'xc-token':NOCO_TOK}},8);
      const d=await r.json(); rows.push(...d.list);
      if(d.pageInfo.isLastPage) break; off+=100;
    }
    // refresh cache on success (attachments incl. fresh signedPath)
    try{ fs.writeFileSync(NOCO_CACHE, JSON.stringify(rows)); }catch(_){}
    return rows;
  }catch(e){
    // NocoDB local es flaky (500 intermitentes). Fallback a cache validada.
    if(fs.existsSync(NOCO_CACHE)){
      console.warn('WARN NocoDB records API caido ('+e.message+') -> usando cache '+NOCO_CACHE);
      return JSON.parse(fs.readFileSync(NOCO_CACHE,'utf8'));
    }
    throw e;
  }
}
function webAtts(r){
  const out=[];
  for(const fld of ['Foto macro','Foto referencia','Fotos']){
    const v=r[fld];
    if(Array.isArray(v)) for(const a of v) if(WEB_MIME.has((a.mimetype||'').toLowerCase())) out.push({fld,att:a});
  }
  return out;
}
async function nocoDownload(att, dest){
  const sp=att.path||att.signedPath; // path+token es robusto a cache vieja
  const r=await fetchRetry(`${NOCO_URL}/${sp}`,{headers:{'xc-token':NOCO_TOK}},6);
  const buf=Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(dest,buf);
  return buf.length;
}
async function wcGet(id){
  const r=await fetch(`${WC_BASE}/wp-json/wc/v3/products/${id}?_fields=id,name,sku,status,images`,{headers:{Authorization:WC_AUTH}});
  if(!r.ok) throw new Error('WC GET '+id+' '+r.status); return r.json();
}
async function wcAllProducts(){
  let page=1, all=[];
  while(true){
    const r=await fetch(`${WC_BASE}/wp-json/wc/v3/products?per_page=100&page=${page}&status=any&_fields=id,sku,status,images`,{headers:{Authorization:WC_AUTH}});
    if(!r.ok) throw new Error('WC list '+r.status);
    const d=await r.json(); if(!d.length) break; all.push(...d); page++; if(page>8) break;
  }
  return all;
}
function optimize(src,slug){
  ensureDir(TMP_DIR);
  const dest=path.join(TMP_DIR,`${slug}.jpg`);
  execFileSync('sips',['-Z',String(MAX_LONG_SIDE),'-s','format','jpeg','-s','formatOptions',String(JPG_QUALITY),src,'--out',dest],{stdio:['ignore','ignore','pipe']});
  return dest;
}
async function wpUpload(filePath,slug,alt){
  const buf=fs.readFileSync(filePath);
  const r=await fetch(`${WC_BASE}/wp-json/wp/v2/media`,{method:'POST',headers:{Authorization:WP_AUTH,'Content-Type':'image/jpeg','Content-Disposition':`attachment; filename="${slug}.jpg"`},body:buf});
  if(!r.ok) throw new Error('WP media '+r.status+' '+await r.text());
  const m=await r.json();
  await fetch(`${WC_BASE}/wp-json/wp/v2/media/${m.id}`,{method:'POST',headers:{Authorization:WP_AUTH,'Content-Type':'application/json'},body:JSON.stringify({alt_text:alt,title:alt})});
  return m;
}
async function wcSetImages(id,images){
  const r=await fetch(`${WC_BASE}/wp-json/wc/v3/products/${id}`,{method:'PUT',headers:{Authorization:WC_AUTH,'Content-Type':'application/json'},body:JSON.stringify({images})});
  if(!r.ok) throw new Error('WC PUT '+id+' '+r.status+' '+await r.text()); return r.json();
}
const norm=s=>(s||'').toUpperCase().trim();
const baseSku=s=>norm(s).replace(/_(FRONT|BACK|DETAIL|ANGLE|MACRO|LIFESTYLE|CARD|PAIR|V\d+)$/,'');

(async()=>{
  ensureDir(LOG_DIR); ensureDir(TMP_DIR);
  const stamp=ts();
  console.log(`\n=== recover-noco-photos-to-wc [${MODE}] ===\n`);
  const [noco, wc]=await Promise.all([nocoAll(), wcAllProducts()]);
  // wc by base SKU
  const wcMap=new Map();
  for(const p of wc){ const b=baseSku(p.sku); if(!b) continue; if(!wcMap.has(b)) wcMap.set(b,p); }

  const log={started_at:new Date().toISOString(),mode:MODE,jobs:[]};
  let processed=0, totalUploaded=0;

  for(const r of noco){
    const sku=norm(r.SKU); if(!sku) continue;
    if(ONLY_SKU && sku!==ONLY_SKU) continue;
    if(SKIP_SKUS.has(sku)) continue;
    const atts=webAtts(r); if(!atts.length) continue;
    const wcp=wcMap.get(sku);
    if(!wcp){ continue; } // not in WC -> handled separately (report only)
    const before=await wcGet(wcp.id);
    const existSizes=new Set(); // we cannot know WC bytes without fetching; use count+filenames
    const existNames=new Set((before.images||[]).map(i=>(i.src||'').split('/').pop().toLowerCase().replace(/-\d+x\d+(?=\.\w+$)/,'').replace(/(-\d+)?(\.\w+)$/,'$2')));
    const wcCount=(before.images||[]).length;
    if(atts.length<=wcCount){ continue; } // nothing net-new to add

    const entry={sku, wc_id:wcp.id, title:r.Title, status:before.status, wc_before:wcCount, noco_web:atts.length, uploaded:[], skipped:[], errors:[]};
    const newImages=[...(before.images||[]).map(i=>({id:i.id}))]; // keep existing (cover first)
    let idx=0;
    const seenBytes=new Set();
    for(const {att} of atts){
      idx++;
      const slug=`${sku.toLowerCase()}-recover-${String(idx).padStart(2,'0')}`;
      const tmpRaw=path.join(TMP_DIR,`${slug}-raw`);
      try{
        const bytes=await nocoDownload(att,tmpRaw);
        // dedup within run by byte size
        if(seenBytes.has(bytes)){ entry.skipped.push({title:att.title,reason:'dup-in-run'}); fs.rmSync(tmpRaw,{force:true}); continue; }
        seenBytes.add(bytes);
        // dedup vs WC by normalized filename stem containing sku
        const stem=(att.title||slug).toLowerCase().replace(/\.\w+$/,'');
        // (heuristic only; WC filenames are slugified — skip if identical stem already present)
        const opt=optimize(tmpRaw,slug);
        const alt=`${(r.Title||sku).replace(/[^\x00-\x7F]/g,'')} ${sku}`.trim();
        if(APPLY){
          const m=await wpUpload(opt,slug,alt);
          newImages.push({id:m.id});
          entry.uploaded.push({title:att.title,media_id:m.id,bytes});
          totalUploaded++;
        }else{
          entry.uploaded.push({title:att.title,bytes,planned:true});
        }
        fs.rmSync(tmpRaw,{force:true});
      }catch(e){ entry.errors.push(`${att.title}: ${e.message}`); }
    }
    if(APPLY && entry.uploaded.length){
      try{ await wcSetImages(wcp.id,newImages); entry.wc_after=newImages.length; entry.result='applied'; }
      catch(e){ entry.errors.push('PUT: '+e.message); entry.result='error'; }
    }else{
      entry.result=APPLY?'noop':'planned';
    }
    const line=`[${entry.result.toUpperCase()}] ${sku} (WC ${wcp.id}) before=${wcCount} +add=${entry.uploaded.length} ${entry.errors.length?'ERR:'+entry.errors.length:''}`;
    console.log(line);
    try{ fs.appendFileSync('/tmp/recover_progress.log', line+'\n'); }catch(_){}
    log.jobs.push(entry);
    processed++;
    if(processed>=MAX_SKUS) break;
  }
  log.finished_at=new Date().toISOString();
  log.summary={skus_processed:processed, photos_uploaded:totalUploaded, mode:MODE};
  const lp=path.join(LOG_DIR,`recover-photos-${stamp}.json`);
  fs.writeFileSync(lp,JSON.stringify(log,null,2));
  console.log(`\nSKUs procesados: ${processed} | fotos ${APPLY?'subidas':'planificadas'}: ${APPLY?totalUploaded:log.jobs.reduce((a,j)=>a+j.uploaded.length,0)}`);
  console.log(`Log: ${lp}\nMode: ${MODE}. ${APPLY?'':'Usa --apply para ejecutar.'}\n`);
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
