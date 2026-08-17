import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL ?? 'http://127.0.0.1:4321';
const appOrigin = new URL(baseURL).origin;
const outDir = 'artifacts/kodex-machine-evidence';
await mkdir(outDir, { recursive: true });

const profiles = [
  { id: 'desktop', viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' },
  { id: 'mobile', viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' },
  { id: 'reduced-motion', viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' },
];

const browser = await chromium.launch({ headless: true });
const evidence = [];
let failed = false;

function assert(check, message) {
  if (!check) throw new Error(message);
}

async function boundedGeometry(page, selector, profileId) {
  const geometry = await page.evaluate((stageSelector) => {
    const stage = document.querySelector(stageSelector);
    return {
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      stageHeight: stage?.getBoundingClientRect().height ?? 0,
      viewportHeight: window.innerHeight,
    };
  }, selector);
  assert(geometry.scrollHeight <= geometry.clientHeight + 2, `${profileId}: page scroll detected`);
  assert(geometry.scrollWidth <= geometry.clientWidth + 2, `${profileId}: horizontal overflow detected`);
  assert(Math.abs(geometry.stageHeight - geometry.viewportHeight) <= 4, `${profileId}: stage is not viewport-bounded`);
  return geometry;
}

async function clickAndRequirePath(page, locator, expectedPath, profileId) {
  await locator.waitFor({ state: 'visible' });
  // Correctness belongs to the exact browser pathname, not Playwright's
  // navigation lifecycle observer. The corridor can replace the document
  // quickly enough that waitForURL reports ERR_ABORTED/frame-detached even
  // when the destination is already loading/rendered. Sampling pathname keeps
  // the route contract strict without coupling PASS to that observer race.
  await locator.click({ noWaitAfter: true });
  await page.waitForFunction(
    (path) => window.location.pathname === path,
    expectedPath,
    { timeout: 8000 },
  );
  const pathname = await page.evaluate(() => window.location.pathname);
  assert(pathname === expectedPath, `${profileId}: expected ${expectedPath}, got ${pathname}`);
  return pathname;
}

async function machineCanvasSignature(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('[data-machine-canvas]');
    if (!(canvas instanceof HTMLCanvasElement)) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    // Deterministic sampled FNV-1a fingerprint. This is evidence of rendered
    // equality/difference only, not a cryptographic or aesthetic score.
    let hash = 0x811c9dc5;
    let paintedSamples = 0;
    for (let i = 0; i < pixels.length; i += 16) {
      const value = pixels[i] ^ pixels[i + 1] ^ pixels[i + 2] ^ pixels[i + 3];
      if (pixels[i] || pixels[i + 1] || pixels[i + 2] || pixels[i + 3]) paintedSamples += 1;
      hash ^= value;
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return {
      width: canvas.width,
      height: canvas.height,
      hash: hash.toString(16).padStart(8, '0'),
      paintedSamples,
    };
  });
}

for (const profile of profiles) {
  const context = await browser.newContext({ viewport: profile.viewport, reducedMotion: profile.reducedMotion });
  const page = await context.newPage();
  const consoleErrors = [];
  const httpErrors = [];
  const externalHttpErrors = [];
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (/^Failed to load resource: the server responded with a status of \d{3}/.test(text)) return;
    consoleErrors.push(text);
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('response', (response) => {
    if (response.status() < 400) return;
    const failure = { status: response.status(), url: response.url() };
    try {
      if (new URL(response.url()).origin === appOrigin) httpErrors.push(failure);
      else externalHttpErrors.push(failure);
    } catch {
      httpErrors.push(failure);
    }
  });

  try {
    // ARCHIVE → MACHINE quiet interlude: it is an explicit pause, not an auto-transition.
    await page.goto(`${baseURL}/kodex/interlude/archive-machine/`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-kx][data-stage-name="QUIET FRAME"]');
    const interludeGeometry = await boundedGeometry(page, '[data-stage-name="QUIET FRAME"]', `${profile.id}/interlude`);

    const interlude = await page.evaluate(() => {
      const root = document.querySelector('[data-stage-name="QUIET FRAME"]');
      const image = document.querySelector('.kdx-quiet-frame img, .kx-quiet-frame img, [data-kdx-quiet-frame] img');
      const text = document.body.textContent ?? '';
      return {
        nextUrl: root?.getAttribute('data-next-url'),
        nextLabel: root?.getAttribute('data-next-label'),
        hasLabel: text.includes('ARCHIVE FRAGMENT / BEFORE MACHINE'),
        imagePresent: image instanceof HTMLImageElement,
        imageComplete: image instanceof HTMLImageElement ? image.complete && image.naturalWidth > 0 : null,
      };
    });
    assert(interlude.nextUrl === '/kodex/folio/iv/', `${profile.id}: interlude next target drifted`);
    assert(interlude.nextLabel === 'ENTER MACHINE', `${profile.id}: interlude command drifted`);
    assert(interlude.hasLabel, `${profile.id}: archive-machine interlude identity missing`);

    const interludeJourney = await page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('kx-journey') || 'null'); } catch { return null; }
    });
    assert(Array.isArray(interludeJourney?.views) && interludeJourney.views.includes('/kodex/interlude/archive-machine/'), `${profile.id}: interlude visit memory missing`);

    await page.screenshot({ path: `${outDir}/archive-machine-interlude-${profile.id}.png`, fullPage: true });
    const interludeNext = page.locator('[data-deck-next]');
    await clickAndRequirePath(page, interludeNext, '/kodex/folio/iv/', `${profile.id}/interlude`);

    // MACHINE: generation is local state; navigation remains a separate explicit NEXT.
    await page.waitForSelector('[data-kx][data-stage-name="MACHINE"]');
    const machineGeometry = await boundedGeometry(page, '[data-stage-name="MACHINE"]', `${profile.id}/machine`);
    const initial = await page.evaluate(() => {
      const canvas = document.querySelector('[data-machine-canvas]');
      const ctx = canvas instanceof HTMLCanvasElement ? canvas.getContext('2d') : null;
      let painted = false;
      if (canvas instanceof HTMLCanvasElement && ctx) {
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 3; i < pixels.length; i += 4) {
          if (pixels[i] !== 0) { painted = true; break; }
        }
      }
      return {
        state: document.querySelector('[data-machine-state]')?.textContent?.trim(),
        seed: document.querySelector('[data-machine-seed]')?.textContent?.trim(),
        source: document.querySelector('[data-machine-source]')?.textContent?.trim(),
        method: document.querySelector('[data-machine-method]')?.textContent?.trim(),
        integrity: [...document.querySelectorAll('[data-kdx-machine] dd')].at(-1)?.textContent?.trim(),
        canvasPainted: painted,
        pathname: location.pathname,
      };
    });
    assert(initial.state === 'READY', `${profile.id}: MACHINE initial state is not READY`);
    assert(initial.source === 'ACHROMA_006', `${profile.id}: MACHINE source drifted`);
    assert(initial.method === 'ASSEMBLY / TRACE / CELL', `${profile.id}: MACHINE method drifted`);
    assert(initial.canvasPainted, `${profile.id}: MACHINE canvas is not painted`);
    assert(initial.pathname === '/kodex/folio/iv/', `${profile.id}: MACHINE route mismatch`);

    const readySignature = await machineCanvasSignature(page);
    assert(readySignature?.paintedSamples > 0, `${profile.id}: READY canvas fingerprint has no painted samples`);
    await page.screenshot({ path: `${outDir}/machine-${profile.id}-ready.png`, fullPage: true });

    // Truth boundary: decorative percentages cannot masquerade as verified runtime telemetry.
    assert(!/^\d+(?:\.\d+)?%$/.test(initial.integrity ?? ''), `${profile.id}: UNSOURCED_TELEMETRY — MACHINE exposes literal INTEGRITY ${initial.integrity} without a verified runtime measurement source`);

    const generate = page.locator('[data-machine-generate]');
    await generate.waitFor({ state: 'visible' });
    const beforeSeed = initial.seed;
    await generate.click();
    await page.waitForFunction(() => document.querySelector('[data-machine-state]')?.textContent?.trim() === 'GENERATING', null, { timeout: 1000 });
    await page.waitForTimeout(profile.reducedMotion === 'reduce' ? 80 : 260);
    const generating = await page.evaluate(() => ({
      state: document.querySelector('[data-machine-state]')?.textContent?.trim(),
      seed: document.querySelector('[data-machine-seed]')?.textContent?.trim(),
      pathname: location.pathname,
    }));
    const generatingSignature = await machineCanvasSignature(page);
    assert(generating.state === 'GENERATING', `${profile.id}: GENERATING state was not observable`);
    assert(generating.seed && generating.seed !== beforeSeed, `${profile.id}: next seed was not visible during GENERATING`);
    assert(generating.pathname === '/kodex/folio/iv/', `${profile.id}: GENERATING auto-navigated`);
    assert(generatingSignature?.hash !== readySignature?.hash, `${profile.id}: GENERATING did not visibly alter the canvas`);
    await page.screenshot({ path: `${outDir}/machine-${profile.id}-generating.png`, fullPage: true });

    await page.waitForFunction(() => document.querySelector('[data-machine-state]')?.textContent?.trim() === 'COMPLETE', null, { timeout: 3000 });
    const generated = await page.evaluate(() => ({
      state: document.querySelector('[data-machine-state]')?.textContent?.trim(),
      seed: document.querySelector('[data-machine-seed]')?.textContent?.trim(),
      pathname: location.pathname,
    }));
    const completeSignature = await machineCanvasSignature(page);
    assert(generated.state === 'COMPLETE', `${profile.id}: generation did not complete`);
    assert(generated.seed && generated.seed !== beforeSeed, `${profile.id}: generation did not produce a new seed`);
    assert(generated.pathname === '/kodex/folio/iv/', `${profile.id}: GENERATE SIGNAL auto-navigated`);
    assert(completeSignature?.hash !== readySignature?.hash, `${profile.id}: different seed produced the same rendered canvas fingerprint`);
    if (profile.reducedMotion !== 'reduce') {
      assert(generatingSignature?.hash !== completeSignature?.hash, `${profile.id}: full-motion GENERATING did not expose an intermediate assembly frame`);
    }
    await page.screenshot({ path: `${outDir}/machine-${profile.id}-complete.png`, fullPage: true });

    const outputTrigger = page.locator('[data-kdx-drawer-open="machine"]');
    await outputTrigger.click();
    const drawer = page.locator('[data-kdx-drawer]');
    await drawer.waitFor({ state: 'visible' });
    const outputText = await page.locator('[data-machine-output]').textContent();
    assert(outputText?.includes(generated.seed), `${profile.id}: output drawer does not reflect generated seed`);
    await page.screenshot({ path: `${outDir}/machine-${profile.id}-output.png`, fullPage: true });
    await page.locator('[data-kdx-drawer-close]').click();
    await page.waitForFunction(() => document.querySelector('[data-kdx-drawer]')?.hasAttribute('hidden'));
    await page.waitForFunction(() => document.activeElement?.matches?.('[data-kdx-drawer-open="machine"]'));

    const machineJourney = await page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('kx-journey') || 'null'); } catch { return null; }
    });
    assert(Array.isArray(machineJourney?.views) && machineJourney.views.includes('/kodex/folio/iv/'), `${profile.id}: MACHINE visit memory missing`);

    // Browser-level deterministic replay: reload the canonical MACHINE route,
    // which restores its canonical seed, and require the rendered canvas to
    // reproduce the exact READY fingerprint observed before GENERATE.
    await page.goto(`${baseURL}/kodex/folio/iv/`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-kx][data-stage-name="MACHINE"]');
    const replay = await page.evaluate(() => ({
      state: document.querySelector('[data-machine-state]')?.textContent?.trim(),
      seed: document.querySelector('[data-machine-seed]')?.textContent?.trim(),
      pathname: location.pathname,
    }));
    const replaySignature = await machineCanvasSignature(page);
    assert(replay.state === 'READY', `${profile.id}: replay did not return to READY`);
    assert(replay.seed === beforeSeed, `${profile.id}: replay seed drifted from canonical seed`);
    assert(replaySignature?.hash === readySignature?.hash, `${profile.id}: same seed did not reproduce the same rendered canvas fingerprint`);
    await page.screenshot({ path: `${outDir}/machine-${profile.id}-replay.png`, fullPage: true });

    const next = page.locator('[data-deck-next]');
    const navigation = await clickAndRequirePath(page, next, '/kodex/folio/v/', `${profile.id}/machine`);

    assert(consoleErrors.length === 0, `${profile.id}: console errors: ${JSON.stringify(consoleErrors)}`);
    assert(httpErrors.length === 0, `${profile.id}: first-party HTTP errors: ${JSON.stringify(httpErrors)}`);

    evidence.push({
      profile: profile.id,
      status: 'PASS',
      interludeGeometry,
      interlude,
      machineGeometry,
      initial,
      generating,
      generated,
      replay,
      canvasSignatures: {
        ready: readySignature,
        generating: generatingSignature,
        complete: completeSignature,
        replay: replaySignature,
      },
      navigation,
      consoleErrors,
      httpErrors,
      externalHttpErrors,
    });
  } catch (error) {
    failed = true;
    evidence.push({ profile: profile.id, status: 'FAIL', error: error instanceof Error ? error.message : String(error), currentUrl: page.url(), consoleErrors, httpErrors, externalHttpErrors });
    await page.screenshot({ path: `${outDir}/machine-${profile.id}-FAIL.png`, fullPage: true }).catch(() => {});
  } finally {
    await context.close();
  }
}

await browser.close();
await writeFile(`${outDir}/evidence.json`, JSON.stringify({
  baseURL,
  evidence,
  truthBoundary: {
    canvasFingerprintIsAestheticScore: false,
    browserPassIsCreatorAcceptance: false,
    sameSeedReplayMustMatch: true,
    differentSeedMustChangeRenderedTopology: true,
    fullMotionMustExposeIntermediateAssembly: true,
  },
}, null, 2));
for (const result of evidence) console.log(`${result.status} ${result.profile}${result.error ? ` — ${result.error}` : ''}`);
if (failed) process.exit(1);
