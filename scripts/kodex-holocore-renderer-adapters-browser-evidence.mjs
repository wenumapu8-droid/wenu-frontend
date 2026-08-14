import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence/holocore-renderer-adapters');
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = { baseURL, generatedAt: new Date().toISOString(), acceptance: [], errors: [] };

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const fail = (name, error) => {
  const message = `${name}: ${String(error?.stack || error?.message || error)}`;
  report.errors.push(message);
  report.acceptance.push({ name, pass: false, error: message });
  console.error(message);
};

async function navigate(page) {
  const response = await page.goto(new URL('/kodex/lab/holocore-renderers/', baseURL).toString(), {
    waitUntil: 'domcontentloaded',
    timeout: 30_000,
  });
  assert(response?.ok(), `renderer lab returned ${response?.status()}`);
  await page.locator('[data-kdx-renderer-lab]').waitFor({ state: 'visible', timeout: 10_000 });
  await page.waitForFunction(() => document.querySelector('[data-kdx-renderer-lab]')?.dataset.state === 'stable loop');
  try { await page.evaluate(() => document.fonts?.ready); } catch {}
  await page.waitForTimeout(300);
}

async function fingerprint(page) {
  return page.locator('[data-renderer-source]').evaluate(canvas => {
    const ctx = canvas.getContext('2d');
    if (!ctx || canvas.width === 0 || canvas.height === 0) return 'empty';
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let hash = 2166136261;
    const stride = Math.max(4, Math.floor(data.length / 10000 / 4) * 4);
    for (let index = 0; index < data.length; index += stride) {
      hash ^= data[index]; hash = Math.imul(hash, 16777619);
      hash ^= data[index + 1] ?? 0; hash = Math.imul(hash, 16777619);
      hash ^= data[index + 2] ?? 0; hash = Math.imul(hash, 16777619);
    }
    return String(hash >>> 0);
  });
}

async function metrics(page) {
  return page.evaluate(() => {
    const pageRoot = document.querySelector('.renderer-page');
    const root = document.querySelector('[data-kdx-renderer-lab]');
    const viewport = document.querySelector('[data-renderer-viewport]');
    const canvas = document.querySelector('[data-renderer-source]');
    return {
      innerWidth,
      innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      bodyScrollHeight: document.body.scrollHeight,
      pageHeight: pageRoot?.getBoundingClientRect().height ?? 0,
      viewportWidth: viewport?.clientWidth ?? 0,
      viewportHeight: viewport?.clientHeight ?? 0,
      canvasCssWidth: canvas?.clientWidth ?? 0,
      canvasCssHeight: canvas?.clientHeight ?? 0,
      backingWidth: canvas?.width ?? 0,
      backingHeight: canvas?.height ?? 0,
      rendererKind: root?.dataset.rendererKind ?? null,
      surfaceKind: root?.dataset.surfaceKind ?? null,
      surfaceMode: viewport?.dataset.surfaceMode ?? null,
      reducedMotion: root?.dataset.reducedMotion ?? null,
      frameCount: Number(canvas?.dataset.frameCount || 0),
      internalResolution: canvas?.dataset.internalResolution ?? null,
      visualFps: canvas?.dataset.visualFps ?? null,
      state: root?.dataset.state ?? null,
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null,
      crtCanvasCount: viewport?.querySelectorAll('.kdx-holocore-renderer__crt').length ?? 0,
    };
  });
}

function assertLayout(value, label) {
  assert(Math.abs(value.pageHeight - value.innerHeight) <= 2, `${label}: page is not 100dvh`);
  assert(value.scrollWidth <= value.innerWidth + 1, `${label}: horizontal overflow`);
  assert(value.scrollHeight <= value.innerHeight + 2, `${label}: document vertical overflow`);
  assert(value.bodyScrollHeight <= value.innerHeight + 2, `${label}: body vertical overflow`);
  assert(value.viewportWidth > 100 && value.viewportHeight > 100, `${label}: viewport collapsed`);
  assert(Math.abs(value.canvasCssWidth - value.viewportWidth) <= 2, `${label}: source canvas escaped viewport width`);
  assert(Math.abs(value.canvasCssHeight - value.viewportHeight) <= 2, `${label}: source canvas escaped viewport height`);
  assert(value.backingWidth === 320 && value.backingHeight === 240, `${label}: internal raster is not 320×240`);
  assert(value.internalResolution === '320x240', `${label}: missing internal-resolution evidence`);
  assert(value.visualFps === '15', `${label}: visual cadence is not 15 fps`);
  assert(value.rendererKind === 'raster2d-lowres', `${label}: wrong content renderer`);
  assert(value.surfaceKind === 'crt-webgl', `${label}: wrong surface contract`);
  assert(value.state === 'stable loop', `${label}: did not reach stable loop`);
  assert(value.robots?.includes('noindex'), `${label}: lab route missing noindex`);
}

async function desktopLivingRaster() {
  const name = 'holocore-renderer-raster-desktop-1440';
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await context.newPage();
  try {
    await navigate(page);
    const before = await fingerprint(page);
    const beforeFrames = (await metrics(page)).frameCount;
    await page.waitForTimeout(750);
    const after = await fingerprint(page);
    const value = await metrics(page);
    assertLayout(value, name);
    assert(before !== 'empty' && after !== 'empty', `${name}: empty source raster`);
    assert(before !== after, `${name}: low-res raster did not advance`);
    assert(value.frameCount > beforeFrames, `${name}: visual frame count did not advance`);
    assert(['webgl-crt', 'canvas-fallback'].includes(value.surfaceMode), `${name}: invalid surface mode ${value.surfaceMode}`);
    if (value.surfaceMode === 'webgl-crt') assert(value.crtCanvasCount === 1, `${name}: CRT canvas missing`);
    const screenshot = `${name}.png`;
    await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false });
    report.acceptance.push({ name, pass: true, before, after, metrics: value, screenshot });
  } catch (error) {
    fail(name, error);
  } finally {
    await context.close();
  }
}

async function mobileBoundedRaster() {
  const name = 'holocore-renderer-raster-mobile-390';
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, colorScheme: 'dark',
  });
  const page = await context.newPage();
  try {
    await navigate(page);
    const value = await metrics(page);
    assertLayout(value, name);
    await page.locator('[data-renderer-source]').tap({ position: { x: Math.max(1, value.canvasCssWidth * 0.68), y: Math.max(1, value.canvasCssHeight * 0.36) } });
    const screenshot = `${name}.png`;
    await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false });
    report.acceptance.push({ name, pass: true, metrics: value, screenshot });
  } catch (error) {
    fail(name, error);
  } finally {
    await context.close();
  }
}

async function reducedMotionStaticRaster() {
  const name = 'holocore-renderer-raster-reduced-motion';
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce', colorScheme: 'dark',
  });
  const page = await context.newPage();
  try {
    await navigate(page);
    const before = await fingerprint(page);
    const beforeMetrics = await metrics(page);
    await page.waitForTimeout(750);
    const after = await fingerprint(page);
    const value = await metrics(page);
    assertLayout(value, name);
    assert(value.reducedMotion === 'true', `${name}: reduced-motion contract inactive`);
    assert(before === after, `${name}: source raster continued moving (${before} → ${after})`);
    assert(value.frameCount === beforeMetrics.frameCount, `${name}: frame count advanced under reduced motion`);
    const screenshot = `${name}.png`;
    await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false, animations: 'allow' });
    report.acceptance.push({ name, pass: true, fingerprint: before, metrics: value, screenshot });
  } catch (error) {
    fail(name, error);
  } finally {
    await context.close();
  }
}

async function noWebglFallback() {
  const name = 'holocore-renderer-raster-no-webgl-fallback';
  const context = await browser.newContext({ viewport: { width: 1024, height: 720 }, colorScheme: 'dark' });
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function patched(kind, ...args) {
      if (kind === 'webgl2') return null;
      return original.call(this, kind, ...args);
    };
  });
  const page = await context.newPage();
  try {
    await navigate(page);
    const before = await fingerprint(page);
    await page.waitForTimeout(500);
    const after = await fingerprint(page);
    const value = await metrics(page);
    assertLayout(value, name);
    assert(value.surfaceMode === 'canvas-fallback', `${name}: expected canvas fallback, got ${value.surfaceMode}`);
    assert(value.crtCanvasCount === 1, `${name}: fallback CRT canvas shell should still be present`);
    assert(before !== after, `${name}: fallback source raster did not remain live`);
    const screenshot = `${name}.png`;
    await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false });
    report.acceptance.push({ name, pass: true, before, after, metrics: value, screenshot });
  } catch (error) {
    fail(name, error);
  } finally {
    await context.close();
  }
}

await desktopLivingRaster();
await mobileBoundedRaster();
await reducedMotionStaticRaster();
await noWebglFallback();
await browser.close();

await fs.writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);

if (report.errors.length) {
  console.error(`HoloCore renderer-adapter acceptance failed with ${report.errors.length} error(s).`);
  process.exitCode = 1;
} else {
  console.log('HoloCore renderer-adapter browser acceptance passed.');
}
