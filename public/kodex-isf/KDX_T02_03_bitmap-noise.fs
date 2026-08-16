/*{
  "DESCRIPTION": "KODEX−∞ TANDA 02 / 03 · BITMAP NOISE — Umbral binario / Mapa de ruido",
  "CREDIT": "KODEX−∞ · derivado de reference/canon/t02-03-bitmap-noise.png",
  "CATEGORIES": [
    "KODEX",
    "Filter",
    "BITMAP NOISE"
  ],
  "ISFVSN": "2",
  "INPUTS": [
    {
      "NAME": "inputImage",
      "TYPE": "image"
    },
    {
      "NAME": "u_threshold",
      "LABEL": "THRESHOLD",
      "TYPE": "float",
      "DEFAULT": 0.52,
      "MIN": 0,
      "MAX": 1
    },
    {
      "NAME": "u_edge_width",
      "LABEL": "EDGE WIDTH",
      "TYPE": "float",
      "DEFAULT": 1.5,
      "MIN": 0,
      "MAX": 8
    },
    {
      "NAME": "u_posterize",
      "LABEL": "POSTERIZE",
      "TYPE": "long",
      "DEFAULT": 3,
      "MIN": 2,
      "MAX": 16
    },
    {
      "NAME": "u_crush",
      "LABEL": "CRUSH",
      "TYPE": "float",
      "DEFAULT": 0.25,
      "MIN": 0,
      "MAX": 1
    },
    {
      "NAME": "u_invert",
      "LABEL": "INVERT",
      "TYPE": "bool",
      "DEFAULT": false
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
 * KODEX-∞ · TANDA 02 / 03 · BITMAP NOISE
 * Referencia: reference/canon/t02-03-bitmap-noise.png
 * El pliego maestro lo llama BITMAP THRESHOLD; el póster BITMAP NOISE.
 * Se adoptó el nombre del póster (ver `conflicto` en tanda-02.json).
 *
 * Es umbral binario con borde: la lámina lo describe como "bitmap dust field /
 * quantized organic", que es umbral duro MÁS un borde detectado, no solo un
 * step. Sin el borde el resultado es una silueta plana y se pierde la
 * estructura que el póster muestra en las raíces del árbol.
 */

float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

void main() {
  vec2 px = u_edge_width / u_resolution;

  vec3 c  = texture(u_inputTex, v_uv).rgb;
  float l = luma(c);

  // Sobel reducido a 4 muestras: alcanza para un borde de 1 px y cuesta la
  // mitad que el kernel completo.
  float lx = luma(texture(u_inputTex, v_uv + vec2(px.x, 0.0)).rgb)
           - luma(texture(u_inputTex, v_uv - vec2(px.x, 0.0)).rgb);
  float ly = luma(texture(u_inputTex, v_uv + vec2(0.0, px.y)).rgb)
           - luma(texture(u_inputTex, v_uv - vec2(0.0, px.y)).rgb);
  float edge = clamp(length(vec2(lx, ly)) * 4.0, 0.0, 1.0);

  // Crush: aplasta los negros antes de umbralizar. Es lo que convierte un
  // degradado suave en polvo, en vez de en una mancha sólida.
  l = pow(max(l - u_crush, 0.0) / max(1.0 - u_crush, 1e-4), 1.4);

  float steps = max(u_posterize, 2.0);
  float p = floor(l * steps) / (steps - 1.0);

  float bit = step(u_threshold, p);
  bit = max(bit, edge);

  if (u_invert == 1) bit = 1.0 - bit;

  // Conserva el tinte del original en vez de salir gris: el póster es cian
  // sobre negro, no blanco sobre negro.
  vec3 tint = c / max(luma(c), 1e-4);
  gl_FragColor = vec4(bit * clamp(tint, 0.0, 2.0), 1.0);
}
