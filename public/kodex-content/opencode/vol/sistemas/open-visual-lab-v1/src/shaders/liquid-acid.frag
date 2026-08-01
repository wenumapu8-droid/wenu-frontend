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

  float t = u_time * (0.16 + u_audio.x * 0.12);
  vec2 pointer = (u_pointer - 0.5) * 0.7;

  vec2 q = vec2(
    fbm(uv * 1.7 + vec2(t, -t * 0.6)),
    fbm(uv * 1.7 + vec2(-t * 0.7, t * 0.4))
  );

  vec2 r = vec2(
    fbm(uv * 2.2 + 2.8 * q + pointer + vec2(0.0, t)),
    fbm(uv * 2.2 + 2.8 * q - pointer + vec2(t, 0.0))
  );

  float field = fbm(uv * 3.0 + 4.2 * r);
  float contour = abs(fract(field * 8.0) - 0.5);
  float band = smoothstep(0.42, 0.08, contour);

  float core = smoothstep(
    0.38,
    -0.55,
    length(uv + 0.22 * vec2(sin(t), cos(t * 0.73))) - field * 0.7
  );

  vec3 cyan = vec3(0.02, 0.92, 0.88);
  vec3 red = vec3(1.0, 0.04, 0.08);
  vec3 orange = vec3(1.0, 0.26, 0.0);
  vec3 black = vec3(0.005, 0.008, 0.012);

  vec3 color = mix(black, cyan, smoothstep(0.25, 0.72, field));
  color = mix(color, red, core * (0.55 + 0.45 * u_audio.y));
  color = mix(color, orange, band * core * 0.72);
  color *= 0.7 + band * 0.8;

  vec3 previous = texture(u_previousFrame, v_uv).rgb;
  float feedbackMask = clamp(u_feedback, 0.0, 0.94);
  previous *= 0.985;
  color = mix(color, max(color, previous), feedbackMask * 0.55);

  fragColor = vec4(color * u_intensity, 1.0);
}
