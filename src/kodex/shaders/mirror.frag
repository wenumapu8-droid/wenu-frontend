#version 300 es
// mirror — polar kaleidoscope. Segments fold the field into radial symmetry.
// uniforms: u_tex, u_res, u_seg (1..24), u_angle (rad), u_mix (0..1)
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_seg;
uniform float u_angle;
uniform float u_mix;
void main() {
  float aspect = u_res.x / max(1.0, u_res.y);
  vec2 c = v_uv - 0.5; c.x *= aspect;
  float r = length(c);
  float a = atan(c.y, c.x) + u_angle;
  float seg = max(1.0, u_seg);
  float span = 6.2831853 / seg;
  a = mod(a, span);
  a = abs(a - span * 0.5);
  vec2 p = vec2(cos(a), sin(a)) * r; p.x /= aspect; p += 0.5;
  vec3 col = texture(u_tex, fract(p)).rgb;
  vec3 orig = texture(u_tex, v_uv).rgb;
  o = vec4(mix(orig, col, u_mix), 1.0);
}
