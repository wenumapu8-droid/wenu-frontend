const f=Object.freeze({DORMANT:0,AWARE:1,OPEN:2}),l=Object.freeze({LIVE:"live",PAUSED:"paused",REDUCED:"reduced",LOW_POWER:"low-power"}),m=Object.freeze({HIGH:1,MEDIUM:.75,LOW:.5}),v=Object.freeze({id:"KDX_THRESHOLD_PORTAL_001",artworkUrl:"/img/kodex/works/bw-06-alpha.png",artworkLabel:"Arquitecturas Tecno-Tribales · bw-06 alpha mask",defaultSeed:.382,defaultElapsedMs:0,defaultBass:0,defaultState:"DORMANT",defaultMotionMode:l.LIVE,defaultQualityLevel:"HIGH",palette:{background:[.02,.01,.01],base:[.31,.03,.04],accent:[.75,.09,.11],glow:[1,.31,.18],line:[.96,.83,.75]},feedback:{decay:.88,mix:.17},breathing:{dormant:.025,aware:.05,open:.085},polar:{dormant:.08,aware:.16,open:.26}});function p(c){return f[c]??f.DORMANT}function _(c){return m[c]??m.HIGH}const h=`#version 300 es
precision highp float;

layout(location = 0) in vec2 p;
out vec2 v_uv;

void main() {
  v_uv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}
`,b=`#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 o;

uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_time;
uniform float u_seed;
uniform vec2 u_pointer;
uniform float u_bass;
uniform float u_state;
uniform float u_quality;
/* Giro de la rueda, en radianes. La herramienta de esta lamina es "girar": el
   scroll no baja la pagina, hace rodar el mandala. Entra en el angulo y no en
   el radio, asi que la pieza gira sobre si misma en vez de acercarse. */
uniform float u_wheel;
uniform float u_motion;

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 uv = v_uv;
  vec2 centered = uv - 0.5;
  centered.x *= u_res.x / max(1.0, u_res.y);

  float radius = length(centered);
  float angle = atan(centered.y, centered.x);

  float breathe = sin(u_time * mix(0.12, 0.28, u_state)) * mix(0.02, 0.08, u_state);
  float bassPulse = u_bass * mix(0.03, 0.14, u_state);
  float polarWarp = mix(0.06, 0.24, u_state) * sin(angle * 4.0 + u_time * 0.18 + u_seed * 6.2831);
  float pointerPull = dot(centered, u_pointer) * 0.12;

  float warpedRadius = radius * (1.0 - breathe - bassPulse) + polarWarp * (0.4 + u_quality * 0.6);
  float warpedAngle = angle + u_wheel + pointerPull + sin(radius * 11.0 - u_time * 0.22) * 0.06;

  vec2 sampleUv = vec2(cos(warpedAngle), sin(warpedAngle)) * warpedRadius;
  sampleUv.x /= u_res.x / max(1.0, u_res.y);
  sampleUv += 0.5;

  vec4 artwork = texture(u_tex, sampleUv);
  float mask = artwork.a > 0.0 ? artwork.a : dot(artwork.rgb, vec3(0.3333));

  // El anillo define hasta donde llega el portal. Ancho, el disco entero se
  // llena de ambiente y el negro se pierde; el sistema pide negro dominante y
  // el color como señal.
  float ring = smoothstep(0.50, 0.14, radius);
  float halo = exp(-8.0 * abs(radius - 0.22 - bassPulse * 0.5));
  float grain = (hash21(gl_FragCoord.xy + u_seed * 100.0) - 0.5) * 0.025;

  // La obra es BLANCA y el rojo vive alrededor.
  //
  // Antes esto era mix(negro, rojo, mask): donde el mandala era opaco salia
  // rojo pleno, y como el mandala es denso, la lamina entera se volvia una
  // masa roja. Eso es pintura, y la regla del sistema es que el color sea
  // señal -- negro dominante, un acento por escena, mucho aire negro.
  //
  // Con la obra en blanco se lee la geometria, que es el motivo de la lamina,
  // y el rojo queda donde tiene que estar: en el halo y en el borde, como
  // ambiente del portal y no como relleno de la pieza.
  float cuerpo = smoothstep(0.42, 0.92, mask);
  vec3 base = vec3(0.02, 0.012, 0.012);
  base += vec3(0.94, 0.90, 0.88) * cuerpo * 0.86;

  // El acento va en el CONTORNO real de la obra, medido por derivada, no en su
  // franja de alfa medio. Restar el cuerpo a un smoothstep de alfa parece un
  // borde y no lo es: en una obra con alfa suave -- y el centro de este mandala
  // lo tiene -- esa franja es un area enorme, y lo que salia era un disco rojo
  // pleno en el medio de la pieza. fwidth mide donde el alfa CAMBIA, que es
  // donde esta el filo de verdad, y da una linea de un pixel.
  float filo = smoothstep(0.0, 1.0, length(vec2(dFdx(mask), dFdy(mask))) * 14.0);
  base += vec3(0.86, 0.10, 0.10) * filo * 0.55;

  // El halo es un filo, no un relleno. Medido sobre la captura, con el valor
  // anterior el cuadro quedaba en 69% de negro y 22% con color fuerte: la
  // receta pide ~85% de negro. Esto lo baja a un borde de luz.
  base += vec3(1.0, 0.26, 0.14) * pow(halo, 2.2) * (0.16 + 0.20 * u_state);
  base *= ring;
  base += grain;

  // El alfa sigue a la pieza. El 18% del anillo que habia antes tapaba de rojo
  // todo el disco aunque no hubiera obra ahi.
  o = vec4(base, max(cuerpo, halo * 0.5 * ring));
}
`,g=`#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 o;

uniform sampler2D u_scene;
uniform sampler2D u_prev;
uniform float u_decay;
uniform float u_mix;
uniform float u_time;

void main() {
  vec2 centered = v_uv - 0.5;
  float angle = 0.0015 + sin(u_time * 0.11) * 0.0008;
  float scale = 0.9965;
  mat2 R = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 prevUv = R * centered * scale + 0.5;

  vec4 scene = texture(u_scene, v_uv);
  vec4 prev = texture(u_prev, prevUv) * u_decay;
  vec3 col = max(scene.rgb, mix(scene.rgb, prev.rgb, u_mix));
  float alpha = max(scene.a, prev.a * 0.92);

  o = vec4(col, alpha);
}
`,E=`#version 300 es
precision highp float;

/*
 * KDX_THRESHOLD_PORTAL · COMPOSITE
 *
 * Tercera pasada: el tratamiento. Las dos anteriores producen el portal vivo
 * -- la obra en coordenadas polares, respirando y expandiendose con los graves,
 * con memoria corta de feedback. Aca esa imagen se vuelve KODEX-native.
 *
 * La regla del proyecto es dura: nada entra crudo. Toda imagen, sea la obra de
 * Ocin o una foto, pasa por la transformacion dither/halftone. Ese paso no es
 * un filtro decorativo: es lo que convierte una imagen en textura del sistema.
 *
 * El orden importa y no es libre:
 *
 *   1. PIXELACION por bloques -- se cuantiza la COORDENADA, no el color, para
 *      que los bordes queden duros como en un artefacto de baja resolucion.
 *      Cuantizar el color deja bordes suaves y se lee como JPG malo.
 *   2. CHROMA -- separacion horizontal de canales de un bloque a lo sumo.
 *      Sugiere señal analoga sin ensuciar la lectura.
 *   3. DITHER BAYER sobre la luminancia -- la obra se posteriza a pocos
 *      niveles y el umbral ordenado reparte el error. Es lo que da el grano de
 *      holograma en vez de un degradado liso.
 *   4. Bloom, scanline, viñeta y grano, que ya estaban.
 *
 * El dither va DESPUES del bloom: al reves, el bloom difumina la trama y el
 * dither deja de leerse.
 */

in vec2 v_uv;
out vec4 o;

uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_time;
uniform float u_bass;
uniform float u_motion;

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

/**
 * Bayer 8x8 por intercalado de bits. Es la matriz ordenada clasica: reparte el
 * error de cuantizacion en un patron fijo en vez de al azar, que es lo que
 * produce la trama regular del holograma. Con ruido saldria television muerta.
 */
float bayer8(vec2 p) {
  ivec2 i = ivec2(mod(p, 8.0));
  int x = i.x, y = i.y, v = 0;
  for (int k = 0; k < 3; k++) {
    v = (v << 1) | ((y >> (2 - k)) & 1);
    v = (v << 1) | (((x ^ y) >> (2 - k)) & 1);
  }
  return float(v) / 64.0;
}

void main() {
  // 1 · PIXELACION. El bloque late con los graves: la trama se abre cuando
  //     entra el sonido, que es la respiracion del aparato hecha visible.
  float px = max(2.0, 3.0 + u_bass * 2.0);
  vec2 frag = v_uv * u_res;
  vec2 blockPos = floor(frag / px) * px + px * 0.5;
  vec2 uv = blockPos / max(u_res, vec2(1.0));

  // 2 · CHROMA. Un bloque a lo sumo; mas que eso es un efecto, no una señal.
  //
  // La separacion se ata a la resolucion real. El bloque se mide en pixeles y
  // el desplazamiento en coordenadas de textura: al bajar la resolucion en un
  // perfil de bajo consumo, el mismo bloque ocupa proporcionalmente mas y la
  // aberracion se disparaba hasta volverse confeti de colores. La receta
  // permite bajar complejidad, no perder la identidad -- y el portal es rojo y
  // blanco, no arcoiris.
  float escala = clamp(u_res.x / 1400.0, 0.35, 1.0);
  float chroma = px / max(u_res.x, 1.0) * 0.55 * escala;
  vec4 src = texture(u_tex, uv);
  vec3 col = vec3(
    texture(u_tex, uv + vec2(-chroma, 0.0)).r,
    src.g,
    texture(u_tex, uv + vec2(chroma, 0.0)).b
  );

  vec2 pxs = 1.0 / max(u_res, vec2(1.0));
  vec3 bloom = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    float a = float(i) * 1.5707963;
    vec2 d = vec2(cos(a), sin(a)) * pxs * (3.0 + u_bass * 5.0);
    bloom += max(vec3(0.0), texture(u_tex, uv + d).rgb - 0.22);
  }
  col += bloom * 0.24;

  // 3 · DITHER. Sobre la luminancia y no por canal: por canal aparecen bordes
  //     de color donde la obra es gris, y la obra es B&N.
  float l = luma(col);
  float levels = 6.0;
  float dithered = floor(l * levels + (bayer8(frag / px) - 0.5) * 0.9 + 0.5) / levels;
  // El color conserva su tono y toma el VALOR de la trama. Reemplazar el color
  // entero por el dither dejaria la pieza en escala de grises y se perderia el
  // rojo del portal.
  // El piso del divisor no puede ser muy bajo: donde la imagen es casi negra,
  // dividir por 0.04 multiplica por 25 y el ruido del fondo se vuelve bloque.
  //
  // Y la ganancia lleva techo. Sin el, un pixel oscuro con un desbalance
  // minimo de canales se multiplicaba por casi cinco y ese desbalance salia a
  // la superficie como color saturado: en baja resolucion, donde cada bloque
  // muestrea texeles distintos, el portal se volvia confeti de colores. El
  // portal es rojo y blanco.
  float ganancia = clamp(dithered / max(l, 0.22), 0.0, 1.8);
  col *= ganancia;

  col *= mix(0.96, 1.0, sin(v_uv.y * u_res.y * 3.14159) * 0.5 + 0.5);
  col *= smoothstep(1.18, 0.22, length(v_uv - 0.5));
  col += (hash21(gl_FragCoord.xy + u_time * 10.0) - 0.5) * 0.018 * step(0.5, u_motion + 0.5);

  o = vec4(col, src.a);
}
`;class x{constructor(e,a={}){this.canvas=e,this.options=a,this.config=v,this.state={seed:a.seed??this.config.defaultSeed,elapsedMs:a.elapsedMs??this.config.defaultElapsedMs,bass:a.bass??this.config.defaultBass,pointer:[0,0],motionMode:a.motionMode??this.config.defaultMotionMode,qualityLevel:a.qualityLevel??this.config.defaultQualityLevel,phaseName:a.state??this.config.defaultState,phaseValue:p(a.state??this.config.defaultState)},this.running=!1,this.disposed=!1,this.contextLost=!1,this.resumeAfterContextRestore=!1,this.raf=0,this.lastNow=0,this.metrics={fps:0,frameTime:0,longFrames:0,drawCalls:0,activeLoops:0,canvasSize:"0x0",resourceCount:0,contextLost:!1},this.telemetryFrames=0,this.telemetryStart=0}async load(){if(this.disposed)throw new Error("KDX_THRESHOLD_PORTAL_001 runtime is disposed");return this._initGL(),await this._loadArtwork(this.options.artworkUrl||this.config.artworkUrl),this._resize(),this._bindEvents(),this.renderOnce(),this}start(){if(this.running||!this.gl||this.disposed||this.contextLost)return;this.running=!0,this.metrics.activeLoops=1;const e=a=>{if(!(!this.running||this.disposed||this.contextLost)){if(this.state.motionMode!==l.PAUSED){const t=this.lastNow?a-this.lastNow:16.6667;this.state.elapsedMs+=t,this.metrics.frameTime=t,t>32&&(this.metrics.longFrames+=1)}this.lastNow=a,this._render(),this.raf=requestAnimationFrame(e)}};this.raf=requestAnimationFrame(e)}stop(){this.running=!1,this.metrics.activeLoops=0,cancelAnimationFrame(this.raf),this.raf=0,this.lastNow=0}dispose(){if(this.disposed)return;this.disposed=!0,this.resumeAfterContextRestore=!1,this.stop(),this._unbindEvents();const e=this.gl;if(!e){this.metrics.resourceCount=0;return}e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindBuffer(e.ARRAY_BUFFER,null),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,null),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,null),e.useProgram(null),this._releaseGpuHandles(!0)}setSeed(e){this.state.seed=e,this.renderOnce()}setElapsedMs(e){this.state.elapsedMs=e,this.renderOnce()}setState(e){this.state.phaseName=e,this.state.phaseValue=p(e),this.renderOnce()}setMotionMode(e){this.state.motionMode=e,this.renderOnce()}setQualityLevel(e){this.state.qualityLevel=e,this.renderOnce()}setBass(e){this.state.bass=Math.max(0,Math.min(1,e)),this.renderOnce()}setPointer(e,a){this.state.pointer=[Math.max(-1,Math.min(1,e)),Math.max(-1,Math.min(1,a))],this.running||this.renderOnce()}renderOnce(){!this.gl||this.disposed||this.contextLost||this._render()}captureFrame(e="image/png"){return this.renderOnce(),this.canvas.toDataURL(e)}getMetrics(){return{...this.metrics,state:this.state.phaseName,seed:this.state.seed,elapsedMs:this.state.elapsedMs,motionMode:this.state.motionMode,qualityLevel:this.state.qualityLevel,disposed:this.disposed}}_initGL(){const e=this.canvas.getContext("webgl2",{antialias:!1,alpha:!0,preserveDrawingBuffer:!0,powerPreference:"high-performance"});if(!e)throw new Error("WebGL2 unavailable for KDX_THRESHOLD_PORTAL_001");this.gl=e;const a=e.createBuffer();if(!a)throw new Error("Unable to allocate KDX threshold portal vertex buffer");e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),this.buffer=a,this.programs={source:this._createProgram(h,b),feedback:this._createProgram(h,g),composite:this._createProgram(h,E)},this.fbScene=this._createFbo(),this.fbPrev=this._createFbo(),this.fbNext=this._createFbo(),this._refreshResourceCount()}async _loadArtwork(e){const a=await new Promise((o,r)=>{const n=new Image;n.crossOrigin="anonymous",n.onload=()=>o(n),n.onerror=r,n.src=e});if(this.disposed||!this.gl)return;const t=this.gl,s=t.createTexture();if(!s)throw new Error("Unable to allocate KDX threshold portal artwork texture");t.bindTexture(t.TEXTURE_2D,s),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,!0),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,a),this.artworkTexture=s,this._refreshResourceCount()}_bindEvents(){this._unbindEvents(),this._onResize=()=>{this.disposed||this.contextLost||(this._resize(),this.renderOnce())},typeof ResizeObserver<"u"?(this._resizeObserver=new ResizeObserver(this._onResize),this._resizeObserver.observe(this.canvas)):(addEventListener("resize",this._onResize,{passive:!0}),this._usesWindowResize=!0),this.options.bindGlobalPointer!==!1&&(this._onPointerMove=e=>{if(this.disposed||this.contextLost)return;const a=e.clientX/window.innerWidth*2-1,t=-(e.clientY/window.innerHeight*2-1);this.setPointer(a,t)},addEventListener("pointermove",this._onPointerMove,{passive:!0})),this.options.manageContextLifecycle!==!1&&(this._onContextLost=e=>{e.preventDefault(),this.resumeAfterContextRestore=this.running,this.contextLost=!0,this.metrics.contextLost=!0,this.stop(),this.options.onContextLost?.()},this._onContextRestored=()=>{this.disposed||(this.contextLost=!1,this.metrics.contextLost=!1,this.options.onContextRestored?.(),this._restoreContext().catch(e=>{this.contextLost=!0,this.metrics.contextLost=!0,this.options.onError?.(e)}))},this.canvas.addEventListener("webglcontextlost",this._onContextLost,!1),this.canvas.addEventListener("webglcontextrestored",this._onContextRestored,!1))}_unbindEvents(){this._resizeObserver?.disconnect(),this._resizeObserver=null,this._usesWindowResize&&this._onResize&&removeEventListener("resize",this._onResize),this._usesWindowResize=!1,this._onPointerMove&&removeEventListener("pointermove",this._onPointerMove),this._onContextLost&&this.canvas.removeEventListener("webglcontextlost",this._onContextLost,!1),this._onContextRestored&&this.canvas.removeEventListener("webglcontextrestored",this._onContextRestored,!1),this._onResize=null,this._onPointerMove=null,this._onContextLost=null,this._onContextRestored=null}async _restoreContext(){const e=this.resumeAfterContextRestore;this.resumeAfterContextRestore=!1,this._releaseGpuHandles(!1),this._initGL(),await this._loadArtwork(this.options.artworkUrl||this.config.artworkUrl),this._resize(),this.renderOnce(),e&&this.start()}_releaseGpuHandles(e=!1){const a=this.gl;a&&(this.artworkTexture&&a.deleteTexture(this.artworkTexture),this._deleteFbo(this.fbScene),this._deleteFbo(this.fbPrev),this._deleteFbo(this.fbNext),this.programs&&Object.values(this.programs).forEach(t=>{t?.program&&a.deleteProgram(t.program)}),this.buffer&&a.deleteBuffer(this.buffer)),this.artworkTexture=null,this.fbScene=null,this.fbPrev=null,this.fbNext=null,this.programs=null,this.buffer=null,this.metrics.resourceCount=0,e&&(this.gl=null)}_refreshResourceCount(){let e=0;this.buffer&&(e+=1),this.artworkTexture&&(e+=1),this.programs&&(e+=Object.values(this.programs).filter(a=>a?.program).length),[this.fbScene,this.fbPrev,this.fbNext].forEach(a=>{a?.fb&&(e+=1),a?.tex&&(e+=1)}),this.metrics.resourceCount=e}_resize(){if(!this.gl||this.disposed||this.contextLost)return;const e=window.devicePixelRatio||1,a=_(this.state.qualityLevel),t=Math.min(2,e*a),s=Math.max(1,Math.floor(this.canvas.clientWidth*t||window.innerWidth*t)),o=Math.max(1,Math.floor(this.canvas.clientHeight*t||window.innerHeight*t));this.canvas.width=s,this.canvas.height=o,this.metrics.canvasSize=`${s}x${o}`,this._sizeFbo(this.fbScene,s,o),this._sizeFbo(this.fbPrev,s,o),this._sizeFbo(this.fbNext,s,o)}_render(){const e=this.gl;if(!e||this.disposed||this.contextLost||!this.programs||!this.fbScene||!this.fbPrev||!this.fbNext)return;const a=this.canvas.width,t=this.canvas.height,s=this.state.elapsedMs/1e3,o=_(this.state.qualityLevel),r=this.state.motionMode===l.REDUCED?0:this.state.motionMode===l.LOW_POWER?.5:1;this.metrics.drawCalls=0,this._pass(this.programs.source,this.fbScene,n=>{e.uniform1i(n.u_tex,0),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,this.artworkTexture),e.uniform2f(n.u_res,a,t),e.uniform1f(n.u_time,s),e.uniform1f(n.u_seed,this.state.seed),e.uniform2f(n.u_pointer,this.state.pointer[0],this.state.pointer[1]),e.uniform1f(n.u_bass,this.state.bass);const u=window.__kdxArchivoValor;e.uniform1f(n.u_state,typeof u=="number"?u:this.state.phaseValue/2),e.uniform1f(n.u_quality,o),e.uniform1f(n.u_wheel,window.__kdxRueda&&window.__kdxRueda.valor||0),e.uniform1f(n.u_motion,r)}),this._pass(this.programs.feedback,this.fbNext,n=>{e.uniform1i(n.u_scene,0),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,this.fbScene.tex),e.uniform1i(n.u_prev,1),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,this.fbPrev.tex),e.uniform1f(n.u_decay,this.config.feedback.decay),e.uniform1f(n.u_mix,this.state.motionMode===l.REDUCED?0:this.config.feedback.mix),e.uniform1f(n.u_time,s)}),this._pass(this.programs.composite,null,n=>{e.uniform1i(n.u_tex,0),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,this.fbNext.tex),e.uniform2f(n.u_res,a,t),e.uniform1f(n.u_time,s),e.uniform1f(n.u_bass,this.state.bass),e.uniform1f(n.u_motion,r)}),[this.fbPrev,this.fbNext]=[this.fbNext,this.fbPrev],this._measureFrame()}_measureFrame(){const e=performance.now();this.telemetryStart||(this.telemetryStart=e),this.telemetryFrames+=1;const a=e-this.telemetryStart;a>=500&&(this.metrics.fps=Math.round(this.telemetryFrames/a*1e3),this.telemetryFrames=0,this.telemetryStart=e)}_pass(e,a,t){const s=this.gl;s.bindFramebuffer(s.FRAMEBUFFER,a?a.fb:null),s.viewport(0,0,this.canvas.width,this.canvas.height),s.useProgram(e.program),s.bindBuffer(s.ARRAY_BUFFER,this.buffer),s.enableVertexAttribArray(0),s.vertexAttribPointer(0,2,s.FLOAT,!1,0,0),t(e.uniforms),s.drawArrays(s.TRIANGLES,0,3),this.metrics.drawCalls+=1}_createProgram(e,a){const t=this.gl,s=this._compile(t.VERTEX_SHADER,e),o=this._compile(t.FRAGMENT_SHADER,a),r=t.createProgram();if(!r)throw t.deleteShader(s),t.deleteShader(o),new Error("Unable to allocate KDX threshold portal shader program");if(t.attachShader(r,s),t.attachShader(r,o),t.bindAttribLocation(r,0,"p"),t.linkProgram(r),!t.getProgramParameter(r,t.LINK_STATUS)){const i=t.getProgramInfoLog(r)||"Shader link failed";throw t.deleteProgram(r),t.deleteShader(s),t.deleteShader(o),new Error(i)}t.detachShader(r,s),t.detachShader(r,o),t.deleteShader(s),t.deleteShader(o);const n={},u=t.getProgramParameter(r,t.ACTIVE_UNIFORMS);for(let i=0;i<u;i+=1){const d=t.getActiveUniform(r,i);d&&(n[d.name]=t.getUniformLocation(r,d.name))}return{program:r,uniforms:n}}_compile(e,a){const t=this.gl,s=t.createShader(e);if(!s)throw new Error("Unable to allocate KDX threshold portal shader");if(t.shaderSource(s,a),t.compileShader(s),!t.getShaderParameter(s,t.COMPILE_STATUS)){const o=t.getShaderInfoLog(s)||"Shader compile failed";throw t.deleteShader(s),new Error(o)}return s}_createFbo(){const e=this.gl,a=e.createTexture(),t=e.createFramebuffer();if(!a||!t)throw a&&e.deleteTexture(a),t&&e.deleteFramebuffer(t),new Error("Unable to allocate KDX threshold portal framebuffer");return e.bindTexture(e.TEXTURE_2D,a),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,t),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,a,0),{fb:t,tex:a}}_deleteFbo(e){!e||!this.gl||(e.fb&&this.gl.deleteFramebuffer(e.fb),e.tex&&this.gl.deleteTexture(e.tex))}_sizeFbo(e,a,t){const s=this.gl;e&&(s.bindTexture(s.TEXTURE_2D,e.tex),s.texImage2D(s.TEXTURE_2D,0,s.RGBA,a,t,0,s.RGBA,s.UNSIGNED_BYTE,null))}}export{x as K,l as T,v as a};
