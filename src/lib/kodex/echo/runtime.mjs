import {createEchoDirector,zoneForEvent} from './director.mjs';
import {resolveZone} from './corpus.mjs';
const KEY='kdx-echo-prefs-v1',EVENT='kdx:echo-event';
const changed=(active,id=null)=>window.dispatchEvent(new CustomEvent('kdx:echo-speaking',{detail:{active,id}}));

/** Reusable client narrator. Never sends private content or API credentials. */
export function mountEcho(){
 if(typeof window==='undefined'||!/^\/kodex(?:\/|$)/.test(location.pathname))return null;
 if(window.kdxEcho)return window.kdxEcho;
 const root=document.querySelector('[data-kdx-echo]');if(!root)return null;
 const $=s=>root.querySelector(s);
 const c={toggle:$('[data-echo-toggle]'),pause:$('[data-echo-pause]'),mode:$('[data-echo-mode]'),lang:$('[data-echo-lang]'),cc:$('[data-echo-cc]'),caption:$('[data-echo-caption]'),status:$('[data-echo-status]'),preview:$('[data-echo-preview]')};
 let stored={};try{stored=JSON.parse(localStorage.getItem(KEY)||'{}')}catch{}
 const state={enabled:false,paused:false,mode:['ambient','guide','read'].includes(stored.mode)?stored.mode:'guide',lang:stored.lang==='en'?'en':'es',cc:stored.cc!==false,preview:stored.preview===true};
 const director=createEchoDirector();
 const audio=document.createElement('audio');audio.preload='none';root.append(audio);
 let context=null,analyser=null,bins=null,raf=0,seq=[],current=null,spoken=false,voiceActive=false,observer=null;
 const signal={active:false,level:0,low:0,mid:0,high:0};window.__kdxEchoSignal=signal;
 const status=s=>{c.status.textContent=s};
 const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify({mode:state.mode,lang:state.lang,cc:state.cc,preview:state.preview}))}catch{}};
 const sync=()=>{
  c.toggle.setAttribute('aria-pressed',String(state.enabled));c.toggle.textContent=state.enabled?'ECHO · ON':'ECHO · OFF';
  c.pause.disabled=!state.enabled;c.pause.textContent=state.paused?'REANUDAR':'PAUSA';
  c.cc.setAttribute('aria-pressed',String(state.cc));c.cc.textContent=state.cc?'CC · ON':'CC · OFF';
  c.mode.value=state.mode;c.lang.value=state.lang;c.preview.checked=state.preview;
  if(!state.cc)c.caption.hidden=true;
 };
 function tick(){
  if(!signal.active)return;
  if(analyser&&bins){
   analyser.getByteFrequencyData(bins);
   const avg=(a,b)=>{let total=0;for(let i=a;i<b;i++)total+=bins[i];return total/Math.max(1,b-a)/255};
   const a=Math.floor(bins.length*.12),b=Math.floor(bins.length*.48);
   signal.low=avg(1,a);signal.mid=avg(a,b);signal.high=avg(b,bins.length);
   signal.level=Math.min(1,signal.low*.3+signal.mid*.5+signal.high*.2);
  }
  document.documentElement.style.setProperty('--kdx-echo-level',String(signal.level));
  raf=requestAnimationFrame(tick);
 }
 function active(v){
  if(voiceActive===v)return;voiceActive=v;signal.active=v;
  if(v)tick();else{cancelAnimationFrame(raf);signal.level=signal.low=signal.mid=signal.high=0;document.documentElement.style.setProperty('--kdx-echo-level','0')}
  changed(v,current?.id||null);
 }
 async function wireAudio(){
  if(context||!(window.AudioContext||window.webkitAudioContext))return;
  try{
   context=new (window.AudioContext||window.webkitAudioContext)();
   const src=context.createMediaElementSource(audio);analyser=context.createAnalyser();
   analyser.fftSize=1024;analyser.smoothingTimeConstant=.8;bins=new Uint8Array(analyser.frequencyBinCount);
   src.connect(analyser);analyser.connect(context.destination);
  }catch{context=null;analyser=null}
 }
 function cancelCurrent(){
  audio.pause();audio.removeAttribute('src');audio.load();
  window.speechSynthesis?.cancel();spoken=false;active(false);current=null;
 }
 function stop(){seq=[];cancelCurrent();status(state.enabled?'LISTA':'SILENCIO')}
 function caption(cue){c.caption.hidden=!state.cc;c.caption.textContent=state.cc?cue.text:''}
 function advance(){
  active(false);spoken=false;
  if(!state.enabled||state.paused)return;
  const next=seq.shift();if(!next){status('ESCUCHA FINALIZADA');return}
  void play(next);
 }
 function localPreview(cue){
  if(!('speechSynthesis' in window)){status('AUDIO PENDIENTE · SUBTÍTULOS');return}
  const u=new SpeechSynthesisUtterance(cue.text);u.lang=cue.lang==='en'?'en-US':'es-ES';u.rate=.87;u.pitch=.93;
  u.onstart=()=>{spoken=true;active(true);status('VISTA PREVIA · VOZ DEL NAVEGADOR')};
  u.onend=advance;u.onerror=()=>{active(false);status('AUDIO NO DISPONIBLE')};
  window.speechSynthesis.speak(u);
 }
 async function play(cue){
  current=cue;caption(cue);status('PREPARANDO VOZ');
  if(!state.enabled||state.paused)return;
  try{
   await wireAudio();await context?.resume();
   audio.src=cue.url;audio.volume=.92;await audio.play();
   spoken=true;active(true);status('TRANSMITIENDO · ECHO');
  }catch{
   audio.pause();audio.removeAttribute('src');audio.load();
   if(state.preview)localPreview(cue);else status('AUDIO AÚN NO GENERADO · SUBTÍTULOS');
  }
 }
 function queue(items){
  if(!items.length)return false;
  seq=items.slice();cancelCurrent();
  if(state.enabled&&!state.paused)advance();else{caption(seq[0]);status('ACTIVA ECHO PARA ESCUCHAR')}
  return true;
 }
 function observedZone(){
  const kx=document.querySelector('[data-kx]');
  const slide=kx?.querySelector('.kx-slide.kx-active')?.id||kx?.dataset.stageName;
  return resolveZone(location.pathname,slide);
 }
 function enter(zone,{force=false}={}){
  if(!state.enabled||state.paused)return false;
  return queue(director.enter(zone,{lang:state.lang,mode:state.mode,force}));
 }
 function onEvent(ev){
  const zone=zoneForEvent(ev.detail);if(!zone||state.mode==='read')return;
  enter(zone);
 }
 window.addEventListener(EVENT,onEvent);
 let lastZone=observedZone();
 function onSceneChange(){const zone=observedZone();if(zone&&zone!==lastZone){lastZone=zone;enter(zone)}}
 const deck=document.querySelector('[data-kx]');
 if(deck){observer=new MutationObserver(onSceneChange);deck.querySelectorAll('.kx-slide').forEach(s=>observer.observe(s,{attributes:true,attributeFilter:['class']}))}
 const onHash=()=>onSceneChange();window.addEventListener('hashchange',onHash);
 const onVisibility=()=>{if(document.hidden){cancelCurrent();state.paused=true;sync()}};
 const onPageHide=()=>cancelCurrent();
 document.addEventListener('visibilitychange',onVisibility);window.addEventListener('pagehide',onPageHide);
 audio.addEventListener('ended',advance);
 c.toggle.addEventListener('click',()=>{
  state.enabled=!state.enabled;state.paused=false;
  if(state.enabled){status('ECHO ACTIVADA');const zone=observedZone();if(zone&&state.mode!=='read')enter(zone,{force:true})}
  else stop();sync();
 });
 c.pause.addEventListener('click',()=>{
  if(!state.enabled)return;state.paused=!state.paused;
  if(state.paused){audio.pause();window.speechSynthesis?.pause();active(false);status('PAUSA')}
  else if(current){if(spoken&&audio.src)void audio.play().then(()=>active(true)).catch(()=>{});else if(window.speechSynthesis?.paused){window.speechSynthesis.resume();active(true)}else if(seq.length)advance()}
  else if(seq.length)advance();
  sync();
 });
 c.cc.addEventListener('click',()=>{state.cc=!state.cc;persist();sync();if(state.cc&&current)caption(current)});
 c.mode.addEventListener('change',()=>{state.mode=c.mode.value;persist();stop();sync();if(state.enabled&&state.mode!=='read')enter(observedZone(),{force:true})});
 c.lang.addEventListener('change',()=>{state.lang=c.lang.value;persist();stop();sync();if(state.enabled&&state.mode!=='read')enter(observedZone(),{force:true})});
 c.preview.addEventListener('change',()=>{state.preview=c.preview.checked;persist()});
 root.addEventListener('click',e=>{if(e.target.closest('[data-echo-replay]')){const zone=observedZone();if(zone)queue(director.enter(zone,{lang:state.lang,mode:state.mode,force:true}))}});
 const api={
  getState:()=>({...state,zone:observedZone(),current:current?.id||null}),
  /** Owning module must emit only once the claimed interaction really happened. */
  emit(detail){window.dispatchEvent(new CustomEvent(EVENT,{detail}))},
  read(zone){if(!state.enabled)return false;return queue(director.enter(zone,{lang:state.lang,mode:'read',force:true}))},
  stop,
  destroy(){stop();observer?.disconnect();window.removeEventListener(EVENT,onEvent);window.removeEventListener('hashchange',onHash);window.removeEventListener('pagehide',onPageHide);document.removeEventListener('visibilitychange',onVisibility);delete window.kdxEcho}
 };
 window.kdxEcho=api;sync();status('ECHO DESACTIVADA');return api;
}
