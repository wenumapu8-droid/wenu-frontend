#version 330 core

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

#define MAX_STEPS 118
#define FAR_CLIP 34.0
#define EPSILON 0.0012

mat2 rot(float a) {
    float c = cos(a);
    float s = sin(a);
    return mat2(c, -s, s, c);
}

float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32 + u_seed);
    return fract(p.x * p.y);
}

float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdRoundBox(vec3 p, vec3 b, float r) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

float opSmoothUnion(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

vec3 repeatZ(vec3 p, float span) {
    p.z = mod(p.z + 0.5 * span, span) - 0.5 * span;
    return p;
}

float impossibleModule(vec3 p, float t) {
    float aware = smoothstep(0.0, 1.0, u_state);
    float openState = smoothstep(1.0, 2.0, u_state) * u_progress;

    // Two incompatible spatial biases coexist.
    float pointerBias = (u_pointer.x - 0.5) * 1.4;
    float phase = sin(p.y * 1.75 + p.z * 0.52 + t * 0.33 + pointerBias);
    float blend = 0.5 + 0.5 * phase;

    vec3 leftField = p;
    leftField.x += p.z * (0.22 + 0.12 * aware);
    leftField.z -= p.x * 0.10;

    vec3 rightField = p;
    rightField.z -= p.x * (0.22 + 0.12 * aware);
    rightField.x += p.z * 0.10;

    vec3 q = mix(leftField, rightField, blend);

    // Spatial folding makes the same structure appear to turn in two directions.
    q.xz = rot(0.13 * sin(t * 0.21 + q.y) + pointerBias * 0.06) * q.xz;
    q.xy = rot(0.05 * sin(q.z * 0.9 - t * 0.17)) * q.xy;

    // OPEN state separates the architecture into contradictory branches.
    float branch = smoothstep(0.0, 3.0, abs(q.z));
    q.x -= sign(q.x + 0.0001) * branch * openState * 0.78;
    q.y += sin(q.z * 0.8 + t) * openState * 0.12;

    // Interlocking beams.
    float beamX = sdRoundBox(
        q - vec3(0.0, 0.72, 0.0),
        vec3(1.78, 0.115, 0.115),
        0.035
    );

    float beamY = sdRoundBox(
        q - vec3(-1.63, -0.22, 0.0),
        vec3(0.115, 1.06, 0.115),
        0.035
    );

    float beamZ = sdRoundBox(
        q - vec3(0.0, -1.18, 0.0),
        vec3(0.115, 0.115, 1.78),
        0.035
    );

    vec3 q2 = q;
    q2.xy = rot(1.5707963) * q2.xy;
    q2.yz = rot(0.22 * sin(t * 0.11)) * q2.yz;

    float counterBeam = sdRoundBox(
        q2 - vec3(0.0, 0.46, 0.18),
        vec3(1.28, 0.10, 0.10),
        0.03
    );

    float structure = min(min(beamX, beamY), min(beamZ, counterBeam));

    // A hovering core gives the structure a ritual-machine center.
    float core = length(q * vec3(1.0, 1.15, 1.0)) - (0.26 + u_audioLow * 0.06);
    structure = opSmoothUnion(structure, core, 0.075);

    return structure;
}

float mapScene(vec3 p, float t) {
    float openState = smoothstep(1.0, 2.0, u_state) * u_progress;

    // Infinite architectural recurrence.
    vec3 repeated = repeatZ(p + vec3(0.0, 0.0, t * (0.16 + openState * 0.48)), 5.25);
    float architecture = impossibleModule(repeated, t);

    // Reactive membrane/floor.
    float radial = length(p.xz - vec2((u_pointer.x - 0.5) * 1.7, 0.0));
    float wave = sin(radial * 6.5 - t * 2.1) * exp(-radial * 0.72);
    float floorY = -1.68 + wave * (0.04 + u_audioLow * 0.13);
    float floorDist = p.y - floorY;

    // Thin ceiling field to reinforce enclosure.
    float ceiling = 2.65 - p.y;

    return min(architecture, min(floorDist, ceiling));
}

vec3 getNormal(vec3 p, float t) {
    vec2 e = vec2(EPSILON, 0.0);
    float d = mapScene(p, t);
    return normalize(vec3(
        mapScene(p + e.xyy, t) - d,
        mapScene(p + e.yxy, t) - d,
        mapScene(p + e.yyx, t) - d
    ));
}

float raymarch(vec3 ro, vec3 rd, float t, out vec3 hitPoint, out int stepsUsed) {
    float distanceTravelled = 0.0;
    stepsUsed = 0;

    float maxStepFloat = mix(62.0, 112.0, clamp(u_quality, 0.0, 1.0));

    for (int i = 0; i < MAX_STEPS; i++) {
        if (float(i) > maxStepFloat) break;

        vec3 p = ro + rd * distanceTravelled;
        float distanceToScene = mapScene(p, t);

        stepsUsed = i;

        if (distanceToScene < EPSILON || distanceTravelled > FAR_CLIP) {
            hitPoint = p;
            break;
        }

        distanceTravelled += distanceToScene * 0.78;
    }

    return distanceTravelled;
}

float surfaceGrid(vec3 p, vec3 n) {
    vec3 cell = abs(fract(p * 2.7) - 0.5);
    vec3 fw = fwidth(p * 2.7);
    vec3 lines = smoothstep(vec3(0.055) + fw, vec3(0.012), cell);

    // Select grid according to dominant surface orientation.
    vec3 weights = abs(n);
    weights /= max(dot(weights, vec3(1.0)), 0.0001);

    return dot(lines.yzx, weights);
}

vec3 kodexPalette(float energy, float aware, float openState) {
    vec3 dormant = vec3(0.94, 0.94, 0.90);
    vec3 awareColor = vec3(0.12, 0.88, 1.0);
    vec3 openColor = vec3(1.0, 0.08, 0.16);

    vec3 stateColor = mix(dormant, awareColor, aware);
    stateColor = mix(stateColor, openColor, openState);

    return mix(vec3(0.015, 0.018, 0.022), stateColor, clamp(energy, 0.0, 1.0));
}

void main() {
    vec2 frag = gl_FragCoord.xy;
    vec2 uv = (frag * 2.0 - u_resolution.xy) / max(u_resolution.y, 1.0);

    float motion = 1.0 - clamp(u_reducedMotion, 0.0, 1.0);
    float t = u_time * motion;

    float aware = smoothstep(0.0, 1.0, u_state);
    float openState = smoothstep(1.0, 2.0, u_state) * u_progress;

    vec2 pointer = (u_pointer - 0.5) * 2.0;

    vec3 ro = vec3(
        pointer.x * 0.34 * aware,
        0.18 + pointer.y * 0.16 * aware,
        5.9 - openState * 1.1
    );

    vec3 target = vec3(
        pointer.x * 0.48 * aware,
        pointer.y * 0.24 * aware,
        -2.2 - openState * 4.0
    );

    vec3 forward = normalize(target - ro);
    vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
    vec3 up = cross(right, forward);

    float lens = mix(1.42, 1.08, openState);
    vec3 rd = normalize(forward * lens + right * uv.x + up * uv.y);

    vec3 hitPoint = vec3(0.0);
    int stepsUsed = 0;
    float travel = raymarch(ro, rd, t, hitPoint, stepsUsed);

    vec3 color = vec3(0.005, 0.006, 0.008);

    if (travel < FAR_CLIP) {
        vec3 normal = getNormal(hitPoint, t);
        vec3 lightDir = normalize(vec3(-0.4, 0.72, 0.56));

        float diffuse = max(dot(normal, lightDir), 0.0);
        float rim = pow(1.0 - max(dot(normal, -rd), 0.0), 2.2);
        float grid = surfaceGrid(hitPoint, normal);

        float scan = 0.5 + 0.5 * sin(hitPoint.y * 15.0 - t * 2.0);
        float signal = diffuse * 0.50 + rim * 0.72 + grid * 0.68;
        signal += scan * 0.08 * aware;
        signal += u_audioMid * 0.22 + u_audioHigh * rim * 0.34;

        vec3 base = kodexPalette(signal, aware, openState);
        vec3 lineColor = mix(
            vec3(0.78, 0.85, 0.90),
            vec3(0.06, 0.92, 1.0),
            aware
        );
        lineColor = mix(lineColor, vec3(1.0, 0.04, 0.10), openState);

        color = base * (0.22 + diffuse * 0.78);
        color += lineColor * grid * (0.40 + aware * 0.52);
        color += lineColor * rim * (0.22 + openState * 0.55);

        // Depth haze.
        float fog = smoothstep(3.0, FAR_CLIP, travel);
        color = mix(color, vec3(0.004, 0.005, 0.007), fog);
    }

    // Command-grid overlays generated inside the visual field.
    float crosshair =
        smoothstep(0.008, 0.0, abs(uv.x)) * smoothstep(0.7, 0.0, abs(uv.y)) +
        smoothstep(0.008, 0.0, abs(uv.y)) * smoothstep(0.7, 0.0, abs(uv.x));

    float orbital = smoothstep(
        0.010,
        0.0,
        abs(length(uv) - (0.49 + 0.014 * sin(t * 0.23)))
    );

    vec3 uiSignal = mix(vec3(0.1, 0.88, 1.0), vec3(1.0, 0.05, 0.12), openState);
    color += uiSignal * (crosshair * 0.05 + orbital * 0.08 * aware);

    // CRT and analog signal treatment.
    float scanline = 0.965 + 0.035 * sin(frag.y * 3.14159);
    color *= scanline;

    float vignette = smoothstep(1.35, 0.24, dot(uv, uv));
    color *= vignette;

    float noise = hash21(frag + floor(t * 12.0)) - 0.5;
    color += noise * (0.016 + u_audioHigh * 0.012);

    // OPEN flash: the structure becomes a navigable aperture.
    color += vec3(1.0, 0.08, 0.12)
        * openState
        * pow(max(0.0, 1.0 - length(uv)), 5.0)
        * 0.56;

    color = pow(max(color, 0.0), vec3(0.92));
    // FIX · `u_intensity` estaba declarado y nunca usado. Conectarlo es cumplir
    // el contrato que el shader publica: un uniform que no responde manda a
    // buscar el problema donde no está. Tercer y cuarto archivo del lab con el
    // mismo defecto.
    color *= clamp(u_intensity, 0.0, 4.0);

    fragColor = vec4(color, 1.0);
}
