#version 300 es
precision highp float;

/**
 * KODEX-∞ · SPECIMEN SKULL · CRANIAL SCAN
 *
 * El panel 02 del plano, corriendo: el cráneo cyber-orgánico en escaneo vivo.
 *
 * **Por qué el cráneo se construye en 2D y no con raymarching.** Un SDF 3D de
 * un cráneo es un objeto difícil de modelar y caro de marchar, y el plano no
 * muestra un cráneo 3D: muestra una LÁMINA DE ESCANEO frontal, un wireframe de
 * rayos X. Eso se construye con distancias en el plano — bóveda, órbitas,
 * apertura nasal, mandíbula — y se atraviesa con una retícula. Sale más fiel al
 * póster y corre en cualquier máquina, que es la ley del proyecto.
 *
 * El giro no es una rotación real sino una inclinación que corre las capas con
 * profundidad distinta. A esta escala es indistinguible de girar, y cuesta
 * cero.
 *
 * Los cinco tratamientos del panel 03 re-renderizan **el mismo cráneo**: es la
 * misma geometría leída de cinco maneras, no cinco dibujos. Por eso `u_modo`
 * entra al final, sobre la señal ya construida.
 */

out vec4 out_color;

uniform float u_time;
uniform vec2  u_res;

uniform float u_low;
uniform float u_mid;
uniform float u_high;

/** Tratamiento: 0 X-RAY · 1 LINEWORK · 2 BITMAP · 3 THERMAL · 4 GLITCH. */
uniform float u_modo;
/** Protocolo: 0 SCAN · 1 ISOLATE · 2 REVEAL · 3 GLITCH · 4 ARCHIVE. */
uniform float u_proto;
uniform float u_reduced;

uniform vec3 u_rojo;
uniform vec3 u_cyan;
uniform vec3 u_verde;

#define TAU 6.28318530718

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

float sdElipse(vec2 p, vec2 r) { return (length(p / r) - 1.0) * min(r.x, r.y); }

float sdCajaR(vec2 p, vec2 b, float r) {
    vec2 d = abs(p) - b + r;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
}

float suave(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

/**
 * La silueta del cráneo.
 *
 * Bóveda + pómulos + mandíbula unidos con suavidad; órbitas y apertura nasal
 * restadas. Devuelve la distancia con signo: negativa adentro.
 */
float craneo(vec2 p) {
    // Bóveda craneal, algo más ancha arriba.
    float boveda = sdElipse(p - vec2(0.0, 0.16), vec2(0.42, 0.46));
    // Pómulos: ensanchan a la altura de las órbitas.
    float pomulos = sdElipse(p - vec2(0.0, -0.06), vec2(0.44, 0.28));
    // Maxilar y mandíbula, más angostos y hacia abajo.
    float maxilar = sdCajaR(p - vec2(0.0, -0.36), vec2(0.27, 0.16), 0.12);
    float menton = sdElipse(p - vec2(0.0, -0.52), vec2(0.22, 0.14));

    float d = suave(boveda, pomulos, 0.12);
    d = suave(d, maxilar, 0.09);
    d = suave(d, menton, 0.08);
    return d;
}

/** Las cavidades: órbitas y nariz. Se restan de la silueta. */
float cavidades(vec2 p) {
    vec2 q = vec2(abs(p.x), p.y);
    float orbita = sdElipse(q - vec2(0.185, -0.02), vec2(0.115, 0.105));
    // Apertura nasal: triángulo invertido, aproximado con una elipse angosta.
    float nariz = sdElipse(p - vec2(0.0, -0.19), vec2(0.055, 0.085));
    return min(orbita, nariz);
}

/**
 * La arcada dentaria.
 *
 * Sin dientes el contorno se lee como una silueta redondeada cualquiera; son
 * ellos los que dicen "cráneo" antes que ninguna otra parte. Van como una fila
 * de tabiques verticales sobre el maxilar.
 */
float dientes(vec2 p) {
    // Fuera de la banda del maxilar no hay nada que dibujar.
    if (p.y > -0.245 || p.y < -0.40 || abs(p.x) > 0.20) return 1e9;
    float col = abs(fract(p.x * 11.0 + 0.5) - 0.5) / 11.0;
    // La fila se curva: el maxilar es un arco, no una regla.
    float arco = abs(p.y + 0.30 + p.x * p.x * 0.55);
    return max(col - 0.004, arco - 0.058);
}

/** La retícula del wireframe. Triangular, como el póster. */
float malla(vec2 p, float esc) {
    vec2 q = p * esc;
    // Tres familias de líneas a 0°, 60° y 120° dan la triangulación.
    float m = 1e9;
    for (int i = 0; i < 3; i++) {
        float a = float(i) * 1.0471975;
        vec2 d = vec2(cos(a), sin(a));
        float v = dot(q, vec2(-d.y, d.x));
        m = min(m, abs(fract(v) - 0.5));
    }
    return m;
}

/** El símbolo ∞ de la frente: dos círculos tangentes. */
float infinito(vec2 p, float r) {
    vec2 q = vec2(abs(p.x) - r * 0.82, p.y);
    return abs(length(q) - r) - r * 0.16;
}

void main() {
    float mov = 1.0 - clamp(u_reduced, 0.0, 1.0);
    float t = u_time * mov;

    vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / max(u_res.y, 1.0);
    vec2 p = uv * 1.28;

    // Respira: la lámina se acerca y se aleja con los graves. Es un espécimen
    // vivo, no una radiografía impresa.
    float respira = 1.0 + sin(t * 0.9) * 0.012 + (u_low - 0.5) * 0.03;
    p /= respira;

    // "Gira": una inclinación que corre las capas. A esta escala se lee como
    // rotación y no cuesta una cámara.
    float giro = sin(t * 0.35) * 0.09;
    p.x += p.y * giro * 0.5;
    p.x += giro * 0.06;

    float dC = craneo(p);
    float dV = cavidades(p);
    float dD = dientes(p);
    // El hueso: dentro de la silueta y fuera de las cavidades.
    float hueso = max(dC, -dV);

    // ── La estructura de rayos X ───────────────────────────────────────────
    // Contorno: el filo de la silueta y de las cavidades.
    float filoC = 1.0 - smoothstep(0.0, 0.008, abs(dC));
    float filoV = 1.0 - smoothstep(0.0, 0.007, abs(dV));
    float filoD = 1.0 - smoothstep(0.0, 0.004, abs(dD));

    // Retícula sólo DENTRO del hueso: un wireframe que se sale del cuerpo deja
    // de leerse como anatomía y pasa a ser un fondo.
    float dentro = 1.0 - smoothstep(-0.02, 0.005, hueso);
    float red = (1.0 - smoothstep(0.0, 0.045, malla(p, 26.0))) * dentro * 0.55;
    float redFina = (1.0 - smoothstep(0.0, 0.03, malla(p, 58.0))) * dentro * 0.22;

    // La mandíbula va en cyan: el plano la separa por color, y esa separación
    // es lectura anatómica, no decoración.
    float mandibula = smoothstep(-0.02, -0.30, p.y + 0.30);

    // ── Nodos de anatomía ──────────────────────────────────────────────────
    // Frontal, orbital (par), nasal y jaw. Laten con los agudos: son los
    // puntos que el escáner está midiendo.
    float nodos = 0.0;
    vec2 puntos[5] = vec2[5](
        vec2(0.0, 0.34), vec2(-0.185, -0.02), vec2(0.185, -0.02),
        vec2(0.0, -0.19), vec2(0.0, -0.47)
    );
    for (int i = 0; i < 5; i++) {
        float f = 1.1 + float(i) * 0.37;
        float late = 0.5 + 0.5 * sin(t * f + float(i));
        float d = length(p - puntos[i]);
        nodos += exp(-d * d * 900.0) * (0.5 + late * 0.9) * (0.5 + u_high);
    }

    // ── Anillos concéntricos detrás ────────────────────────────────────────
    float r = length(uv);
    float anillos = (1.0 - smoothstep(0.0, 0.006, abs(fract(r * 4.0 - t * 0.05) - 0.5) * 0.5))
                  * smoothstep(0.28, 0.75, r) * 0.22;

    // ── Línea de escaneo ───────────────────────────────────────────────────
    // Barre de arriba abajo y deja ver la capa que atraviesa. Es el "layer
    // sweep" del plano: el protocolo SCAN la enciende.
    float barridoY = fract(t * 0.18) * 2.4 - 1.2;
    float barrido = exp(-pow((p.y - barridoY) * 26.0, 2.0));
    float capa = barrido * dentro * 1.4;

    // ── Composición de la señal ────────────────────────────────────────────
    float senal = filoC * 1.1 + filoV * 0.9 + filoD * 0.85 + red + redFina + nodos * 0.5;
    senal += capa * 0.9;

    vec3 col = vec3(0.0);
    // Rojo el cráneo, cyan la mandíbula.
    vec3 tono = mix(u_rojo, u_cyan, mandibula);
    col += tono * senal;
    col += u_cyan * anillos;
    col += u_verde * nodos * 0.18;

    // El ∞ de la frente, en cyan sobre el rojo: es el sello común del archivo
    // y por eso NO toma el color de la zona.
    // El ∞ va DESPUÉS del barrido y con peso propio: es el sello común del
    // archivo — el mismo de THRESHOLD y SIGNAL BLOOM — y si la línea de escaneo
    // se lo lleva por delante, se pierde justo la marca que conecta las tres
    // escenas.
    float inf = 1.0 - smoothstep(0.0, 0.005, abs(infinito(p - vec2(0.0, 0.315), 0.048)));
    col = mix(col, u_cyan * 1.3, inf * (0.72 + 0.28 * sin(t * 1.6)));

    // ── Los cinco tratamientos: el MISMO cráneo, cinco lecturas ────────────
    float m = u_modo;

    // LINEWORK: se queda el trazo y se apaga el relleno.
    float aLine = 1.0 - abs(m - 1.0);
    if (aLine > 0.0) {
        vec3 line = vec3((filoC + filoV) * 1.3 + red * 0.5);
        col = mix(col, line, clamp(aLine, 0.0, 1.0));
    }

    // BITMAP: un bit por celda, umbral ordenado.
    float aBit = 1.0 - abs(m - 2.0);
    if (aBit > 0.0) {
        vec2 cel = floor(gl_FragCoord.xy / 3.0);
        float umbral = hash21(cel);
        float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
        vec3 bit = vec3(step(umbral * 0.85, l));
        col = mix(col, bit, clamp(aBit, 0.0, 1.0));
    }

    // THERMAL: la misma señal leída como temperatura.
    float aTh = 1.0 - abs(m - 3.0);
    if (aTh > 0.0) {
        float l = clamp(dot(col, vec3(0.2126, 0.7152, 0.0722)) * 1.6, 0.0, 1.0);
        vec3 term = mix(vec3(0.04, 0.0, 0.28), vec3(0.9, 0.0, 0.65), smoothstep(0.0, 0.45, l));
        term = mix(term, vec3(1.0, 0.75, 0.1), smoothstep(0.45, 0.8, l));
        term = mix(term, vec3(1.0), smoothstep(0.82, 1.0, l));
        col = mix(col, term * step(0.02, l), clamp(aTh, 0.0, 1.0));
    }

    // GLITCH: corrimiento por bandas y separación de canal. Es el mismo
    // vocabulario que SIGNAL BLOOM — los dos capítulos comparten esta ruptura.
    float aGl = max(1.0 - abs(m - 4.0), smoothstep(2.6, 3.0, u_proto));
    if (aGl > 0.0) {
        float banda = floor(uv.y * 38.0);
        float s = hash21(vec2(banda, floor(t * 12.0)));
        float activa = step(0.74, s);
        float corr = (s - 0.5) * 1.1 * activa * aGl;
        col.r *= 1.0 + corr;
        col.b *= 1.0 - corr;
        col += vec3(activa * aGl * 0.05 * ruido(uv * 60.0 + t));
    }

    // ── Protocolos ─────────────────────────────────────────────────────────
    // ISOLATE apaga el fondo y deja el espécimen solo. REVEAL abre la capa
    // interna. ARCHIVE lo apaga a brasa.
    float isolate = smoothstep(0.6, 1.0, u_proto) * (1.0 - smoothstep(1.0, 1.6, u_proto));
    col = mix(col, col * dentro, isolate * 0.85);

    float reveal = smoothstep(1.6, 2.0, u_proto) * (1.0 - smoothstep(2.0, 2.6, u_proto));
    col += u_verde * red * reveal * 0.8;

    float archive = smoothstep(3.4, 4.0, u_proto);
    col = mix(col, col * vec3(0.55, 0.42, 0.38) * 0.7, archive);

    // Grano y viñeta: material de archivo, no render limpio.
    col += (hash21(gl_FragCoord.xy + floor(t * 24.0)) - 0.5) * 0.02;
    col *= clamp(1.22 - r * 0.5, 0.0, 1.0);

    out_color = vec4(max(col, 0.0), 1.0);
}
