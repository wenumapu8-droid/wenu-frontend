import test from 'node:test';
import assert from 'node:assert/strict';
import {ECHO_EPISODES,getEpisode,resolveZone} from '../src/lib/kodex/echo/corpus.mjs';
import {createEchoDirector,validEchoEvent,zoneForEvent} from '../src/lib/kodex/echo/director.mjs';
test('seven canonical scenes have ES/EN narration and unique clip IDs',()=>{
 const keys=['THRESHOLD','PROLOGUE','DESCENT','ARCHIVE','MACHINE','COSMOLOGY','RETURN'];
 const all=Object.values(ECHO_EPISODES).flat();
 assert.equal(new Set(all.map(s=>s.id)).size,all.length);
 for(const key of keys){assert.ok(ECHO_EPISODES[key]?.length);assert.ok(ECHO_EPISODES[key].every(s=>s.es&&s.en))}
});
test('ambient uses one line; guide supports multiple segments',()=>{
 assert.equal(getEpisode('PROLOGUE','es','ambient').length,1);
 assert.equal(getEpisode('PROLOGUE','en','guide').length,2);
 assert.match(getEpisode('PROLOGUE','en')[0].url,/\/en\/prologue_01\.mp3$/);
});
test('no unsourced or shop narration',()=>{
 assert.deepEqual(getEpisode('CITY-UNKNOWN'),[]);
 assert.equal(resolveZone('/shop/','THRESHOLD'),null);
 assert.equal(resolveZone('/kodex/lab/observe-v2/'),'LAB');
 assert.equal(resolveZone('/kodex/','#UNKNOWN'),'THRESHOLD');
});
test('cooldown and deduplication avoid repetitive narration',()=>{
 let t=100000;const d=createEchoDirector({now:()=>t,cooldownMs:1000});
 assert.equal(d.enter('PROLOGUE').length,2);
 assert.equal(d.enter('PROLOGUE').length,0);
 assert.equal(d.enter('DESCENT').length,0);
 t+=1001;assert.equal(d.enter('DESCENT').length,1);
});
test('reading only after explicit request',()=>{
 const d=createEchoDirector();
 assert.deepEqual(d.enter('ARCHIVE',{mode:'read'}),[]);
 assert.equal(d.enter('ARCHIVE',{mode:'read',force:true}).length,1);
});
test('verified events gate narratives and memory claims',()=>{
 assert.equal(validEchoEvent({domain:'lab',type:'transform-complete',id:'OBSERVE',observed:false}),false);
 assert.equal(validEchoEvent({domain:'lab',type:'transform-complete',id:'OBSERVE',observed:true}),true);
 assert.equal(zoneForEvent({domain:'lab',type:'transform-complete',id:'OBSERVE',observed:true}),'LAB');
 assert.equal(validEchoEvent({domain:'scene',type:'return-recorded',id:'Y',observed:true,evidence:{curated:true,works:['/kodex/']}}),false);
 assert.equal(validEchoEvent({domain:'scene',type:'return-recorded',id:'Y',observed:true,evidence:{curated:false,works:['/kodex/']}}),true);
});
