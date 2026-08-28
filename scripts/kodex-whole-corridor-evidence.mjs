import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence/whole-corridor');
await fs.mkdir(outputDir, { recursive: true });

const scenes = [
  { id: 'threshold', href: '/kodex/' },
  { id: 'prologue', href: '/kodex/folio/i/' },
  { id: 'descent', href: '/kodex/folio/ii/' },
  { id: 'archive', href: '/kodex/folio/iii/' },
  { id: 'machine', href: '/kodex/folio/iv/' },
  { id: 'cosmology', href: '/kodex/folio/v/' },
  { id: 'return', href: '/kodex/folio/vi/' },
];

const profiles = [
  { key: 'desktop-1440', width: 1440, height: 1000, reducedMotion: 'no-preference' },
  { key: 'mobile-390', width: 390, height: 844, reducedMotion: 'no-preference', isMobile: true, hasTouch: true },
  { key: 'mobile-393', width: 393, height: 852, reducedMotion: 'no-preference', isMobile: true, hasTouch: true },
  { key: 'mobile-430', width: 430, height: 932, reducedMotion: 'no-preference', isMobile: true, hasTouch: true },
  { key: 'reduced-1280', width: 1280, height: 800, reducedMotion: 'reduce' },
];

const browser = await chromium.launch({ headless: true });
const report = {
  baseURL,
  generatedAt: new Date().toISOString(),
  scenes: [],
  errors: [],
  summary: {},
};

async function activateSceneInteraction(page, scene, profile) {
  if (scene.id !== 'cosmology') return null;

  const button = page.locator('[data-cosmo-next]').first();
  await button.waitFor({ state: 'visible', timeout: 5_000 });
  const box = await button.boundingBox();
  if (!box || box.width < 1 || box.height < 1) throw new Error('cosmology CTA has no hit bounds');

  const before = await page.evaluate(() => ({
    focus: document.querySelector('.kdx-cosmo')?.getAttribute('data-focus') || null,
    node: document.querySelector('[data-cosmo-node]')?.textContent?.trim() || null,
    pulseCount: document.querySelectorAll('.kdx-portal.is-pulse').length,
  }));

  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  if (profile.hasTouch) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);

  await page.waitForFunction(() => {
    const focus = document.querySelector('.kdx-cosmo')?.getAttribute('data-focus');
    const pulseCount = document.querySelectorAll('.kdx-portal.is-pulse').length;
    const focusedCount = document.querySelectorAll('.kdx-cosmo__nodes .is-focus').length;
    return Boolean(focus && pulseCount > 0 && focusedCount === 1);
  }, null, { timeout: 3_000 });

  const after = await page.evaluate(() => ({
    focus: document.querySelector('.kdx-cosmo')?.getAttribute('data-focus') || null,
    node: document.querySelector('[data-cosmo-node]')?.textContent?.trim() || null,
    pulseCount: document.querySelectorAll('.kdx-portal.is-pulse').length,
    focusedCount: document.querySelectorAll('.kdx-cosmo__nodes .is-focus').length,
    activeLinks: [...document.querySelectorAll('.kdx-cosmo__links [data-link]')]
      .filter((line) => line.getAttribute('stroke') === '#FF00C8')
      .map((line) => line.getAttribute('data-link')),
  }));

  if (!after.focus || after.pulseCount < 1 || after.focusedCount !== 1) {
    throw new Error(`cosmology CTA did not focus map: ${JSON.stringify(after)}`);
  }

  return { control: 'REVEAL CONNECTION', before, after };
}

async function inspect(page, scene, profile) {
  const url = new URL(scene.href, baseURL).toString();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(String(error?.stack || error?.message || error)));

  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForLoadState('load', { timeout: 10_000 }).catch(() => {});
  await page.waitForTimeout(profile.reducedMotion === 'reduce' ? 240 : 700);

  const metrics = await page.evaluate(({ width, height }) => {
    const viewport = { width, height };
    const root = document.documentElement;
    const h1 = document.querySelector('h1');
    const art = document.querySelector('[data-kdx-art], .kx-threshold__artifact, .kx-prologue-stage__visual');
    const primary = document.querySelector('.kx-os-primary, .kx-threshold__cta, [data-kdx-primary-action]');

    const rectOf = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    };

    const isVisible = (style, rect) =>
      style.display !== 'none'
      && style.visibility !== 'hidden'
      && Number.parseFloat(style.opacity || '1') > 0.02
      && rect.width > 0
      && rect.height > 0
      && rect.right > 0
      && rect.bottom > 0
      && rect.left < viewport.width
      && rect.top < viewport.height;

    const h1Rect = rectOf(h1);
    const artRect = rectOf(art);
    const primaryRect = rectOf(primary);
    const h1Clipped = !!h1Rect && (
      h1Rect.left < -2 || h1Rect.top < -2 || h1Rect.right > width + 2 || h1Rect.bottom > height + 2
    );

    const smallTargets = [...document.querySelectorAll('a,button,[role="button"]')]
      .map((el) => {
        const style = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        if (!isVisible(style, r)) return null;
        if (r.width >= 44 && r.height >= 44) return null;
        return {
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 80),
          width: Math.round(r.width),
          height: Math.round(r.height),
        };
      })
      .filter(Boolean);

    const artViewportShare = artRect
      ? Math.max(0, Math.min(1, (Math.min(artRect.width, width) * Math.min(artRect.height, height)) / (width * height)))
      : null;

    return {
      title: document.title,
      clientWidth: root.clientWidth,
      scrollWidth: root.scrollWidth,
      clientHeight: root.clientHeight,
      scrollHeight: root.scrollHeight,
      h1Rect,
      h1Clipped,
      artRect,
      artViewportShare,
      primaryRect,
      smallTargets,
      activeScene: document.querySelector('[data-kdx-active-scene]')?.getAttribute('data-kdx-active-scene')
        || document.querySelector('[data-stage-name]')?.getAttribute('data-stage-name')
        || document.querySelector('[data-kdx-scene-id]')?.getAttribute('data-kdx-scene-id')
        || null,
    };
  }, { width: profile.width, height: profile.height });

  const failures = [];
  let interaction = null;
  if (!response || response.status() < 200 || response.status() >= 400) failures.push(`HTTP ${response?.status() || 0}`);
  if (metrics.scrollWidth > profile.width + 2) failures.push(`horizontal overflow ${metrics.scrollWidth}px > ${profile.width}px`);
  if (metrics.scrollHeight > profile.height + 2) failures.push(`page-level vertical scroll ${metrics.scrollHeight}px > ${profile.height}px`);
  if (metrics.h1Clipped) failures.push('h1 clipped outside viewport');
  if (pageErrors.length) failures.push(`pageerror ${pageErrors.join(' | ')}`);

  try {
    interaction = await activateSceneInteraction(page, scene, profile);
  } catch (error) {
    failures.push(`interaction ${String(error?.message || error)}`);
  }

  const screenshot = `${scene.id}-${profile.key}.png`;
  await page.screenshot({
    path: path.join(outputDir, screenshot),
    animations: profile.reducedMotion === 'reduce' ? 'allow' : 'disabled',
  });

  return {
    scene: scene.id,
    href: scene.href,
    profile: profile.key,
    status: response?.status() || 0,
    pass: failures.length === 0,
    failures,
    diagnostics: {
      smallTargetCount: metrics.smallTargets.length,
      smallTargets: metrics.smallTargets,
      artViewportShare: metrics.artViewportShare,
      primaryRect: metrics.primaryRect,
      interaction,
    },
    metrics,
    pageErrors,
    screenshot,
  };
}

try {
  for (const scene of scenes) {
    for (const profile of profiles) {
      const context = await browser.newContext({
        viewport: { width: profile.width, height: profile.height },
        isMobile: profile.isMobile || false,
        hasTouch: profile.hasTouch || false,
        reducedMotion: profile.reducedMotion,
        colorScheme: 'dark',
      });
      const page = await context.newPage();
      try {
        const result = await inspect(page, scene, profile);
        report.scenes.push(result);
        if (!result.pass) report.errors.push(`${scene.id}/${profile.key}: ${result.failures.join('; ')}`);
      } catch (error) {
        const message = `${scene.id}/${profile.key}: ${String(error?.stack || error)}`;
        report.errors.push(message);
        report.scenes.push({ scene: scene.id, href: scene.href, profile: profile.key, pass: false, failures: [message], screenshot: null });
      } finally {
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}

const passed = report.scenes.filter((item) => item.pass).length;
report.summary = {
  totalCases: report.scenes.length,
  passed,
  failed: report.scenes.length - passed,
  errorCount: report.errors.length,
  scenes: scenes.length,
  profiles: profiles.length,
};

await fs.writeFile(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.summary, null, 2));
if (report.errors.length) {
  console.error(report.errors.join('\n'));
  process.exitCode = 1;
}