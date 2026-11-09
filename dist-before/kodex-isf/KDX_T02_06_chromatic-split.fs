/*{
  "DESCRIPTION": "KODEX−∞ TANDA 02 / 06 · CHROMATIC SPLIT — Separacion RGB / Vision desfasada",
  "CREDIT": "KODEX−∞ · derivado de reference/canon/t02-06-chromatic-split.png",
  "CATEGORIES": [
    "KODEX",
    "Filter",
    "CHROMATIC SPLIT"
  ],
  "ISFVSN": "2",
  "INPUTS": [
    {
      "NAME": "inputImage",
      "TYPE": "image"
    },
    {
      "NAME": "u_split_amount",
      "LABEL": "SPLIT AMOUNT",
      "TYPE": "float",
      "DEFAULT": 0.006,
      "MIN": 0,
      "MAX": 0.05
    },
    {
      "NAME": "u_angle",
      "LABEL": "ANGLE",
      "TYPE": "float",
      "DEFAULT": 0,
      "MIN": 0,
      "MAX": 6.2832
    },
    {
      "NAME": "u_ghosting",
      "LABEL": "GHOSTING",
      "TYPE": "float",
      "DEFAULT": 0.4,
      "MIN": 0,
      "MAX": 1
    },
    {
      "NAME": "u_convergence",
      "LABEL": "CONVERGENCE",
      "TYPE": "float",
      "DEFAULT": 0,
      "MIN": -1,
      "MAX": 1
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
 * KODEX-∞ · TANDA 02 / 06 · CHROMATIC SPLIT
 * Referencia: reference/canon/t02-06-chromatic-split.png
 *
 * Aberración cromática real: cada canal se muestrea con su propio
 * desplazamiento. Rojo y azul van en direcciones opuestas y el verde queda
 * anclado — así el sujeto no "se mueve", solo se descompone.
 *
 * `convergence` es la variable que casi nadie implementa y que el póster sí
 * declara: la aberración de una lente crece hacia los bordes, no es uniforme.
 * En 0 el desplazamiento es plano; en 1 escala con la distancia al centro.
 */

void main() {
  vec2 dir = vec2(cos(u_angle), sin(u_angle));

  float r = length(v_uv - 0.5) * 2.0;
  float falloff = mix(1.0, r, clamp(u_convergence, -1.0, 1.0));

  vec2 off = dir * u_split_amount * falloff;

  float cr = texture(u_inputTex, v_uv + off).r;
  float cg = texture(u_inputTex, v_uv).g;
  float cb = texture(u_inputTex, v_uv - off).b;

  vec3 col = vec3(cr, cg, cb);

  // Ghosting: un eco a doble desplazamiento, sumado en screen. Es lo que da la
  // sensación de señal duplicada en vez de solo bordes de color.
  if (u_ghosting > 0.0) {
    vec3 ghost = vec3(
      texture(u_inputTex, v_uv + off * 2.0).r,
      texture(u_inputTex, v_uv).g,
      texture(u_inputTex, v_uv - off * 2.0).b
    );
    col = 1.0 - (1.0 - col) * (1.0 - ghost * u_ghosting * 0.5);
  }

  gl_FragColor = vec4(col, 1.0);
}
