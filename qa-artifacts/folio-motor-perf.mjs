import { chromium } from 'playwright';
import fs from 'node:fs';

const scenes = {
  prologue: { url: 'http://127.0.0.1:4321/kodex/folio/i/', motor: 'KDX-FX-001' },
  descent: { url: 'http://127.0.0.1:4321/kodex/folio/ii/', motor: 'KDX-FX-003' },
  machine: { url: 'http://127.0.0.1:4321/kodex/folio/iv/', motor: 'KDX-FX-004' },
  return: { url: 'http://127.0.0.1:4321/kodex/folio/vi/', motor: 'KDX-FX-006' },
};

const browser = await chromium.launch({ headless: true });
const OUT = 'qa-artifacts/folio-motor';
fs.mkdirSync(OUT, { recursive: true });

const results = [];
for (const [name, scene] of Object.entries(scenes)) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(scene.url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const count = await page.locator('[data-kdx-effect-canvas]').count();
  const effect = count ? await page.locator('[data-kdx-effect-canvas]').first().getAttribute('data-effect-id') : null;
  const painted = await page.evaluate(() => {
    const c = document.querySelector('[data-kdx-effect-canvas] canvas');
    if (!c) return false;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) return false;
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let bright = 0;
    const stride = Math.max(4, Math.floor((c.width * c.height) / 4000)) * 4;
    for (let i = 0; i < d.length; i += stride) if (d[i] + d[i + 1] + d[i + 2] > 48) bright += 1;
    return bright > 6;
  });

  const perf = await page.evaluate(() => new Promise((resolve) => {
    const c = document.querySelector('[data-kdx-effect-canvas] canvas');
    if (!c) return resolve({ fps: null, avgFrameMs: null, dropped: null });
    const frames = [];
    let last = performance.now();
    const raf = (now) => {
      if (frames.length >= 30) {
        const times = frames.slice(1);
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const slow = times.filter((t) => t > 33).length;
        resolve({ fps: Math.round(1000 / avg), avgFrameMs: Math.round(avg * 10) / 10, dropped: slow });
        return;
      }
      frames.push(now - last);
      last = now;
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }));

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  const errorsAfter = errors.length;
  results.push({ scene: name, url: scene.url, effect, count, painted, perf, overflow, errors: errorsAfter, consoleErrors: errors.slice(0, 3) });
  console.log(`${name}: effect=${effect} painted=${painted} fps=${perf.fps} avg=${perf.avgFrameMs}ms dropped>33ms=${perf.dropped} overflow=${overflow} err=${errorsAfter}`);
  await page.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/perf.json`, JSON.stringify(results, null, 2));
console.log('DONE');
