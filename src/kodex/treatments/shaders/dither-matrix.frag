#version 300 es
precision highp float;

/**
 * KODEX-∞ · TANDA 02 / 02 · DITHER MATRIX
 * Referencia: reference/canon/t02-02-dither-matrix.png
 *
 * El detalle que casi todo el mundo se salta: el dither se aplica en espacio de
 * PANTALLA y a paso fijo. Si el umbral se indexa por UV normalizada, la trama
 * se estira al cambiar de tamaño el canvas y deja de ser una trama para pasar a
 * ser una textura borrosa. Por eso el índice usa gl_FragCoord.
 *
 * pattern: 0 = BAYER · 1 = NOISE · 2 = HYBRID
 */

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_inputTex;
uniform vec2  u_resolution;
uniform float u_time;

uniform float u_dither_scale; // 4.0
uniform float u_contrast;     // 1.25
uniform float u_threshold;    // 0.48
uniform float u_color_quant;  // 6
uniform int   u_pattern;      // 0 = BAYER_8X8

/** Bayer 8×8 por recurrencia — más barato y más exacto que una tabla de 64. */
float bayer8(vec2 p) {
  vec2 p1 = mod(p, 2.0);
  vec2 p2 = floor(0.5 * mod(p, 4.0));
  vec2 p4 = floor(0.25 * mod(p, 8.0));
  float a = 2.0 * p1.x + 6.0 * p1.y - 4.0 * p1.x * p1.y;
  float b = 2.0 * p2.x + 6.0 * p2.y - 4.0 * p2.x * p2.y;
  float c = 2.0 * p4.x + 6.0 * p4.y - 4.0 * p4.x * p4.y;
  return (a * 16.0 + b * 4.0 + c) / 64.0;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec3 col = texture(u_inputTex, v_uv).rgb;

  col = clamp((col - 0.5) * u_contrast + 0.5, 0.0, 1.0);

  vec2 cell = floor(gl_FragCoord.xy / max(u_dither_scale, 1.0));

  float m;
  if (u_pattern == 1) {
    m = hash(cell);
  } else if (u_pattern == 2) {
    m = mix(bayer8(cell), hash(cell), 0.5);
  } else {
    m = bayer8(cell);
  }

  // El umbral corre el punto medio de la trama: 0.5 es neutro, más bajo abre
  // los blancos, más alto cierra a negro.
  m += (u_threshold - 0.5);

  float steps = max(u_color_quant, 2.0);
  vec3 q = floor(col * steps + m) / steps;

  fragColor = vec4(clamp(q, 0.0, 1.0), 1.0);
}
