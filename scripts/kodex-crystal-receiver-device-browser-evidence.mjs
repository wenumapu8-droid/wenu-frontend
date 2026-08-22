import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence');
await fs.mkdir(outputDir, { recursive: true });

const profiles = [
  { key: 'desktop', width: 1440, height: 900, reducedMotion: 'no-preference' },
  { key: 'mobile-390', width: 390, height: 844, reducedMotion: 'no-preference', isMobile: true, hasTouch: true },
  { key: 'mobile-412', width: 412, height: 915, reducedMotion: 'no-preference', isMobile: true, hasTouch: true },
  { key: 'reduced', width: 1280, height: 800, reducedMotion: 'reduce' },
];

const report = { baseURL, generatedAt: new Date().toISOString(), cases: [], errors: [] };
const browser = await chromium.launch({ headless: true });
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const formatError = (error) => String(error?.stack || error?.message || error);

try {
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
    page.on('pageerror', (error) => pageErrors.push(formatError(error)));

    try {
      const url = new URL('/kodex/lab/crystal-receiver/', baseURL).toString();
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      assert((response?.status() || 0) >= 200 && (response?.status() || 0) < 400, `${profile.key}: invalid HTTP status ${response?.status()}`);
      await page.locator('[data-kdx-receiver-device]').waitFor({ state: 'visible', timeout: 10_000 });

      const initial = await page.evaluate(() => ({
        state: document.querySelector('[data-kdx-receiver-device]')?.getAttribute('data-device-state'),
        scrollX: document.documentElement.scrollWidth - window.innerWidth,
        scrollY: document.documentElement.scrollHeight - window.innerHeight,
        storage: { ...localStorage },
        url: location.href,
      }));
      assert(initial.state === 'DORMANT', `${profile.key}: initial state ${initial.state}`);
      assert(initial.scrollX <= 1, `${profile.key}: horizontal overflow ${initial.scrollX}`);
      assert(initial.scrollY <= 1, `${profile.key}: vertical overflow ${initial.scrollY}`);

      const trigger = page.locator('[data-receiver-trigger]');
      if (profile.hasTouch) {
        await page.evaluate(() => document.querySelector('[data-receiver-trigger]')?.click());
      } else {
        await trigger.focus();
        await page.keyboard.press('Enter');
      }
      await page.waitForFunction(() => document.querySelector('[data-kdx-receiver-device]')?.getAttribute('data-device-state') === 'AWARE');

      if (profile.hasTouch) {
        await page.evaluate(() => document.querySelector('[data-receiver-trigger]')?.click());
      } else {
        await page.keyboard.press('Enter');
      }
      await page.locator('[data-capture-panel]').waitFor({ state: 'visible' });
      await page.locator('[data-raw-signal]').fill('three white points over a dark field');
      await page.locator('[data-interpretation]').fill('possible constellation');
      await page.locator('[data-hold-capture]').click();
      await page.waitForFunction(() => document.querySelector('[data-kdx-receiver-device]')?.getAttribute('data-device-state') === 'HELD');

      const held = await page.evaluate(() => ({
        state: document.querySelector('[data-kdx-receiver-device]')?.getAttribute('data-device-state'),
        capture: document.querySelector('[data-capture-status]')?.textContent?.trim(),
        resolution: document.querySelector('[data-resolution-status]')?.textContent?.trim(),
        scrollX: document.documentElement.scrollWidth - window.innerWidth,
        scrollY: document.documentElement.scrollHeight - window.innerHeight,
        storage: { ...localStorage },
        url: location.href,
        exposedCapture: window.__KDX_RECEIVER_DEVICE__?.getCapture?.(),
      }));
      assert(held.state === 'HELD', `${profile.key}: held state ${held.state}`);
      assert(held.capture === 'LAB-001', `${profile.key}: capture id ${held.capture}`);
      assert(held.resolution === 'INTERPRETED', `${profile.key}: resolution ${held.resolution}`);
      assert(JSON.stringify(held.storage) === JSON.stringify(initial.storage), `${profile.key}: localStorage mutated`);
      assert(held.url === initial.url, `${profile.key}: navigation occurred before explicit route choice`);
      assert(held.scrollX <= 1 && held.scrollY <= 1, `${profile.key}: viewport overflow after capture ${held.scrollX}/${held.scrollY}`);
      assert(held.exposedCapture?.source === 'UNKNOWN', `${profile.key}: source default drifted`);

      await page.evaluate(() => document.querySelector('[data-request-verified]')?.click());
      const verifiedAttempt = await page.locator('[data-resolution-status]').textContent();
      assert(verifiedAttempt?.trim() === 'NEEDS_CONFIRMATION', `${profile.key}: VERIFIED did not fail closed (${verifiedAttempt})`);
      assert(pageErrors.length === 0, `${profile.key}: page errors ${pageErrors.join(' | ')}`);

      const screenshot = `crystal-receiver-device-${profile.key}.png`;
      await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: true, animations: 'disabled' });
      report.cases.push({ profile: profile.key, pass: true, screenshot, initial, held, verifiedAttempt: verifiedAttempt?.trim(), pageErrors });
    } catch (error) {
      const message = `${profile.key}: ${formatError(error)}`;
      report.errors.push(message);
      report.cases.push({ profile: profile.key, pass: false, pageErrors, error: formatError(error) });
      console.error(message);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

await fs.writeFile(path.join(outputDir, 'crystal-receiver-device-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.errors.length) process.exitCode = 1;
