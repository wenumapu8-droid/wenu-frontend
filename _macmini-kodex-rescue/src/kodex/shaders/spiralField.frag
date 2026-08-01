#version 300 es
// spiralField — the source pass. An Achroma work is read as matter and warped
// through a logarithmic / projective spiral. Movement and audio bend the field.
// KODEX geometry: −∞ (descent) and +∞ (manifestation) meet at 0.
// uniforms:
//   u_tex    sampler2D  the artwork (input matter)      range: —
//   u_res    vec2       framebuffer resolution (px)     range: >0
//   u_time   float      seconds                         range: 0..∞
//   u_mouse  vec2       pointer, normalized             range: -1..1
//   u_vel    float      pointer speed                   range: 0..1
//   u_audio  float      audio energy (FFT)              range: 0..1
//   u_signal float      the SIGNAL                      range: 0..1
//   u_seed   float      reproducible seed               range: 0..1
// cost: ~1 texture fetch + trig; cheap. mobile-safe.
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_vel;
uniform float u_audio;
uniform float u_signal;
uniform float u_seed;

void main() {
  float aspect = u_res.x / max(1.0, u_res.y);
  vec2 c = v_uv - 0.5;
  c.x *= aspect;
  float r = length(c);
  float a = atan(c.y, c.x);

  // logarithmic spiral warp; audio opens it, the pointer turns it
  float b = 0.15 + u_audio * 0.12 + u_seed * 0.05;
  float turn = u_time * 0.045 + u_mouse.x * 0.7 + u_vel * 0.8;
  a += b * log(r + 1e-3) * 3.0 + turn;
  r *= 1.0 + 0.05 * sin(u_time * 0.3 + r * 9.0) + u_audio * 0.06;

  vec2 warp = vec2(cos(a), sin(a)) * r;
  warp.x /= aspect;
  vec2 suv = fract(warp + 0.5 + u_mouse * 0.03);

  vec3 col = texture(u_tex, suv).rgb;
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 base = vec3(l);

  // the SIGNAL reveals colour in the bright regions (radiation dimension)
  vec3 gold = vec3(0.82, 0.68, 0.31);
  vec3 rosa = vec3(0.88, 0.33, 0.61);
  vec3 sig = mix(gold, rosa, 0.5 + 0.5 * sin(u_time * 0.12));
  col = mix(base, base * sig * 2.2, u_signal * smoothstep(0.35, 0.95, l));

  o = vec4(col, 1.0);
}
