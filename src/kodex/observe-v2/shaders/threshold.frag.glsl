#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 v_uv;

uniform sampler2D u_tex;
uniform vec2 u_resolution;
uniform float u_audioHigh;
uniform float u_intensity;

float bayer(vec2 p) {
  int x = int(mod(p.x, 4.0));
  int y = int(mod(p.y, 4.0));
  int index = x + y * 4;
  float m[16];
  m[0]=0.0; m[1]=8.0; m[2]=2.0; m[3]=10.0;
  m[4]=12.0; m[5]=4.0; m[6]=14.0; m[7]=6.0;
  m[8]=3.0; m[9]=11.0; m[10]=1.0; m[11]=9.0;
  m[12]=15.0; m[13]=7.0; m[14]=13.0; m[15]=5.0;
  return m[index] / 16.0;
}

void main() {
  vec4 src = texture(u_tex, v_uv);
  float luma = dot(src.rgb, vec3(0.2126, 0.7152, 0.0722));
  float threshold = 0.38 + bayer(gl_FragCoord.xy) * 0.24 + u_audioHigh * 0.08;
  float bit = smoothstep(threshold - 0.08, threshold + 0.08, luma + u_intensity * 0.04);
  vec3 hi = mix(src.rgb * 0.72, vec3(0.910, 0.898, 0.874), bit);
  vec3 lo = src.rgb * mix(0.46, 0.74, bit);
  fragColor = vec4(mix(lo, hi, bit), src.a);
}
