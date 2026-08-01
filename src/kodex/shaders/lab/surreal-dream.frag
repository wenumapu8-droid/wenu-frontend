#version 330 core

/**
 * KODEX-∞ · SURREAL DREAM
 *
 * El escenario. No la obra — el escenario.
 *
 * La referencia es el show de Argy en Tomorrowland: un espacio que no puede
 * existir. Corredores que se doblan sobre sí mismos, escaleras que suben en
 * cuatro direcciones a la vez, cuerpos flotando sin sostén, el fondo entero
 * respirando como una ilusión óptica. Monocromo, un solo acento, y una
 * profundidad de cine que incomoda un poco.
 *
 * La distinción que ordena todo este archivo: **el sistema puede deformar sus
 * escenarios, pero no la obra.** Acá se deforma todo lo que se quiera; la
 * pieza de Ocín se ve fiel y sólo se trata si alguien lo pide.
 *
 * Cómo se construye lo imposible, que es lo interesante:
 *
 *  · El corredor se REPITE en Z y se TUERCE con la distancia. La repetición
 *    hace que no tenga final; la torsión hace que la salida nunca esté donde
 *    la perspectiva promete. Es el truco de Escher hecho con distancias.
 *  · Las escaleras se repiten en ÁNGULO alrededor del eje de avance, así que
 *    "arriba" apunta a cuatro lados al mismo tiempo.
 *  · Los cuerpos flotantes derivan con senos de períodos primos entre sí: el
 *    conjunto nunca vuelve a la misma posición, y por eso no se lee como un
 *    bucle. Un bucle detectable mata lo onírico en dos vueltas.
 *  · El op-art no es una textura pegada: es el ESPACIO el que ondula antes de
 *    marchar el rayo. Por eso las líneas se curvan con la geometría en vez de
 *    resbalar por encima.
 */

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform float u_delta;
uniform vec2  u_resolution;
uniform vec2  u_pointer;

uniform float u_audioLow;
uniform float u_audioMid;
uniform float u_audioHigh;

uniform float u_state;
uniform float u_progress;
uniform float u_intensity;
uniform float u_seed;
uniform float u_reducedMotion;
uniform float u_quality;

/*
 * NO se declara `u_kdxTint` acá.
 *
 * La etapa GRADE que el runtime inyecta después de este código ya lo declara,
 * y GLSL no perdona la redefinición: el shader no compilaba y el campo caía en
 * silencio al vórtice de siempre. La sonda del proyecto lo dijo con nombre y
 * línea — `0:308: 'u_kdxTint' : redefinition` — que es exactamente para lo que
 * está.
 *
 * Y está bien que sea así, porque es la arquitectura: **este shader entrega
 * ESTRUCTURA en escala de grises y el grade pone el COLOR.** De ahí sale la
 * coherencia sin que el escenario tenga que saber de qué color es la escena.
 * El acento viaja como luz extra en el filo; el grade lo tiñe.
 */

#define FAR 42.0
#define EPS 0.0016

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

float hash11(float p) {
    p = fract(p * 0.1031 + u_seed * 0.017);
    p *= p + 33.33;
    return fract(p * (p + p));
}

float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdSphere(vec3 p, float r) { return length(p) - r; }

/** Losa fina: el "panel suspendido" del vocabulario. */
float sdSlab(vec3 p, vec2 s, float t) { return sdBox(p, vec3(s.x, s.y, t)); }

/** Unión suave — dos cuerpos que se tocan se funden en vez de cortarse. */
float suave(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

/**
 * El corredor imposible.
 *
 * Una caja hueca repetida sin fin, que se tuerce a medida que se aleja. La
 * torsión es lo que rompe la perspectiva: el ojo espera un punto de fuga y
 * encuentra que el fondo se corrió de lado.
 */
float corredor(vec3 p, float t) {
    // Torsion progresiva con la profundidad. El termino de audio hace que la
    // arquitectura misma respire con el sonido, no una capa encima.
    float giro = p.z * (0.085 + u_audioLow * 0.05) + t * 0.06;
    p.xy *= rot(giro);

    // Repeticion en Z: sin final. El corredor no lleva a ningun lado porque no
    // hay ningun lado al que llevar.
    vec3 q = p;
    q.z = mod(q.z + 4.0, 8.0) - 4.0;

    // Paredes: la caja hueca es la resta de una interior a una exterior.
    float fuera = -sdBox(q, vec3(2.6, 2.2, 4.4));
    float marco = sdBox(q, vec3(2.72, 2.32, 0.16));

    return min(fuera, marco);
}

/**
 * Las escaleras de cuatro gravedades.
 *
 * Se repiten en angulo alrededor del eje de avance: el mismo tramo aparece
 * a las 12, las 3, las 6 y las 9, cada uno con su propio "abajo". Ninguna es
 * mas verdadera que las otras, que es exactamente el chiste de Escher.
 */
float escaleras(vec3 p, float t) {
    float a = atan(p.y, p.x);
    float rad = length(p.xy);

    // Cuatro sectores. Se dobla el angulo al sector y se vuelve a cartesianas.
    float sector = 6.2831853 / 4.0;
    a = mod(a + sector * 0.5, sector) - sector * 0.5;
    vec3 q = vec3(cos(a) * rad, sin(a) * rad, p.z);

    // Peldanos: cajas escalonadas que suben mientras avanzan.
    float paso = 1.05;
    float i = floor(q.z / paso);
    q.z = mod(q.z, paso) - paso * 0.5;
    q.x -= 1.95 + mod(i, 6.0) * 0.085;

    float d = sdBox(q, vec3(0.34, 0.055, 0.42));

    // Se desvanecen con la distancia para que el corredor respire.
    return d + smoothstep(10.0, 26.0, abs(p.z)) * 1.4;
}

/**
 * Los cuerpos flotantes.
 *
 * Esferas, losas y una silueta alargada que derivan lento y sin peso. Los
 * periodos de los senos son primos entre si a proposito: el conjunto no
 * vuelve a repetir la misma configuracion, y sin repeticion detectable el
 * espacio se lee soñado y no programado.
 */
float flotantes(vec3 p, float t) {
    float d = FAR;

    for (int i = 0; i < 5; i++) {
        float fi = float(i);
        float s = hash11(fi * 7.7);

        // Deriva: tres senos de periodo distinto por eje.
        vec3 c = vec3(
            sin(t * 0.11 + fi * 2.1) * (1.5 + s),
            cos(t * 0.07 + fi * 1.3) * 1.15,
            mod(fi * 5.3 - t * 0.55, 26.0) - 13.0
        );

        vec3 q = p - c;
        q.xz *= rot(t * 0.09 + fi);
        q.xy *= rot(t * 0.05 + fi * 0.6);

        // Alternan esfera y losa: cuerpos y paneles, no una sola familia.
        float cuerpo = (mod(fi, 2.0) < 0.5)
            ? sdSphere(q, 0.30 + s * 0.24)
            : sdSlab(q, vec2(0.62 + s * 0.4, 0.86), 0.014);

        d = suave(d, cuerpo, 0.34);
    }

    return d;
}

float mapa(vec3 p, float t) {
    // El espacio ONDULA antes de que el rayo lo recorra: por eso las lineas se
    // curvan CON la geometria en vez de resbalar por encima. Es la diferencia
    // entre op-art y una calcomania de op-art.
    float amp = 0.10 + u_audioMid * 0.14;
    p.x += sin(p.z * 0.62 + t * 0.5) * amp;
    p.y += cos(p.z * 0.47 - t * 0.37) * amp * 0.8;

    float d = corredor(p, t);
    d = min(d, escaleras(p, t));
    d = min(d, flotantes(p, t));
    return d;
}

vec3 normal(vec3 p, float t) {
    vec2 e = vec2(1.0, -1.0) * 0.0016;
    return normalize(
        e.xyy * mapa(p + e.xyy, t) +
        e.yyx * mapa(p + e.yyx, t) +
        e.yxy * mapa(p + e.yxy, t) +
        e.xxx * mapa(p + e.xxx, t)
    );
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / max(u_resolution.y, 1.0);

    float mov = 1.0 - clamp(u_reducedMotion, 0.0, 1.0);
    float t = u_time * mov;
    float despierto = smoothstep(0.0, 1.0, u_state);
    vec2 pt = (u_pointer - 0.5) * 2.0;

    // Camara: avanza sin llegar. El puntero la inclina apenas — lo justo para
    // que el espacio se sienta habitado y no filmado.
    vec3 ro = vec3(pt.x * 0.42 * despierto, pt.y * 0.26 * despierto, -t * 1.15);
    vec3 ta = ro + vec3(pt.x * 0.3, pt.y * 0.18, -2.0);

    vec3 f = normalize(ta - ro);
    vec3 r = normalize(cross(f, vec3(0.0, 1.0, 0.0)));
    vec3 u = cross(r, f);
    // Lente larga: comprime la profundidad y da el aire de cine.
    vec3 rd = normalize(f * 1.55 + r * uv.x + u * uv.y);

    // Pasos segun el perfil de la maquina. El equipo con el que se revisa este
    // proyecto es lento; marchar de mas ahi cuesta la fluidez entera.
    int pasos = int(mix(54.0, 96.0, clamp(u_quality, 0.0, 1.0)));

    float dist = 0.0;
    float d = 0.0;
    vec3 pos = ro;
    bool toco = false;

    for (int i = 0; i < 96; i++) {
        if (i >= pasos) break;
        pos = ro + rd * dist;
        d = mapa(pos, t);
        if (d < EPS * (1.0 + dist * 0.45)) { toco = true; break; }
        if (dist > FAR) break;
        dist += d * 0.82;
    }

    // Monocromo: el negro es el material del archivo.
    vec3 color = vec3(0.004);
    float acento = 0.0;

    if (toco) {
        vec3 n = normal(pos, t);
        vec3 luz = normalize(vec3(-0.35, 0.78, -0.5));

        float dif = max(dot(n, luz), 0.0);
        float borde = pow(1.0 - max(dot(n, -rd), 0.0), 2.4);

        // El op-art sobre la superficie: dos rejillas de frecuencia parecida
        // que baten entre si. Lo que se dibuja NO es el gris del batido sino
        // el LUGAR donde el batido cruza cero — lineas finas y brillantes.
        //
        // Esto no es una eleccion estetica solamente. La cadena de grade que
        // corre despues esta afinada para hilos cerca de 1.0 sobre negro, como
        // el vortice: aplasta cualquier gris medio hasta apagarlo. Un shader
        // que entrega paredes grises compila, corre, y se ve negro. Entregar
        // filo brillante sobre negro es hablar el idioma del sistema —  y de
        // paso es el negro dominante que pide el canon.
        float a1 = sin(pos.x * 7.5 + pos.z * 2.1 + t * 0.7);
        float a2 = sin(pos.y * 7.1 - pos.z * 2.4 - t * 0.5);
        float moire = a1 * a2;
        float lineas = 1.0 - smoothstep(0.0, 0.075, abs(moire));

        // El filo de la geometria: donde la superficie se va de canto. Es lo
        // que dibuja la arquitectura imposible — las aristas del corredor, el
        // contorno de los cuerpos flotantes.
        float filo = pow(borde, 1.5);

        float niebla = exp(-dist * 0.085);

        float senal = filo * 1.45 + lineas * dif * 0.95;
        // Un relleno apenas perceptible para que las caras existan como
        // volumen y no como marcos flotando en el vacio.
        senal += dif * 0.07;
        senal += u_audioHigh * filo * 0.5;
        senal *= niebla;
        senal = clamp(senal, 0.0, 1.7);

        color = vec3(senal);

        // EL acento, y uno solo: vive en el filo y en el latido grave. Repartirlo
        // por toda la imagen lo convertiria en un tinte, y el encargo pide
        // monocromo con un acento, que no es lo mismo.
        acento = borde * (0.5 + u_audioLow * 0.7) * niebla;
    } else {
        // El horizonte imposible: no hay suelo ni cielo, solo una banda que
        // insinua un fondo que no existe.
        float banda = exp(-abs(uv.y + 0.12) * 5.5) * 0.05;
        color = vec3(banda);
    }

    // Vineta de cine.
    float vin = 1.0 - dot(uv * 0.62, uv * 0.62);
    color *= clamp(vin, 0.0, 1.0);

    // Grano: el sistema tiene textura de material, no de render limpio.
    float grano = hash11(gl_FragCoord.x + gl_FragCoord.y * 511.0 + floor(t * 24.0)) - 0.5;
    color += grano * 0.016;

    color *= clamp(u_intensity, 0.0, 2.0);

    // El acento entra como LUZ, no como color: se suma al filo y el grade — que
    // corre después — lo tiñe con el acento de la escena. Así el escenario se
    // lee monocromo y el color aparece sólo en el borde, que es como se
    // comporta en la referencia, y encima queda coherente con la lámina sin
    // que este shader tenga que enterarse de nada.
    color += vec3(acento) * 0.55;

    fragColor = vec4(max(color, 0.0), 1.0);
}
