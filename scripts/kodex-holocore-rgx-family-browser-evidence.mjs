import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { HOLOCORE_RGX_PROFILE_IDS } from '../src/kodex/holocore/reference-profiles/rgx-family.js';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence/holocore-rgx-family');
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = {
  baseURL,
  generatedAt: new Date().toISOString(),
  coreCount: HOLOCORE_RGX_PROFILE_IDS.length,
  acceptance: [],
  errors: [],
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const fail = (name, error) => {
  const message = `${name}: ${String(error?.stack || error?.message || error)}`;
  report.errors.push(message);
  report.acceptance.push({ name, pass: false, error: message });
  console.error(message);
};

async function navigate(page, id) {
  const url = new URL(`/kodex/lab/holocore-rgx-family/${id}/`, baseURL).toString();
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  assert(response?.ok(), `${id}: route returned ${response?.status()}`);
  await page.locator('[data-kdx-holocore-rgx-family]').waitFor({ state: 'visible', timeout: 10_000 });
  await page.waitForFunction(() => {
    const root = document.querySelector('[data-kdx-holocore-rgx-family]');
    return root?.dataset.state === 'stable loop';
  }, null, { timeout: 12_000 });
  try { await page.evaluate(() => document.fonts?.ready); } catch {}
  await page.waitForTimeout(600);
}

async function fingerprint(page) {
  return page.locator('[data-rgx-canvas]').evaluate(canvas => {
    const context = canvas.getContext('2d');
    if (!context || canvas.width === 0 || canvas.height === 0) return 'empty';
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const stride = Math.max(4, Math.floor(data.length / 18000 / 4) * 4);
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
    const lab = document.querySelector('[data-rgx-family-lab]');
    const root = document.querySelector('[data-kdx-holocore-rgx-family]');
    const viewport = root?.querySelector('.kdx-rgx-family__viewport');
    const canvas = root?.querySelector('[data-rgx-canvas]');
    const labRect = lab?.getBoundingClientRect();
    const primitiveCount = root?.querySelectorAll('[data-rgx-primitive]').length ?? 0;
    const primaryCount = root?.querySelectorAll('[data-rgx-role="primary"]').length ?? 0;
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
      conceptId: root?.dataset.conceptId ?? null,
      motif: root?.dataset.motif ?? null,
      primitiveCount,
      primaryCount,
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null,
      footer: root?.querySelector('.kdx-rgx-family__footer')?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
    };
  });
}

function assertBounded(value, id, label) {
  assert(Math.abs(value.labHeight - value.innerHeight) <= 2, `${label}: lab not 100dvh (${value.labHeight}/${value.innerHeight})`);
  assert(value.scrollWidth <= value.innerWidth + 1, `${label}: horizontal overflow ${value.scrollWidth}/${value.innerWidth}`);
  assert(value.scrollHeight <= value.innerHeight + 2, `${label}: document vertical overflow ${value.scrollHeight}/${value.innerHeight}`);
  assert(value.bodyScrollHeight <= value.innerHeight + 2, `${label}: body vertical overflow ${value.bodyScrollHeight}/${value.innerHeight}`);
  assert(value.viewportWidth > 100 && value.viewportHeight > 100, `${label}: collapsed viewport`);
  assert(Math.abs(value.canvasWidth - value.viewportWidth) <= 2, `${label}: canvas escaped viewport width`);
  assert(Math.abs(value.canvasHeight - value.viewportHeight) <= 2, `${label}: canvas escaped viewport height`);
  assert(value.backingWidth > 0 && value.backingHeight > 0, `${label}: empty backing store`);
  assert(value.state === 'stable loop', `${label}: state ${value.state}`);
  assert(value.profile === `${id}-rgx-v1`, `${label}: profile drift ${value.profile}`);
  assert(value.conceptId === id, `${label}: concept drift ${value.conceptId}`);
  assert(value.motif, `${label}: missing motif`);
  assert(value.primitiveCount >= 8, `${label}: scaffold too sparse (${value.primitiveCount})`);
  assert(value.primaryCount >= 1, `${label}: no primary scaffold geometry`);
  assert(value.robots?.includes('noindex'), `${label}: missing noindex`);
  assert(value.footer.includes('NO SOURCE PIXELS'), `${label}: provenance boundary missing`);
}

async function desktop(id) {
  const name = `${id}-desktop-1440`;
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await context.newPage();
  try {
    await navigate(page, id);
    const before = await fingerprint(page);
    await page.waitForTimeout(700);
    const after = await fingerprint(page);
    const value = await metrics(page);
    assertBounded(value, id, name);
    assert(before !== 'empty' && after !== 'empty', `${name}: empty raster`);
    assert(before !== after, `${name}: living loop fingerprint did not advance`);
    assert(value.gridColumns >= 190, `${name}: RGX density too low (${value.gridColumns} columns)`);
    assert(value.gridRows >= 80, `${name}: RGX density too low (${value.gridRows} rows)`);
    assert(value.fps >= 8, `${name}: prototype performance below 8 FPS (${value.fps})`);
    const screenshot = `${name}.png`;
    await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false });
    report.acceptance.push({ name, id, mode: 'desktop', pass: true, before, after, metrics: value, screenshot });
  } catch (error) {
    fail(name, error);
  } finally {
    await context.close();
  }
}

async function mobile(id) {
  const name = `${id}-mobile-390`;
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  try {
    await navigate(page, id);
    const value = await metrics(page);
    assertBounded(value, id, name);
    assert(value.gridColumns >= 38, `${name}: mobile density too low (${value.gridColumns})`);
    assert(value.gridRows >= 70, `${name}: mobile density too low (${value.gridRows})`);
    assert(value.fps >= 8, `${name}: prototype performance below 8 FPS (${value.fps})`);
    const screenshot = `${name}.png`;
    await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false });
    report.acceptance.push({ name, id, mode: 'mobile', pass: true, metrics: value, screenshot });
  } catch (error) {
    fail(name, error);
  } finally {
    await context.close();
  }
}

async function reducedMotion(id) {
  const name = `${id}-reduced-motion`;
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: 'reduce',
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  try {
    await navigate(page, id);
    const before = await fingerprint(page);
    await page.waitForTimeout(700);
    const after = await fingerprint(page);
    assert(before !== 'empty', `${name}: empty raster`);
    assert(before === after, `${name}: Canvas continued moving (${before} → ${after})`);
    const css = await page.evaluate(() => {
      const nodes = [...document.querySelectorAll('.rgx-p--ring,.rgx-p--node,.rgx-p--atmosphere,.kdx-rgx-family__scan')];
      return {
        media: matchMedia('(prefers-reduced-motion: reduce)').matches,
        animationNames: nodes.map(node => getComputedStyle(node).animationName),
      };
    });
    assert(css.media, `${name}: reduced-motion media query inactive`);
    assert(css.animationNames.every(name => name === 'none'), `${name}: animated scaffold/surface remains: ${css.animationNames.join(',')}`);
    const value = await metrics(page);
    assertBounded(value, id, name);
    const screenshot = `${name}.png`;
    await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false, animations: 'allow' });
    report.acceptance.push({ name, id, mode: 'reduced-motion', pass: true, fingerprint: before, css, metrics: value, screenshot });
  } catch (error) {
    fail(name, error);
  } finally {
    await context.close();
  }
}

for (const id of HOLOCORE_RGX_PROFILE_IDS) await desktop(id);
for (const id of HOLOCORE_RGX_PROFILE_IDS) await mobile(id);
for (const id of HOLOCORE_RGX_PROFILE_IDS) await reducedMotion(id);

await browser.close();

const passed = report.acceptance.filter(item => item.pass).length;
report.summary = {
  expectedChecks: HOLOCORE_RGX_PROFILE_IDS.length * 3,
  passed,
  failed: report.errors.length,
  desktop: report.acceptance.filter(item => item.pass && item.mode === 'desktop').length,
  mobile: report.acceptance.filter(item => item.pass && item.mode === 'mobile').length,
  reducedMotion: report.acceptance.filter(item => item.pass && item.mode === 'reduced-motion').length,
};

await fs.writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);

if (report.errors.length > 0) {
  console.error(`HoloCore RGX family acceptance failed with ${report.errors.length} error(s).`);
  process.exitCode = 1;
} else {
  console.log(`HoloCore RGX family acceptance passed: ${passed}/${report.summary.expectedChecks}.`);
}
