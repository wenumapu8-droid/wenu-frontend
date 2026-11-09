#version 300 es
precision highp float;
precision highp int;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform float u_delta;
uniform vec2  u_resolution;
uniform vec2  u_pointer;
uniform vec3  u_audio;
uniform float u_mode;
uniform float u_progress;
uniform float u_intensity;
uniform float u_reducedMotion;
uniform float u_seed;

#define FAR 42.0
#define PI 3.141592653589793

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32 + u_seed);
  return fract(p.x * p.y);
}

float lineAA(float value, float width) {
  float fw = max(fwidth(value), 0.0008);
  return 1.0 - smoothstep(width, width + fw * 1.5, abs(value));
}

float grid1(float value, float spacing, float thickness) {
  float cell = mod(value + spacing * 0.5, spacing) - spacing * 0.5;
  return lineAA(cell, thickness);
}

float sdBox2(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

vec3 modeColor(float mode) {
  if (mode < 0.5) return vec3(1.00, 0.19, 0.14); // signal red
  if (mode < 1.5) return vec3(0.36, 0.95, 0.75); // spectral mint
  if (mode < 2.5) return vec3(0.22, 0.78, 1.00); // cyan split
  return vec3(0.72, 0.36, 1.00);                 // violet wrinkle
}

struct CorridorHit {
  float t;
  float grid;
  float edge;
  float depthPulse;
};

CorridorHit corridor(vec2 p, vec2 vanishing, float rippleAmount, float wrinkleAmount) {
  vec2 q = p - vanishing;

  // Non-Euclidean lens warp. Kept subtle so the grid remains legible.
  float r2 = dot(q, q);
  q *= 1.0 + wrinkleAmount * 0.12 * r2;
  q += wrinkleAmount * vec2(
    sin(q.y * 4.0 + u_time * 0.35),
    cos(q.x * 3.2 - u_time * 0.28)
  ) * 0.045;

  vec3 ro = vec3(0.0, 0.0, -0.25);
  vec3 rd = normalize(vec3(q.x, q.y, 1.18));

  float w = 1.22;
  float h = 0.72;

  float tFloor = rd.y < -0.0001 ? (-h - ro.y) / rd.y : FAR;
  float tCeil  = rd.y >  0.0001 ? ( h - ro.y) / rd.y : FAR;
  float tLeft  = rd.x < -0.0001 ? (-w - ro.x) / rd.x : FAR;
  float tRight = rd.x >  0.0001 ? ( w - ro.x) / rd.x : FAR;

  float t = min(min(tFloor, tCeil), min(tLeft, tRight));
  t = clamp(t, 0.0, FAR);
  vec3 hp = ro + rd * t;

  float g = 0.0;
  float edge = 0.0;

  if (t == tFloor || t == tCeil) {
    float radial = length(vec2(hp.x, hp.z * 0.28));
    float wave = sin(radial * 7.5 - u_time * 2.1) * exp(-radial * 0.25);
    hp.x += wave * rippleAmount * 0.10;
    hp.z += wave * rippleAmount * 0.18;

    float gx = grid1(hp.x, 0.22, 0.008);
    float gz = grid1(hp.z, 0.62, 0.012);
    g = max(gx, gz);
    edge = max(
      lineAA(abs(hp.x) - w, 0.018),
      lineAA(abs(hp.x) - (w * 0.5), 0.007)
    );
  } else {
    float wave = sin((hp.y + hp.z * 0.17) * 8.0 - u_time * 1.6);
    hp.y += wave * wrinkleAmount * 0.035;

    float gy = grid1(hp.y, 0.18, 0.007);
    float gz = grid1(hp.z, 0.62, 0.012);
    g = max(gy, gz);
    edge = max(
      lineAA(abs(hp.y) - h, 0.018),
      lineAA(abs(hp.y) - (h * 0.5), 0.006)
    );
  }

  float depthFade = exp(-t * 0.085);
  float horizon = exp(-abs(q.y) * 8.0) * exp(-abs(q.x) * 3.0);
  float depthPulse = 0.5 + 0.5 * sin(hp.z * 0.55 - u_time * 1.25);

  CorridorHit hit;
  hit.t = t;
  hit.grid = g * depthFade + horizon * 0.10;
  hit.edge = edge * depthFade;
  hit.depthPulse = depthPulse * depthFade;
  return hit;
}

vec3 renderSpatial(vec2 p) {
  float mode = floor(u_mode + 0.5);
  vec2 pointer = (u_pointer - 0.5) * vec2(0.34, 0.22);
  pointer.y *= -1.0;

  float motion = mix(1.0, 0.0, u_reducedMotion);
  float breathe = sin(u_time * 0.55) * 0.025 * motion;
  p *= 1.0 + breathe + u_audio.x * 0.035;

  CorridorHit hit;
  float seam = 0.0;

  if (mode < 0.5) {
    // Dual vanishing chamber: two projections coexist and compete.
    CorridorHit a = corridor(p, vec2(-0.16, 0.00) + pointer * 0.35, 0.0, 0.12);
    CorridorHit b = corridor(p, vec2( 0.16, 0.00) + pointer * 0.35, 0.0, 0.12);
    float blend = smoothstep(-0.12, 0.12, p.x + pointer.x * 0.5);
    hit.t = mix(a.t, b.t, blend);
    hit.grid = max(a.grid * (1.0 - blend * 0.35), b.grid * (0.65 + blend * 0.35));
    hit.edge = max(a.edge, b.edge);
    hit.depthPulse = mix(a.depthPulse, b.depthPulse, blend);
    seam = lineAA(p.x + pointer.x * 0.3, 0.006) * 0.75;
  } else if (mode < 1.5) {
    // Ripple floor: the architecture behaves as a membrane.
    hit = corridor(p, pointer * 0.18, 0.72 + u_audio.x * 0.65, 0.10);
  } else if (mode < 2.5) {
    // Split corridor: one route becomes two without a hard cut.
    float split = smoothstep(0.0, 1.0, u_progress);
    float side = sign(p.x == 0.0 ? 1.0 : p.x);
    vec2 splitP = p;
    splitP.x -= side * split * (0.18 + 0.18 * smoothstep(0.0, 0.7, abs(p.y)));
    CorridorHit a = corridor(splitP, vec2(-0.24 * split, 0.0) + pointer * 0.15, 0.10, 0.18);
    CorridorHit b = corridor(splitP, vec2( 0.24 * split, 0.0) + pointer * 0.15, 0.10, 0.18);
    float choose = smoothstep(-0.015, 0.015, p.x);
    hit.t = mix(a.t, b.t, choose);
    hit.grid = mix(a.grid, b.grid, choose);
    hit.edge = max(a.edge, b.edge);
    hit.depthPulse = mix(a.depthPulse, b.depthPulse, choose);
    seam = lineAA(p.x, 0.010 + split * 0.010) * split;
  } else {
    // Wrinkled reality: projection and surface both deform.
    hit = corridor(p, pointer * 0.22, 0.25, 0.72 + u_audio.y * 0.45);
  }

  vec3 accent = modeColor(mode);
  float signal = hit.grid * (0.90 + u_audio.y * 0.55);
  signal += hit.edge * 1.15;
  signal += hit.depthPulse * 0.09 * (0.3 + u_audio.x);
  signal += seam;

  // Central aperture / event horizon.
  float aperture = 1.0 - smoothstep(0.0, 0.055 + u_progress * 0.09, length(p));
  signal += aperture * (0.45 + u_progress * 1.2);

  vec3 color = vec3(0.0035, 0.0045, 0.0065);
  color += accent * signal * (0.72 + u_intensity * 0.55);

  // Blueprint-white secondary line to preserve the hand-drawn reference character.
  color += vec3(0.78, 0.84, 0.80) * pow(max(hit.grid - 0.32, 0.0), 1.6) * 0.48;

  // Soft phosphor halo.
  color += accent * pow(max(signal, 0.0), 2.0) * 0.12;
  return color;
}

void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  vec3 color = renderSpatial(p);

  // CRT scanlines + paper/grain hybrid. This is restrained by design.
  float scan = 0.94 + 0.06 * sin(gl_FragCoord.y * PI);
  float grainTime = u_reducedMotion > 0.5 ? 0.0 : floor(u_time * 18.0);
  float grain = hash21(gl_FragCoord.xy + grainTime) - 0.5;
  color *= scan;
  color += grain * 0.018;

  // Edge vignette.
  vec2 uv = v_uv * 2.0 - 1.0;
  float vignette = smoothstep(1.45, 0.35, dot(uv, uv));
  color *= 0.58 + vignette * 0.52;

  fragColor = vec4(color, 1.0);
}
