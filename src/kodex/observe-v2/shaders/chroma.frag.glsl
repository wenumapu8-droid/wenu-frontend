#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 v_uv;

uniform sampler2D u_tex;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_transition;
uniform float u_audioHigh;

void main() {
  vec2 center = vec2(0.56 + u_pointer.x * 0.05, 0.44 - u_pointer.y * 0.04);
  float dist = distance(v_uv, center);
  float local = smoothstep(0.62, 0.02, dist) * (0.004 + u_transition * 0.01 + u_audioHigh * 0.006);
  vec2 offset = vec2(local, 0.0);
  vec3 col;
  col.r = texture(u_tex, v_uv + offset).r;
  col.g = texture(u_tex, v_uv).g;
  col.b = texture(u_tex, v_uv - offset).b;
  float alpha = texture(u_tex, v_uv).a;
  fragColor = vec4(col, alpha);
}
