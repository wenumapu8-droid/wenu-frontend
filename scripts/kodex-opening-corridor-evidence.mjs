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
const report = {
  baseURL,
  generatedAt: new Date().toISOString(),
  captureMode: 'real-input timing check + evidence-only stretched ritual frames',
  cases: [],
  errors: [],
};

async function state(page) {
  return page.evaluate(() => ({
    path: location.pathname,
    width: innerWidth,
    height: innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    profile: document.querySelector('[data-kdx-ritual]')?.getAttribute('data-perfil') || null,
    phase: document.querySelector('[data-kdx-ritual]')?.getAttribute('data-fase') || null,
    sceneState: document.documentElement.dataset.kdxState || null,
  }));
}

function assertViewport(value, label) {
  if (value.scrollWidth > value.width + 2) throw new Error(`${label}: horizontal overflow`);
  if (value.scrollHeight > value.height + 2) throw new Error(`${label}: page-level vertical scroll`);
}

async function capture(page, key, label, elapsed, frames) {
  const file = `${key}-${label}-${String(elapsed).padStart(4, '0')}ms.png`;
  const snapshot = await state(page);
  await page.screenshot({
    path: path.join(outputDir, file),
    animations: 'allow',
    timeout: 12_000,
  });
  frames.push({ file, label, elapsed, ...snapshot });
  return snapshot;
}

async function trigger(locator, touch) {
  await locator.waitFor({ state: 'visible', timeout: 10_000 });
  if (touch) await locator.tap({ noWaitAfter: true, timeout: 10_000 });
  else await locator.click({ noWaitAfter: true, timeout: 10_000 });
}

async function gotoStable(page, pathname) {
  const response = await page.goto(new URL(pathname, baseURL).toString(), {
    waitUntil: 'load',
    timeout: 30_000,
  });
  if ((response?.status() || 0) >= 400) throw new Error(`${pathname}: HTTP ${response?.status()}`);
  await page.waitForTimeout(250);
}

async function verifyRealCrossing(page, profile, { from, selector, to, label }) {
  await gotoStable(page, from);
  const before = await state(page);
  assertViewport(before, `${profile.key}/${label}/before`);

  const t0 = Date.now();
  await trigger(page.locator(selector).first(), profile.hasTouch);
  if (profile.reducedMotion !== 'reduce') {
    await page.waitForFunction(
      () => document.documentElement.dataset.kdxState === 'transitionOut',
      null,
      { timeout: 2_000 },
    );
  }
  await page.waitForURL((url) => url.pathname === to, { timeout: 10_000 });
  const routeMs = Date.now() - t0;
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  const after = await state(page);
  assertViewport(after, `${profile.key}/${label}/after`);

  // Guard only against an instant reload or pathological stall. Authorial
  // pacing remains a creator-review decision and is not encoded here.
  if (profile.reducedMotion === 'reduce') {
    if (routeMs < 100 || routeMs > 4_000) throw new Error(`${profile.key}/${label}: reduced timing ${routeMs}ms`);
  } else if (routeMs < 300 || routeMs > 8_000) {
    throw new Error(`${profile.key}/${label}: traversal timing ${routeMs}ms`);
  }

  return { routeMs, before, after };
}

async function captureCrossing(page, profile, { from, selector, to, label, frames }) {
  await gotoStable(page, from);
  const origin = await capture(page, profile.key, `${label}-stable`, 0, frames);
  assertViewport(origin, `${profile.key}/${label}/stable`);

  if (profile.reducedMotion === 'reduce') {
    await trigger(page.locator(selector).first(), profile.hasTouch);
    await page.waitForURL((url) => url.pathname === to, { timeout: 10_000 });
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    await page.waitForTimeout(120);
    const settled = await capture(page, profile.key, `${label}-settle`, 120, frames);
    assertViewport(settled, `${profile.key}/${label}/reduced-settle`);
    return;
  }

  // Screenshot capture can be slower than the real transition on CI, causing
  // frames to accidentally photograph the destination. Stretch only the
  // existing CSS timing for this second, evidence-only pass. Input, state,
  // interpolation, routing authority and rendering code stay unchanged; real
  // pacing was verified immediately before this capture pass.
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--kdx-m-state-transition', '5s');
  });

  await trigger(page.locator(selector).first(), profile.hasTouch);
  await page.waitForFunction(
    () => document.documentElement.dataset.kdxState === 'transitionOut',
    null,
    { timeout: 2_000 },
  );

  const samples = [
    { elapsed: 120, delay: 120 },
    { elapsed: 360, delay: 240 },
    { elapsed: 700, delay: 340 },
  ];

  for (const sample of samples) {
    await page.waitForTimeout(sample.delay);
    const snapshot = await state(page);
    if (snapshot.path !== from) throw new Error(`${profile.key}/${label}: route committed before ${sample.elapsed}ms evidence sample`);
    if (snapshot.profile !== 'depth') throw new Error(`${profile.key}/${label}: depth ritual missing at ${sample.elapsed}ms`);
    await capture(page, profile.key, `${label}-cross`, sample.elapsed, frames);
  }

  await page.waitForURL((url) => url.pathname === to, { timeout: 12_000 });
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(120);
  const destination = await capture(page, profile.key, `${label}-destination`, 120, frames);
  assertViewport(destination, `${profile.key}/${label}/destination`);
  await page.waitForTimeout(680);
  await capture(page, profile.key, `${label}-destination`, 800, frames);
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
      const thresholdTiming = await verifyRealCrossing(page, profile, {
        from: '/kodex/',
        selector: '.kx-threshold__cta[href="/kodex/folio/i/"]',
        to: '/kodex/folio/i/',
        label: 'threshold-prologue',
      });

      const prologueTiming = await verifyRealCrossing(page, profile, {
        from: '/kodex/folio/i/',
        selector: 'a.kx-os-primary[href="/kodex/folio/ii/"]',
        to: '/kodex/folio/ii/',
        label: 'prologue-descent',
      });

      await captureCrossing(page, profile, {
        from: '/kodex/',
        selector: '.kx-threshold__cta[href="/kodex/folio/i/"]',
        to: '/kodex/folio/i/',
        label: 'threshold-prologue',
        frames,
      });

      await captureCrossing(page, profile, {
        from: '/kodex/folio/i/',
        selector: 'a.kx-os-primary[href="/kodex/folio/ii/"]',
        to: '/kodex/folio/ii/',
        label: 'prologue-descent',
        frames,
      });

      if (pageErrors.length) throw new Error(`page errors: ${pageErrors.join(' | ')}`);
      report.cases.push({
        name: `opening-${profile.key}`,
        pass: true,
        timing: {
          thresholdToPrologueMs: thresholdTiming.routeMs,
          prologueToDescentMs: prologueTiming.routeMs,
        },
        frames,
      });
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
