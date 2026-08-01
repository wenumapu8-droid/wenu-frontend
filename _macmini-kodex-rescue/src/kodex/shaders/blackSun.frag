#version 300 es
// blackSun — cosmic engine. A black disc (event horizon), a bright accretion ring,
// a corona, and the artwork bent around it by gravitational lensing.
// Symbolic centre of KODEX, built as a real lensing shader — not a claim of astronomy.
// uniforms: u_tex, u_res, u_time, u_mouse, u_audio, u_signal, u_seed
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

void main() {
  float aspect = u_res.x / max(1.0, u_res.y);
  vec2 c = v_uv - 0.5; c.x *= aspect;
  c -= u_mouse * 0.10;
  float r = length(c);
  float a = atan(c.y, c.x);
  float rh = 0.15 + u_audio * 0.02;                 // event horizon

  // gravitational lensing — light bends outward near the horizon
  vec2 dir = c / max(r, 1e-4);
  float lens = rh * rh / max(r, 1e-3);
  vec2 suv = c + dir * lens * 0.6; suv.x /= aspect; suv += 0.5;
  vec3 bg = texture(u_tex, fract(suv)).rgb;
  float lum = dot(bg, vec3(0.299, 0.587, 0.114));
  vec3 col = vec3(lum) * 0.45;

  // accretion ring — rotating hot matter
  float ring = smoothstep(rh + 0.16, rh, r) * smoothstep(rh - 0.02, rh + 0.02, r);
  float acc = 0.5 + 0.5 * sin(a * 6.0 - u_time * 2.0 + r * 20.0);
  vec3 ringcol = mix(vec3(0.85, 0.42, 0.14), vec3(0.92, 0.76, 0.40), acc);
  col += ring * acc * ringcol * (1.3 + u_audio);

  // corona — thin bright rim at the horizon; signal turns it rosa
  float corona = smoothstep(rh + 0.035, rh, r) * smoothstep(rh - 0.02, rh, r);
  vec3 cor = mix(vec3(0.92, 0.72, 0.32), vec3(0.90, 0.40, 0.62), u_signal);
  col += corona * cor * 2.2;

  // event horizon — pure black
  col *= smoothstep(rh - 0.006, rh + 0.006, r);

  o = vec4(col, 1.0);
}
