import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { KODEX_V0_CHECKPOINTS } from '../src/lib/kodex/v0-vertical-slice.js';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence');
await fs.mkdir(outputDir, { recursive: true });

const uniqueRoutes = [...new Map(KODEX_V0_CHECKPOINTS.map((item) => [item.href, item])).values()];
const profiles = [
  { key: 'desktop', width: 1440, height: 900, reducedMotion: 'no-preference' },
  { key: 'mobile-390', width: 390, height: 844, reducedMotion: 'no-preference', isMobile: true, hasTouch: true },
  { key: 'mobile-412', width: 412, height: 915, reducedMotion: 'no-preference', isMobile: true, hasTouch: true },
  { key: 'reduced', width: 1280, height: 800, reducedMotion: 'reduce' },
];

const browser = await chromium.launch({ headless: true });
const report = { baseURL, generatedAt: new Date().toISOString(), cases: [], errors: [] };

const safeName = (value) => value
  .replace(/^\//, '')
  .replace(/\/$/, '')
  .replace(/[^a-z0-9]+/gi, '-') || 'root';

try {
  for (const checkpoint of uniqueRoutes) {
    for (const profile of profiles) {
      const context = await browser.newContext({
        viewport: { width: profile.width, height: profile.height },
        isMobile: profile.isMobile || false,
        hasTouch: profile.hasTouch || false,
        reducedMotion: profile.reducedMotion,
        colorScheme: 'dark',
      });
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(String(error?.message || error)));

      const url = new URL(checkpoint.href, baseURL).toString();
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 });
      const status = response?.status() || 0;
      if (status < 200 || status >= 400) {
        report.errors.push(`${checkpoint.id}/${profile.key}: HTTP ${status} ${url}`);
      }

      await page.waitForTimeout(profile.reducedMotion === 'reduce' ? 120 : 450);

      const metrics = await page.evaluate(() => ({
        title: document.title,
        lang: document.documentElement.lang || null,
        width: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyHeight: document.body.scrollHeight,
        activeScene: document.querySelector('[data-kdx-active-scene]')?.getAttribute('data-kdx-active-scene')
          || document.querySelector('[data-kdx-scene-id]')?.getAttribute('data-kdx-scene-id')
          || null,
      }));

      if (metrics.scrollWidth > profile.width + 3) {
        report.errors.push(`${checkpoint.id}/${profile.key}: horizontal overflow ${metrics.scrollWidth}px > ${profile.width}px`);
      }
      if (pageErrors.length) {
        report.errors.push(`${checkpoint.id}/${profile.key}: pageerror ${pageErrors.join(' | ')}`);
      }

      const file = `${checkpoint.id.toLowerCase()}-${safeName(checkpoint.href)}-${profile.key}.png`;
      await page.screenshot({
        path: path.join(outputDir, file),
        fullPage: checkpoint.href.includes('/lab/'),
        animations: 'disabled',
      });

      report.cases.push({
        checkpoint: checkpoint.id,
        href: checkpoint.href,
        profile: profile.key,
        status,
        screenshot: file,
        pageErrors,
        metrics,
      });
      await context.close();
    }
  }
} finally {
  await browser.close();
}

await fs.writeFile(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ cases: report.cases.length, errors: report.errors }, null, 2));
if (report.errors.length) process.exitCode = 1;
