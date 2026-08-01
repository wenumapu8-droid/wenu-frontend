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

float ring(vec2 p, float radius, float width) {
  return 1.0 - smoothstep(width, width + 0.012, abs(length(p) - radius));
}

float lineSegment(vec2 p, vec2 a, vec2 b, float width) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return 1.0 - smoothstep(width, width + 0.008, length(pa - ba * h));
}

void main() {
  vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution.xy)
    / min(u_resolution.x, u_resolution.y);

  float t = u_time * 0.12;
  vec2 p = rotate2d(t * 0.08) * uv;

  vec3 color = vec3(0.003, 0.004, 0.006);
  vec3 red = vec3(1.0, 0.035, 0.08);
  vec3 paper = vec3(0.82, 0.84, 0.81);

  float rings = 0.0;
  for (int i = 0; i < 10; i++) {
    float fi = float(i);
    float radius = 0.22 + fi * 0.082;
    float wobble = sin(fi * 2.4 + atan(p.y, p.x) * (4.0 + mod(fi, 3.0)) + t) * 0.018;
    rings += ring(p, radius + wobble, 0.004 + fi * 0.0005);
  }

  float axes = lineSegment(p, vec2(-1.2, 0.0), vec2(1.2, 0.0), 0.002);
  axes += lineSegment(p, vec2(0.0, -1.2), vec2(0.0, 1.2), 0.002);

  float nodes = 0.0;
  for (int i = 0; i < 12; i++) {
    float fi = float(i);
    float angle = fi / 12.0 * PI * 2.0 + t * (0.2 + mod(fi, 2.0) * 0.12);
    vec2 node = vec2(cos(angle), sin(angle)) * (0.34 + mod(fi, 4.0) * 0.12);
    nodes += 1.0 - smoothstep(0.012, 0.026, length(p - node));
  }

  vec2 grid = abs(fract((p + 1.4) * 14.0) - 0.5);
  float micro = smoothstep(0.49, 0.46, min(grid.x, grid.y));
  micro *= smoothstep(0.76, 0.15, length(p));

  float center = 1.0 - smoothstep(0.12, 0.22, length(p));
  float pulse = 0.55 + 0.45 * sin(u_time * 1.4 + length(p) * 18.0);

  color += red * (rings * 0.48 + axes * 0.75 + nodes * 1.1);
  color += paper * micro * 0.16;
  color += red * center * pulse * (0.8 + u_audio.x);

  vec3 previous = texture(u_previousFrame, v_uv).rgb * 0.988;
  color = mix(color, max(color, previous), u_feedback * 0.44);

  fragColor = vec4(color * u_intensity, 1.0);
}
