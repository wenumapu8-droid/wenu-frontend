/*{
  "DESCRIPTION": "KODEX−∞ TANDA 02 / 01 · CRT SCAN — Escaneo retro",
  "CREDIT": "KODEX−∞ · derivado de reference/canon/t02-01-crt-scan.png",
  "CATEGORIES": [
    "KODEX",
    "Filter",
    "CRT SCAN"
  ],
  "ISFVSN": "2",
  "INPUTS": [
    {
      "NAME": "inputImage",
      "TYPE": "image"
    },
    {
      "NAME": "u_scanline_intensity",
      "LABEL": "SCANLINE INTENSITY",
      "TYPE": "float",
      "DEFAULT": 0.78,
      "MIN": 0,
      "MAX": 1
    },
    {
      "NAME": "u_curvature",
      "LABEL": "CURVATURE",
      "TYPE": "float",
      "DEFAULT": 0.25,
      "MIN": 0,
      "MAX": 1
    },
    {
      "NAME": "u_vignette",
      "LABEL": "VIGNETTE",
      "TYPE": "float",
      "DEFAULT": 0.4,
      "MIN": 0,
      "MAX": 1
    },
    {
      "NAME": "u_phosphor_glow",
      "LABEL": "PHOSPHOR GLOW",
      "TYPE": "float",
      "DEFAULT": 0.65,
      "MIN": 0,
      "MAX": 1
    },
    {
      "NAME": "u_noise",
      "LABEL": "NOISE",
      "TYPE": "float",
      "DEFAULT": 0.18,
      "MIN": 0,
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
 * KODEX-∞ · TANDA 02 / 01 · CRT SCAN
 * Referencia: reference/canon/t02-01-crt-scan.png
 * Parámetros y defaults transcritos de design-system/tanda-02.json.
 *
 * El orden importa y no es arbitrario: la curvatura deforma la UV ANTES de
 * muestrear, porque un CRT curva el vidrio, no la imagen ya formada. Scanline
 * y phosphor van después, sobre el color ya leído. Invertirlo da un efecto que
 * se parece pero se lee como filtro pegado encima.
 */

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

/** Curva la UV como el vidrio de un tubo. Fuera del tubo no hay señal. */
vec2 curve(vec2 uv, float amount) {
  vec2 p = uv * 2.0 - 1.0;
  vec2 off = abs(p.yx) / vec2(6.0, 4.0);
  p += p * off * off * amount * 4.0;
  return p * 0.5 + 0.5;
}

void main() {
  vec2 uv = curve(v_uv, u_curvature);

  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  vec3 col = texture(u_inputTex, uv).rgb;

  // Scanlines a resolución de pantalla, no de textura: si se calculan sobre la
  // UV normalizada, al escalar el canvas las líneas se estiran y dejan de
  // leerse como CRT.
  float line = sin(uv.y * u_resolution.y * 1.5708);
  col *= 1.0 - u_scanline_intensity * 0.5 * (0.5 + 0.5 * line);

  // Phosphor: el verde persiste más que el rojo y el azul. Es lo que da el
  // tono del tubo sin tener que teñir la imagen entera.
  vec3 phosphor = vec3(0.92, 1.0, 0.88);
  col = mix(col, col * phosphor + col * col * 0.35, u_phosphor_glow);

  float n = hash(uv * u_resolution + u_time * 60.0) - 0.5;
  col += n * u_noise * 0.35;

  vec2 vp = uv * (1.0 - uv.yx);
  float vig = pow(vp.x * vp.y * 18.0, u_vignette * 1.2);
  col *= clamp(vig, 0.0, 1.0);

  gl_FragColor = vec4(col, 1.0);
}
