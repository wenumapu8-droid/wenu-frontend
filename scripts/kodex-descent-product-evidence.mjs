import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL ?? 'http://127.0.0.1:4321';
const outDir = 'artifacts/kodex-descent-evidence';
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
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) httpErrors.push({ status: response.status(), url: response.url() }); });

  try {
    await page.goto(`${baseURL}/kodex/folio/ii/`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-kx][data-stage-name="DESCENT"]');

    const geometry = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      stageHeight: document.querySelector('[data-stage-name="DESCENT"]')?.getBoundingClientRect().height ?? 0,
      viewportHeight: window.innerHeight,
    }));
    assert(geometry.scrollHeight <= geometry.clientHeight + 2, `${profile.id}: page scroll detected`);
    assert(geometry.scrollWidth <= geometry.clientWidth + 2, `${profile.id}: horizontal overflow detected`);
    assert(Math.abs(geometry.stageHeight - geometry.viewportHeight) <= 4, `${profile.id}: DESCENT is not viewport-bounded`);

    const descend = page.locator('[data-stratum-next]');
    await descend.waitFor({ state: 'visible' });
    assert((await descend.textContent())?.trim() === 'DESCEND', `${profile.id}: local DESCEND label drifted`);

    const composition = await page.evaluate(() => {
      const rect = (selector) => {
        const el = document.querySelector(selector);
        if (!(el instanceof HTMLElement)) return null;
        const r = el.getBoundingClientRect();
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
      };
      const overlaps = (a, b) => !!a && !!b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      const action = document.querySelector('[data-stratum-next]');
      const actionRect = rect('[data-stratum-next]');
      const titleRect = rect('.kx-os-stage__copy > h1');
      const artRect = rect('.kx-os-stage__art');
      let actionHitTarget = false;
      if (action instanceof HTMLElement && actionRect) {
        const x = Math.min(window.innerWidth - 1, Math.max(0, actionRect.left + actionRect.width / 2));
        const y = Math.min(window.innerHeight - 1, Math.max(0, actionRect.top + actionRect.height / 2));
        const hit = document.elementFromPoint(x, y);
        actionHitTarget = !!hit && (hit === action || action.contains(hit));
      }
      return {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        actionRect,
        titleRect,
        artRect,
        actionInViewport: !!actionRect && actionRect.left >= 0 && actionRect.top >= 0 && actionRect.right <= window.innerWidth && actionRect.bottom <= window.innerHeight,
        titleInViewport: !!titleRect && titleRect.left >= 0 && titleRect.top >= 0 && titleRect.right <= window.innerWidth && titleRect.bottom <= window.innerHeight,
        titleArtOverlap: overlaps(titleRect, artRect),
        actionArtOverlap: overlaps(actionRect, artRect),
        actionHitTarget,
      };
    });
    assert(composition.actionInViewport, `${profile.id}: local DESCEND control is outside the first viewport`);
    assert(composition.titleInViewport, `${profile.id}: DESCENT macro title is clipped outside the first viewport`);
    assert(!composition.titleArtOverlap, `${profile.id}: DESCENT macro title overlaps the dominant artifact`);
    assert(!composition.actionArtOverlap, `${profile.id}: local DESCEND control overlaps the dominant artifact`);
    assert(composition.actionHitTarget, `${profile.id}: local DESCEND control is geometrically covered`);

    const crt = page.locator('.kdx-crt-mount[data-preset="descent"]');
    await crt.waitFor({ state: 'attached' });
    await page.waitForFunction(() => document.querySelector('.kdx-crt-mount[data-preset="descent"]')?.getAttribute('data-mounted') === '1');
    const visual = await page.evaluate(() => {
      const mount = document.querySelector('.kdx-crt-mount[data-preset="descent"]');
      const host = mount?.parentElement;
      const canvases = host ? [...host.querySelectorAll('canvas')] : [];
      const source = host?.querySelector('.kx-os-stage__crt-source');
      return {
        mounted: mount?.getAttribute('data-mounted') === '1',
        canvasCount: canvases.length,
        paintedCanvasCount: canvases.filter((canvas) => canvas.width > 0 && canvas.height > 0).length,
        sourcePresent: source instanceof HTMLImageElement,
        sourceComplete: source instanceof HTMLImageElement ? source.complete && source.naturalWidth > 0 : false,
      };
    });
    assert(visual.mounted, `${profile.id}: descent CRT did not mount`);
    assert(visual.paintedCanvasCount > 0 || visual.sourceComplete, `${profile.id}: DESCENT has neither painted CRT canvas nor usable source fallback`);

    const initialLocalState = await page.evaluate(() => ({
      url: location.pathname,
      count: document.querySelector('[data-stratum-count]')?.textContent?.trim() ?? '',
      depth: document.querySelector('[data-stratum-depth]')?.textContent?.trim() ?? '',
      title: document.querySelector('[data-stratum-title]')?.textContent?.trim() ?? '',
    }));
    assert(initialLocalState.url === '/kodex/folio/ii/', `${profile.id}: initial route drifted`);
    assert(/^STRATUM · 01 \/ 11$/.test(initialLocalState.count), `${profile.id}: expected initial stratum 01 / 11, got ${initialLocalState.count}`);

    await descend.click();
    await page.waitForFunction(() => document.querySelector('[data-stratum-count]')?.textContent?.includes('02 / 11'));
    const nextLocalState = await page.evaluate(() => ({
      url: location.pathname,
      count: document.querySelector('[data-stratum-count]')?.textContent?.trim() ?? '',
      depth: document.querySelector('[data-stratum-depth]')?.textContent?.trim() ?? '',
      title: document.querySelector('[data-stratum-title]')?.textContent?.trim() ?? '',
    }));
    assert(nextLocalState.url === '/kodex/folio/ii/', `${profile.id}: local DESCEND action auto-navigated`);
    assert(/^STRATUM · 02 \/ 11$/.test(nextLocalState.count), `${profile.id}: local DESCEND did not reach stratum 02 / 11`);
    assert(nextLocalState.depth !== initialLocalState.depth, `${profile.id}: local DESCEND did not change depth`);
    assert(nextLocalState.title !== initialLocalState.title, `${profile.id}: local DESCEND did not change stratum title`);

    const reduced = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
    assert(reduced === (profile.reducedMotion === 'reduce'), `${profile.id}: reduced-motion emulation mismatch`);

    const journeyBeforeExit = await page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('kx-journey') || 'null'); } catch { return null; }
    });
    assert(Array.isArray(journeyBeforeExit?.views) && journeyBeforeExit.views.includes('/kodex/folio/ii/'), `${profile.id}: existing KODEX memory did not register DESCENT visit`);

    await page.screenshot({ path: `${outDir}/descent-${profile.id}.png`, fullPage: true });

    // User agency boundary: local descent changes the stratum but never exits.
    // Only the shared explicit NEXT control is allowed to advance the corridor.
    const nextControl = page.locator('[data-deck-next]');
    await nextControl.waitFor({ state: 'visible' });
    await nextControl.click({ noWaitAfter: true });
    const deadline = Date.now() + 8000;
    while (Date.now() < deadline && new URL(page.url()).pathname !== '/kodex/folio/iii/') {
      await page.waitForTimeout(100);
    }
    assert(new URL(page.url()).pathname === '/kodex/folio/iii/', `${profile.id}: explicit NEXT did not reach folio/iii`);

    assert(consoleErrors.length === 0, `${profile.id}: console errors: ${JSON.stringify(consoleErrors)}`);
    assert(httpErrors.length === 0, `${profile.id}: HTTP errors: ${JSON.stringify(httpErrors)}`);

    evidence.push({
      profile: profile.id,
      status: 'PASS',
      geometry,
      composition,
      visual,
      localState: { initial: initialLocalState, afterDescend: nextLocalState, stayedOnRoute: true },
      memory: { descentVisitRecorded: true, viewCount: journeyBeforeExit.views.length },
      navigation: { explicitNextTarget: new URL(page.url()).pathname, passed: true },
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
      consoleErrors,
      httpErrors,
    });
    await page.screenshot({ path: `${outDir}/descent-${profile.id}-FAIL.png`, fullPage: true }).catch(() => {});
  } finally {
    await context.close();
  }
}

await browser.close();
await writeFile(`${outDir}/evidence.json`, JSON.stringify({ baseURL, evidence }, null, 2));
for (const result of evidence) console.log(`${result.status} ${result.profile}${result.error ? ` — ${result.error}` : ''}`);
if (failed) process.exit(1);
