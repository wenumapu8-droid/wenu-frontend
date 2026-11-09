import{K as M,T as d}from"./KdxThresholdPortalRuntime.D62n4Vpa.js";import{m as _,K as O}from"./journey-memory-bridge.BaLp47f5.js";const g={DORMANT:"DORMANT",AWARE:"AWARE",ENGAGED:"AWARE",OPEN:"OPEN",INTEGRATING:"OPEN",RETURNING:"OPEN",COMPLETE:"DORMANT"},f={HIGH:"HIGH",MEDIUM:"MEDIUM",LOW:"LOW",FALLBACK:"LOW"};class T{preset;runtime;lifecycle="DORMANT";quality;motion="FULL";running=!1;input={pointer:{x:0,y:0,active:!1},primaryAction:0,secondaryAction:0,navigationAxis:{x:0,y:0},audio:{low:0,mid:0,high:0,active:!1}};constructor(t,e){this.preset=e,this.quality=matchMedia("(max-width: 767px)").matches?e.performance.mobileTier:e.performance.desktopTier,this.runtime=new M(t,{artworkUrl:e.assets.source,seed:F(e.id),qualityLevel:f[this.quality],bindGlobalPointer:!1,manageContextLifecycle:!1})}async load(){if(!this.preset.assets.source)throw new Error(`Organism ${this.preset.id} requires assets.source.`);await this.runtime.load()}mount(){this.runtime.setState(g[this.lifecycle]),this.runtime.setQualityLevel(f[this.quality]),this.applyMotion()}enter(){this.setLifecycle("AWARE")}start(){this.motion==="OFF"||this.quality==="FALLBACK"||(this.running=!0,this.runtime.start())}stop(){this.running=!1,this.runtime.stop()}setInput(t){this.input={...this.input,...t,pointer:t.pointer?{...this.input.pointer,...t.pointer}:this.input.pointer,navigationAxis:t.navigationAxis?{...this.input.navigationAxis,...t.navigationAxis}:this.input.navigationAxis,audio:t.audio?{...this.input.audio,...t.audio}:this.input.audio},this.runtime.setPointer(this.input.pointer.x,this.input.pointer.y);const e=this.input.audio.active?this.input.audio.low:.2+Math.sin(performance.now()/1800)*.1;this.runtime.setBass(e)}setLifecycle(t){this.lifecycle=t,this.runtime.setState(g[t])}setQuality(t){this.quality=t,this.runtime.setQualityLevel(f[t]),t==="FALLBACK"&&this.stop()}setMotion(t){this.motion=t,this.applyMotion(),t==="OFF"&&this.stop()}getMetrics(){const t=this.runtime.getMetrics();return{running:this.running,family:this.preset.family,renderMode:this.preset.renderMode,quality:this.quality,motion:this.motion,lifecycle:this.lifecycle,frames:0,averageFrameMs:Number(t.frameTime??0),droppedFrameEstimate:Number(t.longFrames??0)}}exit(){this.setLifecycle("RETURNING"),this.stop()}destroy(){this.stop(),this.runtime.dispose()}applyMotion(){if(this.motion==="REDUCED"){this.runtime.setMotionMode(d.REDUCED),this.runtime.renderOnce();return}if(this.motion==="OFF"){this.runtime.setMotionMode(d.PAUSED),this.runtime.renderOnce();return}this.runtime.setMotionMode(d.LIVE)}}const I={family:"FIELD",supportedModes:["IMAGE_FIELD","SHADER"],create(i,t){return new T(i,t)}};function F(i){let t=2166136261;for(const e of i)t^=e.charCodeAt(0),t=Math.imul(t,16777619);return(t>>>0)/4294967295}const S=`#version 300 es

layout(location = 0) in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,D=`#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 out_color;

uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
uniform float u_signal;
uniform float u_memory;
uniform float u_entropy;
uniform float u_cohesion;
uniform float u_depth;
uniform float u_convergence;
uniform float u_state;
uniform float u_motion;
uniform float u_quality;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise21(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 rotation = mat2(0.80, -0.60, 0.60, 0.80);

  for (int octave = 0; octave < 5; octave++) {
    value += noise21(p) * amplitude;
    p = rotation * p * 2.03 + 17.17;
    amplitude *= 0.5;
  }

  return value;
}

float lineBand(float value, float width) {
  return 1.0 - smoothstep(0.0, width, abs(value));
}

void main() {
  vec2 uv = v_uv - 0.5;
  float aspect = u_resolution.x / max(1.0, u_resolution.y);
  uv.x *= aspect;

  vec2 pointer = u_pointer * vec2(aspect, 1.0);
  vec2 center = pointer * (0.035 + u_state * 0.025);
  vec2 p = uv - center;

  float radius = max(length(p), 0.0001);
  float angle = atan(p.y, p.x);
  float motionTime = u_time * u_motion;

  float turbulence = fbm(p * mix(2.4, 6.0, u_entropy) + motionTime * 0.08);
  float twist = mix(2.0, 8.5, u_convergence);
  float spiralCoordinate = angle + log(radius + 0.06) * twist;

  float armWave = sin(spiralCoordinate * 5.0 - motionTime * (0.45 + u_signal * 0.8));
  float secondaryWave = sin(spiralCoordinate * 11.0 + motionTime * 0.23 + turbulence * 4.0);

  float armWidth = mix(0.18, 0.055, u_cohesion);
  float armField = pow(max(0.0, armWave * 0.5 + 0.5), mix(3.0, 11.0, u_cohesion));
  armField *= 0.55 + secondaryWave * 0.20 + turbulence * 0.45;

  float radialFalloff = exp(-radius * mix(1.25, 3.7, u_convergence));
  float outerEnvelope = 1.0 - smoothstep(0.03, 0.78 + u_depth * 0.25, radius);
  float core = exp(-radius * mix(24.0, 62.0, u_convergence));
  float eventHorizon = lineBand(radius - mix(0.055, 0.135, u_state), 0.012 + armWidth * 0.05);

  float filaments = 0.0;
  float layerCount = mix(2.0, 4.0, u_quality);
  for (int layer = 0; layer < 4; layer++) {
    float enabled = step(float(layer), layerCount - 0.5);
    float index = float(layer);
    float phase = index * 1.73 + motionTime * (0.05 + index * 0.025);
    float layerSpiral = spiralCoordinate * (7.0 + index * 2.0) + phase;
    float band = lineBand(sin(layerSpiral + turbulence * (2.0 + index)), 0.12 + index * 0.02);
    float shell = lineBand(fract(radius * (15.0 + index * 5.0) - motionTime * 0.04) - 0.5, 0.18);
    filaments += band * shell * enabled / (1.0 + index);
  }

  vec2 grid = p * mix(90.0, 170.0, u_quality);
  float starSeed = hash21(floor(grid));
  float star = step(0.988 - u_signal * 0.006, starSeed);
  star *= exp(-length(fract(grid) - 0.5) * 8.0);
  star *= outerEnvelope * (0.35 + turbulence);

  float density = armField * radialFalloff * outerEnvelope;
  density += filaments * 0.16 * radialFalloff;
  density += star * (0.32 + u_signal * 0.9);
  density += eventHorizon * (0.3 + u_state * 0.7);
  density += core * (1.3 + u_signal * 1.8);

  float pulse = 0.94 + sin(motionTime * 0.7 + radius * 24.0) * 0.06 * u_motion;
  density *= pulse;

  vec3 deep = vec3(0.008, 0.004, 0.018);
  vec3 violet = vec3(0.25, 0.055, 0.56);
  vec3 signal = vec3(0.62, 0.28, 1.0);
  vec3 whiteCore = vec3(0.92, 0.88, 1.0);
  vec3 cyanMemory = vec3(0.12, 0.62, 0.78);

  float hueMix = clamp(turbulence * 0.7 + u_memory * 0.35 + radius * 0.2, 0.0, 1.0);
  vec3 color = mix(violet, signal, density);
  color = mix(color, cyanMemory, hueMix * u_memory * 0.32);
  color = mix(color, whiteCore, clamp(core + eventHorizon * 0.35, 0.0, 1.0));
  color *= density * (0.7 + u_signal * 1.25);

  float vignette = 1.0 - smoothstep(0.18, 1.05, length(uv));
  color = mix(deep, color, vignette);

  float grain = hash21(gl_FragCoord.xy + floor(motionTime * 24.0));
  color += (grain - 0.5) * 0.025 * u_entropy;

  float alpha = clamp(density * 0.95 + core, 0.0, 1.0);
  out_color = vec4(color, alpha);
}
`,C=()=>({pointer:{x:0,y:0,active:!1},primaryAction:0,secondaryAction:0,navigationAxis:{x:0,y:0},audio:{low:0,mid:0,high:0,active:!1}});class N{preset;canvas;input=C();lifecycle="DORMANT";quality;motion="FULL";raf=0;running=!1;startedAt=0;previousRenderedAt=0;frameCount=0;accumulatedFrameMs=0;droppedFrameEstimate=0;constructor(t,e){this.canvas=t,this.preset=e,this.quality=matchMedia("(max-width: 767px)").matches?e.performance.mobileTier:e.performance.desktopTier}enter(){this.setLifecycle("AWARE")}exit(){this.setLifecycle("RETURNING"),this.stop()}start(){this.running||this.motion==="OFF"||this.quality==="FALLBACK"||(this.running=!0,this.startedAt||=performance.now(),this.previousRenderedAt=performance.now(),this.raf=requestAnimationFrame(this.tick))}stop(){this.running=!1,cancelAnimationFrame(this.raf),this.raf=0}setInput(t){this.input={...this.input,...t,pointer:t.pointer?{...this.input.pointer,...t.pointer}:this.input.pointer,navigationAxis:t.navigationAxis?{...this.input.navigationAxis,...t.navigationAxis}:this.input.navigationAxis,audio:t.audio?{...this.input.audio,...t.audio}:this.input.audio}}setLifecycle(t){this.lifecycle=t}setQuality(t){this.quality=t,this.onQualityChange(t),t==="FALLBACK"&&this.stop()}setMotion(t){this.motion=t,this.onMotionChange(t),t==="OFF"&&this.stop()}getMetrics(){return{running:this.running,family:this.preset.family,renderMode:this.preset.renderMode,quality:this.quality,motion:this.motion,lifecycle:this.lifecycle,frames:this.frameCount,averageFrameMs:this.frameCount?this.accumulatedFrameMs/this.frameCount:0,droppedFrameEstimate:this.droppedFrameEstimate}}async destroy(){this.stop(),await this.destroyResources()}onQualityChange(t){}onMotionChange(t){}tick=t=>{if(!this.running)return;const n=1e3/(this.motion==="REDUCED"?Math.min(12,this.preset.performance.targetFps):this.preset.performance.targetFps),r=t-this.previousRenderedAt;if(r<n*.92){this.raf=requestAnimationFrame(this.tick);return}const s=Math.min(100,r);this.previousRenderedAt=t,s>=n*1.8&&(this.droppedFrameEstimate+=Math.max(1,Math.round(s/n)-1)),this.frameCount+=1,this.accumulatedFrameMs+=s,this.render({now:t,delta:s/1e3,elapsed:(t-this.startedAt)/1e3,input:this.input}),this.raf=requestAnimationFrame(this.tick)}}const P={DORMANT:0,AWARE:.22,ENGAGED:.48,OPEN:.72,INTEGRATING:.82,RETURNING:.56,COMPLETE:1},y={HIGH:1,MEDIUM:.7,LOW:.42,FALLBACK:0};class k extends N{gl=null;program=null;buffer=null;uniforms={};resizeObserver=null;constructor(t,e){super(t,e)}async load(){const t=this.canvas.getContext("webgl2",{alpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance",preserveDrawingBuffer:!1});if(!t)throw new Error("WebGL2 unavailable for Signal Vortex.");this.gl=t;const e=A(t,t.VERTEX_SHADER,S),n=A(t,t.FRAGMENT_SHADER,D),r=t.createProgram();if(!r)throw new Error("Unable to create Signal Vortex program.");if(t.attachShader(r,e),t.attachShader(r,n),t.linkProgram(r),t.deleteShader(e),t.deleteShader(n),!t.getProgramParameter(r,t.LINK_STATUS)){const m=t.getProgramInfoLog(r)||"Signal Vortex shader link failed.";throw t.deleteProgram(r),new Error(m)}const s=t.createBuffer();if(!s)throw t.deleteProgram(r),new Error("Unable to create Signal Vortex geometry buffer.");t.bindBuffer(t.ARRAY_BUFFER,s),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW),this.program=r,this.buffer=s,this.uniforms=q(t,r)}mount(){if(!this.gl||!this.program||!this.buffer)throw new Error("Signal Vortex must load before mount.");this.resizeObserver=new ResizeObserver(()=>this.resize()),this.resizeObserver.observe(this.canvas),this.resize(),this.render({now:performance.now(),delta:0,elapsed:0,input:this.input})}render(t){const e=this.gl,n=this.program,r=this.buffer;if(!e||!n||!r||this.quality==="FALLBACK")return;e.viewport(0,0,this.canvas.width,this.canvas.height),e.useProgram(n),e.bindBuffer(e.ARRAY_BUFFER,r),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const s=this.preset.controls,m=P[this.lifecycle],w=this.motion==="FULL"?1:this.motion==="REDUCED"?.08:0;b(e,this.uniforms.u_resolution,this.canvas.width,this.canvas.height),b(e,this.uniforms.u_pointer,t.input.pointer.x,t.input.pointer.y),o(e,this.uniforms.u_time,t.elapsed),o(e,this.uniforms.u_signal,L(s.signal+t.input.audio.low*.22)),o(e,this.uniforms.u_memory,s.memory),o(e,this.uniforms.u_entropy,s.entropy),o(e,this.uniforms.u_cohesion,s.cohesion),o(e,this.uniforms.u_depth,s.depth),o(e,this.uniforms.u_convergence,L(s.convergence+t.input.primaryAction*.18)),o(e,this.uniforms.u_state,m),o(e,this.uniforms.u_motion,w),o(e,this.uniforms.u_quality,y[this.quality]),e.drawArrays(e.TRIANGLES,0,3)}destroyResources(){this.resizeObserver?.disconnect(),this.resizeObserver=null;const t=this.gl;t&&(this.buffer&&t.deleteBuffer(this.buffer),this.program&&t.deleteProgram(this.program)),this.uniforms={},this.buffer=null,this.program=null,this.gl=null}onQualityChange(t){this.resize()}onMotionChange(t){t!=="OFF"&&this.render({now:performance.now(),delta:0,elapsed:0,input:this.input})}resize(){if(!this.gl||this.quality==="FALLBACK")return;const t=y[this.quality],e=Math.min(this.preset.performance.maxDpr,Math.max(.5,(window.devicePixelRatio||1)*t)),n=Math.max(1,Math.round(this.canvas.clientWidth*e)),r=Math.max(1,Math.round(this.canvas.clientHeight*e));this.canvas.width===n&&this.canvas.height===r||(this.canvas.width=n,this.canvas.height=r)}}function A(i,t,e){const n=i.createShader(t);if(!n)throw new Error("Unable to create shader.");if(i.shaderSource(n,e),i.compileShader(n),!i.getShaderParameter(n,i.COMPILE_STATUS)){const r=i.getShaderInfoLog(n)||"Shader compile failed.";throw i.deleteShader(n),new Error(r)}return n}function q(i,t){const e={},n=i.getProgramParameter(t,i.ACTIVE_UNIFORMS);for(let r=0;r<n;r+=1){const s=i.getActiveUniform(t,r);s&&(e[s.name]=i.getUniformLocation(t,s.name))}return e}function o(i,t,e){t!=null&&i.uniform1f(t,e)}function b(i,t,e,n){t!=null&&i.uniform2f(t,e,n)}function L(i){return Math.max(0,Math.min(1,i))}const U={family:"VORTEX",supportedModes:["SHADER"],create(i,t){return new k(i,t)}},x=(i={})=>({signal:.5,memory:.3,entropy:.15,cohesion:.75,depth:.5,growth:0,convergence:.35,observability:.6,transition:0,...i}),v=(i,t,e)=>({id:i.id,version:"0.1.0",family:t,renderMode:e,status:"EXPERIMENTAL",assets:{source:i.source,fallback:i.fallback,sourceId:i.sourceId,rightsStatus:i.sourceId?"REVIEW_REQUIRED":"UNKNOWN"},interaction:{pointer:"PARALLAX",primaryAction:"ACTIVATE",audioReactive:!1,keyboardEquivalent:"Enter or Space",touchEquivalent:"Tap"},memory:{writes:[]},transition:{enter:"CONVERGE",exit:"DISSOLVE",durationMs:1400},accessibility:{label:i.label,reducedMotion:"STATIC_PULSE",noWebGL:"STATIC_IMAGE"},performance:{mobileTier:"MEDIUM",desktopTier:"HIGH",maxDpr:1.5,feedbackPasses:1,targetFps:45}}),V=i=>({...v(i,"FIELD","IMAGE_FIELD"),concept:{entity:"PORTAL_FIELD",primaryVerb:"OPEN",spatialLogic:"RADIAL",statement:"The source image becomes a recursive spatial field."},behaviors:["BREATHE","ROTATE","FEEDBACK","PARALLAX","REVEAL"],controls:x({signal:.72,memory:.58,depth:.68,convergence:.42}),memory:{writes:["FIELD_ACTIVATED"]},transition:{enter:"CONVERGE",exit:"FEEDBACK_RECURSION",durationMs:1600}}),G=i=>({...v(i,"VORTEX","SHADER"),concept:{entity:"SIGNAL_VORTEX",primaryVerb:"CONVERGE",spatialLogic:"RECURSIVE",statement:"Signal follows a rotating field toward a visible attractor."},behaviors:["ROTATE","COLLAPSE","FEEDBACK","RADIATE","PARALLAX"],controls:x({signal:.8,memory:.72,entropy:.38,convergence:.86,depth:.82}),interaction:{...v(i,"VORTEX","SHADER").interaction,pointer:"ATTRACT",primaryAction:"INCREASE_CONVERGENCE"},memory:{writes:["VORTEX_OBSERVED"]},transition:{enter:"FEEDBACK_RECURSION",exit:"CONVERGE",durationMs:1800}}),B=V({id:"threshold-portal",source:"/img/kodex/works/mandala-0cin-negativo.png",fallback:"/img/kodex/works/mandala-0cin-negativo.png",label:"THRESHOLD · portal vivo sobre la obra",sourceId:"KODEX_THRESHOLD_MANDALA"}),W=G({id:"signal-vortex",fallback:"/img/kodex/organisms/signal-vortex-fallback.svg",label:"SIGNAL VORTEX · rotating convergence field",sourceId:"KDX-PROCEDURAL-SIGNAL-VORTEX-001"}),K=new Set(["IMAGE_FIELD","DEPTH_STACK","PARTICLES","GLB","LAYERED_PLANES"]);function H(i){const t=[],e=[];/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(i.id)||t.push("id must be lower-kebab-case"),i.assets.fallback||t.push("assets.fallback is required"),K.has(i.renderMode)&&!i.assets.source&&!i.assets.model&&!i.assets.spriteSequence?.length&&t.push(`${i.renderMode} requires assets.source, assets.model or a sprite sequence`),i.behaviors.length===0&&t.push("at least one behavior is required"),i.interaction.keyboardEquivalent||t.push("interaction.keyboardEquivalent is required"),i.interaction.touchEquivalent||t.push("interaction.touchEquivalent is required"),(i.performance.maxDpr<.5||i.performance.maxDpr>2)&&t.push("performance.maxDpr must be between 0.5 and 2");for(const[n,r]of Object.entries(i.controls))(!Number.isFinite(r)||r<0||r>1)&&t.push(`controls.${n} must be a finite number between 0 and 1`);return i.assets.rightsStatus==="UNKNOWN"&&e.push("asset rights are unknown; do not publish this preset"),i.assets.rightsStatus==="REVIEW_REQUIRED"&&e.push("asset rights require creator review before public use"),i.memory.writes.length===0&&e.push("preset declares no memory write; confirm that it is atmospheric only"),(i.status==="IMPLEMENTED"||i.status==="TESTED")&&!i.assets.sourceId&&i.renderMode!=="SHADER"&&t.push(`${i.status} asset-driven presets require assets.sourceId for provenance`),{valid:t.length===0,errors:t,warnings:e}}function X(i){const t=H(i);if(!t.valid)throw new Error(`Invalid organism preset ${i.id}: ${t.errors.join("; ")}`)}class ${presets=new Map;adapters=new Map;registerPreset(t){if(X(t),this.presets.has(t.id))throw new Error(`KODEX organism preset already registered: ${t.id}`);return this.presets.set(t.id,t),this}registerAdapter(t){const e=t.family;if(this.adapters.has(e))throw new Error(`KODEX organism adapter already registered: ${e}`);return this.adapters.set(e,t),this}getPreset(t){const e=this.presets.get(t);if(!e)throw new Error(`Unknown KODEX organism preset: ${t}`);return e}create(t,e){const n=this.getPreset(e),r=this.adapters.get(n.family);if(!r)throw new Error(`No adapter registered for ${n.family}. Preset ${n.id} remains specification-only.`);if(!r.supportedModes.includes(n.renderMode))throw new Error(`Adapter ${r.family} does not support ${n.renderMode} for preset ${n.id}.`);return r.create(t,n)}list(){return[...this.presets.values()]}}const z=new $().registerAdapter(I).registerAdapter(U).registerPreset(B).registerPreset(W),a=new Set;let l=null,R=!1,Q=0;class E{root;runtime=null;canvas=null;observer=null;visible=!1;destroyed=!1;inputRaf=0;localEventsBound=!1;motion=matchMedia("(prefers-reduced-motion: reduce)").matches?"REDUCED":"FULL";constructor(t){this.root=t,t.__kdxOrganismController=this,a.add(this)}async mount(){const t=this.root.querySelector("[data-kdx-organism-canvas]"),e=this.root.dataset.preset;if(!t||!e)throw new Error("KODEX organism requires a canvas and data-preset.");if(this.canvas=t,!!!document.createElement("canvas").getContext("webgl2")){this.useFallback("WEBGL2 UNAVAILABLE");return}this.runtime=z.create(t,e),this.runtime.setMotion(this.motion),t.addEventListener("webglcontextlost",this.onContextLost,!1),t.addEventListener("webglcontextrestored",this.onContextRestored,!1),await this.runtime.load(),!this.destroyed&&(this.runtime.mount(),this.runtime.enter(),this.root.dataset.kdxOrganismState="ready",this.setStatus(`${e} READY`),this.observe(),this.bindLocalEvents())}activate(){!this.runtime||this.destroyed||!this.visible||document.hidden||(l&&l!==this&&l.deactivate(),l=this,this.runtime.setLifecycle("AWARE"),this.runtime.start(),this.feedInput())}deactivate(){cancelAnimationFrame(this.inputRaf),this.inputRaf=0,this.runtime?.stop(),l===this&&(l=null)}resumeIfVisible(){this.visible&&this.activate()}commitPrimaryAction(){if(!this.runtime)return;this.runtime.setLifecycle("ENGAGED"),this.runtime.setInput({primaryAction:1});const t=Date.now(),e={id:`${this.runtime.preset.id}:${this.runtime.preset.interaction.primaryAction}:${t}:${++Q}`,createdAt:t,presetId:this.runtime.preset.id,family:this.runtime.preset.family,action:this.runtime.preset.interaction.primaryAction,memoryWrites:this.runtime.preset.memory.writes};this.root.dispatchEvent(new CustomEvent(O,{bubbles:!0,composed:!0,detail:e})),requestAnimationFrame(()=>{this.runtime?.setInput({primaryAction:0}),this.runtime?.setLifecycle("OPEN")})}setMotion(t){this.motion=t,this.runtime?.setMotion(t),t==="OFF"?this.deactivate():this.resumeIfVisible()}debug(){return{preset:this.root.dataset.preset,visible:this.visible,motion:this.motion,state:this.root.dataset.kdxOrganismState,metrics:this.runtime?.getMetrics()??null}}async destroy(){this.destroyed||(this.destroyed=!0,this.deactivate(),this.observer?.disconnect(),this.observer=null,this.unbindLocalEvents(),this.canvas&&(this.canvas.removeEventListener("webglcontextlost",this.onContextLost,!1),this.canvas.removeEventListener("webglcontextrestored",this.onContextRestored,!1)),await this.runtime?.destroy(),this.runtime=null,this.canvas=null,a.delete(this),delete this.root.__kdxOrganismController)}observe(){this.observer=new IntersectionObserver(t=>{const e=t.some(n=>n.isIntersecting);e!==this.visible&&(this.visible=e,e?this.activate():this.deactivate())},{rootMargin:"120px",threshold:.01}),this.observer.observe(this.root)}bindLocalEvents(){this.localEventsBound||(this.localEventsBound=!0,this.root.addEventListener("pointerenter",this.onPointerEnter),this.root.addEventListener("click",this.onClick),this.root.addEventListener("keydown",this.onKeyDown))}unbindLocalEvents(){this.localEventsBound&&(this.localEventsBound=!1,this.root.removeEventListener("pointerenter",this.onPointerEnter),this.root.removeEventListener("click",this.onClick),this.root.removeEventListener("keydown",this.onKeyDown))}onPointerEnter=()=>{this.runtime?.setLifecycle("AWARE"),this.resumeIfVisible()};onClick=()=>{this.commitPrimaryAction()};onKeyDown=t=>{t.key!=="Enter"&&t.key!==" "||(t.preventDefault(),this.commitPrimaryAction())};feedInput(){cancelAnimationFrame(this.inputRaf);const t=()=>{!this.runtime||l!==this||this.destroyed||(this.runtime.setInput(Y()),this.inputRaf=requestAnimationFrame(t))};this.inputRaf=requestAnimationFrame(t)}useFallback(t){this.root.dataset.kdxOrganismState="fallback",this.setStatus(t)}fail(t){this.root.dataset.kdxOrganismState="error",this.setStatus(t instanceof Error?t.message:"ORGANISM ERROR"),console.warn("[kodex-organism]",t)}setStatus(t){const e=this.root.querySelector("[data-kdx-organism-status]");e&&(e.textContent=t)}onContextLost=t=>{t.preventDefault(),this.deactivate(),this.useFallback("WEBGL CONTEXT LOST")};onContextRestored=()=>{this.destroy().finally(()=>h())};static async create(t){const e=new E(t);try{await e.mount()}catch(n){e.fail(n)}return e}}const u={x:0,y:0,active:!1},c={x:0,y:0};function Y(){const i=window.__kxAudio;return{pointer:{...u},navigationAxis:{...c},audio:{active:!!(i?.activo??i?.active),low:p(i?.low??0),mid:p(i?.mid??0),high:p(i?.high??0)}}}function j(){if(R)return;R=!0,_(),addEventListener("pointermove",e=>{u.x=e.clientX/innerWidth*2-1,u.y=-(e.clientY/innerHeight*2-1),u.active=!0},{passive:!0}),addEventListener("pointerleave",()=>{u.active=!1}),addEventListener("keydown",e=>{c.x=+(e.key==="ArrowRight")-+(e.key==="ArrowLeft"),c.y=+(e.key==="ArrowDown")-+(e.key==="ArrowUp")}),addEventListener("keyup",()=>{c.x=0,c.y=0}),document.addEventListener("visibilitychange",()=>{if(document.hidden){a.forEach(e=>e.deactivate());return}a.forEach(e=>e.resumeIfVisible())});const i=matchMedia("(prefers-reduced-motion: reduce)"),t=()=>{const e=i.matches?"REDUCED":"FULL";a.forEach(n=>n.setMotion(e))};i.addEventListener?.("change",t),window.__kdxOrganisms={list:()=>[...a].map(e=>e.debug()),setMotion:e=>a.forEach(n=>n.setMotion(e)),stop:()=>a.forEach(e=>e.deactivate())}}function h(){j();for(const i of document.querySelectorAll("[data-kdx-organism]"))i.__kdxOrganismController||E.create(i)}function p(i){return Math.max(0,Math.min(1,i))}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",h,{once:!0}):h();document.addEventListener("astro:page-load",h);document.addEventListener("astro:before-swap",()=>{for(const i of[...a])i.destroy()});
