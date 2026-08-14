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

vec3 palette(float x){
  vec3 a=vec3(0.035,0.018,0.070);
  vec3 b=vec3(0.45,0.28,0.72);
  vec3 c=vec3(0.52,0.68,0.98);
  vec3 d=vec3(0.22,0.08,0.38);
  return a+b*cos(6.28318*(c*x+d));
}

float mapField(vec3 p,float phase){
  p.yz*=rot(-0.62 + u_pointer.y*0.08);
  p.xz*=rot(0.18 + u_pointer.x*0.10);
  float d=sdTorus(p,vec2(1.02,0.34));
  float a=atan(p.z,p.x);
  float r=length(p.xz);
  float flow=sin(a*12.0 + phase*2.0 + p.y*9.0)*0.018;
  flow+=sin(a*23.0 - phase*3.0 + (r-1.0)*32.0)*0.009;
  return d+flow;
}

vec3 normalAt(vec3 p,float phase){
  vec2 e=vec2(0.0025,0.0);
  float d=mapField(p,phase);
  return normalize(vec3(
    mapField(p+e.xyy,phase)-d,
    mapField(p+e.yxy,phase)-d,
    mapField(p+e.yyx,phase)-d
  ));
}

void main(){
  vec2 uv=v_uv*2.0-1.0;
  uv.x*=u_resolution.x/max(1.0,u_resolution.y);
  uv*=0.82;

  float phase=(u_reducedMotion>0.5)?1.7:u_time*0.22;
  vec3 ro=vec3(0.0,0.05,3.25);
  vec3 rd=normalize(vec3(uv,-1.78));

  float t=0.0;
  float glow=0.0;
  float hit=0.0;
  vec3 pos=ro;
  for(int i=0;i<96;i++){
    pos=ro+rd*t;
    float d=mapField(pos,phase);
    glow+=0.012/(0.035+abs(d)*8.0);
    if(abs(d)<0.0016){hit=1.0;break;}
    t+=clamp(d*0.72,0.008,0.12);
    if(t>6.0)break;
  }

  vec3 bg=vec3(0.004,0.002,0.012);
  float vign=smoothstep(1.8,0.15,length(uv));
  vec3 col=bg + vec3(0.18,0.05,0.35)*glow*0.07*vign;

  if(hit>0.5){
    vec3 n=normalAt(pos,phase);
    vec3 lightDir=normalize(vec3(-0.45,0.72,0.55));
    float diff=max(dot(n,lightDir),0.0);
    float rim=pow(1.0-max(dot(n,-rd),0.0),2.2);
    float a=atan(pos.z,pos.x);
    float stripe=0.5+0.5*sin(a*18.0 + pos.y*16.0 + phase*3.0);
    float strand=smoothstep(0.72,0.96,stripe);
    vec3 base=palette(0.20 + diff*0.28 + stripe*0.08);
    col+=base*(0.32+diff*0.95);
    col+=vec3(0.55,0.28,1.0)*rim*1.55;
    col+=vec3(0.30,0.78,1.0)*strand*0.55;
  }

  float aperture=exp(-18.0*length(uv*vec2(0.72,1.0)));
  col+=vec3(0.26,0.12,0.62)*aperture*0.20;

  col=1.0-exp(-col*1.35);
  col=pow(col,vec3(0.86));
  fragColor=vec4(col,1.0);
}
