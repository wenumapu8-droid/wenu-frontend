import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence');
await fs.mkdir(outputDir, { recursive: true });

const profiles = [
  { key: 'desktop', width: 1440, height: 900, reducedMotion: 'no-preference' },
  { key: 'mobile-390', width: 390, height: 844, reducedMotion: 'no-preference', isMobile: true, hasTouch: true },
  { key: 'reduced', width: 1280, height: 800, reducedMotion: 'reduce' },
];

const expectedPlans = {
  THRESHOLD: 'KDX-DEMO-THRESHOLD-001',
  SIGNAL_FIELD: 'KDX-DEMO-SIGNAL-FIELD-001',
  AUDIO_ORGANISM: 'KDX-DEMO-AUDIO-ORGANISM-001',
};

const report = { baseURL, generatedAt: new Date().toISOString(), cases: [], errors: [] };
const browser = await chromium.launch({ headless: true });
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const formatError = (error) => String(error?.stack || error?.message || error);

async function samplePaintedSignal(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('#kdx-engine-canvas');
    if (!(canvas instanceof HTMLCanvasElement)) return { painted: 0, samples: 0, webgl2: false };
    const gl = canvas.getContext('webgl2');
    if (!gl || !canvas.width || !canvas.height) return { painted: 0, samples: 0, webgl2: false };
    const points = [[0.5, 0.5], [0.3, 0.5], [0.7, 0.5], [0.5, 0.3], [0.5, 0.7]];
    const pixel = new Uint8Array(4);
    let painted = 0;
    for (const [nx, ny] of points) {
      const x = Math.max(0, Math.min(canvas.width - 1, Math.floor(canvas.width * nx)));
      const y = Math.max(0, Math.min(canvas.height - 1, Math.floor(canvas.height * ny)));
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
      if (pixel[0] + pixel[1] + pixel[2] > 10) painted += 1;
    }
    return { painted, samples: points.length, webgl2: true };
  });
}

try {
  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport: { width: profile.width, height: profile.height },
      reducedMotion: profile.reducedMotion,
      isMobile: profile.isMobile || false,
      hasTouch: profile.hasTouch || false,
      colorScheme: 'dark',
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(formatError(error)));

    try {
      const url = new URL('/kodex/lab/kdx-engine-v0/', baseURL).toString();
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      assert((response?.status() || 0) >= 200 && (response?.status() || 0) < 400, `${profile.key}: HTTP ${response?.status()}`);
      await page.waitForFunction(() => document.querySelector('#kdx-status')?.textContent?.includes('RUNNING'), null, { timeout: 15_000 });
      await page.waitForFunction(() => Number(document.querySelector('#kdx-frame')?.textContent || 0) >= 2, null, { timeout: 8_000 });

      const initial = await page.evaluate(() => ({
        experience: document.querySelector('#kdx-exp')?.textContent?.trim() || '',
        plan: document.querySelector('#kdx-plan')?.textContent?.trim() || '',
        frame: Number(document.querySelector('#kdx-frame')?.textContent || 0),
        overflow: document.documentElement.scrollWidth - window.innerWidth,
      }));
      assert(initial.experience === 'THRESHOLD', `${profile.key}: initial experience ${initial.experience}`);
      assert(initial.plan === expectedPlans.THRESHOLD, `${profile.key}: initial plan ${initial.plan}`);
      assert(initial.overflow <= 1, `${profile.key}: horizontal overflow ${initial.overflow}`);

      const transitions = [];
      for (const id of ['SIGNAL_FIELD', 'AUDIO_ORGANISM', 'THRESHOLD']) {
        const beforeFrame = Number(await page.locator('#kdx-frame').textContent() || 0);
        const button = page.locator(`[data-experience="${id}"]`);
        if (profile.hasTouch) {
          await page.evaluate((experienceId) => {
            const target = document.querySelector(`[data-experience="${experienceId}"]`);
            if (!(target instanceof HTMLButtonElement)) throw new Error(`Missing ${experienceId} control`);
            target.click();
          }, id);
        } else {
          await button.click();
        }
        await page.waitForFunction(([experienceId, planId]) => {
          return document.querySelector('#kdx-exp')?.textContent === experienceId
            && document.querySelector('#kdx-plan')?.textContent === planId;
        }, [id, expectedPlans[id]], { timeout: 3_000 });
        await page.waitForFunction((frame) => Number(document.querySelector('#kdx-frame')?.textContent || 0) > frame, beforeFrame, { timeout: 3_000 });
        transitions.push({
          experience: id,
          plan: await page.locator('#kdx-plan').textContent(),
          frame: Number(await page.locator('#kdx-frame').textContent() || 0),
        });
      }

      await page.locator('[data-experience="AUDIO_ORGANISM"]').click();
      await page.locator('#kdx-audio-level').fill('0.75');
      await page.waitForTimeout(profile.reducedMotion === 'reduce' ? 100 : 400);
      assert(Number(await page.locator('#kdx-audio-level').inputValue()) === 0.75, `${profile.key}: audio signal control failed`);

      const painted = await samplePaintedSignal(page);
      assert(painted.webgl2, `${profile.key}: WebGL2 unavailable`);
      assert(painted.painted > 0, `${profile.key}: no painted WebGL signal`);
      assert(pageErrors.length === 0, `${profile.key}: page errors ${pageErrors.join(' | ')}`);

      const screenshot = `kdx-engine-v0-${profile.key}.png`;
      await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: true, animations: 'disabled' });
      report.cases.push({ profile: profile.key, pass: true, initial, transitions, painted, screenshot, pageErrors });
    } catch (error) {
      const message = `${profile.key}: ${formatError(error)}`;
      report.errors.push(message);
      report.cases.push({ profile: profile.key, pass: false, error: formatError(error), pageErrors });
      console.error(message);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

await fs.writeFile(path.join(outputDir, 'kdx-engine-v0-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.errors.length) process.exitCode = 1;
