const n=`#version 300 es
precision highp float;
precision highp int;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform float u_delta;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform vec3 u_audio;
uniform float u_seed;
uniform float u_feedback;
uniform float u_intensity;
uniform sampler2D u_previousFrame;

#define PI 3.141592653589793

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise21(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;

  for (int i = 0; i < 5; i++) {
    value += amplitude * noise21(p);
    p = mat2(1.6, 1.2, -1.2, 1.6) * p;
    amplitude *= 0.5;
  }

  return value;
}

mat2 rotate2d(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c);
}

vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}

void main() {
  vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution.xy)
    / min(u_resolution.x, u_resolution.y);

  float zoom = 1.35 + 0.18 * sin(u_time * 0.08);
  vec2 c = uv / zoom + vec2(-0.55, 0.0);
  c += (u_pointer - 0.5) * 0.14;

  vec2 z = vec2(0.0);
  float iteration = 0.0;
  float trap = 10.0;

  for (int i = 0; i < 96; i++) {
    z = vec2(
      z.x * z.x - z.y * z.y,
      2.0 * z.x * z.y
    ) + c;

    trap = min(trap, abs(length(z) - 0.72));

    if (dot(z, z) > 16.0) {
      iteration = float(i) / 96.0;
      break;
    }
  }

  float contour = smoothstep(
    0.10,
    0.0,
    abs(fract(iteration * 12.0) - 0.5)
  );

  vec3 black = vec3(0.002, 0.003, 0.006);
  vec3 gray = vec3(0.66);
  vec3 cyan = vec3(0.02, 0.9, 1.0);
  vec3 red = vec3(1.0, 0.04, 0.07);

  vec3 color = mix(black, gray, iteration);
  color += cyan * contour * iteration * 0.42;
  color += red * smoothstep(0.06, 0.0, trap) * (0.4 + u_audio.y);

  vec3 previous = texture(u_previousFrame, v_uv).rgb * 0.986;
  color = mix(color, max(color, previous), u_feedback * 0.42);

  fragColor = vec4(color * u_intensity, 1.0);
}
`;export{n as default};
