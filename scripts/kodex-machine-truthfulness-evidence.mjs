import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence/machine-truthfulness');
await fs.mkdir(outputDir, { recursive: true });

const profiles = [
  { key: 'desktop-1440', width: 1440, height: 900, reducedMotion: 'no-preference' },
  { key: 'mobile-390', width: 390, height: 844, reducedMotion: 'no-preference', isMobile: true, hasTouch: true },
  { key: 'mobile-412', width: 412, height: 915, reducedMotion: 'no-preference', isMobile: true, hasTouch: true },
  { key: 'reduced', width: 1280, height: 800, reducedMotion: 'reduce' },
];

const browser = await chromium.launch({ headless: true });
const report = { baseURL, generatedAt: new Date().toISOString(), route: '/kodex/folio/iv/', profiles: [], errors: [] };

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
    page.on('pageerror', (error) => pageErrors.push(String(error?.stack || error?.message || error)));

    try {
      const response = await page.goto(new URL('/kodex/folio/iv/', baseURL).toString(), {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      });
      await page.waitForLoadState('load', { timeout: 10_000 }).catch(() => {});
      await page.waitForTimeout(profile.reducedMotion === 'reduce' ? 250 : 500);

      const status = response?.status() || 0;
      const facts = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        const strip = document.querySelector('.kx-os-stage__strip');
        return {
          bodyText,
          stripText: strip?.textContent || '',
          width: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          bodyHeight: document.body.scrollHeight,
          viewportHeight: window.innerHeight,
          machinePresent: Boolean(document.querySelector('[data-kdx-machine]')),
        };
      });

      const failures = [];
      if (status < 200 || status >= 400) failures.push(`HTTP ${status}`);
      if (!facts.machinePresent) failures.push('MACHINE readout missing');
      if (/INTEGRITY\s*[·:]?\s*98\.7\s*%/i.test(facts.bodyText)) failures.push('unsourced INTEGRITY 98.7% still visible');
      if (!/INTEGRITY[\s\S]{0,80}PENDING SOURCE/i.test(facts.stripText)) failures.push('DataStrip does not fail closed for INTEGRITY');
      if (!/SIGNAL PENDING SOURCE/i.test(facts.bodyText)) failures.push('scene-specific pending-source disclosure missing');
      if (facts.scrollWidth > profile.width + 3) failures.push(`horizontal overflow ${facts.scrollWidth}px > ${profile.width}px`);
      if (pageErrors.length) failures.push(`pageerror ${pageErrors.join(' | ')}`);

      const screenshot = `machine-${profile.key}.png`;
      await page.screenshot({
        path: path.join(outputDir, screenshot),
        fullPage: false,
        animations: profile.reducedMotion === 'reduce' ? 'allow' : 'disabled',
      });

      report.profiles.push({
        profile: profile.key,
        status,
        screenshot,
        pass: failures.length === 0,
        failures,
        pageErrors,
        metrics: {
          width: facts.width,
          scrollWidth: facts.scrollWidth,
          bodyHeight: facts.bodyHeight,
          viewportHeight: facts.viewportHeight,
        },
      });
      report.errors.push(...failures.map((failure) => `${profile.key}: ${failure}`));
    } catch (error) {
      const message = String(error?.stack || error?.message || error);
      report.profiles.push({ profile: profile.key, pass: false, failures: [message], pageErrors });
      report.errors.push(`${profile.key}: ${message}`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

await fs.writeFile(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.errors.length) process.exitCode = 1;
