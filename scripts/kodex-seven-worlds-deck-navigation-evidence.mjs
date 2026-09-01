import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence/seven-worlds-navigation');
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
  contract: 'causal PREVIOUS/NEXT traversal across THRESHOLD → PROLOGUE → DESCENT → ARCHIVE → MACHINE → COSMOLOGY → RETURN',
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

const activeScene = async (page) => page.evaluate(() => (
  document.querySelector('[data-kdx-active-scene]')?.getAttribute('data-kdx-active-scene')
  || document.querySelector('[data-kdx-scene-id]')?.getAttribute('data-kdx-scene-id')
  || null
));

const runTransition = async ({ context, profile, from, to, selector, direction }) => {
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(formatError(error)));
  const record = {
    profile: profile.key,
    direction,
    from: from.label,
    fromHref: from.href,
    to: to.label,
    toHref: to.href,
    selector,
    pageErrors,
  };

  try {
    const response = await page.goto(new URL(from.href, baseURL).toString(), {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    await page.waitForLoadState('load', { timeout: 10_000 }).catch(() => {});
    await page.waitForTimeout(profile.reducedMotion === 'reduce' ? 180 : 420);
    record.startStatus = response?.status() || 0;
    record.startScene = await activeScene(page);

    const control = page.locator(selector).first();
    record.controlCount = await control.count();
    record.visible = record.controlCount ? await control.isVisible() : false;
    record.enabled = record.controlCount ? await control.isEnabled() : false;

    if (record.startStatus < 200 || record.startStatus >= 400) {
      throw new Error(`start HTTP ${record.startStatus}`);
    }
    if (record.startScene !== from.key) {
      throw new Error(`start scene identity ${record.startScene || 'MISSING'} != ${from.key}`);
    }
    if (!record.controlCount || !record.visible || !record.enabled) {
      throw new Error(`${direction} control unavailable`);
    }

    const expectedURL = new URL(to.href, baseURL).toString();
    await Promise.all([
      page.waitForURL((url) => url.pathname === to.href, { timeout: 6_000 }),
      control.click({ timeout: 5_000 }),
    ]);
    await page.waitForLoadState('domcontentloaded', { timeout: 10_000 }).catch(() => {});
    await page.waitForTimeout(profile.reducedMotion === 'reduce' ? 120 : 250);

    record.endHref = page.url();
    record.endPathname = new URL(record.endHref).pathname;
    record.endScene = await activeScene(page);
    record.success = record.endPathname === to.href && record.endScene === to.key && pageErrors.length === 0;

    if (record.endPathname !== to.href) {
      throw new Error(`route drift ${record.endPathname} != ${to.href}`);
    }
    if (record.endScene !== to.key) {
      throw new Error(`destination scene identity ${record.endScene || 'MISSING'} != ${to.key}`);
    }
    if (pageErrors.length) {
      throw new Error(`pageerror ${pageErrors.join(' | ')}`);
    }
  } catch (error) {
    record.success = false;
    record.error = formatError(error);
    fail(`${from.label} ${direction} ${to.label}/${profile.key}: ${record.error}`);
  } finally {
    report.cases.push(record);
    await page.close();
  }
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
      for (let index = 0; index < worlds.length - 1; index += 1) {
        await runTransition({
          context,
          profile,
          from: worlds[index],
          to: worlds[index + 1],
          selector: '[data-deck-next]',
          direction: 'NEXT',
        });
      }

      for (let index = 1; index < worlds.length; index += 1) {
        await runTransition({
          context,
          profile,
          from: worlds[index],
          to: worlds[index - 1],
          selector: '[data-deck-prev]',
          direction: 'PREVIOUS',
        });
      }
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

const expectedCases = profiles.length * (worlds.length - 1) * 2;
if (report.cases.length !== expectedCases) {
  fail(`case coverage mismatch ${report.cases.length}/${expectedCases}`);
}
if (report.cases.some((entry) => entry.success !== true)) {
  fail('one or more causal deck transitions failed');
}

await fs.writeFile(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  contract: report.contract,
  cases: report.cases.length,
  expectedCases,
  errors: report.errors,
}, null, 2));

if (report.errors.length) process.exitCode = 1;
