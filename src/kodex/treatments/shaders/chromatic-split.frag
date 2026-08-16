#version 300 es
precision highp float;

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

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_inputTex;
uniform vec2  u_resolution;
uniform float u_time;

uniform float u_split_amount; // 0.006
uniform float u_angle;        // 0.00
uniform float u_ghosting;     // 0.40
uniform float u_convergence;  // 0.00

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

  fragColor = vec4(col, 1.0);
}
