#version 300 es
// distort — displacement field. mode: 0 ripple · 1 lens · 2 vortex.
// uniforms: u_tex, u_res, u_amt (0..1), u_mode, u_time, u_audio
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_amt;
uniform float u_mode;
uniform float u_time;
uniform float u_audio;
void main() {
  vec2 uv = v_uv;
  vec2 c = uv - 0.5;
  float r = length(c);
  vec2 d = vec2(0.0);
  if (u_mode < 0.5) {                     // ripple
    d = c * sin(r * 26.0 - u_time * 1.6) * 0.5;
  } else if (u_mode < 1.5) {              // lens / event-horizon pinch
    d = c * (r * r) * (3.0 + u_audio * 2.0);
  } else {                                // vortex
    float a = atan(c.y, c.x) + (0.45 - r) * (4.0 + u_audio * 3.0);
    d = vec2(cos(a), sin(a)) * r - c;
  }
  o = vec4(texture(u_tex, uv + d * u_amt).rgb, 1.0);
}
