import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence/manifestation-engine');
await fs.mkdir(outputDir, { recursive: true });

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const report = {
  baseURL,
  generatedAt: new Date().toISOString(),
  desktop: null,
  mobile: null,
  reducedMotion: null,
  errors: [],
};

const browser = await chromium.launch({ headless: true });

async function openLab(page) {
  const response = await page.goto(new URL('/kodex/lab/manifestation-engine/', baseURL).toString(), {
    waitUntil: 'domcontentloaded',
    timeout: 30_000,
  });
  assert(response?.ok(), `route returned ${response?.status()}`);
  await page.locator('[data-kdx-manifestation-core]').waitFor({ state: 'visible', timeout: 10_000 });
  await page.waitForFunction(() => {
    const root = document.querySelector('[data-kdx-manifestation-core]');
    return root?.dataset.phase === 'POTENTIAL' && root?.dataset.specimen === 'source-chamber';
  });
}

async function metrics(page) {
  return page.evaluate(() => {
    const lab = document.querySelector('[data-manifestation-lab]');
    const core = document.querySelector('[data-kdx-manifestation-core]');
    const canvas = core?.querySelector('[data-manifestation-canvas]');
    const rect = lab?.getBoundingClientRect();
    return {
      width: innerWidth,
      height: innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      bodyScrollHeight: document.body.scrollHeight,
      labWidth: rect?.width ?? 0,
      labHeight: rect?.height ?? 0,
      phase: core?.dataset.phase ?? null,
      specimen: core?.dataset.specimen ?? null,
      blocked: core?.dataset.blocked ?? null,
      load: Number(core?.dataset.causalLoad ?? 0),
      backingWidth: canvas?.width ?? 0,
      backingHeight: canvas?.height ?? 0,
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null,
    };
  });
}

function assertBounded(value, label) {
  assert(Math.abs(value.labHeight - value.height) <= 2, `${label}: lab is not 100dvh`);
  assert(value.scrollWidth <= value.width + 1, `${label}: horizontal overflow`);
  assert(value.scrollHeight <= value.height + 2, `${label}: document vertical overflow`);
  assert(value.bodyScrollHeight <= value.height + 2, `${label}: body vertical overflow`);
  assert(value.backingWidth > 0 && value.backingHeight > 0, `${label}: canvas is empty`);
  assert(value.robots?.includes('noindex'), `${label}: lab route must remain noindex`);
}

async function waitPhase(page, phase, specimen) {
  await page.waitForFunction(
    ({ phase, specimen }) => {
      const root = document.querySelector('[data-kdx-manifestation-core]');
      return root?.dataset.phase === phase && root?.dataset.specimen === specimen;
    },
    { phase, specimen },
    { timeout: 10_000 },
  );
}

async function click(page, selector) {
  await page.locator(selector).click();
}

async function validateDesktop() {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: 'dark' });
  const page = await context.newPage();
  try {
    await openLab(page);
    await click(page, '[data-action="declare"]');
    await waitPhase(page, 'POTENTIAL', 'source-chamber');
    await click(page, '[data-action="signal"]');
    await waitPhase(page, 'SIGNAL', 'signal-core');

    await click(page, '[data-action="blocker"][data-blocker="evidence"]');
    await waitPhase(page, 'INTERFERENCE', 'interference-portal');
    const blocked = await metrics(page);
    assert(blocked.blocked === 'true', 'desktop: blocker did not set blocked state');
    assert(blocked.load > 0, 'desktop: causal load did not reflect explicit blocker');

    await click(page, '[data-action="transform"]');
    await waitPhase(page, 'INTERFERENCE', 'interference-portal');

    await click(page, '[data-action="resolve"]');
    await waitPhase(page, 'SIGNAL', 'signal-core');
    await click(page, '[data-action="transform"]');
    await waitPhase(page, 'TRANSFORMING', 'signal-vortex');
    await click(page, '[data-action="realize"]');
    await waitPhase(page, 'REALIZED', 'interference-portal');
    await click(page, '[data-action="trace"]');
    await waitPhase(page, 'TRACE', 'memory-tree');

    await page.waitForTimeout(500);
    const value = await metrics(page);
    assertBounded(value, 'desktop');
    const screenshot = 'manifestation-desktop-trace.png';
    await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false });
    report.desktop = { pass: true, metrics: value, screenshot };
  } catch (error) {
    report.errors.push(`desktop: ${error?.stack || error}`);
    report.desktop = { pass: false, error: String(error?.message || error) };
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
  try {
    await openLab(page);
    await click(page, '[data-action="declare"]');
    await click(page, '[data-action="signal"]');
    await click(page, '[data-action="blocker"][data-blocker="creator"]');
    await waitPhase(page, 'INTERFERENCE', 'interference-portal');
    const value = await metrics(page);
    assertBounded(value, 'mobile');
    const screenshot = 'manifestation-mobile-interference.png';
    await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false });
    report.mobile = { pass: true, metrics: value, screenshot };
  } catch (error) {
    report.errors.push(`mobile: ${error?.stack || error}`);
    report.mobile = { pass: false, error: String(error?.message || error) };
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
  try {
    await openLab(page);
    await page.waitForTimeout(350);
    const motion = await page.evaluate(() => {
      const root = document.querySelector('[data-kdx-manifestation-core]');
      const scan = root?.querySelector('.kdx-manifestation-core__scan');
      return {
        media: matchMedia('(prefers-reduced-motion: reduce)').matches,
        rendererState: root?.dataset.rendererState ?? null,
        scanAnimation: scan ? getComputedStyle(scan).animationName : null,
      };
    });
    assert(motion.media, 'reduced: media query inactive');
    assert(motion.rendererState === 'static-frame', `reduced: expected static-frame, got ${motion.rendererState}`);
    assert(motion.scanAnimation === 'none', 'reduced: scan animation remains active');
    const value = await metrics(page);
    assertBounded(value, 'reduced');
    report.reducedMotion = { pass: true, motion, metrics: value };
  } catch (error) {
    report.errors.push(`reduced: ${error?.stack || error}`);
    report.reducedMotion = { pass: false, error: String(error?.message || error) };
  }
  await context.close();
}

await validateDesktop();
await validateMobile();
await validateReducedMotion();
await browser.close();

await fs.writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);

if (report.errors.length) {
  console.error(`Manifestation browser evidence failed with ${report.errors.length} error(s).`);
  for (const error of report.errors) console.error(error);
  process.exitCode = 1;
} else {
  console.log('Manifestation browser evidence passed for desktop, mobile and reduced motion.');
}
