#version 300 es
// flowLines — LUMINOUS THREAD FIELD. Glowing filaments flow along a logarithmic
// spiral and morph toward phyllotaxis, inside a circle. The language of light
// installations (鲲·游于无穷 / fat glowing lines / flow field), not texture-warp.
// The artwork only tints; the FORM is light. uniforms: u_tex,u_res,u_time,u_mouse,u_audio,u_signal,u_seed
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_audio;
uniform float u_signal;
uniform float u_seed;
uniform vec3 u_tint;        // per-work colour (each page its own light)

float hash(float n) { return fract(sin(n) * 43758.5453); }

void main() {
  float aspect = u_res.x / max(1.0, u_res.y);
  vec2 c = v_uv - 0.5; c.x *= aspect;
  c -= u_mouse * 0.06;
  float r = length(c);
  float a = atan(c.y, c.x);
  float t = u_time * 0.15;

  float arms = mix(5.0, 8.0, u_signal);
  float k = mix(2.0, 3.2, 0.5 + 0.5 * sin(t * 0.3));

  vec3 col = vec3(0.0);
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float off = fi * 0.7 + hash(fi + u_seed * 13.0) * 6.2831;
    float phase = a * arms + log(r + 0.04) * k * 6.0 - t * (1.0 + fi * 0.08) + off;
    float thread = pow(0.5 + 0.5 * sin(phase), 34.0);         // thin bright filament
    float ring = pow(0.5 + 0.5 * sin(r * 42.0 - t * 2.0 + fi), 8.0);
    float bright = thread * (0.55 + 0.45 * ring) * (0.7 + u_audio * 0.9);
    // at rest: the work's own palette (B/W stays B/W). Colour variations emerge
    // only through interference — the SIGNAL / touching the work.
    vec3 tint = u_tint;
    tint = mix(tint, vec3(0.40, 0.82, 0.92), u_signal * 0.28 * (0.5 + 0.5 * sin(fi + t))); // cyan
    tint = mix(tint, vec3(0.90, 0.40, 0.62), u_signal * 0.6); // rosa radiation
    col += tint * bright;
  }

  float disc = smoothstep(0.52, 0.28, r);                     // circle framing
  col *= disc;
  col += u_tint * smoothstep(0.05, 0.0, r) * 0.7;             // core
  col += texture(u_tex, v_uv).rgb * 0.035 * disc;             // faint artwork tint

  o = vec4(col, 1.0);
}
