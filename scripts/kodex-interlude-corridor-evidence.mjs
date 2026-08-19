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

const interludes = [
  {
    key: 'archive-machine',
    href: '/kodex/interlude/archive-machine/',
    expectedPath: '/kodex/folio/iv/',
  },
  {
    key: 'cosmology-return',
    href: '/kodex/interlude/cosmology-return/',
    expectedPath: '/kodex/folio/vi/',
  },
];

const browser = await chromium.launch({ headless: true });
const report = { baseURL, generatedAt: new Date().toISOString(), cases: [], errors: [] };

const fail = (message) => {
  report.errors.push(message);
  console.error(message);
};

try {
  for (const interlude of interludes) {
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
      page.on('pageerror', (error) => pageErrors.push(String(error?.stack || error?.message || error)));

      const name = `${interlude.key}-${profile.key}`;
      try {
        const response = await page.goto(new URL(interlude.href, baseURL).toString(), {
          waitUntil: 'domcontentloaded',
          timeout: 30_000,
        });
        await page.waitForLoadState('load', { timeout: 10_000 }).catch(() => {});
        await page.waitForTimeout(250);

        const status = response?.status() || 0;
        if (status < 200 || status >= 400) throw new Error(`HTTP ${status}`);

        const button = page.locator('[data-deck-next]');
        await button.waitFor({ state: 'visible', timeout: 10_000 });

        const before = await page.evaluate(() => ({
          path: location.pathname,
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          scrollHeight: document.documentElement.scrollHeight,
          innerHeight: window.innerHeight,
        }));

        if (before.scrollWidth > before.clientWidth + 2) {
          throw new Error(`horizontal overflow ${before.scrollWidth}px > ${before.clientWidth}px`);
        }
        if (before.scrollHeight > before.innerHeight + 2) {
          throw new Error(`page-level vertical scroll ${before.scrollHeight}px > ${before.innerHeight}px`);
        }

        const beforeShot = `${name}-before.png`;
        await page.screenshot({ path: path.join(outputDir, beforeShot), animations: 'disabled' });

        if (profile.hasTouch) {
          await button.tap();
        } else {
          await button.focus();
          await page.keyboard.press('Enter');
        }

        await page.waitForURL(
          (url) => url.pathname === interlude.expectedPath,
          { timeout: 10_000 },
        );
        await page.waitForLoadState('domcontentloaded', { timeout: 10_000 }).catch(() => {});

        const finalPath = new URL(page.url()).pathname;
        if (finalPath !== interlude.expectedPath) {
          throw new Error(`expected ${interlude.expectedPath}, got ${finalPath}`);
        }
        if (pageErrors.length) throw new Error(`pageerror: ${pageErrors.join(' | ')}`);

        const afterShot = `${name}-after.png`;
        await page.screenshot({ path: path.join(outputDir, afterShot), animations: 'disabled' });
        report.cases.push({
          name,
          pass: true,
          input: profile.hasTouch ? 'touch' : 'keyboard-enter',
          reducedMotion: profile.reducedMotion,
          from: interlude.href,
          to: finalPath,
          before,
          screenshots: [beforeShot, afterShot],
        });
      } catch (error) {
        const message = `${name}: ${String(error?.stack || error?.message || error)}`;
        fail(message);
        report.cases.push({ name, pass: false, error: message, pageErrors });
      } finally {
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}

await fs.writeFile(
  path.join(outputDir, 'interlude-corridor-report.json'),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
if (report.errors.length) process.exitCode = 1;
