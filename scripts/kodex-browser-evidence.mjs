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
const report = {
  baseURL,
  generatedAt: new Date().toISOString(),
  cases: [],
  acceptance: [],
  errors: [],
};

const safeName = (value) => value
  .replace(/^\//, '')
  .replace(/\/$/, '')
  .replace(/[^a-z0-9]+/gi, '-') || 'root';

const pushError = (message) => {
  report.errors.push(message);
  console.error(message);
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const formatPageError = (error) => String(error?.stack || error?.message || error);

async function stableNavigate(page, url) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('load', { timeout: 10_000 }).catch(() => {});
  // KODEX scenes intentionally keep render/audio/asset activity alive. A bounded
  // settle is deterministic; `networkidle` is not an acceptance requirement.
  await page.waitForTimeout(500);
  return response;
}

async function inspectRoute(checkpoint, profile) {
  const context = await browser.newContext({
    viewport: { width: profile.width, height: profile.height },
    isMobile: profile.isMobile || false,
    hasTouch: profile.hasTouch || false,
    reducedMotion: profile.reducedMotion,
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(formatPageError(error)));

  try {
    const url = new URL(checkpoint.href, baseURL).toString();
    let response;
    try {
      response = await stableNavigate(page, url);
    } catch (error) {
      pushError(`${checkpoint.id}/${profile.key}: navigation ${formatPageError(error)}`);
      report.cases.push({
        checkpoint: checkpoint.id,
        href: checkpoint.href,
        profile: profile.key,
        status: 0,
        screenshot: null,
        pageErrors,
        metrics: null,
      });
      return;
    }

    const status = response?.status() || 0;
    if (status < 200 || status >= 400) {
      pushError(`${checkpoint.id}/${profile.key}: HTTP ${status} ${url}`);
    }

    await page.waitForTimeout(profile.reducedMotion === 'reduce' ? 160 : 350);

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
      pushError(`${checkpoint.id}/${profile.key}: horizontal overflow ${metrics.scrollWidth}px > ${profile.width}px`);
    }
    if (pageErrors.length) {
      pushError(`${checkpoint.id}/${profile.key}: pageerror ${pageErrors.join(' | ')}`);
    }

    const file = `${checkpoint.id.toLowerCase()}-${safeName(checkpoint.href)}-${profile.key}.png`;
    await page.screenshot({
      path: path.join(outputDir, file),
      fullPage: checkpoint.href.includes('/lab/'),
      animations: profile.reducedMotion === 'reduce' ? 'allow' : 'disabled',
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
  } finally {
    await context.close();
  }
}

async function runVisibleAssemblyAcceptance() {
  const url = new URL('/kodex/lab/visible-assembly/', baseURL).toString();

  const stage = async (page, expected) => {
    await page.waitForFunction(
      (value) => document.querySelector('[data-kdx-visible-assembly]')?.getAttribute('data-stage') === value,
      expected,
      { timeout: 10_000 },
    );
  };

  const clear = async (page) => {
    await stableNavigate(page, url);
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForLoadState('load', { timeout: 10_000 }).catch(() => {});
    await page.waitForTimeout(250);
    await stage(page, 'THRESHOLD');
  };

  // Desktop keyboard route without Heart + History idempotency.
  {
    const name = 'visible-assembly-desktop-history';
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    try {
      await clear(page);
      await page.locator('[data-choice="OBSERVE"]').focus();
      await page.keyboard.press('Enter');
      await stage(page, 'ARCHIVE');
      await page.locator('[data-open-evidence]').focus();
      await page.keyboard.press('Enter');
      await page.locator('[data-after-evidence]').waitFor({ state: 'visible' });
      await page.locator('[data-enter-return]').focus();
      await page.keyboard.press('Enter');
      await stage(page, 'RETURN');
      const signature = await page.locator('[data-return-signature]').evaluate((el) => el.value ?? el.textContent ?? '');
      assert(/^KDX-R-[0-9A-F]{8}$/.test(signature), `invalid Return signature: ${signature}`);
      assert((await page.locator('[data-heart-visits]').textContent()) === '0', 'no-Heart route recorded a Heart visit');
      const before = await page.locator('[data-trace-count]').textContent();
      await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => {});
      await stage(page, 'ARCHIVE');
      await page.goForward({ waitUntil: 'domcontentloaded' }).catch(() => {});
      await stage(page, 'RETURN');
      const after = await page.locator('[data-trace-count]').textContent();
      assert(before === after, `Back/Forward changed trace count: ${before} -> ${after}`);
      const file = `${name}.png`;
      await page.screenshot({ path: path.join(outputDir, file), fullPage: true, animations: 'disabled' });
      report.acceptance.push({ name, pass: true, screenshot: file, signature, traceCount: after });
    } catch (error) {
      pushError(`${name}: ${formatPageError(error)}`);
      report.acceptance.push({ name, pass: false, error: formatPageError(error) });
    } finally {
      await context.close();
    }
  }

  // 390×844 touch route with optional Heart + exact anchor restoration.
  {
    const name = 'visible-assembly-390-heart';
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    try {
      await clear(page);
      await page.locator('[data-choice="REMEMBER"]').tap();
      await stage(page, 'ARCHIVE');
      await page.locator('[data-open-evidence]').tap();
      await page.locator('[data-enter-heart]').tap();
      await stage(page, 'HEART');
      assert((await page.locator('[data-anchor-focus]').textContent())?.includes('SRC-KDX-CORPUS-002'), 'Heart anchor lost Archive source focus');
      await page.locator('[data-leave-heart]').tap();
      await stage(page, 'ARCHIVE');
      await page.locator('[data-enter-return]').tap();
      await stage(page, 'RETURN');
      assert((await page.locator('[data-heart-visits]').textContent()) === '1', 'Heart route did not record exactly one Heart visit');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert(overflow <= 1, `390x844 horizontal overflow: ${overflow}`);
      const file = `${name}.png`;
      await page.screenshot({ path: path.join(outputDir, file), fullPage: true, animations: 'disabled' });
      report.acceptance.push({ name, pass: true, screenshot: file, overflow });
    } catch (error) {
      pushError(`${name}: ${formatPageError(error)}`);
      report.acceptance.push({ name, pass: false, error: formatPageError(error) });
    } finally {
      await context.close();
    }
  }

  // 412×915 touch, explicit OFF motion, and no-WebGL capability.
  {
    const name = 'visible-assembly-412-no-webgl-off';
    const context = await browser.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, ...args) {
        if (type === 'webgl' || type === 'webgl2') return null;
        return original.call(this, type, ...args);
      };
    });
    try {
      await clear(page);
      await page.locator('[data-motion-toggle]').tap();
      await page.locator('[data-motion-toggle]').tap();
      assert((await page.locator('[data-kdx-visible-assembly]').getAttribute('data-motion')) === 'off', 'motion OFF state not applied');
      await page.locator('[data-choice="OBSERVE"]').tap();
      await page.locator('[data-open-evidence]').tap();
      await page.locator('[data-enter-return]').tap();
      await stage(page, 'RETURN');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert(overflow <= 1, `412x915 horizontal overflow: ${overflow}`);
      const file = `${name}.png`;
      await page.screenshot({ path: path.join(outputDir, file), fullPage: true, animations: 'disabled' });
      report.acceptance.push({ name, pass: true, screenshot: file, overflow, motion: 'off', webgl: 'disabled' });
    } catch (error) {
      pushError(`${name}: ${formatPageError(error)}`);
      report.acceptance.push({ name, pass: false, error: formatPageError(error) });
    } finally {
      await context.close();
    }
  }
}

try {
  for (const checkpoint of uniqueRoutes) {
    for (const profile of profiles) await inspectRoute(checkpoint, profile);
  }
  await runVisibleAssemblyAcceptance();
} finally {
  await browser.close();
}

await fs.writeFile(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ cases: report.cases.length, acceptance: report.acceptance, errors: report.errors }, null, 2));
if (report.errors.length) process.exitCode = 1;
