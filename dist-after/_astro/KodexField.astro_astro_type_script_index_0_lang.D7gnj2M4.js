import{_ as n}from"./preload-helper.CVfkMyKi.js";import{p}from"./perf.pXeg77Pe.js";import{estadoEscena as v}from"./estado.CGZTMTa8.js";const L=`#version 300 es
precision highp float;
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`,M=`
uniform float u_kdxGain;
uniform float u_kdxGrade;
uniform float u_kdxFloor;
uniform float u_kdxDetail;
uniform float u_kdxTime;
uniform vec3  u_kdxTint;
uniform vec3  u_kdxSpark;
uniform vec2  u_kdxRes;

void kdxFieldSource();

float kdxHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  kdxFieldSource();
  vec3 src = fragColor.rgb;
  float l = dot(src, vec3(0.2126, 0.7152, 0.0722));

  // Piso de luminancia. No todos los presets se parecen: el portal y el
  // fractal son casi todo negro con estructura brillante, mientras el ácido
  // llena el cuadro entero a media luz. Bajar la ganancia al ácido lo apaga
  // sin devolverle el negro; hundir el piso sí: lo medio se va a cero y sólo
  // queda el nervio del patrón, que es lo que se puede tener detrás de texto.
  float lRaw = l;
  l = smoothstep(u_kdxFloor, 1.0, l);
  // El resto del preset que sobrevive al grado se hunde igual, o el color
  // original vuelve a subir el brillo por el costado.
  src *= l / max(lRaw, 0.001);

  // HEBRA. En la referencia -- el vortice de Motherboard -- no hay manchas:
  // hay filamentos finos. Una curva de potencia hunde los medios y deja subir
  // solo lo que ya era cresta, asi que la misma estructura del preset se lee
  // como hebra en vez de como nube. Es la diferencia entre un degradado con
  // color y algo que parece dibujado con luz.
  l = pow(l, mix(1.0, 2.6, u_kdxDetail));
  // La curva se lleva la mayor parte de la energia: sin devolverla, afinar la
  // hebra equivale a apagar el campo. Se compensa aqui y no subiendo la
  // ganancia de la lamina, que tambien levantaria el fondo que se acaba de
  // hundir.
  l = min(1.0, l * mix(1.0, 2.6, u_kdxDetail));

  // Rampa de la lámina: el acento toma el cuerpo medio y sólo los altos llegan
  // a blanco, que es lo que mantiene el campo por debajo del texto.
  vec3 ramp = u_kdxTint * smoothstep(0.02, 0.62, l);
  // Segundo tono en las crestas. La referencia no es monocroma: sobre el azul
  // hay puntos cian, ambar y blancos, y ese chispeo es lo que la hace leer
  // como holograma y no como filtro de color. El acento sigue mandando en el
  // cuerpo; el segundo tono aparece solo donde ya habia brillo.
  ramp = mix(ramp, u_kdxSpark, smoothstep(0.52, 0.94, l) * u_kdxDetail * 0.8);
  // El blanco entra tarde y a propósito. Con un umbral más bajo el núcleo del
  // portal se abría en un velo pálido sobre el artefacto y apagaba la trama:
  // aquí sólo el filamento más caliente llega a blanco.
  ramp += vec3(smoothstep(0.86, 1.0, l)) * 0.7;
  vec3 color = mix(src, ramp, u_kdxGrade);

  // NODOS. La referencia esta sembrada de puntos que titilan sobre las hebras,
  // como una red vista de lejos. Se siembran en una grilla fija -- no por
  // pixel, o serian ruido -- y solo prenden donde la hebra ya pasa: un punto
  // en el vacio no seria un nodo, seria suciedad.
  vec2 cell = floor(gl_FragCoord.xy / 7.0);
  float seed = kdxHash(cell);
  // Cada nodo late a su propio ritmo y con su propia fase.
  float beat = 0.5 + 0.5 * sin(u_kdxTime * (0.6 + seed * 2.4) + seed * 31.4);
  float node = step(0.968, seed + beat * 0.05) * smoothstep(0.22, 0.6, l);
  color += mix(u_kdxSpark, vec3(1.0), 0.45) * node * beat * u_kdxDetail * 1.5;

  // Viñeta: el campo se apaga hacia los bordes, donde viven los paneles de
  // datos y la navegación. Sin esto el fondo compite justo donde hay que leer.
  vec2 p = gl_FragCoord.xy / u_kdxRes - 0.5;
  float vig = 1.0 - smoothstep(0.30, 0.86, length(p * vec2(1.0, 1.25)));

  fragColor = vec4(color * u_kdxGain * mix(0.28, 1.0, vig), 1.0);
}
`,O=a=>{let e=a.replace(/^#version\s+\d+\s+\w+\s*$/m,"#version 300 es");return/^#version/m.test(e)||(e=`#version 300 es
${e}`),/precision\s+\w+\s+float/.test(e)||(e=e.replace(/(#version[^\n]*\n)/,`$1precision highp float;
precision highp int;
`)),e=e.replace(/\bvoid\s+main\s*\(\s*(void)?\s*\)/,"void kdxFieldSource()"),`${e}
${M}`},g=a=>{const e=/^#?([0-9a-f]{6})$/i.exec(a.trim());if(!e)return[1,.23,.19];const o=parseInt(e[1],16);return[(o>>16&255)/255,(o>>8&255)/255,(o&255)/255]};class x{root;canvas;gl;program;uniforms=new Map;reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;options;tint;spark;pointer={x:.5,y:.5};pointerVel={x:0,y:0};pointerPrev={x:.5,y:.5};targets=[];current=0;start=performance.now();last=this.start;raf=0;visible=!0;disposed=!1;constructor(e,o){this.root=e;const t=e.querySelector("[data-kdx-field-canvas]");if(!t)throw new Error("KODEX field: falta el canvas.");this.canvas=t;const i=t.getContext("webgl2",{alpha:!0,antialias:!1,premultipliedAlpha:!1,powerPreference:"low-power"});if(!i)throw new Error("KODEX field: WebGL2 no disponible.");this.gl=i,this.options={intensity:Number(e.dataset.intensity??.55),feedback:Number(e.dataset.feedback??.35),speed:Number(e.dataset.speed??1),seed:Number(e.dataset.seed??1),grade:Number(e.dataset.grade??.82),floor:Number(e.dataset.floor??.16),detail:Number(e.dataset.detail??.75)},this.tint=g(e.dataset.tint??"#ff3b30"),this.spark=g(e.dataset.spark??"#7fe9ff"),this.program=this.build(L,O(o)),this.geometry(),this.cacheUniforms(),this.resize(),this.bind(),this.root.dataset.kdxFieldState="ready",this.loop()}compile(e,o){const{gl:t}=this,i=t.createShader(e);if(!i)throw new Error("KODEX field: no se pudo crear el shader.");if(t.shaderSource(i,o),t.compileShader(i),!t.getShaderParameter(i,t.COMPILE_STATUS)){const s=t.getShaderInfoLog(i);throw t.deleteShader(i),new Error(`KODEX field: no compila — ${s}`)}return i}build(e,o){const{gl:t}=this,i=t.createProgram();if(!i)throw new Error("KODEX field: no se pudo crear el programa.");if(t.attachShader(i,this.compile(t.VERTEX_SHADER,e)),t.attachShader(i,this.compile(t.FRAGMENT_SHADER,o)),t.linkProgram(i),!t.getProgramParameter(i,t.LINK_STATUS))throw new Error(`KODEX field: link falló — ${t.getProgramInfoLog(i)}`);return i}geometry(){const{gl:e,program:o}=this,t=e.createVertexArray();e.bindVertexArray(t);const i=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,i),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const s=e.getAttribLocation(o,"a_position");e.enableVertexAttribArray(s),e.vertexAttribPointer(s,2,e.FLOAT,!1,0,0)}cacheUniforms(){const e=["u_time","u_delta","u_resolution","u_pointer","u_seed","u_feedback","u_intensity","u_previousFrame","u_audio","u_audioLow","u_audioMid","u_audioHigh","u_kdxGain","u_kdxGrade","u_kdxFloor","u_kdxDetail","u_kdxTime","u_kdxTint","u_kdxSpark","u_kdxRes","u_pointerVelocity","u_scrollProgress","u_sceneProgress","u_transition","u_state","u_devicePixelRatio","u_reducedMotion"];for(const o of e)this.uniforms.set(o,this.gl.getUniformLocation(this.program,o))}makeTargets(e,o){const{gl:t}=this;for(const i of this.targets)t.deleteFramebuffer(i.fb),t.deleteTexture(i.tex);this.targets=[];for(let i=0;i<2;i++){const s=t.createTexture();t.bindTexture(t.TEXTURE_2D,s),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,e,o,0,t.RGBA,t.UNSIGNED_BYTE,null),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR);const d=t.createFramebuffer();t.bindFramebuffer(t.FRAMEBUFFER,d),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,s,0),this.targets.push({fb:d,tex:s})}t.bindFramebuffer(t.FRAMEBUFFER,null)}resize(){const{canvas:e,gl:o}=this,t=e.getBoundingClientRect();if(!t.width||!t.height)return;const i=Math.min(window.devicePixelRatio||1,1.5)*.6*p().escala,s=Math.max(2,Math.round(t.width*i)),d=Math.max(2,Math.round(t.height*i));e.width===s&&e.height===d||(e.width=s,e.height=d,o.viewport(0,0,s,d),this.makeTargets(s,d))}bind(){new ResizeObserver(()=>this.resize()).observe(this.canvas),new IntersectionObserver(e=>{for(const o of e)this.visible=o.isIntersecting,this.visible&&!this.raf?this.loop():!this.visible&&this.raf&&(cancelAnimationFrame(this.raf),this.raf=0)},{threshold:.01}).observe(this.root),this.reducedMotion||this.root.addEventListener("pointermove",e=>{const o=this.canvas.getBoundingClientRect();this.pointer.x=(e.clientX-o.left)/o.width,this.pointer.y=1-(e.clientY-o.top)/o.height},{passive:!0})}loop=()=>{this.raf=0,!this.disposed&&(this.draw(),!this.reducedMotion&&this.visible&&(this.raf=requestAnimationFrame(this.loop)))};draw(){const{gl:e,program:o,canvas:t}=this;if(this.targets.length<2)return;const i=performance.now(),s=window.__kdxRueda,d={descender:150,recorrer:110,reensamblar:90,orbitar:70,intensificar:45,girar:0},k=s?s.valor*(d[s.herramienta]??40):0,l=(i-this.start)/1e3*this.options.speed+k,R=Math.min(.05,(i-this.last)/1e3);this.last=i;const T=this.targets[this.current],w=this.targets[1-this.current];e.useProgram(o);const r=P=>this.uniforms.get(P)??null;e.uniform1f(r("u_time"),l),e.uniform1f(r("u_delta"),R),e.uniform2f(r("u_resolution"),t.width,t.height),e.uniform2f(r("u_pointer"),this.pointer.x,this.pointer.y);const y=this.pointer.x-this.pointerPrev.x,A=this.pointer.y-this.pointerPrev.y;this.pointerVel.x+=(y-this.pointerVel.x)*.18,this.pointerVel.y+=(A-this.pointerVel.y)*.18,this.pointerPrev={x:this.pointer.x,y:this.pointer.y},e.uniform2f(r("u_pointerVelocity"),this.pointerVel.x,this.pointerVel.y),e.uniform1f(r("u_scrollProgress"),s?.progreso??0);const f=v();e.uniform1f(r("u_sceneProgress"),f.intensidad),e.uniform1f(r("u_state"),f.intensidad),e.uniform1f(r("u_transition"),f.actual==="transitionOut"?1:0),e.uniform1f(r("u_devicePixelRatio"),devicePixelRatio||1),e.uniform1f(r("u_reducedMotion"),this.reducedMotion?1:0),e.uniform1f(r("u_seed"),this.options.seed),e.uniform1f(r("u_feedback"),p().feedback?this.options.feedback:0),e.uniform1f(r("u_intensity"),1);const c=window.__kxAudio,u=c?.activo===!0,h=u?c.low:.5+Math.sin(l*.7)*.3,_=u?c.mid:.5+Math.sin(l*1.3+1.7)*.25,m=u?c.high:.5+Math.sin(l*2.1+3.1)*.2;e.uniform3f(r("u_audio"),h,_,m),e.uniform1f(r("u_audioLow"),h),e.uniform1f(r("u_audioMid"),_),e.uniform1f(r("u_audioHigh"),m);const F=u?.82+h*.55:1,D=u?.92+m*1.6:1,S=.55+v().intensidad*.45;e.uniform1f(r("u_kdxGain"),this.options.intensity*F*S),e.uniform1f(r("u_kdxGrade"),this.options.grade),e.uniform1f(r("u_kdxFloor"),this.options.floor),e.uniform1f(r("u_kdxDetail"),(this.reducedMotion?this.options.detail*.5:this.options.detail)*D),e.uniform1f(r("u_kdxTime"),this.reducedMotion?0:l),e.uniform3f(r("u_kdxSpark"),this.spark[0],this.spark[1],this.spark[2]),e.uniform3f(r("u_kdxTint"),this.tint[0],this.tint[1],this.tint[2]),e.uniform2f(r("u_kdxRes"),t.width,t.height),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,T.tex),e.uniform1i(r("u_previousFrame"),0),p().feedback&&(e.bindFramebuffer(e.FRAMEBUFFER,w.fb),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.drawArrays(e.TRIANGLES,0,3)),e.bindFramebuffer(e.FRAMEBUFFER,null),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.drawArrays(e.TRIANGLES,0,3),this.current=1-this.current}debug(){return{estado:this.root.dataset.kdxFieldState,shader:this.root.dataset.field,canvas:[this.canvas.width,this.canvas.height],loop:this.raf!==0,visible:this.visible,reducedMotion:this.reducedMotion}}}const E={"wrinkled-reality":()=>n(()=>import("./wrinkled-reality.D6bJcgk-.js"),[]).then(a=>a.default),"ripple-floor":()=>n(()=>import("./ripple-floor.h0rI-1Ug.js"),[]).then(a=>a.default),"network-vortex":()=>n(()=>import("./network-vortex.CqPhE241.js"),[]).then(a=>a.default),"threshold-portal":()=>n(()=>import("./threshold-portal.NP3_SVRS.js"),[]).then(a=>a.default),"archive-orbit":()=>n(()=>import("./archive-orbit.DBTFyCkX.js"),[]).then(a=>a.default),"liquid-acid":()=>n(()=>import("./liquid-acid.x5PMRfZF.js"),[]).then(a=>a.default),"signal-bloom":()=>n(()=>import("./signal-bloom.Du3vM3bq.js"),[]).then(a=>a.default),"mandelbrot-field":()=>n(()=>import("./mandelbrot-field.ByqBarBk.js"),[]).then(a=>a.default),"impossible-structure":()=>n(()=>import("./impossible-structure.86Jvp_pR.js"),[]).then(a=>a.default),"split-corridor":()=>n(()=>import("./split-corridor.CTgBzovf.js"),[]).then(a=>a.default)},b=async()=>{const a=document.querySelectorAll("[data-kdx-field]");for(const e of a){if(e.dataset.kdxFieldState)continue;e.dataset.kdxFieldState="loading";const o=e.dataset.field??"threshold-portal";try{const t=E[o];if(!t)throw new Error(`KODEX field: shader desconocido "${o}"`);new x(e,await t())}catch(t){if(console.warn(`[kodex-field] "${o}" no arrancó:`,t),e.dataset.kdxFieldError=String(t?.message??t).slice(0,120),o!=="network-vortex")try{new x(e,await E["network-vortex"]()),e.dataset.kdxFieldState="fallback",e.dataset.field=`${o} → network-vortex`;continue}catch{}e.dataset.kdxFieldState="failed"}}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",b,{once:!0}):b();
