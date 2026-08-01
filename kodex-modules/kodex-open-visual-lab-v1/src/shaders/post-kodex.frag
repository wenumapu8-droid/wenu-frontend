#version 300 es
precision highp float;
precision highp int;

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_source;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_crt;
uniform float u_ascii;
uniform float u_asciiCell;
uniform float u_dither;
uniform float u_grain;
uniform float u_rgbSplit;
uniform float u_vignette;
uniform vec3 u_accent;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float bayer4(ivec2 p) {
  int x = p.x & 3;
  int y = p.y & 3;
  int index = x + y * 4;

  float values[16] = float[](
    0.0,  8.0,  2.0, 10.0,
    12.0, 4.0, 14.0, 6.0,
    3.0, 11.0, 1.0, 9.0,
    15.0, 7.0, 13.0, 5.0
  );

  return values[index] / 16.0;
}

uint glyphRow(int glyph, int row) {
  if (glyph == 0) return 0u;

  if (glyph == 1) {
    if (row == 6) return 4u;
    return 0u;
  }

  if (glyph == 2) {
    if (row == 2 || row == 5) return 4u;
    return 0u;
  }

  if (glyph == 3) {
    if (row == 1 || row == 2 || row == 4 || row == 5) return 4u;
    if (row == 3) return 31u;
    return 0u;
  }

  if (glyph == 4) {
    if (row == 1 || row == 5) return 21u;
    if (row == 2 || row == 4) return 14u;
    if (row == 3) return 31u;
    return 0u;
  }

  if (glyph == 5) {
    if (row == 1 || row == 3 || row == 5) return 10u;
    if (row == 2 || row == 4) return 31u;
    return 0u;
  }

  if (glyph == 6) {
    if (row == 0) return 25u;
    if (row == 1) return 26u;
    if (row == 2) return 4u;
    if (row == 3) return 4u;
    if (row == 4) return 11u;
    if (row == 5) return 19u;
    return 0u;
  }

  if (glyph == 7) {
    if (row == 0) return 14u;
    if (row == 1) return 17u;
    if (row == 2) return 23u;
    if (row == 3) return 21u;
    if (row == 4) return 23u;
    if (row == 5) return 16u;
    return 14u;
  }

  return 31u;
}

float glyphMask(float luminance, vec2 pixel, float cellSize) {
  vec2 cell = floor(pixel / cellSize);
  vec2 local = fract(pixel / cellSize);

  int glyph = int(clamp(floor(luminance * 8.0), 0.0, 7.0));
  int gx = int(clamp(floor(local.x * 5.0), 0.0, 4.0));
  int gy = int(clamp(floor(local.y * 7.0), 0.0, 6.0));

  uint rowBits = glyphRow(glyph, gy);
  uint bit = (rowBits >> uint(4 - gx)) & 1u;

  vec2 edge = smoothstep(vec2(0.0), vec2(0.08), local)
    * smoothstep(vec2(0.0), vec2(0.08), 1.0 - local);

  return float(bit) * edge.x * edge.y;
}

vec2 curveUv(vec2 uv, float amount) {
  vec2 p = uv * 2.0 - 1.0;
  p *= 1.0 + amount * vec2(p.y * p.y, p.x * p.x);
  return p * 0.5 + 0.5;
}

void main() {
  vec2 uv = curveUv(v_uv, 0.08 * u_crt);
  bool outside = any(lessThan(uv, vec2(0.0)))
    || any(greaterThan(uv, vec2(1.0)));

  if (outside) {
    fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  vec2 split = vec2(u_rgbSplit / u_resolution.x, 0.0);
  float red = texture(u_source, uv + split).r;
  float green = texture(u_source, uv).g;
  float blue = texture(u_source, uv - split).b;
  vec3 color = vec3(red, green, blue);

  vec2 pixel = uv * u_resolution;
  float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));

  if (u_ascii > 0.001) {
    vec2 cell = floor(pixel / u_asciiCell);
    vec2 sampleUv = (cell + 0.5) * u_asciiCell / u_resolution;
    vec3 sampleColor = texture(u_source, sampleUv).rgb;
    float sampleLum = dot(sampleColor, vec3(0.2126, 0.7152, 0.0722));
    float mask = glyphMask(sampleLum, pixel, u_asciiCell);
    vec3 asciiColor = mix(sampleColor, u_accent, 0.48 + sampleLum * 0.32);
    color = mix(color, asciiColor * mask, u_ascii);
    luminance = sampleLum;
  }

  if (u_dither > 0.001) {
    float threshold = bayer4(ivec2(pixel));
    float levels = 5.0;
    vec3 quantized = floor(color * levels + threshold) / levels;
    color = mix(color, quantized, u_dither);
  }

  if (u_crt > 0.001) {
    float scanline = 0.88 + 0.12 * sin(pixel.y * 3.14159265);
    float triad = mod(pixel.x, 3.0);
    vec3 mask = triad < 1.0
      ? vec3(1.05, 0.90, 0.90)
      : triad < 2.0
        ? vec3(0.90, 1.05, 0.90)
        : vec3(0.90, 0.90, 1.05);

    color *= mix(vec3(1.0), mask * scanline, u_crt * 0.72);
  }

  float grain = hash21(pixel + floor(u_time * 60.0)) - 0.5;
  color += grain * u_grain;

  vec2 v = uv * (1.0 - uv);
  float vignette = pow(clamp(v.x * v.y * 16.0, 0.0, 1.0), 0.28);
  color *= mix(1.0, vignette, u_vignette);

  fragColor = vec4(max(color, 0.0), 1.0);
}
