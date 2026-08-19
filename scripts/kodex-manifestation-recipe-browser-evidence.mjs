import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence');
await fs.mkdir(outputDir, { recursive: true });

const profiles = [
  { key: 'desktop', width: 1440, height: 900, reducedMotion: 'no-preference' },
  { key: 'mobile-390', width: 390, height: 844, reducedMotion: 'no-preference', isMobile: true, hasTouch: true },
  { key: 'mobile-412', width: 412, height: 915, reducedMotion: 'no-preference', isMobile: true, hasTouch: true },
  { key: 'reduced', width: 1280, height: 800, reducedMotion: 'reduce' },
];

const report = { baseURL, generatedAt: new Date().toISOString(), cases: [], errors: [] };
const browser = await chromium.launch({ headless: true });
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const formatError = (error) => String(error?.stack || error?.message || error);
const stateReadoutSelector = '.kdx-mrecipe__header [data-state]';

async function samplePaintedSignal(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('[data-world]');
    if (!(canvas instanceof HTMLCanvasElement)) return { painted: 0, samples: 0 };
    const gl = canvas.getContext('webgl2');
    if (!gl || !canvas.width || !canvas.height) return { painted: 0, samples: 0 };
    const positions = [
      [0.50, 0.50], [0.35, 0.50], [0.65, 0.50], [0.50, 0.35], [0.50, 0.65],
      [0.30, 0.30], [0.70, 0.30], [0.30, 0.70], [0.70, 0.70],
    ];
    const pixel = new Uint8Array(4);
    let painted = 0;
    for (const [nx, ny] of positions) {
      const x = Math.max(0, Math.min(canvas.width - 1, Math.floor(canvas.width * nx)));
      const y = Math.max(0, Math.min(canvas.height - 1, Math.floor(canvas.height * ny)));
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
      if (pixel[0] + pixel[1] + pixel[2] > 12) painted += 1;
    }
    return { painted, samples: positions.length };
  });
}

async function readRailMetrics(page) {
  return page.evaluate(() => {
    const panel = document.querySelector('.kdx-mrecipe__panel');
    const button = document.querySelector('[data-memory-preset="ORBIT"]');
    const section = button?.closest('section');
    if (!(panel instanceof HTMLElement) || !(section instanceof HTMLElement) || !(button instanceof HTMLElement)) {
      return null;
    }
    const panelRect = panel.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const visibleLeft = Math.max(sectionRect.left, panelRect.left);
    const visibleRight = Math.min(sectionRect.right, panelRect.right);
    const visibleWidth = Math.max(0, visibleRight - visibleLeft);
    return {
      scrollLeft: panel.scrollLeft,
      scrollWidth: panel.scrollWidth,
      clientWidth: panel.clientWidth,
      sectionLeft: sectionRect.left,
      sectionRight: sectionRect.right,
      panelLeft: panelRect.left,
      panelRight: panelRect.right,
      sectionVisibleRatio: sectionRect.width > 0 ? visibleWidth / sectionRect.width : 0,
      sectionLeftClipped: sectionRect.left < panelRect.left - 1,
      buttonLeft: buttonRect.left,
      buttonRight: buttonRect.right,
      buttonVisible: buttonRect.left >= panelRect.left - 1 && buttonRect.right <= panelRect.right + 1,
    };
  });
}

try {
  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport: { width: profile.width, height: profile.height },
      isMobile: profile.isMobile || false,
      hasTouch: profile.hasTouch || false,
      reducedMotion: profile.reducedMotion,
      colorScheme: 'dark',
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(formatError(error)));

    try {
      const url = new URL('/kodex/lab/manifestation-recipe/', baseURL).toString();
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      assert((response?.status() || 0) >= 200 && (response?.status() || 0) < 400, `${profile.key}: invalid HTTP status ${response?.status()}`);
      await page.locator('[data-kdx-manifestation-recipe][data-ready="true"]').waitFor({ state: 'visible', timeout: 15_000 });

      if (profile.reducedMotion !== 'reduce') {
        await page.waitForFunction(() => Number(document.querySelector('[data-fps]')?.textContent || 0) > 0, null, { timeout: 8_000 });
      }

      const initial = await page.evaluate((stateSelector) => {
        const read = (selector) => document.querySelector(selector)?.textContent?.trim() || '';
        const lab = window.__KDX_MANIFESTATION_LAB__ || {};
        return {
          planId: read('[data-plan-id]'),
          state: read(stateSelector),
          sourceStatus: read('[data-source-pixel-status]'),
          mirrorRuntime: read('[data-mirror-runtime]'),
          memoryTopology: read('[data-memory-topology]'),
          renderTier: lab.plan?.runtime?.renderTier || '',
          effectNames: (lab.plan?.runtime?.effects || []).map((effect) => [effect.semantic_operator, effect.name, effect.on]),
          sourceBlocked: Boolean(lab.plan?.source_pixel_blocked),
          overflow: document.documentElement.scrollWidth - window.innerWidth,
        };
      }, stateReadoutSelector);

      assert(/^KDX-MAN-[A-Z0-9]+$/.test(initial.planId), `${profile.key}: invalid plan id ${initial.planId}`);
      assert(initial.state === 'DORMANT', `${profile.key}: initial state ${initial.state} != DORMANT`);
      assert(initial.sourceStatus === 'WITHHELD_BY_PROTECTED_SOURCE_CONTRACT', `${profile.key}: protected source status drifted: ${initial.sourceStatus}`);
      assert(initial.sourceBlocked === true, `${profile.key}: protected source bytes unexpectedly available`);
      assert(initial.mirrorRuntime === 'mirror.frag', `${profile.key}: radial symmetry is not visibly crosswalked to mirror.frag`);
      assert(initial.effectNames.some(([semantic, runtime]) => semantic === 'RADIAL_SYMMETRY' && runtime === 'mirror'), `${profile.key}: recipe does not reuse existing mirror runtime`);
      assert(initial.overflow <= 1, `${profile.key}: horizontal overflow ${initial.overflow}`);
      if (profile.reducedMotion === 'reduce') assert(initial.renderTier === 'STATIC', `${profile.key}: reduced motion tier ${initial.renderTier} != STATIC`);

      const openButton = page.locator('[data-state-button="OPEN"]');
      if (profile.hasTouch) {
        await page.evaluate(() => {
          const button = document.querySelector('[data-state-button="OPEN"]');
          if (!(button instanceof HTMLButtonElement)) throw new Error('OPEN control missing');
          button.click();
        });
      } else {
        await openButton.click();
      }
      await page.waitForFunction((stateSelector) => document.querySelector(stateSelector)?.textContent === 'OPEN', stateReadoutSelector, { timeout: 3_000 });
      if (profile.reducedMotion !== 'reduce') await page.waitForTimeout(500);
      const signal = await samplePaintedSignal(page);
      assert(signal.painted > 0, `${profile.key}: no painted WebGL signal in sampled framebuffer`);

      const beforeMemoryPlan = await page.locator('[data-plan-id]').textContent();
      const orbitButton = page.locator('[data-memory-preset="ORBIT"]');

      const railBefore = profile.hasTouch ? await readRailMetrics(page) : null;
      if (profile.hasTouch) {
        await page.evaluate(() => {
          const button = document.querySelector('[data-memory-preset="ORBIT"]');
          if (!(button instanceof HTMLButtonElement)) throw new Error('ORBIT control missing');
          button.click();
        });
      } else {
        await orbitButton.click();
      }

      await page.waitForFunction((before) => document.querySelector('[data-plan-id]')?.textContent !== before, beforeMemoryPlan, { timeout: 4_000 });
      await page.waitForTimeout(profile.hasTouch ? 250 : 0);

      const railAfter = profile.hasTouch ? await readRailMetrics(page) : null;
      if (profile.hasTouch) {
        assert(railBefore && railAfter, `${profile.key}: control rail metrics unavailable`);
        assert(
          Math.abs(railAfter.scrollLeft - railBefore.scrollLeft) <= 1,
          `${profile.key}: product ORBIT action moved control rail ${railBefore.scrollLeft} -> ${railAfter.scrollLeft}`,
        );
      }

      const memoryResult = await page.evaluate((stateSelector) => ({
        planId: document.querySelector('[data-plan-id]')?.textContent?.trim() || '',
        topology: document.querySelector('[data-memory-topology]')?.textContent?.trim() || '',
        revisitRatio: Number(document.querySelector('[data-revisit-ratio]')?.textContent || 0),
        segments: Number(document.querySelector('[data-segments-out]')?.textContent || 0),
        state: document.querySelector(stateSelector)?.textContent?.trim() || '',
        overflow: document.documentElement.scrollWidth - window.innerWidth,
      }), stateReadoutSelector);
      assert(memoryResult.planId !== beforeMemoryPlan, `${profile.key}: memory snapshot did not produce a distinct deterministic plan`);
      assert(memoryResult.topology === 'ORBIT_LOOP', `${profile.key}: expected ORBIT_LOOP memory, got ${memoryResult.topology}`);
      assert(memoryResult.revisitRatio > 0, `${profile.key}: revisit ratio did not affect descriptive memory input`);
      assert(memoryResult.segments >= 6 && memoryResult.segments <= 24, `${profile.key}: radial segment bound violated (${memoryResult.segments})`);
      assert(memoryResult.state === 'DORMANT', `${profile.key}: recipe recompile should return to DORMANT, got ${memoryResult.state}`);
      assert(memoryResult.overflow <= 1, `${profile.key}: overflow after memory recipe ${memoryResult.overflow}`);
      assert(pageErrors.length === 0, `${profile.key}: page errors ${pageErrors.join(' | ')}`);

      const file = `manifestation-recipe-${profile.key}.png`;
      await page.screenshot({ path: path.join(outputDir, file), fullPage: true, animations: 'disabled' });
      report.cases.push({
        profile: profile.key,
        pass: true,
        screenshot: file,
        initial,
        paintedSignal: signal,
        memoryResult,
        controlRailDiagnostic: profile.hasTouch ? {
          action: 'DOM_CLICK_WITHOUT_PLAYWRIGHT_AUTOSCROLL',
          before: railBefore,
          after: railAfter,
          productMovedRail: Math.abs((railAfter?.scrollLeft || 0) - (railBefore?.scrollLeft || 0)) > 1,
        } : null,
        pageErrors,
      });
    } catch (error) {
      const message = `${profile.key}: ${formatError(error)}`;
      report.errors.push(message);
      report.cases.push({ profile: profile.key, pass: false, pageErrors, error: formatError(error) });
      console.error(message);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

await fs.writeFile(path.join(outputDir, 'manifestation-recipe-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.errors.length) process.exitCode = 1;
