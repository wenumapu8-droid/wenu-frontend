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
  const context = await browser.newContext({ viewport: profile.viewport, reducedMotion: profile.reducedMotion });
  const page = await context.newPage();
  const consoleErrors = [];
  const httpErrors = [];
  let navigationDiagnostics = null;
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) httpErrors.push({ status: response.status(), url: response.url() }); });

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
      const state = document.querySelector('[data-kdx-portal]')?.getAttribute('data-kdx-portal-state');
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
    if (portalState === 'ready') assert(portalEvidence.canvasWidth > 0 && portalEvidence.canvasHeight > 0, `${profile.id}: ready portal has no painted canvas dimensions`);
    else assert(Boolean(portalEvidence.fallbackSrc), `${profile.id}: unavailable portal has no fallback artwork`);

    const opener = page.locator('[data-kdx-artifact-open]');
    const panel = page.locator('[data-kdx-artifact-panel]');
    const artifactControl = { present: (await opener.count()) > 0, visible: false, dialogStatus: 'NOT_APPLICABLE' };
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
        await page.waitForFunction(() => location.pathname === '/kodex/' && location.hash === '', null, { timeout: 3000 });
        artifactControl.dialogStatus = 'PASS';
      } else {
        assert(await panel.isHidden(), `${profile.id}: hidden artifact trigger left dialog exposed`);
      }
    }

    const reduced = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
    assert(reduced === (profile.reducedMotion === 'reduce'), `${profile.id}: reduced-motion emulation mismatch`);

    const journeyBeforeExit = await page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('kx-journey') || 'null'); } catch { return null; }
    });
    assert(Array.isArray(journeyBeforeExit?.views) && journeyBeforeExit.views.includes('/kodex/'), `${profile.id}: existing KODEX memory did not register the THRESHOLD visit`);

    await page.screenshot({ path: `${outDir}/threshold-${profile.id}.png`, fullPage: true });

    await page.evaluate(() => {
      window.__kdxThresholdNavDiag = { captureDefaultPrevented: null, bubbleDefaultPrevented: null };
      const markCapture = (event) => {
        if (event.target?.closest?.('.kx-threshold__cta')) window.__kdxThresholdNavDiag.captureDefaultPrevented = event.defaultPrevented;
      };
      const markBubble = (event) => {
        if (event.target?.closest?.('.kx-threshold__cta')) window.__kdxThresholdNavDiag.bubbleDefaultPrevented = event.defaultPrevented;
      };
      document.addEventListener('click', markCapture, { capture: true, once: true });
      document.addEventListener('click', markBubble, { once: true });
    });

    await cta.click({ noWaitAfter: true });
    const deadline = Date.now() + 8000;
    while (Date.now() < deadline && new URL(page.url()).pathname !== '/kodex/folio/i/') {
      await page.waitForTimeout(100);
    }
    if (new URL(page.url()).pathname !== '/kodex/folio/i/') {
      navigationDiagnostics = await page.evaluate(() => {
        const ritual = document.querySelector('[data-kdx-ritual]');
        const ctaNode = document.querySelector('.kx-threshold__cta');
        return {
          url: location.href,
          hash: location.hash,
          bodyOverflow: document.body.style.overflow,
          activeElement: document.activeElement?.className ?? document.activeElement?.tagName ?? null,
          ritualActive: ritual?.hasAttribute('data-activo') ?? false,
          ritualPhase: ritual?.getAttribute('data-fase') ?? null,
          ritualDurationCss: getComputedStyle(document.documentElement).getPropertyValue('--kdx-m-state-transition').trim(),
          ritualFunctionPresent: typeof window.__kdxRitual === 'function',
          ctaPointerEvents: ctaNode ? getComputedStyle(ctaNode).pointerEvents : null,
          click: window.__kdxThresholdNavDiag ?? null,
        };
      });
      throw new Error(`${profile.id}: ENTER THE KODEX did not reach folio/i; ${JSON.stringify(navigationDiagnostics)}`);
    }

    const navigation = { target: new URL(page.url()).pathname, passed: true };
    evidence.push({
      profile: profile.id,
      status: 'PASS',
      geometry,
      portal: portalEvidence,
      artifactControl,
      memory: { thresholdVisitRecorded: true, viewCount: journeyBeforeExit.views.length },
      navigation,
      consoleErrors,
      httpErrors,
    });
  } catch (error) {
    failed = true;
    evidence.push({
      profile: profile.id,
      status: 'FAIL',
      error: error instanceof Error ? error.message : String(error),
      currentUrl: page.url(),
      navigationDiagnostics,
      consoleErrors,
      httpErrors,
    });
    await page.screenshot({ path: `${outDir}/threshold-${profile.id}-FAIL.png`, fullPage: true }).catch(() => {});
  } finally {
    await context.close();
  }
}

await browser.close();
await writeFile(`${outDir}/evidence.json`, JSON.stringify({ baseURL, evidence }, null, 2));
for (const result of evidence) console.log(`${result.status} ${result.profile}${result.error ? ` — ${result.error}` : ''}`);
if (failed) process.exit(1);
