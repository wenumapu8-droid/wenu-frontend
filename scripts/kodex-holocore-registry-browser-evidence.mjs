import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { HOLOCORE_SPECIMEN_IDS } from '../src/kodex/holocore/registry.js';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence/holocore-registry');
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = {
  baseURL,
  specimenIds: HOLOCORE_SPECIMEN_IDS,
  generatedAt: new Date().toISOString(),
  desktop: [],
  mobile: [],
  reducedMotion: [],
  errors: [],
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

async function navigate(page, specimenId) {
  const url = new URL('/kodex/lab/holocore-registry/', baseURL);
  url.searchParams.set('specimen', specimenId);
  const response = await page.goto(url.toString(), { waitUntil: 'domcontentloaded', timeout: 30_000 });
  assert(response?.ok(), `${specimenId}: route returned ${response?.status()}`);
  const root = page.locator('[data-kdx-holocore-registry]');
  await root.waitFor({ state: 'visible', timeout: 10_000 });
  await page.waitForFunction(
    id => {
      const element = document.querySelector('[data-kdx-holocore-registry]');
      return element?.dataset.specimen === id && element?.dataset.state === 'stable loop';
    },
    specimenId,
    { timeout: 10_000 },
  );
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await page.waitForTimeout(250);
}

async function fingerprint(page) {
  return page.locator('[data-holocore-canvas]').evaluate(canvas => {
    const context = canvas.getContext('2d');
    if (!context || canvas.width === 0 || canvas.height === 0) return 'empty';
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const stride = Math.max(4, Math.floor(data.length / 10000 / 4) * 4);
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
    const viewportRect = viewport?.getBoundingClientRect();
    return {
      innerWidth,
      innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      bodyScrollHeight: document.body.scrollHeight,
      labWidth: labRect?.width ?? 0,
      labHeight: labRect?.height ?? 0,
      viewportWidth: viewportRect?.width ?? 0,
      viewportHeight: viewportRect?.height ?? 0,
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

function assertBounded(value, specimenId, label) {
  assert(value.specimen === specimenId, `${label}: resolved ${value.specimen}, expected ${specimenId}`);
  assert(value.state === 'stable loop', `${label}: did not reach STABLE LOOP`);
  assert(Math.abs(value.labHeight - value.innerHeight) <= 2, `${label}: lab is not 100dvh`);
  assert(value.scrollWidth <= value.innerWidth + 1, `${label}: horizontal page overflow`);
  assert(value.scrollHeight <= value.innerHeight + 2, `${label}: document vertical overflow`);
  assert(value.bodyScrollHeight <= value.innerHeight + 2, `${label}: body vertical overflow`);
  assert(value.viewportWidth > 100 && value.viewportHeight > 100, `${label}: viewport collapsed`);
  assert(Math.abs(value.canvasWidth - value.viewportWidth) <= 2, `${label}: canvas width mismatch`);
  assert(Math.abs(value.canvasHeight - value.viewportHeight) <= 2, `${label}: canvas height mismatch`);
  assert(value.backingWidth > 0 && value.backingHeight > 0, `${label}: empty canvas backing store`);
  assert(value.robots?.includes('noindex'), `${label}: lab route must remain noindex`);
  assert(value.linkCount === HOLOCORE_SPECIMEN_IDS.length, `${label}: expected ${HOLOCORE_SPECIMEN_IDS.length} registry links, got ${value.linkCount}`);
}

async function validateDesktop() {
  const context = await browser.newContext({ viewport: { width: 1200, height: 760 }, colorScheme: 'dark' });
  const page = await context.newPage();
  for (const specimenId of HOLOCORE_SPECIMEN_IDS) {
    const label = `desktop:${specimenId}`;
    try {
      await navigate(page, specimenId);
      const before = await fingerprint(page);
      await page.waitForTimeout(420);
      const after = await fingerprint(page);
      assert(before !== 'empty' && after !== 'empty', `${label}: empty fingerprint`);
      assert(before !== after, `${label}: ambient loop did not advance`);
      const value = await metrics(page);
      assertBounded(value, specimenId, label);
      const screenshot = `${specimenId}-desktop.png`;
      await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false });
      report.desktop.push({ specimenId, pass: true, before, after, metrics: value, screenshot });
    } catch (error) {
      report.errors.push(`${label}: ${error?.stack || error}`);
      report.desktop.push({ specimenId, pass: false, error: String(error?.message || error) });
    }
  }
  await context.close();
}

async function validateMobile() {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  for (const specimenId of HOLOCORE_SPECIMEN_IDS) {
    const label = `mobile:${specimenId}`;
    try {
      await navigate(page, specimenId);
      const value = await metrics(page);
      assertBounded(value, specimenId, label);
      report.mobile.push({ specimenId, pass: true, metrics: value });
    } catch (error) {
      report.errors.push(`${label}: ${error?.stack || error}`);
      report.mobile.push({ specimenId, pass: false, error: String(error?.message || error) });
    }
  }
  await context.close();
}

async function validateReducedMotion() {
  const context = await browser.newContext({
    viewport: { width: 1000, height: 700 },
    reducedMotion: 'reduce',
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  for (const specimenId of HOLOCORE_SPECIMEN_IDS) {
    const label = `reduced:${specimenId}`;
    try {
      await navigate(page, specimenId);
      const before = await fingerprint(page);
      await page.waitForTimeout(420);
      const after = await fingerprint(page);
      assert(before === after, `${label}: procedural field continued moving (${before} → ${after})`);
      const motion = await page.evaluate(() => {
        const scan = document.querySelector('.kdx-holocore-registry__scan');
        const bootText = document.querySelector('.kdx-holocore-registry__boot span');
        return {
          media: matchMedia('(prefers-reduced-motion: reduce)').matches,
          scanAnimation: scan ? getComputedStyle(scan).animationName : null,
          bootAnimation: bootText ? getComputedStyle(bootText).animationName : null,
        };
      });
      assert(motion.media, `${label}: reduced-motion query inactive`);
      assert(motion.scanAnimation === 'none', `${label}: scan animation remains active`);
      assert(motion.bootAnimation === 'none', `${label}: boot animation remains active`);
      const value = await metrics(page);
      assertBounded(value, specimenId, label);
      report.reducedMotion.push({ specimenId, pass: true, fingerprint: before, motion, metrics: value });
    } catch (error) {
      report.errors.push(`${label}: ${error?.stack || error}`);
      report.reducedMotion.push({ specimenId, pass: false, error: String(error?.message || error) });
    }
  }
  await context.close();
}

await validateDesktop();
await validateMobile();
await validateReducedMotion();
await browser.close();

await fs.writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);

if (report.errors.length > 0) {
  console.error(`HoloCore registry browser evidence failed with ${report.errors.length} error(s).`);
  for (const error of report.errors) console.error(error);
  process.exitCode = 1;
} else {
  console.log(`HoloCore registry browser evidence passed for ${HOLOCORE_SPECIMEN_IDS.length} specimens.`);
}
