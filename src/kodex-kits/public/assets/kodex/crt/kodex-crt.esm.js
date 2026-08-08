const CRT_PRESETS = {
  neutral:{scanline:.16,phosphor:.10,noise:.008,flicker:.004,bloom:.08,persistence:.04,chromatic:.15,curvature:.003,vignette:.10,bleed:.05,mask:0,tint:[1,1,1]},
  threshold:{scanline:.22,phosphor:.16,noise:.012,flicker:.008,bloom:.12,persistence:.05,chromatic:.20,curvature:.006,vignette:.18,bleed:.07,mask:1,tint:[1,.28,.24]},
  observe:{scanline:.34,phosphor:.22,noise:.015,flicker:.009,bloom:.16,persistence:.16,chromatic:.42,curvature:.008,vignette:.18,bleed:.12,mask:2,tint:[.72,.48,1]},
  descent:{scanline:.18,phosphor:.20,noise:.018,flicker:.012,bloom:.12,persistence:.22,chromatic:.18,curvature:.015,vignette:.24,bleed:.10,mask:3,tint:[1,.52,.14]},
  archive:{scanline:.42,phosphor:.28,noise:.010,flicker:.004,bloom:.08,persistence:.10,chromatic:.08,curvature:.004,vignette:.16,bleed:.05,mask:4,tint:[.65,1,.12]},
  machine:{scanline:.20,phosphor:.22,noise:.020,flicker:.010,bloom:.14,persistence:.08,chromatic:.30,curvature:.005,vignette:.14,bleed:.10,mask:2,tint:[.10,.88,1]},
  cosmology:{scanline:.16,phosphor:.17,noise:.008,flicker:.004,bloom:.18,persistence:.18,chromatic:.24,curvature:.004,vignette:.22,bleed:.08,mask:1,tint:[1,.14,.72]},
  return:{scanline:.12,phosphor:.12,noise:.006,flicker:.002,bloom:.10,persistence:.28,chromatic:.02,curvature:.003,vignette:.10,bleed:.04,mask:0,tint:[.95,.94,.88]}
};

const CRT_QUALITY = {
  full:{dprMax:1.75,renderScale:1,fpsCap:60,persistence:true},
  balanced:{dprMax:1.25,renderScale:.85,fpsCap:30,persistence:true},
  'low-power':{dprMax:1,renderScale:.65,fpsCap:24,persistence:false}
};

const VERT = `#version 300 es
in vec2 aPosition;out vec2 vUv;
void main(){vUv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;out vec4 fragColor;
uniform sampler2D uSource,uPrevious;uniform vec2 uResolution;uniform float uTime;
uniform float uScanline,uPhosphor,uNoise,uFlicker,uBloom,uPersistence,uChromatic,uCurvature,uVignette,uBleed,uSignal,uFocus,uAnomaly;
uniform vec3 uTint;uniform int uMask,uAnomalyMode;
float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
vec2 curve(vec2 uv,float a){vec2 p=uv*2.-1.;p*=1.+a*dot(p,p);return p*.5+.5;}
vec3 maskPattern(vec2 f,int m){if(m==0)return vec3(1.);vec2 p=floor(f);float x=mod(p.x,3.);vec3 t=x<1.?vec3(1.,.56,.56):x<2.?vec3(.56,1.,.56):vec3(.56,.56,1.);if(m==1)return t;if(m==2)return mix(t,t.brg,mod(p.y,2.)*.34);if(m==3){vec2 c=mod(p,vec2(3.));return mix(vec3(.48),t,smoothstep(1.65,.25,length(c-vec2(1.5))));}return vec3(.68+.32*step(1.,mod(p.y,2.)));}
vec2 anomaly(vec2 uv){float a=clamp(uAnomaly,0.,1.);if(uAnomalyMode==1){float b=smoothstep(.035,0.,abs(uv.y-fract(uTime*.17)));uv.x+=b*(.015+.035*a)*sin(uTime*47.);}else if(uAnomalyMode==2){uv.y=fract(uv.y+a*.10*sin(uTime*2.1));}else if(uAnomalyMode==3){float s=floor(uv.y*28.);uv.x+=(hash21(vec2(s,floor(uTime*20.)))-.5)*.05*a;}else if(uAnomalyMode==4){uv+=(hash21(vec2(floor(uTime*30.),uv.y))-.5)*.018*a;}return uv;}
vec3 sampleChroma(vec2 uv){vec2 px=1./max(uResolution,vec2(1.));float s=uChromatic*(.35+uAnomaly)*2.4*px.x;return vec3(texture(uSource,uv+vec2(s,0)).r,texture(uSource,uv).g,texture(uSource,uv-vec2(s,0)).b);}
vec3 bloom(vec2 uv,vec3 c){vec2 p=1./max(uResolution,vec2(1.));vec3 s=vec3(0.);s+=texture(uSource,uv+vec2(2,0)*p).rgb;s+=texture(uSource,uv-vec2(2,0)*p).rgb;s+=texture(uSource,uv+vec2(0,2)*p).rgb;s+=texture(uSource,uv-vec2(0,2)*p).rgb;s+=texture(uSource,uv+vec2(1.4,1.4)*p).rgb;s+=texture(uSource,uv+vec2(-1.4,1.4)*p).rgb;s+=texture(uSource,uv+vec2(1.4,-1.4)*p).rgb;s+=texture(uSource,uv-vec2(1.4,1.4)*p).rgb;return max(s*.125-vec3(.28),0.)+c;}
void main(){vec2 uv=anomaly(curve(vUv,uCurvature));float inside=step(0.,uv.x)*step(uv.x,1.)*step(0.,uv.y)*step(uv.y,1.);vec3 c=sampleChroma(uv);c=mix(c,texture(uSource,uv+vec2(uBleed/max(uResolution.x,1.),0.)).rgb,clamp(uBleed,0.,.35));c=mix(c,bloom(uv,c),clamp(uBloom,0.,.6));c*=mix(vec3(1.),uTint,.34+.14*uSignal);float sc=.5+.5*sin(uv.y*uResolution.y*3.14159265);c*=1.-uScanline*(.25+.75*sc);c*=mix(vec3(1.),maskPattern(gl_FragCoord.xy,uMask),clamp(uPhosphor,0.,.75));float n=hash21(gl_FragCoord.xy+floor(uTime*60.));c+=(n-.5)*uNoise;c*=1.-uFlicker*(.5+.5*sin(uTime*118.));vec3 prev=texture(uPrevious,vUv).rgb;c=mix(c,max(c,prev*.985),clamp(uPersistence*(.75+.25*uFocus),0.,.92));vec2 p=vUv*2.-1.;c*=mix(1.,smoothstep(1.25,.18,dot(p,p)),uVignette);if(uAnomalyMode==4)c+=vec3(n)*uAnomaly*.22;fragColor=vec4(max(c,0.)*inside,1.);}`;

const PRESENT = `#version 300 es
precision highp float;in vec2 vUv;out vec4 fragColor;uniform sampler2D uFrame;void main(){fragColor=texture(uFrame,vUv);}`;

const ANOMALY_IDS={none:0,tear:1,roll:2,slice:3,burst:4};

function resolveElement(value,label){if(typeof value==='string'){const el=document.querySelector(value);if(!el)throw new Error(`KODEX CRT: ${label} not found: ${value}`);return el;}if(!value)throw new Error(`KODEX CRT: ${label} is required.`);return value;}
function compile(gl,type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const log=gl.getShaderInfoLog(s);gl.deleteShader(s);throw new Error(log||'Shader compile failed');}return s;}
function makeProgram(gl,vs,fs){const p=gl.createProgram();gl.attachShader(p,compile(gl,gl.VERTEX_SHADER,vs));gl.attachShader(p,compile(gl,gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'Program link failed');return p;}
function makeTexture(gl){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;}
function makeFramebuffer(gl,t){const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);return f;}

class KodexCrtController{
  constructor(options={}){
    this.source=resolveElement(options.source,'source');this.container=resolveElement(options.container||this.source.parentElement,'container');
    this.canvas=options.canvas||document.createElement('canvas');this.canvas.className=`kdx-crt-canvas ${options.className||''}`.trim();this.canvas.setAttribute('aria-hidden','true');
    this.canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;';if(getComputedStyle(this.container).position==='static')this.container.style.position='relative';if(!this.canvas.isConnected)this.container.appendChild(this.canvas);
    this.presetName=options.preset||'observe';this.preset={...(CRT_PRESETS[this.presetName]||CRT_PRESETS.observe),...(options.overrides||{})};this.qualityName=options.quality||this.autoQuality();this.quality=CRT_QUALITY[this.qualityName]||CRT_QUALITY.balanced;
    this.signal=options.signal??.65;this.focus=options.focus??.5;this.anomaly=0;this.anomalyMode=0;this.anomalyUntil=0;this.running=false;this.destroyed=false;this.lastFrame=0;this.frameIndex=0;
    this.metrics={fps:0,averageFrameTime:0,droppedFrames:0,profile:this.qualityName,webglActive:false,fallbackActive:false,passCount:2};
    this.gl=this.canvas.getContext('webgl2',{alpha:true,antialias:false,premultipliedAlpha:false});if(!this.gl){this.activateFallback('webgl2-unavailable');return;}
    try{this.initGl();}catch(error){console.error(error);this.activateFallback('webgl-init-failed');return;}
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(this.container);this.visibilityHandler=()=>document.hidden?this.stop():this.start();document.addEventListener('visibilitychange',this.visibilityHandler);this.contextLostHandler=e=>{e.preventDefault();this.activateFallback('context-lost');};this.canvas.addEventListener('webglcontextlost',this.contextLostHandler);this.resize();this.metrics.webglActive=true;this.exposeMetrics(options.metricsKey||'__KODEX_CRT_METRICS__');if(options.autoStart!==false)this.start();
  }
  autoQuality(){const c=navigator.hardwareConcurrency||4,m=matchMedia('(max-width:720px)').matches,r=matchMedia('(prefers-reduced-motion:reduce)').matches;if(r||c<=2)return 'low-power';if(m||c<=6)return 'balanced';return 'full';}
  activateFallback(reason){this.metrics={...(this.metrics||{}),webglActive:false,fallbackActive:true,reason,passCount:0};this.container.classList.add('kdx-crt-fallback-active');this.canvas.hidden=true;this.container.dispatchEvent(new CustomEvent('kdx:crt-fallback',{detail:{reason}}));}
  initGl(){const gl=this.gl;this.compositeProgram=makeProgram(gl,VERT,FRAG);this.presentProgram=makeProgram(gl,VERT,PRESENT);const v=new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]);this.vao=gl.createVertexArray();gl.bindVertexArray(this.vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,v,gl.STATIC_DRAW);for(const p of [this.compositeProgram,this.presentProgram]){const a=gl.getAttribLocation(p,'aPosition');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);}this.sourceTexture=makeTexture(gl);this.historyTextures=[makeTexture(gl),makeTexture(gl)];this.framebuffers=[makeFramebuffer(gl,this.historyTextures[0]),makeFramebuffer(gl,this.historyTextures[1])];const names=['uSource','uPrevious','uResolution','uTime','uScanline','uPhosphor','uNoise','uFlicker','uBloom','uPersistence','uChromatic','uCurvature','uVignette','uBleed','uSignal','uFocus','uAnomaly','uTint','uMask','uAnomalyMode'];this.u=Object.fromEntries(names.map(n=>[n,gl.getUniformLocation(this.compositeProgram,n)]));this.uFrame=gl.getUniformLocation(this.presentProgram,'uFrame');gl.disable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);}
  resize(){if(!this.gl||this.destroyed)return;const r=this.container.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,this.quality.dprMax),w=Math.max(2,Math.round(r.width*d*this.quality.renderScale)),h=Math.max(2,Math.round(r.height*d*this.quality.renderScale));if(this.canvas.width===w&&this.canvas.height===h)return;this.canvas.width=w;this.canvas.height=h;for(const t of this.historyTextures){this.gl.bindTexture(this.gl.TEXTURE_2D,t);this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,w,h,0,this.gl.RGBA,this.gl.UNSIGNED_BYTE,null);}this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);}
  setPreset(name,overrides={}){this.presetName=name;this.preset={...(CRT_PRESETS[name]||CRT_PRESETS.observe),...overrides};this.container.dataset.kdxCrtPreset=name;}
  setQuality(name){if(!CRT_QUALITY[name])throw new Error(`Unknown CRT quality: ${name}`);this.qualityName=name;this.quality=CRT_QUALITY[name];this.metrics.profile=name;this.resize();}
  setSignalState({signal=this.signal,focus=this.focus}={}){this.signal=Math.min(1,Math.max(0,signal));this.focus=Math.min(1,Math.max(0,focus));}
  triggerAnomaly(type='tear',intensity=1,duration=420){this.anomalyMode=ANOMALY_IDS[type]??1;this.anomaly=Math.min(1,Math.max(0,intensity));this.anomalyUntil=performance.now()+Math.max(60,duration);this.container.dispatchEvent(new CustomEvent('kdx:crt-anomaly',{detail:{type,intensity,duration}}));}
  exposeMetrics(key){this.metricsKey=key;window[key]=this.metrics;}
  start(){if(this.running||!this.gl||this.destroyed)return;this.running=true;this.lastFrame=performance.now();this.raf=requestAnimationFrame(t=>this.render(t));}
  stop(){this.running=false;if(this.raf)cancelAnimationFrame(this.raf);}
  uploadSource(){const gl=this.gl;gl.bindTexture(gl.TEXTURE_2D,this.sourceTexture);try{gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,this.source);return true;}catch(e){console.warn('KODEX CRT source upload skipped',e);return false;}}
  f(name,v){const l=this.u[name];if(l!==null)this.gl.uniform1f(l,v);}
  render(now){if(!this.running||this.destroyed)return;const interval=1000/this.quality.fpsCap,delta=now-this.lastFrame;if(delta<interval){this.raf=requestAnimationFrame(t=>this.render(t));return;}this.lastFrame=now-(delta%interval);if(now>this.anomalyUntil){this.anomaly*=.82;if(this.anomaly<.01){this.anomaly=0;this.anomalyMode=0;}}if(!this.uploadSource()){this.raf=requestAnimationFrame(t=>this.render(t));return;}const gl=this.gl,w=this.canvas.width,h=this.canvas.height,current=this.frameIndex%2,previous=1-current;gl.bindVertexArray(this.vao);gl.bindFramebuffer(gl.FRAMEBUFFER,this.framebuffers[current]);gl.viewport(0,0,w,h);gl.useProgram(this.compositeProgram);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.sourceTexture);gl.uniform1i(this.u.uSource,0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.historyTextures[previous]);gl.uniform1i(this.u.uPrevious,1);gl.uniform2f(this.u.uResolution,w,h);this.f('uTime',now*.001);const p=this.preset;this.f('uScanline',p.scanline);this.f('uPhosphor',p.phosphor);this.f('uNoise',p.noise);this.f('uFlicker',p.flicker);this.f('uBloom',p.bloom);this.f('uPersistence',this.quality.persistence?p.persistence:0);this.f('uChromatic',p.chromatic);this.f('uCurvature',p.curvature);this.f('uVignette',p.vignette);this.f('uBleed',p.bleed);this.f('uSignal',this.signal);this.f('uFocus',this.focus);this.f('uAnomaly',this.anomaly);gl.uniform3fv(this.u.uTint,p.tint);gl.uniform1i(this.u.uMask,p.mask|0);gl.uniform1i(this.u.uAnomalyMode,this.anomalyMode|0);gl.drawArrays(gl.TRIANGLES,0,6);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,w,h);gl.useProgram(this.presentProgram);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.historyTextures[current]);gl.uniform1i(this.uFrame,0);gl.drawArrays(gl.TRIANGLES,0,6);const ms=Math.max(.001,delta),fps=1000/ms;this.metrics.fps=Math.round(this.metrics.fps*.85+fps*.15);this.metrics.averageFrameTime=Number((this.metrics.averageFrameTime*.85+ms*.15).toFixed(2));if(ms>interval*1.65)this.metrics.droppedFrames++;this.metrics.state={preset:this.presetName,signal:this.signal,focus:this.focus,anomaly:this.anomaly};if(this.metricsKey)window[this.metricsKey]=this.metrics;this.frameIndex++;this.raf=requestAnimationFrame(t=>this.render(t));}
  destroy(){if(this.destroyed)return;this.destroyed=true;this.stop();this.resizeObserver?.disconnect();document.removeEventListener('visibilitychange',this.visibilityHandler);this.canvas.removeEventListener('webglcontextlost',this.contextLostHandler);this.canvas.remove();this.container.classList.remove('kdx-crt-fallback-active');if(this.metricsKey)delete window[this.metricsKey];}
}

function mountKodexCrt(options){return new KodexCrtController(options);}
export {CRT_PRESETS,CRT_QUALITY,KodexCrtController,mountKodexCrt};
