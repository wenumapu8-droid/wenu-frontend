/*{
  "DESCRIPTION": "KODEX−∞ TANDA 02 / 02 · DITHER MATRIX — Grilla de tramado / Matriz de difusion",
  "CREDIT": "KODEX−∞ · derivado de reference/canon/t02-02-dither-matrix.png",
  "CATEGORIES": [
    "KODEX",
    "Filter",
    "DITHER MATRIX"
  ],
  "ISFVSN": "2",
  "INPUTS": [
    {
      "NAME": "inputImage",
      "TYPE": "image"
    },
    {
      "NAME": "u_dither_scale",
      "LABEL": "DITHER SCALE",
      "TYPE": "float",
      "DEFAULT": 4,
      "MIN": 1,
      "MAX": 16
    },
    {
      "NAME": "u_contrast",
      "LABEL": "CONTRAST",
      "TYPE": "float",
      "DEFAULT": 1.25,
      "MIN": 0,
      "MAX": 4
    },
    {
      "NAME": "u_threshold",
      "LABEL": "THRESHOLD",
      "TYPE": "float",
      "DEFAULT": 0.48,
      "MIN": 0,
      "MAX": 1
    },
    {
      "NAME": "u_color_quant",
      "LABEL": "COLOR QUANT",
      "TYPE": "long",
      "DEFAULT": 6,
      "MIN": 2,
      "MAX": 32
    },
    {
      "NAME": "u_pattern",
      "LABEL": "PATTERN",
      "TYPE": "long",
      "VALUES": [
        0,
        1,
        2
      ],
      "LABELS": [
        "BAYER",
        "NOISE",
        "HYBRID"
      ],
      "DEFAULT": 0
    }
  ]
}*/

// ── compatibilidad ISF → runtime KODEX ──────────────────────────────────
// ISF declara sus propias entradas y uniforms estandar. Lo que en el runtime
// propio son uniforms explicitos, aca son alias.
#define u_inputTex      inputImage
#define u_previousFrame historial
#define u_resolution    RENDERSIZE
#define u_time          TIME
#define u_delta         TIMEDELTA
vec2 v_uv = isf_FragNormCoord;


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

  gl_FragColor = vec4(clamp(q, 0.0, 1.0), 1.0);
}
