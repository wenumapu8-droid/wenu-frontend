#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 o;

uniform sampler2D u_scene;
uniform sampler2D u_prev;
uniform float u_decay;
uniform float u_mix;
uniform float u_time;

void main() {
  vec2 centered = v_uv - 0.5;
  float angle = 0.0015 + sin(u_time * 0.11) * 0.0008;
  float scale = 0.9965;
  mat2 R = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 prevUv = R * centered * scale + 0.5;

  vec4 scene = texture(u_scene, v_uv);
  vec4 prev = texture(u_prev, prevUv) * u_decay;
  vec3 col = max(scene.rgb, mix(scene.rgb, prev.rgb, u_mix));
  float alpha = max(scene.a, prev.a * 0.92);

  o = vec4(col, alpha);
}
