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
        prologueState: document.querySelector('[data-kdx-observacion]')?.getAttribute('data-kdx-obs') || null,
        prologueType: document.querySelector('[data-kdx-observacion]')?.getAttribute('data-kdx-type') || null,
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
  const cdp = await withTimeout(context.newCDPSession(page), 2_000, `${label} cdp session`);
  try {
    await withTimeout(cdp.send('Page.enable'), 2_000, `${label} Page.enable`);
    const framePromise = new Promise((resolve) => {
      cdp.once('Page.screencastFrame', async (params) => {
        await cdp.send('Page.screencastFrameAck', { sessionId: params.sessionId }).catch(() => {});
        resolve(params.data);
      });
    });
    await withTimeout(cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 }), 2_000, `${label} start screencast`);
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

async function trigger(page, locator, profile, destination) {
  await locator.waitFor({ state: 'visible', timeout: 8_000 });
  const href = await locator.getAttribute('href');
  if (!href || new URL(href, baseURL).pathname !== new URL(destination, baseURL).pathname) {
    throw new Error(`${profile.key}: transition trigger route mismatch`);
  }

  // Native PROLOGUE must prove the real user affordance. Avoid Locator.click()
  // here because the depth-transition handler can keep Playwright's actionability
  // lifecycle open while the real crossing has already begun. Inject a real
  // pointer/touch hit at the rendered anchor center, then let the downstream
  // ritual/path assertions decide whether the interaction actually worked.
  if (await locator.getAttribute('data-kdx-puerta') !== null) {
    const box = await locator.boundingBox();
    if (!box || box.width < 1 || box.height < 1) {
      throw new Error(`${profile.key}: transition trigger has no hit bounds`);
    }
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    if (profile.hasTouch) await page.touchscreen.tap(x, y);
    else await page.mouse.click(x, y);
    return;
  }

  const invoked = await withTimeout(page.evaluate((url) => {
    const ritual = window.__kdxRitual;
    if (typeof ritual !== 'function') return false;
    ritual(url);
    return true;
  }, new URL(destination, baseURL).toString()), 2_000, `${profile.key} ritual runtime trigger`);
  if (!invoked) throw new Error(`${profile.key}: ritual runtime bridge unavailable`);
}

async function activateControl(page, locator, profile, label) {
  await locator.waitFor({ state: 'visible', timeout: 3_000 });
  const box = await locator.boundingBox();
  if (!box || box.width < 1 || box.height < 1) throw new Error(`${profile.key}: ${label} has no hit bounds`);
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  // Use actual pointer/touch injection rather than Locator.click actionability.
  // The state assertion after the input remains authoritative, so an overlay,
  // blocked hit target, or disconnected control still fails the evidence gate.
  if (profile.hasTouch) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
}

async function proveNativePrologue(page, profile, context, frames) {
  const native = page.locator('[data-kdx-observacion]').first();
  if (!await native.count()) return false;

  await native.focus();
  await native.press('Enter');
  await page.locator('[data-kdx-observacion][data-kdx-obs="LOCK"]').waitFor({ state: 'visible', timeout: 3_000 });
  const locked = await capture(context, page, profile.key, 'prologue-lock', 0, frames);
  if (locked.prologueState !== 'LOCK' || locked.prologueType !== 'PROLOGUE / LOCK') {
    throw new Error(`${profile.key}: native PROLOGUE failed causal LOCK/KDX.TYPE proof`);
  }

  // TRACK is a causal state, not decoration. Use real pointer input on a quiet
  // part of the observation field instead of the pupil: LOCK reveals the real
  // DESCEND anchor at the exact center, and dragging from an <a> can enter the
  // browser's native link-drag path before pointermove reaches the organism.
  const box = await native.boundingBox();
  if (!box) throw new Error(`${profile.key}: native PROLOGUE has no interaction bounds`);
  const x = box.x + box.width * 0.28;
  const y = box.y + box.height * 0.38;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + Math.min(80, box.width * 0.15), y + Math.min(50, box.height * 0.1), { steps: 3 });
  await page.locator('[data-kdx-observacion][data-kdx-obs="TRACK"]').waitFor({ state: 'visible', timeout: 2_000 });
  const tracked = await capture(context, page, profile.key, 'prologue-track', 0, frames);
  if (tracked.prologueType !== 'PROLOGUE / TRACK') throw new Error(`${profile.key}: TRACK did not drive KDX.TYPE`);
  await page.mouse.up();
  await page.locator('[data-kdx-observacion][data-kdx-obs="AWARE"]').waitFor({ state: 'visible', timeout: 2_000 });

  await native.focus();
  await native.press('Enter');
  await page.locator('[data-kdx-observacion][data-kdx-obs="LOCK"]').waitFor({ state: 'visible', timeout: 2_000 });
  const inspect = page.locator('[data-kdx-inspector-btn]').first();
  await activateControl(page, inspect, profile, 'INSPECT SIGNAL');
  await page.locator('[data-kdx-observacion][data-kdx-obs="INSPECT"]').waitFor({ state: 'visible', timeout: 2_000 });
  const inspected = await capture(context, page, profile.key, 'prologue-inspect', 0, frames);
  if (inspected.prologueType !== 'PROLOGUE / INSPECT') throw new Error(`${profile.key}: INSPECT did not drive KDX.TYPE`);
  await activateControl(page, inspect, profile, 'INSPECT SIGNAL close');
  await page.locator('[data-kdx-observacion][data-kdx-obs="LOCK"]').waitFor({ state: 'visible', timeout: 2_000 });
  return true;
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

    await trigger(page, page.locator('.kx-threshold__cta[href="/kodex/folio/i/"]').first(), profile, '/kodex/folio/i/');
    if (profile.reducedMotion !== 'reduce') {
      for (const elapsed of [120, 360, 700]) {
        await wait(elapsed === 120 ? 120 : elapsed === 360 ? 240 : 340);
        const snapshot = await capture(context, page, profile.key, 'threshold-cross', elapsed, frames);
        if (snapshot.path === '/kodex/' && snapshot.profile !== 'depth') throw new Error(`${profile.key}: THRESHOLD crossing did not expose depth ritual`);
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

    const native = await proveNativePrologue(page, profile, context, frames);
    const prologueRoute = native
      ? page.locator('a[data-kdx-puerta][href="/kodex/folio/ii/"]').first()
      : page.locator('a.kx-os-primary[href="/kodex/folio/ii/"]').first();
    await trigger(page, prologueRoute, profile, '/kodex/folio/ii/');
    if (profile.reducedMotion !== 'reduce') {
      for (const elapsed of [120, 360, 700]) {
        await wait(elapsed === 120 ? 120 : elapsed === 360 ? 240 : 340);
        const snapshot = await capture(context, page, profile.key, 'prologue-cross', elapsed, frames);
        if (snapshot.path === '/kodex/folio/i/' && snapshot.profile !== 'depth') throw new Error(`${profile.key}: PROLOGUE→DESCENT crossing did not expose depth ritual`);
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
    report.cases.push({ name: `opening-${profile.key}`, pass: true, nativePrologue: native, frames });
  } catch (error) {
    const message = `opening-${profile.key}: ${String(error?.stack || error)}`;
    report.errors.push(message);
    report.cases.push({ name: `opening-${profile.key}`, pass: false, frames, pageErrors, error: message });
  } finally {
    await withTimeout(context.close(), 4_000, `${profile.key}/context close`).catch(() => {});
  }
}

try {
  for (const profile of profiles) await runProfile(profile);
} catch (error) {
  report.errors.push(`opening-corridor harness: ${String(error?.stack || error)}`);
} finally {
  await withTimeout(browser.close(), 5_000, 'browser close').catch(() => {});
}

await fs.writeFile(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.errors.length) process.exitCode = 1;
