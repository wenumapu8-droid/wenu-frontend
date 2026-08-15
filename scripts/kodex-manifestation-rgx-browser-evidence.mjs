import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence/manifestation-rgx');
const storageKey = 'kdx:journey:v1';
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
  const response = await page.goto(new URL('/kodex/lab/manifestation-rgx/', baseURL).toString(), {
    waitUntil: 'domcontentloaded',
    timeout: 30_000,
  });
  assert(response?.ok(), `manifestation RGX route returned ${response?.status()}`);
  await page.locator('[data-kdx-manifestation-rgx-core]').waitFor({ state: 'visible', timeout: 10_000 });
  await page.waitForFunction(() => {
    const root = document.querySelector('[data-kdx-manifestation-rgx-core]');
    return root?.dataset.phase === 'POTENTIAL' && root?.dataset.specimen === 'source-chamber';
  });
}

async function waitPhase(page, phase, specimen) {
  await page.waitForFunction(
    ({ phase, specimen }) => {
      const root = document.querySelector('[data-kdx-manifestation-rgx-core]');
      return root?.dataset.phase === phase && root?.dataset.specimen === specimen;
    },
    { phase, specimen },
    { timeout: 12_000 },
  );
}

async function waitRenderer(page) {
  await page.waitForFunction(() => {
    const state = document.querySelector('[data-kdx-manifestation-rgx-core]')?.dataset.rendererState;
    return state === 'stable-loop' || state === 'static-frame';
  }, null, { timeout: 12_000 });
  await page.waitForTimeout(120);
}

async function click(page, action) {
  await page.locator(`[data-action="${action}"]`).click();
}

async function metrics(page) {
  return page.evaluate(() => {
    const lab = document.querySelector('[data-manifestation-rgx-lab]');
    const root = document.querySelector('[data-kdx-manifestation-rgx-core]');
    const canvas = root?.querySelector('[data-mrgx-canvas]');
    const scaffold = root?.querySelector('[data-mrgx-scaffold]');
    const rect = lab?.getBoundingClientRect();
    let paintedSamples = 0;
    if (canvas instanceof HTMLCanvasElement && canvas.width && canvas.height) {
      const context = canvas.getContext('2d');
      if (context) {
        const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 0; i < data.length; i += 64) {
          if ((data[i] || 0) + (data[i + 1] || 0) + (data[i + 2] || 0) > 24) paintedSamples += 1;
        }
      }
    }
    return {
      width: innerWidth,
      height: innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      bodyScrollHeight: document.body.scrollHeight,
      labWidth: rect?.width ?? 0,
      labHeight: rect?.height ?? 0,
      phase: root?.dataset.phase ?? null,
      specimen: root?.dataset.specimen ?? null,
      rgxProfile: root?.dataset.rgxProfile ?? null,
      rendererState: root?.dataset.rendererState ?? null,
      blocked: root?.dataset.blocked ?? null,
      load: Number(root?.dataset.causalLoad ?? 0),
      fps: Number(root?.dataset.fps ?? 0),
      gridColumns: Number(root?.dataset.gridColumns ?? 0),
      gridRows: Number(root?.dataset.gridRows ?? 0),
      nodeId: root?.dataset.nodeId ?? null,
      scaffoldPrimitives: Number(root?.dataset.scaffoldPrimitives ?? 0),
      canvasCount: root?.querySelectorAll('canvas').length ?? 0,
      scaffoldCount: root?.querySelectorAll('svg[data-mrgx-scaffold]').length ?? 0,
      sourcePixels: root?.dataset.sourcePixels ?? null,
      backingWidth: canvas?.width ?? 0,
      backingHeight: canvas?.height ?? 0,
      scaffoldSpecimen: scaffold?.dataset.specimen ?? null,
      paintedSamples,
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null,
      engineResolutionSource: lab?.dataset.visualResolutionSource ?? null,
      rgxResolutionSource: lab?.dataset.rgxResolutionSource ?? null,
    };
  });
}

function assertBounded(value, label) {
  assert(Math.abs(value.labHeight - value.height) <= 2, `${label}: lab is not 100dvh (${value.labHeight}/${value.height})`);
  assert(value.scrollWidth <= value.width + 1, `${label}: horizontal overflow ${value.scrollWidth}/${value.width}`);
  assert(value.scrollHeight <= value.height + 2, `${label}: document vertical overflow ${value.scrollHeight}/${value.height}`);
  assert(value.bodyScrollHeight <= value.height + 2, `${label}: body vertical overflow ${value.bodyScrollHeight}/${value.height}`);
  assert(value.backingWidth > 0 && value.backingHeight > 0, `${label}: canvas backing store empty`);
  assert(value.canvasCount === 1, `${label}: expected one active canvas, got ${value.canvasCount}`);
  assert(value.scaffoldCount === 1, `${label}: expected one scaffold, got ${value.scaffoldCount}`);
  assert(value.scaffoldPrimitives >= 8, `${label}: scaffold too sparse (${value.scaffoldPrimitives})`);
  assert(value.scaffoldSpecimen === value.specimen, `${label}: scaffold/specimen drift ${value.scaffoldSpecimen}/${value.specimen}`);
  assert(value.sourcePixels === 'none', `${label}: source-pixel boundary missing`);
  assert(value.robots?.includes('noindex'), `${label}: integration lab must remain noindex`);
}

function assertPainted(value, label) {
  assert(['stable-loop', 'static-frame'].includes(value.rendererState), `${label}: renderer not stable (${value.rendererState})`);
  assert(value.paintedSamples > 20, `${label}: insufficient painted signal (${value.paintedSamples})`);
  assert(value.gridColumns > 30 && value.gridRows > 30, `${label}: RGX grid collapsed (${value.gridColumns}×${value.gridRows})`);
}

async function validateDesktop() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await context.newPage();
  try {
    await openLab(page);
    await page.evaluate(key => sessionStorage.removeItem(key), storageKey);
    await waitRenderer(page);

    const initial = await metrics(page);
    assertBounded(initial, 'desktop initial');
    assertPainted(initial, 'desktop initial');
    assert(initial.specimen === 'source-chamber', 'desktop initial: expected SOURCE CHAMBER');

    await click(page, 'declare');
    await waitPhase(page, 'POTENTIAL', 'source-chamber');
    await click(page, 'signal');
    await waitPhase(page, 'SIGNAL', 'signal-core');

    await click(page, 'blocker');
    await waitPhase(page, 'INTERFERENCE', 'interference-portal');
    await waitRenderer(page);
    const blocked = await metrics(page);
    assert(blocked.blocked === 'true', 'desktop: blocker did not set blocked state');
    assert(blocked.load > 0, 'desktop: causal load did not reflect explicit blocker');
    assertPainted(blocked, 'desktop interference');

    await click(page, 'transform');
    await waitPhase(page, 'INTERFERENCE', 'interference-portal');

    await click(page, 'resolve');
    await waitPhase(page, 'SIGNAL', 'signal-core');
    await click(page, 'transform');
    await waitPhase(page, 'TRANSFORMING', 'signal-vortex');
    await waitRenderer(page);

    await click(page, 'realize');
    await waitPhase(page, 'REALIZED', 'dna-ascent');
    await waitRenderer(page);
    const realized = await metrics(page);
    assertBounded(realized, 'desktop realized');
    assertPainted(realized, 'desktop realized');
    assert(realized.nodeId === 'KDX-NODE-DNA-ASCENT', `desktop realized: node drift ${realized.nodeId}`);
    assert(realized.engineResolutionSource === 'NODE_MAP', `desktop realized: expected NODE_MAP, got ${realized.engineResolutionSource}`);
    assert(realized.rgxResolutionSource === 'MANIFESTATION_VIEW', `desktop realized: expected MANIFESTATION_VIEW, got ${realized.rgxResolutionSource}`);
    const realizedScreenshot = 'manifestation-rgx-desktop-realized-dna.png';
    await page.screenshot({ path: path.join(outputDir, realizedScreenshot), fullPage: false });

    await click(page, 'trace');
    await waitPhase(page, 'TRACE', 'memory-tree');
    await waitRenderer(page);
    await page.waitForFunction(() => document.querySelector('[data-kdx-manifestation-rgx-core]')?.dataset.journeyTraceWritten === 'true');
    const traced = await metrics(page);
    assertBounded(traced, 'desktop trace');
    assertPainted(traced, 'desktop trace');

    const journey = await page.evaluate(key => {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    }, storageKey);
    assert(journey, 'desktop trace: JourneyState was not persisted');
    assert(journey.committedActions?.includes('manifestation:KDX-RGX-INTENT-DNA-001:realized'), 'desktop trace: realized memory write missing');
    assert(journey.committedActions?.includes('manifestation-node:KDX-NODE-DNA-ASCENT'), 'desktop trace: node memory write missing');
    assert(journey.trace?.every(event => !('createdAt' in event)), 'desktop trace: wall-clock timing leaked into JourneyState');

    const traceScreenshot = 'manifestation-rgx-desktop-trace-memory.png';
    await page.screenshot({ path: path.join(outputDir, traceScreenshot), fullPage: false });
    report.desktop = {
      pass: true,
      initial,
      blocked,
      realized,
      traced,
      journey: {
        committedActions: journey.committedActions,
        traceLength: journey.trace?.length ?? 0,
      },
      screenshots: [realizedScreenshot, traceScreenshot],
    };
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
    await click(page, 'declare');
    await click(page, 'signal');
    await click(page, 'blocker');
    await waitPhase(page, 'INTERFERENCE', 'interference-portal');
    await waitRenderer(page);
    const value = await metrics(page);
    assertBounded(value, 'mobile');
    assertPainted(value, 'mobile');
    assert(value.blocked === 'true', 'mobile: explicit blocker not represented');
    const screenshot = 'manifestation-rgx-mobile-interference.png';
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
    await waitRenderer(page);
    const motion = await page.evaluate(() => {
      const root = document.querySelector('[data-kdx-manifestation-rgx-core]');
      const scan = root?.querySelector('.mrgx__scan');
      return {
        media: matchMedia('(prefers-reduced-motion: reduce)').matches,
        rendererState: root?.dataset.rendererState ?? null,
        scanAnimation: scan ? getComputedStyle(scan).animationName : null,
      };
    });
    assert(motion.media, 'reduced: media query inactive');
    assert(motion.rendererState === 'static-frame', `reduced: expected static-frame, got ${motion.rendererState}`);
    assert(motion.scanAnimation === 'none', `reduced: scan animation remains ${motion.scanAnimation}`);
    const value = await metrics(page);
    assertBounded(value, 'reduced');
    assertPainted(value, 'reduced');
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
  console.error(`Manifestation × RGX browser evidence failed with ${report.errors.length} error(s).`);
  for (const error of report.errors) console.error(error);
  process.exitCode = 1;
} else {
  console.log('Manifestation × RGX browser evidence passed: causal gating, node-specific realization, one active renderer, JourneyState trace, mobile and reduced motion.');
}
