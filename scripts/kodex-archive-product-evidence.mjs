import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL ?? 'http://127.0.0.1:4321';
const appOrigin = new URL(baseURL).origin;
const outDir = 'artifacts/kodex-archive-evidence';
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
  const externalHttpErrors = [];
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    // Chromium mirrors HTTP resource failures into console as a URL-less generic
    // error. The response listener below is the authoritative classifier: local
    // application failures block acceptance; third-party failures remain visible
    // evidence without misclassifying ARCHIVE product behavior.
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
    await page.goto(`${baseURL}/kodex/folio/iii/`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-kx][data-stage-name="ARCHIVE"]');

    const geometry = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      stageHeight: document.querySelector('[data-stage-name="ARCHIVE"]')?.getBoundingClientRect().height ?? 0,
      viewportHeight: window.innerHeight,
    }));
    assert(geometry.scrollHeight <= geometry.clientHeight + 2, `${profile.id}: page scroll detected`);
    assert(geometry.scrollWidth <= geometry.clientWidth + 2, `${profile.id}: horizontal overflow detected`);
    assert(Math.abs(geometry.stageHeight - geometry.viewportHeight) <= 4, `${profile.id}: ARCHIVE is not viewport-bounded`);

    const opener = page.locator('[data-kdx-drawer-open="specimen"]');
    await opener.waitFor({ state: 'visible' });
    assert((await opener.textContent())?.trim() === 'OPEN SPECIMEN', `${profile.id}: archive CTA drifted`);

    const composition = await page.evaluate(() => {
      const rect = (selector) => {
        const el = document.querySelector(selector);
        if (!(el instanceof HTMLElement)) return null;
        const r = el.getBoundingClientRect();
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
      };
      const overlaps = (a, b) => !!a && !!b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      const action = document.querySelector('[data-kdx-drawer-open="specimen"]');
      const actionRect = rect('[data-kdx-drawer-open="specimen"]');
      const titleRect = rect('.kx-os-stage__copy > h1');
      const artRect = rect('.kx-os-stage__art');
      const rail = document.querySelector('.kx-os-stage__rail-top');
      const railVisible = rail instanceof HTMLElement && getComputedStyle(rail).display !== 'none' && rail.getBoundingClientRect().height > 0;
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
        railVisible,
        actionInViewport: !!actionRect && actionRect.left >= 0 && actionRect.top >= 0 && actionRect.right <= window.innerWidth && actionRect.bottom <= window.innerHeight,
        titleInViewport: !!titleRect && titleRect.left >= 0 && titleRect.top >= 0 && titleRect.right <= window.innerWidth && titleRect.bottom <= window.innerHeight,
        titleArtOverlap: overlaps(titleRect, artRect),
        actionArtOverlap: overlaps(actionRect, artRect),
        actionHitTarget,
      };
    });
    assert(composition.actionInViewport, `${profile.id}: OPEN SPECIMEN is outside the first viewport`);
    assert(composition.titleInViewport, `${profile.id}: ARCHIVE macro title is clipped`);
    assert(!composition.titleArtOverlap, `${profile.id}: ARCHIVE macro title overlaps the dominant artifact`);
    assert(!composition.actionArtOverlap, `${profile.id}: OPEN SPECIMEN overlaps the dominant artifact`);
    assert(composition.actionHitTarget, `${profile.id}: OPEN SPECIMEN is geometrically covered`);
    if (profile.viewport.width <= 520) {
      assert(!composition.railVisible, `${profile.id}: duplicate ARCHIVE specimen rail is visible in the narrow artifact header`);
    } else {
      assert(composition.railVisible, `${profile.id}: ARCHIVE technical rail disappeared outside the narrow-mobile adaptation`);
    }

    const visual = await page.evaluate(() => {
      const hero = document.querySelector('.kx-archive-hero-specimen');
      const museum = document.querySelector('.kx-os-stage__museo');
      return {
        heroPresent: hero instanceof HTMLImageElement,
        heroComplete: hero instanceof HTMLImageElement ? hero.complete && hero.naturalWidth > 0 && hero.naturalHeight > 0 : false,
        heroNaturalWidth: hero instanceof HTMLImageElement ? hero.naturalWidth : 0,
        heroNaturalHeight: hero instanceof HTMLImageElement ? hero.naturalHeight : 0,
        museumPresent: museum instanceof HTMLElement,
      };
    });
    assert(visual.heroPresent && visual.heroComplete, `${profile.id}: selected archive specimen did not load`);

    const journey = await page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('kx-journey') || 'null'); } catch { return null; }
    });
    assert(Array.isArray(journey?.views) && journey.views.includes('/kodex/folio/iii/'), `${profile.id}: existing memory did not register ARCHIVE visit`);

    await page.screenshot({ path: `${outDir}/archive-${profile.id}.png`, fullPage: true });

    await opener.click();
    const drawer = page.locator('[data-kdx-drawer]');
    await drawer.waitFor({ state: 'visible' });
    assert((await drawer.getAttribute('aria-hidden')) === 'false', `${profile.id}: specimen drawer aria state did not open`);

    const dossier = await page.evaluate(() => {
      const section = document.querySelector('[data-kdx-drawer-section="specimen"]');
      const image = section?.querySelector('img');
      const text = section?.textContent ?? '';
      return {
        sectionVisible: section instanceof HTMLElement && !section.hidden,
        imageComplete: image instanceof HTMLImageElement ? image.complete && image.naturalWidth > 0 && image.naturalHeight > 0 : false,
        hasTitle: text.includes('TITLE'),
        hasTechnique: text.includes('TECHNIQUE'),
        hasProvenance: text.includes('PROVENANCE'),
        hasCode: text.includes('CODE'),
      };
    });
    assert(dossier.sectionVisible, `${profile.id}: specimen dossier section is not visible`);
    assert(dossier.imageComplete, `${profile.id}: complete specimen image did not load in dossier`);
    assert(dossier.hasTitle && dossier.hasTechnique && dossier.hasProvenance && dossier.hasCode, `${profile.id}: dossier metadata contract incomplete`);

    await page.screenshot({ path: `${outDir}/archive-${profile.id}-dossier.png`, fullPage: true });

    await page.locator('[data-kdx-drawer-close]').click();
    await page.waitForFunction(() => document.querySelector('[data-kdx-drawer]')?.hasAttribute('hidden'));
    await page.waitForFunction(() => document.activeElement?.matches?.('[data-kdx-drawer-open="specimen"]'));
    const focusRestored = await page.evaluate(() => document.activeElement?.matches?.('[data-kdx-drawer-open="specimen"]') === true);
    assert(focusRestored, `${profile.id}: focus did not restore to OPEN SPECIMEN`);

    const reduced = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
    assert(reduced === (profile.reducedMotion === 'reduce'), `${profile.id}: reduced-motion emulation mismatch`);

    const nextControl = page.locator('[data-deck-next]');
    await nextControl.waitFor({ state: 'visible' });
    await nextControl.click({ noWaitAfter: true });
    const deadline = Date.now() + 8000;
    while (Date.now() < deadline && new URL(page.url()).pathname !== '/kodex/interlude/archive-machine/') {
      await page.waitForTimeout(100);
    }
    assert(new URL(page.url()).pathname === '/kodex/interlude/archive-machine/', `${profile.id}: explicit NEXT did not reach archive-machine interlude`);

    assert(consoleErrors.length === 0, `${profile.id}: console errors: ${JSON.stringify(consoleErrors)}`);
    assert(httpErrors.length === 0, `${profile.id}: first-party HTTP errors: ${JSON.stringify(httpErrors)}`);

    evidence.push({
      profile: profile.id,
      status: 'PASS',
      geometry,
      composition,
      visual,
      dossier,
      focusRestored,
      memory: { archiveVisitRecorded: true, viewCount: journey.views.length },
      navigation: { explicitNextTarget: new URL(page.url()).pathname, passed: true },
      consoleErrors,
      httpErrors,
      externalHttpErrors,
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
      externalHttpErrors,
    });
    await page.screenshot({ path: `${outDir}/archive-${profile.id}-FAIL.png`, fullPage: true }).catch(() => {});
  } finally {
    await context.close();
  }
}

await browser.close();
await writeFile(`${outDir}/evidence.json`, JSON.stringify({ baseURL, evidence }, null, 2));
for (const result of evidence) console.log(`${result.status} ${result.profile}${result.error ? ` — ${result.error}` : ''}`);
if (failed) process.exit(1);
