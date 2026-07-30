#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 o;

uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_time;
uniform float u_bass;
uniform float u_motion;

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = v_uv;
  vec4 src = texture(u_tex, uv);
  vec3 col = src.rgb;

  vec2 px = 1.0 / max(u_res, vec2(1.0));
  vec3 bloom = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    float a = float(i) * 1.5707963;
    vec2 d = vec2(cos(a), sin(a)) * px * (3.0 + u_bass * 5.0);
    bloom += max(vec3(0.0), texture(u_tex, uv + d).rgb - 0.22);
  }

  col += bloom * 0.24;
  col *= mix(0.96, 1.0, sin(uv.y * u_res.y * 3.14159) * 0.5 + 0.5);
  col *= smoothstep(1.18, 0.22, length(uv - 0.5));
  col += (hash21(gl_FragCoord.xy + u_time * 10.0) - 0.5) * 0.018 * step(0.5, u_motion + 0.5);

  o = vec4(col, src.a);
}
