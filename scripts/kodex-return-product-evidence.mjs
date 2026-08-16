import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL ?? 'http://127.0.0.1:4321';
const appOrigin = new URL(baseURL).origin;
const outDir = 'artifacts/kodex-return-evidence';
await mkdir(outDir, { recursive: true });

const profiles = [
  { id: 'desktop', viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference', hasTouch: false },
  { id: 'mobile-390', viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference', hasTouch: true },
  { id: 'mobile-412', viewport: { width: 412, height: 915 }, reducedMotion: 'no-preference', hasTouch: true },
  { id: 'reduced-motion', viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', hasTouch: false },
];

const browser = await chromium.launch({ headless: true });
const evidence = [];
let failed = false;

function assert(check, message) {
  if (!check) throw new Error(message);
}

for (const profile of profiles) {
  const context = await browser.newContext({
    viewport: profile.viewport,
    reducedMotion: profile.reducedMotion,
    hasTouch: profile.hasTouch,
    isMobile: profile.hasTouch,
  });
  const page = await context.newPage();
  let consoleErrors = [];
  let httpErrors = [];
  let externalHttpErrors = [];

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
    // Use a deterministic, non-identifying local journey. RETURN must consume
    // the same existing kx-journey store that the corridor writes; no parallel
    // test-only state or fabricated visitor attributes.
    await page.goto(`${baseURL}/kodex/interlude/cosmology-return/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.setItem('kx-journey', JSON.stringify({
        started: 1,
        views: ['/kodex/', '/kodex/folio/i/', '/kodex/folio/ii/', '/kodex/folio/iii/', '/kodex/folio/iv/', '/kodex/folio/v/'],
        effects: ['observe:commit', 'machine:generate'],
        signal: 2,
        cycle: 0,
        last: 1,
      }));
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('[data-kx][data-stage-name="QUIET FRAME"]');

    const interlude = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      stageHeight: document.querySelector('[data-stage-name="QUIET FRAME"]')?.getBoundingClientRect().height ?? 0,
      viewportHeight: innerHeight,
      nextUrl: document.querySelector('[data-stage-name="QUIET FRAME"]')?.getAttribute('data-next-url'),
    }));
    assert(interlude.scrollHeight <= interlude.clientHeight + 2, `${profile.id}: cosmology→return interlude page scroll detected`);
    assert(interlude.scrollWidth <= interlude.clientWidth + 2, `${profile.id}: cosmology→return interlude horizontal overflow detected`);
    assert(Math.abs(interlude.stageHeight - interlude.viewportHeight) <= 4, `${profile.id}: cosmology→return interlude is not viewport-bounded`);
    assert(interlude.nextUrl === '/kodex/folio/vi/', `${profile.id}: interlude does not point to RETURN`);
    assert(consoleErrors.length === 0, `${profile.id}: interlude console errors: ${JSON.stringify(consoleErrors)}`);
    assert(httpErrors.length === 0, `${profile.id}: interlude first-party HTTP errors: ${JSON.stringify(httpErrors)}`);

    const next = page.locator('[data-deck-next]');
    await next.waitFor({ state: 'visible' });
    await next.click({ noWaitAfter: true });
    // The deck engine can replace the document before Playwright's lifecycle
    // observer attaches. Correctness is the destination pathname, not a
    // particular browser lifecycle event; inspect the real location directly.
    await page.waitForFunction(() => window.location.pathname === '/kodex/folio/vi/', null, { timeout: 8000 });
    await page.waitForSelector('[data-kx][data-stage-name="RETURN"]');
    await page.waitForSelector('[data-kdx-return-specimen]');

    // Destination health belongs to RETURN; clear interlude diagnostics after
    // the explicit route boundary so one room cannot fail for another room.
    consoleErrors = [];
    httpErrors = [];
    externalHttpErrors = [];
    await page.waitForTimeout(250);

    const geometry = await page.evaluate(() => {
      const rect = (selector) => {
        const el = document.querySelector(selector);
        if (!(el instanceof Element)) return null;
        const r = el.getBoundingClientRect();
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
      };
      const inside = (r) => !!r && r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1;
      const overlaps = (a, b, tolerance = 2) => !!a && !!b
        && a.left < b.right - tolerance
        && a.right > b.left + tolerance
        && a.top < b.bottom - tolerance
        && a.bottom > b.top + tolerance;
      const stage = document.querySelector('[data-stage-name="RETURN"]');
      const specimenRect = rect('[data-kdx-return-specimen]');
      const artRect = rect('[data-kdx-art]');
      const actionsRect = rect('.kx-return-actions');
      const headlineRect = rect('.kx-os-scene--return .kx-os-stage__copy > h1');
      return {
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        stageHeight: stage?.getBoundingClientRect().height ?? 0,
        viewportHeight: innerHeight,
        specimenRect,
        artRect,
        actionsRect,
        headlineRect,
        specimenInViewport: inside(specimenRect),
        artInViewport: inside(artRect),
        actionsInViewport: inside(actionsRect),
        headlineInViewport: inside(headlineRect),
        headlineActionsOverlap: overlaps(headlineRect, actionsRect),
        headlineArtOverlap: overlaps(headlineRect, artRect),
      };
    });
    assert(geometry.scrollHeight <= geometry.clientHeight + 2, `${profile.id}: RETURN page scroll detected`);
    assert(geometry.scrollWidth <= geometry.clientWidth + 2, `${profile.id}: RETURN horizontal overflow detected`);
    assert(Math.abs(geometry.stageHeight - geometry.viewportHeight) <= 4, `${profile.id}: RETURN is not viewport-bounded`);
    assert(geometry.specimenInViewport, `${profile.id}: journey specimen is clipped outside the first viewport`);
    assert(geometry.artInViewport, `${profile.id}: RETURN artifact is clipped`);
    assert(geometry.actionsInViewport, `${profile.id}: RETURN actions are clipped`);
    assert(geometry.headlineInViewport, `${profile.id}: RETURN headline is clipped`);
    assert(!geometry.headlineActionsOverlap, `${profile.id}: RETURN headline overlaps outbound actions`);
    assert(!geometry.headlineArtOverlap, `${profile.id}: RETURN headline overlaps the material artifact`);

    const specimen = await page.evaluate(() => {
      const panel = document.querySelector('[data-kdx-return-specimen]');
      const body = document.body.textContent ?? '';
      return {
        code: panel?.getAttribute('data-return-code') ?? '',
        memory: Number(panel?.getAttribute('data-return-memory') ?? '0'),
        cycle: Number(panel?.getAttribute('data-return-cycle') ?? '0'),
        label: panel?.querySelector('.kdx-return-memory__copy span')?.textContent?.trim() ?? '',
        markPresent: !!panel?.querySelector('.kdx-return-memory__mark'),
        hasUnsourcedPercentTelemetry: /(?:INTEGRITY|HARMONIC|FREQUENCY|COHERENCE|CONSCIOUSNESS)[^\n%]*\d+(?:\.\d+)?%/i.test(body),
      };
    });
    assert(/^KDX-[A-Z]{3}-C\d{2}-R10-[LR]-[0-9A-F]{6}$/.test(specimen.code), `${profile.id}: RETURN specimen code is missing or malformed`);
    assert(specimen.label === 'JOURNEY SPECIMEN', `${profile.id}: RETURN fell back to curated specimen despite a real journey`);
    assert(specimen.memory > 0 && specimen.cycle >= 1, `${profile.id}: RETURN specimen did not consume journey memory`);
    assert(specimen.markPresent, `${profile.id}: RETURN has metadata but no material specimen mark`);
    assert(!specimen.hasUnsourcedPercentTelemetry, `${profile.id}: unsourced percentage telemetry exposed in RETURN`);

    // Determinism proof: reloading the same trace must not invent a new code.
    const firstCode = specimen.code;
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('[data-kdx-return-specimen]');
    const replayCode = await page.locator('[data-kdx-return-specimen]').getAttribute('data-return-code');
    assert(replayCode === firstCode, `${profile.id}: same journey trace produced a different RETURN specimen`);

    const visual = await page.evaluate(() => {
      const mount = document.querySelector('.kdx-crt-mount[data-preset="return"]');
      const host = mount?.parentElement;
      const canvases = host ? [...host.querySelectorAll('canvas')] : [];
      const source = host?.querySelector('.kx-os-stage__crt-source');
      return {
        mounted: mount?.getAttribute('data-mounted') === '1',
        paintedCanvasCount: canvases.filter((canvas) => canvas.width > 0 && canvas.height > 0).length,
        sourceComplete: source instanceof HTMLImageElement ? source.complete && source.naturalWidth > 0 : false,
      };
    });
    assert(visual.mounted, `${profile.id}: RETURN CRT did not mount`);
    assert(visual.paintedCanvasCount > 0 || visual.sourceComplete, `${profile.id}: RETURN has neither painted CRT nor usable source fallback`);

    const primary = page.locator('.kx-return-actions .kx-os-primary');
    assert(await primary.getAttribute('href') === '/kodex/store/', `${profile.id}: collect action target drifted`);
    const commission = page.locator('[data-kdx-commission-open]');
    const ecosystem = page.locator('[data-kdx-drawer-open="return"]');
    await commission.waitFor({ state: 'visible' });
    await ecosystem.waitFor({ state: 'visible' });
    assert(await commission.evaluate((el) => el.tagName === 'BUTTON'), `${profile.id}: commission action is not a semantic button`);
    assert(await ecosystem.evaluate((el) => el.tagName === 'BUTTON'), `${profile.id}: ecosystem action is not a semantic button`);

    await ecosystem.click();
    const drawer = page.locator('[data-kdx-drawer]');
    await drawer.waitFor({ state: 'visible' });
    assert(await drawer.getAttribute('aria-hidden') === 'false', `${profile.id}: RETURN routes drawer did not open`);
    const routeCount = await page.locator('[data-kdx-drawer-section="return"] .kx-return-routes a').count();
    assert(routeCount >= 5, `${profile.id}: RETURN routes drawer lost ecosystem exits`);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('[data-kdx-drawer]')?.getAttribute('aria-hidden') === 'true');

    const reduced = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
    assert(reduced === (profile.reducedMotion === 'reduce'), `${profile.id}: reduced-motion emulation mismatch`);

    const journey = await page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('kx-journey') || 'null'); } catch { return null; }
    });
    assert(Array.isArray(journey?.views) && journey.views.includes('/kodex/folio/vi/'), `${profile.id}: RETURN visit was not recorded in existing memory`);

    await page.screenshot({ path: `${outDir}/return-${profile.id}.png`, fullPage: true });
    assert(consoleErrors.length === 0, `${profile.id}: RETURN console errors: ${JSON.stringify(consoleErrors)}`);
    assert(httpErrors.length === 0, `${profile.id}: RETURN first-party HTTP errors: ${JSON.stringify(httpErrors)}`);

    evidence.push({
      profile: profile.id,
      status: 'PASS',
      interlude,
      geometry,
      specimen: { ...specimen, replayCode, deterministic: replayCode === firstCode },
      visual,
      actions: { collect: '/kodex/store/', commissionButton: true, ecosystemButton: true, routeCount, escapeClosesDrawer: true },
      memory: { returnVisitRecorded: true, viewCount: journey.views.length },
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
    await page.screenshot({ path: `${outDir}/return-${profile.id}-FAIL.png`, fullPage: true }).catch(() => {});
  } finally {
    await context.close();
  }
}

await browser.close();
await writeFile(`${outDir}/evidence.json`, JSON.stringify({ baseURL, evidence }, null, 2));
for (const result of evidence) console.log(`${result.status} ${result.profile}${result.error ? ` — ${result.error}` : ''}`);
if (failed) process.exit(1);
