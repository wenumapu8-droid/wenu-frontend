import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL ?? 'http://127.0.0.1:4321';
const outDir = 'artifacts/kodex-threshold-evidence';
await mkdir(outDir, { recursive: true });

const cases = [
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

for (const profile of cases) {
  const context = await browser.newContext({
    viewport: profile.viewport,
    reducedMotion: profile.reducedMotion,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  try {
    await page.goto(`${baseURL}/kodex/`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-kx][data-stage-name="THRESHOLD"]');

    const geometry = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      stageHeight: document.querySelector('[data-stage-name="THRESHOLD"]')?.getBoundingClientRect().height ?? 0,
      viewportHeight: window.innerHeight,
    }));

    assert(geometry.scrollHeight <= geometry.clientHeight + 2, `${profile.id}: page scroll detected`);
    assert(geometry.scrollWidth <= geometry.clientWidth + 2, `${profile.id}: horizontal overflow detected`);
    assert(Math.abs(geometry.stageHeight - geometry.viewportHeight) <= 4, `${profile.id}: THRESHOLD is not viewport-bounded`);

    const cta = page.locator('.kx-threshold__cta');
    await cta.waitFor({ state: 'visible' });
    assert(await cta.getAttribute('href') === '/kodex/folio/i/', `${profile.id}: CTA does not target folio/i`);
    assert((await cta.textContent())?.trim() === 'ENTER THE KODEX', `${profile.id}: CTA label drifted`);

    const portal = page.locator('[data-kdx-portal]');
    await portal.waitFor({ state: 'attached' });
    await page.waitForFunction(() => {
      const node = document.querySelector('[data-kdx-portal]');
      const state = node?.getAttribute('data-kdx-portal-state');
      return state === 'ready' || state === 'unavailable';
    }, null, { timeout: 8000 });

    const portalState = await portal.getAttribute('data-kdx-portal-state');
    const portalEvidence = await page.evaluate(() => {
      const node = document.querySelector('[data-kdx-portal]');
      const canvas = node?.querySelector('canvas');
      const fallback = node?.querySelector('img');
      return {
        state: node?.getAttribute('data-kdx-portal-state'),
        canvasWidth: canvas instanceof HTMLCanvasElement ? canvas.width : 0,
        canvasHeight: canvas instanceof HTMLCanvasElement ? canvas.height : 0,
        fallbackSrc: fallback instanceof HTMLImageElement ? fallback.currentSrc || fallback.src : '',
      };
    });
    assert(portalState === 'ready' || portalState === 'unavailable', `${profile.id}: portal has no resolved runtime state`);
    if (portalState === 'ready') {
      assert(portalEvidence.canvasWidth > 0 && portalEvidence.canvasHeight > 0, `${profile.id}: ready portal has no painted canvas dimensions`);
    } else {
      assert(Boolean(portalEvidence.fallbackSrc), `${profile.id}: unavailable portal has no fallback artwork`);
    }

    // The current THRESHOLD stage-direction intentionally hides the artifact tab
    // so the portal remains the single dominant object. Do not force-click hidden
    // UI just to satisfy CI. If a future composition makes the control visible,
    // this same gate immediately upgrades to dialog close/focus acceptance.
    const opener = page.locator('[data-kdx-artifact-open]');
    const panel = page.locator('[data-kdx-artifact-panel]');
    const artifactControl = {
      present: (await opener.count()) > 0,
      visible: false,
      dialogStatus: 'NOT_APPLICABLE',
    };
    if (artifactControl.present) {
      artifactControl.visible = await opener.isVisible();
      if (artifactControl.visible) {
        await opener.click();
        await panel.waitFor({ state: 'visible' });
        const close = page.locator('[data-kdx-artifact-close]');
        assert(await close.isVisible(), `${profile.id}: artifact dialog has no visible close control`);
        await close.click();
        await panel.waitFor({ state: 'hidden' });
        assert(await opener.evaluate((node) => document.activeElement === node), `${profile.id}: artifact dialog did not restore focus to opener`);
        artifactControl.dialogStatus = 'PASS';
      } else {
        assert(await panel.isHidden(), `${profile.id}: hidden artifact trigger left dialog exposed`);
      }
    }

    const reduced = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
    assert(reduced === (profile.reducedMotion === 'reduce'), `${profile.id}: reduced-motion emulation mismatch`);

    await page.screenshot({ path: `${outDir}/threshold-${profile.id}.png`, fullPage: true });

    evidence.push({
      profile: profile.id,
      status: 'PASS',
      geometry,
      portal: portalEvidence,
      artifactControl,
      consoleErrors,
    });
  } catch (error) {
    failed = true;
    evidence.push({
      profile: profile.id,
      status: 'FAIL',
      error: error instanceof Error ? error.message : String(error),
      consoleErrors,
    });
    await page.screenshot({ path: `${outDir}/threshold-${profile.id}-FAIL.png`, fullPage: true }).catch(() => {});
  } finally {
    await context.close();
  }
}

await browser.close();
await writeFile(`${outDir}/evidence.json`, JSON.stringify({ baseURL, evidence }, null, 2));

for (const result of evidence) {
  console.log(`${result.status} ${result.profile}${result.error ? ` — ${result.error}` : ''}`);
}

if (failed) process.exit(1);
