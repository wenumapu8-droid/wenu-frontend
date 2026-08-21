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
  { key: 'reduced', width: 390, height: 844, reducedMotion: 'reduce', isMobile: true, hasTouch: true },
];

const report = { baseURL, generatedAt: new Date().toISOString(), cases: [], errors: [] };
const browser = await chromium.launch({ headless: true });
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const formatError = (error) => String(error?.stack || error?.message || error);

async function viewportState(page) {
  return page.evaluate(() => ({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    bodyScrollWidth: document.body.scrollWidth,
    bodyScrollHeight: document.body.scrollHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
  }));
}

async function assertBounded(page, label) {
  const v = await viewportState(page);
  assert(v.scrollWidth <= v.innerWidth + 1, `${label}: horizontal page overflow ${v.scrollWidth - v.innerWidth}px`);
  assert(v.bodyScrollWidth <= v.innerWidth + 1, `${label}: body horizontal overflow ${v.bodyScrollWidth - v.innerWidth}px`);
  assert(v.scrollHeight <= v.innerHeight + 1, `${label}: vertical page overflow ${v.scrollHeight - v.innerHeight}px`);
  assert(v.bodyScrollHeight <= v.innerHeight + 1, `${label}: body vertical overflow ${v.bodyScrollHeight - v.innerHeight}px`);
  assert(Math.abs(v.scrollX) <= 1 && Math.abs(v.scrollY) <= 1, `${label}: page scrolled (${v.scrollX}, ${v.scrollY})`);
  return v;
}

async function testCommandShell(page, profile) {
  const url = new URL('/kodex/lab/command-shell/', baseURL).toString();
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  assert((response?.status() || 0) >= 200 && (response?.status() || 0) < 400, `${profile.key}/command-shell: HTTP ${response?.status()}`);
  await page.locator('[data-kdx-shell]').waitFor({ state: 'visible', timeout: 10_000 });
  const before = await assertBounded(page, `${profile.key}/command-shell initial`);

  const initial = await page.evaluate(() => ({
    scene: document.querySelector('[data-kdx-shell]')?.getAttribute('data-scene'),
    operator: document.querySelector('[data-kdx-shell]')?.getAttribute('data-operator'),
    theme: document.querySelector('[data-kdx-shell]')?.getAttribute('data-theme'),
    motion: document.querySelector('[data-panel-motion]')?.textContent?.trim(),
  }));
  assert(initial.scene === 'THRESHOLD', `${profile.key}/command-shell: initial scene ${initial.scene}`);
  assert(initial.operator === 'APERTURE', `${profile.key}/command-shell: initial operator ${initial.operator}`);

  if (profile.hasTouch) {
    await page.evaluate(() => {
      const button = document.querySelector('[data-next-operator]');
      if (!(button instanceof HTMLButtonElement)) throw new Error('next-operator control missing');
      button.click();
    });
  } else {
    await page.keyboard.press('ArrowDown');
  }
  await page.waitForFunction(() => document.querySelector('[data-kdx-shell]')?.getAttribute('data-scene') === 'PROLOGUE');
  const afterScene = await page.evaluate(() => ({
    scene: document.querySelector('[data-kdx-shell]')?.getAttribute('data-scene'),
    operator: document.querySelector('[data-kdx-shell]')?.getAttribute('data-operator'),
    href: document.querySelector('[data-live-link]')?.getAttribute('href'),
  }));
  assert(afterScene.operator === 'SCAN', `${profile.key}/command-shell: PROLOGUE operator ${afterScene.operator}`);
  assert(Boolean(afterScene.href), `${profile.key}/command-shell: live route missing`);

  if (!profile.hasTouch) {
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+K' : 'Control+K');
  } else {
    await page.evaluate(() => {
      const button = document.querySelector('[data-command-open]');
      if (!(button instanceof HTMLButtonElement)) throw new Error('command control missing');
      button.click();
    });
  }
  await page.locator('[data-command]:not([hidden])').waitFor({ state: 'visible', timeout: 3_000 });
  const commandState = await page.evaluate(() => ({
    ariaHidden: document.querySelector('[data-command]')?.getAttribute('aria-hidden'),
    expanded: document.querySelector('[data-command-open]')?.getAttribute('aria-expanded'),
    activeTag: document.activeElement?.tagName,
  }));
  assert(commandState.ariaHidden === 'false', `${profile.key}/command-shell: command palette aria-hidden drift`);
  assert(commandState.expanded === 'true', `${profile.key}/command-shell: command trigger aria-expanded drift`);

  if (!profile.hasTouch) await page.keyboard.press('Escape');
  else await page.evaluate(() => document.querySelector('[data-command-close]')?.click());
  await page.waitForFunction(() => document.querySelector('[data-command]')?.getAttribute('aria-hidden') === 'true');
  const after = await assertBounded(page, `${profile.key}/command-shell after interaction`);

  return { initial, afterScene, commandState, viewportBefore: before, viewportAfter: after };
}

async function testSemanticWheel(page, profile) {
  const url = new URL('/kodex/lab/semantic-wheel/', baseURL).toString();
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  assert((response?.status() || 0) >= 200 && (response?.status() || 0) < 400, `${profile.key}/semantic-wheel: HTTP ${response?.status()}`);
  await page.locator('[data-kdx-wheel]').waitFor({ state: 'visible', timeout: 10_000 });
  const before = await assertBounded(page, `${profile.key}/semantic-wheel initial`);

  const initial = await page.evaluate(() => ({
    state: document.querySelector('[data-kdx-wheel]')?.getAttribute('data-state'),
    domain: document.querySelector('[data-kdx-wheel]')?.getAttribute('data-domain'),
    process: document.querySelector('[data-kdx-wheel]')?.getAttribute('data-process'),
    scene: document.querySelector('[data-kdx-wheel]')?.getAttribute('data-scene'),
    stageTabIndex: document.querySelector('[data-wheel-stage]')?.getAttribute('tabindex'),
    reference: window.__KDX_RELATION_WHEEL__?.reference,
  }));
  assert(initial.state === 'DORMANT', `${profile.key}/semantic-wheel: initial state ${initial.state}`);
  assert(initial.reference === 'REF-UX-003', `${profile.key}/semantic-wheel: reference identity drift`);
  assert(initial.stageTabIndex === '0', `${profile.key}/semantic-wheel: keyboard stage not focusable`);

  if (profile.hasTouch) {
    const stage = page.locator('[data-wheel-stage]');
    const box = await stage.boundingBox();
    assert(box, `${profile.key}/semantic-wheel: stage bounding box missing`);
    const y = box.y + box.height * 0.5;
    await page.touchscreen.tap(box.x + box.width * 0.75, y);
    await page.evaluate(() => {
      const item = document.querySelector('[data-ring="process"] .kdx-ring__item:nth-of-type(3)');
      if (!(item instanceof HTMLButtonElement)) throw new Error('process ring button missing');
      item.click();
    });
  } else {
    await page.locator('[data-wheel-stage]').focus();
    await page.keyboard.press('ArrowRight');
  }

  await page.waitForTimeout(profile.reducedMotion === 'reduce' ? 10 : 120);
  const interacted = await page.evaluate(() => ({
    state: document.querySelector('[data-kdx-wheel]')?.getAttribute('data-state'),
    masterAngle: window.__KDX_RELATION_WHEEL__?.getState?.().masterAngle,
    fractured: window.__KDX_RELATION_WHEEL__?.getState?.().fractured,
    domain: document.querySelector('[data-kdx-wheel]')?.getAttribute('data-domain'),
    process: document.querySelector('[data-kdx-wheel]')?.getAttribute('data-process'),
    scene: document.querySelector('[data-kdx-wheel]')?.getAttribute('data-scene'),
    href: document.querySelector('[data-open-scene]')?.getAttribute('href'),
  }));
  assert(Number.isFinite(interacted.masterAngle), `${profile.key}/semantic-wheel: master angle unavailable`);
  assert(Boolean(interacted.href), `${profile.key}/semantic-wheel: current-scene href missing`);
  if (profile.reducedMotion === 'reduce') {
    assert(interacted.fractured === false, `${profile.key}/semantic-wheel: reduced motion entered ANOMALY/fracture`);
  }

  const after = await assertBounded(page, `${profile.key}/semantic-wheel after interaction`);
  return { initial, interacted, viewportBefore: before, viewportAfter: after };
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
      const commandShell = await testCommandShell(page, profile);
      assert(pageErrors.length === 0, `${profile.key}/command-shell: page errors ${pageErrors.join(' | ')}`);
      const semanticWheel = await testSemanticWheel(page, profile);
      assert(pageErrors.length === 0, `${profile.key}/semantic-wheel: page errors ${pageErrors.join(' | ')}`);
      const screenshot = `reference-instruments-${profile.key}.png`;
      await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: true, animations: 'disabled' });
      report.cases.push({ profile: profile.key, pass: true, commandShell, semanticWheel, screenshot, pageErrors });
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

await fs.writeFile(path.join(outputDir, 'reference-instruments-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.errors.length) process.exitCode = 1;
