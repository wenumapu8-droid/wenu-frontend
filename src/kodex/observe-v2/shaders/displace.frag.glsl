#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 v_uv;

uniform sampler2D u_tex;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_audioMid;
uniform float u_intensity;
uniform float u_reducedMotion;

float hash21(vec2 p) {
  p = fract(p * vec2(223.34, 451.21));
  p += dot(p, p + 34.45);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  float time = u_time * mix(1.0, 0.25, u_reducedMotion);
  float n1 = noise(p * 6.0 + vec2(time * 0.08, -time * 0.14));
  float n2 = noise(p * 12.0 + vec2(-time * 0.19, time * 0.11));
  vec2 drift = (u_pointer * vec2(0.01, -0.008)) + vec2(n1 - 0.5, n2 - 0.5) * (0.012 + u_audioMid * 0.02) * (0.4 + u_intensity * 0.7);
  vec4 base = texture(u_tex, uv + drift);
  vec4 smear = texture(u_tex, uv + drift * 0.4 + vec2(0.0, (n1 - 0.5) * 0.012));
  fragColor = mix(base, smear, 0.34);
}
