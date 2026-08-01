#ifdef GL_ES
precision highp float;
precision highp int;
#endif

uniform float time;
uniform vec2 resolution;
uniform vec2 pointer;
uniform float audioLow;
uniform float audioMid;
uniform float audioHigh;
uniform float state;
uniform float reducedMotion;
uniform float seed;

varying vec2 v_texcoord;

#define PI 3.141592653589793
#define TAU 6.283185307179586

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32 + seed);
  return fract(p.x * p.y);
}

mat2 rotate2d(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

float lineBand(float distanceValue, float width, float feather) {
  return 1.0 - smoothstep(width, width + feather, abs(distanceValue));
}

float ring(vec2 p, float radius, float width, float feather) {
  return lineBand(length(p) - radius, width, feather);
}

float ellipseRing(vec2 p, vec2 scale, float angle, float width, float feather) {
  vec2 q = rotate2d(angle) * p;
  float d = length(q / scale) - 1.0;
  return lineBand(d, width, feather);
}

float segment(vec2 p, vec2 a, vec2 b, float width, float feather) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return 1.0 - smoothstep(width, width + feather, length(pa - ba * h));
}

float eyeLid(vec2 p, float width, float feather) {
  float x = clamp(abs(p.x), 0.0, 1.0);
  float arch = 0.34 * pow(max(0.0, 1.0 - x * x), 0.62);
  float top = p.y - arch;
  float bottom = p.y + arch;
  float maskX = 1.0 - smoothstep(0.96, 1.04, x);
  return max(lineBand(top, width, feather), lineBand(bottom, width, feather)) * maskX;
}

float eyeFill(vec2 p) {
  float x = clamp(abs(p.x), 0.0, 1.0);
  float arch = 0.34 * pow(max(0.0, 1.0 - x * x), 0.62);
  float insideY = 1.0 - smoothstep(arch - 0.03, arch + 0.02, abs(p.y));
  float insideX = 1.0 - smoothstep(0.96, 1.03, x);
  return insideY * insideX;
}

void main() {
  vec2 uv = v_texcoord * 2.0 - 1.0;
  float aspect = resolution.x / max(resolution.y, 1.0);
  uv.x *= aspect;

  float portrait = step(resolution.x, resolution.y);
  float motion = 1.0 - step(0.5, reducedMotion);
  float t = time * motion;

  vec2 pNorm = pointer * 2.0 - 1.0;
  pNorm.x *= aspect;

  vec2 artOffset = vec2(mix(0.52, 0.0, portrait), mix(0.00, 0.44, portrait));
  vec2 p = uv - artOffset;
  p *= mix(1.05, 1.22, portrait);

  float px = 1.5 / max(min(resolution.x, resolution.y), 1.0);
  float aware = smoothstep(0.0, 1.0, state);
  float openState = smoothstep(1.0, 2.0, state);

  float bass = clamp(audioLow, 0.0, 1.0);
  float mids = clamp(audioMid, 0.0, 1.0);
  float highs = clamp(audioHigh, 0.0, 1.0);

  float breathe = 1.0 + 0.018 * sin(t * 1.35) + bass * 0.06 + openState * 0.18;
  p /= breathe;

  vec2 pointerShift = (pNorm - artOffset) * vec2(0.018, 0.012) * aware;
  vec2 eyeP = p - pointerShift;

  vec3 color = vec3(0.006, 0.004, 0.011);

  float glow = exp(-1.75 * dot(p, p));
  color += vec3(0.11, 0.018, 0.24) * glow * (0.65 + aware * 0.55 + bass * 0.4);

  float orbitOuter = 0.0;
  orbitOuter += ellipseRing(p, vec2(0.92, 0.72), t * 0.028, 0.006, px * 2.0);
  orbitOuter += ellipseRing(p, vec2(0.84, 0.54), -t * 0.021 + 0.72, 0.005, px * 2.0);
  orbitOuter += ellipseRing(p, vec2(0.72, 0.86), t * 0.017 + 1.42, 0.004, px * 2.0);

  float orbitInner = 0.0;
  orbitInner += ellipseRing(p, vec2(0.60, 0.38), -t * 0.044, 0.006, px * 2.0);
  orbitInner += ellipseRing(p, vec2(0.48, 0.64), t * 0.037 + 0.8, 0.004, px * 2.0);

  vec3 orbitColor = mix(vec3(0.24, 0.14, 0.42), vec3(0.62, 0.40, 0.96), aware);
  color += orbitColor * orbitOuter * (0.36 + highs * 0.18);
  color += vec3(0.46, 0.26, 0.82) * orbitInner * (0.44 + mids * 0.22);

  float crosshair = 0.0;
  crosshair += segment(p, vec2(-0.98, 0.0), vec2(-0.32, 0.0), 0.0025, px * 1.5);
  crosshair += segment(p, vec2(0.32, 0.0), vec2(0.98, 0.0), 0.0025, px * 1.5);
  crosshair += segment(p, vec2(0.0, -0.92), vec2(0.0, -0.28), 0.0025, px * 1.5);
  crosshair += segment(p, vec2(0.0, 0.28), vec2(0.0, 0.92), 0.0025, px * 1.5);
  color += vec3(0.52, 0.38, 0.72) * crosshair * 0.36;

  float lid = eyeLid(eyeP / vec2(0.68, 0.68), 0.012, px * 4.0);
  float eyeMask = eyeFill(eyeP / vec2(0.68, 0.68));

  vec2 irisP = eyeP - pointerShift * 0.7;
  float irisRadius = 0.205 + bass * 0.018 + 0.008 * sin(t * 1.7);
  float iris = ring(irisP, irisRadius, 0.016, px * 3.0) * eyeMask;
  float irisFine = ring(irisP, irisRadius * 0.67, 0.006, px * 2.0) * eyeMask;
  float pupil = 1.0 - smoothstep(0.072 + bass * 0.014, 0.09 + bass * 0.016, length(irisP));
  pupil *= eyeMask;

  float irisAngle = atan(irisP.y, irisP.x);
  float irisSpokes = pow(max(0.0, cos(irisAngle * 18.0 + t * 0.35)), 18.0);
  irisSpokes *= smoothstep(0.06, 0.18, length(irisP));
  irisSpokes *= 1.0 - smoothstep(0.18, 0.26, length(irisP));
  irisSpokes *= eyeMask;

  float wave = sin((eyeP.x + 0.2 * sin(t * 0.6)) * 7.2 + t * 0.65);
  float waveLine = lineBand(eyeP.y - wave * 0.08, 0.008, px * 3.0) * eyeMask;

  color += vec3(0.72, 0.62, 0.93) * lid * 0.75;
  color += vec3(0.58, 0.32, 0.94) * iris * (0.8 + mids * 0.6);
  color += vec3(0.82, 0.72, 1.0) * irisFine * 0.7;
  color += vec3(0.60, 0.25, 1.0) * irisSpokes * (0.18 + highs * 0.7);
  color += vec3(0.72, 0.46, 1.0) * waveLine * (0.3 + aware * 0.52);

  float pupilGlow = exp(-42.0 * dot(irisP, irisP));
  color += vec3(0.58, 0.18, 1.0) * pupilGlow * (1.2 + aware * 1.2 + bass * 1.4);
  color += vec3(0.98, 0.94, 1.0) * pupil * 0.62;

  float scanY = mix(0.82, -0.82, fract(t * 0.12));
  float scan = exp(-180.0 * pow(p.y - scanY, 2.0));
  scan *= 1.0 - smoothstep(0.10, 1.05, length(p));
  color += vec3(0.40, 0.14, 0.90) * scan * (0.12 + aware * 0.24);

  for (int i = 0; i < 9; i++) {
    float fi = float(i);
    float a = fi / 9.0 * TAU + t * (0.018 + 0.002 * fi);
    float r = 0.68 + 0.08 * sin(fi * 2.3 + t * 0.22);
    vec2 node = vec2(cos(a), sin(a)) * r;
    float n = exp(-520.0 * dot(p - node, p - node));
    color += vec3(0.52, 0.22, 1.0) * n * (0.35 + highs * 1.4);
  }

  float openRing = ring(p, mix(0.24, 0.82, openState), 0.018, px * 4.0);
  color += vec3(0.84, 0.62, 1.0) * openRing * openState * 1.8;
  color += vec3(0.34, 0.04, 0.88) * exp(-2.8 * dot(p, p)) * openState;

  float scanline = 0.955 + 0.045 * sin(v_texcoord.y * resolution.y * PI);
  color *= scanline;

  float noise = hash21(gl_FragCoord.xy + floor(time * 12.0));
  color += (noise - 0.5) * 0.035;

  float vignette = 1.0 - smoothstep(0.18, 1.35, length(uv * vec2(0.72, 0.88)));
  color *= mix(0.54, 1.0, vignette);

  gl_FragColor = vec4(max(color, 0.0), 1.0);
}
