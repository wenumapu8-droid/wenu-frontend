import { chromium } from 'playwright';
import fs from 'node:fs';

const url = 'http://127.0.0.1:4321/kodex/archive/conjuncion/';
const OUT = 'qa-artifacts/archive-motor';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const specs = [
  { name: 'desktop', width: 1440, height: 1000, mobile: false },
  { name: '390x844', width: 390, height: 844, mobile: true },
  { name: '412x915', width: 412, height: 915, mobile: true },
];

const results = [];
for (const spec of specs) {
  const context = await browser.newContext({
    viewport: { width: spec.width, height: spec.height },
    hasTouch: spec.mobile,
    isMobile: spec.mobile,
  });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);

  assert(await page.locator('[data-kdx-effect-canvas]').count() === 1, `${spec.name} motor canvas missing`);
  const effectId = await page.locator('[data-kdx-effect-canvas]').getAttribute('data-effect-id');
  assert(effectId === 'KDX-FX-005', `${spec.name} wrong effect: ${effectId}`);
  assert(await page.locator('.kx-frame--chapter img').count() >= 1, `${spec.name} artwork missing`);

  const canvasPainted = await page.evaluate(() => {
    const c = document.querySelector('[data-kdx-effect-canvas] canvas');
    if (!c) return false;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) return false;
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let bright = 0;
    const stride = Math.max(4, Math.floor((c.width * c.height) / 3000)) * 4;
    for (let i = 0; i < d.length; i += stride) {
      if (d[i] + d[i + 1] + d[i + 2] > 48) bright += 1;
    }
    return bright > 6;
  });
  assert(canvasPainted, `${spec.name} motor did not paint`);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(overflow <= 1, `${spec.name} horizontal overflow: ${overflow}`);

  const animating = await page.evaluate(() => {
    const fig = document.querySelector('[data-kdx-effect-canvas]');
    return fig && fig.dataset.animate === '1';
  });
  assert(animating, `${spec.name} animate flag missing`);

  await page.screenshot({ path: `${OUT}/${spec.name}.png`, fullPage: true });
  assert(errors.length === 0, `${spec.name} browser errors: ${errors.join(' | ')}`);
  results.push({ viewport: spec.name, effectId, painted: canvasPainted, animating, overflow });
  await context.close();
  console.log(`${spec.name}: OK effect=${effectId} painted=${canvasPainted} animating=${animating}`);
}

await browser.close();
fs.writeFileSync(`${OUT}/acceptance.json`, JSON.stringify({ ok: true, results, at: new Date().toISOString() }, null, 2));
console.log('DONE');
