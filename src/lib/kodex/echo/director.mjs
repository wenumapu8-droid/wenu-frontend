import {getEpisode,resolveZone} from './corpus.mjs';
/** No independent navigation, persistent memory or truth authority. */
export function createEchoDirector({now=()=>Date.now(),cooldownMs=500}={}){
 const seen=new Set();let lastAt=-Infinity;
 return {
  resolveZone,
  enter(zone,{lang='es',mode='guide',force=false}={}){
   if(!['ambient','guide','read'].includes(mode))return [];
   if(mode==='read'&&!force)return [];
   const key=`${String(zone).toUpperCase()}:${lang}:${mode}`;
   if(!force&&seen.has(key))return [];
   if(!force&&now()-lastAt<cooldownMs)return [];
   const parts=getEpisode(zone,lang,mode);if(!parts.length)return [];
   lastAt=now();seen.add(key);return parts;
  },
  reset(){seen.clear();lastAt=-Infinity;}
 };
}
export function validEchoEvent(e){
 if(!e||e.observed!==true)return false;
 if(!['scene','archive','city','lab','graph','research','system'].includes(e.domain))return false;
 if(!['entered','record-opened','city-opened','transform-complete','node-selected','source-opened','guide-requested','return-recorded'].includes(e.type))return false;
 if(typeof e.id!=='string'||e.id.length>120||!e.id.length)return false;
 if(e.type==='return-recorded'&&(!e.evidence||e.evidence.curated||!Array.isArray(e.evidence.works)||!e.evidence.works.length))return false;
 return true;
}
export function zoneForEvent(e){
 if(!validEchoEvent(e))return null;
 if(e.type==='return-recorded')return 'RETURN';
 const zones={archive:'ARCHIVE',city:'CITY',lab:'LAB',graph:'GRAPH',research:'RESEARCH',system:'THRESHOLD'};
 return zones[e.domain]||(e.domain==='scene'&&String(e.id).toUpperCase())||null;
}
