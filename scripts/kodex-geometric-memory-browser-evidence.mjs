import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence');
await fs.mkdir(outputDir, { recursive: true });

const profiles = [
  { key: 'desktop', width: 1440, height: 900, reducedMotion: 'no-preference' },
  { key: 'mobile-390', width: 390, height: 844, reducedMotion: 'no-preference', isMobile: true, hasTouch: true },
  { key: 'mobile-412', width: 412, height: 915, reducedMotion: 'no-preference', isMobile: true, hasTouch: true },
  { key: 'reduced', width: 1280, height: 800, reducedMotion: 'reduce' },
];

const scenarios = [
  ['SEED', 'SEED_POINT'],
  ['SPIRAL', 'SPIRAL_DESCENT'],
  ['CONSTELLATION', 'CONSTELLATION'],
  ['ORBIT', 'ORBIT_LOOP'],
  ['WEAVE', 'HYBRID_WEAVE'],
];

const report = { baseURL, generatedAt: new Date().toISOString(), cases: [], errors: [] };
const browser = await chromium.launch({ headless: true });

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const formatError = (error) => String(error?.stack || error?.message || error);

try {
  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport: { width: profile.width, height: profile.height },
      isMobile: profile.isMobile || false,
      hasTouch: profile.hasTouch || false,
      reducedMotion: profile.reducedMotion,
      colorScheme: 'dark',
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(formatError(error)));

    try {
      const url = new URL('/kodex/lab/geometric-memory/', baseURL).toString();
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForLoadState('load', { timeout: 10_000 }).catch(() => {});
      assert((response?.status() || 0) >= 200 && (response?.status() || 0) < 400, `${profile.key}: invalid HTTP status ${response?.status()}`);
      await page.locator('[data-kdx-gmem]').waitFor({ state: 'visible' });

      const scenarioResults = [];
      for (const [preset, expectedTopology] of scenarios) {
        const control = page.locator(`[data-preset="${preset}"]`);
        if (profile.hasTouch) await control.tap();
        else await control.click();
        await page.waitForFunction(
          (expected) => document.querySelector('[data-topology]')?.textContent === expected,
          expectedTopology,
          { timeout: 5_000 },
        );

        const result = await page.evaluate(() => {
          const read = (selector) => document.querySelector(selector)?.textContent?.trim() || '';
          const known = Number(read('[data-known]')) || 0;
          const nodeCount = document.querySelectorAll('[data-memory-nodes] > g').length;
          const edgeCount = document.querySelectorAll('[data-memory-edges] > line').length;
          return {
            topology: read('[data-topology]'),
            signature: read('[data-signature]'),
            known,
            nodeCount,
            edgeCount,
            patterns: read('[data-patterns]'),
            overflow: document.documentElement.scrollWidth - window.innerWidth,
          };
        });

        assert(result.topology === expectedTopology, `${profile.key}/${preset}: ${result.topology} !== ${expectedTopology}`);
        assert(/^KDX-MEM-[A-Z0-9]+$/.test(result.signature), `${profile.key}/${preset}: invalid signature ${result.signature}`);
        assert(result.nodeCount === result.known, `${profile.key}/${preset}: rendered nodes ${result.nodeCount} != known ${result.known}`);
        assert(result.overflow <= 1, `${profile.key}/${preset}: horizontal overflow ${result.overflow}`);
        scenarioResults.push({ preset, ...result });
      }

      assert(pageErrors.length === 0, `${profile.key}: page errors ${pageErrors.join(' | ')}`);
      const file = `geometric-memory-${profile.key}.png`;
      await page.screenshot({ path: path.join(outputDir, file), fullPage: true, animations: 'disabled' });
      report.cases.push({ profile: profile.key, pass: true, screenshot: file, pageErrors, scenarios: scenarioResults });
    } catch (error) {
      const message = `${profile.key}: ${formatError(error)}`;
      report.errors.push(message);
      report.cases.push({ profile: profile.key, pass: false, pageErrors, error: formatError(error) });
      console.error(message);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

await fs.writeFile(path.join(outputDir, 'geometric-memory-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.errors.length) process.exitCode = 1;
