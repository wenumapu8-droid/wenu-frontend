import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence/opening-corridor');
await fs.mkdir(outputDir, { recursive: true });

const profiles = [
  { key: 'desktop', width: 1440, height: 900 },
  { key: 'mobile-390', width: 390, height: 844, isMobile: true, hasTouch: true },
  { key: 'mobile-412', width: 412, height: 915, isMobile: true, hasTouch: true },
  { key: 'reduced', width: 1280, height: 800, reducedMotion: 'reduce' },
];

const browser = await chromium.launch({ headless: true });
const report = { baseURL, generatedAt: new Date().toISOString(), cases: [], errors: [] };

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function state(page) {
  return page.evaluate(() => ({
    path: location.pathname,
    width: innerWidth,
    height: innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    profile: document.querySelector('[data-kdx-ritual]')?.getAttribute('data-perfil') || null,
    phase: document.querySelector('[data-kdx-ritual]')?.getAttribute('data-fase') || null,
  }));
}

function assertViewport(value, label) {
  if (value.scrollWidth > value.width + 2) throw new Error(`${label}: horizontal overflow`);
  if (value.scrollHeight > value.height + 2) throw new Error(`${label}: page-level vertical scroll`);
}

async function capture(page, key, label, elapsed, frames) {
  const file = `${key}-${label}-${String(elapsed).padStart(4, '0')}ms.png`;
  await page.screenshot({ path: path.join(outputDir, file) });
  const snapshot = await state(page);
  frames.push({ file, label, elapsed, ...snapshot });
  return snapshot;
}

async function trigger(locator, touch) {
  await locator.waitFor({ state: 'visible', timeout: 10_000 });
  if (touch) await locator.tap({ noWaitAfter: true });
  else await locator.click({ noWaitAfter: true });
}

try {
  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport: { width: profile.width, height: profile.height },
      isMobile: profile.isMobile || false,
      hasTouch: profile.hasTouch || false,
      reducedMotion: profile.reducedMotion || 'no-preference',
      colorScheme: 'dark',
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(String(error?.message || error)));
    const frames = [];

    try {
      await page.goto(new URL('/kodex/', baseURL).toString(), { waitUntil: 'load', timeout: 30_000 });
      await page.waitForTimeout(250);
      const threshold = await capture(page, profile.key, 'threshold', 0, frames);
      assertViewport(threshold, `${profile.key}/threshold`);

      await trigger(page.locator('.kx-threshold__cta[href="/kodex/folio/i/"]').first(), profile.hasTouch);
      if (profile.reducedMotion !== 'reduce') {
        for (const elapsed of [120, 360, 700]) {
          await wait(elapsed === 120 ? 120 : elapsed === 360 ? 240 : 340);
          const snapshot = await capture(page, profile.key, 'threshold-cross', elapsed, frames);
          if (snapshot.path === '/kodex/' && snapshot.profile !== 'depth') {
            throw new Error(`${profile.key}: THRESHOLD crossing did not expose depth ritual`);
          }
        }
      }
      await page.waitForURL((url) => url.pathname === '/kodex/folio/i/', { timeout: 10_000 });
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(120);
      const prologue = await capture(page, profile.key, 'prologue', 120, frames);
      assertViewport(prologue, `${profile.key}/prologue`);
      if (profile.reducedMotion !== 'reduce') {
        await page.waitForTimeout(680);
        await capture(page, profile.key, 'prologue', 800, frames);
        await page.waitForTimeout(1400);
        await capture(page, profile.key, 'prologue', 2200, frames);
      }

      await trigger(page.locator('a.kx-os-primary[href="/kodex/folio/ii/"]').first(), profile.hasTouch);
      if (profile.reducedMotion !== 'reduce') {
        for (const elapsed of [120, 360, 700]) {
          await wait(elapsed === 120 ? 120 : elapsed === 360 ? 240 : 340);
          const snapshot = await capture(page, profile.key, 'prologue-cross', elapsed, frames);
          if (snapshot.path === '/kodex/folio/i/' && snapshot.profile !== 'depth') {
            throw new Error(`${profile.key}: PROLOGUE→DESCENT crossing did not expose depth ritual`);
          }
        }
      }
      await page.waitForURL((url) => url.pathname === '/kodex/folio/ii/', { timeout: 10_000 });
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(120);
      const descent = await capture(page, profile.key, 'descent', 120, frames);
      assertViewport(descent, `${profile.key}/descent`);
      if (profile.reducedMotion !== 'reduce') {
        await page.waitForTimeout(680);
        await capture(page, profile.key, 'descent', 800, frames);
        await page.waitForTimeout(1200);
        await capture(page, profile.key, 'descent', 2000, frames);
      }

      if (pageErrors.length) throw new Error(`page errors: ${pageErrors.join(' | ')}`);
      report.cases.push({ name: `opening-${profile.key}`, pass: true, frames });
    } catch (error) {
      const message = `opening-${profile.key}: ${String(error?.stack || error)}`;
      report.errors.push(message);
      report.cases.push({ name: `opening-${profile.key}`, pass: false, frames, pageErrors, error: message });
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
