import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL ?? 'http://127.0.0.1:4321';
const outDir = 'artifacts/kodex-authorial-state-evidence';
const exactSha = process.env.KODEX_HEAD_SHA ?? process.env.GITHUB_SHA ?? 'LOCAL_UNBOUND';
await mkdir(outDir, { recursive: true });

const profiles = [
  { id: 'desktop-1440x900', viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference', hasTouch: false },
  { id: 'mobile-390x844', viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference', hasTouch: true },
  { id: 'mobile-412x915', viewport: { width: 412, height: 915 }, reducedMotion: 'no-preference', hasTouch: true },
  { id: 'reduced-1440x900', viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', hasTouch: false },
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

  // Let fonts, canvas and authored idle systems settle without triggering any
  // interaction. AUTHORIAL_STATE is the clean resting/hero composition, not a
  // drawer/modal/test state and not a synthetic engagement state.
  await page.waitForTimeout(900);
}

async function authorialGeometry(page, scene, profile) {
  return page.evaluate(({ stageName, profileId }) => {
    const stage = document.querySelector(`[data-kx][data-stage-name="${stageName}"]`);
    const visible = (el) => {
      if (!(el instanceof HTMLElement)) return false;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || '1') > 0 && rect.width > 1 && rect.height > 1;
    };
    const visibleDrawers = [...document.querySelectorAll('[data-kdx-drawer]')].filter((el) => visible(el) && el.getAttribute('aria-hidden') !== 'true').length;
    const visibleArtifactPanels = [...document.querySelectorAll('[data-kdx-artifact-panel]')].filter((el) => visible(el)).length;
    const visibleDialogs = [...document.querySelectorAll('[role="dialog"]')].filter((el) => visible(el) && el.getAttribute('aria-hidden') !== 'true').length;
    return {
      profile: profileId,
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      stageHeight: stage?.getBoundingClientRect().height ?? 0,
      viewportHeight: innerHeight,
      viewportWidth: innerWidth,
      visibleDrawers,
      visibleArtifactPanels,
      visibleDialogs,
      pathname: location.pathname,
    };
  }, { stageName: scene.stage, profileId: profile.id });
}

for (const scene of scenes) {
  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport: profile.viewport,
      reducedMotion: profile.reducedMotion,
      hasTouch: profile.hasTouch,
      isMobile: profile.hasTouch,
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

    const page = await context.newPage();
    const consoleErrors = [];
    const firstPartyHttpErrors = [];
    const appOrigin = new URL(baseURL).origin;

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

    try {
      await page.goto(`${baseURL}${scene.path}`, { waitUntil: 'networkidle' });
      await waitForAuthorialReady(page, scene);

      const geometry = await authorialGeometry(page, scene, profile);
      assert(geometry.pathname === scene.path, `${scene.id}/${profile.id}: route drifted to ${geometry.pathname}`);
      assert(geometry.scrollHeight <= geometry.clientHeight + 2, `${scene.id}/${profile.id}: page scroll detected`);
      assert(geometry.scrollWidth <= geometry.clientWidth + 2, `${scene.id}/${profile.id}: horizontal overflow detected`);
      assert(Math.abs(geometry.stageHeight - geometry.viewportHeight) <= 4, `${scene.id}/${profile.id}: stage is not viewport-bounded`);
      assert(geometry.visibleDrawers === 0, `${scene.id}/${profile.id}: AUTHORIAL_STATE contains an open drawer`);
      assert(geometry.visibleArtifactPanels === 0, `${scene.id}/${profile.id}: AUTHORIAL_STATE contains an open artifact panel`);
      assert(geometry.visibleDialogs === 0, `${scene.id}/${profile.id}: AUTHORIAL_STATE contains a visible dialog`);
      assert(consoleErrors.length === 0, `${scene.id}/${profile.id}: console errors: ${JSON.stringify(consoleErrors)}`);
      assert(firstPartyHttpErrors.length === 0, `${scene.id}/${profile.id}: first-party HTTP errors: ${JSON.stringify(firstPartyHttpErrors)}`);

      const file = `${scene.id}--${profile.id}--authorial.png`;
      await page.screenshot({ path: `${outDir}/${file}`, fullPage: true });
      records.push({
        scene: scene.id,
        stage: scene.stage,
        path: scene.path,
        profile: profile.id,
        stateClass: 'AUTHORIAL_STATE',
        motion: profile.reducedMotion === 'reduce' ? 'REDUCED' : 'FULL_STILL',
        exactSha,
        file,
        geometry,
        overlays: 'NONE_VISIBLE',
        interactionBeforeCapture: false,
        seededJourney: Boolean(scene.seededJourney),
        status: 'PASS',
      });
    } catch (error) {
      failed = true;
      const file = `${scene.id}--${profile.id}--authorial-FAIL.png`;
      await page.screenshot({ path: `${outDir}/${file}`, fullPage: true }).catch(() => {});
      records.push({
        scene: scene.id,
        stage: scene.stage,
        path: scene.path,
        profile: profile.id,
        stateClass: 'AUTHORIAL_STATE',
        exactSha,
        file,
        status: 'FAIL',
        error: error instanceof Error ? error.message : String(error),
        currentUrl: page.url(),
        consoleErrors,
        firstPartyHttpErrors,
      });
    } finally {
      await context.close();
    }
  }
}

await browser.close();

const manifest = {
  schema: 'KODEX_AUTHORIAL_STATE_EVIDENCE_V1',
  exactSha,
  baseURL,
  truthBoundary: {
    browserPassIsCreatorAcceptance: false,
    productBehaviorModified: false,
    stateStoreModified: false,
    routeEngineModified: false,
    rendererModified: false,
    protectedOcinOriginalsModified: false,
  },
  captureContract: {
    stateClass: 'AUTHORIAL_STATE',
    profiles: profiles.map(({ id, viewport, reducedMotion }) => ({ id, viewport, reducedMotion })),
    interactionBeforeCapture: false,
    qaStateKeptSeparate: true,
    motionClips: 'NOT_RUN_IN_V1_STILL_HARNESS',
  },
  counts: {
    expected: scenes.length * profiles.length,
    pass: records.filter((record) => record.status === 'PASS').length,
    fail: records.filter((record) => record.status === 'FAIL').length,
  },
  records,
};

await writeFile(`${outDir}/manifest.json`, JSON.stringify(manifest, null, 2));
for (const record of records) console.log(`${record.status} ${record.scene} ${record.profile}${record.error ? ` — ${record.error}` : ''}`);
if (failed) process.exit(1);
