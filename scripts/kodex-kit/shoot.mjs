#!/usr/bin/env node
/**
 * KODEX kit — render a page at a true viewport and measure it.
 *
 * Every workaround in this file was paid for by an agent that lost hours to it.
 * Read `README.md` in this directory before changing anything here.
 *
 *   node shoot.mjs <url> <out.png> [preset] [--audit] [--eval "<js>"]
 *
 * preset: desktop | 390 | 412 | tablet   (default desktop)
 */
import fs from 'node:fs';
import net from 'node:net';
import { spawn } from 'node:child_process';

const CHROME =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Chrome clamps --window-size to a 500px minimum on macOS, so a "390px"
// screenshot is really a 500px layout cropped to 390 — it invents overflow
// that is not there and hides overflow that is. Emulation.setDeviceMetricsOverride
// is the only way to get a genuine phone viewport. Three agents hit this.
const PRESETS = {
  desktop: { width: 1440, height: 900, dsf: 2, mobile: false },
  tablet: { width: 768, height: 1024, dsf: 2, mobile: true },
  390: { width: 390, height: 844, dsf: 3, mobile: true },
  412: { width: 412, height: 915, dsf: 3, mobile: true },
};

const [, , url, out, presetName = 'desktop', ...rest] = process.argv;
if (!url || !out) {
  console.error('usage: shoot.mjs <url> <out.png> [desktop|390|412|tablet] [--audit] [--eval "js"]');
  process.exit(2);
}
const preset = PRESETS[presetName];
if (!preset) {
  console.error(`unknown preset "${presetName}" — one of: ${Object.keys(PRESETS).join(', ')}`);
  process.exit(2);
}
const wantAudit = rest.includes('--audit');
const evalIdx = rest.indexOf('--eval');
const userEval = evalIdx >= 0 ? rest[evalIdx + 1] : null;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function freePort() {
  return new Promise((res) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => {
      const p = s.address().port;
      s.close(() => res(p));
    });
  });
}

// --enable-unsafe-swiftshader is required: plain --disable-gpu hangs forever on
// any page that initialises WebGL, and most KODEX scenes do.
async function launchChrome(port, profile) {
  const child = spawn(
    CHROME,
    [
      '--headless=new',
      '--no-sandbox',
      '--hide-scrollbars',
      '--enable-unsafe-swiftshader',
      '--use-angle=swiftshader',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`, // a shared profile hangs; each run gets its own
      'about:blank',
    ],
    { stdio: 'ignore', detached: false },
  );
  for (let i = 0; i < 60; i++) {
    await wait(250);
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (r.ok) return child;
    } catch {}
  }
  child.kill();
  throw new Error('chrome did not expose its debugging port');
}

async function connect(port) {
  const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const target = list.find((t) => t.type === 'page');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map();
  const events = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    } else if (m.method) events.push(m);
  };
  const send = (method, params = {}) =>
    new Promise((res) => {
      const i = ++id;
      pending.set(i, res);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  return { ws, send, events, raw: () => ++id };
}

// The audit the agents kept rewriting by hand, standardised.
// Returns only real problems, so an empty report means the page is clean.
const AUDIT = `(() => {
  const vw = document.documentElement.clientWidth;
  const out = { viewport: vw, horizontalScroll: null, overflowing: [], smallTargets: [], missingAlt: 0, overlaps: [] };

  if (document.documentElement.scrollWidth > vw + 1) {
    out.horizontalScroll = { scrollWidth: document.documentElement.scrollWidth, clientWidth: vw };
  }

  const els = [...document.querySelectorAll('body *')];
  const vis = (e) => {
    const s = getComputedStyle(e);
    return s.display !== 'none' && s.visibility !== 'hidden' && +s.opacity > 0.01;
  };
  const label = (e) =>
    e.tagName.toLowerCase() +
    (e.id ? '#' + e.id : '') +
    (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\\s+/).slice(0, 2).join('.') : '');

  for (const e of els) {
    if (!vis(e)) continue;
    const r = e.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right > vw + 1 || r.left < -1) {
      out.overflowing.push({ el: label(e), left: Math.round(r.left), right: Math.round(r.right) });
    }
  }

  // layout.touchTargetMin is 44px in kodex.tokens.json — this checks against the
  // system's own token rather than an outside rule.
  if (vw < 900) {
    const tappable = [...document.querySelectorAll('a[href],button,input,select,summary,[role="button"],[tabindex]:not([tabindex="-1"])')];
    for (const e of tappable) {
      if (!vis(e)) continue;
      const r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.width < 44 || r.height < 44) {
        out.smallTargets.push({ el: label(e), w: Math.round(r.width), h: Math.round(r.height) });
      }
    }
  }

  out.missingAlt = [...document.querySelectorAll('img:not([alt])')].length;

  // Text-bearing elements that visually intersect. This is the check that would
  // have caught the CTA sitting under the fixed deckbar, and the "SYS" marker
  // overlapping its own button label.
  const text = els.filter((e) => vis(e) && e.children.length === 0 && (e.textContent || '').trim().length > 1);
  for (let i = 0; i < text.length; i++) {
    for (let j = i + 1; j < text.length; j++) {
      const a = text[i].getBoundingClientRect();
      const b = text[j].getBoundingClientRect();
      if (a.width * a.height === 0 || b.width * b.height === 0) continue;
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox > 4 && oy > 4 && !text[i].contains(text[j]) && !text[j].contains(text[i])) {
        out.overlaps.push({ a: label(text[i]), b: label(text[j]), w: Math.round(ox), h: Math.round(oy) });
      }
    }
  }
  out.overlaps = out.overlaps.slice(0, 25);
  return out;
})()`;

const port = await freePort();
const profile = fs.mkdtempSync('/tmp/kodex-kit-chrome-');
const chrome = await launchChrome(port, profile);
let code = 0;

try {
  const { ws, send, events } = await connect(port);
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: preset.width,
    height: preset.height,
    deviceScaleFactor: preset.dsf,
    mobile: preset.mobile,
  });
  await send('Page.navigate', { url });
  await wait(3000);

  // A late webfont swap makes text look clipped when it is not. One agent
  // nearly "fixed" a phantom overflow because of this.
  await send('Runtime.evaluate', {
    expression: 'document.fonts.ready.then(()=>1)',
    awaitPromise: true,
  });
  await wait(1200);

  if (userEval) {
    const r = await send('Runtime.evaluate', { expression: userEval, returnByValue: true, awaitPromise: true });
    console.log(JSON.stringify(r.result?.result?.value ?? r.result, null, 1));
  }

  if (wantAudit) {
    const r = await send('Runtime.evaluate', { expression: AUDIT, returnByValue: true });
    const a = r.result?.result?.value;
    console.log(`AUDIT ${presetName} ${url}`);
    console.log(JSON.stringify(a, null, 1));
    const clean =
      a && !a.horizontalScroll && !a.overflowing.length && !a.smallTargets.length && !a.overlaps.length && !a.missingAlt;
    console.log(clean ? 'AUDIT: CLEAN' : 'AUDIT: PROBLEMS FOUND');
    if (!clean) code = 3;
  }

  // Page.captureScreenshot never returns on a page running an unconditional
  // requestAnimationFrame loop, and several KODEX scenes do exactly that.
  // Grabbing the first screencast frame always works.
  let frame = null;
  await send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
  for (let k = 0; k < 80 && !frame; k++) {
    await wait(120);
    for (const e of events.filter((e) => e.method === 'Page.screencastFrame')) {
      if (!frame) frame = e.params.data;
      await send('Page.screencastFrameAck', { sessionId: e.params.sessionId });
    }
  }
  await send('Page.stopScreencast');

  if (!frame) {
    console.error('NO FRAME — the page never painted');
    code = 1;
  } else {
    fs.writeFileSync(out, Buffer.from(frame, 'base64'));
    console.log(`WROTE ${out} ${fs.statSync(out).size} bytes @ ${preset.width}x${preset.height}`);
    // A ~34KB png is the server-not-ready error page, not your page.
    if (fs.statSync(out).size < 60000) {
      console.error('WARNING: suspiciously small capture — is the server actually up?');
    }
  }
  ws.close();
} finally {
  chrome.kill();
  fs.rmSync(profile, { recursive: true, force: true });
}
process.exit(code);
