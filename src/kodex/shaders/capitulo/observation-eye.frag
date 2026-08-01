#version 300 es
precision highp float;

/**
 * KODEX-∞ · OBSERVATION EYE · CORE INTERFACE
 *
 * El panel 08 del plano, ejecutado, con **sus uniforms literales**:
 *
 *   SCAN_SPEED 1.25 · PULSE_SPEED 2.40 · SCAN_DENSITY 1024
 *   IRIS_INNER 0.12 · NOISE_SCALE 2.75
 *
 * y sus cuatro operaciones: el anillo del iris por `smoothstep`, la scanline
 * por `step`, el glitch por `step(0.995, …)` — un umbral altísimo, así que la
 * interferencia es rara y por eso se lee como falla y no como efecto — y el
 * pulso por `smoothstep`.
 *
 * Lo que el plano describe y no escribe: **las fibras radiales del iris.** Se
 * construyen muestreando ruido en coordenadas polares con el ángulo estirado —
 * el mismo truco de plegar que usa SIGNAL BLOOM, pero sin espejar: un iris no
 * es simétrico, es fibroso.
 *
 * El ∞ va en la PUPILA, que es el centro exacto de la mirada. No es adorno: es
 * el mismo sello que ARCHIVE TREE lleva en el tronco, y ponerlo donde el ojo
 * enfoca es decir de dónde mira esta entidad.
 *
 * Runtime propio y no el motor de campos: la paleta del capítulo es exacta
 * (violeta/púrpura + cyan, anomalía en rojo) y la etapa GRADE la reescribiría.
 */

out vec4 out_color;

uniform float u_time;
uniform vec2  u_res;
uniform vec2  u_pointer;

uniform float u_low;
uniform float u_mid;
uniform float u_high;

/** Estado: 0 LOCK · 1 TRACK · 2 IDLE, interpolado. */
uniform float u_estado;
/** Parpadeo: 0 abierto, 1 cerrado. Lo maneja el runtime. */
uniform float u_blink;
uniform float u_reduced;

uniform vec3 u_violeta;
uniform vec3 u_cyan;
uniform vec3 u_rojo;

#define TAU 6.28318530718

/* Los uniforms del plano, tal cual. */
#define SCAN_SPEED   1.25
#define PULSE_SPEED  2.40
#define SCAN_DENSITY 1024.0
#define IRIS_INNER   0.12
#define NOISE_SCALE  2.75

float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float ruido(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1, 0)), f.x),
               mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), f.x), f.y);
}

float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * ruido(p); p *= 2.07; a *= 0.5; }
    return v;
}

/** El ∞: dos círculos tangentes. */
float infinito(vec2 p, float r) {
    vec2 q = vec2(abs(p.x) - r * 0.85, p.y);
    return abs(length(q) - r) - r * 0.17;
}

void main() {
    float mov = 1.0 - clamp(u_reduced, 0.0, 1.0);
    float t = u_time * mov;

    vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / max(u_res.y, 1.0);

    // La mirada sigue al puntero, apenas. El ojo mira a quien lo mira — es la
    // entidad observadora, no una textura de ojo.
    vec2 mira = (u_pointer - 0.5) * 0.16;
    vec2 p = uv - mira;

    float r = length(p);
    float ang = atan(p.y, p.x);

    // Estados: LOCK abre y aprieta, IDLE atenúa. El plano da 42% de potencia
    // en IDLE y ese número es el que baja la señal.
    float lock  = 1.0 - smoothstep(0.0, 1.0, u_estado);
    float idle  = smoothstep(1.0, 2.0, u_estado);
    float poder = mix(1.0, 0.42, idle);

    // pulse = smoothstep(...) · PULSE_SPEED
    float pulso = smoothstep(0.0, 1.0, 0.5 + 0.5 * sin(t * PULSE_SPEED));
    float late = mix(pulso, clamp(u_low, 0.0, 1.0), 0.5);

    // El iris se dilata con el pulso y se cierra en LOCK: un ojo que fija el
    // blanco contrae la pupila.
    float irisR = 0.42 + late * 0.05 - lock * 0.04;
    float pupilaR = IRIS_INNER + late * 0.02 + idle * 0.05;

    // ── Fibras radiales del iris ─────────────────────────────────────────
    // Ruido en polares con el ángulo estirado: de ahí salen hebras que van del
    // centro al borde en vez de manchas.
    vec2 pol = vec2(ang * 3.4, r * NOISE_SCALE);
    float fib = fbm(pol * 3.0 + vec2(0.0, -t * 0.12));
    fib = pow(1.0 - abs(2.0 * fib - 1.0), 2.6);

    // El iris vive entre la pupila y el borde. `smoothstep` a los dos lados,
    // que es el "iris ring" del panel.
    float anillo = smoothstep(pupilaR, pupilaR + 0.05, r) * (1.0 - smoothstep(irisR - 0.06, irisR, r));

    vec3 col = vec3(0.0);
    col += mix(u_violeta, u_cyan, fib * 0.35) * fib * anillo * 1.5;

    // Limbo: el borde del iris, más claro.
    float limbo = exp(-pow((r - irisR) * 34.0, 2.0));
    col += u_cyan * limbo * (0.35 + late * 0.3);

    // ── Anillos de escaneo ───────────────────────────────────────────────
    // Concéntricos, girando hacia afuera a SCAN_SPEED.
    float anillos = abs(fract(r * 9.0 - t * SCAN_SPEED * 0.25) - 0.5);
    anillos = (1.0 - smoothstep(0.0, 0.06, anillos)) * smoothstep(irisR, irisR + 0.05, r);
    col += u_violeta * anillos * 0.35 * smoothstep(1.15, 0.45, r);

    // Barrido rotacional: el radar del ojo.
    float barrido = fract((ang / TAU) + 0.5 - t * SCAN_SPEED * 0.14);
    col += u_cyan * pow(1.0 - barrido, 22.0) * smoothstep(pupilaR, 1.1, r) * 0.5;

    // ── La pupila y su ∞ ─────────────────────────────────────────────────
    float pupila = 1.0 - smoothstep(pupilaR - 0.01, pupilaR + 0.01, r);
    col *= 1.0 - pupila;               // la pupila es negra: es el pozo
    float inf = 1.0 - smoothstep(0.0, 0.006, abs(infinito(p, pupilaR * 0.5)));
    col += u_cyan * inf * (0.8 + 0.4 * sin(t * 1.4));

    // ── scanline · step(…, SCAN_DENSITY) ─────────────────────────────────
    float sl = step(0.5, fract(gl_FragCoord.y * SCAN_DENSITY / max(u_res.y, 1.0) * 0.5));
    col *= 0.86 + 0.14 * sl;

    // ── glitch · step(0.995, …) ──────────────────────────────────────────
    // El umbral es altísimo a propósito: la interferencia tiene que ser RARA.
    // Un glitch que ocurre siempre deja de leerse como falla.
    float g = step(0.995, hash21(vec2(floor(uv.y * 90.0), floor(t * 14.0))));
    float corr = g * (hash21(vec2(floor(t * 14.0), 3.0)) - 0.5) * 0.6;
    col.r *= 1.0 + corr;
    col.b *= 1.0 - corr;

    // ── BLINK ────────────────────────────────────────────────────────────
    // Dos párpados que se cierran. Al reabrir queda el glitch, como pide el
    // panel 02: "rapid closure, glitch on reopen".
    //
    // `apertura` es la media altura de la abertura: 1.15 con el ojo abierto,
    // 0 cerrado. Se escribe así y NO como `smoothstep(tapa, tapa - 0.06, …)`,
    // que era lo que tenía: con `edge0 > edge1` el resultado de smoothstep es
    // INDEFINIDO en GLSL, y en la práctica devolvía cero — es decir, el
    // párpado multiplicaba la imagen entera por cero y el ojo se veía negro
    // con el shader compilando sin una sola queja.
    float apertura = mix(1.15, 0.0, clamp(u_blink, 0.0, 1.0));
    float parpado = 1.0 - smoothstep(apertura - 0.06, apertura, abs(p.y));
    col *= parpado;
    col += u_violeta * (1.0 - parpado) * u_blink * 0.05;

    // Anomalía en rojo: sólo cuando la señal se va. Es el único rojo del
    // capítulo y por eso significa algo.
    float anomalia = smoothstep(0.7, 1.0, u_high) * (1.0 - lock);
    col += u_rojo * anomalia * limbo * 0.5;

    col *= poder;
    col += (hash21(gl_FragCoord.xy + floor(t * 24.0)) - 0.5) * 0.015;
    col *= clamp(1.25 - r * 0.55, 0.0, 1.0);

    out_color = vec4(max(col, 0.0), 1.0);
}
