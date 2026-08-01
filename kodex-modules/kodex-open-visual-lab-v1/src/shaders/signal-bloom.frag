#version 300 es
precision highp float;
precision highp int;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform float u_delta;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform vec3 u_audio;
uniform float u_seed;
uniform float u_feedback;
uniform float u_intensity;
uniform sampler2D u_previousFrame;

#define PI 3.141592653589793

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
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
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

mat2 rotate2d(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c);
}

vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}

void main() {
  vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution.xy)
    / min(u_resolution.x, u_resolution.y);

  float t = u_time * 0.22;
  vec2 p = uv;

  float field = 0.0;
  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    vec2 center = vec2(
      sin(t * (0.5 + fi * 0.07) + fi * 2.1),
      cos(t * (0.42 + fi * 0.05) + fi * 1.7)
    ) * (0.15 + fi * 0.07);

    float radius = 0.16 + 0.06 * sin(t + fi);
    field += radius / max(0.025, length(p - center));
  }

  float edge = abs(fract(field * 0.16) - 0.5);
  float veins = smoothstep(0.18, 0.02, edge);

  float noise = fbm(p * 4.0 + t);
  float bloom = smoothstep(2.4, 5.8, field + noise * 1.8);

  vec3 black = vec3(0.003, 0.002, 0.008);
  vec3 magenta = vec3(1.0, 0.02, 0.55);
  vec3 violet = vec3(0.36, 0.05, 1.0);
  vec3 cyan = vec3(0.0, 0.9, 1.0);

  vec3 color = black;
  color += violet * bloom * 0.75;
  color += magenta * veins * bloom * (0.55 + u_audio.y);
  color += cyan * pow(bloom, 5.0) * (0.25 + u_audio.z);

  vec3 previous = texture(u_previousFrame, v_uv).rgb * 0.988;
  color = mix(color, max(color, previous), u_feedback * 0.56);

  fragColor = vec4(color * u_intensity, 1.0);
}
