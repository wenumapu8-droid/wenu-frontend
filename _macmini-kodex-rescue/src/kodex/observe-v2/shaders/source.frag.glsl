#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 v_uv;

uniform float u_time;
uniform float u_delta;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform vec2 u_pointerVelocity;
uniform float u_audioLow;
uniform float u_audioMid;
uniform float u_audioHigh;
uniform float u_state;
uniform float u_transition;
uniform float u_intensity;
uniform float u_seed;
uniform float u_feedbackAmount;
uniform float u_scanPosition;
uniform float u_reducedMotion;
uniform float u_particleScale;

#define PI 3.141592653589793

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
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

mat2 rot(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

float ring(vec2 p, float r, float w) {
  float d = abs(length(p) - r);
  return smoothstep(w, 0.0, d);
}

float eyeMask(vec2 p) {
  p.y *= 1.22;
  float shell = smoothstep(0.98, 0.12, length(p));
  float lidTop = smoothstep(0.16, -0.18, p.y + 0.22 * cos(p.x * 2.5));
  float lidBottom = smoothstep(-0.16, 0.18, p.y - 0.22 * cos(p.x * 2.5));
  return shell * lidTop * lidBottom;
}

vec3 violet(float t) {
  vec3 a = vec3(0.545, 0.361, 0.964);
  vec3 b = vec3(0.753, 0.517, 0.988);
  vec3 c = vec3(0.133, 0.827, 0.933);
  return mix(mix(a, b, t), c, t * 0.22);
}

void main() {
  vec2 uv = v_uv;
  vec2 p = (uv - 0.5) * vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
  vec2 pointer = u_pointer * vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0) * 0.16;
  float reduced = u_reducedMotion;
  float time = u_time * mix(1.0, 0.18, reduced);
  float breath = 0.5 + 0.5 * sin(time * 1.15 + u_audioLow * 3.0);
  float stateOpen = smoothstep(0.0, 1.0, u_state * 1.1 + u_transition * 0.32);

  vec2 center = pointer * vec2(0.55, 0.4);
  vec2 q = p - center;
  float mask = eyeMask(q * vec2(1.0, mix(1.45, 1.0, stateOpen)));

  float angle = atan(q.y, q.x);
  float dist = length(q);
  float irisRad = mix(0.17, 0.285, stateOpen) + u_audioLow * 0.03 + breath * 0.012;
  float iris = smoothstep(irisRad + 0.05, irisRad - 0.02, dist);
  float pupil = smoothstep(mix(0.07, 0.035, u_transition), 0.01, dist + dot(u_pointerVelocity, u_pointerVelocity) * 0.03);

  float irisFibers = 0.0;
  vec2 rq = rot(angle * 0.14 + time * 0.05) * q;
  irisFibers += sin(angle * 19.0 + time * 0.8 + noise(rq * 9.0 + u_seed) * 2.0) * 0.5 + 0.5;
  irisFibers += sin(angle * 37.0 - time * 0.6 + noise(rq * 14.0 - u_seed) * 1.6) * 0.5 + 0.5;
  irisFibers *= iris;

  float orbitA = ring(q * rot(time * 0.15 + u_audioMid * 0.3), 0.39 + noise(q * 4.0 + time) * 0.018, 0.004);
  float orbitB = ring(q * rot(-time * 0.09 - 0.4), 0.51 + sin(angle * 6.0 + time) * 0.01, 0.005);
  float orbitC = ring(q * rot(time * 0.04 + 1.4), 0.63 + sin(angle * 4.0 - time * 0.5) * 0.016, 0.0055);

  float reticle = max(ring(q, 0.335, 0.0025), ring(q, 0.705, 0.002));
  reticle += smoothstep(0.015, 0.0, abs(q.x)) * smoothstep(0.9, 0.04, abs(q.y));
  reticle += smoothstep(0.015, 0.0, abs(q.y)) * smoothstep(1.2, 0.06, abs(q.x));

  float scan = exp(-abs(uv.y - u_scanPosition) * 85.0) * (0.2 + u_transition * 0.6);
  float scanH = exp(-abs(uv.y - (0.34 + sin(time * 0.25) * 0.12)) * 130.0) * (0.04 + u_state * 0.08);

  float particleField = 0.0;
  for (int i = 0; i < 26; i++) {
    float fi = float(i);
    float seed = fi * 13.17 + u_seed * 0.3;
    vec2 star = vec2(hash21(vec2(seed, seed + 1.0)), hash21(vec2(seed + 2.0, seed + 3.0)));
    star = star * 2.0 - 1.0;
    star.x *= u_resolution.x / max(u_resolution.y, 1.0);
    star += vec2(sin(time * (0.07 + fi * 0.002)), cos(time * (0.09 + fi * 0.0025))) * 0.04;
    float d = length(p - star * (0.55 + 0.6 * hash21(vec2(seed + 4.0, seed + 5.0))));
    float spark = smoothstep(0.028, 0.0, d) * (0.35 + hash21(vec2(seed + 7.0, seed + 8.0)));
    particleField += spark;
  }
  particleField *= mix(0.4, 1.0, u_particleScale) * (0.55 + u_audioHigh * 0.6);

  float lidNoise = noise(q * 18.0 + time * 0.4) * 0.07;
  float glow = smoothstep(0.92, 0.0, dist) * (0.1 + u_intensity * 0.6 + breath * 0.18);
  vec3 col = vec3(0.02, 0.018, 0.03);
  col += violet(clamp(irisFibers * 0.6 + glow * 0.4, 0.0, 1.0)) * iris * (0.42 + stateOpen * 0.55);
  col += vec3(0.05, 0.01, 0.09) * orbitA;
  col += vec3(0.10, 0.04, 0.16) * orbitB;
  col += vec3(0.03, 0.08, 0.11) * orbitC;
  col += vec3(0.12, 0.17, 0.24) * reticle * (0.2 + u_transition * 0.55);
  col += vec3(0.17, 0.12, 0.28) * glow;
  col += vec3(0.20, 0.16, 0.30) * particleField;
  col += vec3(0.18, 0.14, 0.34) * scan;
  col += vec3(0.06, 0.08, 0.12) * scanH;

  float pupilMask = 1.0 - pupil;
  col *= mix(1.0, 0.08, pupilMask);
  col += vec3(0.018, 0.022, 0.03) * (1.0 - mask) * 0.55;
  col += lidNoise * 0.05;

  float alpha = clamp(mask + orbitA * 0.3 + orbitB * 0.35 + orbitC * 0.35 + particleField * 0.45 + scan * 0.4, 0.0, 1.0);
  fragColor = vec4(col, alpha);
}
