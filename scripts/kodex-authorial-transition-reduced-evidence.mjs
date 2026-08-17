import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL ?? 'http://127.0.0.1:4321';
const exactSha = process.env.KODEX_HEAD_SHA ?? process.env.GITHUB_SHA ?? 'LOCAL_UNBOUND';
const outDir = 'artifacts/kodex-authorial-transition-evidence/reduced';
await mkdir(outDir, { recursive: true });

const profiles = [
  { id: 'desktop-1440x900', viewport: { width: 1440, height: 900 }, hasTouch: false },
  { id: 'mobile-390x844', viewport: { width: 390, height: 844 }, hasTouch: true },
];

const boundaries = [
  {
    id: '01-prologue-to-descent',
    sourcePath: '/kodex/folio/i/',
    targetPath: '/kodex/folio/ii/',
    trigger: '.kx-os-stage__actions .kx-os-primary',
    expectedVariant: 'descent',
    expectedCue: 'linear-gradient',
  },
  {
    id: '05-machine-to-cosmology',
    sourcePath: '/kodex/folio/iv/',
    targetPath: '/kodex/folio/v/',
    trigger: '[data-deck-next]',
    expectedVariant: 'cosmology',
    expectedCue: 'radial-gradient',
  },
  {
    id: '07-quiet-to-return-control',
    sourcePath: '/kodex/interlude/cosmology-return/',
    targetPath: '/kodex/folio/vi/',
    trigger: '[data-deck-next]',
    expectedVariant: 'default',
    expectedCue: 'none',
    seededJourney: true,
  },
];

function assert(check, message) {
  if (!check) throw new Error(message);
}

function assertCue(cue, boundary, profile, side) {
  assert(cue, `${boundary.id}/${profile.id}: ${side} reduced-motion cue missing`);
  assert(cue.variant === boundary.expectedVariant, `${boundary.id}/${profile.id}: ${side} expected ${boundary.expectedVariant}, got ${cue.variant}`);
  assert(cue.canvasDisplay === 'none', `${boundary.id}/${profile.id}: ${side} reduced-motion canvas should be disabled, got ${cue.canvasDisplay}`);
  if (boundary.expectedCue === 'linear-gradient') {
    assert(cue.backgroundImage.includes('linear-gradient'), `${boundary.id}/${profile.id}: ${side} descent cue missing linear gradient`);
  }
  if (boundary.expectedCue === 'radial-gradient') {
    assert(cue.backgroundImage.includes('radial-gradient'), `${boundary.id}/${profile.id}: ${side} cosmology cue missing radial gradient`);
  }
  if (boundary.expectedCue === 'none') {
    assert(cue.backgroundImage === 'none', `${boundary.id}/${profile.id}: ${side} control boundary gained an unintended semantic gradient`);
  }
}

const browser = await chromium.launch({ headless: true });
const records = [];
let failed = false;

for (const boundary of boundaries) {
  for (const profile of profiles) {
    let context;
    let page;
    const consoleErrors = [];
    const firstPartyHttpErrors = [];
    const appOrigin = new URL(baseURL).origin;

    try {
      context = await browser.newContext({
        viewport: profile.viewport,
        reducedMotion: 'reduce',
        hasTouch: profile.hasTouch,
        isMobile: profile.hasTouch,
      });

      // Install before any app script on every navigation. The log is local to
      // each document, so the source cue and target recomposition cue are
      // proven independently rather than inferring one from the other.
      await context.addInitScript(() => {
        window.__kdxReducedCueLog = [];
        const recorded = new Set();
        const sample = (root) => {
          if (!(root instanceof HTMLElement) || !root.hasAttribute('data-activo')) return;
          const variant = root.dataset.variante ?? null;
          const phase = root.dataset.fase ?? null;
          const key = `${variant}:${phase}`;
          if (recorded.has(key)) return;
          recorded.add(key);
          const canvas = root.querySelector('[data-kdx-ritual-canvas]');
          window.__kdxReducedCueLog.push({
            variant,
            phase,
            backgroundImage: getComputedStyle(root).backgroundImage,
            canvasDisplay: canvas instanceof HTMLElement ? getComputedStyle(canvas).display : null,
          });
        };
        const bind = (root) => {
          if (!(root instanceof HTMLElement) || root.dataset.kdxCueObserved === '1') return;
          root.dataset.kdxCueObserved = '1';
          sample(root);
          new MutationObserver(() => sample(root)).observe(root, {
            attributes: true,
            attributeFilter: ['data-activo', 'data-variante', 'data-fase'],
          });
        };
        const discover = () => {
          const root = document.querySelector('[data-kdx-ritual]');
          if (root) bind(root);
        };
        new MutationObserver(discover).observe(document, { childList: true, subtree: true });
        document.addEventListener('DOMContentLoaded', discover, { once: true });
        discover();
      });

      if (boundary.seededJourney) {
        await context.addInitScript(() => {
          localStorage.setItem('kx-journey', JSON.stringify({
            started: 1,
            views: ['/kodex/', '/kodex/folio/i/', '/kodex/folio/ii/', '/kodex/folio/iii/', '/kodex/folio/iv/', '/kodex/folio/v/'],
            effects: ['observe:commit', 'machine:generate'],
            signal: 2,
            cycle: 0,
            last: 1,
          }));
        });
      }

      page = await context.newPage();
      page.on('console', (message) => {
        if (message.type() !== 'error') return;
        const text = message.text();
        if (/^Failed to load resource: the server responded with a status of \d{3}/.test(text)) return;
        consoleErrors.push(text);
      });
      page.on('pageerror', (error) => consoleErrors.push(error.message));
      page.on('response', (response) => {
        if (response.status() < 400) return;
        try {
          if (new URL(response.url()).origin === appOrigin) firstPartyHttpErrors.push({ status: response.status(), url: response.url() });
        } catch {
          firstPartyHttpErrors.push({ status: response.status(), url: response.url() });
        }
      });

      await page.goto(`${baseURL}${boundary.sourcePath}`, { waitUntil: 'networkidle' });
      assert(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), `${boundary.id}/${profile.id}: reduced-motion media query is not active`);

      const trigger = page.locator(boundary.trigger).first();
      await trigger.waitFor({ state: 'visible', timeout: 8000 });
      await trigger.click({ noWaitAfter: true });

      await page.waitForFunction((expectedVariant) => (
        window.__kdxReducedCueLog?.some((entry) => entry.variant === expectedVariant && entry.phase === 'colapso')
      ), boundary.expectedVariant, { timeout: 1500 });
      const sourceCue = await page.evaluate((expectedVariant) => (
        [...(window.__kdxReducedCueLog ?? [])].reverse().find((entry) => entry.variant === expectedVariant && entry.phase === 'colapso') ?? null
      ), boundary.expectedVariant);
      assertCue(sourceCue, boundary, profile, 'source');

      await page.waitForFunction((target) => location.pathname === target, boundary.targetPath, { timeout: 10000 });
      const targetPath = await page.evaluate(() => location.pathname);
      assert(targetPath === boundary.targetPath, `${boundary.id}/${profile.id}: target route drifted to ${targetPath}`);
      assert(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), `${boundary.id}/${profile.id}: reduced-motion did not persist after navigation`);

      await page.waitForFunction((expectedVariant) => (
        window.__kdxReducedCueLog?.some((entry) => entry.variant === expectedVariant && entry.phase === 'recomposicion')
      ), boundary.expectedVariant, { timeout: 2500 });
      const targetCue = await page.evaluate((expectedVariant) => (
        [...(window.__kdxReducedCueLog ?? [])].reverse().find((entry) => entry.variant === expectedVariant && entry.phase === 'recomposicion') ?? null
      ), boundary.expectedVariant);
      assertCue(targetCue, boundary, profile, 'target');

      assert(consoleErrors.length === 0, `${boundary.id}/${profile.id}: console errors ${JSON.stringify(consoleErrors)}`);
      assert(firstPartyHttpErrors.length === 0, `${boundary.id}/${profile.id}: first-party HTTP errors ${JSON.stringify(firstPartyHttpErrors)}`);

      await page.screenshot({ path: `${outDir}/${boundary.id}--${profile.id}--target.png`, fullPage: true });
      records.push({
        boundary: boundary.id,
        profile: profile.id,
        exactSha,
        motion: 'REDUCED',
        sourcePath: boundary.sourcePath,
        targetPath: boundary.targetPath,
        expectedVariant: boundary.expectedVariant,
        sourceCue,
        targetCue,
        status: 'PASS',
      });
    } catch (error) {
      failed = true;
      records.push({
        boundary: boundary.id,
        profile: profile.id,
        exactSha,
        motion: 'REDUCED',
        sourcePath: boundary.sourcePath,
        targetPath: boundary.targetPath,
        expectedVariant: boundary.expectedVariant,
        status: 'FAIL',
        error: error instanceof Error ? error.message : String(error),
        currentUrl: page?.url?.() ?? null,
        consoleErrors,
        firstPartyHttpErrors,
      });
    } finally {
      await context?.close().catch(() => {});
    }
  }
}

await browser.close();

const manifest = {
  schema: 'KODEX_AUTHORIAL_TRANSITION_REDUCED_EVIDENCE_V2',
  exactSha,
  baseURL,
  truthBoundary: {
    browserPassIsCreatorAcceptance: false,
    reducedMotionMustPreserveSemanticDifference: true,
    sourceAndTargetCueMustBothBeObserved: true,
    decorativeMotionRequired: false,
    routeEngineModified: false,
    stateStoreModified: false,
    protectedOcinOriginalsModified: false,
  },
  counts: {
    expected: boundaries.length * profiles.length,
    pass: records.filter((record) => record.status === 'PASS').length,
    fail: records.filter((record) => record.status === 'FAIL').length,
  },
  records,
};

await writeFile(`${outDir}/manifest.json`, JSON.stringify(manifest, null, 2));
for (const record of records) console.log(`${record.status} ${record.boundary} ${record.profile}${record.error ? ` — ${record.error}` : ''}`);
if (failed) process.exit(1);
