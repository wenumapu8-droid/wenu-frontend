import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence/golden-plates');
await fs.mkdir(outputDir, { recursive: true });

const CASES = [
  ['GP-SCI-01', 'science'], ['GP-SCI-02', 'science'], ['GP-SCI-03', 'science'],
  ['GP-TECH-01', 'technology'], ['GP-TECH-02', 'technology'], ['GP-TECH-03', 'technology'],
  ['GP-ART-01', 'art'], ['GP-ART-02', 'art'], ['GP-ART-03', 'art'],
  ['GP-CON-01', 'consciousness'], ['GP-CON-02', 'consciousness'], ['GP-CON-03', 'consciousness'],
];
const SCREENSHOT_CASES = new Set(['GP-SCI-01', 'GP-TECH-02', 'GP-ART-03', 'GP-CON-03']);
const REDUCED_MOTION_CASES = new Set(['GP-SCI-01', 'GP-TECH-02', 'GP-ART-03']);
const REDUCED_MOTION_EPSILON_MS = 0.1;

const report = {
  generated_at: new Date().toISOString(),
  base_url: baseURL,
  benchmark: '12 Golden Plate rendered browser evidence',
  truth_boundary: {
    contract_status: 'PREVIOUSLY_GREEN',
    renderer_status: 'UNDER_TEST',
    human_curator_acceptance: 'NOT_RUN',
    protected_artwork_rule: 'WITHHELD source bytes remain PARTIAL for artwork visual/no-crop evidence.',
  },
  cases: [],
  performance: null,
  errors: [],
};

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const slug = (caseId) => caseId.toLowerCase();
const cssTimeToMs = (token = '') => {
  const value = String(token).trim();
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric)) return Number.POSITIVE_INFINITY;
  if (value.endsWith('ms')) return numeric;
  if (value.endsWith('s')) return numeric * 1000;
  return numeric;
};
const cssTimeListIsEffectivelyZero = (value = '') => String(value).split(',').map((item) => item.trim()).filter(Boolean).every((item) => cssTimeToMs(item) <= REDUCED_MOTION_EPSILON_MS);

async function openCase(page, caseId) {
  const response = await page.goto(new URL(`/kodex/lab/golden-plates/${slug(caseId)}/`, baseURL).toString(), { waitUntil: 'domcontentloaded', timeout: 30_000 });
  assert(response?.ok(), `${caseId}: route did not return OK (${response?.status()})`);
  await page.locator('[data-kdx-golden-plate]').waitFor({ state: 'visible', timeout: 10_000 });
  await page.locator('[data-active-plate]').waitFor({ state: 'visible', timeout: 10_000 });
  // The renderer restores focus in requestAnimationFrame. Observe that post-frame
  // state instead of sampling the same DOMContentLoaded tick and turning a
  // scheduler race into a false accessibility failure.
  await page.waitForFunction(
    () => document.activeElement === document.querySelector('[data-active-plate]'),
    undefined,
    { timeout: 2_000 },
  );
}

async function metrics(page) {
  return page.evaluate(() => {
    const root = document.querySelector('[data-kdx-golden-plate]');
    const renderer = document.querySelector('[data-kdx-golden-renderer]');
    const plate = document.querySelector('[data-active-plate]');
    const rect = root?.getBoundingClientRect();
    const nav = performance.getEntriesByType('navigation')[0];
    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      rootWidth: rect?.width ?? 0,
      rootHeight: rect?.height ?? 0,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      bodyScrollHeight: document.body.scrollHeight,
      nodeCount: document.querySelectorAll('*').length,
      activePlateFocused: document.activeElement === plate,
      plateId: renderer?.getAttribute('data-plate-id') || null,
      plateType: renderer?.getAttribute('data-plate-type') || null,
      sceneState: renderer?.getAttribute('data-scene-state') || null,
      semanticNode: renderer?.getAttribute('data-semantic-node') || null,
      elementId: renderer?.getAttribute('data-primary-element-id') || null,
      artworkSource: renderer?.getAttribute('data-artwork-source') || null,
      payloadType: document.querySelector('[data-primary-payload]')?.getAttribute('data-payload-type') || null,
      routeCount: Number(document.querySelector('[data-route-count]')?.getAttribute('data-route-count') || 0),
      activationControls: document.querySelectorAll('[data-activation-action]').length,
      imgCount: document.querySelectorAll('[data-protected-artwork] img').length,
      domContentLoadedMs: nav ? Number(nav.domContentLoadedEventEnd.toFixed(2)) : null,
    };
  });
}

function assertBounds(m, label) {
  assert(Math.abs(m.rootHeight - m.innerHeight) <= 2, `${label}: root is not 100dvh (${m.rootHeight} vs ${m.innerHeight})`);
  assert(m.scrollWidth <= m.innerWidth + 1, `${label}: horizontal page overflow (${m.scrollWidth} > ${m.innerWidth})`);
  assert(m.scrollHeight <= m.innerHeight + 2, `${label}: vertical page overflow (${m.scrollHeight} > ${m.innerHeight})`);
  assert(m.bodyScrollHeight <= m.innerHeight + 2, `${label}: body page overflow (${m.bodyScrollHeight} > ${m.innerHeight})`);
  assert(m.nodeCount < 900, `${label}: renderer DOM is not bounded (${m.nodeCount})`);
  assert(m.activePlateFocused, `${label}: focus was not restored to active plate`);
  assert(Boolean(m.plateId && m.semanticNode && m.elementId), `${label}: missing compiled registered identifiers`);
  assert(/^KDX[-_]/.test(m.elementId) || /^MOTION_/.test(m.elementId), `${label}: primary element does not look registry-addressable (${m.elementId})`);
  if (m.plateType === 'JUNCTION_PLATE') assert(m.routeCount >= 2 && m.routeCount <= 5, `${label}: junction route bound violated (${m.routeCount})`);
  if (m.plateType === 'ACTIVATOR_PLATE') assert(m.activationControls === 1, `${label}: activator must expose one explicit activation control`);
  if (m.payloadType === 'ARTWORK') {
    assert(m.artworkSource === 'WITHHELD', `${label}: protected artwork unexpectedly exposed source bytes`);
    assert(m.imgCount === 0, `${label}: protected artwork visual bytes were rendered despite WITHHELD status`);
  }
}

async function exerciseKeyboard(page, m, label) {
  if (m.plateType === 'JUNCTION_PLATE') {
    const button = page.locator('[data-route-target]').first();
    await button.focus();
    assert(await button.evaluate((el) => el === document.activeElement), `${label}: first route choice cannot receive keyboard focus`);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelector('[data-route-output]')?.textContent?.includes('SELECTED'));
  }
  if (m.plateType === 'ACTIVATOR_PLATE') {
    const button = page.locator('[data-activation-action]');
    await button.focus();
    assert(await button.evaluate((el) => el === document.activeElement), `${label}: activation control cannot receive keyboard focus`);
    await page.keyboard.press('Enter');
    assert(await button.getAttribute('aria-pressed') === 'true', `${label}: explicit keyboard activation did not commit local environment state`);
  }
}

async function reducedMotionCheck(caseId) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce', colorScheme: 'dark' });
  const page = await context.newPage();
  try {
    await openCase(page, caseId);
    const result = await page.evaluate(() => {
      const targets = [document.querySelector('[data-kdx-golden-renderer]'), document.querySelector('[data-active-plate]'), document.querySelector('button')].filter(Boolean);
      return {
        media: matchMedia('(prefers-reduced-motion: reduce)').matches,
        styles: targets.map((el) => {
          const style = getComputedStyle(el);
          return { transitionDuration: style.transitionDuration, animationDuration: style.animationDuration, scrollBehavior: style.scrollBehavior };
        }),
      };
    });
    assert(result.media, `${caseId}: reduced-motion preference not visible to page`);
    assert(result.styles.every((style) => cssTimeListIsEffectivelyZero(style.transitionDuration) && cssTimeListIsEffectivelyZero(style.animationDuration)), `${caseId}: perceptible motion remains under prefers-reduced-motion`);
    return { pass: true, epsilon_ms: REDUCED_MOTION_EPSILON_MS };
  } finally {
    await context.close();
  }
}

const browser = await chromium.launch({ headless: true });
const perfSamples = [];
try {
  for (const [caseId, domain] of CASES) {
    const caseResult = { case_id: caseId, domain, desktop: null, mobile: null, reduced_motion: 'NOT_SAMPLED', artwork_visual_status: 'NOT_APPLICABLE', blockers: [] };
    try {
      const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
      const desktopPage = await desktopContext.newPage();
      await openCase(desktopPage, caseId);
      const desktop = await metrics(desktopPage);
      assertBounds(desktop, `${caseId}/desktop`);
      await exerciseKeyboard(desktopPage, desktop, `${caseId}/desktop`);
      if (SCREENSHOT_CASES.has(caseId)) {
        const screenshot = `${slug(caseId)}-desktop.png`;
        await desktopPage.screenshot({ path: path.join(outputDir, screenshot), fullPage: false, animations: 'disabled' });
        desktop.screenshot = screenshot;
      }
      caseResult.desktop = desktop;
      if (Number.isFinite(desktop.domContentLoadedMs)) perfSamples.push(desktop.domContentLoadedMs);
      await desktopContext.close();

      const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, colorScheme: 'dark' });
      const mobilePage = await mobileContext.newPage();
      await openCase(mobilePage, caseId);
      const mobile = await metrics(mobilePage);
      assertBounds(mobile, `${caseId}/mobile`);
      caseResult.mobile = mobile;
      await mobileContext.close();

      if (desktop.payloadType === 'ARTWORK') {
        caseResult.artwork_visual_status = 'PARTIAL';
        caseResult.blockers.push('ARTWORK_SOURCE_WITHHELD_NO_VISUAL_NO_CROP_EVIDENCE');
      }
      if (REDUCED_MOTION_CASES.has(caseId)) caseResult.reduced_motion = await reducedMotionCheck(caseId);
    } catch (error) {
      const message = `${caseId}: ${String(error?.stack || error?.message || error)}`;
      caseResult.error = message;
      report.errors.push(message);
    }
    report.cases.push(caseResult);
  }
} finally {
  await browser.close();
}

const sorted = [...perfSamples].sort((a, b) => a - b);
const p95 = sorted.length ? sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)] : null;
report.performance = {
  metric: 'navigation.domContentLoadedEventEnd',
  samples: sorted.length,
  mean_ms: sorted.length ? Number((sorted.reduce((sum, value) => sum + value, 0) / sorted.length).toFixed(2)) : null,
  p95_ms: p95 == null ? null : Number(p95.toFixed(2)),
  threshold_ms: 2500,
  threshold_status: 'HYPOTHESIS',
  pass: p95 != null && p95 < 2500,
};
if (!report.performance.pass) report.errors.push(`performance: p95 ${report.performance.p95_ms}ms exceeds HYPOTHESIS threshold ${report.performance.threshold_ms}ms`);

report.truth_boundary.renderer_status = report.errors.length ? 'FAIL' : 'BROWSER_EVIDENCE_PASS';
report.truth_boundary.human_curator_acceptance = 'NOT_RUN';

await fs.writeFile(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.errors.length) process.exitCode = 1;
