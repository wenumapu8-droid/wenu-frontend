import vertexShaderSource from '../../observe-v2/shaders/fullscreen.vert.glsl?raw';
import observeFragmentShaderSource from '../../observe-v2/shaders/source.frag.glsl?raw';
import toroidalFragmentShaderSource from '../shaders/toroidal-field.frag.glsl?raw';

export const WEBGL_SOURCE_SHADER_SPEC = Object.freeze({
  id: 'observe-source-field',
  rendererKind: 'webgl-shader',
  shaderRole: 'SOURCE_GENERATOR',
  sourceVertex: 'src/kodex/observe-v2/shaders/fullscreen.vert.glsl',
  sourceFragment: 'src/kodex/observe-v2/shaders/source.frag.glsl',
  temporalContract: 'AMBIENT_UNCLOSED',
  seamlessLoopClaim: false,
  targetFps: 30,
  dprCap: 1.5,
  reducedMotion: 'STATIC_TIME_FRAME',
  fallback: 'STATIC_CANVAS_RETICLE',
  provenance: 'KODEX_INTERNAL_SHADER_REUSE',
});

export const WEBGL_TOROIDAL_SHADER_SPEC = Object.freeze({
  id: 'toroidal-field-webgl-v0',
  rendererKind: 'webgl-shader',
  shaderRole: 'SOURCE_GENERATOR',
  sourceVertex: 'src/kodex/observe-v2/shaders/fullscreen.vert.glsl',
  sourceFragment: 'src/kodex/holocore/shaders/toroidal-field.frag.glsl',
  temporalContract: 'AMBIENT_UNCLOSED',
  seamlessLoopClaim: false,
  targetFps: 30,
  dprCap: 1.5,
  reducedMotion: 'STATIC_TIME_FRAME',
  fallback: 'STATIC_CANVAS_TORUS',
  provenance: 'KODEX_SYNTHETIC_PERCEPTUAL_BENCHMARK',
  epistemic: 'ART / COMP / SPEC',
});

const SHADER_VARIANTS = Object.freeze({
  observe: Object.freeze({ spec: WEBGL_SOURCE_SHADER_SPEC, fragment: observeFragmentShaderSource }),
  toroidal: Object.freeze({ spec: WEBGL_TOROIDAL_SHADER_SPEC, fragment: toroidalFragmentShaderSource }),
});

function clamp01(value) { return Math.min(1, Math.max(0, value)); }

function compileShader(gl, type, source, label) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error(`${label}: unable to create shader`);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) || 'unknown compile error';
    gl.deleteShader(shader);
    throw new Error(`${label}: ${log}`);
  }
  return shader;
}

function createProgram(gl, fragmentSource) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource, 'HoloCore vertex shader');
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource, 'HoloCore source shader');
  const program = gl.createProgram();
  if (!program) throw new Error('HoloCore WebGL: unable to create program');
  gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
  gl.deleteShader(vertex); gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) || 'unknown link error';
    gl.deleteProgram(program);
    throw new Error(`HoloCore WebGL program: ${log}`);
  }
  return program;
}

function getUniformLocations(gl, program) {
  const names = ['u_time','u_delta','u_resolution','u_pointer','u_pointerVelocity','u_audioLow','u_audioMid','u_audioHigh','u_state','u_transition','u_intensity','u_seed','u_feedbackAmount','u_scanPosition','u_reducedMotion','u_particleScale'];
  return Object.fromEntries(names.map(name => [name, gl.getUniformLocation(program, name)]));
}

function drawFallback(canvas, variant) {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return false;
  const width = Math.max(1, canvas.width), height = Math.max(1, canvas.height);
  const cx = width * 0.5, cy = height * 0.5, scale = Math.min(width, height);
  ctx.fillStyle = '#05030b'; ctx.fillRect(0, 0, width, height);

  if (variant === 'toroidal') {
    ctx.lineWidth = Math.max(1, scale * 0.003);
    for (let i = 0; i < 18; i += 1) {
      const p = i / 17;
      ctx.strokeStyle = p > 0.55 ? '#b891ff' : '#553577';
      ctx.globalAlpha = 0.16 + p * 0.32;
      ctx.beginPath();
      ctx.ellipse(cx, cy + (p - 0.5) * scale * 0.05, scale * (0.31 + p * 0.12), scale * (0.15 + p * 0.055), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = '#d9c9ff'; ctx.globalAlpha = 0.78;
    ctx.beginPath(); ctx.ellipse(cx, cy, scale * 0.13, scale * 0.075, 0, 0, Math.PI * 2); ctx.stroke();
    canvas.dataset.fallbackFrame = 'static-torus';
  } else {
    ctx.strokeStyle = '#714db8'; ctx.globalAlpha = 0.45; ctx.lineWidth = Math.max(1, scale * 0.0018);
    for (const radius of [0.16, 0.27, 0.39]) { ctx.beginPath(); ctx.ellipse(cx, cy, scale * radius, scale * radius * 0.55, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.strokeStyle = '#71d9e9'; ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.moveTo(cx - scale * 0.36, cy); ctx.quadraticCurveTo(cx, cy - scale * 0.2, cx + scale * 0.36, cy); ctx.quadraticCurveTo(cx, cy + scale * 0.2, cx - scale * 0.36, cy); ctx.stroke();
    ctx.fillStyle = '#d9c9ff'; ctx.globalAlpha = 0.86; ctx.beginPath(); ctx.arc(cx, cy, scale * 0.042, 0, Math.PI * 2); ctx.fill();
    canvas.dataset.fallbackFrame = 'static-reticle';
  }
  ctx.globalAlpha = 1;
  return true;
}

export class WebGLSourceShaderRenderer {
  constructor(canvas, options = {}) {
    if (!(canvas instanceof HTMLCanvasElement)) throw new TypeError('WebGLSourceShaderRenderer requires a canvas element.');
    this.canvas = canvas;
    this.variant = options.variant && SHADER_VARIANTS[options.variant] ? options.variant : 'observe';
    this.variantConfig = SHADER_VARIANTS[this.variant];
    this.spec = this.variantConfig.spec;
    this.reducedMotion = options.reducedMotion ?? matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.targetFps = options.targetFps ?? this.spec.targetFps;
    this.frameInterval = 1000 / this.targetFps;
    this.dprCap = options.dprCap ?? this.spec.dprCap;
    this.staticTime = options.staticTime ?? 6.75;
    this.seed = options.seed ?? 11.73; this.state = options.state ?? 0.78; this.transition = options.transition ?? 0.86; this.intensity = options.intensity ?? 0.72; this.particleScale = options.particleScale ?? 0.68;
    this.pointerTarget = { x: 0, y: 0 }; this.pointer = { x: 0, y: 0 }; this.pointerVelocity = { x: 0, y: 0 };
    this.running = false; this.destroyed = false; this.lastFrame = 0; this.frameCount = 0; this.raf = 0; this.resizeObserver = null; this.mode = 'initializing';

    this.gl = canvas.getContext('webgl2', { alpha:false, antialias:false, depth:false, stencil:false, preserveDrawingBuffer:true, powerPreference:'high-performance' });
    if (!this.gl) {
      this.mode = 'canvas-fallback'; this.resizeCanvasFallback(); drawFallback(this.canvas, this.variant);
      this.canvas.dataset.rendererMode = this.mode; this.canvas.dataset.temporalContract = this.spec.temporalContract; this.canvas.dataset.shaderVariant = this.variant; return;
    }

    const gl = this.gl;
    this.program = createProgram(gl, this.variantConfig.fragment); this.uniforms = getUniformLocations(gl, this.program);
    this.vao = gl.createVertexArray(); this.buffer = gl.createBuffer();
    if (!this.vao || !this.buffer) throw new Error('HoloCore WebGL: unable to create fullscreen geometry');
    gl.bindVertexArray(this.vao); gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0); gl.bindVertexArray(null);

    this.mode = 'webgl-source';
    this.canvas.dataset.rendererMode = this.mode; this.canvas.dataset.temporalContract = this.spec.temporalContract; this.canvas.dataset.seamlessLoopClaim = String(this.spec.seamlessLoopClaim); this.canvas.dataset.targetFps = String(this.targetFps); this.canvas.dataset.shaderVariant = this.variant;
    this.bindPointer(); this.resizeObserver = new ResizeObserver(() => this.resize()); this.resizeObserver.observe(this.canvas); this.resize();
  }

  resizeCanvasFallback(){const rect=this.canvas.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,this.dprCap);this.canvas.width=Math.max(1,Math.round((rect.width||window.innerWidth)*dpr));this.canvas.height=Math.max(1,Math.round((rect.height||window.innerHeight)*dpr));}
  resize(){if(!this.gl){this.resizeCanvasFallback();drawFallback(this.canvas,this.variant);return;}const rect=this.canvas.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,this.dprCap);const width=Math.max(1,Math.round((rect.width||window.innerWidth)*dpr));const height=Math.max(1,Math.round((rect.height||window.innerHeight)*dpr));if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;}this.gl.viewport(0,0,width,height);}
  bindPointer(){if(!this.gl)return;this.onPointerMove=event=>{if(this.reducedMotion)return;const rect=this.canvas.getBoundingClientRect();this.pointerTarget.x=clamp01((event.clientX-rect.left)/Math.max(1,rect.width))*2-1;this.pointerTarget.y=(1-clamp01((event.clientY-rect.top)/Math.max(1,rect.height)))*2-1;};this.onPointerLeave=()=>{this.pointerTarget.x=0;this.pointerTarget.y=0;};this.canvas.addEventListener('pointermove',this.onPointerMove,{passive:true});this.canvas.addEventListener('pointerdown',this.onPointerMove,{passive:true});this.canvas.addEventListener('pointerleave',this.onPointerLeave,{passive:true});}
  start(){if(this.destroyed||this.running)return;if(!this.gl){drawFallback(this.canvas,this.variant);return;}if(this.reducedMotion){this.renderFrame(this.staticTime,0);return;}this.running=true;this.lastFrame=performance.now();this.renderFrame(this.lastFrame*.001,0);this.raf=requestAnimationFrame(time=>this.render(time));}
  stop(){this.running=false;if(this.raf)cancelAnimationFrame(this.raf);this.raf=0;}
  render(milliseconds){if(!this.running||this.destroyed||!this.gl)return;this.raf=requestAnimationFrame(time=>this.render(time));const elapsed=milliseconds-this.lastFrame;if(elapsed<this.frameInterval)return;const deltaSeconds=Math.min(.1,elapsed*.001);this.lastFrame=milliseconds-(elapsed%this.frameInterval);this.renderFrame(milliseconds*.001,deltaSeconds);}
  renderFrame(timeSeconds,deltaSeconds){const gl=this.gl;if(!gl||!this.program)return;const px=this.pointer.x,py=this.pointer.y;this.pointer.x+=(this.pointerTarget.x-this.pointer.x)*.075;this.pointer.y+=(this.pointerTarget.y-this.pointer.y)*.075;this.pointerVelocity.x=this.pointer.x-px;this.pointerVelocity.y=this.pointer.y-py;const effectiveTime=this.reducedMotion?this.staticTime:timeSeconds;const scanPosition=this.reducedMotion?.47:.5+Math.sin(effectiveTime*.18)*.24;gl.useProgram(this.program);gl.bindVertexArray(this.vao);const u=this.uniforms;if(u.u_time)gl.uniform1f(u.u_time,effectiveTime);if(u.u_delta)gl.uniform1f(u.u_delta,this.reducedMotion?0:deltaSeconds);if(u.u_resolution)gl.uniform2f(u.u_resolution,this.canvas.width,this.canvas.height);if(u.u_pointer)gl.uniform2f(u.u_pointer,this.pointer.x,this.pointer.y);if(u.u_pointerVelocity)gl.uniform2f(u.u_pointerVelocity,this.pointerVelocity.x,this.pointerVelocity.y);if(u.u_audioLow)gl.uniform1f(u.u_audioLow,0);if(u.u_audioMid)gl.uniform1f(u.u_audioMid,0);if(u.u_audioHigh)gl.uniform1f(u.u_audioHigh,0);if(u.u_state)gl.uniform1f(u.u_state,this.state);if(u.u_transition)gl.uniform1f(u.u_transition,this.transition);if(u.u_intensity)gl.uniform1f(u.u_intensity,this.intensity);if(u.u_seed)gl.uniform1f(u.u_seed,this.seed);if(u.u_feedbackAmount)gl.uniform1f(u.u_feedbackAmount,0);if(u.u_scanPosition)gl.uniform1f(u.u_scanPosition,scanPosition);if(u.u_reducedMotion)gl.uniform1f(u.u_reducedMotion,this.reducedMotion?1:0);if(u.u_particleScale)gl.uniform1f(u.u_particleScale,this.particleScale);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);gl.bindVertexArray(null);this.frameCount+=1;this.canvas.dataset.frameCount=String(this.frameCount);this.canvas.dataset.shaderTime=effectiveTime.toFixed(4);this.canvas.dataset.scanPosition=scanPosition.toFixed(4);}
  destroy(){if(this.destroyed)return;this.destroyed=true;this.stop();this.resizeObserver?.disconnect();if(this.onPointerMove){this.canvas.removeEventListener('pointermove',this.onPointerMove);this.canvas.removeEventListener('pointerdown',this.onPointerMove);this.canvas.removeEventListener('pointerleave',this.onPointerLeave);}if(this.gl){if(this.buffer)this.gl.deleteBuffer(this.buffer);if(this.vao)this.gl.deleteVertexArray(this.vao);if(this.program)this.gl.deleteProgram(this.program);}}
}
