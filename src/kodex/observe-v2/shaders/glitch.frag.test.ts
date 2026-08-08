/**
 * glitch-fracture (KODEX treatment 07) — GPU verification.
 *
 * Compiles glitch.frag.glsl in a real headless WebGL2 context and renders known
 * inputs through it. Run with:
 *
 *   node --test src/kodex/observe-v2/shaders/glitch.frag.test.ts
 *
 * Requires Google Chrome. Chrome hosts WebGL headlessly through SwiftShader; the
 * flags below are the combination that does not hang.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const VERT = fs.readFileSync(path.join(HERE, 'fullscreen.vert.glsl'), 'utf8');
const FRAG = fs.readFileSync(path.join(HERE, 'glitch.frag.glsl'), 'utf8');

// ---------------------------------------------------------------------------
// Minimal Chrome DevTools Protocol driver (no puppeteer in this repo).
// ---------------------------------------------------------------------------

class Chrome {
  proc!: ChildProcess;
  ws!: WebSocket;
  dir!: string;
  sessionId!: string;
  private id = 0;
  private pending = new Map<number, { resolve: (v: any) => void; reject: (e: Error) => void }>();

  async launch() {
    this.dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kdx-glitch-'));
    this.proc = spawn(
      CHROME,
      [
        '--headless=new',
        '--remote-debugging-port=0',
        `--user-data-dir=${this.dir}`,
        '--enable-unsafe-swiftshader',
        '--use-angle=swiftshader',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        'about:blank',
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );
    const portFile = path.join(this.dir, 'DevToolsActivePort');
    const deadline = Date.now() + 30_000;
    let raw = '';
    while (Date.now() < deadline) {
      if (fs.existsSync(portFile)) {
        raw = fs.readFileSync(portFile, 'utf8');
        if (raw.includes('\n')) break;
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    const [port, wsPath] = raw.trim().split('\n');
    if (!port || !wsPath) throw new Error('Chrome did not publish a DevTools port');

    this.ws = new WebSocket(`ws://127.0.0.1:${port}${wsPath}`);
    await new Promise<void>((resolve, reject) => {
      this.ws.addEventListener('open', () => resolve(), { once: true });
      this.ws.addEventListener('error', () => reject(new Error('CDP socket failed')), { once: true });
    });
    this.ws.addEventListener('message', (event) => {
      const msg = JSON.parse(String((event as MessageEvent).data));
      if (msg.id == null) return;
      const slot = this.pending.get(msg.id);
      if (!slot) return;
      this.pending.delete(msg.id);
      if (msg.error) slot.reject(new Error(JSON.stringify(msg.error)));
      else slot.resolve(msg.result);
    });

    const { targetId } = await this.send('Target.createTarget', { url: 'about:blank' });
    const attached = await this.send('Target.attachToTarget', { targetId, flatten: true });
    this.sessionId = attached.sessionId;
    await this.send('Runtime.enable', {}, this.sessionId);
  }

  send(method: string, params: unknown = {}, sessionId?: string): Promise<any> {
    const id = ++this.id;
    const payload: Record<string, unknown> = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    this.ws.send(JSON.stringify(payload));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.delete(id)) reject(new Error(`CDP timeout: ${method}`));
      }, 120_000);
    });
  }

  async evaluate(expression: string) {
    const res = await this.send(
      'Runtime.evaluate',
      { expression, awaitPromise: true, returnByValue: true, timeout: 110_000 },
      this.sessionId,
    );
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description ?? JSON.stringify(res.exceptionDetails));
    }
    return res.result.value;
  }

  async close() {
    try { this.ws?.close(); } catch { /* ignore */ }
    this.proc?.kill('SIGKILL');
    try { fs.rmSync(this.dir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}

// ---------------------------------------------------------------------------
// In-page harness. Everything heavy (renders, correlations) runs on the page and
// only summary numbers cross the protocol.
// ---------------------------------------------------------------------------

function harness(vert: string, frag: string) {
  return `(() => {
const VERT = ${JSON.stringify(vert)};
const FRAG = ${JSON.stringify(frag)};
const W = 512, H = 512;
const out = { compile: {}, uniforms: {}, checks: {} };

const canvas = document.createElement('canvas');
canvas.width = W; canvas.height = H;
const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, preserveDrawingBuffer: true });
if (!gl) return { fatal: 'WebGL2 unavailable' };
out.renderer = gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info')?.UNMASKED_RENDERER_WEBGL ?? gl.RENDERER);
out.glVersion = gl.getParameter(gl.VERSION);

function compile(type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src); gl.compileShader(sh);
  return { sh, ok: gl.getShaderParameter(sh, gl.COMPILE_STATUS), log: gl.getShaderInfoLog(sh) || '' };
}
const vs = compile(gl.VERTEX_SHADER, VERT);
const fs = compile(gl.FRAGMENT_SHADER, FRAG);
out.compile = { vertexOk: !!vs.ok, vertexLog: vs.log, fragmentOk: !!fs.ok, fragmentLog: fs.log };
if (!fs.ok || !vs.ok) return out;

const prog = gl.createProgram();
gl.attachShader(prog, vs.sh); gl.attachShader(prog, fs.sh);
gl.bindAttribLocation(prog, 0, 'a_position');
gl.linkProgram(prog);
out.compile.linkOk = !!gl.getProgramParameter(prog, gl.LINK_STATUS);
out.compile.linkLog = gl.getProgramInfoLog(prog) || '';
if (!out.compile.linkOk) return out;
gl.useProgram(prog);

// A uniform that never reaches the output is eliminated by the GLSL compiler and
// its location comes back null. Non-null is first-order evidence it is live.
const NAMES = ['u_tex','u_resolution','u_time','u_intensity','u_seed','u_reducedMotion',
               'u_glitch','u_blockSize','u_speed','u_displacement','u_rgbShift'];
const loc = {};
for (const n of NAMES) { loc[n] = gl.getUniformLocation(prog, n); out.uniforms[n] = loc[n] !== null; }
const activeCount = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
out.compile.activeUniforms = [];
for (let i = 0; i < activeCount; i++) out.compile.activeUniforms.push(gl.getActiveUniform(prog, i).name);

const quad = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quad);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
gl.disable(gl.BLEND);

const tex = gl.createTexture();
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, tex);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

// ---- test inputs ----------------------------------------------------------
function c2d() { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; }
function imgText() {
  const c = c2d(), x = c.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0,0,W,H);
  x.fillStyle = '#fff'; x.font = 'bold 56px monospace'; x.textBaseline = 'top';
  ['KIMCHE','PENDIENTE','DE','VERIFICACION','KODEX 07'].forEach((s,i) => x.fillText(s, 18, 24 + i*96));
  return x.getImageData(0,0,W,H);
}
function imgTextMoved() {
  const c = c2d(), x = c.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0,0,W,H);
  x.fillStyle = '#fff'; x.font = 'bold 44px monospace'; x.textBaseline = 'top';
  ['NGEN','WALLMAPU','MACHI','TRAWUN'].forEach((s,i) => x.fillText(s, 250 - i*40, 400 - i*88));
  return x.getImageData(0,0,W,H);
}
function imgCheck() {
  const c = c2d(), x = c.getContext('2d'), d = x.createImageData(W,H);
  for (let y=0;y<H;y++) for (let px=0;px<W;px++) {
    const i = (y*W+px)*4, v = ((px>>3) + (y>>3)) % 2 ? 255 : 0;
    d.data[i]=v; d.data[i+1]=255-v; d.data[i+2]=(px*255/W)|0; d.data[i+3]=255;
  }
  return d;
}
function imgFlat() {
  const c = c2d(), x = c.getContext('2d'), d = x.createImageData(W,H);
  for (let y=0;y<H;y++) for (let px=0;px<W;px++) {
    const i=(y*W+px)*4; d.data[i]=128; d.data[i+1]=128; d.data[i+2]=128; d.data[i+3]=255;
  }
  return d;
}
const INPUTS = { text: imgText(), moved: imgTextMoved(), check: imgCheck(), flat: imgFlat() };

const CANON = { u_glitch: 0.62, u_blockSize: 64, u_speed: 1.8, u_displacement: 0.15, u_rgbShift: 0.5 };
const BASE = Object.assign({ u_time: 2.5, u_intensity: 1.0, u_seed: 4.137, u_reducedMotion: 0 }, CANON);

function render(input, over) {
  const u = Object.assign({}, BASE, over || {});
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, input);
  gl.uniform1i(loc.u_tex, 0);
  gl.uniform2f(loc.u_resolution, W, H);
  for (const k of ['u_time','u_intensity','u_seed','u_reducedMotion','u_glitch','u_blockSize','u_speed','u_displacement','u_rgbShift']) {
    gl.uniform1f(loc[k], u[k]);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0,0,W,H);
  gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  const buf = new Uint8Array(W*H*4);
  gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,buf);
  return buf;
}

// ---- measures -------------------------------------------------------------
function identical(a,b) { if (a.length!==b.length) return false; for (let i=0;i<a.length;i++) if (a[i]!==b[i]) return false; return true; }
function fnv(buf) { let h = 0x811c9dc5; for (let i=0;i<buf.length;i++) { h ^= buf[i]; h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16); }
function diffStats(a,b) {
  let sum=0, max=0, n=0;
  for (let i=0;i<a.length;i+=4) {
    const d = (Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]))/3;
    sum+=d; if (d>max) max=d; if (d>2) n++;
  }
  const px = a.length/4;
  return { meanAbsDelta:+(sum/px).toFixed(4), maxAbsDelta:max, pctPixelsChanged:+(100*n/px).toFixed(2) };
}
function luma(buf) {
  const l = new Float64Array(W*H);
  for (let i=0,j=0;i<buf.length;i+=4,j++) l[j] = 0.2126*buf[i] + 0.7152*buf[i+1] + 0.0722*buf[i+2];
  return l;
}
function pearson(a,b) {
  const n=a.length; let ma=0,mb=0;
  for (let i=0;i<n;i++){ma+=a[i];mb+=b[i];} ma/=n; mb/=n;
  let sab=0,saa=0,sbb=0;
  for (let i=0;i<n;i++){const da=a[i]-ma,db=b[i]-mb; sab+=da*db; saa+=da*da; sbb+=db*db;}
  if (saa===0||sbb===0) return 0;
  return sab/Math.sqrt(saa*sbb);
}
function tiles(l, g) {
  const t=[], tw=W/g, th=H/g;
  for (let ty=0;ty<g;ty++) for (let tx=0;tx<g;tx++) {
    const v=new Float64Array(tw*th); let k=0;
    for (let y=ty*th;y<(ty+1)*th;y++) for (let x=tx*tw;x<(tx+1)*tw;x++) v[k++]=l[y*W+x];
    t.push(v);
  }
  return t;
}
// Does any output tile carry recoverable information about any input tile?
//
// The naive statistic — max |r| over every (output tile, input tile) pair — is
// useless on its own: at a 16x16 grid that is 65536 pairs, so a high max is what
// chance produces. It is also invariant to how the tiles are matched up, which is
// exactly the thing that would carry information.
//
// The measure used here is a permutation test on alignment. Compare the aligned
// correlations |r(output_i, input_i)| against the distribution obtained by
// matching output tiles to input tiles at random. If the true alignment is
// indistinguishable from a random matching, an observer holding the output learns
// nothing about where anything was in the input.
function tileCorrelation(inBuf, outBuf, g) {
  const A = tiles(luma(inBuf), g), B = tiles(luma(outBuf), g);
  const n = A.length;
  const M = new Float64Array(n*n);
  for (let i=0;i<n;i++) for (let j=0;j<n;j++) M[i*n+j] = Math.abs(pearson(B[i], A[j]));

  let maxAny=0, alignedMax=0, alignedSum=0, selfBest=0;
  for (let i=0;i<n;i++) {
    let best=-1, bestIdx=-1;
    for (let j=0;j<n;j++) { const r=M[i*n+j]; if (r>maxAny) maxAny=r; if (r>best) { best=r; bestIdx=j; } }
    const s = M[i*n+i];
    if (s>alignedMax) alignedMax=s;
    alignedSum += s;
    if (bestIdx===i) selfBest++;
  }
  const alignedMean = alignedSum/n;

  let seed = 987654321;
  const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const perm = new Int32Array(n); for (let i=0;i<n;i++) perm[i]=i;
  const K = 500, permMax = [], permMean = [];
  for (let k=0;k<K;k++) {
    for (let i=n-1;i>0;i--) { const j=(rnd()*(i+1))|0; const t=perm[i]; perm[i]=perm[j]; perm[j]=t; }
    let mx=0, sm=0;
    for (let i=0;i<n;i++) { const r=M[i*n+perm[i]]; if (r>mx) mx=r; sm+=r; }
    permMax.push(mx); permMean.push(sm/n);
  }
  const pMean = permMean.filter(v => v >= alignedMean).length / K;
  const pMax  = permMax.filter(v => v >= alignedMax).length / K;
  const avg = (a) => a.reduce((x,y)=>x+y,0)/a.length;
  return {
    tiles: n,
    maxAbsRAnyPair: +maxAny.toFixed(4),
    alignedMaxR: +alignedMax.toFixed(4),
    alignedMeanR: +alignedMean.toFixed(4),
    permNullMeanR: +avg(permMean).toFixed(4),
    permNullMaxR: +avg(permMax).toFixed(4),
    pValueAlignedMean: +pMean.toFixed(4),
    pValueAlignedMax: +pMax.toFixed(4),
    selfIdentifiedRate: +(selfBest/n).toFixed(4),
    chanceRate: +(1/n).toFixed(4),
  };
}

// ---- 1. bit-exact passthrough at intensity 0 ------------------------------
// Row-order note: readPixels returns rows bottom-up while ImageData is top-down,
// and v_uv.y=0 maps to the bottom of the framebuffer. The two conventions cancel,
// so a direct byte comparison against the ImageData is the identity check. This
// is the same uv convention every other shader in the pipeline uses; the source
// texture there is produced by source.frag.glsl in that convention, never by an
// ImageData upload, so nothing here is orientation-specific to this shader.
{
  const inp = INPUTS.text;
  const got = render(inp, { u_intensity: 0.0 });
  let max = 0, bad = 0;
  for (let i=0;i<got.length;i+=4) {
    for (let c=0;c<3;c++) { const d=Math.abs(got[i+c]-inp.data[i+c]); if (d>max) max=d; if (d>0) bad++; }
  }
  out.checks.passthrough = { maxChannelDelta: max, differingSamples: bad, exact: max===0 };
}

// ---- 2. veil is total: output independent of input -----------------------
{
  const byIntensity = {};
  for (const it of [0.6, 0.8, 1.0]) {
    const a = render(INPUTS.text,  { u_intensity: it });
    const b = render(INPUTS.moved, { u_intensity: it });
    const c = render(INPUTS.check, { u_intensity: it });
    const d = render(INPUTS.flat,  { u_intensity: it });
    byIntensity[it] = {
      textVsMoved: identical(a,b), textVsCheck: identical(a,c), textVsFlat: identical(a,d),
      differsFromInput: diffStats(a, INPUTS.text.data).meanAbsDelta,
    };
  }
  out.checks.independence = byIntensity;
}

// ---- 3. unrecoverability measures at full veil ---------------------------
{
  const o = render(INPUTS.text, { u_intensity: 1.0 });
  const l_in = luma(INPUTS.text.data), l_out = luma(o);
  // How many distinct outputs do structurally unrelated inputs produce? One
  // means the shader is a constant function of its input: zero bits leaked.
  const hashes = new Set();
  for (const k of Object.keys(INPUTS)) hashes.add(fnv(render(INPUTS[k], { u_intensity: 1.0 })));
  out.checks.unrecoverable = {
    distinctOutputsForDistinctInputs: hashes.size,
    inputsTried: Object.keys(INPUTS).length,
    wholeFrameR: +Math.abs(pearson(l_in, l_out)).toFixed(4),
    tiles8: tileCorrelation(INPUTS.text.data, o, 8),
    tiles16: tileCorrelation(INPUTS.text.data, o, 16),
  };
  // honest curve across the transition range
  const curve = [];
  for (const it of [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0]) {
    const r = render(INPUTS.text, { u_intensity: it });
    curve.push({ intensity: it, wholeFrameR: +Math.abs(pearson(l_in, luma(r))).toFixed(4) });
  }
  out.checks.legibilityCurve = curve;
  // luminance envelope, for the "no strobe / restrained" claim
  let lo=255, hi=0, sum=0;
  for (let i=0;i<l_out.length;i++){ if(l_out[i]<lo)lo=l_out[i]; if(l_out[i]>hi)hi=l_out[i]; sum+=l_out[i]; }
  out.checks.envelope = { minLuma:+(lo/255).toFixed(3), maxLuma:+(hi/255).toFixed(3), meanLuma:+(sum/l_out.length/255).toFixed(3) };
}

// ---- 4. every canonical parameter moves the output -----------------------
{
  const base = render(INPUTS.text, {});
  const probes = {
    u_glitch:       [0.0, 1.0],
    u_blockSize:    [16, 128],
    u_speed:        [0.4, 6.0],
    u_displacement: [0.0, 0.45],
    u_rgbShift:     [0.0, 1.0],
  };
  const res = {};
  for (const [name, vals] of Object.entries(probes)) {
    res[name] = vals.map((v) => {
      const r = render(INPUTS.text, { [name]: v });
      return Object.assign({ value: v }, diffStats(base, r));
    });
  }
  // rgb_shift specifically: does it separate the channels?
  function chromaSpread(buf) {
    let s = 0;
    for (let i=0;i<buf.length;i+=4) s += Math.max(buf[i],buf[i+1],buf[i+2]) - Math.min(buf[i],buf[i+1],buf[i+2]);
    return +(s/(buf.length/4)).toFixed(4);
  }
  res.rgbShiftChromaSpread = {
    off: chromaSpread(render(INPUTS.text, { u_rgbShift: 0.0 })),
    canonical: chromaSpread(render(INPUTS.text, {})),
    wide: chromaSpread(render(INPUTS.text, { u_rgbShift: 1.0 })),
  };
  out.checks.parameters = res;
}

// ---- 5. reduced motion: still withheld, held still ------------------------
{
  const t0 = render(INPUTS.text, { u_reducedMotion: 1, u_time: 0.0 });
  const t1 = render(INPUTS.text, { u_reducedMotion: 1, u_time: 7.3 });
  const t2 = render(INPUTS.text, { u_reducedMotion: 1, u_time: 91.75 });
  const m0 = render(INPUTS.text, { u_reducedMotion: 0, u_time: 0.0 });
  const m1 = render(INPUTS.text, { u_reducedMotion: 0, u_time: 7.3 });
  const other = render(INPUTS.check, { u_reducedMotion: 1, u_time: 7.3 });
  out.checks.reducedMotion = {
    staticAcrossTime: identical(t0,t1) && identical(t1,t2),
    motionWhenAllowed: !identical(m0,m1),
    motionDelta: diffStats(m0,m1),
    stillIndependentOfInput: identical(t1, other),
    tiles16: tileCorrelation(INPUTS.text.data, t1, 16),
  };
}

// ---- 6. seed varies the field without touching content -------------------
{
  const a = render(INPUTS.text, { u_seed: 4.137 });
  const b = render(INPUTS.text, { u_seed: 19.4 });
  out.checks.seed = Object.assign({ differs: !identical(a,b) }, diffStats(a,b));
}

return out;
})()`;
}

// ---------------------------------------------------------------------------

const chrome = new Chrome();
let R: any;

before(async () => {
  assert.ok(fs.existsSync(CHROME), `Chrome not found at ${CHROME}`);
  await chrome.launch();
  R = await chrome.evaluate(harness(VERT, FRAG));
  assert.ok(!R?.fatal, `harness failed: ${R?.fatal}`);
  console.log('renderer:', R.renderer, '|', R.glVersion);
  console.log(JSON.stringify(R.checks, null, 2));
});

after(async () => { await chrome.close(); });

test('fragment shader compiles and links in WebGL2', () => {
  assert.equal(R.compile.fragmentOk, true, `fragment log: ${R.compile.fragmentLog}`);
  assert.equal(R.compile.vertexOk, true, `vertex log: ${R.compile.vertexLog}`);
  assert.equal(R.compile.linkOk, true, `link log: ${R.compile.linkLog}`);
});

test('every declared uniform survives compilation as an active uniform', () => {
  for (const [name, live] of Object.entries(R.uniforms)) {
    assert.equal(live, true, `${name} was optimised out — it does not reach the output`);
  }
});

test('u_intensity 0 is a bit-exact passthrough', () => {
  assert.equal(R.checks.passthrough.exact, true,
    `max channel delta ${R.checks.passthrough.maxChannelDelta} over ${R.checks.passthrough.differingSamples} samples`);
});

test('at full veil the output does not depend on the input at all', () => {
  for (const [intensity, v] of Object.entries<any>(R.checks.independence)) {
    assert.equal(v.textVsMoved, true, `intensity ${intensity}: output changed with input`);
    assert.equal(v.textVsCheck, true, `intensity ${intensity}: output changed with input`);
    assert.equal(v.textVsFlat, true, `intensity ${intensity}: output changed with input`);
    assert.ok(v.differsFromInput > 8, `intensity ${intensity}: output is too close to the input`);
  }
});

test('legible text is unrecoverable at full veil', () => {
  const u = R.checks.unrecoverable;
  // The decisive measure: structurally unrelated inputs all produce the same
  // bytes, so the shader is a constant function of its input at full veil.
  assert.equal(u.distinctOutputsForDistinctInputs, 1,
    `${u.inputsTried} unrelated inputs produced ${u.distinctOutputsForDistinctInputs} distinct outputs — the input leaks`);
  assert.ok(u.wholeFrameR < 0.1, `whole-frame |r| = ${u.wholeFrameR}`);
  for (const key of ['tiles8', 'tiles16']) {
    const t = u[key];
    // Permutation test: the true tile alignment must be indistinguishable from a
    // random matching of output tiles to input tiles.
    assert.ok(t.pValueAlignedMean > 0.01,
      `${key}: aligned mean |r| ${t.alignedMeanR} beats the random-matching null (p=${t.pValueAlignedMean})`);
    assert.ok(t.pValueAlignedMax > 0.01,
      `${key}: aligned max |r| ${t.alignedMaxR} beats the random-matching null (p=${t.pValueAlignedMax})`);
    assert.ok(t.selfIdentifiedRate <= t.chanceRate * 3 + 0.02,
      `${key}: output tiles identify their own input tile at ${t.selfIdentifiedRate} vs chance ${t.chanceRate}`);
  }
});

// The transition range is legible by construction — it is a crossfade. This test
// pins where the veil becomes total, so the wiring can state a safe resting value.
// The withheld state must be entered AT u_intensity 1, never ramped up into; only
// the resolve direction (1 -> 0) may be animated.
test('the veil is total from u_intensity 0.6 upward, and only there', () => {
  const curve: { intensity: number; wholeFrameR: number }[] = R.checks.legibilityCurve;
  const at = (i: number) => curve.find((c) => c.intensity === i)!.wholeFrameR;
  assert.equal(at(0), 1, 'intensity 0 must be a perfect passthrough');
  for (const i of [0.6, 0.8, 1.0]) {
    assert.ok(at(i) < 0.05, `intensity ${i} still correlates ${at(i)} with the input`);
  }
  // Recorded, not asserted away: below 0.6 the input is still substantially present.
  assert.ok(at(0.4) > 0.5,
    'the transition range is expected to be legible — if it is not, this note is stale');
});

test('the veiled field stays inside a restrained, non-strobing luminance envelope', () => {
  const e = R.checks.envelope;
  assert.ok(e.maxLuma <= 0.45, `peak luma ${e.maxLuma} is too bright for a refusal`);
  assert.ok(e.meanLuma < 0.25, `mean luma ${e.meanLuma} is too bright for a refusal`);
  // Obsidian, the page ground, is #0a0a0a = 0.039. The withheld panel must never
  // fall to it, or it reads as content that failed to load rather than as refusal.
  assert.ok(e.minLuma > 0.045, `darkest cell ${e.minLuma} sinks into the page ground`);
});

test('glitch 0.62 — changes how much of the field is unresolved', () => {
  const [off, full] = R.checks.parameters.u_glitch;
  assert.ok(off.pctPixelsChanged > 5, `u_glitch=0 moved only ${off.pctPixelsChanged}% of pixels`);
  assert.ok(full.pctPixelsChanged > 5, `u_glitch=1 moved only ${full.pctPixelsChanged}% of pixels`);
});

test('block_size 64 — changes the fracture geometry', () => {
  for (const p of R.checks.parameters.u_blockSize) {
    assert.ok(p.pctPixelsChanged > 10, `u_blockSize=${p.value} moved only ${p.pctPixelsChanged}% of pixels`);
  }
});

test('speed 1.8 — changes the decode cadence', () => {
  for (const p of R.checks.parameters.u_speed) {
    assert.ok(p.pctPixelsChanged > 5, `u_speed=${p.value} moved only ${p.pctPixelsChanged}% of pixels`);
  }
});

test('displacement 0.15 — changes the tear amplitude', () => {
  for (const p of R.checks.parameters.u_displacement) {
    assert.ok(p.pctPixelsChanged > 5, `u_displacement=${p.value} moved only ${p.pctPixelsChanged}% of pixels`);
  }
});

test('rgb_shift 0.5 — changes the channel separation', () => {
  for (const p of R.checks.parameters.u_rgbShift) {
    assert.ok(p.pctPixelsChanged > 2, `u_rgbShift=${p.value} moved only ${p.pctPixelsChanged}% of pixels`);
  }
  const s = R.checks.parameters.rgbShiftChromaSpread;
  assert.ok(s.off < s.canonical, `rgb_shift 0 (${s.off}) should be less chromatic than canonical (${s.canonical})`);
  assert.ok(s.canonical < s.wide, `canonical (${s.canonical}) should be less chromatic than wide (${s.wide})`);
});

test('u_reducedMotion holds the frame still but keeps withholding', () => {
  const r = R.checks.reducedMotion;
  assert.equal(r.staticAcrossTime, true, 'the field still animates under reduced motion');
  assert.equal(r.motionWhenAllowed, true, 'the field does not animate when motion is allowed');
  assert.equal(r.stillIndependentOfInput, true, 'reduced-motion output leaks the input');
  assert.ok(r.tiles16.pValueAlignedMean > 0.01,
    `reduced motion: aligned mean |r| ${r.tiles16.alignedMeanR} beats the random-matching null (p=${r.tiles16.pValueAlignedMean})`);
  assert.ok(r.tiles16.selfIdentifiedRate <= r.tiles16.chanceRate * 3 + 0.02,
    `reduced motion: tiles self-identify at ${r.tiles16.selfIdentifiedRate} vs chance ${r.tiles16.chanceRate}`);
});

test('u_seed varies the field between nodes', () => {
  assert.equal(R.checks.seed.differs, true, 'u_seed has no effect');
  assert.ok(R.checks.seed.pctPixelsChanged > 5, `u_seed moved only ${R.checks.seed.pctPixelsChanged}% of pixels`);
});
