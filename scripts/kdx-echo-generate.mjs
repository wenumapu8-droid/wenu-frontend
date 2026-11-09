#!/usr/bin/env node
/** Authorized build-time render. No ELEVENLABS_API_KEY may appear in client code. */
import {mkdir,writeFile,access} from 'node:fs/promises';
import {join} from 'node:path';
import {ECHO_EPISODES} from '../src/lib/kodex/echo/corpus.mjs';
const args=process.argv.slice(2);
const get=flag=>args.includes(flag)?args[args.indexOf(flag)+1]:undefined;
const locale=get('--lang')||'es',only=get('--only');
const dry=args.includes('--dry-run'),all=args.includes('--all'),approved=args.includes('--confirm-spend');
if(!['es','en','both'].includes(locale))throw new Error('--lang must be es, en or both');
if(!dry&&!only&&!(all&&approved))throw new Error('Paid batch blocked. Use --only <id> or --all --confirm-spend.');
if(!dry&&!process.env.ELEVENLABS_API_KEY)throw new Error('ELEVENLABS_API_KEY missing');
if(!dry&&!process.env.ELEVENLABS_VOICE_ID)throw new Error('ELEVENLABS_VOICE_ID missing');
const items=Object.values(ECHO_EPISODES).flat().filter(x=>!only||x.id===only);
if(only&&!items.length)throw new Error(`Unknown clip id: ${only}`);
const langs=locale==='both'?['es','en']:[locale];
let count=0;
for(const clip of items){
 for(const lang of langs){
  const target=join('public','audio','kodex','echo',lang,`${clip.id}.mp3`);
  if(dry){console.log(`DRY ${clip.id} ${lang} ${clip[lang].length} characters -> ${target}`);continue}
  try{await access(target);console.log(`SKIP existing ${target}`);continue}catch{}
  const resp=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(process.env.ELEVENLABS_VOICE_ID)}?output_format=mp3_44100_128`,{
   method:'POST',headers:{'xi-api-key':process.env.ELEVENLABS_API_KEY,'Content-Type':'application/json','Accept':'audio/mpeg'},
   body:JSON.stringify({text:clip[lang],model_id:process.env.ELEVENLABS_MODEL_ID||'eleven_multilingual_v2',voice_settings:{stability:.6,similarity_boost:.75,style:.12,use_speaker_boost:true}})
  });
  if(!resp.ok)throw new Error(`ElevenLabs ${resp.status}: ${String(await resp.text()).slice(0,500)}`);
  await mkdir(join('public','audio','kodex','echo',lang),{recursive:true});
  await writeFile(target,Buffer.from(await resp.arrayBuffer()));
  console.log(`RENDERED ${target}`);count++;
 }
}
console.log(dry?'No credits spent.':`${count} audio files saved.`);
