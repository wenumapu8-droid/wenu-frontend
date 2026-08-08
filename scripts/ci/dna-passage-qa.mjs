import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const base = process.env.KDX_DNA_PASSAGE_BASE_URL || 'http://127.0.0.1:4173';
const url = `${base}/kodex/lab/dna-passage/`;
const outDir = path.resolve('artifacts/dna-passage-qa');
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = { url, cases: [], failures: [] };

async function runCase(name, viewport, reducedMotion = 'no-preference') {
  const context = await browser.newContext({ viewport, reducedMotion });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto(url, { waitUntil: 'networkidle' });
  const root = page.locator('[data-kdx-helix-passage]');
  await root.waitFor();
  await page.waitForTimeout(350);

  const initial = await root.evaluate(el => ({
    ready: el.getAttribute('data-ready'),
    mode: el.getAttribute('data-mode'),
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    rungCount: el.querySelectorAll('[data-helix-rung]').length,
    bioLabel: el.textContent?.includes('BIOLOGICAL REFERENCE') ?? false,
    symbolicLabel: el.textContent?.includes('KODEX SYMBOLIC') ?? false,
  }));

  await root.focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(80);

  const interaction = await root.evaluate(el => ({
    lockedRung: el.getAttribute('data-locked-rung'),
    selected: el.querySelector('[data-helix-selected]')?.textContent ?? '',
    memory: sessionStorage.getItem('kdx:journey:v1') ?? '',
  }));

  let memoryWrite = false;
  try {
    const parsed = JSON.parse(interaction.memory || '{}');
    memoryWrite = Array.isArray(parsed.committedActions) && parsed.committedActions.includes('kodex-dna-passage-traversed');
  } catch {}

  const result = {
    name,
    viewport,
    reducedMotion,
    ...initial,
    ...interaction,
    memoryWrite,
    consoleErrors,
    pageErrors,
  };
  report.cases.push(result);

  const failures = [];
  if (initial.rungCount !== 9) failures.push('expected 9 semantic rungs');
  if (initial.overflow) failures.push('horizontal overflow detected');
  if (!initial.bioLabel || !initial.symbolicLabel) failures.push('explicit dual-reading labels missing');
  if (!interaction.lockedRung) failures.push('keyboard commit did not lock a rung');
  if (!memoryWrite) failures.push('JourneyState memory write missing');
  if (consoleErrors.length) failures.push(`console errors: ${consoleErrors.join(' | ')}`);
  if (pageErrors.length) failures.push(`page errors: ${pageErrors.join(' | ')}`);
  if (initial.mode === 'webgl' && initial.ready !== 'true') failures.push('WebGL mode did not reach ready');
  if (!['webgl', 'fallback'].includes(initial.mode)) failures.push(`unexpected renderer mode: ${initial.mode}`);

  if (failures.length) report.failures.push({ name, failures });
  await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: true });
  await context.close();
}

await runCase('desktop-1920x1080', { width: 1920, height: 1080 });
await runCase('mobile-390x844', { width: 390, height: 844 });
await runCase('mobile-412x915', { width: 412, height: 915 });
await runCase('reduced-390x844', { width: 390, height: 844 }, 'reduce');

await browser.close();
await fs.writeFile(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));

if (report.failures.length) {
  console.error(JSON.stringify(report.failures, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(report, null, 2));
