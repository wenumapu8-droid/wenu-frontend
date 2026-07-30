#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 v_uv;

uniform sampler2D u_scene;
uniform sampler2D u_prev;
uniform vec2 u_resolution;
uniform vec2 u_pointerVelocity;
uniform float u_feedbackAmount;
uniform float u_time;
uniform float u_transition;
uniform float u_reducedMotion;

void main() {
  vec2 velocity = u_pointerVelocity * 0.01;
  vec2 trailOffset = vec2(0.002 * sin(u_time * 0.7), -0.003 * cos(u_time * 0.5)) + velocity;
  vec4 scene = texture(u_scene, v_uv);
  vec4 prev = texture(u_prev, v_uv + trailOffset);
  float mixAmt = mix(u_feedbackAmount, u_feedbackAmount * 0.35, u_reducedMotion);
  vec3 col = mix(scene.rgb, max(scene.rgb, prev.rgb * 0.97), mixAmt + u_transition * 0.08);
  fragColor = vec4(col, max(scene.a, prev.a * 0.93));
}
