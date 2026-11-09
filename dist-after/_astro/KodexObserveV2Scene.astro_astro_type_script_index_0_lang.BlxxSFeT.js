import{p as w,o as T,r as g}from"./memoria.3DpAB-Cc.js";import{s as M}from"./senales.D4zzueQY.js";const u=`#version 300 es
precision highp float;

layout(location = 0) in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,L=`#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 v_uv;

uniform float u_time;
uniform float u_delta;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform vec2 u_pointerVelocity;
uniform float u_audioLow;
uniform float u_audioMid;
uniform float u_audioHigh;
uniform float u_state;
uniform float u_transition;
uniform float u_intensity;
uniform float u_seed;
uniform float u_feedbackAmount;
uniform float u_scanPosition;
uniform float u_reducedMotion;
uniform float u_particleScale;

#define PI 3.141592653589793

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

mat2 rot(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

float ring(vec2 p, float r, float w) {
  float d = abs(length(p) - r);
  return smoothstep(w, 0.0, d);
}

float eyeMask(vec2 p) {
  p.y *= 1.22;
  float shell = smoothstep(0.98, 0.12, length(p));
  float lidTop = smoothstep(0.16, -0.18, p.y + 0.22 * cos(p.x * 2.5));
  float lidBottom = smoothstep(-0.16, 0.18, p.y - 0.22 * cos(p.x * 2.5));
  return shell * lidTop * lidBottom;
}

vec3 violet(float t) {
  vec3 a = vec3(0.545, 0.361, 0.964);
  vec3 b = vec3(0.753, 0.517, 0.988);
  vec3 c = vec3(0.133, 0.827, 0.933);
  return mix(mix(a, b, t), c, t * 0.22);
}

void main() {
  vec2 uv = v_uv;
  vec2 p = (uv - 0.5) * vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
  vec2 pointer = u_pointer * vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0) * 0.16;
  float reduced = u_reducedMotion;
  float time = u_time * mix(1.0, 0.18, reduced);
  float breath = 0.5 + 0.5 * sin(time * 1.15 + u_audioLow * 3.0);
  float stateOpen = smoothstep(0.0, 1.0, u_state * 1.1 + u_transition * 0.32);

  vec2 center = pointer * vec2(0.55, 0.4);
  vec2 q = p - center;
  float mask = eyeMask(q * vec2(1.0, mix(1.45, 1.0, stateOpen)));

  float angle = atan(q.y, q.x);
  float dist = length(q);
  float irisRad = mix(0.17, 0.285, stateOpen) + u_audioLow * 0.03 + breath * 0.012;
  float iris = smoothstep(irisRad + 0.05, irisRad - 0.02, dist);
  float pupil = smoothstep(mix(0.07, 0.035, u_transition), 0.01, dist + dot(u_pointerVelocity, u_pointerVelocity) * 0.03);

  float irisFibers = 0.0;
  vec2 rq = rot(angle * 0.14 + time * 0.05) * q;
  irisFibers += sin(angle * 19.0 + time * 0.8 + noise(rq * 9.0 + u_seed) * 2.0) * 0.5 + 0.5;
  irisFibers += sin(angle * 37.0 - time * 0.6 + noise(rq * 14.0 - u_seed) * 1.6) * 0.5 + 0.5;
  irisFibers *= iris;

  float orbitA = ring(q * rot(time * 0.15 + u_audioMid * 0.3), 0.39 + noise(q * 4.0 + time) * 0.018, 0.004);
  float orbitB = ring(q * rot(-time * 0.09 - 0.4), 0.51 + sin(angle * 6.0 + time) * 0.01, 0.005);
  float orbitC = ring(q * rot(time * 0.04 + 1.4), 0.63 + sin(angle * 4.0 - time * 0.5) * 0.016, 0.0055);

  float reticle = max(ring(q, 0.335, 0.0025), ring(q, 0.705, 0.002));
  reticle += smoothstep(0.015, 0.0, abs(q.x)) * smoothstep(0.9, 0.04, abs(q.y));
  reticle += smoothstep(0.015, 0.0, abs(q.y)) * smoothstep(1.2, 0.06, abs(q.x));

  float scan = exp(-abs(uv.y - u_scanPosition) * 85.0) * (0.2 + u_transition * 0.6);
  float scanH = exp(-abs(uv.y - (0.34 + sin(time * 0.25) * 0.12)) * 130.0) * (0.04 + u_state * 0.08);

  float particleField = 0.0;
  for (int i = 0; i < 26; i++) {
    float fi = float(i);
    float seed = fi * 13.17 + u_seed * 0.3;
    vec2 star = vec2(hash21(vec2(seed, seed + 1.0)), hash21(vec2(seed + 2.0, seed + 3.0)));
    star = star * 2.0 - 1.0;
    star.x *= u_resolution.x / max(u_resolution.y, 1.0);
    star += vec2(sin(time * (0.07 + fi * 0.002)), cos(time * (0.09 + fi * 0.0025))) * 0.04;
    float d = length(p - star * (0.55 + 0.6 * hash21(vec2(seed + 4.0, seed + 5.0))));
    float spark = smoothstep(0.028, 0.0, d) * (0.35 + hash21(vec2(seed + 7.0, seed + 8.0)));
    particleField += spark;
  }
  particleField *= mix(0.4, 1.0, u_particleScale) * (0.55 + u_audioHigh * 0.6);

  float lidNoise = noise(q * 18.0 + time * 0.4) * 0.07;
  float glow = smoothstep(0.92, 0.0, dist) * (0.1 + u_intensity * 0.6 + breath * 0.18);
  vec3 col = vec3(0.02, 0.018, 0.03);
  col += violet(clamp(irisFibers * 0.6 + glow * 0.4, 0.0, 1.0)) * iris * (0.42 + stateOpen * 0.55);
  col += vec3(0.05, 0.01, 0.09) * orbitA;
  col += vec3(0.10, 0.04, 0.16) * orbitB;
  col += vec3(0.03, 0.08, 0.11) * orbitC;
  col += vec3(0.12, 0.17, 0.24) * reticle * (0.2 + u_transition * 0.55);
  col += vec3(0.17, 0.12, 0.28) * glow;
  col += vec3(0.20, 0.16, 0.30) * particleField;
  col += vec3(0.18, 0.14, 0.34) * scan;
  col += vec3(0.06, 0.08, 0.12) * scanH;

  float pupilMask = 1.0 - pupil;
  col *= mix(1.0, 0.08, pupilMask);
  col += vec3(0.018, 0.022, 0.03) * (1.0 - mask) * 0.55;
  col += lidNoise * 0.05;

  float alpha = clamp(mask + orbitA * 0.3 + orbitB * 0.35 + orbitC * 0.35 + particleField * 0.45 + scan * 0.4, 0.0, 1.0);
  fragColor = vec4(col, alpha);
}
`,F=`#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 v_uv;

uniform sampler2D u_tex;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_audioMid;
uniform float u_intensity;
uniform float u_reducedMotion;

float hash21(vec2 p) {
  p = fract(p * vec2(223.34, 451.21));
  p += dot(p, p + 34.45);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  float time = u_time * mix(1.0, 0.25, u_reducedMotion);
  float n1 = noise(p * 6.0 + vec2(time * 0.08, -time * 0.14));
  float n2 = noise(p * 12.0 + vec2(-time * 0.19, time * 0.11));
  vec2 drift = (u_pointer * vec2(0.01, -0.008)) + vec2(n1 - 0.5, n2 - 0.5) * (0.012 + u_audioMid * 0.02) * (0.4 + u_intensity * 0.7);
  vec4 base = texture(u_tex, uv + drift);
  vec4 smear = texture(u_tex, uv + drift * 0.4 + vec2(0.0, (n1 - 0.5) * 0.012));
  fragColor = mix(base, smear, 0.34);
}
`,O=`#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 v_uv;

uniform sampler2D u_tex;
uniform vec2 u_resolution;
uniform float u_audioHigh;
uniform float u_intensity;

float bayer(vec2 p) {
  int x = int(mod(p.x, 4.0));
  int y = int(mod(p.y, 4.0));
  int index = x + y * 4;
  float m[16];
  m[0]=0.0; m[1]=8.0; m[2]=2.0; m[3]=10.0;
  m[4]=12.0; m[5]=4.0; m[6]=14.0; m[7]=6.0;
  m[8]=3.0; m[9]=11.0; m[10]=1.0; m[11]=9.0;
  m[12]=15.0; m[13]=7.0; m[14]=13.0; m[15]=5.0;
  return m[index] / 16.0;
}

void main() {
  vec4 src = texture(u_tex, v_uv);
  float luma = dot(src.rgb, vec3(0.2126, 0.7152, 0.0722));
  float threshold = 0.38 + bayer(gl_FragCoord.xy) * 0.24 + u_audioHigh * 0.08;
  float bit = smoothstep(threshold - 0.08, threshold + 0.08, luma + u_intensity * 0.04);
  vec3 hi = mix(src.rgb * 0.72, vec3(0.910, 0.898, 0.874), bit);
  vec3 lo = src.rgb * mix(0.46, 0.74, bit);
  fragColor = vec4(mix(lo, hi, bit), src.a);
}
`,P=`#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 v_uv;

uniform sampler2D u_tex;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_transition;
uniform float u_audioHigh;

void main() {
  vec2 center = vec2(0.56 + u_pointer.x * 0.05, 0.44 - u_pointer.y * 0.04);
  float dist = distance(v_uv, center);
  float local = smoothstep(0.62, 0.02, dist) * (0.004 + u_transition * 0.01 + u_audioHigh * 0.006);
  vec2 offset = vec2(local, 0.0);
  vec3 col;
  col.r = texture(u_tex, v_uv + offset).r;
  col.g = texture(u_tex, v_uv).g;
  col.b = texture(u_tex, v_uv - offset).b;
  float alpha = texture(u_tex, v_uv).a;
  fragColor = vec4(col, alpha);
}
`,N=`#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 v_uv;

uniform sampler2D u_scene;
uniform sampler2D u_prev;
uniform vec2 u_resolution;
uniform vec2 u_pointerVelocity;
uniform float u_feedbackAmount;
uniform float u_time;
uniform float u_transition;
uniform float u_reducedMotion;

void main() {
  vec2 velocity = u_pointerVelocity * 0.01;
  vec2 trailOffset = vec2(0.002 * sin(u_time * 0.7), -0.003 * cos(u_time * 0.5)) + velocity;
  vec4 scene = texture(u_scene, v_uv);
  vec4 prev = texture(u_prev, v_uv + trailOffset);
  float mixAmt = mix(u_feedbackAmount, u_feedbackAmount * 0.35, u_reducedMotion);
  vec3 col = mix(scene.rgb, max(scene.rgb, prev.rgb * 0.97), mixAmt + u_transition * 0.08);
  fragColor = vec4(col, max(scene.a, prev.a * 0.93));
}
`,q=`#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 v_uv;

uniform sampler2D u_tex;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_scanPosition;
uniform float u_intensity;
uniform float u_reducedMotion;

void main() {
  vec2 uv = v_uv;
  vec2 warped = uv * 2.0 - 1.0;
  warped *= 1.0 + dot(warped, warped) * 0.045;
  warped = warped * 0.5 + 0.5;
  vec3 col = texture(u_tex, warped).rgb;
  float line = sin((uv.y * u_resolution.y) * 1.35) * 0.035;
  float flicker = (sin(u_time * 41.0) * 0.5 + 0.5) * 0.016 * (1.0 - u_reducedMotion * 0.7);
  float vignette = smoothstep(1.22, 0.18, length(uv - 0.5));
  float scan = exp(-abs(uv.y - u_scanPosition) * 95.0) * (0.06 + u_intensity * 0.16);
  col *= vignette;
  col += line + flicker;
  col += vec3(0.06, 0.03, 0.1) * scan;
  fragColor = vec4(col, 1.0);
}
`,I=["full","balanced","low-power"],D={idle:{chip:"STATUS · IDLE",message:"ARCHIVO LATENTE. NÚCLEO EN REPOSO.",hidden:"MEMORY DOES NOT REMAIN STILL · SIGNAL BEFORE NOISE",cta:"INITIATE OBSERVATION",protocol:"Dormant relay. Minimal grid. Low particle field.",dossier:"No target lock. Archive waiting for relational input."},aware:{chip:"STATUS · AWARE",message:"PRESENCIA DETECTADA. CAMPO EN APERTURA.",hidden:"YOU ARE INSIDE THE SIGNAL · RADAR SWEEP ONLINE",cta:"PRESENCE DETECTED",protocol:"Peripheral nodes appear. Ocular field starts revealing.",dossier:"Signal gate open. Peripheral radar and waveform warming up."},locked:{chip:"STATUS · LOCKED",message:"VECTOR FIJADO. CHECKSUM EN VERIFICACIÓN.",hidden:"LOCK VECTOR CLOSED · CROSSHAIR CONVERGENCE ACTIVE",cta:"FIELD LOCKED",protocol:"Crosshair converges. Orbits align. Verification surge.",dossier:"Target frame engaged. Latency collapses toward stable lock."},observing:{chip:"STATUS · OBSERVING",message:"OBSERVATION CHANGES THE PATTERN.",hidden:"THE ARCHIVE WATCHES · FEEDBACK MEMORY ACTIVE",cta:"CARRY THE SIGNAL",protocol:"Full ocular field active. Unified radar, bars, waveform, nodes.",dossier:"Archive is now relational: the observed field modifies the record."}},y={full:{dpr:1.5,particles:1,multipass:1,quality:1},balanced:{dpr:1.25,particles:.76,multipass:.88,quality:.82},"low-power":{dpr:1,particles:.44,multipass:.58,quality:.58}},E={idle:0,aware:1,locked:2,observing:3},p=["idle","aware","locked","observing"];class U{root;dom;gl=null;programs=null;quad=null;fbSource=null;fbDisplace=null;fbThreshold=null;fbChroma=null;fbPrev=null;fbNext=null;raf=0;running=!1;lastNow=0;profile;debugEnabled=!1;reducedMotion=!1;protocolOpen=!1;webglActive=!1;fallbackActive=!0;pointer={x:0,y:0,vx:0,vy:0,activeUntil:0};sceneState;metrics;frameSamples=[];refreshSamples=[];droppedFrames=0;lastInteraction=0;lockedUntil=0;phase=Math.random()*Math.PI*2;timeouts=new Set;forceFallback=!1;forcedState=null;constructor(e){this.root=e;const i=e.querySelector("[data-kdx-canvas]");if(!i)throw new Error("OBSERVE V2 canvas missing");this.dom={canvas:i,fallback:e.querySelector("[data-kdx-fallback]"),statusChip:e.querySelector("[data-kdx-status-chip]"),profileChip:e.querySelector("[data-kdx-profile-chip]"),checksumChip:e.querySelector("[data-kdx-checksum-chip]"),stateCopy:e.querySelector("[data-kdx-state-copy]"),hiddenMessage:e.querySelector("[data-kdx-hidden-message]"),protocolCopy:e.querySelector("[data-kdx-protocol-copy]"),dossierCopy:e.querySelector("[data-kdx-dossier-copy]"),dossierCopyBlock:e.querySelector("[data-kdx-dossier-copy-block]"),signalTag:e.querySelector("[data-kdx-signal-tag]"),telemetryCopy:e.querySelector("[data-kdx-telemetry-copy]"),metricChip:e.querySelector("[data-kdx-metric-chip]"),sceneCode:e.querySelector("[data-kdx-scene-code]"),sourceReadout:e.querySelector("[data-kdx-source-readout]"),acquisitionReadout:e.querySelector("[data-kdx-acquisition-readout]"),confidenceReadout:e.querySelector("[data-kdx-confidence-readout]"),windowReadout:e.querySelector("[data-kdx-window-readout]"),primaryCta:e.querySelector("[data-kdx-primary]"),secondaryCta:e.querySelector("[data-kdx-protocol]"),debug:e.querySelector("[data-kdx-debug]"),debugText:e.querySelector("[data-kdx-debug-text]"),latencyInline:e.querySelector("[data-kdx-latency-inline]"),signalReadout:e.querySelector("[data-kdx-signal-readout]"),focusReadout:e.querySelector("[data-kdx-focus-readout]"),anomalyReadout:e.querySelector("[data-kdx-anomaly-readout]"),nodeReadout:e.querySelector("[data-kdx-node-readout]"),latencyReadout:e.querySelector("[data-kdx-latency-readout]"),checksumReadout:e.querySelector("[data-kdx-checksum-readout]"),checksumFoot:e.querySelector("[data-kdx-checksum-foot]"),rightRailA:e.querySelector("[data-kdx-right-rail-a]"),rightRailB:e.querySelector("[data-kdx-right-rail-b]"),rightRailC:e.querySelector("[data-kdx-right-rail-c]"),rightRailD:e.querySelector("[data-kdx-right-rail-d]"),waveformBars:Array.from(e.querySelectorAll("[data-kdx-waveform] i")),signalBars:Array.from(e.querySelectorAll("[data-kdx-signal-bars] i")),nodes:Array.from(e.querySelectorAll("[data-kdx-node]"))};const t=new URLSearchParams(window.location.search);this.debugEnabled=t.get("debug")==="1",this.forceFallback=t.get("fallback")==="1";const s=t.get("state");this.forcedState=s&&p.includes(s)?s:null,this.reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches,this.profile=this.resolveProfile(),this.sceneState={mode:"idle",signalStrength:.24,focusLevel:.12,anomalyLevel:.08,nodeCount:2,latency:42,checksum:"latent",pointer:{x:0,y:0,vx:0,vy:0,active:!1},reducedMotion:this.reducedMotion,performanceProfile:this.profile},this.metrics={fps:0,averageFrameTime:16.7,droppedFrames:0,profile:this.profile,webglActive:!1,fallbackActive:!0,passCount:6,state:"idle",renderFps:0,refreshRateEstimate:0}}resolveProfile(){const i=new URLSearchParams(window.location.search).get("profile");if(i&&I.includes(i))return i;const t=window.matchMedia("(max-width: 760px)").matches,s=window.devicePixelRatio||1;return this.reducedMotion||t&&s>2?"low-power":t||s>1.65?"balanced":"full"}async load(){return this.forceFallback?(this.webglActive=!1,this.fallbackActive=!0,this.root.dataset.webgl="fallback",this.dom.canvas.classList.remove("is-active")):this.tryInitGl(),this.bindEvents(),this.resize(),this.forcedState&&this.setMode(this.forcedState),this.applySceneState(!0),this}tryInitGl(){try{this.initGL(),this.createPrograms(),this.createBuffers(),this.createTargets(),this.webglActive=!0,this.fallbackActive=!0,this.root.dataset.webgl="active",this.dom.canvas.classList.add("is-active")}catch(e){console.warn("OBSERVE V2 WebGL fallback",e),this.webglActive=!1,this.fallbackActive=!0,this.root.dataset.webgl="fallback",this.dom.canvas.classList.remove("is-active")}}start(){if(this.running)return;this.running=!0;const e=i=>{this.running&&(this.render(i),this.raf=requestAnimationFrame(e))};this.raf=requestAnimationFrame(e)}stop(){this.running=!1,this.raf&&cancelAnimationFrame(this.raf),this.timeouts.forEach(e=>window.clearTimeout(e)),this.timeouts.clear()}bindEvents(){addEventListener("resize",()=>this.resize(),{passive:!0}),document.addEventListener("visibilitychange",()=>{document.hidden?this.stop():this.start()}),this.root.addEventListener("pointermove",this.onPointerMove,{passive:!0}),this.root.addEventListener("pointerleave",this.onPointerLeave,{passive:!0}),this.root.addEventListener("touchstart",this.onTouchStart,{passive:!0}),this.root.querySelector("[data-kdx-prev]")?.addEventListener("click",()=>this.stepMode(-1)),this.root.querySelector("[data-kdx-next]")?.addEventListener("click",()=>this.stepMode(1)),this.root.querySelector("[data-kdx-index]")?.addEventListener("click",()=>{window.location.href="/kodex/"}),this.dom.primaryCta?.addEventListener("click",()=>this.advancePrimary()),this.dom.secondaryCta?.addEventListener("click",()=>{this.protocolOpen=!this.protocolOpen,this.root.classList.toggle("is-protocol-open",this.protocolOpen),this.protocolOpen&&this.sceneState.mode==="idle"&&this.setMode("aware")})}onPointerMove=e=>{const i=this.root.getBoundingClientRect(),t=(e.clientX-i.left)/i.width*2-1,s=-((e.clientY-i.top)/i.height*2-1);this.pointer.vx=t-this.pointer.x,this.pointer.vy=s-this.pointer.y,this.pointer.x=t,this.pointer.y=s,this.pointer.activeUntil=performance.now()+1400,this.lastInteraction=performance.now(),this.sceneState.mode==="idle"&&this.setMode("aware")};onPointerLeave=()=>{this.pointer.activeUntil=performance.now()+180};onTouchStart=()=>{this.lastInteraction=performance.now(),this.sceneState.mode==="idle"?this.setMode("aware"):this.sceneState.mode==="aware"&&this.setMode("locked")};advancePrimary(){this.sceneState.mode==="idle"?this.setMode("aware"):this.sceneState.mode==="aware"?this.setMode("locked"):this.sceneState.mode==="locked"?this.setMode("observing"):this.pulseAnomaly(.2)}stepMode(e){const i=Math.max(0,Math.min(p.length-1,p.indexOf(this.sceneState.mode)+e));this.setMode(p[i])}setMode(e){if(this.sceneState.mode=e,this.metrics.state=e,e==="locked"&&this.forcedState!=="locked"){this.lockedUntil=performance.now()+1e3;const i=window.setTimeout(()=>{this.sceneState.mode==="locked"&&this.setMode("observing"),this.timeouts.delete(i)},820);this.timeouts.add(i)}this.applySceneState()}pulseAnomaly(e){this.sceneState.anomalyLevel=Math.min(1,this.sceneState.anomalyLevel+e)}resize(){const e=y[this.profile],i=Math.min(e.dpr,window.devicePixelRatio||1,this.profile==="full"?1.5:1.2),t=Math.max(1,Math.floor(this.dom.canvas.clientWidth*i)),s=Math.max(1,Math.floor(this.dom.canvas.clientHeight*i));this.dom.canvas.width=t,this.dom.canvas.height=s,this.webglActive&&[this.fbSource,this.fbDisplace,this.fbThreshold,this.fbChroma,this.fbPrev,this.fbNext].filter(Boolean).forEach(n=>this.sizeTarget(n,t,s))}render(e){const i=this.lastNow?e-this.lastNow:16.7;this.lastNow=e,this.updateState(e,i),this.webglActive&&this.renderGl(e,i),this.paintTelemetry(e),this.measureMetrics(i),this.applySceneState()}updateState(e,i){const t=this.pointer.activeUntil>e;this.sceneState.pointer={x:this.pointer.x,y:this.pointer.y,vx:this.pointer.vx,vy:this.pointer.vy,active:t};const s=Math.min(1,Math.hypot(this.pointer.vx,this.pointer.vy)*16+(t?.25:0)),n=(Math.sin(e*.0012+this.phase)+1)*.5;!this.forcedState&&this.sceneState.mode==="aware"&&!t&&e-this.lastInteraction>3200&&this.setMode("idle"),!this.forcedState&&this.sceneState.mode==="locked"&&e>this.lockedUntil&&this.setMode("observing");const a={idle:{signal:.24,focus:.14,anomaly:.08,nodes:2,latency:42,checksum:"latent"},aware:{signal:.48,focus:.42,anomaly:.16,nodes:4,latency:28,checksum:"pending"},locked:{signal:.82,focus:.84,anomaly:.24,nodes:6,latency:18,checksum:"verified"},observing:{signal:.72,focus:.94,anomaly:.34,nodes:8,latency:14,checksum:"verified"}}[this.sceneState.mode],o=this.reducedMotion?.35:1;this.sceneState.signalStrength+=(a.signal+n*.08*o+s*.15-this.sceneState.signalStrength)*.08,this.sceneState.focusLevel+=(a.focus+s*.12-this.sceneState.focusLevel)*.1,this.sceneState.anomalyLevel+=(a.anomaly+Math.max(0,Math.sin(e*.005))*.08*(this.sceneState.mode==="observing"?1:.4)-this.sceneState.anomalyLevel)*.08,this.sceneState.latency+=(a.latency+(1-s)*3-this.sceneState.latency)*.12,this.sceneState.nodeCount+=(a.nodes-this.sceneState.nodeCount)*.12,this.sceneState.checksum=a.checksum,this.pointer.vx*=this.reducedMotion?.75:.86,this.pointer.vy*=this.reducedMotion?.75:.86,this.reducedMotion&&(this.sceneState.anomalyLevel=Math.min(this.sceneState.anomalyLevel,a.anomaly+.06))}paintTelemetry(e){const i=this.dom.waveformBars,t=this.dom.signalBars,s=this.sceneState.signalStrength,n=this.sceneState.focusLevel,r=this.sceneState.anomalyLevel;i.forEach((a,o)=>{const d=o/Math.max(1,i.length-1),l=Math.sin(e*.006+d*9+s*6)*.18,f=Math.max(.16,Math.min(1,.18+s*.4+n*(1-Math.abs(.5-d))*.48+l));a.style.setProperty("--bar",f.toFixed(3))}),t.forEach((a,o)=>{const d=(o+1)/t.length,l=Math.max(.08,Math.min(1,s+r*.25-d*.25));a.style.setProperty("--bar",l.toFixed(3)),a.style.setProperty("--active",l>.34?"1":"0.2")}),this.dom.nodes.forEach((a,o)=>{const d=Math.round(this.sceneState.nodeCount),l=o<d;a.style.setProperty("--node-active",l?"1":"0.2"),a.style.setProperty("--node-scale",l?String(.82+s*.42):"0.72")})}measureMetrics(e){this.frameSamples.push(e),this.refreshSamples.push(e),this.frameSamples.length>48&&this.frameSamples.shift(),this.refreshSamples.length>96&&this.refreshSamples.shift(),e>34&&(this.droppedFrames+=1);const i=this.frameSamples.reduce((s,n)=>s+n,0)/this.frameSamples.length,t=this.refreshSamples.reduce((s,n)=>s+n,0)/this.refreshSamples.length;this.metrics.averageFrameTime=i,this.metrics.renderFps=Math.round(1e3/i),this.metrics.refreshRateEstimate=Math.round(1e3/t),this.metrics.fps=this.metrics.renderFps,this.metrics.droppedFrames=this.droppedFrames,this.metrics.profile=this.profile,this.metrics.webglActive=this.webglActive,this.metrics.fallbackActive=this.fallbackActive,this.metrics.passCount=this.webglActive?6:0,this.metrics.state=this.sceneState.mode,window.KODEX_OBSERVE_METRICS={...this.metrics},this.root.setAttribute("data-kdx-fps",String(this.metrics.fps)),this.root.setAttribute("data-kdx-frame-time",this.metrics.averageFrameTime.toFixed(2)),this.root.setAttribute("data-kdx-dropped",String(this.metrics.droppedFrames)),this.root.setAttribute("data-kdx-render-fps",String(this.metrics.renderFps)),this.root.setAttribute("data-kdx-refresh",String(this.metrics.refreshRateEstimate)),this.root.setAttribute("data-kdx-metrics-json",JSON.stringify(this.metrics)),window.__KDX_OBSERVE_V2__={metrics:{...this.metrics},state:this.sceneState.mode,scene:{...this.sceneState}}}applySceneState(e=!1){const i=D[this.sceneState.mode],t=E[this.sceneState.mode];this.root.dataset.webgl=this.webglActive?"active":"fallback",this.root.dataset.state=this.sceneState.mode,this.root.dataset.checksum=this.sceneState.checksum,this.root.setAttribute("data-kdx-scroll-height",String(document.documentElement.scrollHeight)),this.root.setAttribute("data-kdx-inner-height",String(window.innerHeight)),this.root.setAttribute("data-kdx-overflow",document.documentElement.scrollHeight>window.innerHeight?"1":"0"),this.root.style.setProperty("--signal-strength",this.sceneState.signalStrength.toFixed(3)),this.root.style.setProperty("--focus-level",this.sceneState.focusLevel.toFixed(3)),this.root.style.setProperty("--anomaly-level",this.sceneState.anomalyLevel.toFixed(3)),this.root.style.setProperty("--node-count",String(Math.round(this.sceneState.nodeCount))),this.root.style.setProperty("--latency-ms",`${this.sceneState.latency.toFixed(1)}ms`),this.root.style.setProperty("--mode-index",String(t)),this.root.classList.toggle("is-protocol-open",this.protocolOpen),this.root.classList.toggle("is-webgl-active",this.webglActive),this.root.classList.toggle("is-fallback-active",this.fallbackActive),this.dom.statusChip&&(this.dom.statusChip.textContent=i.chip),this.dom.profileChip&&(this.dom.profileChip.textContent=`PROFILE · ${this.profile.toUpperCase()}`),this.dom.checksumChip&&(this.dom.checksumChip.textContent=`CHECKSUM · ${this.sceneState.checksum.toUpperCase()}`),this.dom.stateCopy&&(this.dom.stateCopy.textContent=i.message),this.dom.hiddenMessage&&(this.dom.hiddenMessage.textContent=i.hidden),this.dom.protocolCopy&&(this.dom.protocolCopy.textContent=i.protocol),this.dom.dossierCopy&&(this.dom.dossierCopy.textContent=i.dossier),this.dom.dossierCopyBlock&&(this.dom.dossierCopyBlock.textContent=i.dossier),this.dom.primaryCta&&(this.dom.primaryCta.textContent=i.cta),this.dom.signalReadout&&(this.dom.signalReadout.textContent=`${Math.round(this.sceneState.signalStrength*100)}%`),this.dom.focusReadout&&(this.dom.focusReadout.textContent=`${Math.round(this.sceneState.focusLevel*100)}%`),this.dom.anomalyReadout&&(this.dom.anomalyReadout.textContent=`${Math.round(this.sceneState.anomalyLevel*100)}%`),this.dom.nodeReadout&&(this.dom.nodeReadout.textContent=String(Math.round(this.sceneState.nodeCount)).padStart(2,"0")),this.dom.latencyReadout&&(this.dom.latencyReadout.textContent=`${Math.round(this.sceneState.latency)}MS`),this.dom.latencyInline&&(this.dom.latencyInline.textContent=`${Math.round(this.sceneState.latency)}MS`),this.dom.checksumReadout&&(this.dom.checksumReadout.textContent=this.sceneState.checksum.toUpperCase()),this.dom.checksumFoot&&(this.dom.checksumFoot.textContent=this.sceneState.checksum.toUpperCase()),this.dom.signalTag&&(this.dom.signalTag.textContent=`MODE ${this.sceneState.mode.toUpperCase()} · CORE ${Math.round(this.sceneState.signalStrength*100)} · NODES ${Math.round(this.sceneState.nodeCount)}`),this.dom.telemetryCopy&&(this.dom.telemetryCopy.textContent=`FOCUS ${Math.round(this.sceneState.focusLevel*100)} · ANOMALY ${Math.round(this.sceneState.anomalyLevel*100)} · CHECKSUM ${this.sceneState.checksum.toUpperCase()}`),this.dom.metricChip&&(this.dom.metricChip.textContent=`${this.webglActive?"WEBGL ACTIVE":"SVG FALLBACK"} · PASS ${this.webglActive?"06":"00"} · ${this.metrics.fps||0} FPS`),this.dom.sourceReadout&&(this.dom.sourceReadout.textContent=this.sceneState.mode==="idle"?"UNKNOWN":"RELATIONAL FIELD"),this.dom.acquisitionReadout&&(this.dom.acquisitionReadout.textContent=this.sceneState.mode==="observing"?"ACTIVE FEEDBACK":this.sceneState.mode==="locked"?"TARGET LOCK":this.sceneState.mode==="aware"?"PRESENCE SWEEP":"PASSIVE LISTEN"),this.dom.confidenceReadout&&(this.dom.confidenceReadout.textContent=this.sceneState.mode==="observing"?"HIGH":this.sceneState.mode==="locked"?"STABLE":this.sceneState.mode==="aware"?"RISING":"LOW"),this.dom.windowReadout&&(this.dom.windowReadout.textContent=`${Math.max(.5,this.metrics.averageFrameTime/10).toFixed(1).padStart(5,"0")}S`),this.dom.rightRailA&&(this.dom.rightRailA.textContent=`SOURCE · ${this.sceneState.mode==="idle"?"UNKNOWN":"DETECTED"}`),this.dom.rightRailB&&(this.dom.rightRailB.textContent=`MODE · ${this.sceneState.mode.toUpperCase()}`),this.dom.rightRailC&&(this.dom.rightRailC.textContent=`FIELD · ${this.sceneState.checksum.toUpperCase()}`),this.dom.rightRailD&&(this.dom.rightRailD.textContent=this.webglActive?"RENDER · MULTIPASS":"RENDER · SVG FALLBACK"),(e||this.debugEnabled)&&this.dom.debug&&(this.dom.debug.hidden=!this.debugEnabled),this.updateDebug()}updateDebug(){!this.debugEnabled||!this.dom.debugText||!this.dom.debug||(this.dom.debug.hidden=!1,this.dom.debugText.textContent=[`mode=${this.sceneState.mode}`,`profile=${this.profile}`,`webglActive=${this.webglActive}`,`fallbackActive=${this.fallbackActive}`,`checksum=${this.sceneState.checksum}`,`signal=${this.sceneState.signalStrength.toFixed(3)}`,`focus=${this.sceneState.focusLevel.toFixed(3)}`,`anomaly=${this.sceneState.anomalyLevel.toFixed(3)}`,`nodes=${this.sceneState.nodeCount.toFixed(2)}`,`latency=${this.sceneState.latency.toFixed(1)}ms`,`fps=${this.metrics.fps}`,`avgFrame=${this.metrics.averageFrameTime.toFixed(2)}ms`,`refresh≈${this.metrics.refreshRateEstimate}hz`,`dropped=${this.metrics.droppedFrames}`,`passCount=${this.metrics.passCount}`,`pointer=${this.pointer.x.toFixed(2)},${this.pointer.y.toFixed(2)}`,`fallbackReason=${this.webglActive?"none":"webgl-unavailable-or-init-failed"}`,`json=${JSON.stringify(this.metrics)}`].join(`
`))}renderGl(e,i){if(!this.gl||!this.programs||!this.fbSource||!this.fbDisplace||!this.fbThreshold||!this.fbChroma||!this.fbPrev||!this.fbNext)return;const t=this.gl,s=this.dom.canvas.width,n=this.dom.canvas.height,r=Math.min(.05,i/1e3),a={u_time:e/1e3,u_delta:r,u_resolution:[s,n],u_pointer:[this.pointer.x,this.pointer.y],u_pointerVelocity:[this.pointer.vx,this.pointer.vy],u_audioLow:this.sceneState.signalStrength,u_audioMid:this.sceneState.focusLevel,u_audioHigh:this.sceneState.anomalyLevel,u_state:.12+E[this.sceneState.mode]*.28,u_transition:this.sceneState.focusLevel,u_intensity:.2+this.sceneState.signalStrength*.88,u_seed:4.137,u_feedbackAmount:.12+this.sceneState.focusLevel*.34,u_scanPosition:.22+this.sceneState.signalStrength*.56,u_reducedMotion:this.reducedMotion?1:0};this.pass(this.programs.source,this.fbSource,o=>{this.setCommonUniforms(o,a),t.uniform1f(o.u_particleScale,y[this.profile].particles)}),this.pass(this.programs.displace,this.fbDisplace,o=>{this.bindTexture(o.u_tex,this.fbSource.tex,0),t.uniform1f(o.u_time,a.u_time),t.uniform2f(o.u_resolution,s,n),t.uniform2f(o.u_pointer,this.pointer.x,this.pointer.y),t.uniform1f(o.u_audioMid,this.sceneState.focusLevel),t.uniform1f(o.u_intensity,a.u_intensity),t.uniform1f(o.u_reducedMotion,this.reducedMotion?1:0)}),this.pass(this.programs.threshold,this.fbThreshold,o=>{this.bindTexture(o.u_tex,this.fbDisplace.tex,0),t.uniform2f(o.u_resolution,s,n),t.uniform1f(o.u_audioHigh,this.sceneState.anomalyLevel),t.uniform1f(o.u_intensity,a.u_intensity)}),this.pass(this.programs.chroma,this.fbChroma,o=>{this.bindTexture(o.u_tex,this.fbThreshold.tex,0),t.uniform2f(o.u_resolution,s,n),t.uniform2f(o.u_pointer,this.pointer.x,this.pointer.y),t.uniform1f(o.u_transition,this.sceneState.focusLevel),t.uniform1f(o.u_audioHigh,this.sceneState.anomalyLevel)}),this.pass(this.programs.feedback,this.fbNext,o=>{this.bindTexture(o.u_scene,this.fbChroma.tex,0),this.bindTexture(o.u_prev,this.fbPrev.tex,1),t.uniform2f(o.u_resolution,s,n),t.uniform2f(o.u_pointerVelocity,this.pointer.vx,this.pointer.vy),t.uniform1f(o.u_feedbackAmount,a.u_feedbackAmount),t.uniform1f(o.u_time,a.u_time),t.uniform1f(o.u_transition,this.sceneState.focusLevel),t.uniform1f(o.u_reducedMotion,this.reducedMotion?1:0)}),this.pass(this.programs.crt,null,o=>{this.bindTexture(o.u_tex,this.fbNext.tex,0),t.uniform2f(o.u_resolution,s,n),t.uniform1f(o.u_time,a.u_time),t.uniform1f(o.u_scanPosition,a.u_scanPosition),t.uniform1f(o.u_intensity,a.u_intensity),t.uniform1f(o.u_reducedMotion,this.reducedMotion?1:0)}),[this.fbPrev,this.fbNext]=[this.fbNext,this.fbPrev]}initGL(){const e=this.dom.canvas.getContext("webgl2",{alpha:!0,antialias:!1,preserveDrawingBuffer:!0,powerPreference:this.profile==="full"?"high-performance":"default"});if(!e)throw new Error("WebGL2 unavailable");this.gl=e}createPrograms(){this.programs={source:this.createProgram(u,L),displace:this.createProgram(u,F),threshold:this.createProgram(u,O),chroma:this.createProgram(u,P),feedback:this.createProgram(u,N),crt:this.createProgram(u,q)}}createBuffers(){const e=this.gl;this.quad=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,this.quad),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW)}createTargets(){this.fbSource=this.createTarget(),this.fbDisplace=this.createTarget(),this.fbThreshold=this.createTarget(),this.fbChroma=this.createTarget(),this.fbPrev=this.createTarget(),this.fbNext=this.createTarget()}createProgram(e,i){const t=this.gl,s=this.compile(t.VERTEX_SHADER,e),n=this.compile(t.FRAGMENT_SHADER,i),r=t.createProgram();if(!r)throw new Error("Program allocation failed");if(t.attachShader(r,s),t.attachShader(r,n),t.bindAttribLocation(r,0,"a_position"),t.linkProgram(r),!t.getProgramParameter(r,t.LINK_STATUS))throw new Error(t.getProgramInfoLog(r)||"Shader link failed");const a={},o=t.getProgramParameter(r,t.ACTIVE_UNIFORMS);for(let d=0;d<o;d+=1){const l=t.getActiveUniform(r,d);l&&(a[l.name]=t.getUniformLocation(r,l.name))}return{program:r,uniforms:a}}compile(e,i){const t=this.gl,s=t.createShader(e);if(!s)throw new Error("Shader allocation failed");if(t.shaderSource(s,i),t.compileShader(s),!t.getShaderParameter(s,t.COMPILE_STATUS))throw new Error(t.getShaderInfoLog(s)||"Shader compile failed");return s}createTarget(){const e=this.gl,i=e.createTexture(),t=e.createFramebuffer();if(!i||!t)throw new Error("Framebuffer allocation failed");return e.bindTexture(e.TEXTURE_2D,i),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,t),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,i,0),{fb:t,tex:i,width:0,height:0}}sizeTarget(e,i,t){if(e.width===i&&e.height===t)return;const s=this.gl;e.width=i,e.height=t,s.bindTexture(s.TEXTURE_2D,e.tex),s.texImage2D(s.TEXTURE_2D,0,s.RGBA,i,t,0,s.RGBA,s.UNSIGNED_BYTE,null)}pass(e,i,t){const s=this.gl;s.bindFramebuffer(s.FRAMEBUFFER,i?i.fb:null),s.viewport(0,0,this.dom.canvas.width,this.dom.canvas.height),s.useProgram(e.program),s.bindBuffer(s.ARRAY_BUFFER,this.quad),s.enableVertexAttribArray(0),s.vertexAttribPointer(0,2,s.FLOAT,!1,0,0),t(e.uniforms),s.drawArrays(s.TRIANGLES,0,3)}bindTexture(e,i,t){const s=this.gl;s.activeTexture(s.TEXTURE0+t),s.bindTexture(s.TEXTURE_2D,i),e&&s.uniform1i(e,t)}setCommonUniforms(e,i){const t=this.gl,s=i.u_resolution,n=i.u_pointer,r=i.u_pointerVelocity;t.uniform1f(e.u_time,i.u_time),t.uniform1f(e.u_delta,i.u_delta),t.uniform2f(e.u_resolution,s[0],s[1]),t.uniform2f(e.u_pointer,n[0],n[1]),t.uniform2f(e.u_pointerVelocity,r[0],r[1]),t.uniform1f(e.u_audioLow,i.u_audioLow),t.uniform1f(e.u_audioMid,i.u_audioMid),t.uniform1f(e.u_audioHigh,i.u_audioHigh),t.uniform1f(e.u_state,i.u_state),t.uniform1f(e.u_transition,i.u_transition),t.uniform1f(e.u_intensity,i.u_intensity),t.uniform1f(e.u_seed,i.u_seed),t.uniform1f(e.u_feedbackAmount,i.u_feedbackAmount),t.uniform1f(e.u_scanPosition,i.u_scanPosition),t.uniform1f(e.u_reducedMotion,i.u_reducedMotion)}}const C=new WeakMap;function B(){document.querySelectorAll("[data-kdx-observe-v2]").forEach(c=>{if(C.has(c))return;const e=new U(c);e.load().then(()=>e.start()),C.set(c,e)})}const v="KDX-SCN-OBSERVER-002",S={scene_id:"02_OBSERVER",node_id:v,canonical:{idle:"dormant",aware:"aware",locked:"resonant",observing:"mutated",reflected:"mutated",remembered:"remembered"}},k=4e3,V=new Set(["locked","observing"]);function $(c){const e=M(),i=[];c.dataset.kdxScene=S.scene_id,c.dataset.kdxNode=S.node_id;const t=w();e.set("memory",t),c.style.setProperty("--kdx-memoria",t.toFixed(3));const s=T("observer_focus");s&&(c.dataset.kdxRecordado="1",c.dataset.kdxCanonState="remembered",g("observer_pattern_revisited",v,{memoria:t}));let n=0,r=0,a=!1,o=!1;const d=()=>{try{const h=JSON.parse(c.getAttribute("data-kdx-metrics-json")||"{}"),m=Number(h.focus??h.focusLevel);return Number.isFinite(m)?Math.min(1,Math.max(0,m)):0}catch{return 0}},l=()=>{const h=c.dataset.state||"idle",m=S.canonical[h];m&&(c.dataset.kdxCanonState=s&&h==="idle"?"remembered":m);const x=V.has(h),b=d();e.set("proximity",b),x&&!n?(n=performance.now(),a||(a=!0,g("observer_focus",v,{foco:b}))):!x&&n&&(r+=performance.now()-n,n=0)},f=new MutationObserver(l);f.observe(c,{attributes:!0,attributeFilter:["data-state","data-kdx-metrics-json"]}),i.push(()=>f.disconnect()),l();const A=()=>{if(o)return;const h=r+(n?performance.now()-n:0);h>=k&&(o=!0,g("observer_dwell",v,{sostenido:h/(k*4),foco:d()}),e.set("dwell",1))},R=window.setInterval(A,500);i.push(()=>window.clearInterval(R));const _=()=>{document.hidden&&n&&(r+=performance.now()-n,n=0)};return document.addEventListener("visibilitychange",_),i.push(()=>document.removeEventListener("visibilitychange",_)),()=>{for(const h of i)h()}}B();document.querySelectorAll("[data-kdx-observe-v2]").forEach(c=>{c instanceof HTMLElement&&$(c)});
