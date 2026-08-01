#version 300 es
precision highp float;

layout(location = 0) in vec2 p;
out vec2 v_uv;

void main() {
  v_uv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}
