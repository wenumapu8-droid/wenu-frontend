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

  float t = u_time * 0.18;
  float r = length(uv);
  float a = atan(uv.y, uv.x);

  float tunnel = 0.0;
  for (int i = 0; i < 12; i++) {
    float fi = float(i);
    float radius = fract(fi / 12.0 + t * 0.06);
    float width = 0.012 + radius * 0.008;
    tunnel += 1.0 - smoothstep(
      width,
      width + 0.012,
      abs(r - radius * 1.35)
    );
  }

  float blades = pow(
    max(0.0, cos(a * 8.0 + sin(r * 7.0 - t) * 0.9)),
    10.0
  );

  float membrane = fbm(
    uv * 3.4 + vec2(cos(t), sin(t)) * 0.7
  );

  float opening = smoothstep(
    0.62,
    0.05,
    r + (membrane - 0.5) * 0.18
  );

  vec3 black = vec3(0.002, 0.003, 0.005);
  vec3 red = vec3(1.0, 0.025, 0.06);
  vec3 white = vec3(0.92);

  vec3 color = black;
  color += red * tunnel * (0.25 + opening);
  color += red * blades * opening * 0.6;
  color += white * pow(opening, 8.0) * (0.2 + u_audio.x * 0.8);

  vec3 previous = texture(u_previousFrame, v_uv).rgb * 0.985;
  color = mix(color, max(color, previous), u_feedback * 0.5);

  fragColor = vec4(color * u_intensity, 1.0);
}
