import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence/holocore-rgx');
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
  const response = await page.goto(new URL('/kodex/lab/holocore-rgx/', baseURL).toString(), {
    waitUntil: 'domcontentloaded',
    timeout: 30_000,
  });
  assert(response?.ok(), `route returned ${response?.status()}`);
  await page.locator('[data-kdx-holocore-rgx]').waitFor({ state: 'visible', timeout: 10_000 });
  await page.waitForFunction(() => {
    const root = document.querySelector('[data-kdx-holocore-rgx]');
    return root?.dataset.state === 'stable loop';
  });
  try { await page.evaluate(() => document.fonts?.ready); } catch {}
  await page.waitForTimeout(650);
}

async function fingerprint(page) {
  return page.locator('[data-rgx-canvas]').evaluate(canvas => {
    const context = canvas.getContext('2d');
    if (!context || canvas.width === 0 || canvas.height === 0) return 'empty';
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const stride = Math.max(4, Math.floor(data.length / 16000 / 4) * 4);
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
    const lab = document.querySelector('.rgx-lab');
    const root = document.querySelector('[data-kdx-holocore-rgx]');
    const viewport = root?.querySelector('.kdx-holocore-rgx__viewport');
    const canvas = root?.querySelector('[data-rgx-canvas]');
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
      gridColumns: Number(root?.dataset.gridColumns || 0),
      gridRows: Number(root?.dataset.gridRows || 0),
      fps: Number(root?.dataset.fps || 0),
      state: root?.dataset.state ?? null,
      profile: root?.dataset.profile ?? null,
      referenceLayers: root?.querySelectorAll('[data-ref-layer]').length ?? 0,
      referenceNodes: root?.querySelectorAll('[data-ref-node]').length ?? 0,
      referenceSpokes: root?.querySelectorAll('[data-ref-spoke]').length ?? 0,
      cloudPuffs: root?.querySelectorAll('[data-ref-cloud]').length ?? 0,
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null,
      footer: root?.querySelector('.kdx-holocore-rgx__footer')?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
    };
  });
}

function assertBounded(value, label) {
  assert(Math.abs(value.labHeight - value.innerHeight) <= 2, `${label}: lab not 100dvh`);
  assert(value.scrollWidth <= value.innerWidth + 1, `${label}: horizontal overflow`);
  assert(value.scrollHeight <= value.innerHeight + 2, `${label}: document vertical overflow`);
  assert(value.bodyScrollHeight <= value.innerHeight + 2, `${label}: body vertical overflow`);
  assert(value.viewportWidth > 100 && value.viewportHeight > 100, `${label}: viewport collapsed`);
  assert(Math.abs(value.canvasWidth - value.viewportWidth) <= 2, `${label}: canvas escaped viewport`);
  assert(Math.abs(value.canvasHeight - value.viewportHeight) <= 2, `${label}: canvas escaped viewport`);
  assert(value.backingWidth > 0 && value.backingHeight > 0, `${label}: empty backing store`);
  assert(value.state === 'stable loop', `${label}: did not reach stable loop`);
  assert(value.profile === 'orbital-city-rgx-v1', `${label}: wrong profile`);
  assert(value.robots?.includes('noindex'), `${label}: missing noindex`);
  assert(value.referenceLayers >= 7, `${label}: reference scaffold missing layers (${value.referenceLayers})`);
  assert(value.referenceNodes >= 40, `${label}: reference node density too low (${value.referenceNodes})`);
  assert(value.referenceSpokes === 16, `${label}: habitat spoke topology drifted (${value.referenceSpokes})`);
  assert(value.cloudPuffs === 5, `${label}: atmosphere scaffold drifted (${value.cloudPuffs})`);
  assert(value.footer.includes('NO SOURCE PIXELS'), `${label}: provenance boundary missing`);
}

async function desktop() {
  const name = 'holocore-rgx-desktop-1440';
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await context.newPage();
  try {
    await navigate(page);
    const before = await fingerprint(page);
    await page.waitForTimeout(700);
    const after = await fingerprint(page);
    const value = await metrics(page);
    assertBounded(value, name);
    assert(before !== 'empty' && after !== 'empty', `${name}: empty raster`);
    assert(before !== after, `${name}: seamless loop is not advancing`);
    assert(value.gridColumns >= 190, `${name}: RGX microglyph density too low (${value.gridColumns} columns)`);
    assert(value.gridRows >= 80, `${name}: RGX row density too low (${value.gridRows} rows)`);
    const screenshot = `${name}.png`;
    await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false });
    report.acceptance.push({ name, pass: true, before, after, metrics: value, screenshot });
  } catch (error) {
    fail(name, error);
  } finally {
    await context.close();
  }
}

async function mobile() {
  const name = 'holocore-rgx-mobile-390';
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  try {
    await navigate(page);
    const value = await metrics(page);
    assertBounded(value, name);
    assert(value.gridColumns >= 38, `${name}: mobile glyph density too low (${value.gridColumns})`);
    assert(value.gridRows >= 70, `${name}: mobile row density too low (${value.gridRows})`);
    const screenshot = `${name}.png`;
    await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false });
    report.acceptance.push({ name, pass: true, metrics: value, screenshot });
  } catch (error) {
    fail(name, error);
  } finally {
    await context.close();
  }
}

async function reducedMotion() {
  const name = 'holocore-rgx-reduced-motion';
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: 'reduce',
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  try {
    await navigate(page);
    const before = await fingerprint(page);
    await page.waitForTimeout(700);
    const after = await fingerprint(page);
    assert(before === after, `${name}: ASCII raster continued moving (${before} → ${after})`);
    const css = await page.evaluate(() => ({
      media: matchMedia('(prefers-reduced-motion: reduce)').matches,
      scan: getComputedStyle(document.querySelector('.kdx-holocore-rgx__scan')).animationName,
      ring: getComputedStyle(document.querySelector('.rgx-layer > ellipse:first-child')).animationName,
      node: getComputedStyle(document.querySelector('.rgx-nodes g')).animationName,
    }));
    assert(css.media, `${name}: reduced motion media query inactive`);
    assert(css.scan === 'none', `${name}: scan still animated (${css.scan})`);
    assert(css.ring === 'none', `${name}: vector ring still animated (${css.ring})`);
    assert(css.node === 'none', `${name}: nodes still animated (${css.node})`);
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

await desktop();
await mobile();
await reducedMotion();
await browser.close();

await fs.writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);

if (report.errors.length > 0) {
  console.error(`HoloCore RGX browser acceptance failed with ${report.errors.length} error(s).`);
  process.exitCode = 1;
} else {
  console.log('HoloCore RGX browser acceptance passed.');
}
