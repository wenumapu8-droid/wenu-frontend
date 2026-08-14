import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence/holocore');
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = {
  baseURL,
  generatedAt: new Date().toISOString(),
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

async function navigate(page) {
  const response = await page.goto(new URL('/kodex/lab/holocore/', baseURL).toString(), {
    waitUntil: 'domcontentloaded',
    timeout: 30_000,
  });
  assert(response?.ok(), `HoloCore route returned ${response?.status()}`);
  await page.locator('[data-kdx-holocore]').waitFor({ state: 'visible', timeout: 10_000 });
  await page.waitForFunction(() => document.querySelector('[data-kdx-holocore]')?.dataset.state === 'stable loop');
}

async function metrics(page) {
  return page.evaluate(() => {
    const root = document.querySelector('.holocore-lab');
    const core = document.querySelector('[data-kdx-holocore]');
    const viewport = core?.querySelector('.kdx-holocore__viewport');
    const canvas = core?.querySelector('[data-holocore-canvas]');
    const rootRect = root?.getBoundingClientRect();
    const viewportRect = viewport?.getBoundingClientRect();
    const canvasRect = canvas?.getBoundingClientRect();
    return {
      innerWidth,
      innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      bodyScrollHeight: document.body.scrollHeight,
      rootHeight: rootRect?.height ?? 0,
      rootWidth: rootRect?.width ?? 0,
      viewportWidth: viewportRect?.width ?? 0,
      viewportHeight: viewportRect?.height ?? 0,
      canvasWidth: canvasRect?.width ?? 0,
      canvasHeight: canvasRect?.height ?? 0,
      backingWidth: canvas?.width ?? 0,
      backingHeight: canvas?.height ?? 0,
      state: core?.dataset.state ?? null,
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null,
      nodeCount: document.querySelectorAll('*').length,
    };
  });
}

function assertBounded(value, label) {
  assert(Math.abs(value.rootHeight - value.innerHeight) <= 2, `${label}: root is not 100dvh (${value.rootHeight} vs ${value.innerHeight})`);
  assert(value.scrollWidth <= value.innerWidth + 1, `${label}: horizontal overflow ${value.scrollWidth} > ${value.innerWidth}`);
  assert(value.scrollHeight <= value.innerHeight + 2, `${label}: document vertical scroll ${value.scrollHeight} > ${value.innerHeight}`);
  assert(value.bodyScrollHeight <= value.innerHeight + 2, `${label}: body vertical scroll ${value.bodyScrollHeight} > ${value.innerHeight}`);
  assert(value.viewportWidth > 100 && value.viewportHeight > 100, `${label}: HoloCore viewport collapsed`);
  assert(Math.abs(value.canvasWidth - value.viewportWidth) <= 2, `${label}: canvas escaped horizontal viewport`);
  assert(Math.abs(value.canvasHeight - value.viewportHeight) <= 2, `${label}: canvas escaped vertical viewport`);
  assert(value.backingWidth > 0 && value.backingHeight > 0, `${label}: canvas backing store is empty`);
  assert(value.state === 'stable loop', `${label}: HoloCore did not reach STABLE LOOP`);
  assert(value.robots?.includes('noindex'), `${label}: lab route is missing noindex`);
  assert(value.nodeCount < 700, `${label}: prototype DOM is unexpectedly unbounded (${value.nodeCount})`);
}

async function canvasFingerprint(page) {
  return page.locator('[data-holocore-canvas]').evaluate((canvas) => {
    const context = canvas.getContext('2d');
    if (!context || canvas.width === 0 || canvas.height === 0) return 'empty';
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const stride = Math.max(4, Math.floor(data.length / 12000 / 4) * 4);
    let hash = 2166136261;
    for (let i = 0; i < data.length; i += stride) {
      hash ^= data[i];
      hash = Math.imul(hash, 16777619);
      hash ^= data[i + 1] ?? 0;
      hash = Math.imul(hash, 16777619);
      hash ^= data[i + 2] ?? 0;
      hash = Math.imul(hash, 16777619);
    }
    return String(hash >>> 0);
  });
}

async function desktopLivingLoop() {
  const name = 'holocore-desktop-1440-living-loop';
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await context.newPage();
  try {
    await navigate(page);
    const before = await canvasFingerprint(page);
    await page.waitForTimeout(650);
    const after = await canvasFingerprint(page);
    assert(before !== 'empty' && after !== 'empty', `${name}: canvas fingerprint is empty`);
    assert(before !== after, `${name}: normal-motion signal did not advance`);
    const value = await metrics(page);
    assertBounded(value, name);
    const screenshot = `${name}.png`;
    await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false });
    report.acceptance.push({ name, pass: true, before, after, metrics: value, screenshot });
  } catch (error) {
    fail(name, error);
  } finally {
    await context.close();
  }
}

async function mobileBoundedViewport() {
  const name = 'holocore-mobile-390-bounded';
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
    const canvas = page.locator('[data-holocore-canvas]');
    await canvas.tap({ position: { x: Math.max(1, value.canvasWidth * 0.7), y: Math.max(1, value.canvasHeight * 0.35) } });
    const screenshot = `${name}.png`;
    await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false });
    report.acceptance.push({ name, pass: true, metrics: value, screenshot });
  } catch (error) {
    fail(name, error);
  } finally {
    await context.close();
  }
}

async function reducedMotionStaticPhase() {
  const name = 'holocore-reduced-motion-static-phase';
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: 'reduce',
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  try {
    await navigate(page);
    const before = await canvasFingerprint(page);
    await page.waitForTimeout(650);
    const after = await canvasFingerprint(page);
    assert(before === after, `${name}: procedural phase continued moving under reduced motion (${before} → ${after})`);

    const motion = await page.evaluate(() => {
      const scan = document.querySelector('.kdx-holocore__scan');
      const bootText = document.querySelector('.kdx-holocore__boot span');
      return {
        media: matchMedia('(prefers-reduced-motion: reduce)').matches,
        scanAnimation: scan ? getComputedStyle(scan).animationName : null,
        bootAnimation: bootText ? getComputedStyle(bootText).animationName : null,
      };
    });
    assert(motion.media, `${name}: reduced-motion media query not active`);
    assert(motion.scanAnimation === 'none', `${name}: scan animation remains active (${motion.scanAnimation})`);
    assert(motion.bootAnimation === 'none', `${name}: boot pulse remains active (${motion.bootAnimation})`);

    const value = await metrics(page);
    assertBounded(value, name);
    const screenshot = `${name}.png`;
    await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false, animations: 'allow' });
    report.acceptance.push({ name, pass: true, fingerprint: before, motion, metrics: value, screenshot });
  } catch (error) {
    fail(name, error);
  } finally {
    await context.close();
  }
}

await desktopLivingLoop();
await mobileBoundedViewport();
await reducedMotionStaticPhase();
await browser.close();

await fs.writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);

if (report.errors.length > 0) {
  console.error(`HoloCore browser acceptance failed with ${report.errors.length} error(s).`);
  process.exitCode = 1;
} else {
  console.log('HoloCore browser acceptance passed.');
}
