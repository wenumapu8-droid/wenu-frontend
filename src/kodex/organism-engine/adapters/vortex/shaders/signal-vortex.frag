#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 out_color;

uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
uniform float u_signal;
uniform float u_memory;
uniform float u_entropy;
uniform float u_cohesion;
uniform float u_depth;
uniform float u_convergence;
uniform float u_state;
uniform float u_motion;
uniform float u_quality;

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
  mat2 rotation = mat2(0.80, -0.60, 0.60, 0.80);

  for (int octave = 0; octave < 5; octave++) {
    value += noise21(p) * amplitude;
    p = rotation * p * 2.03 + 17.17;
    amplitude *= 0.5;
  }

  return value;
}

float lineBand(float value, float width) {
  return 1.0 - smoothstep(0.0, width, abs(value));
}

void main() {
  vec2 uv = v_uv - 0.5;
  float aspect = u_resolution.x / max(1.0, u_resolution.y);
  uv.x *= aspect;

  vec2 pointer = u_pointer * vec2(aspect, 1.0);
  vec2 center = pointer * (0.035 + u_state * 0.025);
  vec2 p = uv - center;

  float radius = max(length(p), 0.0001);
  float angle = atan(p.y, p.x);
  float motionTime = u_time * mix(0.0, 1.0, u_motion);

  float turbulence = fbm(p * mix(2.4, 6.0, u_entropy) + motionTime * 0.08);
  float twist = mix(2.0, 8.5, u_convergence);
  float spiralCoordinate = angle + log(radius + 0.06) * twist;

  float arms = 5.0;
  float armWave = sin(spiralCoordinate * arms - motionTime * (0.45 + u_signal * 0.8));
  float secondaryWave = sin(spiralCoordinate * 11.0 + motionTime * 0.23 + turbulence * 4.0);

  float armWidth = mix(0.18, 0.055, u_cohesion);
  float armField = pow(max(0.0, armWave * 0.5 + 0.5), mix(3.0, 11.0, u_cohesion));
  armField *= 0.55 + secondaryWave * 0.20 + turbulence * 0.45;

  float radialFalloff = exp(-radius * mix(1.25, 3.7, u_convergence));
  float outerEnvelope = smoothstep(0.78 + u_depth * 0.25, 0.03, radius);
  float core = exp(-radius * mix(24.0, 62.0, u_convergence));
  float eventHorizon = lineBand(radius - mix(0.055, 0.135, u_state), 0.012 + armWidth * 0.05);

  float filaments = 0.0;
  float layerCount = mix(2.0, 4.0, u_quality);
  for (int layer = 0; layer < 4; layer++) {
    float enabled = step(float(layer), layerCount - 0.5);
    float index = float(layer);
    float phase = index * 1.73 + motionTime * (0.05 + index * 0.025);
    float layerSpiral = spiralCoordinate * (7.0 + index * 2.0) + phase;
    float band = lineBand(sin(layerSpiral + turbulence * (2.0 + index)), 0.12 + index * 0.02);
    float shell = lineBand(fract(radius * (15.0 + index * 5.0) - motionTime * 0.04) - 0.5, 0.18);
    filaments += band * shell * enabled / (1.0 + index);
  }

  vec2 grid = p * mix(90.0, 170.0, u_quality);
  float starSeed = hash21(floor(grid));
  float star = step(0.988 - u_signal * 0.006, starSeed);
  star *= exp(-length(fract(grid) - 0.5) * 8.0);
  star *= outerEnvelope * (0.35 + turbulence);

  float density = armField * radialFalloff * outerEnvelope;
  density += filaments * 0.16 * radialFalloff;
  density += star * (0.32 + u_signal * 0.9);
  density += eventHorizon * (0.3 + u_state * 0.7);
  density += core * (1.3 + u_signal * 1.8);

  float pulse = 0.94 + sin(motionTime * 0.7 + radius * 24.0) * 0.06 * u_motion;
  density *= pulse;

  vec3 deep = vec3(0.008, 0.004, 0.018);
  vec3 violet = vec3(0.25, 0.055, 0.56);
  vec3 signal = vec3(0.62, 0.28, 1.0);
  vec3 whiteCore = vec3(0.92, 0.88, 1.0);
  vec3 cyanMemory = vec3(0.12, 0.62, 0.78);

  float hueMix = clamp(turbulence * 0.7 + u_memory * 0.35 + radius * 0.2, 0.0, 1.0);
  vec3 color = mix(violet, signal, density);
  color = mix(color, cyanMemory, hueMix * u_memory * 0.32);
  color = mix(color, whiteCore, clamp(core + eventHorizon * 0.35, 0.0, 1.0));
  color *= density * (0.7 + u_signal * 1.25);

  float vignette = smoothstep(1.05, 0.18, length(uv));
  color = mix(deep, color, vignette);

  float grain = hash21(gl_FragCoord.xy + floor(motionTime * 24.0));
  color += (grain - 0.5) * 0.025 * u_entropy;

  float alpha = clamp(density * 0.95 + core, 0.0, 1.0);
  out_color = vec4(color, alpha);
}
