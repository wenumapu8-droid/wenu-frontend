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

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label}: timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function state(page) {
  let lastError;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await withTimeout(page.evaluate(() => ({
        path: location.pathname,
        width: innerWidth,
        height: innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        profile: document.querySelector('[data-kdx-ritual]')?.getAttribute('data-perfil') || null,
        phase: document.querySelector('[data-kdx-ritual]')?.getAttribute('data-fase') || null,
      })), 2_000, 'state snapshot');
    } catch (error) {
      lastError = error;
      const message = String(error?.message || error);
      if (!/Execution context was destroyed|Cannot find context|navigation|timed out/i.test(message)) throw error;
      await page.waitForTimeout(40).catch(() => {});
    }
  }
  throw lastError;
}

function assertViewport(value, label) {
  if (value.scrollWidth > value.width + 2) throw new Error(`${label}: horizontal overflow`);
  if (value.scrollHeight > value.height + 2) throw new Error(`${label}: page-level vertical scroll`);
}

async function captureScreencastFrame(context, page, label) {
  // KODEX scenes run continuous rAF/WebGL loops. Page.captureScreenshot can
  // stall on those surfaces, and a CDP session kept across navigation can be
  // detached from the active page. Use a fresh session per sample and consume
  // the first screencast frame instead. This is evidence-only; product timing
  // remains untouched.
  const cdp = await withTimeout(context.newCDPSession(page), 2_000, `${label} cdp session`);
  try {
    await withTimeout(cdp.send('Page.enable'), 2_000, `${label} Page.enable`);
    const framePromise = new Promise((resolve) => {
      cdp.once('Page.screencastFrame', async (params) => {
        await cdp.send('Page.screencastFrameAck', { sessionId: params.sessionId }).catch(() => {});
        resolve(params.data);
      });
    });
    await withTimeout(cdp.send('Page.startScreencast', {
      format: 'png',
      everyNthFrame: 1,
    }), 2_000, `${label} start screencast`);
    const data = await withTimeout(framePromise, 4_000, `${label} screencast frame`);
    await withTimeout(cdp.send('Page.stopScreencast'), 2_000, `${label} stop screencast`).catch(() => {});
    return data;
  } finally {
    await withTimeout(cdp.detach().catch(() => {}), 2_000, `${label} cdp detach`).catch(() => {});
  }
}

async function capture(context, page, key, label, elapsed, frames) {
  const file = `${key}-${label}-${String(elapsed).padStart(4, '0')}ms.png`;
  const data = await captureScreencastFrame(context, page, `${key}/${label}`);
  await fs.writeFile(path.join(outputDir, file), Buffer.from(data, 'base64'));
  const snapshot = await state(page);
  frames.push({ file, label, elapsed, ...snapshot });
  return snapshot;
}

async function trigger(locator, touch) {
  await locator.waitFor({ state: 'visible', timeout: 8_000 });
  if (touch) await locator.tap({ noWaitAfter: true, timeout: 5_000 });
  else await locator.click({ noWaitAfter: true, timeout: 5_000 });
}

async function runProfile(profile) {
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
    await page.goto(new URL('/kodex/', baseURL).toString(), { waitUntil: 'load', timeout: 15_000 });
    await page.waitForTimeout(250);
    const threshold = await capture(context, page, profile.key, 'threshold', 0, frames);
    assertViewport(threshold, `${profile.key}/threshold`);

    await trigger(page.locator('.kx-threshold__cta[href="/kodex/folio/i/"]').first(), profile.hasTouch);
    if (profile.reducedMotion !== 'reduce') {
      for (const elapsed of [120, 360, 700]) {
        await wait(elapsed === 120 ? 120 : elapsed === 360 ? 240 : 340);
        const snapshot = await capture(context, page, profile.key, 'threshold-cross', elapsed, frames);
        if (snapshot.path === '/kodex/' && snapshot.profile !== 'depth') {
          throw new Error(`${profile.key}: THRESHOLD crossing did not expose depth ritual`);
        }
      }
    }
    await page.waitForURL((url) => url.pathname === '/kodex/folio/i/', { timeout: 8_000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 5_000 }).catch(() => {});
    await page.waitForTimeout(120);
    const prologue = await capture(context, page, profile.key, 'prologue', 120, frames);
    assertViewport(prologue, `${profile.key}/prologue`);
    if (profile.reducedMotion !== 'reduce') {
      await page.waitForTimeout(680);
      await capture(context, page, profile.key, 'prologue', 800, frames);
      await page.waitForTimeout(1400);
      await capture(context, page, profile.key, 'prologue', 2200, frames);
    }

    await trigger(page.locator('a.kx-os-primary[href="/kodex/folio/ii/"]').first(), profile.hasTouch);
    if (profile.reducedMotion !== 'reduce') {
      for (const elapsed of [120, 360, 700]) {
        await wait(elapsed === 120 ? 120 : elapsed === 360 ? 240 : 340);
        const snapshot = await capture(context, page, profile.key, 'prologue-cross', elapsed, frames);
        if (snapshot.path === '/kodex/folio/i/' && snapshot.profile !== 'depth') {
          throw new Error(`${profile.key}: PROLOGUE→DESCENT crossing did not expose depth ritual`);
        }
      }
    }
    await page.waitForURL((url) => url.pathname === '/kodex/folio/ii/', { timeout: 8_000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 5_000 }).catch(() => {});
    await page.waitForTimeout(120);
    const descent = await capture(context, page, profile.key, 'descent', 120, frames);
    assertViewport(descent, `${profile.key}/descent`);
    if (profile.reducedMotion !== 'reduce') {
      await page.waitForTimeout(680);
      await capture(context, page, profile.key, 'descent', 800, frames);
      await page.waitForTimeout(1200);
      await capture(context, page, profile.key, 'descent', 2000, frames);
    }

    if (pageErrors.length) throw new Error(`page errors: ${pageErrors.join(' | ')}`);
    report.cases.push({ name: `opening-${profile.key}`, pass: true, frames });
  } catch (error) {
    const message = `opening-${profile.key}: ${String(error?.stack || error)}`;
    report.errors.push(message);
    report.cases.push({ name: `opening-${profile.key}`, pass: false, frames, pageErrors, error: message });
  } finally {
    await withTimeout(context.close(), 4_000, `${profile.key}/context close`).catch(() => {});
  }
}

try {
  for (const profile of profiles) {
    await withTimeout(runProfile(profile), 35_000, `${profile.key}/profile`);
  }
} catch (error) {
  report.errors.push(`opening-corridor watchdog: ${String(error?.stack || error)}`);
} finally {
  await withTimeout(browser.close(), 5_000, 'browser close').catch(() => {});
}

await fs.writeFile(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.errors.length) process.exitCode = 1;
