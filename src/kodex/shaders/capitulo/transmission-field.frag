#version 300 es
precision highp float;

/**
 * KODEX-∞ · SIGNAL BLOOM · TRANSMISSION FIELD (hero del capítulo)
 *
 * El panel 06 del plano, ejecutado.
 *
 * El póster trae su propio pseudocódigo y este shader **lo corre tal cual**:
 * `pulse`, `n = fbm(uv*3 + time*0.1)`, `bloom = pow(max(n - THRESHOLD, 0), 2)`,
 * `field = length(uv)*2 + sin(field*8 - time)*0.1`,
 * `col = mix(COLOR_A, COLOR_B, bloom) + pulse*0.2`, `glitch()`,
 * `scanlines(1024)`. Los cuatro umbrales del panel — 0.80 / 0.55 / 0.30 / 0.75
 * — son los cuatro estados, y son lo único que cambia entre ellos.
 *
 * Lo que el plano describe pero no escribe, y hay que resolver:
 *
 *  · **Simetría radial.** El campo es un mandala de pliegues espejados. Se
 *    consigue plegando el ÁNGULO antes de muestrear el ruido: el mismo fbm
 *    leído en coordenadas plegadas sale simétrico. Espejar la imagen después
 *    dejaría una costura visible en cada pliegue.
 *  · **Filamentos finos.** Un fbm crudo da manchas. Lo que hace el filamento es
 *    la cresta — `1 - |2n - 1|` elevado —, que ilumina sólo donde el ruido
 *    cruza su valor medio. De ahí salen hilos en vez de nubes.
 *  · **Que FLOREZCA desde el núcleo.** El umbral no es constante en el radio:
 *    sube hacia el borde, así la estructura nace en el centro y avanza hacia
 *    afuera cuando el estado la deja crecer. Con umbral plano el mandala
 *    aparecería entero de golpe, que no es florecer.
 *
 * Este shader NO pasa por la etapa GRADE del motor de campos, y por eso corre
 * en su propio runtime: **la paleta del capítulo es exacta y la manda el
 * plano**, y el grade la reescribiría con el acento de la escena.
 */

out vec4 out_color;

uniform float u_time;
uniform vec2  u_res;

/** El bus de audio del sistema. */
uniform float u_low;
uniform float u_mid;
uniform float u_high;

/** Estado interpolado: 0 IDLE · 1 BUILD · 2 BLOOM · 3 DISPERSE. */
uniform float u_estado;
/** THRESHOLD del panel 06, ya interpolado entre estados por el runtime. */
uniform float u_threshold;
/** Cuánto glitch. Sólo DISPERSE lo levanta. */
uniform float u_glitch;
uniform float u_reduced;

uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec3 u_colorCore;

#define TAU 6.28318530718
#define BPM 2.1
#define SPEED 1.0
#define SCALE 1.0
/** Pliegues del mandala. Doce, dentro del rango 6–12 que pide el plano. */
#define FOLDS 12.0

float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float ruido(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

/** fbm del panel 06. Cinco octavas: con menos se ve pobre, con más no se nota. */
float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
        v += amp * ruido(p);
        p *= 2.03;
        amp *= 0.5;
    }
    return v;
}

/** Cresta: convierte una nube en un filamento. */
float cresta(float n) {
    return pow(1.0 - abs(2.0 * n - 1.0), 3.0);
}

/** Pliegue caleidoscópico. La simetría se hace ACÁ, no sobre la imagen. */
vec2 plegar(vec2 uv) {
    float r = length(uv);
    float a = atan(uv.y, uv.x);
    float sector = TAU / FOLDS;
    a = mod(a, sector);
    // El espejo dentro del sector: sin esto los pliegues rotan pero no reflejan.
    a = abs(a - sector * 0.5);
    return vec2(cos(a), sin(a)) * r;
}

/** glitch() del panel 06: corrimiento por bandas. */
vec3 glitch(vec3 col, vec2 uv, float t) {
    if (u_glitch < 0.01) return col;
    float banda = floor(uv.y * 42.0);
    float s = hash21(vec2(banda, floor(t * 11.0)));
    // Sólo algunas bandas se corren. Si se corrieran todas sería una distorsión
    // uniforme, que se lee como efecto y no como interferencia.
    float activa = step(0.82 - u_glitch * 0.30, s);
    float corr = (s - 0.5) * 0.9 * u_glitch * activa;
    col.r = mix(col.r, col.r * (1.0 + corr), activa);
    col.b = mix(col.b, col.b * (1.0 - corr), activa);
    return col;
}

/** scanlines(col, uv, 1024.0) del panel 06. */
vec3 scanlines(vec3 col, vec2 uv, float n) {
    float s = 0.5 + 0.5 * sin(uv.y * n * 3.14159);
    return col * (0.87 + 0.13 * s);
}

void main() {
    float mov = 1.0 - clamp(u_reduced, 0.0, 1.0);
    float time = u_time * SPEED * mov;

    // uv centrado y con proporción corregida: un mandala en un lienzo apaisado
    // tiene que seguir siendo redondo.
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / max(u_res.y, 1.0);
    uv *= SCALE;

    float pulse = sin(time * BPM) * 0.5 + 0.5;
    // El latido del reloj y el del audio se mezclan: con sonido el campo
    // respira con la música; sin sonido, respira solo.
    float latido = mix(pulse, clamp(u_low, 0.0, 1.0), 0.55);

    float r = length(uv);
    vec2 fold = plegar(uv);

    // n = fbm(uv * 3.0 + time * 0.1)
    float n = fbm(fold * 3.0 + vec2(time * 0.1));
    // La cresta hace el filamento; una segunda capa más fina agrega el detalle
    // fractal sin volver a pagar cinco octavas.
    float fil = cresta(n) * 0.72 + cresta(fbm(fold * 7.0 - vec2(time * 0.07))) * 0.28;

    // El umbral sube con el radio: la estructura nace en el núcleo y florece
    // hacia afuera.
    float th = u_threshold * 0.62 + r * 0.10 - latido * 0.05 - u_mid * 0.04;

    // bloom = pow(max(n - THRESHOLD, 0.0), 2.0)
    // Ganancia contenida y potencia alta. Con ganancia grande el campo se
    // satura y el mandala se lee como una MANCHA — el plano es de filamentos
    // finos sobre negro, y el negro es parte de la composición, no lo que
    // sobró. La potencia 2.4 corta la falda del filamento y deja el hilo.
    float bloom = pow(max(fil - th, 0.0), 2.4) * 15.0;

    // field = length(uv) * 2.0;  field += sin(field * 8.0 - time) * 0.1
    float field = r * 2.0;
    field += sin(field * 8.0 - time) * 0.1;
    float anillos = pow(max(0.0, 1.0 - field * 0.44), 2.0);

    // col = mix(COLOR_A, COLOR_B, bloom)
    vec3 col = mix(u_colorA, u_colorB, clamp(bloom, 0.0, 1.0));
    col *= clamp(bloom, 0.0, 1.7);

    // El núcleo: la fuente de la que florece todo. CERRADO — en el plano es un
    // punto intenso, no un halo. Abierto se come el centro del mandala y lo
    // que se ve es una bola blanca con estructura alrededor.
    float nucleo = exp(-r * r * (34.0 - latido * 7.0));
    float halo = exp(-r * r * 5.0) * 0.16;
    col += u_colorCore * nucleo * (0.7 + latido * 0.5);
    col += u_colorB * halo * (0.5 + latido * 0.5);

    // Los radios del campo, que en el póster salen del centro.
    float radios = pow(abs(sin(atan(uv.y, uv.x) * FOLDS * 0.5)), 24.0);
    // Los radios se apagan en el centro: ahí manda el núcleo, y superpuestos
    // dibujaban un polígono oscuro justo sobre la fuente.
    col += u_colorA * radios * anillos * smoothstep(0.06, 0.3, r) * 0.3 * (0.45 + u_high);

    // Sin velo de fondo: cualquier suelo de color constante se come el aire
    // negro. Los anillos sólo tocan donde ya hay estructura.
    col += anillos * u_colorB * 0.02 * clamp(bloom, 0.0, 1.0);

    // col += vec3(pulse) * 0.2
    col += vec3(latido) * 0.14 * nucleo;

    // TRANSMIT: un haz que sale del núcleo y se va. Entra con BLOOM.
    float faseT = fract(time * 0.31);
    float haz = exp(-pow((r - faseT * 2.2) * 7.0, 2.0));
    col += u_colorCore * haz * 0.28 * smoothstep(1.2, 2.2, u_estado);

    col = glitch(col, uv, time);
    col = scanlines(col, uv, 1024.0);

    // Viñeta: el campo se apaga contra el negro, que es el fondo del sistema.
    col *= clamp(1.28 - r * 0.56, 0.0, 1.0);

    out_color = vec4(max(col, 0.0), 1.0);
}
