#version 300 es
precision highp float;
precision highp int;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform float u_delta;
uniform vec2  u_resolution;
uniform vec2  u_pointer;
uniform vec2  u_pointerVelocity;

uniform float u_audioLow;
uniform float u_audioMid;
uniform float u_audioHigh;

uniform float u_state;
uniform float u_progress;
uniform float u_intensity;
uniform float u_seed;
uniform float u_reducedMotion;
uniform float u_quality;

uniform float u_impactAge;
uniform vec2  u_impactOrigin;

#define PI 3.14159265358979323846

float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32 + u_seed);
    return fract(p.x * p.y);
}

float noise21(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float ripple(vec2 p, vec2 origin, float age, float frequency, float speed, float decay) {
    float d = length(p - origin);
    float phase = d * frequency - age * speed;
    float envelope = exp(-d * decay) * exp(-age * 0.18);
    return sin(phase) * envelope;
}

vec2 screenToWorld(vec2 uv) {
    // Approximate world-space point on the visible membrane.
    float z = mix(1.2, -7.5, clamp(uv.y, 0.0, 1.0));
    float width = mix(1.2, 6.4, clamp(1.0 - uv.y, 0.0, 1.0));
    return vec2((uv.x - 0.5) * width * 2.0, z);
}

float heightField(vec2 xz, float t, float awareness, float openState) {
    vec2 pointerWorld = screenToWorld(u_pointer);
    vec2 impactWorld = screenToWorld(u_impactOrigin);

    float baseBreath =
        sin(length(xz) * 1.35 - t * 0.72)
        * exp(-length(xz) * 0.12)
        * (0.025 + u_audioLow * 0.075);

    float pointerWave =
        ripple(
            xz,
            pointerWorld,
            t * 0.55,
            4.5 + u_audioMid * 2.0,
            2.35 + u_audioMid * 1.7,
            0.34
        )
        * awareness
        * (0.05 + length(u_pointerVelocity) * 0.30);

    float impactWave =
        ripple(
            xz,
            impactWorld,
            max(u_impactAge, 0.0),
            6.8,
            4.7,
            0.23
        )
        * step(0.0, u_impactAge)
        * (0.15 + u_audioLow * 0.12);

    float secondary =
        ripple(
            xz,
            vec2(-2.8, -3.2),
            t * 0.35 + 1.7,
            3.8,
            1.7,
            0.28
        )
        * awareness
        * 0.045;

    float micro =
        (noise21(xz * 0.55 + t * 0.05) - 0.5)
        * (0.012 + u_audioHigh * 0.022)
        * awareness;

    // OPEN state creates a central gravitational sink.
    float centerDistance = length(xz - vec2(0.0, -2.8));
    float sink =
        -exp(-centerDistance * centerDistance * 0.34)
        * openState
        * 0.72;

    float rim =
        exp(-abs(centerDistance - mix(0.55, 2.15, openState)) * 7.0)
        * openState
        * (0.10 + u_audioLow * 0.10);

    return baseBreath + pointerWave + impactWave + secondary + micro + sink + rim;
}

vec3 heightNormal(vec2 xz, float t, float awareness, float openState) {
    float e = mix(0.035, 0.018, clamp(u_quality, 0.0, 1.0));
    float h = heightField(xz, t, awareness, openState);
    float hx = heightField(xz + vec2(e, 0.0), t, awareness, openState);
    float hz = heightField(xz + vec2(0.0, e), t, awareness, openState);

    return normalize(vec3(h - hx, e, h - hz));
}

float gridLine(float value, float scale, float width) {
    float coordinate = value * scale;
    float local = abs(fract(coordinate) - 0.5);
    float derivative = max(fwidth(coordinate), 0.0001);
    return 1.0 - smoothstep(width, width + derivative * 1.7, local);
}

float majorGrid(float value, float scale) {
    float coordinate = value * scale;
    float local = abs(fract(coordinate) - 0.5);
    float derivative = max(fwidth(coordinate), 0.0001);
    return 1.0 - smoothstep(0.455, 0.455 + derivative * 1.2, local);
}

void main() {
    vec2 frag = gl_FragCoord.xy;
    vec2 uv = (frag * 2.0 - u_resolution.xy) / max(u_resolution.y, 1.0);

    float motion = 1.0 - clamp(u_reducedMotion, 0.0, 1.0);
    float t = u_time * motion;

    float awareness = smoothstep(0.0, 1.0, u_state);
    float openState = smoothstep(1.0, 2.0, u_state) * u_progress;

    vec2 pointer = (u_pointer - 0.5) * 2.0;

    // Camera and ray.
    vec3 ro = vec3(
        pointer.x * 0.32 * awareness,
        2.65 + pointer.y * 0.18 * awareness,
        4.3 - openState * 0.85
    );

    vec3 target = vec3(
        pointer.x * 0.48 * awareness,
        -0.55 - openState * 0.30,
        -3.7 - openState * 2.5
    );

    vec3 forward = normalize(target - ro);
    vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
    vec3 up = cross(right, forward);

    float lens = mix(1.28, 1.06, openState);
    vec3 rd = normalize(forward * lens + right * uv.x + up * uv.y);

    vec3 color = vec3(0.004, 0.006, 0.008);

    // Iterative intersection against a displaced height field.
    float travel = (-1.15 - ro.y) / min(rd.y, -0.001);
    bool hit = false;
    vec3 p = vec3(0.0);

    for (int i = 0; i < 9; i++) {
        p = ro + rd * travel;
        float h = -1.15 + heightField(p.xz, t, awareness, openState);
        float correction = (h - p.y) / min(rd.y, -0.001);
        travel += correction * 0.84;

        if (abs(h - p.y) < 0.0028) {
            hit = true;
        }
    }

    if (travel > 0.0 && travel < 45.0) {
        hit = true;
    }

    if (hit) {
        p = ro + rd * travel;

        float h = heightField(p.xz, t, awareness, openState);
        vec3 normal = heightNormal(p.xz, t, awareness, openState);

        // Bend grid coordinates according to local height.
        vec2 warped = p.xz;
        warped.x += h * 0.62 + sin(p.z * 0.32 + t * 0.2) * h * 0.15;
        warped.y += h * 0.38;

        float minorX = gridLine(warped.x, 1.15, 0.455);
        float minorZ = gridLine(warped.y, 1.15, 0.455);
        float majorX = majorGrid(warped.x, 0.23);
        float majorZ = majorGrid(warped.y, 0.23);

        float grid = max(minorX, minorZ);
        float major = max(majorX, majorZ);

        vec3 lightDir = normalize(vec3(-0.55, 0.80, 0.42));
        float diffuse = max(dot(normal, lightDir), 0.0);
        float rim = pow(1.0 - max(dot(normal, -rd), 0.0), 2.4);

        float pulse =
            0.5 + 0.5 * sin(length(p.xz) * 3.0 - t * 2.2);

        vec3 dormantColor = vec3(0.68, 0.74, 0.76);
        vec3 awareColor = vec3(0.02, 0.92, 1.0);
        vec3 openColor = vec3(1.0, 0.05, 0.14);

        vec3 signalColor = mix(dormantColor, awareColor, awareness);
        signalColor = mix(signalColor, openColor, openState);

        vec3 base = vec3(0.008, 0.014, 0.018);
        base += vec3(0.018, 0.040, 0.052) * diffuse;

        color = base;
        color += signalColor * grid * (0.22 + diffuse * 0.72);
        color += signalColor * major * (0.38 + rim * 0.44);
        color += signalColor * rim * (0.08 + awareness * 0.18);
        color += signalColor * pulse * abs(h) * 0.32;

        // Bright impact ring.
        vec2 impactWorld = screenToWorld(u_impactOrigin);
        float impactDistance = length(p.xz - impactWorld);
        float impactRadius = max(u_impactAge, 0.0) * 2.15;
        float impactRing =
            exp(-abs(impactDistance - impactRadius) * 12.0)
            * exp(-max(u_impactAge, 0.0) * 0.42)
            * step(0.0, u_impactAge);

        color += vec3(0.90, 0.97, 1.0) * impactRing * 0.62;

        // OPEN aperture.
        float centerDistance = length(p.xz - vec2(0.0, -2.8));
        float apertureRadius = mix(0.05, 1.85, openState);
        float aperture =
            1.0 - smoothstep(apertureRadius - 0.16, apertureRadius, centerDistance);

        float apertureRim =
            exp(-abs(centerDistance - apertureRadius) * 9.5)
            * openState;

        color *= 1.0 - aperture * openState * 0.95;
        color += vec3(1.0, 0.04, 0.12) * apertureRim * 1.15;

        // Distance fog.
        float fog = smoothstep(9.0, 32.0, travel);
        color = mix(color, vec3(0.003, 0.004, 0.006), fog);
    }

    // Horizon signal.
    float horizon = exp(-abs(uv.y - 0.11) * 18.0);
    color += mix(
        vec3(0.02, 0.18, 0.22),
        vec3(0.55, 0.03, 0.08),
        openState
    ) * horizon * (0.04 + awareness * 0.08);

    // HUD target over pointer.
    vec2 pointerUv = (u_pointer - 0.5) * vec2(
        u_resolution.x / max(u_resolution.y, 1.0),
        1.0
    ) * 2.0;

    float targetDistance = length(uv - pointerUv);
    float targetRing =
        1.0 - smoothstep(
            0.006,
            0.014,
            abs(targetDistance - 0.055 - length(u_pointerVelocity) * 0.03)
        );

    color += vec3(0.02, 0.92, 1.0)
        * targetRing
        * awareness
        * 0.20;

    // CRT finish.
    float scanline = 0.965 + 0.035 * sin(frag.y * PI);
    color *= scanline;

    float vignette = smoothstep(1.42, 0.20, dot(uv, uv));
    color *= vignette;

    float grain = hash21(frag + floor(t * 12.0)) - 0.5;
    color += grain * (0.012 + u_audioHigh * 0.014);

    // FIX · `u_intensity` estaba DECLARADO Y NUNCA USADO.
    //
    // No es un agregado: es cumplir el contrato que el propio shader publica.
    // Un uniform declarado que no hace nada es peor que no tenerlo — quien lo
    // ajusta ve que el número no responde y se pone a buscar el problema en
    // otro lado. Me pasó tres veces con este archivo.
    //
    // Va al final, sobre el color ya compuesto, para que atenúe la pieza
    // entera y no una capa suelta.
    color *= clamp(u_intensity, 0.0, 4.0);

    color = pow(max(color, 0.0), vec3(0.92));
    fragColor = vec4(color, 1.0);
}
