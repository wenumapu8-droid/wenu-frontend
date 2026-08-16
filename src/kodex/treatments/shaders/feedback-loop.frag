#version 300 es
precision highp float;

/**
 * KODEX-∞ · TANDA 02 / 04 · FEEDBACK LOOP
 * Referencia: reference/canon/t02-04-feedback-loop.png
 * El pliego maestro lo llama MEMORY FEEDBACK; el póster FEEDBACK LOOP.
 *
 * Este es el único tratamiento que necesita el cuadro anterior. La cadena le
 * pasa u_previousFrame — el mismo par de framebuffers alternados que KodexField
 * ya usa. Sin eso el shader compila y no se ve nada, que es exactamente el
 * fallo mudo que este repo ya pagó una vez.
 *
 * El eco se realimenta ROTADO Y ESCALADO, no en el mismo lugar. Realimentar
 * 1:1 solo satura; el pequeño giro es lo que produce la espiral del póster.
 */

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_inputTex;
uniform sampler2D u_previousFrame;
uniform vec2  u_resolution;
uniform float u_time;
uniform float u_delta;

uniform float u_feedback_amount; // 0.88
uniform float u_decay;           // 0.94
uniform float u_distortion;      // 0.15
uniform float u_rotation_speed;  // 0.20

void main() {
  vec2 c = v_uv - 0.5;

  float a = u_rotation_speed * 0.05;
  float s = sin(a), k = cos(a);
  vec2 r = vec2(c.x * k - c.y * s, c.x * s + c.y * k);

  // Zoom hacia adentro: cada iteración se acerca un poco, que es lo que hace
  // que el rastro se lea como túnel y no como mancha.
  r *= 1.0 - 0.008;

  // La distorsión desplaza el eco con una onda lenta. Con u_distortion en 0 el
  // eco es limpio y concéntrico.
  r += vec2(
    sin(r.y * 6.2831 + u_time * 0.7),
    cos(r.x * 6.2831 - u_time * 0.5)
  ) * u_distortion * 0.02;

  vec3 prev = texture(u_previousFrame, r + 0.5).rgb;
  vec3 src  = texture(u_inputTex, v_uv).rgb;

  // El decay va ligado al delta real, no al frame: a 30 fps y a 120 fps el
  // rastro tiene que durar lo mismo en segundos, o el efecto cambia según la
  // máquina.
  float decay = pow(clamp(u_decay, 0.0, 0.9999), u_delta * 60.0);

  vec3 col = max(src, prev * decay * u_feedback_amount);

  fragColor = vec4(col, 1.0);
}
