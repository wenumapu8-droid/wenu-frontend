import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence/holocore-registry');
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = { baseURL, generatedAt: new Date().toISOString(), acceptance: [], errors: [] };
const ids = ['orbital-city', 'signal-core', 'interference-portal'];

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const fail = (name, error) => {
  const message = `${name}: ${String(error?.stack || error?.message || error)}`;
  report.errors.push(message);
  report.acceptance.push({ name, pass: false, error: message });
  console.error(message);
};

async function navigate(page, specimen) {
  const url = new URL('/kodex/lab/holocore-registry/', baseURL);
  url.searchParams.set('specimen', specimen);
  const response = await page.goto(url.toString(), { waitUntil: 'domcontentloaded', timeout: 30_000 });
  assert(response?.ok(), `${specimen}: route returned ${response?.status()}`);
  await page.locator('[data-kdx-holocore-registry]').waitFor({ state: 'visible', timeout: 10_000 });
  await page.waitForFunction(
    expected => {
      const root = document.querySelector('[data-kdx-holocore-registry]');
      return root?.dataset.specimen === expected && root?.dataset.state === 'stable loop';
    },
    specimen,
  );
  try { await page.evaluate(() => document.fonts?.ready); } catch {}
  // Normal-motion CSS can still be settling when semantic state flips.
  await page.waitForTimeout(1000);
}

async function fingerprint(page) {
  return page.locator('[data-holocore-canvas]').evaluate(canvas => {
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
    const lab = document.querySelector('.registry-lab');
    const root = document.querySelector('[data-kdx-holocore-registry]');
    const viewport = root?.querySelector('.kdx-holocore-registry__viewport');
    const canvas = root?.querySelector('[data-holocore-canvas]');
    const labRect = lab?.getBoundingClientRect();
    return {
      innerWidth,
      innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      bodyScrollHeight: document.body.scrollHeight,
      labWidth: labRect?.width ?? 0,
      labHeight: labRect?.height ?? 0,
      viewportWidth: viewport?.clientWidth ?? 0,
      viewportHeight: viewport?.clientHeight ?? 0,
      canvasWidth: canvas?.clientWidth ?? 0,
      canvasHeight: canvas?.clientHeight ?? 0,
      backingWidth: canvas?.width ?? 0,
      backingHeight: canvas?.height ?? 0,
      specimen: root?.dataset.specimen ?? null,
      state: root?.dataset.state ?? null,
      title: root?.querySelector('[data-holocore-title]')?.textContent?.trim() ?? null,
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null,
      linkCount: document.querySelectorAll('.registry-lab__footer a').length,
    };
  });
}

function assertBounded(value, label) {
  assert(Math.abs(value.labHeight - value.innerHeight) <= 2, `${label}: lab not 100dvh`);
  assert(value.scrollWidth <= value.innerWidth + 1, `${label}: horizontal overflow`);
  assert(value.scrollHeight <= value.innerHeight + 2, `${label}: document vertical overflow`);
  assert(value.bodyScrollHeight <= value.innerHeight + 2, `${label}: body vertical overflow`);
  assert(value.viewportWidth > 100 && value.viewportHeight > 100, `${label}: viewport collapsed`);
  assert(Math.abs(value.canvasWidth - value.viewportWidth) <= 2, `${label}: canvas layout escaped viewport`);
  assert(Math.abs(value.canvasHeight - value.viewportHeight) <= 2, `${label}: canvas layout escaped viewport`);
  assert(value.backingWidth > 0 && value.backingHeight > 0, `${label}: empty canvas backing store`);
  assert(value.state === 'stable loop', `${label}: did not reach stable loop`);
  assert(value.robots?.includes('noindex'), `${label}: missing noindex`);
  assert(value.linkCount === 3, `${label}: registry navigation contract changed`);
}

async function desktopSpecimen(specimen) {
  const name = `holocore-registry-${specimen}-desktop`;
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await context.newPage();
  try {
    await navigate(page, specimen);
    const before = await fingerprint(page);
    await page.waitForTimeout(650);
    const after = await fingerprint(page);
    assert(before !== 'empty' && after !== 'empty', `${name}: empty fingerprint`);
    assert(before !== after, `${name}: normal-motion field did not advance`);
    const value = await metrics(page);
    assertBounded(value, name);
    assert(value.specimen === specimen, `${name}: wrong specimen ${value.specimen}`);
    const screenshot = `${name}.png`;
    await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false });
    report.acceptance.push({ name, pass: true, before, after, metrics: value, screenshot });
  } catch (error) {
    fail(name, error);
  } finally {
    await context.close();
  }
}

async function mobileRegistry() {
  const specimen = 'signal-core';
  const name = 'holocore-registry-mobile-390';
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, colorScheme: 'dark',
  });
  const page = await context.newPage();
  try {
    await navigate(page, specimen);
    const value = await metrics(page);
    assertBounded(value, name);
    assert(value.specimen === specimen, `${name}: wrong specimen`);
    const links = page.locator('.registry-lab__footer a');
    assert(await links.count() === 3, `${name}: missing registry links`);
    const screenshot = `${name}.png`;
    await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false });
    report.acceptance.push({ name, pass: true, metrics: value, screenshot });
  } catch (error) {
    fail(name, error);
  } finally {
    await context.close();
  }
}

async function reducedMotionRegistry() {
  const specimen = 'interference-portal';
  const name = 'holocore-registry-reduced-motion';
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce', colorScheme: 'dark',
  });
  const page = await context.newPage();
  try {
    await navigate(page, specimen);
    const before = await fingerprint(page);
    await page.waitForTimeout(650);
    const after = await fingerprint(page);
    assert(before === after, `${name}: procedural field continued moving (${before} → ${after})`);
    const css = await page.evaluate(() => ({
      media: matchMedia('(prefers-reduced-motion: reduce)').matches,
      scan: getComputedStyle(document.querySelector('.kdx-holocore-registry__scan')).animationName,
      boot: getComputedStyle(document.querySelector('.kdx-holocore-registry__boot span')).animationName,
    }));
    assert(css.media, `${name}: reduced-motion media query inactive`);
    assert(css.scan === 'none', `${name}: scan still animated (${css.scan})`);
    assert(css.boot === 'none', `${name}: boot still animated (${css.boot})`);
    const value = await metrics(page);
    assertBounded(value, name);
    const screenshot = `${name}.png`;
    await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false, animations: 'allow' });
    report.acceptance.push({ name, pass: true, fingerprint: before, css, metrics: value, screenshot });
  } catch (error) {
    fail(name, error);
  } finally {
    await context.close();
  }
}

for (const specimen of ids) await desktopSpecimen(specimen);
await mobileRegistry();
await reducedMotionRegistry();
await browser.close();

await fs.writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);

if (report.errors.length > 0) {
  console.error(`HoloCore registry browser acceptance failed with ${report.errors.length} error(s).`);
  process.exitCode = 1;
} else {
  console.log('HoloCore registry browser acceptance passed.');
}
