import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence/holocore-webgl-source');
await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = { baseURL, generatedAt: new Date().toISOString(), acceptance: [], errors: [] };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const fail = (name, error) => {
  const message = `${name}: ${String(error?.stack || error?.message || error)}`;
  report.errors.push(message); report.acceptance.push({ name, pass: false, error: message }); console.error(message);
};

async function navigate(page) {
  const response = await page.goto(new URL('/kodex/lab/holocore-webgl-source/', baseURL).toString(), { waitUntil: 'domcontentloaded', timeout: 30_000 });
  assert(response?.ok(), `route returned ${response?.status()}`);
  await page.locator('[data-kdx-webgl-source]').waitFor({ state: 'visible', timeout: 10_000 });
  await page.waitForFunction(() => document.querySelector('[data-kdx-webgl-source]')?.dataset.state === 'stable field');
  await page.waitForTimeout(240);
}

async function fingerprint(page) {
  return page.locator('[data-webgl-canvas]').evaluate(canvas => {
    const data = canvas.toDataURL('image/png');
    let hash = 2166136261;
    const stride = Math.max(1, Math.floor(data.length / 12000));
    for (let i = 0; i < data.length; i += stride) {
      hash ^= data.charCodeAt(i); hash = Math.imul(hash, 16777619);
    }
    return String(hash >>> 0);
  });
}

async function metrics(page) {
  return page.evaluate(() => {
    const pageRoot = document.querySelector('.webgl-page');
    const root = document.querySelector('[data-kdx-webgl-source]');
    const canvas = document.querySelector('[data-webgl-canvas]');
    const viewport = root?.querySelector('.kdx-webgl-source__viewport');
    return {
      innerWidth, innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      bodyScrollHeight: document.body.scrollHeight,
      pageHeight: pageRoot?.getBoundingClientRect().height ?? 0,
      viewportWidth: viewport?.clientWidth ?? 0,
      viewportHeight: viewport?.clientHeight ?? 0,
      canvasWidth: canvas?.clientWidth ?? 0,
      canvasHeight: canvas?.clientHeight ?? 0,
      backingWidth: canvas?.width ?? 0,
      backingHeight: canvas?.height ?? 0,
      rendererKind: root?.dataset.rendererKind ?? null,
      rendererMode: root?.dataset.rendererMode ?? null,
      reducedMotion: root?.dataset.reducedMotion ?? null,
      temporalContract: root?.dataset.temporalContract ?? null,
      seamlessLoopClaim: root?.dataset.seamlessLoopClaim ?? null,
      frameCount: Number(canvas?.dataset.frameCount || 0),
      shaderTime: canvas?.dataset.shaderTime ?? null,
      fallbackFrame: canvas?.dataset.fallbackFrame ?? null,
      state: root?.dataset.state ?? null,
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null,
    };
  });
}

function assertBounded(value, name) {
  assert(Math.abs(value.pageHeight - value.innerHeight) <= 2, `${name}: page not 100dvh`);
  assert(value.scrollWidth <= value.innerWidth + 1, `${name}: horizontal overflow`);
  assert(value.scrollHeight <= value.innerHeight + 2, `${name}: document overflow`);
  assert(value.bodyScrollHeight <= value.innerHeight + 2, `${name}: body overflow`);
  assert(value.viewportWidth > 100 && value.viewportHeight > 100, `${name}: viewport collapsed`);
  assert(Math.abs(value.canvasWidth - value.viewportWidth) <= 2, `${name}: canvas escaped width`);
  assert(Math.abs(value.canvasHeight - value.viewportHeight) <= 2, `${name}: canvas escaped height`);
  assert(value.backingWidth > 0 && value.backingHeight > 0, `${name}: empty backing store`);
  assert(value.rendererKind === 'webgl-shader', `${name}: wrong renderer kind`);
  assert(value.temporalContract === 'ambient_unclosed', `${name}: temporal contract changed`);
  assert(value.seamlessLoopClaim === 'false', `${name}: false seam claim lost`);
  assert(value.state === 'stable field', `${name}: field did not stabilize`);
  assert(value.robots?.includes('noindex'), `${name}: missing noindex`);
}

async function desktopLiving() {
  const name = 'holocore-webgl-source-desktop-1440';
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await context.newPage();
  try {
    await navigate(page);
    const before = await fingerprint(page); const beforeMetrics = await metrics(page);
    await page.waitForTimeout(700);
    const after = await fingerprint(page); const value = await metrics(page);
    assertBounded(value, name);
    assert(value.rendererMode === 'webgl-source', `${name}: WebGL source mode unavailable (${value.rendererMode})`);
    assert(before !== after, `${name}: ambient field did not advance`);
    assert(value.frameCount > beforeMetrics.frameCount, `${name}: frame count did not advance`);
    const screenshot = `${name}.png`; await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false });
    report.acceptance.push({ name, pass: true, before, after, metrics: value, screenshot });
  } catch (error) { fail(name, error); } finally { await context.close(); }
}

async function mobileBounded() {
  const name = 'holocore-webgl-source-mobile-390';
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, colorScheme: 'dark' });
  const page = await context.newPage();
  try {
    await navigate(page); const value = await metrics(page); assertBounded(value, name);
    assert(['webgl-source', 'canvas-fallback'].includes(value.rendererMode), `${name}: invalid mode`);
    await page.locator('[data-webgl-canvas]').tap({ position: { x: Math.max(1, value.canvasWidth * .65), y: Math.max(1, value.canvasHeight * .35) } });
    const screenshot = `${name}.png`; await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false });
    report.acceptance.push({ name, pass: true, metrics: value, screenshot });
  } catch (error) { fail(name, error); } finally { await context.close(); }
}

async function reducedStatic() {
  const name = 'holocore-webgl-source-reduced-motion';
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce', colorScheme: 'dark' });
  const page = await context.newPage();
  try {
    await navigate(page); const before = await fingerprint(page); const first = await metrics(page);
    await page.waitForTimeout(700);
    const after = await fingerprint(page); const value = await metrics(page); assertBounded(value, name);
    assert(value.reducedMotion === 'true', `${name}: reduced motion inactive`);
    assert(before === after, `${name}: WebGL image changed under reduced motion`);
    assert(value.frameCount === first.frameCount, `${name}: frame count advanced under reduced motion`);
    assert(value.shaderTime === first.shaderTime, `${name}: shader time advanced under reduced motion`);
    const screenshot = `${name}.png`; await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false, animations: 'allow' });
    report.acceptance.push({ name, pass: true, fingerprint: before, metrics: value, screenshot });
  } catch (error) { fail(name, error); } finally { await context.close(); }
}

async function fallbackStatic() {
  const name = 'holocore-webgl-source-no-webgl-fallback';
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
    await navigate(page); const before = await fingerprint(page);
    await page.waitForTimeout(500);
    const after = await fingerprint(page); const value = await metrics(page); assertBounded(value, name);
    assert(value.rendererMode === 'canvas-fallback', `${name}: expected canvas fallback`);
    assert(value.fallbackFrame === 'static-reticle', `${name}: fallback semantic frame missing`);
    assert(before === after, `${name}: static fallback unexpectedly changed`);
    const screenshot = `${name}.png`; await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false });
    report.acceptance.push({ name, pass: true, fingerprint: before, metrics: value, screenshot });
  } catch (error) { fail(name, error); } finally { await context.close(); }
}

await desktopLiving(); await mobileBounded(); await reducedStatic(); await fallbackStatic();
await browser.close();
await fs.writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
if (report.errors.length) { console.error(`HoloCore WebGL source acceptance failed with ${report.errors.length} error(s).`); process.exitCode = 1; }
else console.log('HoloCore WebGL source browser acceptance passed.');
