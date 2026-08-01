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
  float t = time * 0.16;
  vec2 q = vec2(
    fbm(uv * 1.7 + vec2(t, -t * .6)),
    fbm(uv * 1.7 + vec2(-t * .7, t * .4))
  );
  vec2 r = vec2(
    fbm(uv * 2.2 + 2.8 * q + (pointer - .5)),
    fbm(uv * 2.2 + 2.8 * q - (pointer - .5))
  );
  float f = fbm(uv * 3.0 + 4.2 * r);
  float contour = smoothstep(.42, .08, abs(fract(f * 8.0) - .5));
  vec3 color = mix(vec3(.002), vec3(.0,.92,.88), smoothstep(.2,.72,f));
  color = mix(color, vec3(1,.03,.06), smoothstep(.42,.72,f));
  color += vec3(1,.2,0) * contour * .55;
  fragColor = vec4(color, 1.0);
}
