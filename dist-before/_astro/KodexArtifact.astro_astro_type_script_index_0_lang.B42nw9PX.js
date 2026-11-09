const v=`#ifdef GL_ES
precision highp float;
#endif

attribute vec2 a_position;
varying vec2 v_texcoord;

void main() {
  v_texcoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,b=`#ifdef GL_ES
precision highp float;
precision highp int;
#endif

// KODEX-∞ · ARTIFACT
//
// Trata la OBRA (mandala / roseton / arbol / patron mapuche) como un artefacto
// archivado: pixelado por bloques, dither Bayer, scanlines, glow y un chroma
// minimo. Reemplaza el anchor vectorial anterior, que se leia "cargado y
// abstracto" -- un enredo de lineas suaves donde deberia haber una pieza.
//
// Reglas de direccion de arte (Ocin, 2026-07-30):
//  · La obra es el FOCO. El tratamiento la envuelve, nunca compite con ella.
//  · La densidad vive en los DATOS (rails, metadata), no en este visual.
//  · El fondo es un campo sutil del color de la escena, no un tangle animado.
//  · Legible ante todo: si el efecto tapa la pieza, el efecto esta mal.

uniform sampler2D artwork;      // la obra, con alpha
uniform vec2  resolution;
uniform vec2  artworkSize;      // px reales, para respetar la proporcion
uniform float time;
uniform vec3  accent;           // color de la escena (threshold = rojo)
uniform float pixelSize;        // lado del bloque, en px de pantalla
uniform float ditherAmount;     // 0 = limpio · 1 = dither pleno
uniform float scanlineAmount;
uniform float glowAmount;
uniform float chromaAmount;
uniform float flickerAmount;
uniform float reducedMotion;    // 1 = sin animacion
uniform float reveal;           // 0..1 para la entrada
// Casi todo el portafolio son JPG opacos sobre negro: no traen alpha del que
// sacar la silueta. Con lumaKey en 1 la mascara se deriva de la luminancia,
// que en una obra sobre fondo negro es exactamente la pieza. Con 0 se usa el
// alpha del archivo (mandala, PNG recortados).
uniform float lumaKey;
uniform float lumaFloor;        // por debajo de esto se considera fondo
// Techo de la pieza: la luminancia donde la obra ya esta en su maximo. Con
// piso y techo la trama se arma sobre el rango REAL de cada obra. Sin esto,
// una pieza oscura -- bw-07 promedia 0.04 -- se dithereaba contra la escala
// absoluta y salia negra sobre negro: la mascara la dejaba pasar y no habia
// nada que ver. En 1.0 no altera a las obras que ya usan todo el rango.
uniform float lumaCeil;
// Cuanto del acento entra EN la pieza. Bajo por defecto: la obra se lee
// clara y el color vive en el ambiente, como en los boards.
uniform float tint;

varying vec2 v_texcoord;

// Bayer 8x8 sin arreglo: los arreglos en WebGL1 no admiten indice dinamico en
// todos los drivers, asi que se calcula el umbral por bit-interleaving. Sale
// mas barato y funciona igual en GPUs viejas, que es la mitad del publico.
float bayer8(vec2 pos) {
  vec2 p = floor(mod(pos, 8.0));
  float x = p.x;
  float y = p.y;
  float result = 0.0;
  float scale = 1.0;
  for (int i = 0; i < 3; i++) {
    float xb = mod(x, 2.0);
    float yb = mod(y, 2.0);
    result += scale * (3.0 * mod(xb + yb, 2.0) + 2.0 * xb + yb) * 0.25;
    x = floor(x * 0.5);
    y = floor(y * 0.5);
    scale *= 0.25;
  }
  return result;
}

float luma(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

// Ruido barato y estable: se usa para decidir que franja glitchea y cuando.
// Debe ser determinista por (franja, instante) o el glitch titilaria en cada
// frame en vez de durar un momento.
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// Muestrea la obra encajandola por "contain": nunca la deforma. Fuera de la
// pieza devuelve alpha 0, para que el marco quede limpio.
vec4 sampleArtwork(vec2 uv, vec2 offset) {
  float canvasAspect = resolution.x / max(resolution.y, 1.0);
  float artAspect = artworkSize.x / max(artworkSize.y, 1.0);
  vec2 scale = artAspect > canvasAspect
    ? vec2(1.0, canvasAspect / artAspect)
    : vec2(artAspect / canvasAspect, 1.0);
  vec2 p = (uv - 0.5) / scale + 0.5 + offset;
  if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) return vec4(0.0);
  return texture2D(artwork, p);
}

// Muestreo por BLOQUE, quedandose con lo mas presente del bloque.
//
// Por que existe: el mandala son lineas finas sobre transparente -- apenas el
// 13% de los pixeles tienen tinta. Muestrear el centro del bloque hacia
// desaparecer la pieza entera: si la linea no cruzaba justo ese punto, el
// bloque salia vacio. Se toma el maximo alpha del bloque (una dilatacion) y el
// color del punto de mas tinta, asi la geometria sobrevive a la pixelacion.
vec4 sampleBlock(vec2 blockUv, vec2 texel, vec2 offset) {
  vec4 best = vec4(0.0);
  float bestWeight = -1.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 d = vec2(float(x), float(y)) * texel * 0.5;
      vec4 s = sampleArtwork(blockUv + d, offset);
      // Con lumaKey la presencia la da el brillo, no el alpha: en un JPG sobre
      // negro el alpha siempre es 1 y compararlo no distingue pieza de fondo.
      float weight = mix(s.a, s.a * luma(s.rgb), lumaKey);
      if (weight > bestWeight) { bestWeight = weight; best = s; }
    }
  }
  // La mascara final: alpha del archivo, o la luminancia recortada por el piso.
  float keyed = smoothstep(lumaFloor, lumaFloor + 0.22, luma(best.rgb));
  best.a = mix(best.a, best.a * keyed, lumaKey);
  return best;
}

void main() {
  vec2 fragPos = v_texcoord * resolution;

  // 1 · PIXELACION. Se cuantiza la coordenada, no el color: asi los bordes de
  //     la obra quedan duros como en un artefacto de baja resolucion.
  float px = max(pixelSize, 1.0);
  vec2 blockPos = floor(fragPos / px) * px + px * 0.5;
  vec2 blockUv = blockPos / resolution;

  // 2 · CHROMA. Separacion horizontal de canales, de un bloque a lo sumo.
  //     Sugiere señal analoga sin ensuciar la lectura.
  vec2 texel = px / resolution;
  float chroma = chromaAmount * px / max(resolution.x, 1.0);
  float r = sampleBlock(blockUv, texel, vec2(-chroma, 0.0)).r;
  vec4  g = sampleBlock(blockUv, texel, vec2(0.0, 0.0));
  float b = sampleBlock(blockUv, texel, vec2( chroma, 0.0)).b;
  vec3 art = vec3(r, g.g, b);
  float alpha = g.a;

  // 3 · DITHER BAYER sobre la luminancia. La obra se posteriza a pocos niveles
  //     y el umbral ordenado reparte el error: es lo que da el grano de
  //     holograma en vez de un degradado liso.
  float threshold = bayer8(fragPos / px) - 0.5;
  // La obra se lee en su propio rango, no en el absoluto.
  float span = max(lumaCeil - lumaFloor, 0.03);
  float l = clamp((luma(art) - lumaFloor) / span, 0.0, 1.0);
  float levels = mix(24.0, 4.0, ditherAmount);
  float dithered = floor(l * levels + threshold * ditherAmount + 0.5) / levels;
  // La obra se mantiene clara y el acento vive en el AMBIENTE -- anillos,
  // paneles, glow -- no dentro de la pieza. En la referencia de THRESHOLD el
  // mandala es blanco sobre negro y el rojo esta alrededor; tenirlo al 72%,
  // como estaba, se comia el patron justo cuando la pieza es el motivo de
  // toda la lamina.
  vec3 artN = clamp((art - vec3(lumaFloor)) / span, 0.0, 1.0);
  vec3 base = mix(vec3(dithered), artN * (0.45 + dithered * 0.55), 0.35);
  vec3 color = mix(base, accent * dithered, tint);

  // 4 · GLOW. Halo del color de la escena alrededor de la pieza, muestreando
  //     el alpha en cruz. Barato y suficiente a esta escala.
  float halo = 0.0;
  for (int i = 1; i <= 4; i++) {
    float d = float(i) * px * 1.5 / max(resolution.x, 1.0);
    halo += sampleBlock(blockUv + vec2( d, 0.0), texel, vec2(0.0)).a;
    halo += sampleBlock(blockUv + vec2(-d, 0.0), texel, vec2(0.0)).a;
    halo += sampleBlock(blockUv + vec2(0.0,  d), texel, vec2(0.0)).a;
    halo += sampleBlock(blockUv + vec2(0.0, -d), texel, vec2(0.0)).a;
  }
  halo = clamp(halo / 16.0 - alpha, 0.0, 1.0);
  color += accent * halo * glowAmount;
  alpha = clamp(alpha + halo * glowAmount * 0.55, 0.0, 1.0);

  // 5 · SCANLINES fijas al pixel fisico: si escalaran con el zoom producirian
  //     moire. Una linea cada dos pixeles de bloque.
  float scan = 0.5 + 0.5 * sin(fragPos.y / max(px * 0.5, 1.0) * 3.14159265);
  color *= 1.0 - scanlineAmount * (1.0 - scan) * 0.85;

  // 6 · VIDA HOLOGRAFICA. En las plantillas de KodeLife el holograma nunca
  //     esta quieto: respira, se desalinea un instante y lo recorre un barrido.
  //     Son tres gestos chicos y lentos; juntos hacen la diferencia entre una
  //     imagen tratada y un artefacto proyectado.
  float motion = 1.0 - reducedMotion;

  //   a · Latido de intensidad, con dos frecuencias que nunca coinciden.
  float flicker = 1.0 + motion * flickerAmount * (
      sin(time * 7.3) * 0.5 + sin(time * 17.1) * 0.3 + sin(time * 2.7) * 0.2
    ) * 0.1;
  color *= flicker;

  //   b · Barrido de refresco: una banda tenue que sube cada pocos segundos,
  //       como el rolling de una pantalla mal sincronizada.
  float sweepPos = fract(time * 0.18);
  float sweep = smoothstep(0.06, 0.0, abs(v_texcoord.y - sweepPos));
  color += accent * sweep * 0.16 * motion * alpha;

  //   c · Glitch de linea: cada tanto una franja se desplaza un bloque. Muy
  //       breve y muy raro; si se nota el patron, deja de leerse como falla.
  float band = floor(v_texcoord.y * 48.0);
  float glitchGate = step(0.988, hash21(vec2(band, floor(time * 3.0))));
  float glitchAmt = glitchGate * motion * 0.6;
  if (glitchAmt > 0.0) {
    vec2 shifted = blockUv + vec2(px * 2.0 / resolution.x, 0.0);
    vec4 g2 = sampleBlock(shifted, texel, vec2(0.0));
    color = mix(color, accent * luma(g2.rgb) + color * 0.4, glitchAmt);
    alpha = max(alpha, g2.a * glitchAmt);
  }

  // 7 · CAMPO DE FONDO. Retícula de puntos muy tenue del color de la escena.
  //     Da cuerpo de dispositivo sin convertirse en un tangle.
  // Ojo: no llamar a esta variable \`dot\` — es una funcion built-in de GLSL y
  // varios compiladores rechazan la sombra.
  vec2 gridPos = fract(fragPos / (px * 4.0)) - 0.5;
  float gridDot = 1.0 - smoothstep(0.06, 0.14, length(gridPos));
  float field = gridDot * 0.06 * (1.0 - alpha);
  color += accent * field;
  alpha = max(alpha, field * 2.2);

  // 8 · REVELADO. La pieza entra de abajo hacia arriba, como un escaneo.
  float scanReveal = smoothstep(0.0, 0.35, reveal - (1.0 - v_texcoord.y) * 0.55);
  alpha *= scanReveal;
  // Línea de barrido viva solo mientras revela.
  float edge = 1.0 - smoothstep(0.0, 0.02, abs(reveal - (1.0 - v_texcoord.y) * 0.55 - 0.02));
  color += accent * edge * 0.6 * (1.0 - step(0.999, reveal));

  gl_FragColor = vec4(color, alpha);
}
`,i={pixelSize:3,dither:.85,scanlines:.35,glow:.5,chroma:.6,flicker:.5,lumaFloor:.12,lumaCeil:1,tint:.18},g=(l,e,o)=>Math.min(o,Math.max(e,l)),x=l=>{const e=l.trim().replace("#",""),o=e.length===3?e.split("").map(t=>t+t).join(""):e,a=Number.parseInt(o,16);return Number.isNaN(a)||o.length!==6?[1,.15,.2]:[(a>>16&255)/255,(a>>8&255)/255,(a&255)/255]};class A{root;canvas;gl;program;uniforms=new Map;reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;options;accent;lumaKey=-1;texture=null;textureSize=[1,1];startTime=performance.now();reveal=0;raf=0;visible=!0;disposed=!1;constructor(e){this.root=e;const o=e.querySelector("[data-kdx-artifact-canvas]");if(!o)throw new Error("KODEX artifact: falta el canvas.");this.canvas=o;const a=o.getContext("webgl",{alpha:!0,antialias:!1,premultipliedAlpha:!1,powerPreference:"low-power"});if(!a)throw new Error("KODEX artifact: WebGL no disponible.");this.gl=a,this.options={pixelSize:Number(e.dataset.pixelSize??i.pixelSize),dither:Number(e.dataset.dither??i.dither),scanlines:Number(e.dataset.scanlines??i.scanlines),glow:Number(e.dataset.glow??i.glow),chroma:Number(e.dataset.chroma??i.chroma),flicker:Number(e.dataset.flicker??i.flicker),lumaFloor:Number(e.dataset.lumaFloor??i.lumaFloor),lumaCeil:Number(e.dataset.lumaCeil??i.lumaCeil),tint:Number(e.dataset.tint??i.tint)},this.accent=x(e.dataset.accent??"#FF2733"),e.dataset.lumaKey!==void 0&&(this.lumaKey=Number(e.dataset.lumaKey)),this.program=this.createProgram(),this.prepareGeometry(),this.cacheUniforms(),this.loadArtwork(),this.observe(),this.watchResize(),e.__kdxArtifact=this}debug(){return{estado:this.root.dataset.kdxArtifactState,reveal:this.reveal,visible:this.visible,loopActivo:this.raf!==0,textura:this.texture!==null,textureSize:this.textureSize,canvas:[this.canvas.width,this.canvas.height],reducedMotion:this.reducedMotion,lumaKey:this.lumaKey,lumaFloor:this.options.lumaFloor,lumaCeil:this.options.lumaCeil}}compile(e,o){const{gl:a}=this,t=a.createShader(e);if(!t)throw new Error("KODEX artifact: no se pudo crear el shader.");if(a.shaderSource(t,o),a.compileShader(t),!a.getShaderParameter(t,a.COMPILE_STATUS)){const n=a.getShaderInfoLog(t);throw a.deleteShader(t),new Error(`KODEX artifact: shader no compila — ${n}`)}return t}createProgram(){const{gl:e}=this,o=e.createProgram();if(!o)throw new Error("KODEX artifact: no se pudo crear el programa.");const a=this.compile(e.VERTEX_SHADER,v),t=this.compile(e.FRAGMENT_SHADER,b);if(e.attachShader(o,a),e.attachShader(o,t),e.linkProgram(o),!e.getProgramParameter(o,e.LINK_STATUS))throw new Error(`KODEX artifact: link falló — ${e.getProgramInfoLog(o)}`);return e.deleteShader(a),e.deleteShader(t),o}prepareGeometry(){const{gl:e,program:o}=this,a=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const t=e.getAttribLocation(o,"a_position");e.enableVertexAttribArray(t),e.vertexAttribPointer(t,2,e.FLOAT,!1,0,0)}cacheUniforms(){const e=["artwork","resolution","artworkSize","time","accent","pixelSize","ditherAmount","scanlineAmount","glowAmount","chromaAmount","flickerAmount","reducedMotion","reveal","lumaKey","lumaFloor","lumaCeil","tint"];for(const o of e)this.uniforms.set(o,this.gl.getUniformLocation(this.program,o))}loadArtwork(){const e=this.root.dataset.artwork;if(!e){this.fallback("KODEX artifact: falta data-artwork.");return}const o=new Image;o.crossOrigin="anonymous",o.decoding="async",o.onload=()=>{if(this.disposed)return;const{gl:a}=this,t=this.analyzeArtwork(o);this.lumaKey<0&&(this.lumaKey=t?.hasAlpha?0:1),t&&this.root.dataset.lumaFloor===void 0&&(this.options.lumaFloor=t.floor),t&&this.root.dataset.lumaCeil===void 0&&(this.options.lumaCeil=t.ceil);const n=a.createTexture();a.bindTexture(a.TEXTURE_2D,n),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.LINEAR),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.LINEAR),a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,1),a.texImage2D(a.TEXTURE_2D,0,a.RGBA,a.RGBA,a.UNSIGNED_BYTE,o),this.texture=n,this.textureSize=[o.naturalWidth,o.naturalHeight],this.root.dataset.kdxArtifactState="ready",this.resize(),this.start()},o.onerror=()=>this.fallback(`KODEX artifact: no se pudo cargar ${e}`),o.src=e}analyzeArtwork(e){try{const a=document.createElement("canvas");a.width=a.height=64;const t=a.getContext("2d",{willReadFrequently:!0});if(!t)return null;t.drawImage(e,0,0,64,64);const n=t.getImageData(0,0,64,64).data,r=4096;let d=0;const c=new Float32Array(r);for(let s=0,m=0;s<n.length;s+=4,m++)n[s+3]<250&&d++,c[m]=(n[s]*.2126+n[s+1]*.7152+n[s+2]*.0722)/255;const f=d>r*.04;c.sort();const u=Math.min(.45,Math.max(.045,c[Math.floor(r*.66)])),p=Math.min(1,Math.max(u+.08,c[Math.floor(r*.99)]));return{hasAlpha:f,floor:u,ceil:p}}catch{return null}}fallback(e){console.warn(e),this.root.dataset.kdxArtifactState="fallback",this.stop()}observe(){new IntersectionObserver(o=>{for(const a of o)this.visible=a.isIntersecting,this.visible&&this.texture?this.start():this.visible||this.stop()},{threshold:.05}).observe(this.root)}watchResize(){new ResizeObserver(()=>this.resize()).observe(this.canvas)}resize(){const{canvas:e,gl:o}=this,a=e.getBoundingClientRect();if(!a.width||!a.height)return;const t=Math.min(window.devicePixelRatio||1,2),n=Math.round(a.width*t),r=Math.round(a.height*t);e.width===n&&e.height===r||(e.width=n,e.height=r,o.viewport(0,0,n,r),!this.raf&&this.texture&&this.draw())}start(){this.raf||this.disposed||!this.texture||(this.raf=requestAnimationFrame(this.frame))}stop(){this.raf&&(cancelAnimationFrame(this.raf),this.raf=0)}frame=()=>{if(this.raf=0,this.disposed)return;const e=this.reducedMotion?1:.018;this.reveal=g(this.reveal+e,0,1),this.draw(),!(this.reducedMotion&&this.reveal>=1)&&this.visible&&(this.raf=requestAnimationFrame(this.frame))};draw(){const{gl:e,program:o,canvas:a}=this;if(!this.texture)return;e.useProgram(o),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,this.texture);const t=r=>this.uniforms.get(r)??null;e.uniform1i(t("artwork"),0),e.uniform2f(t("resolution"),a.width,a.height),e.uniform2f(t("artworkSize"),this.textureSize[0],this.textureSize[1]),e.uniform1f(t("time"),(performance.now()-this.startTime)/1e3),e.uniform3f(t("accent"),this.accent[0],this.accent[1],this.accent[2]);const n=Math.min(window.devicePixelRatio||1,2);e.uniform1f(t("pixelSize"),Math.max(1,this.options.pixelSize*n)),e.uniform1f(t("ditherAmount"),this.options.dither),e.uniform1f(t("scanlineAmount"),this.options.scanlines),e.uniform1f(t("glowAmount"),this.options.glow),e.uniform1f(t("chromaAmount"),this.options.chroma),e.uniform1f(t("flickerAmount"),this.options.flicker),e.uniform1f(t("reducedMotion"),this.reducedMotion?1:0),e.uniform1f(t("reveal"),this.reveal),e.uniform1f(t("lumaKey"),this.lumaKey<0?0:this.lumaKey),e.uniform1f(t("lumaFloor"),this.options.lumaFloor),e.uniform1f(t("lumaCeil"),this.options.lumaCeil),e.uniform1f(t("tint"),this.options.tint),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.drawArrays(e.TRIANGLES,0,3)}dispose(){this.disposed=!0,this.stop(),this.texture&&this.gl.deleteTexture(this.texture)}}const h=()=>{const l=document.querySelectorAll("[data-kdx-artifact]");for(const e of l)if(!e.dataset.kdxArtifactState){e.dataset.kdxArtifactState="loading";try{new A(e)}catch(o){console.warn(o),e.dataset.kdxArtifactState="fallback"}}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",h,{once:!0}):h();
