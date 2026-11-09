import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence/deep-navigation');
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

const REDUCED_MOTION_EPSILON_MS = 0.1;
const cssTimeToMs = (token = '') => {
  const value = String(token).trim();
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric)) return Number.POSITIVE_INFINITY;
  if (value.endsWith('ms')) return numeric;
  if (value.endsWith('s')) return numeric * 1000;
  return numeric;
};
const cssTimeListIsEffectivelyZero = (value = '') => String(value)
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean)
  .every((item) => cssTimeToMs(item) <= REDUCED_MOTION_EPSILON_MS);

async function navigate(page, search = '') {
  const url = new URL(`/kodex/lab/deep-navigation/${search}`, baseURL).toString();
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('load', { timeout: 10_000 }).catch(() => {});
  await page.locator('[data-kdx-deep-lab]').waitFor({ state: 'visible', timeout: 10_000 });
  await page.locator('[data-doors] .kdx-door').first().waitFor({ state: 'attached', timeout: 10_000 });
  return response;
}

async function shellMetrics(page) {
  return page.evaluate(() => {
    const root = document.querySelector('[data-kdx-deep-lab]');
    const rect = root?.getBoundingClientRect();
    const params = [...new URLSearchParams(location.search).keys()];
    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      rootHeight: rect?.height ?? 0,
      rootWidth: rect?.width ?? 0,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      bodyScrollHeight: document.body.scrollHeight,
      nodeCount: document.querySelectorAll('*').length,
      urlKeys: [...new Set(params)].sort(),
      activeElement: document.activeElement?.matches?.('[data-plate]')
        ? 'ACTIVE_PLATE'
        : document.activeElement?.getAttribute?.('data-node-id') || document.activeElement?.tagName || null,
    };
  });
}

async function gestureSnapshot(page) {
  return page.evaluate(() => {
    const plate = document.querySelector('[data-plate]');
    const doors = document.querySelector('[data-doors]');
    const firstDoor = doors?.querySelector('.kdx-door');
    return {
      phase: plate?.getAttribute('data-phase') || null,
      ariaHidden: doors?.getAttribute('aria-hidden') || null,
      firstDoorTabIndex: firstDoor?.tabIndex ?? null,
      historyLength: history.length,
      node: new URL(location.href).searchParams.get('node'),
      knownCount: Number(document.querySelector('[data-known-count]')?.textContent || 0),
    };
  });
}

async function assertActivePlate(page, label) {
  await page.waitForFunction(() => document.activeElement?.matches?.('[data-plate]'));
  assert(await page.locator('[data-plate]').evaluate((el) => el === document.activeElement), `${label}: focus was not restored to the active plate`);
}

function assertBoundedShell(metrics, label) {
  assert(Math.abs(metrics.rootHeight - metrics.innerHeight) <= 2, `${label}: root is not 100dvh (${metrics.rootHeight} vs ${metrics.innerHeight})`);
  assert(metrics.scrollWidth <= metrics.innerWidth + 1, `${label}: horizontal overflow ${metrics.scrollWidth} > ${metrics.innerWidth}`);
  assert(metrics.scrollHeight <= metrics.innerHeight + 2, `${label}: page-level vertical scroll ${metrics.scrollHeight} > ${metrics.innerHeight}`);
  assert(metrics.bodyScrollHeight <= metrics.innerHeight + 2, `${label}: body vertical scroll ${metrics.bodyScrollHeight} > ${metrics.innerHeight}`);
  assert(metrics.nodeCount < 800, `${label}: DOM neighborhood is not bounded (${metrics.nodeCount} nodes)`);
  assert(metrics.urlKeys.every((key) => key === 'lens' || key === 'node'), `${label}: public URL leaked non-addressable state (${metrics.urlKeys.join(', ')})`);
}

function assertDormant(snapshot, label) {
  assert(snapshot.phase === 'dormant', `${label}: expected DORMANT, received ${snapshot.phase}`);
  assert(snapshot.ariaHidden === 'true', `${label}: routes were exposed to accessibility tree before OPEN`);
  assert(snapshot.firstDoorTabIndex === -1, `${label}: route was focusable before OPEN`);
}

function assertOpen(snapshot, label) {
  assert(snapshot.phase === 'open', `${label}: expected OPEN, received ${snapshot.phase}`);
  assert(snapshot.ariaHidden === 'false', `${label}: routes remained aria-hidden after OPEN`);
  assert(snapshot.firstDoorTabIndex === 0, `${label}: route did not become keyboard-focusable after OPEN`);
}

async function desktopHistoryKeyboard() {
  const name = 'deep-navigation-desktop-keyboard-history';
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await context.newPage();
  try {
    await navigate(page, '?node=SCI-BIOLOGY&lens=NAKED_EYE');
    await assertActivePlate(page, `${name}: initial deep-link`);
    const initial = await shellMetrics(page);
    assertBoundedShell(initial, name);

    const beforeReveal = await gestureSnapshot(page);
    assertDormant(beforeReveal, name);
    await page.keyboard.press('ArrowDown');
    await page.waitForFunction(() => document.querySelector('[data-plate]')?.getAttribute('data-phase') === 'open');
    const afterReveal = await gestureSnapshot(page);
    assertOpen(afterReveal, name);
    assert(afterReveal.historyLength === beforeReveal.historyLength, `${name}: gesture reveal changed browser history`);
    assert(afterReveal.node === beforeReveal.node, `${name}: gesture reveal navigated without explicit route choice`);
    assert(afterReveal.knownCount === beforeReveal.knownCount, `${name}: gesture reveal wrote route memory before explicit choice`);

    const firstDoor = page.locator('[data-doors] .kdx-door').first();
    const initialNode = new URL(page.url()).searchParams.get('node');
    const initialHistoryLength = await page.evaluate(() => history.length);
    await firstDoor.focus();
    assert(await firstDoor.evaluate((el) => el === document.activeElement), `${name}: route door did not receive keyboard focus`);
    await page.keyboard.press('Enter');
    await page.waitForFunction((node) => new URL(location.href).searchParams.get('node') !== node, initialNode);
    await assertActivePlate(page, `${name}: descent`);

    const descendedNode = new URL(page.url()).searchParams.get('node');
    const depthAfterEnter = Number(await page.locator('[data-depth]').textContent());
    assert(depthAfterEnter === 1, `${name}: meaningful descent did not increment depth to 1 (received ${depthAfterEnter})`);
    assert((await page.evaluate(() => history.length)) === initialHistoryLength + 1, `${name}: descent did not push exactly one history entry`);
    assertDormant(await gestureSnapshot(page), `${name}: new node`);

    const knownAfterEnter = Number(await page.locator('[data-known-count]').textContent());
    assert(knownAfterEnter >= 2, `${name}: Memory Constellation did not learn descended node`);

    await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForFunction((node) => new URL(location.href).searchParams.get('node') === node, initialNode);
    await assertActivePlate(page, `${name}: Back`);
    assert(Number(await page.locator('[data-depth]').textContent()) === 0, `${name}: Back did not reconstruct prior depth`);

    await page.goForward({ waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForFunction((node) => new URL(location.href).searchParams.get('node') === node, descendedNode);
    await assertActivePlate(page, `${name}: Forward`);
    assert(Number(await page.locator('[data-depth]').textContent()) === 1, `${name}: Forward did not reconstruct descended depth`);

    const beforeLensHistory = await page.evaluate(() => history.length);
    await page.locator('[data-lens-action="META"]').click();
    await page.waitForFunction(() => document.querySelector('[data-lens]')?.textContent === 'META');
    assert((await page.evaluate(() => history.length)) === beforeLensHistory, `${name}: lens change polluted history instead of replaceState`);

    const after = await shellMetrics(page);
    assertBoundedShell(after, name);
    const file = `${name}.png`;
    await page.screenshot({ path: path.join(outputDir, file), fullPage: false, animations: 'disabled' });
    report.acceptance.push({ name, pass: true, initialNode, descendedNode, knownAfterEnter, gesture: { beforeReveal, afterReveal }, metrics: after, screenshot: file });
  } catch (error) {
    fail(name, error);
  } finally {
    await context.close();
  }
}

async function mobileTouchConstellation() {
  const name = 'deep-navigation-mobile-390-touch-constellation';
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, colorScheme: 'dark' });
  const page = await context.newPage();
  try {
    await navigate(page, '?node=SCI-BIOLOGY&lens=NAKED_EYE');
    assertBoundedShell(await shellMetrics(page), name);
    const beforeReveal = await gestureSnapshot(page);
    assertDormant(beforeReveal, name);

    await page.evaluate(() => {
      const stage = document.querySelector('.kdx-deep__stage');
      if (!stage) throw new Error('gesture stage missing');
      const touch = (clientY) => ({ clientY });
      const start = new Event('touchstart', { bubbles: true, cancelable: true });
      Object.defineProperty(start, 'touches', { value: [touch(620)] });
      stage.dispatchEvent(start);
      const move = new Event('touchmove', { bubbles: true, cancelable: true });
      Object.defineProperty(move, 'touches', { value: [touch(420)] });
      stage.dispatchEvent(move);
    });
    await page.waitForFunction(() => document.querySelector('[data-plate]')?.getAttribute('data-phase') === 'open');
    const afterReveal = await gestureSnapshot(page);
    assertOpen(afterReveal, name);
    assert(afterReveal.historyLength === beforeReveal.historyLength, `${name}: touch reveal changed browser history`);
    assert(afterReveal.node === beforeReveal.node, `${name}: touch reveal navigated without explicit choice`);
    assert(afterReveal.knownCount === beforeReveal.knownCount, `${name}: touch reveal wrote memory before explicit choice`);

    await page.locator('[data-doors] .kdx-door').first().tap();
    await page.waitForFunction(() => Number(document.querySelector('[data-depth]')?.textContent) === 1);
    assert(Number(await page.locator('[data-known-count]').textContent()) >= 2, `${name}: visited-node count did not increase`);

    await page.locator('[data-constellation] summary').tap();
    assert(await page.locator('[data-constellation]').evaluate((el) => el.open === true), `${name}: constellation did not open by touch`);
    const visibleMemoryNodes = await page.locator('[data-constellation-nodes] .kdx-memory-node').count();
    assert(visibleMemoryNodes >= 2, `${name}: constellation omitted known nodes`);

    const metrics = await shellMetrics(page);
    assertBoundedShell(metrics, name);
    const file = `${name}.png`;
    await page.screenshot({ path: path.join(outputDir, file), fullPage: false, animations: 'disabled' });
    report.acceptance.push({ name, pass: true, visibleMemoryNodes, gesture: { beforeReveal, afterReveal }, metrics, screenshot: file });
  } catch (error) {
    fail(name, error);
  } finally {
    await context.close();
  }
}

async function reducedMotionContract() {
  const name = 'deep-navigation-reduced-motion';
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce', colorScheme: 'dark' });
  const page = await context.newPage();
  try {
    await navigate(page, '?node=SCI-BIOLOGY&lens=NAKED_EYE');
    const gesture = await gestureSnapshot(page);
    assertOpen(gesture, name);
    const motion = await page.evaluate(() => {
      const targets = [
        ['root', document.querySelector('[data-kdx-deep-lab]')],
        ['doors', document.querySelector('[data-doors]')],
        ['door', document.querySelector('[data-doors] .kdx-door')],
        ['meta-control', document.querySelector('[data-lens-action="META"]')],
      ].filter(([, el]) => Boolean(el));
      return {
        media: matchMedia('(prefers-reduced-motion: reduce)').matches,
        styles: targets.map(([target, el]) => {
          const style = getComputedStyle(el);
          return { target, transitionDuration: style.transitionDuration, animationDuration: style.animationDuration, scrollBehavior: style.scrollBehavior };
        }),
      };
    });
    assert(motion.media, `${name}: browser did not expose reduced-motion preference`);
    const nonZero = motion.styles.filter((style) => !cssTimeListIsEffectivelyZero(style.transitionDuration) || !cssTimeListIsEffectivelyZero(style.animationDuration));
    assert(nonZero.length === 0, `${name}: perceptible motion remained enabled under prefers-reduced-motion (${JSON.stringify(nonZero)})`);
    assertBoundedShell(await shellMetrics(page), name);
    const file = `${name}.png`;
    await page.screenshot({ path: path.join(outputDir, file), fullPage: false, animations: 'allow' });
    report.acceptance.push({ name, pass: true, epsilonMs: REDUCED_MOTION_EPSILON_MS, gesture, motion, screenshot: file });
  } catch (error) {
    fail(name, error);
  } finally {
    await context.close();
  }
}

async function boundedInteractionPerformance() {
  const name = 'deep-navigation-bounded-interaction-performance';
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', colorScheme: 'dark' });
  const page = await context.newPage();
  try {
    await navigate(page, '?node=SCI-BIOLOGY&lens=NAKED_EYE');
    const durations = [];
    const nodeCounts = [];
    for (let i = 0; i < 8; i += 1) {
      const result = await page.evaluate(async () => {
        const button = document.querySelector('[data-doors] .kdx-door');
        if (!button) throw new Error('no route door available');
        const start = performance.now();
        button.click();
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return {
          duration: performance.now() - start,
          nodeCount: document.querySelectorAll('*').length,
          doorCount: document.querySelectorAll('[data-doors] .kdx-door').length,
        };
      });
      durations.push(result.duration);
      nodeCounts.push(result.nodeCount);
      assert(result.doorCount >= 2 && result.doorCount <= 5, `${name}: candidate bound violated (${result.doorCount})`);
      assert(result.nodeCount < 800, `${name}: active DOM grew unbounded (${result.nodeCount})`);
    }
    const sorted = [...durations].sort((a, b) => a - b);
    const p95 = sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)];
    const max = Math.max(...durations);
    assert(p95 < 500, `${name}: p95 interaction-to-two-frames exceeded 500ms (${p95.toFixed(1)}ms)`);
    assert(Math.max(...nodeCounts) - Math.min(...nodeCounts) < 120, `${name}: DOM neighborhood drifted across traversal (${Math.min(...nodeCounts)}..${Math.max(...nodeCounts)})`);
    report.acceptance.push({ name, pass: true, samples: durations.length, p95Ms: Number(p95.toFixed(2)), maxMs: Number(max.toFixed(2)), domRange: [Math.min(...nodeCounts), Math.max(...nodeCounts)] });
  } catch (error) {
    fail(name, error);
  } finally {
    await context.close();
  }
}

try {
  await desktopHistoryKeyboard();
  await mobileTouchConstellation();
  await reducedMotionContract();
  await boundedInteractionPerformance();
} finally {
  await browser.close();
}

await fs.writeFile(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.errors.length) process.exitCode = 1;
