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
uniform float u_flipProgress;
uniform float u_flipPulseAge;

uniform float u_intensity;
uniform float u_seed;
uniform float u_reducedMotion;
uniform float u_quality;

#define PI 3.14159265358979323846
#define MAX_STEPS 112
#define FAR_CLIP 42.0
#define EPSILON 0.00135

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
    return length(max(q, 0.0))
        + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdRoundBox(vec3 p, vec3 b, float r) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0))
        + min(max(q.x, max(q.y, q.z)), 0.0)
        - r;
}

float sdTorus(vec3 p, vec2 t) {
    vec2 q = vec2(
        length(p.xz) - t.x,
        p.y
    );
    return length(q) - t.y;
}

float easeInOut(float x) {
    return x * x * (3.0 - 2.0 * x);
}

vec3 projectA(vec3 p, float awareness, float t) {
    float depth = max(0.0, -p.z);
    float drift =
        sin(depth * 0.22 - t * 0.18)
        * awareness
        * 0.12;

    p.x += depth * 0.12 + drift;
    p.y += p.x * 0.05;

    p.xz =
        rot(
            -0.10
            - awareness * 0.05
        ) * p.xz;

    return p;
}

vec3 projectB(vec3 p, float awareness, float t) {
    float depth = max(0.0, -p.z);
    float drift =
        sin(depth * 0.19 + t * 0.21 + 1.4)
        * awareness
        * 0.12;

    p.y += depth * 0.11 + drift;
    p.x -= p.y * 0.06;

    p.yz =
        rot(
            0.18
            + awareness * 0.05
        ) * p.yz;

    p.xy =
        rot(
            0.20
        ) * p.xy;

    return p;
}

vec3 foldAtMidpoint(
    vec3 p,
    float flip,
    float t,
    float awareness
) {
    float midpoint =
        1.0
        - abs(flip * 2.0 - 1.0);

    midpoint = pow(
        clamp(midpoint, 0.0, 1.0),
        1.6
    );

    float depth =
        max(0.0, -p.z);

    float fold =
        sin(
            p.x * 2.1
            + p.y * 2.4
            + depth * 0.64
            - t * 0.72
        );

    float twist =
        midpoint
        * (
            0.30
            + u_audioMid * 0.20
            + awareness * 0.08
        );

    p.xy =
        rot(
            twist
            * sin(
                depth * 0.42 - t * 0.35
            )
        ) * p.xy;

    p.z +=
        fold
        * midpoint
        * (
            0.20
            + u_audioLow * 0.18
        );

    p.x +=
        sin(
            p.y * 3.2
            - t
        )
        * midpoint
        * 0.10;

    return p;
}

vec3 projectionDomain(
    vec3 p,
    float flip,
    float awareness,
    float t
) {
    vec3 a =
        projectA(
            p,
            awareness,
            t
        );

    vec3 b =
        projectB(
            p,
            awareness,
            t
        );

    float eased =
        easeInOut(
            clamp(
                flip,
                0.0,
                1.0
            )
        );

    vec3 q =
        mix(
            a,
            b,
            eased
        );

    return foldAtMidpoint(
        q,
        eased,
        t,
        awareness
    );
}

float architecture(
    vec3 p,
    float t,
    float awareness,
    float openState,
    float flip
) {
    vec3 q =
        projectionDomain(
            p,
            flip,
            awareness,
            t
        );

    float depth =
        max(0.0, -q.z);

    // Repeated portal frames.
    vec3 frameP = q;
    frameP.z =
        mod(
            frameP.z + 1.65,
            3.30
        ) - 1.65;

    float frame =
        abs(
            sdRoundBox(
                frameP,
                vec3(
                    1.82,
                    1.36,
                    0.065
                ),
                0.035
            )
        ) - 0.028;

    // Central impossible monolith.
    vec3 monolithP = q;
    monolithP.z += 4.2;
    monolithP.xy =
        rot(
            flip * PI * 0.25
            + sin(t * 0.16) * 0.05
        ) * monolithP.xy;

    float monolith =
        sdRoundBox(
            monolithP,
            vec3(
                0.18 + openState * 0.06,
                0.84,
                0.18
            ),
            0.06
        );

    // Torus that appears horizontal in A and vertical in B.
    vec3 ringP = q;
    ringP.z += 7.4;

    vec3 ringA = ringP;
    vec3 ringB = ringP;

    ringB.xy =
        rot(PI * 0.5) * ringB.xy;

    float torusA =
        sdTorus(
            ringA,
            vec2(
                0.72,
                0.055
            )
        );

    float torusB =
        sdTorus(
            ringB.xzy,
            vec2(
                0.72,
                0.055
            )
        );

    float torus =
        mix(
            torusA,
            torusB,
            easeInOut(flip)
        );

    // Perspective rails.
    float railLeft =
        length(
            q.xy
            - vec2(
                -1.52,
                -1.10
            )
        ) - 0.045;

    float railRight =
        length(
            q.xy
            - vec2(
                1.52,
                -1.10
            )
        ) - 0.045;

    // OPEN state stretches the center into an aperture.
    float center =
        length(q.xy)
        - (
            0.26
            + openState
              * (
                  0.44
                  + 0.12
                    * sin(
                        depth * 0.9
                        - t
                    )
              )
        );

    center =
        abs(center) - 0.020;

    return min(
        frame,
        min(
            monolith,
            min(
                torus,
                min(
                    center,
                    min(
                        railLeft,
                        railRight
                    )
                )
            )
        )
    );
}

vec2 mapScene(
    vec3 p,
    float t,
    float awareness,
    float openState,
    float flip
) {
    float structure =
        architecture(
            p,
            t,
            awareness,
            openState,
            flip
        );

    // Base room surfaces, also affected by projection.
    vec3 roomP =
        projectionDomain(
            p,
            flip,
            awareness * 0.75,
            t
        );

    float wall =
        abs(abs(roomP.x) - 2.10);

    float floorPlane =
        abs(roomP.y + 1.42);

    float ceilingPlane =
        abs(roomP.y - 1.42);

    float room =
        min(
            wall,
            min(
                floorPlane,
                ceilingPlane
            )
        );

    if (structure < room) {
        return vec2(
            structure,
            2.0
        );
    }

    return vec2(
        room,
        1.0
    );
}

vec3 getNormal(
    vec3 p,
    float t,
    float awareness,
    float openState,
    float flip
) {
    vec2 e =
        vec2(EPSILON, 0.0);

    float d =
        mapScene(
            p,
            t,
            awareness,
            openState,
            flip
        ).x;

    return normalize(
        vec3(
            mapScene(
                p + e.xyy,
                t,
                awareness,
                openState,
                flip
            ).x - d,

            mapScene(
                p + e.yxy,
                t,
                awareness,
                openState,
                flip
            ).x - d,

            mapScene(
                p + e.yyx,
                t,
                awareness,
                openState,
                flip
            ).x - d
        )
    );
}

float raymarch(
    vec3 ro,
    vec3 rd,
    float t,
    float awareness,
    float openState,
    float flip,
    out vec3 hitPoint,
    out float material
) {
    float travelled = 0.0;
    material = 0.0;

    float maximumSteps =
        mix(
            62.0,
            108.0,
            clamp(
                u_quality,
                0.0,
                1.0
            )
        );

    for (
        int i = 0;
        i < MAX_STEPS;
        i++
    ) {
        if (
            float(i)
            > maximumSteps
        ) {
            break;
        }

        vec3 p =
            ro + rd * travelled;

        vec2 scene =
            mapScene(
                p,
                t,
                awareness,
                openState,
                flip
            );

        if (
            scene.x < EPSILON
            || travelled > FAR_CLIP
        ) {
            hitPoint = p;
            material = scene.y;
            break;
        }

        travelled +=
            scene.x * 0.74;
    }

    return travelled;
}

float surfaceGrid(
    vec3 p,
    vec3 normal,
    float flip
) {
    vec3 coordinate =
        p * vec3(
            2.25,
            2.25,
            1.10
        );

    coordinate.xy =
        rot(
            flip * PI * 0.25
        ) * coordinate.xy;

    vec3 local =
        abs(
            fract(coordinate)
            - 0.5
        );

    vec3 derivative =
        fwidth(coordinate);

    vec3 lines =
        1.0
        - smoothstep(
            vec3(0.452) - derivative,
            vec3(0.452),
            local
        );

    vec3 weights =
        abs(normal);

    weights /=
        max(
            dot(
                weights,
                vec3(1.0)
            ),
            0.0001
        );

    return dot(
        lines.yzx,
        weights
    );
}

vec3 phaseColor(
    float flip,
    float openState
) {
    vec3 phaseA =
        vec3(
            0.02,
            0.92,
            1.0
        );

    vec3 phaseB =
        vec3(
            1.0,
            0.06,
            0.66
        );

    vec3 midpoint =
        vec3(
            0.56,
            0.12,
            1.0
        );

    float mid =
        1.0
        - abs(flip * 2.0 - 1.0);

    vec3 phase =
        mix(
            phaseA,
            phaseB,
            easeInOut(flip)
        );

    phase =
        mix(
            phase,
            midpoint,
            pow(
                clamp(mid, 0.0, 1.0),
                2.0
            ) * 0.64
        );

    return mix(
        phase,
        vec3(
            1.0,
            0.05,
            0.12
        ),
        openState * 0.32
    );
}

void main() {
    vec2 frag =
        gl_FragCoord.xy;

    vec2 uv =
        (
            frag * 2.0
            - u_resolution.xy
        )
        / max(
            u_resolution.y,
            1.0
        );

    float motion =
        1.0
        - clamp(
            u_reducedMotion,
            0.0,
            1.0
        );

    float t =
        u_time * motion;

    float awareness =
        smoothstep(
            0.0,
            1.0,
            u_state
        );

    float openState =
        smoothstep(
            1.0,
            2.0,
            u_state
        )
        * u_progress;

    float flip =
        clamp(
            u_flipProgress,
            0.0,
            1.0
        );

    vec2 pointer =
        (
            u_pointer - 0.5
        ) * 2.0;

    vec3 ro =
        vec3(
            pointer.x
              * 0.28
              * awareness,

            0.02
              + pointer.y
                * 0.12
                * awareness,

            5.9
              - openState * 1.20
        );

    vec3 targetA =
        vec3(
            -0.34
              + pointer.x
                * 0.30
                * awareness,

            pointer.y
              * 0.10
              * awareness,

            -4.4
              - openState * 4.4
        );

    vec3 targetB =
        vec3(
            pointer.x
              * 0.10
              * awareness,

            0.38
              + pointer.y
                * 0.30
                * awareness,

            -4.4
              - openState * 4.4
        );

    vec3 target =
        mix(
            targetA,
            targetB,
            easeInOut(flip)
        );

    vec3 forward =
        normalize(
            target - ro
        );

    vec3 right =
        normalize(
            cross(
                forward,
                vec3(
                    0.0,
                    1.0,
                    0.0
                )
            )
        );

    vec3 up =
        cross(
            right,
            forward
        );

    float lens =
        mix(
            1.36,
            1.02,
            openState
        );

    lens *=
        1.0
        - (
            1.0
            - abs(
                flip * 2.0 - 1.0
            )
          )
          * 0.08;

    vec3 rd =
        normalize(
            forward * lens
            + right * uv.x
            + up * uv.y
        );

    vec3 hitPoint =
        vec3(0.0);

    float material = 0.0;

    float travel =
        raymarch(
            ro,
            rd,
            t,
            awareness,
            openState,
            flip,
            hitPoint,
            material
        );

    vec3 color =
        vec3(
            0.003,
            0.004,
            0.007
        );

    vec3 signal =
        phaseColor(
            flip,
            openState
        );

    if (travel < FAR_CLIP) {
        vec3 normal =
            getNormal(
                hitPoint,
                t,
                awareness,
                openState,
                flip
            );

        vec3 lightDirection =
            normalize(
                vec3(
                    -0.46,
                    0.72,
                    0.52
                )
            );

        float diffuse =
            max(
                dot(
                    normal,
                    lightDirection
                ),
                0.0
            );

        float rim =
            pow(
                1.0
                - max(
                    dot(
                        normal,
                        -rd
                    ),
                    0.0
                ),
                2.35
            );

        float grid =
            surfaceGrid(
                hitPoint,
                normal,
                flip
            );

        float midpoint =
            1.0
            - abs(
                flip * 2.0 - 1.0
            );

        float interference =
            0.5
            + 0.5
              * sin(
                  hitPoint.x * 2.4
                  + hitPoint.y * 2.7
                  + hitPoint.z * 0.82
                  - t * 1.2
              );

        float energy =
            0.16
            + diffuse * 0.62
            + rim * 0.44
            + grid * 0.68
            + interference
              * midpoint
              * 0.16
            + u_audioHigh * 0.12;

        color =
            vec3(
                0.006,
                0.011,
                0.016
            )
            + signal
              * energy
              * (
                  material > 1.5
                    ? 0.82
                    : 0.62
                );

        color +=
            signal
            * grid
            * (
                0.28
                + midpoint * 0.18
            );

        color +=
            signal
            * rim
            * (
                0.11
                + openState * 0.26
            );

        if (material > 1.5) {
            color +=
                signal * 0.18;
        }

        float fog =
            smoothstep(
                8.0,
                FAR_CLIP,
                travel
            );

        color =
            mix(
                color,
                vec3(
                    0.0024,
                    0.0034,
                    0.0054
                ),
                fog
            );
    }

    // Phase labels represented as terminal markers.
    float leftMarker =
        1.0
        - smoothstep(
            0.006,
            0.014,
            abs(
                length(
                    uv
                    - vec2(
                        -0.48,
                        -0.72
                    )
                ) - 0.038
            )
        );

    float rightMarker =
        1.0
        - smoothstep(
            0.006,
            0.014,
            abs(
                length(
                    uv
                    - vec2(
                        0.48,
                        -0.72
                    )
                ) - 0.038
            )
        );

    color +=
        vec3(
            0.02,
            0.92,
            1.0
        )
        * leftMarker
        * (
            0.06
            + (1.0 - flip) * 0.20
        );

    color +=
        vec3(
            1.0,
            0.06,
            0.66
        )
        * rightMarker
        * (
            0.06
            + flip * 0.20
        );

    // Midpoint interference field.
    float midpoint =
        1.0
        - abs(
            flip * 2.0 - 1.0
        );

    float seam =
        exp(
            -abs(uv.x + uv.y * 0.18)
            * (
                28.0
                - midpoint * 12.0
            )
        )
        * midpoint;

    color +=
        vec3(
            0.58,
            0.14,
            1.0
        )
        * seam
        * 0.18;

    // Flip pulse overlay.
    float flipPulseAge =
        max(
            u_flipPulseAge,
            0.0
        );

    float flipPulseRadius =
        flipPulseAge * 0.48;

    float flipPulse =
        exp(
            -abs(
                length(uv)
                - flipPulseRadius
            )
            * 30.0
        )
        * exp(
            -flipPulseAge * 0.82
        )
        * step(
            0.0,
            u_flipPulseAge
        );

    color +=
        signal
        * flipPulse
        * 0.36;

    // OPEN aperture.
    float aperture =
        exp(
            -length(
                uv
                * vec2(
                    1.2,
                    0.78
                )
            )
            * (
                7.2
                - openState * 3.6
            )
        )
        * openState;

    color +=
        vec3(
            1.0,
            0.06,
            0.12
        )
        * aperture
        * 0.64;

    // CRT / analog finish.
    float scanline =
        0.965
        + 0.035
          * sin(
              frag.y * PI
          );

    color *= scanline;

    float vignette =
        smoothstep(
            1.40,
            0.22,
            dot(uv, uv)
        );

    color *= vignette;

    float noise =
        hash21(
            frag
            + floor(
                t * 12.0
            )
        ) - 0.5;

    color +=
        noise
        * (
            0.013
            + u_audioHigh * 0.014
            + midpoint * 0.008
        );

    color =
        pow(
            max(
                color,
                0.0
            ),
            vec3(0.92)
        );

    fragColor =
        vec4(
            color,
            1.0
        );
}
