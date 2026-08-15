import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL ?? 'http://127.0.0.1:4321';
const outDir = 'artifacts/kodex-prologue-evidence';
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
    await page.goto(`${baseURL}/kodex/folio/i/`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-kx][data-stage-name="PROLOGUE"]');

    const geometry = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      stageHeight: document.querySelector('[data-stage-name="PROLOGUE"]')?.getBoundingClientRect().height ?? 0,
      viewportHeight: window.innerHeight,
    }));
    assert(geometry.scrollHeight <= geometry.clientHeight + 2, `${profile.id}: page scroll detected`);
    assert(geometry.scrollWidth <= geometry.clientWidth + 2, `${profile.id}: horizontal overflow detected`);
    assert(Math.abs(geometry.stageHeight - geometry.viewportHeight) <= 4, `${profile.id}: PROLOGUE is not viewport-bounded`);

    const cta = page.locator('.kx-os-stage__actions .kx-os-primary');
    await cta.waitFor({ state: 'visible' });
    assert(await cta.getAttribute('href') === '/kodex/folio/ii/', `${profile.id}: CTA does not target folio/ii`);
    assert((await cta.textContent())?.trim() === 'BEGIN OBSERVATION', `${profile.id}: CTA label drifted`);

    // Playwright "visible" only means the element has a rendered box. Product
    // acceptance also requires that the primary action and title actually live
    // inside the first viewport and are not geometrically covered by the art or
    // another layer. This closes the blind spot found by screenshot review.
    const composition = await page.evaluate(() => {
      const rect = (selector) => {
        const el = document.querySelector(selector);
        if (!(el instanceof HTMLElement)) return null;
        const r = el.getBoundingClientRect();
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
      };
      const overlaps = (a, b) => !!a && !!b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      const ctaEl = document.querySelector('.kx-os-stage__actions .kx-os-primary');
      const ctaRect = rect('.kx-os-stage__actions .kx-os-primary');
      const titleRect = rect('.kx-os-stage__copy h1');
      const artRect = rect('.kx-os-stage__art');
      let hitTarget = false;
      if (ctaEl instanceof HTMLElement && ctaRect) {
        const x = Math.min(window.innerWidth - 1, Math.max(0, ctaRect.left + ctaRect.width / 2));
        const y = Math.min(window.innerHeight - 1, Math.max(0, ctaRect.top + ctaRect.height / 2));
        const hit = document.elementFromPoint(x, y);
        hitTarget = !!hit && (hit === ctaEl || ctaEl.contains(hit));
      }
      return {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        ctaRect,
        titleRect,
        artRect,
        ctaInViewport: !!ctaRect && ctaRect.left >= 0 && ctaRect.top >= 0 && ctaRect.right <= window.innerWidth && ctaRect.bottom <= window.innerHeight,
        titleInViewport: !!titleRect && titleRect.left >= 0 && titleRect.top >= 0 && titleRect.right <= window.innerWidth && titleRect.bottom <= window.innerHeight,
        titleArtOverlap: overlaps(titleRect, artRect),
        ctaArtOverlap: overlaps(ctaRect, artRect),
        ctaHitTarget: hitTarget,
      };
    });
    assert(composition.ctaInViewport, `${profile.id}: primary CTA is rendered but not fully inside the first viewport`);
    assert(composition.titleInViewport, `${profile.id}: macro title is clipped outside the first viewport`);
    assert(!composition.titleArtOverlap, `${profile.id}: macro title overlaps the dominant artifact`);
    assert(!composition.ctaArtOverlap, `${profile.id}: primary CTA overlaps the dominant artifact`);
    assert(composition.ctaHitTarget, `${profile.id}: primary CTA is geometrically covered by another layer`);

    const crt = page.locator('.kdx-crt-mount[data-preset="observe"]');
    await crt.waitFor({ state: 'attached' });
    await page.waitForFunction(() => document.querySelector('.kdx-crt-mount[data-preset="observe"]')?.getAttribute('data-mounted') === '1');
    const visual = await page.evaluate(() => {
      const mount = document.querySelector('.kdx-crt-mount[data-preset="observe"]');
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
    assert(visual.mounted, `${profile.id}: observe CRT did not mount`);
    assert(visual.paintedCanvasCount > 0 || visual.sourceComplete, `${profile.id}: PROLOGUE has neither painted CRT canvas nor usable source fallback`);

    const opener = page.locator('[data-kdx-drawer-open="protocol"]');
    await opener.waitFor({ state: 'visible' });
    await opener.focus();
    await opener.click();
    const drawer = page.locator('[data-kdx-drawer]');
    await drawer.waitFor({ state: 'visible' });
    assert(await drawer.getAttribute('aria-hidden') === 'false', `${profile.id}: protocol drawer aria state did not open`);
    const close = page.locator('[data-kdx-drawer-close]');
    await close.waitFor({ state: 'visible' });
    await close.click();
    // closeDrawer flips the accessibility state synchronously, then applies
    // `hidden` after its 220ms visual transition. Assert both. The longer wait
    // is scheduling tolerance for loaded CI runners, not a relaxation of the
    // semantic close contract.
    await page.waitForFunction(() => document.querySelector('[data-kdx-drawer]')?.getAttribute('aria-hidden') === 'true', null, { timeout: 1000 });
    await page.waitForFunction(() => document.querySelector('[data-kdx-drawer]')?.hasAttribute('hidden'), null, { timeout: 4000 });
    assert(await opener.evaluate((node) => document.activeElement === node), `${profile.id}: protocol drawer did not restore focus to opener`);

    const reduced = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
    assert(reduced === (profile.reducedMotion === 'reduce'), `${profile.id}: reduced-motion emulation mismatch`);

    const journeyBeforeExit = await page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('kx-journey') || 'null'); } catch { return null; }
    });
    assert(Array.isArray(journeyBeforeExit?.views) && journeyBeforeExit.views.includes('/kodex/folio/i/'), `${profile.id}: existing KODEX memory did not register the PROLOGUE visit`);

    await page.screenshot({ path: `${outDir}/prologue-${profile.id}.png`, fullPage: true });

    await cta.click({ noWaitAfter: true });
    const deadline = Date.now() + 8000;
    while (Date.now() < deadline && new URL(page.url()).pathname !== '/kodex/folio/ii/') {
      await page.waitForTimeout(100);
    }
    assert(new URL(page.url()).pathname === '/kodex/folio/ii/', `${profile.id}: BEGIN OBSERVATION did not reach folio/ii`);

    assert(consoleErrors.length === 0, `${profile.id}: console errors: ${JSON.stringify(consoleErrors)}`);
    assert(httpErrors.length === 0, `${profile.id}: HTTP errors: ${JSON.stringify(httpErrors)}`);

    evidence.push({
      profile: profile.id,
      status: 'PASS',
      geometry,
      composition,
      visual,
      protocolDrawer: { openClose: true, semanticCloseImmediate: true, focusRestored: true },
      memory: { prologueVisitRecorded: true, viewCount: journeyBeforeExit.views.length },
      navigation: { target: new URL(page.url()).pathname, passed: true },
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
    await page.screenshot({ path: `${outDir}/prologue-${profile.id}-FAIL.png`, fullPage: true }).catch(() => {});
  } finally {
    await context.close();
  }
}

await browser.close();
await writeFile(`${outDir}/evidence.json`, JSON.stringify({ baseURL, evidence }, null, 2));
for (const result of evidence) console.log(`${result.status} ${result.profile}${result.error ? ` — ${result.error}` : ''}`);
if (failed) process.exit(1);
