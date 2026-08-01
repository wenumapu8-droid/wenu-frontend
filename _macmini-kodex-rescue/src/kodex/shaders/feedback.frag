#version 300 es
// feedback — real ping-pong. The previous accumulation is rotated, scaled and
// decayed, then merged with the current scene. This is video-feedback / trails,
// executed for real with render targets (not a CSS trick).
// uniforms:
//   u_scene sampler2D  current source pass
//   u_prev  sampler2D  previous accumulation (ping-pong)
//   u_decay float      trail persistence           range: 0..1 (~0.9)
//   u_audio float      audio energy                range: 0..1
// cost: 2 texture fetches. cheap.
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_scene;
uniform sampler2D u_prev;
uniform float u_decay;
uniform float u_audio;

void main() {
  vec2 c = v_uv - 0.5;
  float ang = 0.0022 + u_audio * 0.005;
  float sc = 0.9955 - u_audio * 0.004;
  mat2 R = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  vec2 puv = R * c * sc + 0.5;
  vec3 prev = texture(u_prev, puv).rgb * u_decay;
  vec3 scene = texture(u_scene, v_uv).rgb;
  o = vec4(max(scene, prev), 1.0);
}
