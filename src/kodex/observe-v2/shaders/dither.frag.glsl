#version 300 es
precision highp float;

// KDX FX SUITE 02 · dither-matrix (Matriz de Tramado)
//
// Ordered dithering against the canonical Bayer 8x8 matrix. Purely a visual
// treatment: it quantises what the previous pass produced and measures nothing.
//
// Canonical params (manifest.json -> tratamientos -> dither-matrix):
//   pattern "Bayer 8x8" -> BAYER8 below, the real 8x8 matrix (not 4x4)
//   dither_scale 4      -> u_ditherScale  matrix cell size, in device pixels
//   contrast     1.25   -> u_contrast     contrast about mid grey, pre-dither
//   threshold    0.48   -> u_threshold    the cut the dither modulates around
//   color_quant  true   -> u_colorQuant   0 = 1-bit luma, 1 = per-channel RGB
// Declared blend is ["normal", "luma"]; blending is a composite-stage decision,
// not done here. This pass returns the treated colour and dry/wet mixes it via
// u_intensity, matching the other passes in this suite.
//
// The matrix is anchored to gl_FragCoord, so the pattern is static in screen
// space. This treatment does not animate — no u_time, no u_reducedMotion,
// and deliberately no per-frame shimmer to reduce.

out vec4 fragColor;
in vec2 v_uv;

uniform sampler2D u_tex;
uniform vec2 u_resolution;
uniform float u_ditherScale;
uniform float u_contrast;
uniform float u_threshold;
uniform float u_colorQuant;
uniform float u_intensity;

const vec3 LUMA_REC709 = vec3(0.2126, 0.7152, 0.0722);

// Canonical Bayer 8x8 ordered-dither matrix, values 0..63.
const float BAYER8[64] = float[64](
   0.0, 32.0,  8.0, 40.0,  2.0, 34.0, 10.0, 42.0,
  48.0, 16.0, 56.0, 24.0, 50.0, 18.0, 58.0, 26.0,
  12.0, 44.0,  4.0, 36.0, 14.0, 46.0,  6.0, 38.0,
  60.0, 28.0, 52.0, 20.0, 62.0, 30.0, 54.0, 22.0,
   3.0, 35.0, 11.0, 43.0,  1.0, 33.0,  9.0, 41.0,
  51.0, 19.0, 59.0, 27.0, 49.0, 17.0, 57.0, 25.0,
  15.0, 47.0,  7.0, 39.0, 13.0, 45.0,  5.0, 37.0,
  63.0, 31.0, 55.0, 23.0, 61.0, 29.0, 53.0, 21.0
);

// Returns (0,1) with a mean of exactly 0.5 across the 64 cells, so that
// u_threshold lands where the average cut actually sits.
float bayer8(vec2 cell) {
  int x = int(mod(cell.x, 8.0));
  int y = int(mod(cell.y, 8.0));
  return (BAYER8[y * 8 + x] + 0.5) / 64.0;
}

void main() {
  vec4 src = texture(u_tex, v_uv);

  vec2 cell = floor(gl_FragCoord.xy / max(u_ditherScale, 1.0));
  float offset = bayer8(cell) - 0.5;

  vec3 shaped = clamp((src.rgb - 0.5) * u_contrast + 0.5, 0.0, 1.0);
  float luma = dot(shaped, LUMA_REC709);

  // Full-range offset: for a 1-bit result the Bayer amplitude is one whole
  // quantisation step, i.e. the entire 0..1 range.
  float cut = clamp(u_threshold, 0.0, 1.0) + offset;

  vec3 rgbBits = step(vec3(cut), shaped);
  vec3 lumaBit = vec3(step(cut, luma));
  vec3 dithered = mix(lumaBit, rgbBits, step(0.5, u_colorQuant));

  fragColor = vec4(mix(src.rgb, dithered, clamp(u_intensity, 0.0, 1.0)), src.a);
}
