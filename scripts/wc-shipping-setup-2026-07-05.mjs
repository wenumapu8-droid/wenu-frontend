#!/usr/bin/env node
/** Configura envíos WooCommerce (aprobado owner: rentable, nada gratis salvo pickup Truckee).
 *  US: flat $6.50 + Local pickup gratis (quita Free shipping). Internacional: $30 sin tracking / $60 tracked.
 *  DRY-RUN por default. --apply para escribir. Backup reversible. */
import fs from 'node:fs'; import path from 'node:path';
const APPLY = process.argv.includes('--apply');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
for (const l of fs.readFileSync(path.join(ROOT,'.env'),'utf8').split('\n')){const m=l.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);if(m&&process.env[m[1]]===undefined){let v=m[2];if(/^["'].*["']$/.test(v))v=v.slice(1,-1);process.env[m[1]]=v;}}
const WC=process.env.WC_URL||'https://www.wenumapuonline.com/wp-json/wc/v3';
const auth=`consumer_key=${encodeURIComponent(process.env.WC_CONSUMER_KEY)}&consumer_secret=${encodeURIComponent(process.env.WC_CONSUMER_SECRET)}`;
const api=async(method,p,body)=>{const r=await fetch(`${WC}${p}${p.includes('?')?'&':'?'}${auth}`,{method,headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});const j=await r.json().catch(()=>({}));if(!r.ok)console.log(`   ! ${method} ${p} -> ${r.status} ${JSON.stringify(j).slice(0,120)}`);return j;};
const log=console.log;

(async()=>{
  log(`\n=== SHIPPING SETUP · ${APPLY?'APPLY':'DRY-RUN'} ===\n`);
  const zones=await api('GET','/shipping/zones');
  // backup
  const backup={ts:new Date().toISOString(),zones:[]};
  for(const z of [...zones,{id:0,name:'Rest of World'}]){backup.zones.push({id:z.id,name:z.name,methods:await api('GET',`/shipping/zones/${z.id}/methods`)});}
  const bdir=path.join(ROOT,'data','backups');fs.mkdirSync(bdir,{recursive:true});
  const bpath=path.join(bdir,`wc-shipping-2026-07-05-${Date.now()}.json`);fs.writeFileSync(bpath,JSON.stringify(backup,null,2));
  log(`backup -> ${bpath}\n`);

  const usZone=zones.find(z=>/Estados Unidos|United States/i.test(z.name));
  log(`US zone id=${usZone?usZone.id:'NOT FOUND'}`);

  // helper: create flat_rate with title+cost
  const addFlat=async(zoneId,title,cost)=>{
    if(!APPLY){log(`   would add flat_rate "${title}" $${cost} to zone ${zoneId}`);return;}
    const created=await api('POST',`/shipping/zones/${zoneId}/methods`,{method_id:'flat_rate'});
    const iid=created.instance_id;
    if(!iid){log(`   ! failed create in zone ${zoneId}`);return;}
    await api('PUT',`/shipping/zones/${zoneId}/methods/${iid}`,{enabled:true,settings:{title,cost:String(cost)}});
    log(`   ✓ flat_rate "${title}" $${cost} (instance ${iid}) zona ${zoneId}`);
  };

  // 1) US zone: disable Free shipping, add flat $6.50 (keep local pickup)
  if(usZone){
    const methods=await api('GET',`/shipping/zones/${usZone.id}/methods`);
    for(const m of methods){
      if(m.method_id==='free_shipping'&&m.enabled){
        if(APPLY){await api('PUT',`/shipping/zones/${usZone.id}/methods/${m.instance_id}`,{enabled:false});log(`   ✓ Free shipping DESACTIVADO (US)`);}
        else log(`   would disable Free shipping (US)`);
      }
      if(m.method_id==='local_pickup')log(`   (mantengo Local pickup gratis, instance ${m.instance_id})`);
    }
    const hasFlat=methods.some(m=>m.method_id==='flat_rate');
    if(!hasFlat)await addFlat(usZone.id,'US Shipping — USPS Ground Advantage',6.5);
    else log('   (US ya tiene flat_rate, no duplico)');
  }

  // 2) Rest of World (zone 0): two intl rates
  const row=await api('GET','/shipping/zones/0/methods');
  const rowHasIntl=Array.isArray(row)&&row.some(m=>m.method_id==='flat_rate');
  if(!rowHasIntl){
    await addFlat(0,'International — Standard (no tracking, 1–4 wks)',30);
    await addFlat(0,'International — Tracked & insured (Priority)',60);
  } else log('   (Rest of World ya tiene flat_rate, no duplico)');

  log(`\n=== done. revert desde ${path.basename(bpath)} ===\n`);
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
