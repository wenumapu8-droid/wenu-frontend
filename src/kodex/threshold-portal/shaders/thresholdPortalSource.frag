#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 o;

uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_time;
uniform float u_seed;
uniform vec2 u_pointer;
uniform float u_bass;
uniform float u_state;
uniform float u_quality;
uniform float u_motion;

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 uv = v_uv;
  vec2 centered = uv - 0.5;
  centered.x *= u_res.x / max(1.0, u_res.y);

  float radius = length(centered);
  float angle = atan(centered.y, centered.x);

  float breathe = sin(u_time * mix(0.12, 0.28, u_state)) * mix(0.02, 0.08, u_state);
  float bassPulse = u_bass * mix(0.03, 0.14, u_state);
  float polarWarp = mix(0.06, 0.24, u_state) * sin(angle * 4.0 + u_time * 0.18 + u_seed * 6.2831);
  float pointerPull = dot(centered, u_pointer) * 0.12;

  float warpedRadius = radius * (1.0 - breathe - bassPulse) + polarWarp * (0.4 + u_quality * 0.6);
  float warpedAngle = angle + pointerPull + sin(radius * 11.0 - u_time * 0.22) * 0.06;

  vec2 sampleUv = vec2(cos(warpedAngle), sin(warpedAngle)) * warpedRadius;
  sampleUv.x /= u_res.x / max(1.0, u_res.y);
  sampleUv += 0.5;

  vec4 artwork = texture(u_tex, sampleUv);
  float mask = artwork.a > 0.0 ? artwork.a : dot(artwork.rgb, vec3(0.3333));

  float ring = smoothstep(0.72, 0.18, radius);
  float halo = exp(-8.0 * abs(radius - 0.22 - bassPulse * 0.5));
  float grain = (hash21(gl_FragCoord.xy + u_seed * 100.0) - 0.5) * 0.025;

  vec3 base = mix(vec3(0.02, 0.01, 0.01), vec3(0.75, 0.08, 0.09), mask);
  base += vec3(1.0, 0.26, 0.14) * halo * (0.35 + 0.4 * u_state);
  base *= ring;
  base += grain;

  o = vec4(base, max(mask, ring * 0.18));
}
