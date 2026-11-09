const D=`#version 300 es
// Fullscreen triangle — covers the viewport with 3 vertices.
in vec2 p;
out vec2 v_uv;
void main() {
  v_uv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}
`,w=`#version 300 es
// spiralField — the source pass. An Achroma work is read as matter and warped
// through a logarithmic / projective spiral. Movement and audio bend the field.
// KODEX geometry: −∞ (descent) and +∞ (manifestation) meet at 0.
// uniforms:
//   u_tex    sampler2D  the artwork (input matter)      range: —
//   u_res    vec2       framebuffer resolution (px)     range: >0
//   u_time   float      seconds                         range: 0..∞
//   u_mouse  vec2       pointer, normalized             range: -1..1
//   u_vel    float      pointer speed                   range: 0..1
//   u_audio  float      audio energy (FFT)              range: 0..1
//   u_signal float      the SIGNAL                      range: 0..1
//   u_seed   float      reproducible seed               range: 0..1
// cost: ~1 texture fetch + trig; cheap. mobile-safe.
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_vel;
uniform float u_audio;
uniform float u_signal;
uniform float u_seed;

void main() {
  float aspect = u_res.x / max(1.0, u_res.y);
  vec2 c = v_uv - 0.5;
  c.x *= aspect;
  float r = length(c);
  float a = atan(c.y, c.x);

  // logarithmic spiral warp; audio opens it, the pointer turns it
  float b = 0.15 + u_audio * 0.12 + u_seed * 0.05;
  float turn = u_time * 0.045 + u_mouse.x * 0.7 + u_vel * 0.8;
  a += b * log(r + 1e-3) * 3.0 + turn;
  r *= 1.0 + 0.05 * sin(u_time * 0.3 + r * 9.0) + u_audio * 0.06;

  vec2 warp = vec2(cos(a), sin(a)) * r;
  warp.x /= aspect;
  vec2 suv = fract(warp + 0.5 + u_mouse * 0.03);

  vec3 col = texture(u_tex, suv).rgb;
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 base = vec3(l);

  // the SIGNAL reveals colour in the bright regions (radiation dimension)
  vec3 gold = vec3(0.82, 0.68, 0.31);
  vec3 rosa = vec3(0.88, 0.33, 0.61);
  vec3 sig = mix(gold, rosa, 0.5 + 0.5 * sin(u_time * 0.12));
  col = mix(base, base * sig * 2.2, u_signal * smoothstep(0.35, 0.95, l));

  o = vec4(col, 1.0);
}
`,y=`#version 300 es
// flowLines — LUMINOUS THREAD FIELD. Glowing filaments flow along a logarithmic
// spiral and morph toward phyllotaxis, inside a circle. The language of light
// installations (鲲·游于无穷 / fat glowing lines / flow field), not texture-warp.
// The artwork only tints; the FORM is light. uniforms: u_tex,u_res,u_time,u_mouse,u_audio,u_signal,u_seed
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_audio;
uniform float u_signal;
uniform float u_seed;
uniform vec3 u_tint;        // per-work colour (each page its own light)

float hash(float n) { return fract(sin(n) * 43758.5453); }

void main() {
  float aspect = u_res.x / max(1.0, u_res.y);
  vec2 c = v_uv - 0.5; c.x *= aspect;
  c -= u_mouse * 0.06;
  float r = length(c);
  float a = atan(c.y, c.x);
  float t = u_time * 0.15;

  float arms = mix(5.0, 8.0, u_signal);
  float k = mix(2.0, 3.2, 0.5 + 0.5 * sin(t * 0.3));

  vec3 col = vec3(0.0);
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float off = fi * 0.7 + hash(fi + u_seed * 13.0) * 6.2831;
    float phase = a * arms + log(r + 0.04) * k * 6.0 - t * (1.0 + fi * 0.08) + off;
    float thread = pow(0.5 + 0.5 * sin(phase), 34.0);         // thin bright filament
    float ring = pow(0.5 + 0.5 * sin(r * 42.0 - t * 2.0 + fi), 8.0);
    float bright = thread * (0.55 + 0.45 * ring) * (0.7 + u_audio * 0.9);
    // at rest: the work's own palette (B/W stays B/W). Colour variations emerge
    // only through interference — the SIGNAL / touching the work.
    vec3 tint = u_tint;
    tint = mix(tint, vec3(0.40, 0.82, 0.92), u_signal * 0.28 * (0.5 + 0.5 * sin(fi + t))); // cyan
    tint = mix(tint, vec3(0.90, 0.40, 0.62), u_signal * 0.6); // rosa radiation
    col += tint * bright;
  }

  float disc = smoothstep(0.52, 0.28, r);                     // circle framing
  col *= disc;
  col += u_tint * smoothstep(0.05, 0.0, r) * 0.7;             // core
  col += texture(u_tex, v_uv).rgb * 0.035 * disc;             // faint artwork tint

  o = vec4(col, 1.0);
}
`,M=`#version 300 es
// blackSun — cosmic engine. A black disc (event horizon), a bright accretion ring,
// a corona, and the artwork bent around it by gravitational lensing.
// Symbolic centre of KODEX, built as a real lensing shader — not a claim of astronomy.
// uniforms: u_tex, u_res, u_time, u_mouse, u_audio, u_signal, u_seed
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_audio;
uniform float u_signal;
uniform float u_seed;

void main() {
  float aspect = u_res.x / max(1.0, u_res.y);
  vec2 c = v_uv - 0.5; c.x *= aspect;
  c -= u_mouse * 0.10;
  float r = length(c);
  float a = atan(c.y, c.x);
  float rh = 0.15 + u_audio * 0.02;                 // event horizon

  // gravitational lensing — light bends outward near the horizon
  vec2 dir = c / max(r, 1e-4);
  float lens = rh * rh / max(r, 1e-3);
  vec2 suv = c + dir * lens * 0.6; suv.x /= aspect; suv += 0.5;
  vec3 bg = texture(u_tex, fract(suv)).rgb;
  float lum = dot(bg, vec3(0.299, 0.587, 0.114));
  vec3 col = vec3(lum) * 0.45;

  // accretion ring — rotating hot matter
  float ring = smoothstep(rh + 0.16, rh, r) * smoothstep(rh - 0.02, rh + 0.02, r);
  float acc = 0.5 + 0.5 * sin(a * 6.0 - u_time * 2.0 + r * 20.0);
  vec3 ringcol = mix(vec3(0.85, 0.42, 0.14), vec3(0.92, 0.76, 0.40), acc);
  col += ring * acc * ringcol * (1.3 + u_audio);

  // corona — thin bright rim at the horizon; signal turns it rosa
  float corona = smoothstep(rh + 0.035, rh, r) * smoothstep(rh - 0.02, rh, r);
  vec3 cor = mix(vec3(0.92, 0.72, 0.32), vec3(0.90, 0.40, 0.62), u_signal);
  col += corona * cor * 2.2;

  // event horizon — pure black
  col *= smoothstep(rh - 0.006, rh + 0.006, r);

  o = vec4(col, 1.0);
}
`,S=`#version 300 es
// mirror — polar kaleidoscope. Segments fold the field into radial symmetry.
// uniforms: u_tex, u_res, u_seg (1..24), u_angle (rad), u_mix (0..1)
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_seg;
uniform float u_angle;
uniform float u_mix;
void main() {
  float aspect = u_res.x / max(1.0, u_res.y);
  vec2 c = v_uv - 0.5; c.x *= aspect;
  float r = length(c);
  float a = atan(c.y, c.x) + u_angle;
  float seg = max(1.0, u_seg);
  float span = 6.2831853 / seg;
  a = mod(a, span);
  a = abs(a - span * 0.5);
  vec2 p = vec2(cos(a), sin(a)) * r; p.x /= aspect; p += 0.5;
  vec3 col = texture(u_tex, fract(p)).rgb;
  vec3 orig = texture(u_tex, v_uv).rgb;
  o = vec4(mix(orig, col, u_mix), 1.0);
}
`,F=`#version 300 es
// distort — displacement field. mode: 0 ripple · 1 lens · 2 vortex.
// uniforms: u_tex, u_res, u_amt (0..1), u_mode, u_time, u_audio
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_amt;
uniform float u_mode;
uniform float u_time;
uniform float u_audio;
void main() {
  vec2 uv = v_uv;
  vec2 c = uv - 0.5;
  float r = length(c);
  vec2 d = vec2(0.0);
  if (u_mode < 0.5) {                     // ripple
    d = c * sin(r * 26.0 - u_time * 1.6) * 0.5;
  } else if (u_mode < 1.5) {              // lens / event-horizon pinch
    d = c * (r * r) * (3.0 + u_audio * 2.0);
  } else {                                // vortex
    float a = atan(c.y, c.x) + (0.45 - r) * (4.0 + u_audio * 3.0);
    d = vec2(cos(a), sin(a)) * r - c;
  }
  o = vec4(texture(u_tex, uv + d * u_amt).rgb, 1.0);
}
`,U=`#version 300 es
// color — signal mapping. mode: 0 gold · 1 rosa · 2 spectral · 3 thermal.
// Colour appears as energy, not decoration. uniforms: u_tex, u_mode, u_amt
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_tex;
uniform float u_mode;
uniform float u_amt;
void main() {
  vec3 col = texture(u_tex, v_uv).rgb;
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 outc = col;
  if (u_mode < 0.5) {                    // gold duotone (the SIGNAL)
    outc = mix(vec3(0.04, 0.03, 0.02), vec3(0.82, 0.68, 0.31), l);
  } else if (u_mode < 1.5) {             // rosa / Disco Solar radiation
    outc = mix(vec3(0.03, 0.0, 0.02), vec3(0.88, 0.33, 0.61), l);
  } else if (u_mode < 2.5) {             // spectral
    outc = 0.5 + 0.5 * cos(6.2831853 * (l + vec3(0.0, 0.33, 0.67)));
  } else {                               // thermal / false-colour scientific
    outc = vec3(smoothstep(0.2, 0.9, l), smoothstep(0.4, 1.0, l) * 0.6, smoothstep(0.7, 1.0, l) * 0.2);
  }
  o = vec4(mix(col, outc, u_amt), 1.0);
}
`,I=`#version 300 es
// feedback — real ping-pong. The previous accumulation is rotated, scaled and
// decayed, then merged with the current scene. This is video-feedback / trails,
// executed for real with render targets (not a CSS trick).
// uniforms:
//   u_scene sampler2D  current source pass
//   u_prev  sampler2D  previous accumulation (ping-pong)
//   u_decay float      trail persistence           range: 0..1 (~0.9)
//   u_audio float      audio energy                range: 0..1
// cost: 2 texture fetches. cheap.
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_scene;
uniform sampler2D u_prev;
uniform float u_decay;
uniform float u_audio;

void main() {
  vec2 c = v_uv - 0.5;
  float ang = 0.0022 + u_audio * 0.005;
  float sc = 0.9955 - u_audio * 0.004;
  mat2 R = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  vec2 puv = R * c * sc + 0.5;
  vec3 prev = texture(u_prev, puv).rgb * u_decay;
  vec3 scene = texture(u_scene, v_uv).rgb;
  o = vec4(max(scene, prev), 1.0);
}
`,P=`#version 300 es
// composite — final pass to screen. Cheap bloom (bright-pass + 4 taps), phosphor
// scanlines, vignette, sensor grain. Retro-ritual Hi-Fi, not synthwave.
// uniforms:
//   u_tex    sampler2D  accumulation to present
//   u_res    vec2       resolution
//   u_time   float      seconds
//   u_audio  float      audio energy   range: 0..1
// cost: ~5 texture fetches. mobile-safe.
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_time;
uniform float u_audio;

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec2 uv = v_uv;
  vec3 col = texture(u_tex, uv).rgb;

  // cheap bloom
  vec2 px = 1.0 / u_res;
  vec3 bloom = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    float ai = float(i) * 1.5708;
    vec2 d = vec2(cos(ai), sin(ai)) * px * (3.0 + u_audio * 7.0);
    bloom += max(vec3(0.0), texture(u_tex, uv + d).rgb - 0.55);
  }
  col += bloom * 0.5 * (0.6 + u_audio);

  // phosphor scanlines
  col *= 0.92 + 0.08 * sin(uv.y * u_res.y * 3.14159);
  // vignette
  col *= smoothstep(1.15, 0.32, length(uv - 0.5));
  // grain
  col += (hash(uv * u_res + u_time) - 0.5) * 0.04;

  o = vec4(col, 1.0);
}
`,p=Object.freeze({HIGH:1.5,MID:1.25,LOW:1,STATIC:.85}),k=new Set(["E00","T01","M11","R10"]),T=new Set(["flow","spiral","blacksun"]),L=new Set(["mirror","distort","color"]),f=(m,t,e)=>Math.max(t,Math.min(e,m)),b=(m,t)=>1-Math.exp(-m*t);class B{constructor(t,e={}){this.canvas=t,this.onTelemetry=e.onTelemetry||(()=>{}),this.getAudio=e.getAudio||(()=>0),this.seed=e.seed??Math.random(),this.reduce=matchMedia("(prefers-reduced-motion: reduce)").matches,this.renderTier=String(e.renderTier||"HIGH").toUpperCase(),p[this.renderTier]||(this.renderTier="HIGH"),this.requestedMaxDpr=e.maxDpr??1.5,this.maxDpr=Math.min(this.requestedMaxDpr,p[this.renderTier]),this.dpr=Math.min(this.maxDpr,window.devicePixelRatio||1),this.state={time:0,mouse:[0,0],targetMouse:[0,0],vel:0,signal:0,targetSignal:0},this.raf=0,this.running=!1,this._fps=0,this._frames=0,this._acc=0,this._last=0,this.effects=[{name:"mirror",on:!1,params:{u_seg:6,u_angle:0,u_mix:1}},{name:"distort",on:!1,params:{u_amt:.18,u_mode:0}},{name:"color",on:!1,params:{u_mode:0,u_amt:.85}}],this.recipeEffects=null,this.recipeDecay=.9,this.decay=this.recipeDecay,this.sourceMode="flow",this.tint=[.85,.72,.35],this.planId=null,this._initGL()}_initGL(){const t=this.canvas.getContext("webgl2",{antialias:!1,alpha:!1,powerPreference:"high-performance",preserveDrawingBuffer:!0});if(!t){this.failed=!0,this.onTelemetry({error:"NO WEBGL2"});return}this.gl=t;const e=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,e),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW),this.buf=e,this.progs={spiral:this._program(w),flow:this._program(y),blacksun:this._program(M),mirror:this._program(S),distort:this._program(F),color:this._program(U),feedback:this._program(I),composite:this._program(P)},this.fbScene=this._makeFBO(),this.fbA=this._makeFBO(),this.fbB=this._makeFBO(),this.fbC=this._makeFBO(),this.fbD=this._makeFBO(),this._resize(),addEventListener("resize",()=>this._resize(),{passive:!0}),this._bindInput()}_compile(t,e){const n=this.gl,i=n.createShader(t);return n.shaderSource(i,e),n.compileShader(i),n.getShaderParameter(i,n.COMPILE_STATUS)?i:(console.error(n.getShaderInfoLog(i),e),null)}_program(t){const e=this.gl,n=this._compile(e.VERTEX_SHADER,D),i=this._compile(e.FRAGMENT_SHADER,t),r=e.createProgram();if(e.attachShader(r,n),e.attachShader(r,i),e.bindAttribLocation(r,0,"p"),e.linkProgram(r),!e.getProgramParameter(r,e.LINK_STATUS))return console.error(e.getProgramInfoLog(r)),null;const s={},a=e.getProgramParameter(r,e.ACTIVE_UNIFORMS);for(let u=0;u<a;u++){const l=e.getActiveUniform(r,u);s[l.name]=e.getUniformLocation(r,l.name)}return{pr:r,u:s}}_makeFBO(){const t=this.gl,e=t.createTexture();t.bindTexture(t.TEXTURE_2D,e),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE);const n=t.createFramebuffer();return t.bindFramebuffer(t.FRAMEBUFFER,n),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,e,0),{fb:n,tex:e}}_sizeFBO(t,e,n){const i=this.gl;i.bindTexture(i.TEXTURE_2D,t.tex),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,e,n,0,i.RGBA,i.UNSIGNED_BYTE,null)}_resize(){this.gl;const t=Math.floor(innerWidth*this.dpr),e=Math.floor(innerHeight*this.dpr);this.W=t,this.H=e,this.canvas.width=t,this.canvas.height=e,this.canvas.style.width=innerWidth+"px",this.canvas.style.height=innerHeight+"px",[this.fbScene,this.fbA,this.fbB,this.fbC,this.fbD].forEach(n=>this._sizeFBO(n,t,e))}async loadArtwork(t){const e=this.gl,n=await new Promise((i,r)=>{const s=new Image;s.onload=()=>i(s),s.onerror=r,s.src=t});this.artwork||(this.artwork=e.createTexture()),e.bindTexture(e.TEXTURE_2D,this.artwork),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.MIRRORED_REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.MIRRORED_REPEAT),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,n),this.artworkUrl=t}setArtwork(t){return this.loadArtwork(t)}_bindInput(){let t=0,e=0;const n=(i,r)=>{const s=i/innerWidth*2-1,a=-(r/innerHeight*2-1);this.state.vel=Math.min(1,Math.hypot(s-t,a-e)*3),t=s,e=a,this.state.targetMouse=[s,a]};addEventListener("mousemove",i=>n(i.clientX,i.clientY),{passive:!0}),addEventListener("touchmove",i=>{i.touches[0]&&n(i.touches[0].clientX,i.touches[0].clientY)},{passive:!0})}setSignal(t){this.state.targetSignal=t?1:0}setState(t){const e={E00:{decayDelta:.02,colorMode:0,colorEnvelope:0,distEnvelope:0,mirror:!1,sig:!1},T01:{decayDelta:0,colorMode:0,colorEnvelope:.55,distEnvelope:1,mirror:!1,sig:!1},M11:{decayDelta:-.02,colorMode:1,colorEnvelope:1,distEnvelope:0,mirror:!0,sig:!0},R10:{decayDelta:.04,colorMode:2,colorEnvelope:.6,distEnvelope:0,mirror:!1,sig:!1}}[t];if(!e)return;this.phase=t,this.decay=f(this.recipeDecay+e.decayDelta,.78,.975);const n=this.recipeEffects||{},i=this.getEffect("color"),r=n.color;i.on=e.colorEnvelope>0&&(r?.on??!0),i.params.u_mode=r?.params?.u_mode??e.colorMode,i.params.u_amt=r?f((r.params?.u_amt??.85)*e.colorEnvelope,0,1):{E00:0,T01:.45,M11:.85,R10:.5}[t]??0;const s=this.getEffect("distort"),a=n.distort;s.on=e.distEnvelope>0&&(a?.on??!0),s.params.u_amt=a?f((a.params?.u_amt??.14)*e.distEnvelope,0,.5):t==="T01"?.14:s.params.u_amt,a?.params?.u_mode!==void 0&&(s.params.u_mode=a.params.u_mode);const u=this.getEffect("mirror"),l=n.mirror;u.on=e.mirror&&(l?.on??!0),l?.params&&Object.assign(u.params,l.params),this.setSignal(e.sig),(this.reduce||this.renderTier==="STATIC")&&this.artwork&&this.renderOnce()}toggle(t,e){const n=this.effects.find(i=>i.name===t);n&&(n.on=e===void 0?!n.on:e)}setParam(t,e,n){const i=this.effects.find(r=>r.name===t);i&&(i.params[e]=n)}getEffect(t){return this.effects.find(e=>e.name===t)}setSeed(t){this.seed=f(Number(t)||0,0,1)}setSourceMode(t){T.has(t)&&(this.sourceMode=t)}setTint(t){Array.isArray(t)&&t.length===3&&(this.tint=t.map(e=>f(Number(e)||0,0,1)))}setRenderTier(t){const e=String(t||"").toUpperCase();return p[e]?(this.renderTier=e,this.maxDpr=Math.min(this.requestedMaxDpr,p[e]),this.dpr=Math.min(this.maxDpr,window.devicePixelRatio||1),this.gl&&this._resize(),!0):!1}applyPlan(t={}){if(!t||typeof t!="object"||!t.plan_id||!t.runtime)throw new TypeError("KodexWorld.applyPlan requires a compiled manifestation plan.");const e=t.runtime;if(!k.has(e.initialPhase))throw new TypeError(`Unsupported KodexWorld phase: ${e.initialPhase}`);if(!T.has(e.sourceMode))throw new TypeError(`Unsupported KodexWorld source mode: ${e.sourceMode}`);if(!this.setRenderTier(e.renderTier||"HIGH"))throw new TypeError(`Unsupported KodexWorld render tier: ${e.renderTier}`);this.planId=t.plan_id,this.setSeed(e.seed),this.setSourceMode(e.sourceMode),this.setTint(e.tint),this.recipeDecay=f(Number(e.decay)||.9,.78,.975);const n={};for(const i of e.effects||[]){if(!L.has(i.name))throw new TypeError(`Unsupported KodexWorld runtime effect: ${i.name}`);n[i.name]={on:i.on!==!1,params:{...i.params||{}}};const r=this.getEffect(i.name);r.on=i.on!==!1,Object.assign(r.params,i.params||{})}return this.recipeEffects=n,this.setState(e.initialPhase),this}_drawQuad(){const t=this.gl;t.bindBuffer(t.ARRAY_BUFFER,this.buf),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,2,t.FLOAT,!1,0,0),t.drawArrays(t.TRIANGLES,0,3)}_pass(t,e,n,i){const r=this.gl;r.bindFramebuffer(r.FRAMEBUFFER,n?n.fb:null),r.viewport(0,0,this.W,this.H),r.useProgram(t.pr),r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D,e),t.u.u_tex&&r.uniform1i(t.u.u_tex,0),i&&i(t.u),this._drawQuad()}_render(t){const e=this.gl,n=this.state,i=this._last?Math.min(50,Math.max(0,t-this._last)):16,r=i/1e3;n.time+=r;const s=b(3.71,r),a=b(3.08,r);n.mouse[0]+=(n.targetMouse[0]-n.mouse[0])*s,n.mouse[1]+=(n.targetMouse[1]-n.mouse[1])*s,n.vel*=Math.exp(-5*r),n.signal+=(n.targetSignal-n.signal)*a;const u=this.getAudio(),l=this.progs[this.sourceMode]||this.progs.flow;this._pass(l,this.artwork,this.fbScene,o=>{e.uniform2f(o.u_res,this.W,this.H),e.uniform1f(o.u_time,n.time),e.uniform2f(o.u_mouse,n.mouse[0],n.mouse[1]),o.u_vel&&e.uniform1f(o.u_vel,n.vel),o.u_tint&&e.uniform3f(o.u_tint,this.tint[0],this.tint[1],this.tint[2]),e.uniform1f(o.u_audio,u),e.uniform1f(o.u_signal,n.signal),e.uniform1f(o.u_seed,this.seed)});let g=this.fbScene.tex,_=this.fbC,v=this.fbD,x=2;for(const o of this.effects){if(!o.on)continue;const h=this.progs[o.name],E=o.params;this._pass(h,g,_,c=>{c.u_res&&e.uniform2f(c.u_res,this.W,this.H),c.u_time&&e.uniform1f(c.u_time,n.time),c.u_audio&&e.uniform1f(c.u_audio,u);for(const d in E)c[d]!==void 0&&c[d]!==null&&e.uniform1f(c[d],E[d])}),g=_.tex;const A=_;_=v,v=A,x++}this._pass(this.progs.feedback,g,this.fbB,o=>{e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,this.fbA.tex),e.uniform1i(o.u_prev,1),e.uniform1f(o.u_decay,f(this.decay+u*.06,.78,.99)),e.uniform1f(o.u_audio,u),e.uniform1i(o.u_scene,0)}),this._pass(this.progs.composite,this.fbB.tex,null,o=>{e.uniform2f(o.u_res,this.W,this.H),e.uniform1f(o.u_time,n.time),e.uniform1f(o.u_audio,u)});const R=this.fbA;if(this.fbA=this.fbB,this.fbB=R,this._frames++,this._acc+=i,this._last=t,this._acc>=500){this._fps=Math.round(this._frames/(this._acc/1e3)),this._frames=0,this._acc=0,this.renderTier!=="STATIC"&&(this._fps<40&&this.dpr>.75?(this.dpr=Math.max(.75,this.dpr-.15),this._resize()):this._fps>58&&this.dpr<this.maxDpr&&(this.dpr=Math.min(this.maxDpr,this.dpr+.1),this._resize()));const o=this.effects.filter(h=>h.on).map(h=>h.name);this.onTelemetry({fps:this._fps,res:this.W+"×"+this.H,state:this.phase||"E00",passes:x+1,chain:o.length?o.join("+"):"source",seed:this.seedHex(),audio:u,renderTier:this.renderTier,planId:this.planId,reducedMotion:this.reduce})}}seedHex(){return"0x"+Math.floor(this.seed*65535).toString(16).toUpperCase().padStart(4,"0")}renderOnce(){this.failed||!this.gl||this._render(performance.now())}exportPNG(){return this.renderOnce(),this.canvas.toDataURL("image/png")}start(){if(this.failed||this.running)return;this.running=!0;const t=e=>{this.running&&(this._render(e),this.raf=requestAnimationFrame(t))};if(this.reduce||this.renderTier==="STATIC"){this.renderOnce();return}this.raf=requestAnimationFrame(t)}stop(){this.running=!1,cancelAnimationFrame(this.raf)}}export{B as K};
