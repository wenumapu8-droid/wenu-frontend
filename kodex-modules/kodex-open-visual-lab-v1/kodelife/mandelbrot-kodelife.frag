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

void main() {
  vec2 uv = (2.0 * gl_FragCoord.xy - resolution.xy)
    / min(resolution.x, resolution.y);
  vec2 c = uv / 1.35 + vec2(-.55, 0.0) + (pointer - .5) * .12;
  vec2 z = vec2(0.0);
  float it = 0.0;
  for (int i = 0; i < 96; i++) {
    z = vec2(z.x*z.x-z.y*z.y, 2.0*z.x*z.y) + c;
    if (dot(z,z) > 16.0) {
      it = float(i) / 96.0;
      break;
    }
  }
  float contour = smoothstep(.1,0.0,abs(fract(it*12.0)-.5));
  vec3 color = vec3(it);
  color += vec3(.0,.85,1.0) * contour * it * .5;
  fragColor = vec4(color, 1.0);
}
