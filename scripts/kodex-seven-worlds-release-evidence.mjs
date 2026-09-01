import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence/seven-worlds');
await fs.mkdir(outputDir, { recursive: true });

const worlds = Object.freeze([
  { key: 'threshold', label: 'THRESHOLD', href: '/kodex/' },
  { key: 'prologue', label: 'PROLOGUE', href: '/kodex/folio/i/' },
  { key: 'descent', label: 'DESCENT', href: '/kodex/folio/ii/' },
  { key: 'archive', label: 'ARCHIVE', href: '/kodex/folio/iii/' },
  { key: 'machine', label: 'MACHINE', href: '/kodex/folio/iv/' },
  { key: 'cosmology', label: 'COSMOLOGY', href: '/kodex/folio/v/' },
  { key: 'return', label: 'RETURN', href: '/kodex/folio/vi/' },
]);

const profiles = Object.freeze([
  { key: 'desktop-1440', width: 1440, height: 900, reducedMotion: 'no-preference' },
  { key: 'mobile-390', width: 390, height: 844, reducedMotion: 'no-preference', isMobile: true, hasTouch: true },
  { key: 'mobile-412', width: 412, height: 915, reducedMotion: 'no-preference', isMobile: true, hasTouch: true },
  { key: 'reduced-1280', width: 1280, height: 800, reducedMotion: 'reduce' },
]);

const browser = await chromium.launch({ headless: true });
const report = {
  contract: 'THRESHOLD → PROLOGUE → DESCENT → ARCHIVE → MACHINE → COSMOLOGY → RETURN',
  generatedAt: new Date().toISOString(),
  baseURL,
  cases: [],
  errors: [],
};

const formatError = (error) => String(error?.stack || error?.message || error);
const fail = (message) => {
  report.errors.push(message);
  console.error(message);
};

try {
  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport: { width: profile.width, height: profile.height },
      isMobile: profile.isMobile || false,
      hasTouch: profile.hasTouch || false,
      reducedMotion: profile.reducedMotion,
      colorScheme: 'dark',
    });

    try {
      for (const [index, world] of worlds.entries()) {
        const page = await context.newPage();
        const pageErrors = [];
        page.on('pageerror', (error) => pageErrors.push(formatError(error)));

        try {
          const target = new URL(world.href, baseURL).toString();
          const response = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30_000 });
          await page.waitForLoadState('load', { timeout: 10_000 }).catch(() => {});
          await page.waitForTimeout(profile.reducedMotion === 'reduce' ? 180 : 420);

          const status = response?.status() || 0;
          const metrics = await page.evaluate(() => {
            const checksum = document.querySelector('.kdx-micro-cluster__foot span:last-child');
            const rect = (selector) => {
              const el = document.querySelector(selector);
              if (!el) return null;
              const r = el.getBoundingClientRect();
              const style = getComputedStyle(el);
              return {
                x: r.x,
                y: r.y,
                width: r.width,
                height: r.height,
                top: r.top,
                right: r.right,
                bottom: r.bottom,
                left: r.left,
                display: style.display,
                visibility: style.visibility,
                opacity: Number(style.opacity || 1),
              };
            };
            return {
              pathname: window.location.pathname,
              innerWidth: window.innerWidth,
              innerHeight: window.innerHeight,
              scrollWidth: document.documentElement.scrollWidth,
              scrollHeight: document.documentElement.scrollHeight,
              bodyScrollHeight: document.body.scrollHeight,
              activeScene: document.querySelector('[data-kdx-active-scene]')?.getAttribute('data-kdx-active-scene')
                || document.querySelector('[data-kdx-scene-id]')?.getAttribute('data-kdx-scene-id')
                || null,
              microClusterChecksum: checksum?.textContent?.trim() || null,
              microClusterChecksumSource: checksum?.getAttribute('data-fuente') || null,
              controls: {
                deckbar: rect('.kx-deckbar'),
                previous: rect('[data-deck-prev]'),
                next: rect('[data-deck-next]'),
                index: rect('.kx-deckbar [data-kdx-index-open]'),
              },
            };
          });

          const horizontalOverflow = metrics.scrollWidth - metrics.innerWidth;
          const verticalOverflow = Math.max(metrics.scrollHeight, metrics.bodyScrollHeight) - metrics.innerHeight;
          const controlFailures = [];
          const controlEntries = Object.entries(metrics.controls || {});
          for (const [controlName, box] of controlEntries) {
            if (!box) {
              controlFailures.push(`${controlName}: missing`);
              continue;
            }
            if (box.display === 'none' || box.visibility === 'hidden' || box.opacity <= 0) {
              controlFailures.push(`${controlName}: not visible`);
            }
            const clipped = box.left < -1 || box.top < -1 || box.right > metrics.innerWidth + 1 || box.bottom > metrics.innerHeight + 1;
            if (clipped) {
              controlFailures.push(`${controlName}: clipped (${Math.round(box.left)},${Math.round(box.top)} → ${Math.round(box.right)},${Math.round(box.bottom)})`);
            }
            if (profile.isMobile && controlName !== 'deckbar' && (box.width < 44 || box.height < 44)) {
              controlFailures.push(`${controlName}: touch target ${Math.round(box.width)}×${Math.round(box.height)} < 44×44`);
            }
          }

          if (status < 200 || status >= 400) fail(`${world.label}/${profile.key}: HTTP ${status}`);
          if (metrics.pathname !== world.href) fail(`${world.label}/${profile.key}: route drift ${metrics.pathname} != ${world.href}`);
          if (metrics.activeScene !== world.key) fail(`${world.label}/${profile.key}: scene identity drift ${metrics.activeScene || 'MISSING'} != ${world.key}`);
          if (horizontalOverflow > 3) fail(`${world.label}/${profile.key}: horizontal overflow ${horizontalOverflow}px`);
          if (verticalOverflow > 3) fail(`${world.label}/${profile.key}: fullscreen/no-scroll contract overflow ${verticalOverflow}px`);
          if (pageErrors.length) fail(`${world.label}/${profile.key}: pageerror ${pageErrors.join(' | ')}`);
          if (controlFailures.length) fail(`${world.label}/${profile.key}: deck controls ${controlFailures.join(' | ')}`);
          if (world.key === 'archive') {
            if (!metrics.microClusterChecksum?.includes('PENDING SOURCE')) {
              fail(`${world.label}/${profile.key}: micro-cluster checksum must fail closed without a verified producer`);
            }
            if (!metrics.microClusterChecksumSource) {
              fail(`${world.label}/${profile.key}: micro-cluster checksum provenance marker missing`);
            }
          }

          const screenshot = `${String(index + 1).padStart(2, '0')}-${world.key}-${profile.key}.png`;
          await page.screenshot({
            path: path.join(outputDir, screenshot),
            fullPage: false,
            animations: profile.reducedMotion === 'reduce' ? 'allow' : 'disabled',
          });

          report.cases.push({
            order: index + 1,
            world: world.label,
            href: world.href,
            profile: profile.key,
            status,
            activeScene: metrics.activeScene,
            horizontalOverflow,
            verticalOverflow,
            pageErrors,
            controls: metrics.controls,
            controlFailures,
            microClusterChecksum: metrics.microClusterChecksum,
            microClusterChecksumSource: metrics.microClusterChecksumSource,
            screenshot,
          });
        } catch (error) {
          fail(`${world.label}/${profile.key}: ${formatError(error)}`);
          report.cases.push({
            order: index + 1,
            world: world.label,
            href: world.href,
            profile: profile.key,
            error: formatError(error),
          });
        } finally {
          await page.close();
        }
      }
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

const expectedCases = worlds.length * profiles.length;
if (report.cases.length !== expectedCases) {
  fail(`case coverage mismatch ${report.cases.length}/${expectedCases}`);
}

await fs.writeFile(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  contract: report.contract,
  cases: report.cases.length,
  expectedCases,
  errors: report.errors,
}, null, 2));

if (report.errors.length) process.exitCode = 1;
