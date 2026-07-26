#version 300 es
// color — signal mapping. mode: 0 gold · 1 rosa · 2 spectral · 3 thermal.
// Colour appears as energy, not decoration. uniforms: u_tex, u_mode, u_amt
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_tex;
uniform float u_mode;
uniform float u_amt;
void main() {
  vec3 col = texture(u_tex, v_uv).rgb;
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 outc = col;
  if (u_mode < 0.5) {                    // gold duotone (the SIGNAL)
    outc = mix(vec3(0.04, 0.03, 0.02), vec3(0.82, 0.68, 0.31), l);
  } else if (u_mode < 1.5) {             // rosa / Disco Solar radiation
    outc = mix(vec3(0.03, 0.0, 0.02), vec3(0.88, 0.33, 0.61), l);
  } else if (u_mode < 2.5) {             // spectral
    outc = 0.5 + 0.5 * cos(6.2831853 * (l + vec3(0.0, 0.33, 0.67)));
  } else {                               // thermal / false-colour scientific
    outc = vec3(smoothstep(0.2, 0.9, l), smoothstep(0.4, 1.0, l) * 0.6, smoothstep(0.7, 1.0, l) * 0.2);
  }
  o = vec4(mix(col, outc, u_amt), 1.0);
}
