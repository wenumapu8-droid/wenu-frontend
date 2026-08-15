#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_reducedMotion;

#define PI 3.141592653589793

mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float sdTorus(vec3 p, vec2 t){vec2 q=vec2(length(p.xz)-t.x,p.y);return length(q)-t.y;}

vec3 fieldPalette(float x){
  vec3 deep=vec3(0.035,0.018,0.070);
  vec3 violet=vec3(0.30,0.13,0.58);
  vec3 electric=vec3(0.25,0.56,0.92);
  vec3 pearl=vec3(0.82,0.78,0.95);
  float mid=smoothstep(0.18,0.72,x);
  float hi=smoothstep(0.66,1.0,x);
  return mix(mix(deep,violet,mid),mix(electric,pearl,hi),hi);
}

vec3 orientField(vec3 p){
  p.yz*=rot(-0.58 + u_pointer.y*0.055);
  p.xz*=rot(0.16 + u_pointer.x*0.075);
  return p;
}

float mapField(vec3 p){
  p=orientField(p);
  return sdTorus(p,vec2(1.02,0.34));
}

vec3 normalAt(vec3 p){
  vec2 e=vec2(0.0024,0.0);
  float d=mapField(p);
  return normalize(vec3(
    mapField(p+e.xyy)-d,
    mapField(p+e.yxy)-d,
    mapField(p+e.yyx)-d
  ));
}

void main(){
  vec2 uv=v_uv*2.0-1.0;
  uv.x*=u_resolution.x/max(1.0,u_resolution.y);
  uv*=0.80;

  float phase=(u_reducedMotion>0.5)?1.7:u_time*0.18;
  vec3 ro=vec3(0.0,0.04,3.30);
  vec3 rd=normalize(vec3(uv,-1.82));

  float t=0.0;
  float haze=0.0;
  float hit=0.0;
  vec3 pos=ro;
  for(int i=0;i<96;i++){
    pos=ro+rd*t;
    float d=mapField(pos);
    haze+=0.007/(0.055+abs(d)*10.0);
    if(abs(d)<0.0015){hit=1.0;break;}
    t+=clamp(d*0.76,0.008,0.13);
    if(t>6.0)break;
  }

  vec3 bg=vec3(0.003,0.002,0.010);
  float vign=smoothstep(1.85,0.20,length(uv));
  vec3 col=bg + vec3(0.10,0.035,0.22)*haze*0.045*vign;

  if(hit>0.5){
    vec3 q=orientField(pos);
    vec3 n=normalAt(pos);
    vec3 lightDir=normalize(vec3(-0.38,0.68,0.62));
    float diff=max(dot(n,lightDir),0.0);
    float facing=max(dot(n,-rd),0.0);
    float rim=pow(1.0-facing,3.4);

    float major=atan(q.z,q.x);
    float radial=length(q.xz)-1.02;
    float minor=atan(q.y,radial);

    // Continuous laminar energy carries most of the material read. The field
    // never drops to zero between streamlines, avoiding graphic dark bands.
    float broadA=0.5+0.5*cos(major*7.0 + minor*2.0 - phase*0.72);
    float broadB=0.5+0.5*cos(major*11.0 - minor*3.0 + phase*0.48);
    float broadC=0.5+0.5*cos(major*4.0 + minor*5.0 - phase*0.31);
    float laminar=clamp(0.58 + (broadA-0.5)*0.16 + (broadB-0.5)*0.12 + (broadC-0.5)*0.08,0.34,0.82);

    // Fine fibers are additive accents only. They imply circulation without
    // cutting the torus into large concentric stripes.
    float strandA=pow(0.5+0.5*cos(major*46.0 + minor*7.0 - phase*2.4),18.0);
    float strandB=pow(0.5+0.5*cos(major*31.0 - minor*11.0 + phase*1.55),20.0);
    float strands=clamp(strandA*0.62 + strandB*0.38,0.0,1.0);

    float circulation=0.5+0.5*sin(major*2.0 - phase*0.55);
    float frontDepth=smoothstep(-0.85,0.85,q.z);
    vec3 base=fieldPalette(0.24 + diff*0.32 + circulation*0.08);
    vec3 flowTint=mix(vec3(0.15,0.14,0.33),vec3(0.30,0.48,0.80),frontDepth);

    // Material floor first, then subtle laminar modulation and fine fibers.
    col+=base*(0.27+diff*0.31);
    col+=flowTint*laminar*(0.18+0.10*diff);
    col+=mix(vec3(0.28,0.23,0.52),vec3(0.50,0.67,0.98),frontDepth)*strands*(0.12+0.08*diff);
    col+=vec3(0.45,0.28,0.80)*rim*0.50;
    col+=vec3(0.74,0.82,1.0)*strands*rim*0.12;
  }

  float aperture=exp(-20.0*length(uv*vec2(0.72,1.0)));
  col+=vec3(0.18,0.08,0.42)*aperture*0.07;

  col=1.0-exp(-col*1.16);
  col=pow(col,vec3(0.92));
  fragColor=vec4(col,1.0);
}
