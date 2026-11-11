const D=`
attribute vec2 p;
varying vec2 uv;
void main(){ uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`,w=`
precision highp float;
varying vec2 uv;
float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
vec3 hash3(vec3 p){ return vec3(hash(p), hash(p + 19.19), hash(p + 47.77)); }
float noise(vec3 x){
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++){ s += a * noise(p); p = p * 2.07 + 0.31; a *= 0.5; } return s; }
`,S=w+`
// mar: (lat, lon, radio) en grados → peso gaussiano con borde irregular
float mar(vec3 n, float lat, float lon, float r){
  float la = radians(lat), lo = radians(lon);
  vec3 c = vec3(cos(la) * sin(lo), sin(la), cos(la) * cos(lo));
  float d = degrees(acos(clamp(dot(n, c), -1.0, 1.0)));
  r *= 1.45;                                   // los mares reales son grandes y se tocan
  return exp(-pow(d / r, 2.0) * 1.1);
}
// cráteres Worley: devuelve (anillo claro, fondo oscuro)
vec2 crateres(vec3 p){
  vec3 i = floor(p), f = fract(p);
  float rim = 0.0, bowl = 0.0;
  for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){
    vec3 g = vec3(float(x), float(y), float(z));
    vec3 h = hash3(i + g);
    if (h.z > 0.42) continue;                 // no todas las celdas tienen cráter
    vec3 o = g + h * 0.8 + 0.1 - f;
    float d = length(o);
    float r = 0.16 + h.x * 0.26;
    bowl = max(bowl, 1.0 - smoothstep(r * 0.55, r, d));
    rim = max(rim, smoothstep(r * 0.78, r, d) * (1.0 - smoothstep(r, r * 1.22, d)));
  }
  return vec2(rim, bowl);
}
void main(){
  vec2 q = uv * 2.0 - 1.0;
  float r2 = dot(q, q);
  if (r2 > 1.0) { gl_FragColor = vec4(0.0); return; }
  vec3 n = vec3(q, sqrt(1.0 - r2));
  // borde irregular de los mares: se deforma el dominio, no solo el radio
  float w = (fbm(n * 3.2 + 4.0) - 0.5) * 0.55;
  vec3 nv = n;
  n = normalize(n + (vec3(fbm(n * 2.4), fbm(n * 2.4 + 5.2), fbm(n * 2.4 + 9.7)) - 0.5) * 0.32);
  float m = 0.0;
  m = max(m, mar(n, 33.0, -16.0, 15.0 + w * 10.0));   // Imbrium
  m = max(m, mar(n, 28.0, 17.5, 9.5 + w * 6.0));      // Serenitatis
  m = max(m, mar(n, 8.5, 31.0, 11.0 + w * 7.0));      // Tranquillitatis
  m = max(m, mar(n, 17.0, 59.0, 6.8 + w * 4.0));      // Crisium
  m = max(m, mar(n, -7.8, 51.3, 8.0 + w * 5.0));      // Fecunditatis
  m = max(m, mar(n, -15.2, 35.5, 5.2 + w * 3.0));     // Nectaris
  m = max(m, mar(n, -21.3, -16.6, 8.5 + w * 6.0));    // Nubium
  m = max(m, mar(n, -24.4, -38.6, 5.4 + w * 3.0));    // Humorum
  m = max(m, mar(n, 13.3, 3.6, 4.0 + w * 3.0));       // Vaporum
  m = max(m, mar(n, -10.5, -22.3, 5.0 + w * 3.0));    // Cognitum
  m = max(m, mar(n, 7.5, -30.9, 6.5 + w * 4.0));      // Insularum
  m = max(m, mar(n, 18.0, -57.0, 20.0 + w * 14.0));   // Procellarum (norte)
  m = max(m, mar(n, -2.0, -50.0, 13.0 + w * 9.0));    // Procellarum (sur)
  m = max(m, mar(n, 56.0, -20.0, 7.0 + w * 4.0) );    // Frigoris (oeste)
  m = max(m, mar(n, 57.0, 8.0, 6.5 + w * 4.0));       // Frigoris (este)
  float nucleo = smoothstep(0.55, 0.95, m);
  m = smoothstep(0.08, 0.72, m);
  n = nv;
  // tierras altas claras con grano; mares lisos y oscuros con matiz propio
  float grano = fbm(n * 22.0) - 0.5;
  float fino = noise(n * 120.0) - 0.5;
  float alto = 0.80 + grano * 0.16 + fino * 0.06;
  float bajo = 0.52 + (fbm(n * 9.0) - 0.5) * 0.10 + (fbm(n * 4.0 + 2.0) - 0.5) * 0.08 + fino * 0.025 - nucleo * 0.06;
  float a = mix(alto, bajo, m);
  // cráteres: dos escalas, sobre todo en tierras altas
  vec2 c1 = crateres(n * 11.0);
  vec2 c2 = crateres(n * 27.0 + 7.0);
  float alta = 1.0 - m * 0.75;
  a += (c1.x * 0.045 + c2.x * 0.03) * alta;
  a -= (c1.y * 0.035 + c2.y * 0.02) * alta;
  // Tycho (−43.3, −11.2) y sus rayos, tenues
  float la = radians(-43.3), lo = radians(-11.2);
  vec3 ty = vec3(cos(la) * sin(lo), sin(la), cos(la) * cos(lo));
  float dt = degrees(acos(clamp(dot(n, ty), -1.0, 1.0)));
  a += (1.0 - smoothstep(1.2, 2.2, dt)) * 0.18;
  float ang = atan(dot(cross(ty, n), vec3(0.0, 0.0, 1.0)), dot(n - ty * dot(n, ty), vec3(0.0, 1.0, 0.0)));
  a += pow(max(0.0, sin(ang * 9.0 + fbm(n * 6.0) * 4.0)), 18.0) * (1.0 - smoothstep(2.0, 40.0, dt)) * 0.07;
  // Copérnico (9.6, −20.1): punto claro chico
  la = radians(9.6); lo = radians(-20.1);
  vec3 co = vec3(cos(la) * sin(lo), sin(la), cos(la) * cos(lo));
  a += (1.0 - smoothstep(0.8, 1.8, degrees(acos(clamp(dot(n, co), -1.0, 1.0))))) * 0.12;
  gl_FragColor = vec4(clamp(a, 0.0, 1.0), 0.0, 0.0, 1.0);
}`,C=w+`
uniform sampler2D albedoTex;
uniform vec3 L;
uniform float south;
uniform float px;
uniform float earth;
void main(){
  vec2 q = uv * 2.0 - 1.0;
  float r2 = dot(q, q);
  if (r2 > 1.0) { gl_FragColor = vec4(0.0); return; }
  vec3 n = vec3(q, sqrt(1.0 - r2));
  // en el sur la cara se ve girada 180°: se lee el albedo en el punto opuesto
  vec2 tuv = south > 0.5 ? vec2(1.0) - uv : uv;
  float albedo = texture2D(albedoTex, tuv).r;
  float mu0 = dot(n, normalize(L));
  float mu = n.z;
  float lit = mu0 > 0.0 ? 2.0 * mu0 / (mu0 + mu + 1e-4) : 0.0;
  float soft = smoothstep(-0.012, 0.05, mu0);
  vec3 hueso = vec3(0.945, 0.930, 0.905);
  vec3 col = hueso * albedo * lit * soft * 0.95;
  col += vec3(0.60, 0.64, 0.72) * albedo * earth * (1.0 - soft) * (0.4 + 0.6 * mu);
  float a = 1.0 - smoothstep(1.0 - px * 1.5, 1.0, sqrt(r2));
  gl_FragColor = vec4(col * a, a);
}`;function R(r,i){const c=r.phaseAngle*Math.PI/180;let n=r.waxing?1:-1;return i&&(n=-n),[Math.sin(c)*n,0,Math.cos(c)]}function z(r,i){const c=Math.min(window.devicePixelRatio||1,2);let n=null;const e=r.getContext("webgl",{premultipliedAlpha:!0,alpha:!0,antialias:!1,preserveDrawingBuffer:!0});function h(){const o=r.getBoundingClientRect(),a=Math.max(64,Math.round(o.width*c)),t=r.width!==a||r.height!==a;return t&&(r.width=a,r.height=a),{w:a,cambio:t}}if(!e){const o=r.getContext("2d"),a=t=>{n=t;const{w:m}=h(),f=m/2-1,l=m/2;o.clearRect(0,0,m,m),o.fillStyle="rgba(160,165,180,0.10)",o.beginPath(),o.arc(l,l,f,0,Math.PI*2),o.fill();const[I]=R(t,i.south),T=Math.cos(t.phaseAngle*Math.PI/180),b=I>0;o.fillStyle="rgba(240,237,232,0.92)",o.beginPath(),o.arc(l,l,f,-Math.PI/2,Math.PI/2,!b),o.ellipse(l,l,Math.abs(T)*f,f,0,Math.PI/2,-Math.PI/2,T>0===b),o.fill()};return{draw:a,resize:()=>n&&a(n),destroy(){},webgl:!1}}const d=(o,a)=>{const t=e.createShader(o);if(e.shaderSource(t,a),e.compileShader(t),!e.getShaderParameter(t,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(t)||"shader");return t},g=o=>{const a=e.createProgram();if(e.attachShader(a,d(e.VERTEX_SHADER,D)),e.attachShader(a,d(e.FRAGMENT_SHADER,o)),e.linkProgram(a),!e.getProgramParameter(a,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(a)||"link");return a},x=g(S),s=g(C),A=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,A),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW);const p=o=>{const a=e.getAttribLocation(o,"p");e.enableVertexAttribArray(a),e.vertexAttribPointer(a,2,e.FLOAT,!1,0,0)},u=e.createTexture(),_=e.createFramebuffer();let v=0;function P(o){e.bindTexture(e.TEXTURE_2D,u),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,o,o,0,e.RGBA,e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,_),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,u,0),e.viewport(0,0,o,o),e.useProgram(x),p(x),e.drawArrays(e.TRIANGLE_STRIP,0,4),e.bindFramebuffer(e.FRAMEBUFFER,null),v=o}const F=e.getUniformLocation(s,"L"),y=e.getUniformLocation(s,"south"),L=e.getUniformLocation(s,"px"),M=e.getUniformLocation(s,"earth"),U=e.getUniformLocation(s,"albedoTex"),E=o=>{n=o;const{w:a}=h();v!==a&&P(a),e.viewport(0,0,a,a),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(s),p(s),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,u),e.uniform1i(U,0),e.uniform3fv(F,R(o,i.south)),e.uniform1f(y,i.south?1:0),e.uniform1f(L,2/a),e.uniform1f(M,.08*Math.pow(1-o.illumination,2)),e.drawArrays(e.TRIANGLE_STRIP,0,4)};return{draw:E,webgl:!0,resize:()=>n&&E(n),destroy:()=>{e.getExtension("WEBGL_lose_context")?.loseContext()}}}export{z as c};
