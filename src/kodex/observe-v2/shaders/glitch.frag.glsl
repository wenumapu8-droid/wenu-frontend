#version 300 es
precision highp float;

// KODEX treatment 07 — glitch-fracture / Fractura Glitch
//
// R5 (creator, 2026-08-08): material that cannot yet be truthfully shown is not
// hidden and not badged — it renders as a glitch, the archive declaring that it
// cannot resolve this signal. When verification lands the glitch clears.
//
// Safety property this shader is built around: at full veil the output is
// generated, not derived. No texel of u_tex reaches the framebuffer, so nothing
// withheld can be reconstructed from the pixels at any frame or any parameter
// setting. u_intensity 0 is a bit-exact passthrough, so one code path serves the
// withheld and the resolved state and resolution is a data change.
//
// Restraint is deliberate: the luminance envelope stays inside roughly 0.04-0.30,
// the cadence is a slow stepped machine cadence rather than a strobe, the field is
// neutral grey (it must not adopt either the fiction or the documented register's
// palette — that would be a claim), and most cells hold from step to step so the
// signal reads as persistently unresolvable rather than as random static.

out vec4 fragColor;
in vec2 v_uv;

uniform sampler2D u_tex;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_intensity;
uniform float u_seed;
uniform float u_reducedMotion;

// Canonical parameters — manifest.json > tratamientos > glitch-fracture (n 07).
uniform float u_glitch;       // 0.62  how much of the field is unresolved
uniform float u_blockSize;    // 64.0  fracture cell edge, in device pixels
uniform float u_speed;        // 1.8   steps per second of the decode cadence
uniform float u_displacement; // 0.15  tear amplitude, fraction of frame width
uniform float u_rgbShift;     // 0.5   channel separation across the cell lattice

// Same hash as displace.frag.glsl — one hash vocabulary across the pipeline.
float hash21(vec2 p) {
  p = fract(p * vec2(223.34, 451.21));
  p += dot(p, p + 34.45);
  return fract(p.x * p.y);
}

// One sample of the fracture lattice. Depends only on screen position, the step
// counter, the seed and the five canonical parameters — never on u_tex.
// Returns (quantised level, dropout mask, seam mask).
vec3 fractureCell(vec2 px, float frame, float cellPx, float glitch) {
  // Tear bands are finer than the cells, so block_size drives two scales at once.
  float bandPx = max(cellPx * 0.25, 1.0);
  float band = floor(px.y / bandPx);
  float bandRand = hash21(vec2(band * 1.7 + 11.3, frame * 0.31 + 3.9));
  float torn = step(1.0 - glitch * 0.35, bandRand);
  float tearPx = (hash21(vec2(band + 57.1, frame + 19.7)) - 0.5) * 2.0
               * u_displacement * u_resolution.x * torn;

  vec2 fractured = vec2(px.x + tearPx, px.y);
  vec2 cell = floor(fractured / cellPx);

  // Most cells hold their value; a minority churn each step. u_glitch sets how
  // much of the field is actively failing to resolve.
  float stable = hash21(cell + vec2(u_seed * 13.0 + 2.7, 7.31));
  float moving = hash21(cell + vec2(frame * 0.73 + 1.1, frame * 0.19 + 60.2));
  float churn = step(1.0 - glitch * 0.35, hash21(cell.yx + vec2(frame * 0.11 + 41.0, 8.6)));
  float h = mix(stable, moving, churn);

  // Four discrete levels: a readout, not noise.
  float level = clamp(floor(h * 4.0) / 3.0, 0.0, 1.0);

  // Lost packets. Sparse, and they go dark rather than bright.
  float drop = step(1.0 - glitch * 0.30, hash21(cell.yx + vec2(u_seed * 5.0 + 90.4, 12.9)));

  // The seam where a tear band meets its neighbour.
  vec2 f = fract(fractured / cellPx);
  float seam = max(smoothstep(0.93, 1.0, f.y), smoothstep(0.07, 0.0, f.y)) * torn;

  return vec3(level, drop, seam);
}

void main() {
  vec4 src = texture(u_tex, v_uv);
  float intensity = clamp(u_intensity, 0.0, 1.0);

  // Full veil is reached at 0.6 so the withheld state is unambiguous well before
  // the top of the range; above that only the fracture deepens. Values between 0
  // and 0.6 exist for the resolve transition, not for a resting withheld state.
  float veil = smoothstep(0.0, 0.6, intensity);

  // Resolved content: bit-exact passthrough, no arithmetic applied.
  if (veil <= 0.0) {
    fragColor = src;
    return;
  }

  float glitch = clamp(u_glitch, 0.0, 1.0);
  float cellPx = max(u_blockSize, 2.0);
  vec2 px = v_uv * u_resolution;

  // Reduced motion: the step counter stops. The withholding does not — the field
  // is still fully veiled, still fractured, simply held on one frame.
  float motion = 1.0 - clamp(u_reducedMotion, 0.0, 1.0);
  float steps = floor(u_time * max(u_speed, 0.0) * 1.6) * motion;
  float frame = mod(steps + floor(u_seed * 97.0), 512.0);

  float shiftPx = u_rgbShift * cellPx * 0.35;
  vec3 cr = fractureCell(px + vec2(shiftPx, 0.0), frame, cellPx, glitch);
  vec3 cg = fractureCell(px, frame, cellPx, glitch);
  vec3 cb = fractureCell(px - vec2(shiftPx, 0.0), frame, cellPx, glitch);

  // The floor sits above the page's own obsidian so the withheld panel always
  // reads as a panel. A region that dropped to page-black would read as an image
  // that failed to load — the one thing this must never look like. Dropout
  // darkens toward the floor, never through it.
  vec3 level = vec3(cr.x, cg.x, cb.x);
  vec3 keep = 1.0 - vec3(cr.y, cg.y, cb.y) * 0.70;
  vec3 lattice = 0.055 + (0.02 + level * 0.20) * keep;

  // Scanline stratum, borrowed from crt.frag.glsl so the device stays native.
  float scan = 0.5 + 0.5 * sin(px.y * 1.5707963);
  float scanStratum = mix(0.44, 0.56, scan);

  // blend "overlay" — the scanline stratum modulates the lattice.
  vec3 overlayed = mix(
    2.0 * lattice * scanStratum,
    1.0 - 2.0 * (1.0 - lattice) * (1.0 - scanStratum),
    step(vec3(0.5), lattice)
  );

  // blend "add" — the tear seam, the only bright mark in the frame.
  vec3 col = overlayed + cg.z * (0.06 + glitch * 0.10) * vec3(0.86, 0.92, 1.0);

  // A slow decode sweep that passes and does not lock. Held still under reduced
  // motion because its position is a function of the frozen step counter.
  float sweepPos = hash21(vec2(frame, 3.3));
  col += exp(-abs(v_uv.y - sweepPos) * 26.0) * 0.045;

  col = clamp(col, 0.0, 1.0);

  // At full veil nothing from src is mixed in at all — not scaled by zero, not
  // present in the expression.
  if (veil >= 1.0) {
    fragColor = vec4(col, 1.0);
    return;
  }
  fragColor = vec4(mix(src.rgb, col, veil), mix(src.a, 1.0, veil));
}
