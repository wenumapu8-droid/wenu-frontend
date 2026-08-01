#version 300 es
// composite — final pass to screen. Cheap bloom (bright-pass + 4 taps), phosphor
// scanlines, vignette, sensor grain. Retro-ritual Hi-Fi, not synthwave.
// uniforms:
//   u_tex    sampler2D  accumulation to present
//   u_res    vec2       resolution
//   u_time   float      seconds
//   u_audio  float      audio energy   range: 0..1
// cost: ~5 texture fetches. mobile-safe.
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_time;
uniform float u_audio;

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec2 uv = v_uv;
  vec3 col = texture(u_tex, uv).rgb;

  // cheap bloom
  vec2 px = 1.0 / u_res;
  vec3 bloom = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    float ai = float(i) * 1.5708;
    vec2 d = vec2(cos(ai), sin(ai)) * px * (3.0 + u_audio * 7.0);
    bloom += max(vec3(0.0), texture(u_tex, uv + d).rgb - 0.55);
  }
  col += bloom * 0.5 * (0.6 + u_audio);

  // phosphor scanlines
  col *= 0.92 + 0.08 * sin(uv.y * u_res.y * 3.14159);
  // vignette
  col *= smoothstep(1.15, 0.32, length(uv - 0.5));
  // grain
  col += (hash(uv * u_res + u_time) - 0.5) * 0.04;

  o = vec4(col, 1.0);
}
