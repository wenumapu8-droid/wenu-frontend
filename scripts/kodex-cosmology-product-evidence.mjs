import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL ?? 'http://127.0.0.1:4321';
const appOrigin = new URL(baseURL).origin;
const outDir = 'artifacts/kodex-cosmology-evidence';
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
    await page.goto(`${baseURL}/kodex/folio/v/`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-kx][data-stage-name="COSMOLOGY"]');
    await page.waitForSelector('.kdx-cosmo__svg');

    const geometry = await page.evaluate(() => {
      const stage = document.querySelector('[data-stage-name="COSMOLOGY"]');
      const rect = (selector) => {
        const el = document.querySelector(selector);
        if (!(el instanceof Element)) return null;
        const r = el.getBoundingClientRect();
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
      };
      const inside = (r) => !!r && r.left >= -1 && r.top >= -1 && r.right <= window.innerWidth + 1 && r.bottom <= window.innerHeight + 1;
      const svgRect = rect('.kdx-cosmo__svg');
      const fallbackRect = rect('.kdx-cosmo__concept-list');
      const readoutRect = rect('[data-kdx-cosmos]');
      const actionRect = rect('[data-cosmo-next]');
      const portalsRect = rect('.kdx-cosmo__portals');
      const fallback = document.querySelector('.kdx-cosmo__concept-list');
      const fallbackVisible = fallback instanceof HTMLElement && getComputedStyle(fallback).display !== 'none' && fallbackRect?.width > 1 && fallbackRect?.height > 1;
      return {
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        stageHeight: stage?.getBoundingClientRect().height ?? 0,
        viewportHeight: window.innerHeight,
        svgRect,
        fallbackRect,
        readoutRect,
        actionRect,
        portalsRect,
        svgInViewport: inside(svgRect),
        fallbackInViewport: inside(fallbackRect),
        fallbackVisible,
        actionInViewport: inside(actionRect),
        readoutInViewport: inside(readoutRect),
      };
    });

    assert(geometry.scrollHeight <= geometry.clientHeight + 2, `${profile.id}: page scroll detected`);
    assert(geometry.scrollWidth <= geometry.clientWidth + 2, `${profile.id}: horizontal overflow detected`);
    assert(Math.abs(geometry.stageHeight - geometry.viewportHeight) <= 4, `${profile.id}: COSMOLOGY is not viewport-bounded`);
    if (profile.hasTouch) {
      assert(geometry.fallbackVisible && geometry.fallbackInViewport, `${profile.id}: compact concept fallback is not visible inside the first viewport`);
    } else {
      assert(geometry.svgInViewport && (geometry.svgRect?.width ?? 0) > 100, `${profile.id}: orbital map is clipped outside the first viewport`);
    }
    assert(geometry.actionInViewport, `${profile.id}: REVEAL CONNECTION is outside the first viewport`);
    assert(geometry.readoutInViewport, `${profile.id}: cosmology relation readout is clipped`);

    const structure = await page.evaluate(() => {
      const nodes = [...document.querySelectorAll('.kdx-cosmo__nodes [data-node]')];
      const fallbackNodes = [...document.querySelectorAll('.kdx-cosmo__concept-list [data-node]')];
      const portals = [...document.querySelectorAll('.kdx-cosmo__portals [data-organ]')];
      const svg = document.querySelector('.kdx-cosmo__svg');
      const body = document.body.textContent ?? '';
      return {
        nodeCount: nodes.length,
        nodeNames: nodes.map((node) => node.getAttribute('data-node')),
        fallbackCount: fallbackNodes.length,
        fallbackNames: fallbackNodes.map((node) => node.getAttribute('data-node')),
        portalCount: portals.length,
        svgRole: svg?.getAttribute('role'),
        svgTitle: svg?.querySelector('title')?.textContent?.trim() ?? '',
        semantics: nodes.map((node) => ({
          node: node.getAttribute('data-node'),
          role: node.getAttribute('role'),
          tabindex: node.getAttribute('tabindex'),
          ariaLabel: node.getAttribute('aria-label'),
        })),
        hasUnsourcedPercentTelemetry: /(?:INTEGRITY|HARMONIC|FREQUENCY|COHERENCE|CONSCIOUSNESS)[^\n%]*\d+(?:\.\d+)?%/i.test(body),
      };
    });

    assert(structure.nodeCount === 6, `${profile.id}: expected 6 canonical concept nodes, found ${structure.nodeCount}`);
    assert(structure.fallbackCount === 6, `${profile.id}: expected 6 fallback concept controls, found ${structure.fallbackCount}`);
    assert(JSON.stringify(structure.nodeNames) === JSON.stringify(structure.fallbackNames), `${profile.id}: mobile fallback does not preserve canonical concept ordering`);
    assert(structure.portalCount === 5, `${profile.id}: expected 5 ecosystem portals, found ${structure.portalCount}`);
    assert(structure.svgRole === 'img' && structure.svgTitle.length > 0, `${profile.id}: orbital map lacks a semantic image title`);
    assert(!structure.hasUnsourcedPercentTelemetry, `${profile.id}: unsourced percentage telemetry exposed in COSMOLOGY`);

    const revealButton = page.locator('[data-cosmo-next]');
    const readoutBefore = await page.locator('[data-cosmo-node]').textContent();
    await revealButton.click();
    const readoutAfter = await page.locator('[data-cosmo-node]').textContent();
    assert(readoutAfter && readoutAfter !== readoutBefore, `${profile.id}: REVEAL CONNECTION did not change the visible relation readout`);

    const svgSignalNode = page.locator('.kdx-cosmo__nodes [data-node="signal"]');
    const fallbackSignalNode = page.locator('.kdx-cosmo__concept-list [data-node="signal"]');
    const readSignalMachineRelation = () => page.evaluate(() => {
      const target = document.querySelector('.kdx-cosmo__nodes [data-node="machine"]');
      const compactTarget = document.querySelector('.kdx-cosmo__concept-list [data-node="machine"]');
      const link = document.querySelector('.kdx-cosmo__links [data-link="signal-machine"]');
      return {
        machineRelated: target?.classList.contains('is-related') ?? false,
        compactMachineRelated: compactTarget?.classList.contains('is-related') ?? false,
        linkHighlighted: link?.getAttribute('stroke') === '#FF00C8',
      };
    });

    let pointerRelation = { required: !profile.hasTouch, attempted: false, machineRelated: false, linkHighlighted: false };
    if (!profile.hasTouch) {
      await svgSignalNode.hover({ force: true });
      const relation = await readSignalMachineRelation();
      pointerRelation = { required: true, attempted: true, ...relation };
      assert(relation.machineRelated && relation.linkHighlighted, `${profile.id}: pointer activation did not reveal canonical SIGNAL→MACHINE relation`);
      await page.mouse.move(1, 1);
    }

    const keyboardSemantics = structure.semantics.every((node) => node.tabindex === '0' && node.role === 'button' && !!node.ariaLabel);
    assert(keyboardSemantics, `${profile.id}: orbital concept nodes are not semantic keyboard controls`);
    let keyboardRelation = { required: !profile.hasTouch, attempted: false, machineRelated: false, linkHighlighted: false };
    if (!profile.hasTouch) {
      await svgSignalNode.focus();
      await svgSignalNode.press('Enter');
      const relation = await readSignalMachineRelation();
      keyboardRelation = { required: true, attempted: true, ...relation };
      assert(relation.machineRelated && relation.linkHighlighted, `${profile.id}: keyboard activation did not reveal canonical SIGNAL→MACHINE relation`);
    }

    let touchRelation = { required: profile.hasTouch, attempted: false, machineRelated: false, compactMachineRelated: false, linkHighlighted: false };
    if (profile.hasTouch) {
      await fallbackSignalNode.tap();
      const relation = await readSignalMachineRelation();
      touchRelation = { required: true, attempted: true, ...relation };
      assert(relation.machineRelated && relation.compactMachineRelated && relation.linkHighlighted, `${profile.id}: touch activation did not reveal canonical SIGNAL→MACHINE relation`);
    }

    const reduced = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
    assert(reduced === (profile.reducedMotion === 'reduce'), `${profile.id}: reduced-motion emulation mismatch`);

    const journey = await page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('kx-journey') || 'null'); } catch { return null; }
    });
    assert(Array.isArray(journey?.views) && journey.views.includes('/kodex/folio/v/'), `${profile.id}: COSMOLOGY visit memory missing`);

    await page.screenshot({ path: `${outDir}/cosmology-${profile.id}.png`, fullPage: true });

    const next = page.locator('[data-deck-next]');
    await next.waitFor({ state: 'visible' });
    await next.click({ noWaitAfter: true });
    await page.waitForURL((url) => url.pathname === '/kodex/interlude/cosmology-return/', { timeout: 8000 });

    assert(consoleErrors.length === 0, `${profile.id}: console errors: ${JSON.stringify(consoleErrors)}`);
    assert(httpErrors.length === 0, `${profile.id}: first-party HTTP errors: ${JSON.stringify(httpErrors)}`);

    evidence.push({
      profile: profile.id,
      status: 'PASS',
      geometry,
      structure,
      readout: { before: readoutBefore?.trim(), after: readoutAfter?.trim(), changed: true },
      pointerRelation,
      keyboardRelation,
      touchRelation,
      memory: { cosmologyVisitRecorded: true, viewCount: journey.views.length },
      navigation: '/kodex/interlude/cosmology-return/',
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
    await page.screenshot({ path: `${outDir}/cosmology-${profile.id}-FAIL.png`, fullPage: true }).catch(() => {});
  } finally {
    await context.close();
  }
}

await browser.close();
await writeFile(`${outDir}/evidence.json`, JSON.stringify({ baseURL, evidence }, null, 2));
for (const result of evidence) console.log(`${result.status} ${result.profile}${result.error ? ` — ${result.error}` : ''}`);
if (failed) process.exit(1);
