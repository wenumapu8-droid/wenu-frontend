/**
 * KDX FX SUITE — GPU proof for thermal-map (05) and dither-matrix (02).
 *
 * These shaders are compiled and executed for real: a headless Chrome hosts a
 * WebGL2 context (ANGLE/SwiftShader), each pass renders a known input into an
 * RGBA8 framebuffer built exactly like the ping-pong targets in
 * kodex-observe-v2-client.ts, and the pixels are read back.
 *
 * Every canonical parameter in manifest.json -> tratamientos is proved twice:
 *   1. structurally — the uniform survives GLSL dead-code elimination and is
 *      reported in ACTIVE_UNIFORMS, so it is genuinely read by the program;
 *   2. behaviourally — changing it changes rendered pixels in the direction the
 *      parameter name promises.
 *
 * Run: node --test src/kodex/observe-v2/shaders/treatments.test.ts
 */
import { test, before, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

const CHROME =
  process.env.CHROME_BIN ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/** Canonical Bayer 8x8, as declared by `pattern: "Bayer 8x8"`. */
const CANONICAL_BAYER8 = [
  0, 32, 8, 40, 2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
];

/** Runs inside the browser. Renders every probe and emits one JSON blob. */
const HARNESS = String.raw`
const R = { ok: true, errors: [], probes: {} };
const fail = (m) => { R.ok = false; R.errors.push(String(m)); };
const W = 64, H = 64;

function emit() {
  const json = JSON.stringify(R);
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  document.getElementById('out').textContent = '@@KDX@@' + btoa(bin) + '@@KDX@@';
}

const canvas = document.createElement('canvas');
canvas.width = W; canvas.height = H;
const gl = canvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true });
if (!gl) { fail('WebGL2 unavailable'); emit(); throw new Error('no webgl2'); }

const dbg = gl.getExtension('WEBGL_debug_renderer_info');
R.renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
R.glVersion = gl.getParameter(gl.VERSION);
R.glslVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);

function compile(type, src, label) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  const ok = !!gl.getShaderParameter(sh, gl.COMPILE_STATUS);
  const log = gl.getShaderInfoLog(sh) || '';
  R.probes['compile_' + label] = { ok, log };
  if (!ok) fail(label + ' COMPILE_STATUS false: ' + log);
  return ok ? sh : null;
}

function build(fragSrc, label) {
  const vs = compile(gl.VERTEX_SHADER, VERT, label + '_vert');
  const fs = compile(gl.FRAGMENT_SHADER, fragSrc, label + '_frag');
  if (!vs || !fs) return null;
  const p = gl.createProgram();
  gl.attachShader(p, vs); gl.attachShader(p, fs);
  gl.bindAttribLocation(p, 0, 'a_position');
  gl.linkProgram(p);
  const linked = !!gl.getProgramParameter(p, gl.LINK_STATUS);
  const log = gl.getProgramInfoLog(p) || '';
  const uniforms = {};
  const names = [];
  if (linked) {
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(p, i);
      if (info) { uniforms[info.name] = gl.getUniformLocation(p, info.name); names.push(info.name); }
    }
  }
  R.probes['link_' + label] = { ok: linked, log, activeUniforms: names.sort() };
  if (!linked) fail(label + ' LINK_STATUS false: ' + log);
  return linked ? { program: p, uniforms } : null;
}

// Fullscreen triangle + RGBA8 target, mirroring kodex-observe-v2-client.ts.
const quad = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quad);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

function makeTarget() {
  const tex = gl.createTexture();
  const fb = gl.createFramebuffer();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  return { fb, tex };
}
const target = makeTarget();

function makeInput(fn) {
  const data = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const px = fn(x, y);
      const i = (y * W + x) * 4;
      data[i] = px[0]; data[i + 1] = px[1]; data[i + 2] = px[2]; data[i + 3] = 255;
    }
  }
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  return { tex, data };
}

function render(def, inputTex, uniforms) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb);
  gl.viewport(0, 0, W, H);
  gl.useProgram(def.program);
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, inputTex);
  if (def.uniforms.u_tex) gl.uniform1i(def.uniforms.u_tex, 0);
  for (const [name, value] of Object.entries(uniforms)) {
    const loc = def.uniforms[name];
    if (!loc) continue;
    if (Array.isArray(value)) gl.uniform2f(loc, value[0], value[1]);
    else gl.uniform1f(loc, value);
  }
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  const out = new Uint8Array(W * H * 4);
  gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, out);
  return out;
}

const meanRGB = (px) => {
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < px.length; i += 4) { r += px[i]; g += px[i + 1]; b += px[i + 2]; }
  const n = px.length / 4;
  return [r / n, g / n, b / n];
};
const meanLuma = (px) => { const m = meanRGB(px); return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]; };
const distinctColors = (px) => {
  const s = new Set();
  for (let i = 0; i < px.length; i += 4) s.add(px[i] + ',' + px[i + 1] + ',' + px[i + 2]);
  return s.size;
};
const maxAbsDiff = (a, b) => { let m = 0; for (let i = 0; i < a.length; i++) m = Math.max(m, Math.abs(a[i] - b[i])); return m; };
const allNeutral = (px) => {
  for (let i = 0; i < px.length; i += 4) if (px[i] !== px[i + 1] || px[i + 1] !== px[i + 2]) return false;
  return true;
};
const at = (px, x, y) => { const i = (y * W + x) * 4; return [px[i], px[i + 1], px[i + 2]]; };
const RES = [W, H];

// ---------------------------------------------------------------- inputs
// Grey ramp left->right: the ladder input for thermal-map.
const rampGrey = makeInput((x) => { const v = Math.round((x / (W - 1)) * 255); return [v, v, v]; });
// Flat mid grey 128: exact, so dither cut positions are analytically known.
const flat128 = makeInput(() => [128, 128, 128]);
// Flat 0.6 grey: above mid, so contrast pushes coverage up.
const flat153 = makeInput(() => [153, 153, 153]);
// Saturated colour field: separates per-channel from luma dithering.
const colorField = makeInput((x) => [Math.round((x / (W - 1)) * 255), 128, Math.round((1 - x / (W - 1)) * 255)]);

// ================================================== thermal-map (05)
const thermal = build(THERMAL, 'thermal');
if (thermal) {
  const base = {
    u_resolution: RES, u_temperature: 1.12, u_colorSteps: 8,
    u_emissive: 1.35, u_hueShift: 0.02, u_contrast: 1.0, u_intensity: 1.0,
  };
  const T = (over) => render(thermal, rampGrey.tex, { ...base, ...over });

  const canonical = T({});
  R.probes.thermal_canonical = {
    distinctColors: distinctColors(canonical),
    meanRGB: meanRGB(canonical),
    bandSamples: [0, 9, 18, 27, 36, 45, 54, 63].map((x) => at(canonical, x, 32)),
  };

  // color_steps: the number of distinct output colours must equal the setting.
  R.probes.thermal_colorSteps = {
    steps3: distinctColors(T({ u_colorSteps: 3 })),
    steps4: distinctColors(T({ u_colorSteps: 4 })),
    steps8: distinctColors(T({ u_colorSteps: 8 })),
    steps16: distinctColors(T({ u_colorSteps: 16 })),
  };

  // temperature: higher bias samples further up the ladder => brighter.
  R.probes.thermal_temperature = {
    cold: meanLuma(T({ u_temperature: 0.6 })),
    canonical: meanLuma(canonical),
    hot: meanLuma(T({ u_temperature: 1.6 })),
    diffVsUnity: maxAbsDiff(canonical, T({ u_temperature: 1.0 })),
  };

  // emissive: pure output gain.
  R.probes.thermal_emissive = {
    low: meanLuma(T({ u_emissive: 0.5 })),
    unity: meanLuma(T({ u_emissive: 1.0 })),
    canonical: meanLuma(canonical),
    diffVsUnity: maxAbsDiff(canonical, T({ u_emissive: 1.0 })),
  };

  // hue_shift: rotation about the grey axis moves channel balance.
  const hue0 = T({ u_hueShift: 0.0 });
  R.probes.thermal_hueShift = {
    diffCanonicalVsZero: maxAbsDiff(canonical, hue0),
    meanZero: meanRGB(hue0),
    meanThird: meanRGB(T({ u_hueShift: 1.0 / 3.0 })),
    meanFullTurn: meanRGB(T({ u_hueShift: 1.0 })),
  };

  // contrast: more contrast drives more of the ramp into the end bands.
  const countBand = (px, rgb) => {
    let n = 0;
    for (let i = 0; i < px.length; i += 4) if (px[i] === rgb[0] && px[i + 1] === rgb[1] && px[i + 2] === rgb[2]) n++;
    return n;
  };
  const lowC = T({ u_contrast: 1.0 });
  const highC = T({ u_contrast: 2.5 });
  const darkest = at(lowC, 0, 32);
  R.probes.thermal_contrast = {
    darkestBandRGB: darkest,
    darkPixels_contrast1: countBand(lowC, darkest),
    darkPixels_contrast25: countBand(highC, darkest),
    diff: maxAbsDiff(lowC, highC),
  };

  // intensity: 0 must be a bit-exact passthrough of the source.
  const dry = T({ u_intensity: 0.0 });
  let exact = true;
  for (let i = 0; i < dry.length; i += 4) {
    const j = i;
    if (dry[j] !== rampGrey.data[j] || dry[j + 1] !== rampGrey.data[j + 1] || dry[j + 2] !== rampGrey.data[j + 2]) { exact = false; break; }
  }
  R.probes.thermal_intensity = { dryIsExactPassthrough: exact, wetDiff: maxAbsDiff(dry, canonical) };
}

// ================================================ dither-matrix (02)
const dither = build(DITHER, 'dither');
if (dither) {
  const base = {
    u_resolution: RES, u_ditherScale: 4, u_contrast: 1.25,
    u_threshold: 0.48, u_colorQuant: 1, u_intensity: 1.0,
  };
  const D = (tex, over) => render(dither, tex, { ...base, ...over });

  R.probes.dither_canonical = {
    distinctColors: distinctColors(D(colorField.tex, {})),
    meanRGB: meanRGB(D(flat153.tex, {})),
  };

  // pattern: reconstruct the matrix from pixels. For a flat input the cut is
  // luma > threshold + (B+0.5)/64 - 0.5, so sweeping threshold one B-step at a
  // time makes each cell flip in matrix order. rank = 64 - B.
  const LUMA = 128 / 255;
  const ranks = new Array(64).fill(0);
  for (let k = 0; k < 64; k++) {
    const t = LUMA + 0.5 - (k + 1) / 64;
    const px = D(flat128.tex, { u_threshold: t, u_contrast: 1.0, u_colorQuant: 0, u_ditherScale: 1 });
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) if (at(px, x, y)[0] > 127) ranks[y * 8 + x]++;
    }
  }
  R.probes.dither_pattern = { recovered: ranks.map((r) => 64 - r) };

  // dither_scale: at scale 8 one matrix cell covers an 8x8 pixel block.
  const scale1 = D(flat128.tex, { u_contrast: 1.0, u_colorQuant: 0, u_ditherScale: 1 });
  const scale8 = D(flat128.tex, { u_contrast: 1.0, u_colorQuant: 0, u_ditherScale: 8 });
  const blockUniform = (px) => {
    const first = at(px, 0, 0)[0];
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if (at(px, x, y)[0] !== first) return false;
    return true;
  };
  R.probes.dither_scale = {
    block8x8_uniform_atScale1: blockUniform(scale1),
    block8x8_uniform_atScale8: blockUniform(scale8),
    diff: maxAbsDiff(scale1, scale8),
  };

  // threshold: coverage of lit pixels must fall as the cut rises.
  const coverage = (px) => {
    let n = 0;
    for (let i = 0; i < px.length; i += 4) if (px[i] > 127) n++;
    return n / (px.length / 4);
  };
  const mono = { u_contrast: 1.0, u_colorQuant: 0, u_ditherScale: 1 };
  R.probes.dither_threshold = {
    at030: coverage(D(flat128.tex, { ...mono, u_threshold: 0.30 })),
    at048: coverage(D(flat128.tex, { ...mono, u_threshold: 0.48 })),
    at070: coverage(D(flat128.tex, { ...mono, u_threshold: 0.70 })),
  };

  // contrast: input sits above mid grey, so more contrast lifts coverage.
  const mono153 = { u_colorQuant: 0, u_ditherScale: 1, u_threshold: 0.48 };
  R.probes.dither_contrast = {
    at050: coverage(D(flat153.tex, { ...mono153, u_contrast: 0.5 })),
    at100: coverage(D(flat153.tex, { ...mono153, u_contrast: 1.0 })),
    at125: coverage(D(flat153.tex, { ...mono153, u_contrast: 1.25 })),
    at250: coverage(D(flat153.tex, { ...mono153, u_contrast: 2.5 })),
  };

  // color_quant: off => neutral 1-bit luma; on => per-channel RGB corners.
  const quantOff = D(colorField.tex, { u_colorQuant: 0 });
  const quantOn = D(colorField.tex, { u_colorQuant: 1 });
  R.probes.dither_colorQuant = {
    offIsNeutral: allNeutral(quantOff),
    onIsNeutral: allNeutral(quantOn),
    offDistinct: distinctColors(quantOff),
    onDistinct: distinctColors(quantOn),
    diff: maxAbsDiff(quantOff, quantOn),
  };

  // intensity: 0 must be a bit-exact passthrough of the source.
  const dry = D(colorField.tex, { u_intensity: 0.0 });
  let exact = true;
  for (let i = 0; i < dry.length; i += 4) {
    if (dry[i] !== colorField.data[i] || dry[i + 1] !== colorField.data[i + 1] || dry[i + 2] !== colorField.data[i + 2]) { exact = false; break; }
  }
  R.probes.dither_intensity = { dryIsExactPassthrough: exact, wetDiff: maxAbsDiff(dry, quantOn) };
}

R.glError = gl.getError();
emit();
`;

type Probes = Record<string, any>;
let R: { ok: boolean; errors: string[]; probes: Probes; [k: string]: any };
const chromeAvailable = existsSync(CHROME);

before(async () => {
  if (!chromeAvailable) return;
  const read = (f: string) => readFileSync(join(HERE, f), 'utf8');
  const html =
    '<!doctype html><meta charset="utf-8"><pre id="out"></pre><script>\n' +
    `const VERT=${JSON.stringify(read('fullscreen.vert.glsl'))};\n` +
    `const THERMAL=${JSON.stringify(read('thermal.frag.glsl'))};\n` +
    `const DITHER=${JSON.stringify(read('dither.frag.glsl'))};\n` +
    HARNESS +
    '\n</script>';

  const dir = mkdtempSync(join(tmpdir(), 'kdx-fx-'));
  const page = join(dir, 'harness.html');
  writeFileSync(page, html);

  // Headless Chrome reliably emits the DOM in ~2s but then refuses to exit, so
  // read stdout until the result blob appears and kill it rather than waiting.
  const m = await new Promise<RegExpMatchArray>((resolve, reject) => {
    const child = spawn(
      CHROME,
      [
        '--headless=new',
        '--enable-unsafe-swiftshader',
        '--use-angle=swiftshader',
        '--hide-scrollbars',
        '--no-first-run',
        '--user-data-dir=' + join(dir, 'profile'),
        '--dump-dom',
        'file://' + page,
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );
    let dom = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`Chrome produced no result blob in 120s.\nstdout:\n${dom.slice(0, 4000)}\nstderr:\n${stderr.slice(-2000)}`));
    }, 120000);
    child.stderr.on('data', (d) => { stderr += d; });
    child.stdout.on('data', (d) => {
      dom += d;
      const found = dom.match(/@@KDX@@([A-Za-z0-9+/=]+)@@KDX@@/);
      if (found) { clearTimeout(timer); child.kill('SIGKILL'); resolve(found); }
    });
    child.on('error', (err) => { clearTimeout(timer); reject(err); });
    child.on('exit', () => {
      if (!dom.includes('@@KDX@@')) {
        clearTimeout(timer);
        reject(new Error(`Chrome exited without a result blob.\nstdout:\n${dom.slice(0, 4000)}\nstderr:\n${stderr.slice(-2000)}`));
      }
    });
  });

  R = JSON.parse(Buffer.from(m[1], 'base64').toString('utf8'));
  // Documented probe: KDX_DUMP=1 prints every measured value, so the effect of
  // each uniform can be inspected directly rather than taken on trust.
  if (process.env.KDX_DUMP) console.log(JSON.stringify({ renderer: R.renderer, glslVersion: R.glslVersion, errors: R.errors, probes: R.probes }, null, 2));
});

describe('KDX FX SUITE — GPU treatments', { skip: chromeAvailable ? false : 'Chrome not found at ' + CHROME }, () => {
  test('WebGL2 context is real and error-free', () => {
    assert.deepEqual(R.errors, [], 'harness reported GL errors');
    assert.equal(R.ok, true);
    assert.equal(R.glError, 0, 'gl.getError() must be NO_ERROR');
    assert.match(R.glVersion, /WebGL 2/);
  });

  describe('thermal-map (05)', () => {
    test('compiles and links', () => {
      assert.equal(R.probes.compile_thermal_frag.ok, true, R.probes.compile_thermal_frag.log);
      assert.equal(R.probes.link_thermal.ok, true, R.probes.link_thermal.log);
    });

    test('every canonical parameter survives as an ACTIVE uniform', () => {
      // A uniform that is declared but never read is stripped by the GLSL
      // compiler and never appears here. Presence proves it is wired in.
      const active = R.probes.link_thermal.activeUniforms;
      for (const u of ['u_temperature', 'u_colorSteps', 'u_emissive', 'u_hueShift', 'u_contrast']) {
        assert.ok(active.includes(u), `${u} missing from ACTIVE_UNIFORMS: ${active.join(', ')}`);
      }
    });

    test('color_steps quantises to exactly N bands', () => {
      const p = R.probes.thermal_colorSteps;
      assert.equal(p.steps3, 3);
      assert.equal(p.steps4, 4);
      assert.equal(p.steps8, 8, 'canonical color_steps 8 must yield 8 distinct colours');
      assert.equal(p.steps16, 16);
    });

    test('temperature biases where the ladder is sampled', () => {
      const p = R.probes.thermal_temperature;
      assert.ok(p.hot > p.canonical, `hot ${p.hot} !> canonical ${p.canonical}`);
      assert.ok(p.canonical > p.cold, `canonical ${p.canonical} !> cold ${p.cold}`);
      assert.ok(p.diffVsUnity > 0, 'canonical 1.12 must differ from 1.0');
    });

    test('emissive gains the output', () => {
      const p = R.probes.thermal_emissive;
      assert.ok(p.canonical > p.unity, `1.35 ${p.canonical} !> 1.0 ${p.unity}`);
      assert.ok(p.unity > p.low, `1.0 ${p.unity} !> 0.5 ${p.low}`);
      assert.ok(p.diffVsUnity > 0);
    });

    test('hue_shift rotates channel balance about the grey axis', () => {
      const p = R.probes.thermal_hueShift;
      assert.ok(p.diffCanonicalVsZero > 0, 'canonical hue_shift 0.02 must be visible');
      const [r0, g0, b0] = p.meanZero;
      const [r3, g3, b3] = p.meanThird;
      assert.ok(Math.abs(r3 - r0) > 4 || Math.abs(g3 - g0) > 4 || Math.abs(b3 - b0) > 4,
        'a third-turn rotation must move channel means');
      // A full turn is the identity rotation.
      const [rf, gf, bf] = p.meanFullTurn;
      assert.ok(Math.abs(rf - r0) < 1.5 && Math.abs(gf - g0) < 1.5 && Math.abs(bf - b0) < 1.5,
        'a full turn must return to the unrotated ladder');
    });

    test('contrast drives the ramp into the end bands', () => {
      const p = R.probes.thermal_contrast;
      assert.ok(p.darkPixels_contrast25 > p.darkPixels_contrast1,
        `dark band ${p.darkPixels_contrast25} !> ${p.darkPixels_contrast1}`);
      assert.ok(p.diff > 0);
    });

    test('intensity 0 is a bit-exact passthrough', () => {
      assert.equal(R.probes.thermal_intensity.dryIsExactPassthrough, true);
      assert.ok(R.probes.thermal_intensity.wetDiff > 0);
    });
  });

  describe('dither-matrix (02)', () => {
    test('compiles and links', () => {
      assert.equal(R.probes.compile_dither_frag.ok, true, R.probes.compile_dither_frag.log);
      assert.equal(R.probes.link_dither.ok, true, R.probes.link_dither.log);
    });

    test('every canonical parameter survives as an ACTIVE uniform', () => {
      const active = R.probes.link_dither.activeUniforms;
      for (const u of ['u_ditherScale', 'u_contrast', 'u_threshold', 'u_colorQuant']) {
        assert.ok(active.includes(u), `${u} missing from ACTIVE_UNIFORMS: ${active.join(', ')}`);
      }
    });

    test('pattern is the canonical Bayer 8x8, recovered from rendered pixels', () => {
      const recovered = R.probes.dither_pattern.recovered;
      assert.equal(new Set(recovered).size, 64,
        'a Bayer 8x8 has 64 distinct levels; a 4x4 would only ever show 16');
      assert.deepEqual(recovered, CANONICAL_BAYER8);
    });

    test('dither_scale sets the matrix cell size in device pixels', () => {
      const p = R.probes.dither_scale;
      assert.equal(p.block8x8_uniform_atScale1, false, 'at scale 1 an 8x8 block spans the whole matrix');
      assert.equal(p.block8x8_uniform_atScale8, true, 'at scale 8 an 8x8 block is one matrix cell');
      assert.ok(p.diff > 0);
    });

    test('threshold moves the cut', () => {
      const p = R.probes.dither_threshold;
      assert.ok(p.at030 > p.at048, `${p.at030} !> ${p.at048}`);
      assert.ok(p.at048 > p.at070, `${p.at048} !> ${p.at070}`);
      // Mean of the matrix is exactly 0.5, so a mid-grey input cut at its own
      // luma is half lit: threshold is calibrated, not merely monotone.
      assert.ok(Math.abs(p.at048 - 0.52) < 0.06, `coverage at 0.48 was ${p.at048}`);
    });

    test('contrast reshapes before the cut', () => {
      const p = R.probes.dither_contrast;
      assert.ok(p.at250 > p.at125, `${p.at250} !> ${p.at125}`);
      assert.ok(p.at125 > p.at100, `${p.at125} !> ${p.at100}`);
      assert.ok(p.at100 > p.at050, `${p.at100} !> ${p.at050}`);
    });

    test('color_quant switches luma 1-bit vs per-channel RGB', () => {
      const p = R.probes.dither_colorQuant;
      assert.equal(p.offIsNeutral, true, 'color_quant false must yield neutral black/white only');
      assert.equal(p.offDistinct, 2, 'luma dithering yields exactly two values');
      assert.equal(p.onIsNeutral, false, 'color_quant true must produce chromatic pixels');
      assert.ok(p.onDistinct > 2, `per-channel dithering yields RGB cube corners, got ${p.onDistinct}`);
      assert.ok(p.diff > 0);
    });

    test('intensity 0 is a bit-exact passthrough', () => {
      assert.equal(R.probes.dither_intensity.dryIsExactPassthrough, true);
      assert.ok(R.probes.dither_intensity.wetDiff > 0);
    });
  });
});
