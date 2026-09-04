import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence/seven-worlds-navigation');
await fs.mkdir(outputDir, { recursive: true });

const worlds = Object.freeze({
  threshold: { label: 'THRESHOLD', href: '/kodex/' },
  prologue: { label: 'PROLOGUE', href: '/kodex/folio/i/' },
  descent: { label: 'DESCENT', href: '/kodex/folio/ii/' },
  archive: { label: 'ARCHIVE', href: '/kodex/folio/iii/' },
  machine: { label: 'MACHINE', href: '/kodex/folio/iv/' },
  cosmology: { label: 'COSMOLOGY', href: '/kodex/folio/v/' },
  return: { label: 'RETURN', href: '/kodex/folio/vi/' },
});

const interludes = Object.freeze({
  archiveMachine: '/kodex/interlude/archive-machine/',
  cosmologyReturn: '/kodex/interlude/cosmology-return/',
});

const profiles = Object.freeze([
  { key: 'desktop-1440', width: 1440, height: 900, reducedMotion: 'no-preference' },
  { key: 'mobile-390', width: 390, height: 844, reducedMotion: 'no-preference', isMobile: true, hasTouch: true },
  { key: 'mobile-412', width: 412, height: 915, reducedMotion: 'no-preference', isMobile: true, hasTouch: true },
  { key: 'reduced-1280', width: 1280, height: 800, reducedMotion: 'reduce' },
]);

const forward = Object.freeze([
  { from: worlds.prologue, via: [], to: worlds.descent },
  { from: worlds.descent, via: [], to: worlds.archive },
  { from: worlds.archive, via: [interludes.archiveMachine], to: worlds.machine },
  { from: worlds.machine, via: [], to: worlds.cosmology },
  { from: worlds.cosmology, via: [interludes.cosmologyReturn], to: worlds.return },
]);

const reverse = Object.freeze([
  { from: worlds.return, via: [interludes.cosmologyReturn], to: worlds.cosmology },
  { from: worlds.cosmology, via: [], to: worlds.machine },
  { from: worlds.machine, via: [interludes.archiveMachine], to: worlds.archive },
  { from: worlds.archive, via: [], to: worlds.descent },
  { from: worlds.descent, via: [], to: worlds.prologue },
  { from: worlds.prologue, via: [], to: worlds.threshold },
]);

const browser = await chromium.launch({ headless: true });
const report = {
  contract: 'causal canonical journey: THRESHOLD consent → seven worlds, preserving declared interludes, then PREVIOUS back to THRESHOLD',
  generatedAt: new Date().toISOString(),
  baseURL,
  cases: [],
  errors: [],
};

const formatError = (error) => String(error?.stack || error?.message || error);
const fail = (message) => {
  report.errors.push(message);
  console.error(message);
};
const pathname = (page) => new URL(page.url()).pathname;
const activeScene = async (page) => page.evaluate(() => (
  document.querySelector('[data-kdx-active-scene]')?.getAttribute('data-kdx-active-scene')
  || document.querySelector('[data-kdx-scene-id]')?.getAttribute('data-kdx-scene-id')
  || null
));
const worldKeyFor = (world) => Object.entries(worlds).find(([, value]) => value === world)?.[0] || null;

const waitForSceneIdentity = async (page, expectedKey, timeout = 10_000) => {
  await page.waitForFunction((key) => (
    document.querySelector('[data-kdx-active-scene]')?.getAttribute('data-kdx-active-scene')
    || document.querySelector('[data-kdx-scene-id]')?.getAttribute('data-kdx-scene-id')
    || null
  ) === key, expectedKey, { timeout });
};

const assertWorld = async (page, world, label) => {
  const pathNow = pathname(page);
  const sceneNow = await activeScene(page);
  const expectedKey = worldKeyFor(world);
  if (pathNow !== world.href) throw new Error(`${label}: route drift ${pathNow} != ${world.href}`);
  if (sceneNow !== expectedKey) throw new Error(`${label}: scene identity ${sceneNow || 'MISSING'} != ${expectedKey}`);
};

const activateControl = async (page, selector, profile) => {
  const control = page.locator(selector).first();
  if (await control.count() !== 1) throw new Error(`${selector} missing`);
  if (!(await control.isVisible())) throw new Error(`${selector} hidden`);
  if (!(await control.isEnabled())) throw new Error(`${selector} disabled`);

  if (profile.hasTouch) {
    // Do not call Locator.scrollIntoViewIfNeeded() here. The canonical release gate
    // already proves these mobile deck controls are physically visible/reachable,
    // and Playwright's scroll action additionally waits for animation stability.
    // Measuring the live bounds directly lets this gate test the product's actual
    // touch hit-test instead of failing inside a harness-only stability wait.
    const box = await control.boundingBox();
    if (!box || box.width <= 0 || box.height <= 0) throw new Error(`${selector} has no tappable bounds`);

    const point = {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2,
    };
    const viewport = page.viewportSize();
    if (!viewport) throw new Error(`${selector} missing viewport for touch activation`);
    if (point.x < 0 || point.y < 0 || point.x > viewport.width || point.y > viewport.height) {
      throw new Error(`${selector} touch point outside viewport ${point.x},${point.y} / ${viewport.width}x${viewport.height}`);
    }

    // Use the browser touchscreen at the measured physical center. This preserves
    // a real touch hit-test (including overlays) without Locator actionability/
    // navigation coupling. Route + scene assertions below remain fail-closed.
    await page.touchscreen.tap(point.x, point.y);
  } else {
    await control.focus();
    await page.keyboard.press('Enter');
  }
};

const leaveCurrentRoute = async ({ page, selector, profile, expectedPath, label }) => {
  const startPath = pathname(page);
  const attempts = [];

  for (let attempt = 1; attempt <= 12; attempt += 1) {
    const before = pathname(page);
    await activateControl(page, selector, profile);

    try {
      await page.waitForURL((url) => url.pathname !== before, {
        timeout: profile.reducedMotion === 'reduce' ? 4_500 : 7_500,
      });
    } catch (_) {}

    await page.waitForTimeout(profile.reducedMotion === 'reduce' ? 120 : 260);
    const after = pathname(page);
    attempts.push({ attempt, before, after });

    if (after !== before) {
      if (after !== expectedPath) throw new Error(`${label}: route drift ${after} != ${expectedPath}`);
      return attempts;
    }

    if (after !== startPath) throw new Error(`${label}: unexpected intermediate route ${after}`);
  }

  throw new Error(`${label}: route never left ${startPath} after ${attempts.length} bounded control activations`);
};

const crossThreshold = async ({ page, profile }) => {
  await assertWorld(page, worlds.threshold, 'THRESHOLD start');
  const selector = '[data-kdx-veil] a[data-kdx-cruzar][data-kdx-sonido="0"]';
  await activateControl(page, selector, profile);

  await page.waitForURL((url) => url.pathname === worlds.prologue.href, { timeout: 10_000 });
  await page.waitForLoadState('domcontentloaded', { timeout: 10_000 }).catch(() => {});
  // The consent transition can commit the destination URL before Astro's scene
  // identity marker is mounted. Direct-load evidence already proves PROLOGUE's
  // marker; causal evidence must wait for that same observable contract rather
  // than sampling the transient post-navigation gap.
  await waitForSceneIdentity(page, 'prologue', 10_000);
  await assertWorld(page, worlds.prologue, 'THRESHOLD → PROLOGUE');
};

const traverseLeg = async ({ page, profile, leg, direction }) => {
  const selector = direction === 'NEXT' ? '[data-deck-next]' : '[data-deck-prev]';
  const route = [...leg.via, leg.to.href];
  const record = {
    profile: profile.key,
    direction,
    from: leg.from.label,
    fromHref: leg.from.href,
    via: [...leg.via],
    to: leg.to.label,
    toHref: leg.to.href,
    selector,
    route,
    hops: [],
    pageErrors: [],
  };

  const onPageError = (error) => record.pageErrors.push(formatError(error));
  page.on('pageerror', onPageError);

  try {
    await assertWorld(page, leg.from, `${leg.from.label} ${direction} start`);

    for (let index = 0; index < route.length; index += 1) {
      const expectedPath = route[index];
      const hop = await leaveCurrentRoute({ page, selector, profile, expectedPath, label: `${leg.from.label} ${direction} ${leg.to.label} hop ${index + 1}/${route.length}` });
      record.hops.push({ expectedPath, attempts: hop });
      await page.waitForLoadState('domcontentloaded', { timeout: 10_000 }).catch(() => {});
    }

    await page.waitForTimeout(profile.reducedMotion === 'reduce' ? 120 : 220);
    await assertWorld(page, leg.to, `${leg.from.label} ${direction} ${leg.to.label} end`);
    if (record.pageErrors.length) throw new Error(`pageerror ${record.pageErrors.join(' | ')}`);
    record.endPathname = pathname(page);
    record.endScene = await activeScene(page);
    record.success = true;
  } catch (error) {
    record.success = false;
    record.error = formatError(error);
    fail(`${leg.from.label} ${direction} ${leg.to.label}/${profile.key}: ${record.error}`);
  } finally {
    page.off('pageerror', onPageError);
    report.cases.push(record);
  }
};

try {
  for (const profile of profiles) {
    const context = await browser.newContext({ viewport: { width: profile.width, height: profile.height }, isMobile: profile.isMobile || false, hasTouch: profile.hasTouch || false, reducedMotion: profile.reducedMotion, colorScheme: 'dark' });
    const page = await context.newPage();
    const profileErrors = [];
    page.on('pageerror', (error) => profileErrors.push(formatError(error)));

    try {
      const response = await page.goto(new URL(worlds.threshold.href, baseURL).toString(), { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForLoadState('load', { timeout: 10_000 }).catch(() => {});
      await page.waitForTimeout(profile.reducedMotion === 'reduce' ? 180 : 420);
      const status = response?.status() || 0;
      if (status < 200 || status >= 400) throw new Error(`THRESHOLD HTTP ${status}`);

      await crossThreshold({ page, profile });
      report.cases.push({ profile: profile.key, direction: 'ENTER', from: worlds.threshold.label, fromHref: worlds.threshold.href, to: worlds.prologue.label, toHref: worlds.prologue.href, selector: '[data-kdx-veil] a[data-kdx-cruzar][data-kdx-sonido="0"]', success: true });

      for (const leg of forward) await traverseLeg({ page, profile, leg, direction: 'NEXT' });
      for (const leg of reverse) await traverseLeg({ page, profile, leg, direction: 'PREVIOUS' });

      if (profileErrors.length) throw new Error(`profile pageerror ${profileErrors.join(' | ')}`);
      await assertWorld(page, worlds.threshold, `${profile.key} final THRESHOLD`);
    } catch (error) {
      fail(`${profile.key} journey: ${formatError(error)}`);
      report.cases.push({ profile: profile.key, direction: 'JOURNEY', success: false, error: formatError(error) });
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

const expectedCases = profiles.length * (1 + forward.length + reverse.length);
if (report.cases.filter((entry) => entry.direction !== 'JOURNEY').length !== expectedCases) fail(`case coverage mismatch ${report.cases.filter((entry) => entry.direction !== 'JOURNEY').length}/${expectedCases}`);
if (report.cases.some((entry) => entry.success !== true)) fail('one or more causal journey cases failed');

await fs.writeFile(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ contract: report.contract, cases: report.cases.length, expectedCases, errors: report.errors }, null, 2));

if (report.errors.length) process.exitCode = 1;
