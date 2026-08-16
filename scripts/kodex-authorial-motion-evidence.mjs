import { mkdir, writeFile, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { chromium } from 'playwright';

const execFileAsync = promisify(execFile);
const baseURL = process.env.KODEX_PREVIEW_URL ?? 'http://127.0.0.1:4321';
const exactSha = process.env.GITHUB_SHA ?? 'LOCAL_UNBOUND';
const outDir = 'artifacts/kodex-authorial-motion-evidence';
const rawDir = `${outDir}/raw`;
const clipDir = `${outDir}/clips`;
const clipSeconds = 10;
const settleMs = 900;
const recordWindowMs = 10_500;
await mkdir(rawDir, { recursive: true });
await mkdir(clipDir, { recursive: true });

const profiles = [
  { id: 'desktop-1440x900', viewport: { width: 1440, height: 900 }, hasTouch: false },
  { id: 'mobile-390x844', viewport: { width: 390, height: 844 }, hasTouch: true },
];

const scenes = [
  { id: '00-threshold', stage: 'THRESHOLD', path: '/kodex/', readiness: 'threshold' },
  { id: '01-prologue', stage: 'PROLOGUE', path: '/kodex/folio/i/', readiness: 'crt-observe' },
  { id: '02-descent', stage: 'DESCENT', path: '/kodex/folio/ii/', readiness: 'crt-descent' },
  { id: '03-archive', stage: 'ARCHIVE', path: '/kodex/folio/iii/', readiness: 'archive' },
  { id: '04-machine', stage: 'MACHINE', path: '/kodex/folio/iv/', readiness: 'machine' },
  { id: '05-cosmology', stage: 'COSMOLOGY', path: '/kodex/folio/v/', readiness: 'cosmology' },
  { id: '06-return', stage: 'RETURN', path: '/kodex/folio/vi/', readiness: 'return', seededJourney: true },
];

const browser = await chromium.launch({ headless: true });
const records = [];
let failed = false;

function assert(check, message) {
  if (!check) throw new Error(message);
}

async function probeDuration(path) {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    path,
  ]);
  return Number.parseFloat(stdout.trim());
}

async function trimTail(rawPath, outputPath) {
  await execFileAsync('ffmpeg', [
    '-y',
    '-sseof', `-${clipSeconds}`,
    '-i', rawPath,
    '-t', String(clipSeconds),
    '-map', '0:v:0',
    '-an',
    '-c', 'copy',
    outputPath,
  ]);
  const duration = await probeDuration(outputPath);
  assert(Number.isFinite(duration), `Unable to probe trimmed clip duration for ${outputPath}`);
  assert(duration >= 8 && duration <= 12, `Trimmed clip duration ${duration.toFixed(3)}s falls outside 8–12s review contract`);
  return duration;
}

async function waitForAuthorialReady(page, scene) {
  await page.waitForSelector(`[data-kx][data-stage-name="${scene.stage}"]`);
  await page.evaluate(() => document.fonts?.ready);

  if (scene.readiness === 'threshold') {
    await page.waitForSelector('[data-kdx-portal]');
    await page.waitForFunction(() => {
      const state = document.querySelector('[data-kdx-portal]')?.getAttribute('data-kdx-portal-state');
      return state === 'ready' || state === 'unavailable';
    }, null, { timeout: 8000 });
  }

  if (scene.readiness === 'crt-observe') {
    await page.waitForSelector('.kdx-crt-mount[data-preset="observe"]');
    await page.waitForFunction(() => document.querySelector('.kdx-crt-mount[data-preset="observe"]')?.getAttribute('data-mounted') === '1', null, { timeout: 8000 });
  }

  if (scene.readiness === 'crt-descent') {
    await page.waitForSelector('.kdx-crt-mount[data-preset="descent"]');
    await page.waitForFunction(() => document.querySelector('.kdx-crt-mount[data-preset="descent"]')?.getAttribute('data-mounted') === '1', null, { timeout: 8000 });
  }

  if (scene.readiness === 'archive') {
    await page.waitForSelector('.kx-archive-hero-specimen');
    await page.waitForFunction(() => {
      const image = document.querySelector('.kx-archive-hero-specimen');
      return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
    }, null, { timeout: 8000 });
  }

  if (scene.readiness === 'machine') {
    await page.waitForSelector('[data-machine-canvas]');
    await page.waitForFunction(() => document.querySelector('[data-machine-state]')?.textContent?.trim() === 'READY', null, { timeout: 8000 });
  }

  if (scene.readiness === 'cosmology') {
    await page.waitForSelector('.kdx-cosmo__svg');
    await page.waitForSelector('[data-cosmo-next]');
  }

  if (scene.readiness === 'return') {
    await page.waitForSelector('[data-kdx-return-specimen]');
    await page.waitForSelector('.kdx-crt-mount[data-preset="return"]');
    await page.waitForFunction(() => document.querySelector('.kdx-crt-mount[data-preset="return"]')?.getAttribute('data-mounted') === '1', null, { timeout: 8000 });
  }

  await page.waitForTimeout(settleMs);
}

async function inspectCleanFullMotionState(page, scene, profile) {
  return page.evaluate(({ stageName, expectedPath, profileId }) => {
    const stage = document.querySelector(`[data-kx][data-stage-name="${stageName}"]`);
    const visible = (el) => {
      if (!(el instanceof HTMLElement)) return false;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity || '1') > 0
        && rect.width > 1
        && rect.height > 1;
    };
    const visibleDrawers = [...document.querySelectorAll('[data-kdx-drawer]')]
      .filter((el) => visible(el) && el.getAttribute('aria-hidden') !== 'true').length;
    const visibleArtifactPanels = [...document.querySelectorAll('[data-kdx-artifact-panel]')]
      .filter((el) => visible(el)).length;
    const visibleDialogs = [...document.querySelectorAll('[role="dialog"]')]
      .filter((el) => visible(el) && el.getAttribute('aria-hidden') !== 'true').length;

    return {
      profile: profileId,
      pathname: location.pathname,
      expectedPath,
      prefersReducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      stageHeight: stage?.getBoundingClientRect().height ?? 0,
      viewportHeight: innerHeight,
      visibleDrawers,
      visibleArtifactPanels,
      visibleDialogs,
    };
  }, { stageName: scene.stage, expectedPath: scene.path, profileId: profile.id });
}

for (const scene of scenes) {
  for (const profile of profiles) {
    let context;
    let page;
    let rawPath;
    const appOrigin = new URL(baseURL).origin;
    const consoleErrors = [];
    const firstPartyHttpErrors = [];
    const clipFile = `${scene.id}--${profile.id}--full-motion.webm`;

    try {
      context = await browser.newContext({
        viewport: profile.viewport,
        reducedMotion: 'no-preference',
        hasTouch: profile.hasTouch,
        isMobile: profile.hasTouch,
        recordVideo: {
          dir: rawDir,
          size: profile.viewport,
        },
      });

      if (scene.seededJourney) {
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

      await page.goto(`${baseURL}${scene.path}`, { waitUntil: 'networkidle' });
      await waitForAuthorialReady(page, scene);

      const state = await inspectCleanFullMotionState(page, scene, profile);
      assert(state.pathname === scene.path, `${scene.id}/${profile.id}: route drifted to ${state.pathname}`);
      assert(!state.prefersReducedMotion, `${scene.id}/${profile.id}: FULL motion profile unexpectedly resolved reduced motion`);
      assert(state.scrollHeight <= state.clientHeight + 2, `${scene.id}/${profile.id}: page scroll detected`);
      assert(state.scrollWidth <= state.clientWidth + 2, `${scene.id}/${profile.id}: horizontal overflow detected`);
      assert(Math.abs(state.stageHeight - state.viewportHeight) <= 4, `${scene.id}/${profile.id}: stage is not viewport-bounded`);
      assert(state.visibleDrawers === 0, `${scene.id}/${profile.id}: motion evidence contains an open drawer`);
      assert(state.visibleArtifactPanels === 0, `${scene.id}/${profile.id}: motion evidence contains an open artifact panel`);
      assert(state.visibleDialogs === 0, `${scene.id}/${profile.id}: motion evidence contains a visible dialog`);
      assert(consoleErrors.length === 0, `${scene.id}/${profile.id}: console errors before review window: ${JSON.stringify(consoleErrors)}`);
      assert(firstPartyHttpErrors.length === 0, `${scene.id}/${profile.id}: first-party HTTP errors before review window: ${JSON.stringify(firstPartyHttpErrors)}`);

      // No pointer movement, click, keyboard input, hover injection or synthetic
      // state mutation occurs during this window. The last ten seconds of the
      // Playwright video therefore represent autonomous FULL-motion behavior.
      await page.waitForTimeout(recordWindowMs);

      const stateAfter = await inspectCleanFullMotionState(page, scene, profile);
      assert(stateAfter.pathname === scene.path, `${scene.id}/${profile.id}: autonomous window navigated away from the scene`);
      assert(stateAfter.visibleDrawers === 0 && stateAfter.visibleArtifactPanels === 0 && stateAfter.visibleDialogs === 0, `${scene.id}/${profile.id}: autonomous window exposed an overlay`);
      assert(consoleErrors.length === 0, `${scene.id}/${profile.id}: console errors during review window: ${JSON.stringify(consoleErrors)}`);
      assert(firstPartyHttpErrors.length === 0, `${scene.id}/${profile.id}: first-party HTTP errors during review window: ${JSON.stringify(firstPartyHttpErrors)}`);

      const video = page.video();
      assert(video, `${scene.id}/${profile.id}: Playwright video object missing`);
      await context.close();
      context = null;
      rawPath = await video.path();

      const rawDuration = await probeDuration(rawPath);
      const clipPath = `${clipDir}/${clipFile}`;
      const duration = await trimTail(rawPath, clipPath);
      await rm(rawPath, { force: true });
      rawPath = null;

      records.push({
        scene: scene.id,
        stage: scene.stage,
        path: scene.path,
        profile: profile.id,
        stateClass: 'AUTHORIAL_MOTION_STATE',
        motion: 'FULL',
        exactSha,
        file: `clips/${clipFile}`,
        durationSeconds: Number(duration.toFixed(3)),
        rawDurationSeconds: Number(rawDuration.toFixed(3)),
        overlays: 'NONE_VISIBLE',
        interactionBeforeOrDuringCapture: false,
        seededJourney: Boolean(scene.seededJourney),
        status: 'PASS',
      });
    } catch (error) {
      failed = true;
      if (context) await context.close().catch(() => {});
      if (rawPath) await rm(rawPath, { force: true }).catch(() => {});
      records.push({
        scene: scene.id,
        stage: scene.stage,
        path: scene.path,
        profile: profile.id,
        stateClass: 'AUTHORIAL_MOTION_STATE',
        motion: 'FULL',
        exactSha,
        file: `clips/${clipFile}`,
        status: 'FAIL',
        error: error instanceof Error ? error.message : String(error),
        currentUrl: page?.url?.() ?? null,
        consoleErrors,
        firstPartyHttpErrors,
      });
    }
  }
}

await browser.close();
await rm(rawDir, { recursive: true, force: true });

const manifest = {
  schema: 'KODEX_AUTHORIAL_MOTION_EVIDENCE_V1',
  exactSha,
  baseURL,
  truthBoundary: {
    browserPassIsCreatorAcceptance: false,
    motionPresenceIsMotionQuality: false,
    productBehaviorModified: false,
    stateStoreModified: false,
    routeEngineModified: false,
    rendererModified: false,
    protectedOcinOriginalsModified: false,
  },
  captureContract: {
    stateClass: 'AUTHORIAL_MOTION_STATE',
    motion: 'FULL',
    clipTargetSeconds: clipSeconds,
    acceptedDurationSeconds: [8, 12],
    profiles,
    interactionBeforeOrDuringCapture: false,
    qaStateKeptSeparate: true,
    authorialStillStateKeptSeparate: true,
    reviewDimensions: ['AUTONOMOUS_LIFE', 'MOTION_HIERARCHY', 'CINEMATIC_READINESS'],
  },
  counts: {
    expected: scenes.length * profiles.length,
    pass: records.filter((record) => record.status === 'PASS').length,
    fail: records.filter((record) => record.status === 'FAIL').length,
  },
  records,
};

await writeFile(`${outDir}/manifest.json`, JSON.stringify(manifest, null, 2));
for (const record of records) console.log(`${record.status} ${record.scene} ${record.profile}${record.durationSeconds ? ` ${record.durationSeconds}s` : ''}${record.error ? ` — ${record.error}` : ''}`);
if (failed) process.exit(1);
