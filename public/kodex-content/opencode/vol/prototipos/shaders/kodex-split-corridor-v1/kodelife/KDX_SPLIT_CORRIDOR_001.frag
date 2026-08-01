#version 330 core

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

uniform float u_branchBias;
uniform float u_branchPulseAge;

#define PI 3.14159265358979323846
#define MAX_STEPS 112
#define FAR_CLIP 42.0
#define EPSILON 0.0014

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

float lineMask(float value, float width, float aa) {
    return 1.0 - smoothstep(width, width + aa, abs(value));
}

float corridorSurface(vec3 q, float t, float signal) {
    // Infinite corridor shell.
    float wall = abs(abs(q.x) - 1.62);
    float floorPlane = abs(q.y + 1.28);
    float ceilingPlane = abs(q.y - 1.28);
    float shell = min(wall, min(floorPlane, ceilingPlane));

    // Repeated structural ribs.
    vec3 ribP = q;
    ribP.z = mod(ribP.z + 1.35, 2.70) - 1.35;
    float rib = abs(sdRoundBox(
        ribP,
        vec3(1.76, 1.42, 0.055 + signal * 0.018),
        0.035
    )) - 0.025;

    // Side conduits.
    vec3 conduitP = q;
    conduitP.y += 0.66;
    conduitP.z = mod(conduitP.z + 0.62, 1.24) - 0.62;
    float conduitLeft = length(conduitP.xy - vec2(-1.46, 0.0)) - 0.055;
    float conduitRight = length(conduitP.xy - vec2(1.46, 0.0)) - 0.055;

    // Ceiling signal spine.
    float spine = length(q.xy - vec2(0.0, 1.12)) - (0.038 + signal * 0.016);

    return min(shell, min(rib, min(spine, min(conduitLeft, conduitRight))));
}

vec3 branchSpace(vec3 p, float side, float split, float t, float awareness) {
    float depth = max(0.0, -p.z - 0.8);
    float reveal = smoothstep(0.0, 1.0, depth / 7.5);

    float chosen = side * u_branchBias;
    float preference = 1.0 + max(chosen, 0.0) * 0.24;

    float divergence =
        side
        * reveal
        * split
        * (2.65 + u_audioLow * 0.42)
        * preference;

    float bend =
        side
        * sin(depth * 0.18 + t * 0.30 + side * 1.7)
        * reveal
        * (0.16 + u_audioMid * 0.30 + awareness * 0.10);

    vec3 q = p;
    q.x -= divergence + bend;

    // Each branch gains its own incompatible heading.
    float angle =
        side
        * reveal
        * split
        * (0.16 + u_audioMid * 0.055)
        + side * u_branchBias * 0.025;

    q.xz = rot(-angle) * q.xz;

    // Slight vertical desynchronization.
    q.y +=
        sin(depth * 0.33 - t * 0.42 + side)
        * reveal
        * awareness
        * 0.045;

    return q;
}

vec2 mapScene(vec3 p, float t, float awareness, float openState) {
    float split = mix(0.0, 0.72, awareness);
    split = mix(split, 1.0, openState);

    vec3 left = branchSpace(p, -1.0, split, t, awareness);
    vec3 right = branchSpace(p, 1.0, split, t, awareness);

    float signal = 0.5 + 0.5 * sin(t * 0.8 + p.z * 0.32);

    float leftDistance = corridorSurface(left, t, signal);
    float rightDistance = corridorSurface(right, t + 1.7, 1.0 - signal);

    vec2 result =
        leftDistance < rightDistance
            ? vec2(leftDistance, 1.0)
            : vec2(rightDistance, 2.0);

    // Central bifurcation blade.
    float depth = max(0.0, -p.z - 0.8);
    float bladeReveal = smoothstep(0.0, 1.0, depth / 5.4) * awareness;
    vec3 bladeP = p - vec3(0.0, -0.05, -4.2);
    bladeP.z = mod(bladeP.z + 2.4, 4.8) - 2.4;

    float blade = sdRoundBox(
        bladeP,
        vec3(0.028 + openState * 0.035, 1.16, 1.10),
        0.02
    );

    if (blade * bladeReveal < result.x) {
        result = vec2(blade * bladeReveal, 3.0);
    }

    // Branch pulse moves toward the horizon after a touch.
    float pulseAge = max(u_branchPulseAge, 0.0);
    float pulseZ = 2.8 - pulseAge * 5.4;
    float pulseSide = sign(u_branchBias + 0.0001);
    vec3 pulseP = branchSpace(p, pulseSide, split, t, awareness);
    float pulse = abs(pulseP.z - pulseZ) - 0.026;
    pulse = max(pulse, abs(pulseP.x) - 1.46);
    pulse = max(pulse, abs(pulseP.y) - 1.12);

    float pulseGate =
        step(0.0, u_branchPulseAge)
        * exp(-pulseAge * 0.58);

    if (pulse * pulseGate < result.x) {
        result = vec2(pulse * pulseGate, 4.0);
    }

    return result;
}

vec3 getNormal(vec3 p, float t, float awareness, float openState) {
    vec2 e = vec2(EPSILON, 0.0);
    float d = mapScene(p, t, awareness, openState).x;

    return normalize(vec3(
        mapScene(p + e.xyy, t, awareness, openState).x - d,
        mapScene(p + e.yxy, t, awareness, openState).x - d,
        mapScene(p + e.yyx, t, awareness, openState).x - d
    ));
}

float raymarch(
    vec3 ro,
    vec3 rd,
    float t,
    float awareness,
    float openState,
    out vec3 hitPoint,
    out float material,
    out int stepsUsed
) {
    float travelled = 0.0;
    material = 0.0;
    stepsUsed = 0;

    float maximumSteps =
        mix(60.0, 108.0, clamp(u_quality, 0.0, 1.0));

    for (int i = 0; i < MAX_STEPS; i++) {
        if (float(i) > maximumSteps) break;

        vec3 p = ro + rd * travelled;
        vec2 scene = mapScene(p, t, awareness, openState);

        stepsUsed = i;

        if (scene.x < EPSILON || travelled > FAR_CLIP) {
            hitPoint = p;
            material = scene.y;
            break;
        }

        travelled += scene.x * 0.76;
    }

    return travelled;
}

float surfaceGrid(vec3 p, vec3 normal) {
    vec3 coordinate = p * vec3(2.2, 2.2, 1.1);
    vec3 local = abs(fract(coordinate) - 0.5);
    vec3 derivative = fwidth(coordinate);

    vec3 lines = 1.0 - smoothstep(
        vec3(0.455) - derivative,
        vec3(0.455),
        local
    );

    vec3 weights = abs(normal);
    weights /= max(dot(weights, vec3(1.0)), 0.0001);

    return dot(lines.yzx, weights);
}

vec3 materialColor(float material, float awareness, float openState) {
    vec3 dormant = vec3(0.78, 0.82, 0.82);
    vec3 leftColor = vec3(0.02, 0.91, 1.0);
    vec3 rightColor = vec3(1.0, 0.06, 0.66);
    vec3 bladeColor = vec3(1.0, 0.08, 0.12);
    vec3 pulseColor = vec3(0.98, 0.98, 0.88);

    vec3 branch =
        material < 1.5
            ? leftColor
            : rightColor;

    branch = mix(dormant, branch, awareness);
    branch = mix(branch, vec3(1.0, 0.07, 0.13), openState * 0.24);

    if (material > 2.5 && material < 3.5) return bladeColor;
    if (material > 3.5) return pulseColor;

    return branch;
}

void main() {
    vec2 frag = gl_FragCoord.xy;
    vec2 uv = (frag * 2.0 - u_resolution.xy) / max(u_resolution.y, 1.0);

    float motion =
        1.0 - clamp(u_reducedMotion, 0.0, 1.0);

    float t = u_time * motion;

    float awareness =
        smoothstep(0.0, 1.0, u_state);

    float openState =
        smoothstep(1.0, 2.0, u_state)
        * u_progress;

    vec2 pointer = (u_pointer - 0.5) * 2.0;

    vec3 ro = vec3(
        pointer.x * 0.26 * awareness,
        0.02 + pointer.y * 0.12 * awareness,
        5.6 - openState * 1.20
    );

    vec3 target = vec3(
        u_branchBias * awareness * 0.60,
        pointer.y * 0.10 * awareness,
        -4.2 - openState * 4.4
    );

    vec3 forward = normalize(target - ro);
    vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
    vec3 up = cross(right, forward);

    float lens = mix(1.34, 1.02, openState);
    vec3 rd = normalize(
        forward * lens + right * uv.x + up * uv.y
    );

    vec3 hitPoint = vec3(0.0);
    float material = 0.0;
    int stepsUsed = 0;

    float travel = raymarch(
        ro,
        rd,
        t,
        awareness,
        openState,
        hitPoint,
        material,
        stepsUsed
    );

    vec3 color = vec3(0.003, 0.004, 0.007);

    if (travel < FAR_CLIP) {
        vec3 normal =
            getNormal(hitPoint, t, awareness, openState);

        vec3 lightDirection =
            normalize(vec3(-0.40, 0.72, 0.56));

        float diffuse =
            max(dot(normal, lightDirection), 0.0);

        float rim =
            pow(
                1.0 - max(dot(normal, -rd), 0.0),
                2.35
            );

        float grid =
            surfaceGrid(hitPoint, normal);

        float scan =
            0.5
            + 0.5
            * sin(hitPoint.z * 1.7 - t * 2.2);

        vec3 signalColor =
            materialColor(material, awareness, openState);

        float choice =
            material < 1.5
                ? max(-u_branchBias, 0.0)
                : max(u_branchBias, 0.0);

        float energy =
            0.18
            + diffuse * 0.62
            + rim * 0.45
            + grid * 0.72
            + scan * awareness * 0.08
            + choice * 0.22
            + u_audioHigh * 0.12;

        color =
            vec3(0.006, 0.012, 0.016)
            + signalColor * energy * 0.72;

        color +=
            signalColor
            * grid
            * (0.30 + choice * 0.36);

        color +=
            signalColor
            * rim
            * (0.12 + openState * 0.24);

        if (material > 2.5) {
            color += signalColor * 0.72;
        }

        float fog =
            smoothstep(8.0, FAR_CLIP, travel);

        color = mix(
            color,
            vec3(0.0025, 0.0035, 0.0055),
            fog
        );
    }

    // Two horizon signals.
    float leftHorizon =
        exp(
            -length(
                uv - vec2(-0.30 - openState * 0.15, 0.03)
            ) * 6.8
        );

    float rightHorizon =
        exp(
            -length(
                uv - vec2(0.30 + openState * 0.15, 0.03)
            ) * 6.8
        );

    color +=
        vec3(0.02, 0.78, 0.90)
        * leftHorizon
        * awareness
        * (0.05 + max(-u_branchBias, 0.0) * 0.10);

    color +=
        vec3(0.88, 0.04, 0.56)
        * rightHorizon
        * awareness
        * (0.05 + max(u_branchBias, 0.0) * 0.10);

    // Central decision seam.
    float seam =
        exp(-abs(uv.x) * (34.0 - openState * 16.0))
        * awareness;

    color +=
        vec3(1.0, 0.05, 0.12)
        * seam
        * (0.06 + openState * 0.22);

    // Branch selector HUD.
    float selectorY = -0.72;
    float leftSelector =
        lineMask(
            length(uv - vec2(-0.13, selectorY)) - 0.035,
            0.005,
            0.002
        );

    float rightSelector =
        lineMask(
            length(uv - vec2(0.13, selectorY)) - 0.035,
            0.005,
            0.002
        );

    color +=
        vec3(0.02, 0.92, 1.0)
        * leftSelector
        * awareness
        * (0.08 + max(-u_branchBias, 0.0) * 0.22);

    color +=
        vec3(1.0, 0.06, 0.66)
        * rightSelector
        * awareness
        * (0.08 + max(u_branchBias, 0.0) * 0.22);

    // CRT / signal finish.
    float scanline =
        0.965
        + 0.035
        * sin(frag.y * PI);

    color *= scanline;

    float vignette =
        smoothstep(1.38, 0.22, dot(uv, uv));

    color *= vignette;

    float noise =
        hash21(frag + floor(t * 12.0)) - 0.5;

    color +=
        noise
        * (0.013 + u_audioHigh * 0.013);

    color = pow(max(color, 0.0), vec3(0.92));
    fragColor = vec4(color, 1.0);
}
