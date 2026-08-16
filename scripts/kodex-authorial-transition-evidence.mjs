import { mkdir, writeFile, rm, readdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { chromium } from 'playwright';
import sharp from 'sharp';

const execFileAsync = promisify(execFile);
const baseURL = process.env.KODEX_PREVIEW_URL ?? 'http://127.0.0.1:4321';
const exactSha = process.env.KODEX_HEAD_SHA ?? process.env.GITHUB_SHA ?? 'LOCAL_UNBOUND';
const outDir = 'artifacts/kodex-authorial-transition-evidence';
const rawDir = `${outDir}/raw`;
const clipDir = `${outDir}/clips`;
const stillDir = `${outDir}/stills`;
const scanDir = `${outDir}/scan`;
const clipSeconds = 12;
const sourceHoldMs = 1800;
const targetHoldMs = 3000;
const scanFps = 4;
const signatureWidth = 160;
const signatureHeight = 100;
const likenessMargin = 0.8;
await mkdir(rawDir, { recursive: true });
await mkdir(clipDir, { recursive: true });
await mkdir(stillDir, { recursive: true });
await mkdir(scanDir, { recursive: true });

const profiles = [
  { id: 'desktop-1440x900', viewport: { width: 1440, height: 900 }, hasTouch: false },
  { id: 'mobile-390x844', viewport: { width: 390, height: 844 }, hasTouch: true },
];

const transitions = [
  { id: '00-threshold-to-prologue', sourcePath: '/kodex/', sourceStage: 'THRESHOLD', trigger: '.kx-threshold__cta', targetPath: '/kodex/folio/i/', targetStage: 'PROLOGUE', targetReady: 'prologue' },
  { id: '01-prologue-to-descent', sourcePath: '/kodex/folio/i/', sourceStage: 'PROLOGUE', trigger: '.kx-os-stage__actions .kx-os-primary', targetPath: '/kodex/folio/ii/', targetStage: 'DESCENT', targetReady: 'descent' },
  { id: '02-descent-to-archive', sourcePath: '/kodex/folio/ii/', sourceStage: 'DESCENT', trigger: '[data-deck-next]', targetPath: '/kodex/folio/iii/', targetStage: 'ARCHIVE', targetReady: 'archive' },
  { id: '03-archive-to-quiet', sourcePath: '/kodex/folio/iii/', sourceStage: 'ARCHIVE', trigger: '[data-deck-next]', targetPath: '/kodex/interlude/archive-machine/', targetStage: 'QUIET FRAME' },
  { id: '04-quiet-to-machine', sourcePath: '/kodex/interlude/archive-machine/', sourceStage: 'QUIET FRAME', trigger: '[data-deck-next]', targetPath: '/kodex/folio/iv/', targetStage: 'MACHINE', targetReady: 'machine' },
  { id: '05-machine-to-cosmology', sourcePath: '/kodex/folio/iv/', sourceStage: 'MACHINE', trigger: '[data-deck-next]', targetPath: '/kodex/folio/v/', targetStage: 'COSMOLOGY', targetReady: 'cosmology' },
  { id: '06-cosmology-to-quiet', sourcePath: '/kodex/folio/v/', sourceStage: 'COSMOLOGY', trigger: '[data-deck-next]', targetPath: '/kodex/interlude/cosmology-return/', targetStage: 'QUIET FRAME' },
  { id: '07-quiet-to-return', sourcePath: '/kodex/interlude/cosmology-return/', sourceStage: 'QUIET FRAME', trigger: '[data-deck-next]', targetPath: '/kodex/folio/vi/', targetStage: 'RETURN', targetReady: 'return', seededJourney: true },
];

function assert(check, message) {
  if (!check) throw new Error(message);
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

async function probeDuration(path) {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    path,
  ]);
  return Number.parseFloat(stdout.trim());
}

async function visualSignature(path) {
  const { data } = await sharp(path)
    .resize(signatureWidth, signatureHeight, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return data;
}

function meanAbsoluteDifference(a, b) {
  assert(a.length === b.length, 'Visual signatures have different lengths');
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
}

async function locateVisualCrossing(rawPath, sourceStillPath, targetStillPath, scanKey) {
  const dir = `${scanDir}/${scanKey}`;
  await mkdir(dir, { recursive: true });
  await execFileAsync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-i', rawPath,
    '-vf', `fps=${scanFps}`,
    '-q:v', '5',
    `${dir}/%04d.jpg`,
  ]);

  const source = await visualSignature(sourceStillPath);
  const target = await visualSignature(targetStillPath);
  const files = (await readdir(dir)).filter((name) => name.endsWith('.jpg')).sort();
  assert(files.length >= scanFps * 4, `${scanKey}: not enough encoded frames to locate a crossing`);

  const series = [];
  for (let i = 0; i < files.length; i += 1) {
    const sig = await visualSignature(`${dir}/${files[i]}`);
    const sourceDistance = meanAbsoluteDifference(sig, source);
    const targetDistance = meanAbsoluteDifference(sig, target);
    series.push({
      index: i,
      time: i / scanFps,
      sourceDistance,
      targetDistance,
      sourceLike: sourceDistance <= targetDistance * likenessMargin,
      targetLike: targetDistance <= sourceDistance * likenessMargin,
    });
  }

  // A usable authorial-transition clip needs positive evidence of BOTH rooms.
  // Find a stable source run first, then the first stable target run after it.
  // This rejects the failure mode discovered in V2 where a clip was perfectly
  // valid video but began after the visible crossing.
  let sourceRunEnd = -1;
  for (let i = 0; i <= series.length - 3; i += 1) {
    if (series.slice(i, i + 3).every((frame) => frame.sourceLike)) {
      sourceRunEnd = i + 2;
      break;
    }
  }
  assert(sourceRunEnd >= 0, `${scanKey}: encoded video has no stable source-state evidence`);

  let targetRunStart = -1;
  for (let i = sourceRunEnd + 1; i <= series.length - 3; i += 1) {
    if (series.slice(i, i + 3).every((frame) => frame.targetLike)) {
      targetRunStart = i;
      break;
    }
  }
  assert(targetRunStart >= 0, `${scanKey}: encoded video has no stable target-state evidence after source state`);

  const crossingTime = series[targetRunStart].time;
  return {
    crossingTime,
    sourceRunEndTime: series[sourceRunEnd].time,
    targetRunStartTime: crossingTime,
    sourceEvidenceFrames: series.filter((frame) => frame.sourceLike).length,
    targetEvidenceFrames: series.filter((frame) => frame.targetLike).length,
    scannedFrames: series.length,
  };
}

async function extractCenteredWindow(rawPath, outputPath, crossingTime) {
  const rawDuration = await probeDuration(rawPath);
  assert(Number.isFinite(rawDuration), `Unable to probe raw transition video ${rawPath}`);
  assert(rawDuration >= 8, `Raw transition video ${rawDuration.toFixed(3)}s is too short for the 8–12s review contract`);
  const wanted = Math.min(clipSeconds, rawDuration);
  const maxStart = Math.max(0, rawDuration - wanted);
  // Aim for two seconds of stable source before the target becomes the closer
  // visual state. If the event is near an edge, preserve the full legal clip
  // and let eventInClipSeconds expose its actual position for review.
  const start = clamp(crossingTime - 2, 0, maxStart);

  await execFileAsync('ffmpeg', [
    '-y',
    '-ss', start.toFixed(3),
    '-i', rawPath,
    '-t', wanted.toFixed(3),
    '-map', '0:v:0',
    '-an',
    '-c:v', 'libvpx-vp9',
    '-deadline', 'realtime',
    '-cpu-used', '6',
    '-row-mt', '1',
    '-crf', '32',
    '-b:v', '0',
    outputPath,
  ]);

  const duration = await probeDuration(outputPath);
  assert(Number.isFinite(duration), `Unable to probe ${outputPath}`);
  assert(duration >= 8 && duration <= 12.05, `Transition clip ${duration.toFixed(3)}s outside 8–12s review contract`);
  const eventInClipSeconds = crossingTime - start;
  assert(eventInClipSeconds >= 0.75, `Visual crossing occurs too close to clip start (${eventInClipSeconds.toFixed(3)}s)`);
  assert(eventInClipSeconds <= duration - 0.75, `Visual crossing occurs too close to clip end (${eventInClipSeconds.toFixed(3)}s)`);
  return { duration, rawDuration, start, eventInClipSeconds };
}

async function waitStage(page, stage) {
  await page.waitForSelector(`[data-kx][data-stage-name="${stage}"]`, { timeout: 10000 });
  await page.evaluate(() => document.fonts?.ready);
}

async function waitTargetReady(page, kind) {
  if (!kind) return;
  if (kind === 'prologue') {
    await page.waitForSelector('.kdx-crt-mount[data-preset="observe"]');
    await page.waitForFunction(() => document.querySelector('.kdx-crt-mount[data-preset="observe"]')?.getAttribute('data-mounted') === '1', null, { timeout: 8000 });
  }
  if (kind === 'descent') {
    await page.waitForSelector('.kdx-crt-mount[data-preset="descent"]');
    await page.waitForFunction(() => document.querySelector('.kdx-crt-mount[data-preset="descent"]')?.getAttribute('data-mounted') === '1', null, { timeout: 8000 });
  }
  if (kind === 'archive') {
    await page.waitForFunction(() => {
      const image = document.querySelector('.kx-archive-hero-specimen');
      return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
    }, null, { timeout: 8000 });
  }
  if (kind === 'machine') {
    await page.waitForFunction(() => document.querySelector('[data-machine-state]')?.textContent?.trim() === 'READY', null, { timeout: 8000 });
  }
  if (kind === 'cosmology') {
    await page.waitForSelector('.kdx-cosmo__svg');
  }
  if (kind === 'return') {
    await page.waitForSelector('[data-kdx-return-specimen]');
    await page.waitForFunction(() => document.querySelector('.kdx-crt-mount[data-preset="return"]')?.getAttribute('data-mounted') === '1', null, { timeout: 8000 });
  }
}

const browser = await chromium.launch({ headless: true });
const records = [];
let failed = false;

for (const transition of transitions) {
  for (const profile of profiles) {
    let context;
    let page;
    let rawPath;
    const consoleErrors = [];
    const firstPartyHttpErrors = [];
    const appOrigin = new URL(baseURL).origin;
    const clipFile = `${transition.id}--${profile.id}--transition.webm`;
    const sourceStill = `${transition.id}--${profile.id}--source.png`;
    const targetStill = `${transition.id}--${profile.id}--target.png`;
    const scanKey = `${transition.id}--${profile.id}`;

    try {
      context = await browser.newContext({
        viewport: profile.viewport,
        reducedMotion: 'no-preference',
        hasTouch: profile.hasTouch,
        isMobile: profile.hasTouch,
        recordVideo: { dir: rawDir, size: profile.viewport },
      });

      if (transition.seededJourney) {
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

      await page.goto(`${baseURL}${transition.sourcePath}`, { waitUntil: 'networkidle' });
      await waitStage(page, transition.sourceStage);
      const sourcePath = await page.evaluate(() => location.pathname);
      assert(sourcePath === transition.sourcePath, `${transition.id}/${profile.id}: source route drifted to ${sourcePath}`);
      assert(!(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)), `${transition.id}/${profile.id}: FULL motion unexpectedly reduced`);
      const trigger = page.locator(transition.trigger).first();
      await trigger.waitFor({ state: 'visible', timeout: 8000 });
      await page.waitForTimeout(sourceHoldMs);
      await page.screenshot({ path: `${stillDir}/${sourceStill}`, fullPage: true });

      const triggerWallClockMs = Date.now();
      await trigger.click({ noWaitAfter: true });
      await page.waitForFunction((target) => location.pathname === target, transition.targetPath, { timeout: 10000 });
      await waitStage(page, transition.targetStage);
      await waitTargetReady(page, transition.targetReady);
      const targetPath = await page.evaluate(() => location.pathname);
      assert(targetPath === transition.targetPath, `${transition.id}/${profile.id}: target route drifted to ${targetPath}`);
      const targetReadyWallClockMs = Date.now();
      await page.waitForTimeout(targetHoldMs);
      await page.screenshot({ path: `${stillDir}/${targetStill}`, fullPage: true });

      assert(consoleErrors.length === 0, `${transition.id}/${profile.id}: console errors ${JSON.stringify(consoleErrors)}`);
      assert(firstPartyHttpErrors.length === 0, `${transition.id}/${profile.id}: first-party HTTP errors ${JSON.stringify(firstPartyHttpErrors)}`);

      const video = page.video();
      assert(video, `${transition.id}/${profile.id}: video missing`);
      await context.close();
      context = null;
      rawPath = await video.path();

      const crossing = await locateVisualCrossing(
        rawPath,
        `${stillDir}/${sourceStill}`,
        `${stillDir}/${targetStill}`,
        scanKey,
      );
      const clipPath = `${clipDir}/${clipFile}`;
      const clip = await extractCenteredWindow(rawPath, clipPath, crossing.crossingTime);
      await rm(rawPath, { force: true });
      rawPath = null;

      records.push({
        transition: transition.id,
        profile: profile.id,
        stateClass: 'AUTHORIAL_TRANSITION_STATE',
        motion: 'FULL',
        exactSha,
        sourcePath: transition.sourcePath,
        targetPath: transition.targetPath,
        sourceStage: transition.sourceStage,
        targetStage: transition.targetStage,
        file: `clips/${clipFile}`,
        sourceStill: `stills/${sourceStill}`,
        targetStill: `stills/${targetStill}`,
        durationSeconds: Number(clip.duration.toFixed(3)),
        rawDurationSeconds: Number(clip.rawDuration.toFixed(3)),
        trimStartSeconds: Number(clip.start.toFixed(3)),
        visualCrossingSecondsRaw: Number(crossing.crossingTime.toFixed(3)),
        visualCrossingSecondsClip: Number(clip.eventInClipSeconds.toFixed(3)),
        sourceEvidenceFrames: crossing.sourceEvidenceFrames,
        targetEvidenceFrames: crossing.targetEvidenceFrames,
        scannedFrames: crossing.scannedFrames,
        scanFps,
        likenessMargin,
        windowStrategy: 'SOURCE_TARGET_VISUAL_CROSSING',
        wallClockNavigationSeconds: Number(((targetReadyWallClockMs - triggerWallClockMs) / 1000).toFixed(3)),
        interaction: 'INTENTIONAL_ROUTE_TRIGGER',
        seededJourney: Boolean(transition.seededJourney),
        status: 'PASS',
      });
    } catch (error) {
      failed = true;
      if (context) await context.close().catch(() => {});
      if (rawPath) await rm(rawPath, { force: true }).catch(() => {});
      records.push({
        transition: transition.id,
        profile: profile.id,
        stateClass: 'AUTHORIAL_TRANSITION_STATE',
        motion: 'FULL',
        exactSha,
        sourcePath: transition.sourcePath,
        targetPath: transition.targetPath,
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
await rm(scanDir, { recursive: true, force: true });

const manifest = {
  schema: 'KODEX_AUTHORIAL_TRANSITION_EVIDENCE_V3',
  exactSha,
  baseURL,
  truthBoundary: {
    browserPassIsCreatorAcceptance: false,
    transitionPresenceIsTransitionQuality: false,
    visualSimilarityIsAestheticScore: false,
    interactionIsIntentionalEvidenceInput: true,
    productBehaviorModified: false,
    stateStoreModified: false,
    routeEngineModified: false,
    rendererModified: false,
    protectedOcinOriginalsModified: false,
  },
  captureContract: {
    stateClass: 'AUTHORIAL_TRANSITION_STATE',
    motion: 'FULL',
    clipTargetSeconds: clipSeconds,
    acceptedDurationSeconds: [8, 12.05],
    profiles,
    sourceHoldMs,
    targetHoldMs,
    input: 'ONE_EXPLICIT_ROUTE_TRIGGER_PER_BOUNDARY',
    windowStrategy: 'SOURCE_TARGET_VISUAL_CROSSING',
    visualCrossing: {
      scanFps,
      signature: `${signatureWidth}x${signatureHeight}_GRAYSCALE_MAD`,
      likenessMargin,
      stableRunFrames: 3,
    },
    browserWallClockNotUsedForVideoTrim: true,
    sourceAndTargetStillsIncluded: true,
    authorialIdleMotionKeptSeparate: true,
    qaStateKeptSeparate: true,
    reviewDimension: 'CINEMATIC_TRANSITION',
  },
  counts: {
    expected: transitions.length * profiles.length,
    pass: records.filter((record) => record.status === 'PASS').length,
    fail: records.filter((record) => record.status === 'FAIL').length,
  },
  records,
};

await writeFile(`${outDir}/manifest.json`, JSON.stringify(manifest, null, 2));
for (const record of records) console.log(`${record.status} ${record.transition} ${record.profile}${record.durationSeconds ? ` ${record.durationSeconds}s` : ''}${record.error ? ` — ${record.error}` : ''}`);
if (failed) process.exit(1);
