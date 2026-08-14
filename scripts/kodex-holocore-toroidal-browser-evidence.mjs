import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const route = new URL('/kodex/lab/holocore-toroidal-field/', baseURL).toString();
const outputDir = path.resolve('artifacts/kodex-browser-evidence/holocore-toroidal-field');
await fs.mkdir(outputDir, { recursive: true });

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

async function fingerprint(page) {
  return page.locator('[data-toroid-canvas]').evaluate(canvas => {
    const context = canvas.getContext('2d');
    if (!context || canvas.width === 0 || canvas.height === 0) return 'empty';
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const stride = Math.max(4, Math.floor(data.length / 12000 / 4) * 4);
    let hash = 2166136261;
    for (let i = 0; i < data.length; i += stride) {
      hash ^= data[i]; hash = Math.imul(hash, 16777619);
      hash ^= data[i + 1] ?? 0; hash = Math.imul(hash, 16777619);
      hash ^= data[i + 2] ?? 0; hash = Math.imul(hash, 16777619);
    }
    return String(hash >>> 0);
  });
}

async function metrics(page) {
  return page.evaluate(() => {
    const root = document.querySelector('[data-kdx-toroid-lab]');
    const canvas = document.querySelector('[data-toroid-canvas]');
    const rootRect = root?.getBoundingClientRect();
    const canvasRect = canvas?.getBoundingClientRect();
    return {
      state: root?.dataset.state ?? null,
      activeTag: document.activeElement?.tagName ?? null,
      activeIsRoot: document.activeElement === root,
      innerWidth,
      innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      bodyScrollHeight: document.body.scrollHeight,
      rootWidth: rootRect?.width ?? 0,
      rootHeight: rootRect?.height ?? 0,
      canvasWidth: canvasRect?.width ?? 0,
      canvasHeight: canvasRect?.height ?? 0,
      backingWidth: canvas?.width ?? 0,
      backingHeight: canvas?.height ?? 0,
      title: document.querySelector('#toroid-title')?.textContent?.trim() ?? null,
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null,
    };
  });
}

function assertBounded(value, label) {
  assert(value.state === 'stable', `${label}: field did not stabilize`);
  assert(value.title === 'TOROIDAL FIELD', `${label}: missing benchmark identity`);
  assert(value.robots?.includes('noindex'), `${label}: internal benchmark must remain noindex`);
  assert(Math.abs(value.rootHeight - value.innerHeight) <= 2, `${label}: root is not 100dvh`);
  assert(value.scrollWidth <= value.innerWidth + 1, `${label}: horizontal document overflow`);
  assert(value.scrollHeight <= value.innerHeight + 2, `${label}: vertical document overflow`);
  assert(value.bodyScrollHeight <= value.innerHeight + 2, `${label}: vertical body overflow`);
  assert(value.canvasWidth >= value.innerWidth * 0.9, `${label}: HoloCore does not dominate viewport width`);
  assert(value.canvasHeight >= value.innerHeight * 0.82, `${label}: HoloCore does not dominate viewport height`);
  assert(value.backingWidth > 0 && value.backingHeight > 0, `${label}: canvas backing store is empty`);
  assert(value.activeIsRoot, `${label}: stable plate did not restore focus to the scene root`);
}

const browser = await chromium.launch({ headless: true });
const report = { route, generatedAt: new Date().toISOString(), desktop: null, mobile: null, reducedMotion: null, errors: [] };

async function runAnimated(label, contextOptions, screenshot) {
  const context = await browser.newContext({ ...contextOptions, colorScheme: 'dark' });
  const page = await context.newPage();
  try {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    assert(response?.ok(), `${label}: route returned ${response?.status()}`);
    await page.locator('[data-kdx-toroid-lab]').waitFor({ state: 'visible', timeout: 10_000 });
    await page.waitForFunction(() => document.querySelector('[data-kdx-toroid-lab]')?.dataset.state === 'stable', null, { timeout: 10_000 });
    const before = await fingerprint(page);
    await page.waitForTimeout(520);
    const after = await fingerprint(page);
    assert(before !== 'empty' && after !== 'empty', `${label}: empty canvas fingerprint`);
    assert(before !== after, `${label}: ambient field did not advance`);
    const value = await metrics(page);
    assertBounded(value, label);
    await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false });
    return { pass: true, before, after, metrics: value, screenshot };
  } catch (error) {
    report.errors.push(`${label}: ${error?.stack || error}`);
    return { pass: false, error: String(error?.message || error) };
  } finally {
    await context.close();
  }
}

report.desktop = await runAnimated('desktop', { viewport: { width: 1440, height: 900 } }, 'toroidal-field-desktop.png');
report.mobile = await runAnimated('mobile', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, 'toroidal-field-mobile.png');

{
  const context = await browser.newContext({ viewport: { width: 1000, height: 700 }, reducedMotion: 'reduce', colorScheme: 'dark' });
  const page = await context.newPage();
  try {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    assert(response?.ok(), `reduced: route returned ${response?.status()}`);
    await page.waitForFunction(() => document.querySelector('[data-kdx-toroid-lab]')?.dataset.state === 'stable', null, { timeout: 10_000 });
    const before = await fingerprint(page);
    await page.waitForTimeout(520);
    const after = await fingerprint(page);
    assert(before !== 'empty', 'reduced: empty canvas fingerprint');
    assert(before === after, `reduced: field continued moving (${before} → ${after})`);
    const value = await metrics(page);
    assertBounded(value, 'reduced');
    const media = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
    assert(media, 'reduced: media query inactive');
    report.reducedMotion = { pass: true, fingerprint: before, metrics: value };
  } catch (error) {
    report.errors.push(`reduced: ${error?.stack || error}`);
    report.reducedMotion = { pass: false, error: String(error?.message || error) };
  } finally {
    await context.close();
  }
}

await browser.close();
await fs.writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);

if (report.errors.length) {
  console.error(`Toroidal HoloCore browser evidence failed with ${report.errors.length} error(s).`);
  for (const error of report.errors) console.error(error);
  process.exitCode = 1;
} else {
  console.log('Toroidal HoloCore browser evidence passed for desktop, mobile and reduced motion.');
}
