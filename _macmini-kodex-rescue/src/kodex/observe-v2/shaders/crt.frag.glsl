#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 v_uv;

uniform sampler2D u_tex;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_scanPosition;
uniform float u_intensity;
uniform float u_reducedMotion;

void main() {
  vec2 uv = v_uv;
  vec2 warped = uv * 2.0 - 1.0;
  warped *= 1.0 + dot(warped, warped) * 0.045;
  warped = warped * 0.5 + 0.5;
  vec3 col = texture(u_tex, warped).rgb;
  float line = sin((uv.y * u_resolution.y) * 1.35) * 0.035;
  float flicker = (sin(u_time * 41.0) * 0.5 + 0.5) * 0.016 * (1.0 - u_reducedMotion * 0.7);
  float vignette = smoothstep(1.22, 0.18, length(uv - 0.5));
  float scan = exp(-abs(uv.y - u_scanPosition) * 95.0) * (0.06 + u_intensity * 0.16);
  col *= vignette;
  col += line + flicker;
  col += vec3(0.06, 0.03, 0.1) * scan;
  fragColor = vec4(col, 1.0);
}
