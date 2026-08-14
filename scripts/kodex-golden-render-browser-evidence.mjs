import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { KDX_GOLDEN_PLATE_CASES } from '../src/lib/kodex/grammar/golden-plate-benchmark.v0.1.js';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence/golden-plates');
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = { generatedAt: new Date().toISOString(), baseURL, cases: [], errors: [] };
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const cssTimeToMs = (token = '') => {
  const value = String(token).trim();
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric)) return Number.POSITIVE_INFINITY;
  if (value.endsWith('ms')) return numeric;
  if (value.endsWith('s')) return numeric * 1000;
  return numeric;
};
const effectivelyZero = (value = '') => String(value).split(',').filter(Boolean).every((item) => cssTimeToMs(item) <= 0.1);

async function openCase(page, entry) {
  const url = new URL(`/kodex/lab/golden-plates/${entry.case_id.toLowerCase()}/`, baseURL).toString();
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  assert(response?.ok(), `${entry.case_id}: HTTP ${response?.status()}`);
  await page.locator('[data-kdx-plate-renderer]').waitFor({ state: 'visible', timeout: 10_000 });
  return url;
}

async function metrics(page) {
  return page.evaluate(() => {
    const plate = document.querySelector('[data-kdx-plate-renderer]');
    const rect = plate?.getBoundingClientRect();
    const artwork = plate?.querySelector('[data-artwork-shell]');
    const artRect = artwork?.getBoundingClientRect();
    return {
      viewport: [innerWidth, innerHeight],
      plate: rect ? [rect.width, rect.height, rect.top, rect.bottom] : null,
      scroll: [document.documentElement.scrollWidth, document.documentElement.scrollHeight, document.body.scrollHeight],
      rendererCount: document.querySelectorAll('[data-kdx-plate-renderer]').length,
      plateId: plate?.getAttribute('data-plate-id'),
      plateType: plate?.getAttribute('data-plate-type'),
      elementId: plate?.getAttribute('data-element-id'),
      artworkKind: plate?.getAttribute('data-artwork-kind'),
      protectedImageCount: plate?.querySelectorAll('[data-artwork-shell] img').length ?? 0,
      artRect: artRect ? [artRect.left, artRect.top, artRect.right, artRect.bottom] : null,
      activeIsPlate: document.activeElement === plate,
      routeCount: plate?.querySelectorAll('[data-route-target]').length ?? 0,
      activateCount: plate?.querySelectorAll('[data-activate]').length ?? 0,
      nodeCount: document.querySelectorAll('*').length,
    };
  });
}

function assertShell(m, label) {
  assert(m.rendererCount === 1, `${label}: expected exactly one active renderer, got ${m.rendererCount}`);
  assert(m.plate && Math.abs(m.plate[1] - m.viewport[1]) <= 2, `${label}: renderer is not 100dvh (${m.plate?.[1]} vs ${m.viewport[1]})`);
  assert(m.scroll[0] <= m.viewport[0] + 1, `${label}: horizontal overflow ${m.scroll[0]} > ${m.viewport[0]}`);
  assert(m.scroll[1] <= m.viewport[1] + 2 && m.scroll[2] <= m.viewport[1] + 2, `${label}: page-level vertical scroll detected`);
  assert(m.activeIsPlate, `${label}: renderer did not receive deliberate focus`);
  assert(m.elementId && m.elementId !== 'NONE', `${label}: registered composition element did not resolve`);
  assert(m.nodeCount < 500, `${label}: active DOM is unexpectedly large (${m.nodeCount})`);
}

async function desktopAllCases() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await context.newPage();
  try {
    for (const entry of KDX_GOLDEN_PLATE_CASES) {
      await openCase(page, entry);
      await page.waitForFunction(() => document.activeElement?.matches?.('[data-kdx-plate-renderer]'));
      const m = await metrics(page);
      assertShell(m, `${entry.case_id}/desktop`);
      assert(m.plateType === entry.plate_type, `${entry.case_id}: rendered wrong plate type ${m.plateType}`);
      if (entry.plate_type === 'JUNCTION_PLATE') assert(m.routeCount >= 2 && m.routeCount <= 5, `${entry.case_id}: Junction route count ${m.routeCount} outside 2–5`);
      if (entry.node.artwork_contract) {
        assert(m.artworkKind === 'ARTWORK', `${entry.case_id}: protected artwork branch not rendered`);
        assert(m.protectedImageCount === 0, `${entry.case_id}: protected source image bytes unexpectedly entered renderer`);
        assert(m.artRect && m.artRect[0] >= -1 && m.artRect[1] >= -1 && m.artRect[2] <= m.viewport[0] + 1 && m.artRect[3] <= m.viewport[1] + 1, `${entry.case_id}: protected artwork shell escaped viewport`);
      }
      if (entry.plate_type === 'ACTIVATOR_PLATE' && !entry.node.artwork_contract) {
        assert(m.artworkKind === 'FIELD', `${entry.case_id}: living-field activator misclassified`);
        assert(m.protectedImageCount === 0, `${entry.case_id}: living field fabricated artwork bytes`);
      }
      if (m.activateCount) {
        const button = page.locator('[data-activate]').first();
        await button.focus();
        assert(await button.evaluate((el) => el === document.activeElement), `${entry.case_id}: activation control cannot receive keyboard focus`);
        await page.keyboard.press('Enter');
        assert(await page.locator('[data-kdx-plate-renderer]').getAttribute('data-activated') === 'true', `${entry.case_id}: explicit activation did not update environment state`);
      }
      const screenshot = `${entry.case_id.toLowerCase()}-desktop.png`;
      await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false, animations: 'disabled' });
      report.cases.push({ case_id: entry.case_id, viewport: 'desktop', pass: true, metrics: m, screenshot });
    }
  } finally { await context.close(); }
}

async function mobileDomainRepresentatives() {
  const representatives = ['GP-SCI-01', 'GP-TECH-03', 'GP-ART-02', 'GP-CON-03'];
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, colorScheme: 'dark' });
  const page = await context.newPage();
  try {
    for (const id of representatives) {
      const entry = KDX_GOLDEN_PLATE_CASES.find((item) => item.case_id === id);
      await openCase(page, entry);
      await page.waitForFunction(() => document.activeElement?.matches?.('[data-kdx-plate-renderer]'));
      const m = await metrics(page);
      assertShell(m, `${entry.case_id}/mobile`);
      const screenshot = `${entry.case_id.toLowerCase()}-mobile.png`;
      await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false, animations: 'disabled' });
      report.cases.push({ case_id: entry.case_id, viewport: 'mobile', pass: true, metrics: m, screenshot });
    }
  } finally { await context.close(); }
}

async function reducedMotion() {
  const entry = KDX_GOLDEN_PLATE_CASES.find((item) => item.plate_type === 'ACTIVATOR_PLATE');
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce', colorScheme: 'dark' });
  const page = await context.newPage();
  try {
    await openCase(page, entry);
    const motion = await page.evaluate(() => {
      const plate = document.querySelector('[data-kdx-plate-renderer]');
      const targets = [plate, plate?.querySelector('[data-activate]'), plate?.querySelector('.kdx-artwork-shell__aperture')].filter(Boolean);
      return { media: matchMedia('(prefers-reduced-motion: reduce)').matches, styles: targets.map((el) => ({ animationDuration: getComputedStyle(el).animationDuration, transitionDuration: getComputedStyle(el).transitionDuration })) };
    });
    assert(motion.media, 'reduced-motion: preference not active');
    assert(motion.styles.every((style) => effectivelyZero(style.animationDuration) && effectivelyZero(style.transitionDuration)), `reduced-motion: perceptible motion remains ${JSON.stringify(motion.styles)}`);
    report.cases.push({ case_id: entry.case_id, viewport: 'reduced-motion', pass: true, motion });
  } finally { await context.close(); }
}

try {
  await desktopAllCases();
  await mobileDomainRepresentatives();
  await reducedMotion();
} catch (error) {
  report.errors.push(String(error?.stack || error));
  console.error(error);
} finally {
  await browser.close();
  await fs.writeFile(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
}

if (report.errors.length) process.exitCode = 1;
else console.log(`Golden Plate renderer acceptance PASS: ${report.cases.length} browser cases.`);
