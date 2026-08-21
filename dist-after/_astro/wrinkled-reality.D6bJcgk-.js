const n=`#version 300 es
precision highp float;
precision highp int;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform float u_delta;
uniform vec2  u_resolution;

uniform vec2  u_pointer;
uniform vec2  u_pointerVelocity;
uniform vec2  u_creaseOrigin;
uniform float u_creaseAge;

uniform float u_audioLow;
uniform float u_audioMid;
uniform float u_audioHigh;

uniform float u_state;
uniform float u_progress;
uniform float u_intensity;
uniform float u_seed;
uniform float u_reducedMotion;
uniform float u_quality;

#define PI 3.14159265358979323846
#define MAX_STEPS 118
#define FAR_CLIP 40.0
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

float noise21(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));

    return mix(
        mix(a, b, f.x),
        mix(c, d, f.x),
        f.y
    );
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rotation = rot(0.63);

    for (int i = 0; i < 5; i++) {
        value += noise21(p) * amplitude;
        p = rotation * p * 2.03 + 1.7;
        amplitude *= 0.5;
    }

    return value;
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

float creasePulse(
    vec2 p,
    vec2 origin,
    float age,
    float frequency,
    float speed
) {
    float distanceToOrigin = length(p - origin);
    float wave =
        sin(
            distanceToOrigin * frequency
            - age * speed
        );

    float envelope =
        exp(-distanceToOrigin * 0.58)
        * exp(-max(age, 0.0) * 0.34);

    return wave * envelope;
}

vec2 pointerToWorld(vec2 pointer) {
    return vec2(
        (pointer.x - 0.5) * 5.6,
        mix(2.0, -7.0, pointer.y)
    );
}

vec3 wrinkleDomain(
    vec3 p,
    float t,
    float awareness,
    float openState
) {
    vec2 pointerWorld =
        pointerToWorld(u_pointer);

    vec2 creaseWorld =
        pointerToWorld(u_creaseOrigin);

    float temporal =
        t * (0.18 + u_audioMid * 0.12);

    float longitudinal =
        sin(
            p.z * 0.88
            + p.y * 1.26
            - temporal
        );

    float transverse =
        sin(
            p.x * 1.55
            - p.z * 0.34
            + temporal * 0.72
        );

    float organic =
        fbm(
            p.xz * 0.36
            + vec2(
                temporal * 0.12,
                -temporal * 0.08
            )
        ) - 0.5;

    float pointerDistance =
        length(
            p.xz - pointerWorld
        );

    float pointerFold =
        exp(
            -pointerDistance
            * pointerDistance
            * 0.25
        )
        * awareness;

    float creaseAge =
        max(u_creaseAge, 0.0);

    float crease =
        creasePulse(
            p.xz,
            creaseWorld,
            creaseAge,
            4.6 + u_audioMid * 2.2,
            3.9 + u_audioLow * 1.5
        )
        * step(0.0, u_creaseAge);

    float foldStrength =
        awareness
        * (
            0.10
            + u_audioLow * 0.20
            + u_audioMid * 0.11
        );

    float fold =
        longitudinal * 0.46
        + transverse * 0.32
        + organic * 0.76
        + crease * 0.82
        + pointerFold
          * sin(p.y * 2.2 + temporal)
          * 0.72;

    // The whole volume bends like cloth.
    p.y += fold * foldStrength;
    p.x += fold * foldStrength * 0.42;
    p.z += transverse * foldStrength * 0.22;

    // Local torsion around the pointer.
    float torsion =
        pointerFold
        * awareness
        * (
            0.18
            + length(u_pointerVelocity) * 1.2
        );

    p.xy =
        rot(
            torsion
            * sin(
                p.z * 0.38
                - temporal
            )
        ) * p.xy;

    // OPEN folds the entire corridor inward.
    float depth =
        max(0.0, -p.z - 0.4);

    float collapse =
        openState
        * smoothstep(
            0.0,
            1.0,
            depth / 9.0
        );

    float radial =
        length(p.xy);

    p.xy *=
        1.0
        - collapse
        * (
            0.22
            + 0.10
              * sin(
                  depth * 0.9
                  - t * 1.2
              )
        );

    p.z +=
        sin(radial * 3.2 - t)
        * collapse
        * 0.16;

    return p;
}

vec2 mapScene(
    vec3 p,
    float t,
    float awareness,
    float openState
) {
    vec3 q =
        wrinkleDomain(
            p,
            t,
            awareness,
            openState
        );

    // An enclosing room whose surfaces are all deformed.
    float sideWall =
        abs(abs(q.x) - 2.02);

    float floorPlane =
        abs(q.y + 1.42);

    float ceilingPlane =
        abs(q.y - 1.42);

    float shell =
        min(
            sideWall,
            min(
                floorPlane,
                ceilingPlane
            )
        );

    // Repeated ribs that inherit the same wrinkles.
    vec3 ribP = q;
    ribP.z =
        mod(
            ribP.z + 1.5,
            3.0
        ) - 1.5;

    float rib =
        abs(
            sdRoundBox(
                ribP,
                vec3(
                    2.16,
                    1.56,
                    0.052
                ),
                0.035
            )
        ) - 0.020;

    // Floating diagnostic membranes.
    vec3 membraneP = q;
    membraneP.z =
        mod(
            membraneP.z + 3.0,
            6.0
        ) - 3.0;

    float membrane =
        sdRoundBox(
            membraneP
            - vec3(
                0.0,
                0.0,
                -1.0
            ),
            vec3(
                1.12,
                0.76,
                0.016
            ),
            0.025
        );

    // OPEN reveals a second inner topology.
    vec3 innerP = q;
    innerP.z +=
        t
        * (
            0.12
            + openState * 0.42
        );

    innerP.z =
        mod(
            innerP.z + 1.2,
            2.4
        ) - 1.2;

    innerP.xy =
        rot(
            innerP.z
            * 0.16
            + t * 0.05
        ) * innerP.xy;

    float inner =
        abs(
            length(
                innerP.xy
            )
            - (
                0.54
                + 0.10
                  * sin(
                      innerP.z * 2.2
                      - t
                  )
            )
        ) - 0.025;

    vec2 result =
        vec2(
            min(
                shell,
                rib
            ),
            1.0
        );

    if (membrane < result.x) {
        result =
            vec2(
                membrane,
                2.0
            );
    }

    if (
        openState > 0.02
        && inner < result.x
    ) {
        result =
            vec2(
                inner,
                3.0
            );
    }

    return result;
}

vec3 getNormal(
    vec3 p,
    float t,
    float awareness,
    float openState
) {
    vec2 e =
        vec2(EPSILON, 0.0);

    float d =
        mapScene(
            p,
            t,
            awareness,
            openState
        ).x;

    return normalize(
        vec3(
            mapScene(
                p + e.xyy,
                t,
                awareness,
                openState
            ).x - d,

            mapScene(
                p + e.yxy,
                t,
                awareness,
                openState
            ).x - d,

            mapScene(
                p + e.yyx,
                t,
                awareness,
                openState
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
    out vec3 hitPoint,
    out float material
) {
    float travelled = 0.0;
    material = 0.0;

    float maximumSteps =
        mix(
            62.0,
            112.0,
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
                openState
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
            scene.x * 0.72;
    }

    return travelled;
}

float surfaceGrid(
    vec3 p,
    vec3 normal
) {
    vec3 coordinate =
        p * vec3(
            2.45,
            2.45,
            1.08
        );

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

vec3 materialColor(
    float material,
    float awareness,
    float openState
) {
    vec3 dormant =
        vec3(
            0.78,
            0.82,
            0.82
        );

    vec3 cyan =
        vec3(
            0.02,
            0.91,
            1.0
        );

    vec3 violet =
        vec3(
            0.48,
            0.12,
            1.0
        );

    vec3 red =
        vec3(
            1.0,
            0.05,
            0.12
        );

    if (material > 2.5) {
        return mix(
            violet,
            red,
            openState * 0.52
        );
    }

    if (material > 1.5) {
        return mix(
            dormant,
            violet,
            awareness
        );
    }

    vec3 base =
        mix(
            dormant,
            cyan,
            awareness
        );

    return mix(
        base,
        red,
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

    vec2 pointer =
        (
            u_pointer - 0.5
        ) * 2.0;

    vec3 ro =
        vec3(
            pointer.x
              * 0.30
              * awareness,

            0.02
              + pointer.y
                * 0.14
                * awareness,

            5.8
              - openState * 1.10
        );

    vec3 target =
        vec3(
            pointer.x
              * 0.42
              * awareness,

            pointer.y
              * 0.12
              * awareness,

            -4.0
              - openState * 4.6
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
            1.32,
            1.02,
            openState
        );

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
            hitPoint,
            material
        );

    vec3 color =
        vec3(
            0.003,
            0.004,
            0.007
        );

    if (travel < FAR_CLIP) {
        vec3 normal =
            getNormal(
                hitPoint,
                t,
                awareness,
                openState
            );

        vec3 lightDirection =
            normalize(
                vec3(
                    -0.52,
                    0.70,
                    0.48
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
                normal
            );

        float strain =
            abs(
                sin(
                    hitPoint.x * 1.8
                    + hitPoint.z * 0.72
                    - t
                )
            );

        vec3 signal =
            materialColor(
                material,
                awareness,
                openState
            );

        float energy =
            0.16
            + diffuse * 0.62
            + rim * 0.44
            + grid * 0.68
            + strain
              * awareness
              * 0.10
            + u_audioHigh * 0.12;

        color =
            vec3(
                0.006,
                0.011,
                0.016
            )
            + signal
              * energy
              * 0.68;

        color +=
            signal
            * grid
            * (
                0.28
                + u_audioMid * 0.18
            );

        color +=
            signal
            * rim
            * (
                0.10
                + openState * 0.28
            );

        if (material > 1.5) {
            color +=
                signal
                * 0.22;
        }

        if (material > 2.5) {
            color +=
                signal
                * (
                    0.34
                    + openState * 0.38
                );
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
                    0.0033,
                    0.0052
                ),
                fog
            );
    }

    // Pointer attractor.
    vec2 pointerUv =
        (
            u_pointer - 0.5
        )
        * vec2(
            u_resolution.x
              / max(
                  u_resolution.y,
                  1.0
                ),
            1.0
        )
        * 2.0;

    float pointerRing =
        1.0
        - smoothstep(
            0.006,
            0.014,
            abs(
                length(
                    uv - pointerUv
                )
                - (
                    0.050
                    + length(
                        u_pointerVelocity
                    ) * 0.08
                )
            )
        );

    color +=
        vec3(
            0.02,
            0.92,
            1.0
        )
        * pointerRing
        * awareness
        * 0.16;

    // Crease pulse overlay.
    float creaseAge =
        max(
            u_creaseAge,
            0.0
        );

    vec2 creaseUv =
        (
            u_creaseOrigin - 0.5
        )
        * vec2(
            u_resolution.x
              / max(
                  u_resolution.y,
                  1.0
                ),
            1.0
        )
        * 2.0;

    float creaseRadius =
        creaseAge * 0.42;

    float creaseRing =
        exp(
            -abs(
                length(
                    uv - creaseUv
                )
                - creaseRadius
            ) * 28.0
        )
        * exp(
            -creaseAge * 0.78
        )
        * step(
            0.0,
            u_creaseAge
        );

    color +=
        vec3(
            0.78,
            0.18,
            1.0
        )
        * creaseRing
        * 0.36;

    // OPEN folds reveal a luminous aperture.
    float aperture =
        exp(
            -length(
                uv
                * vec2(
                    1.3,
                    0.78
                )
            )
            * (
                7.0
                - openState * 3.5
            )
        )
        * openState;

    color +=
        mix(
            vec3(
                0.48,
                0.12,
                1.0
            ),
            vec3(
                1.0,
                0.05,
                0.12
            ),
            openState
        )
        * aperture
        * 0.72;

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

    float grain =
        hash21(
            frag
            + floor(
                t * 12.0
            )
        ) - 0.5;

    color +=
        grain
        * (
            0.013
            + u_audioHigh * 0.014
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
`;export{n as default};
