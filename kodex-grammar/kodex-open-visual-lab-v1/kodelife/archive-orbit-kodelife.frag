#version 330 core

uniform float time;
uniform vec2 resolution;
uniform vec2 pointer;

out vec4 fragColor;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise21(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1,0)), f.x),
    mix(hash21(i + vec2(0,1)), hash21(i + vec2(1,1)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise21(p);
    p = mat2(1.6, 1.2, -1.2, 1.6) * p;
    amplitude *= 0.5;
  }
  return value;
}

#define PI 3.141592653589793

float ring(vec2 p, float radius, float width) {
  return 1.0 - smoothstep(width, width + .012, abs(length(p)-radius));
}

void main() {
  vec2 uv = (2.0 * gl_FragCoord.xy - resolution.xy)
    / min(resolution.x, resolution.y);
  float a = atan(uv.y, uv.x);
  float r = length(uv);
  float field = 0.0;
  for (int i = 0; i < 12; i++) {
    float fi = float(i);
    float radius = .18 + fi * .065;
    radius += sin(a * (4.0 + mod(fi,3.0)) + time*.2 + fi) * .012;
    field += ring(uv, radius, .004);
  }
  vec3 color = vec3(.002) + vec3(1,.02,.05) * field * .7;
  color += vec3(.85) * pow(max(0.0,1.0-r/.16),8.0);
  fragColor = vec4(color,1.0);
}
