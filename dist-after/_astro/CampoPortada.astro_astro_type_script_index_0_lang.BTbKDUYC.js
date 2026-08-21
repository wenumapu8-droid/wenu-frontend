const I=`#version 300 es
in vec2 p; out vec2 v_uv; void main(){ v_uv=p*0.5+0.5; gl_Position=vec4(p,0.,1.); }`,q=`#version 300 es
precision highp float;
in vec2 v_uv; out vec4 o;
uniform vec2 u_res; uniform float u_time; uniform float u_seed;
uniform vec2 u_pointer; uniform float u_bass; uniform float u_state;
uniform float u_px; uniform float u_exp;

float hash21(vec2 p){ p=fract(p*vec2(234.34,435.345)); p+=dot(p,p+34.23); return fract(p.x*p.y); }
float bayer(vec2 c){
  int x=int(mod(c.x,4.)), y=int(mod(c.y,4.));
  int i=x+y*4;
  float m[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
  return m[i]/16.-0.5;
}
float mandala(vec2 c){
  float r=length(c); float a=atan(c.y,c.x);
  float rings=smoothstep(.02,.0,abs(fract(r*6.0-u_time*0.02)-0.5)-0.42);
  float spokes=smoothstep(.55,1.,abs(sin(a*12.0)));
  float petals=smoothstep(.35,.0,abs(r-0.34-0.05*sin(a*8.0+u_time*0.1)));
  float cross=smoothstep(.012,.0,abs(c.x))+smoothstep(.012,.0,abs(c.y));
  float core=smoothstep(.10,.06,r);
  float m=max(max(rings*0.7, petals), max(spokes*smoothstep(.5,.15,r), core));
  m=max(m, cross*smoothstep(.5,.0,r)*0.6);
  return clamp(m,0.,1.);
}
void main(){
  vec2 res=u_res;
  vec2 frag=gl_FragCoord.xy;
  vec2 blk=floor(frag/u_px)*u_px + u_px*0.5;
  vec2 uv=blk/res;
  /* LA CÁMARA, NO LA OBRA.
     El original hacía  c.x *= res.x/res.y  -- bien en apaisado, pero en
     vertical achica el eje corto: el radio nunca llega a 1, la viñeta no cierra
     y la pantalla queda inundada de rojo. Medido en 390x844: un muro.
     Se normaliza por el lado CORTO. La figura conserva su proporción -- sigue
     siendo circular, no se estira -- y el encuadre se extiende por el lado
     largo, que es donde debe oscurecer. Regla del creador: si no cabe, se
     mueve la cámara. */
  vec2 c=(uv-0.5)*(res/max(1.,min(res.x,res.y)));

  float radius=length(c); float angle=atan(c.y,c.x);
  float breathe=sin(u_time*mix(.12,.28,u_state))*mix(.02,.08,u_state);
  float bassPulse=u_bass*mix(.05,.20,u_state);
  float polarWarp=mix(.06,.24,u_state)*sin(angle*4.+u_time*.18+u_seed*6.283);
  float pointerPull=dot(c,u_pointer)*0.12;
  float wr=radius*(1.-breathe-bassPulse)+polarWarp*0.5;
  float wa=angle+pointerPull+sin(radius*11.-u_time*.22)*.06;
  vec2 sUv=vec2(cos(wa),sin(wa))*wr;

  float mask=mandala(sUv);
  float ring=smoothstep(.72,.18,radius);
  float halo=exp(-8.*abs(radius-0.22-bassPulse*0.5));
  float grain=(hash21(frag+u_seed*100.)-0.5)*0.05;

  vec3 base=mix(vec3(.02,.008,.008), vec3(.85,.09,.10), mask);
  base+=vec3(1.,.26,.14)*halo*(0.35+0.5*u_state)*(0.6+u_bass);
  base*=ring; base+=grain;

  float lum=dot(base,vec3(.299,.587,.114));
  float d=bayer(frag/u_px);
  float q=step(0.5, fract(lum*5.0 + d));
  base*= (0.72+0.42*q);

  float scan=0.82+0.18*sin(frag.y*0.9 + u_time*2.0);
  base*=scan;

  base.r*=1.04; base.b+=mask*0.08+halo*0.06;
  base*=smoothstep(1.15,.25,length(c));

  /* EXPOSICIÓN. El shader es el del creador y no se toca su estructura; lo que
     se ajusta es cuánta luz entra, que es una decisión de cámara. Su captura de
     referencia es casi negra con el rojo apenas insinuado, y a exposición plena
     el campo salía encendido y le comía la palabra. */
  base*=u_exp;

  o=vec4(base,1.);
}`,E=matchMedia("(prefers-reduced-motion: reduce)").matches;function m(){for(const a of document.querySelectorAll("[data-kdx-campo]")){if(a.dataset.kdxCampoMontado)continue;a.dataset.kdxCampoMontado="1";const e=a.getContext("webgl2",{antialias:!1,alpha:!0});if(!e)continue;const f=(t,n)=>{const s=e.createShader(t);return e.shaderSource(s,n),e.compileShader(s),e.getShaderParameter(s,e.COMPILE_STATUS)||console.error(e.getShaderInfoLog(s)),s},r=e.createProgram();e.attachShader(r,f(e.VERTEX_SHADER,I)),e.attachShader(r,f(e.FRAGMENT_SHADER,q)),e.linkProgram(r),e.useProgram(r);const y=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,y),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const p=e.getAttribLocation(r,"p");e.enableVertexAttribArray(p),e.vertexAttribPointer(p,2,e.FLOAT,!1,0,0);const o=t=>e.getUniformLocation(r,t),R=o("u_res"),w=o("u_time"),S=o("u_seed"),M=o("u_pointer"),P=o("u_bass"),k=o("u_state"),C=o("u_px"),L=o("u_exp");e.uniform1f(S,Math.random());const i=Math.min(window.devicePixelRatio||1,2);let h=0,v=0;const b=()=>{h=a.clientWidth,v=a.clientHeight,a.width=Math.max(1,Math.round(h*i)),a.height=Math.max(1,Math.round(v*i)),e.viewport(0,0,a.width,a.height)};b(),addEventListener("resize",b,{passive:!0});let c=[0,0];addEventListener("pointermove",t=>{c=[(t.clientX/innerWidth-.5)*2,(.5-t.clientY/innerHeight)*2]},{passive:!0});const u=Number(a.dataset.kdxCampoEstado||"0.15"),O={idle:.1,aware:.24,locked:.46,active:.72,transitionOut:.9},T=()=>O[document.documentElement.dataset.kdxState||""],l=window.__kdxCampo||={bass:0,estado:u,exposicion:.52};let F=performance.now(),x=0,_=!0,d=u;const g=new IntersectionObserver(t=>{_=t[0].isIntersecting},{threshold:0});g.observe(a);const A=()=>{if(x=requestAnimationFrame(A),!_||document.hidden||!a.isConnected)return;const t=(performance.now()-F)/1e3,n=Math.max(2,Math.min(5,Math.round(Math.min(a.width,a.height)/260))),s=E?n*3:n;e.uniform2f(R,a.width,a.height),e.uniform1f(w,E?0:t),e.uniform2f(M,c[0],c[1]),e.uniform1f(P,l.bass||0);const D=T()??l.estado??u;d+=(D-d)*.035,e.uniform1f(k,d),e.uniform1f(C,s*i),e.uniform1f(L,l.exposicion??.52),e.drawArrays(e.TRIANGLES,0,3)};A(),document.addEventListener("astro:before-swap",()=>{a.isConnected||(cancelAnimationFrame(x),g.disconnect())})}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",m,{once:!0}):m();document.addEventListener("astro:page-load",m);
