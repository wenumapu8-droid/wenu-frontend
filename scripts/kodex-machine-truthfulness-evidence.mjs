import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outputDir = path.resolve('artifacts/kodex-browser-evidence/machine-truthfulness');
await fs.mkdir(outputDir, { recursive: true });

const profiles = [
  { key: 'desktop-1440', width: 1440, height: 900, reducedMotion: 'no-preference' },
  { key: 'mobile-390', width: 390, height: 844, reducedMotion: 'no-preference', isMobile: true, hasTouch: true },
  { key: 'mobile-412', width: 412, height: 915, reducedMotion: 'no-preference', isMobile: true, hasTouch: true },
  { key: 'reduced', width: 1280, height: 800, reducedMotion: 'reduce' },
];

const browser = await chromium.launch({ headless: true });
const report = { baseURL, generatedAt: new Date().toISOString(), route: '/kodex/folio/iv/', profiles: [], errors: [] };

const overlap = (a, b) => {
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return { width, height, area: width * height };
};

try {
  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport: { width: profile.width, height: profile.height },
      reducedMotion: profile.reducedMotion,
      isMobile: profile.isMobile || false,
      hasTouch: profile.hasTouch || false,
      colorScheme: 'dark',
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(String(error?.stack || error?.message || error)));

    try {
      const response = await page.goto(new URL('/kodex/folio/iv/', baseURL).toString(), { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForLoadState('load', { timeout: 10_000 }).catch(() => {});
      await page.waitForTimeout(profile.reducedMotion === 'reduce' ? 250 : 500);
      const status = response?.status() || 0;

      const facts = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        const machine = document.querySelector('[data-kdx-machine]');
        const sharedReadout = document.querySelector('.kx-readout');
        const sharedSignal = document.querySelector('[data-signal-label]');
        const sharedSignalButton = document.querySelector('[data-signal]');
        const regionSelectors = {
          machine: '[data-kdx-machine]',
          origin: '.kx-os-stage__origen',
          syslog: '.kx-os-stage__syslog',
          nav: '.kx-os-nav',
        };
        const visibleRegions = Object.fromEntries(Object.entries(regionSelectors).flatMap(([key, selector]) => {
          const el = document.querySelector(selector);
          if (!el) return [];
          const style = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          const visible = style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || '1') > 0 && rect.width > 0 && rect.height > 0;
          return visible ? [[key, { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height }]] : [];
        }));
        return {
          bodyText,
          machineText: machine?.textContent || '',
          sharedReadoutText: sharedReadout?.textContent || '',
          sharedReadoutVisible: Boolean(sharedReadout && getComputedStyle(sharedReadout).display !== 'none' && sharedReadout.getClientRects().length),
          sharedSignalText: sharedSignal?.textContent || '',
          sharedSignalVisible: Boolean(sharedSignal && getComputedStyle(sharedSignal).display !== 'none' && sharedSignal.getClientRects().length),
          sharedSignalPressed: sharedSignalButton?.getAttribute('aria-pressed') || '',
          observationSourcePresent: Boolean(document.querySelector('[data-kdx-obs]')),
          width: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          bodyHeight: document.body.scrollHeight,
          viewportHeight: window.innerHeight,
          machinePresent: Boolean(machine),
          visibleRegions,
        };
      });

      const failures = [];
      if (status < 200 || status >= 400) failures.push(`HTTP ${status}`);
      if (!facts.machinePresent) failures.push('MACHINE readout missing from scene contract');
      if (/INTEGRITY\s*[·:]?\s*98\.7\s*%/i.test(facts.bodyText)) failures.push('unsourced INTEGRITY 98.7% still visible');
      if (!/INTEGRITY[\s\S]{0,80}PENDING SOURCE/i.test(facts.machineText)) failures.push('MACHINE readout does not fail closed for INTEGRITY');
      if (/SYSTEM\s*·\s*ACTIVE\s*·\s*\d+(?:\.\d+)?/i.test(facts.bodyText)) failures.push('shared chrome still presents journey progress as SYSTEM ACTIVE telemetry');
      if (!/SIGNAL\s*·\s*LATENT/i.test(facts.sharedSignalText)) failures.push(`shared signal does not reflect fresh master-key state: ${facts.sharedSignalText.trim() || '<empty>'}`);
      if (facts.sharedSignalPressed !== 'false') failures.push(`shared signal fresh aria-pressed is ${facts.sharedSignalPressed || '<missing>'}, expected false`);

      let signalCycle = null;
      if (!profile.isMobile) {
        if (!facts.sharedReadoutVisible) failures.push('shared journey-progress readout missing from spatial frame');
        if (!/JOURNEY\s*·\s*PROGRESS\s*·\s*\d+(?:\.\d+)?%/i.test(facts.sharedReadoutText)) failures.push(`shared chrome does not label data-coord as journey progress: ${facts.sharedReadoutText.trim() || '<empty>'}`);
        if (!facts.sharedSignalVisible) failures.push('shared signal control missing from spatial frame');
        if (facts.sharedSignalVisible) {
          const button = page.locator('[data-signal]');
          await button.click();
          await page.waitForTimeout(30);
          const active = await page.evaluate(() => ({
            text: document.querySelector('[data-signal-label]')?.textContent || '',
            pressed: document.querySelector('[data-signal]')?.getAttribute('aria-pressed') || '',
            stored: sessionStorage.getItem('kx-signal'),
          }));
          if (!/SIGNAL\s*·\s*ACTIVE/i.test(active.text) || active.pressed !== 'true' || active.stored !== '1') failures.push(`shared signal does not become causally ACTIVE: ${JSON.stringify(active)}`);

          await page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
          await page.waitForLoadState('load', { timeout: 10_000 }).catch(() => {});
          await page.waitForTimeout(30);
          const persisted = await page.evaluate(() => ({
            text: document.querySelector('[data-signal-label]')?.textContent || '',
            pressed: document.querySelector('[data-signal]')?.getAttribute('aria-pressed') || '',
            stored: sessionStorage.getItem('kx-signal'),
          }));
          if (!/SIGNAL\s*·\s*ACTIVE/i.test(persisted.text) || persisted.pressed !== 'true' || persisted.stored !== '1') failures.push(`shared signal does not preserve visitor-owned ACTIVE memory across reload: ${JSON.stringify(persisted)}`);

          const reloadedButton = page.locator('[data-signal]');
          await reloadedButton.click();
          await page.waitForTimeout(30);
          const latent = await page.evaluate(() => ({
            text: document.querySelector('[data-signal-label]')?.textContent || '',
            pressed: document.querySelector('[data-signal]')?.getAttribute('aria-pressed') || '',
            stored: sessionStorage.getItem('kx-signal'),
          }));
          if (!/SIGNAL\s*·\s*LATENT/i.test(latent.text) || latent.pressed !== 'false' || latent.stored !== '0') failures.push(`shared signal does not return causally LATENT: ${JSON.stringify(latent)}`);
          signalCycle = { active, persisted, latent };
        }
      }

      const regionOverlaps = [];
      if (profile.isMobile) {
        const pairs = [['machine', 'origin'], ['machine', 'syslog'], ['origin', 'syslog'], ['machine', 'nav'], ['origin', 'nav'], ['syslog', 'nav']];
        for (const [aKey, bKey] of pairs) {
          const a = facts.visibleRegions[aKey];
          const b = facts.visibleRegions[bKey];
          if (!a || !b) continue;
          const hit = overlap(a, b);
          regionOverlaps.push({ a: aKey, b: bKey, ...hit });
          if (hit.width > 4 && hit.height > 4) failures.push(`mobile technical regions overlap: ${aKey} × ${bKey} (${Math.round(hit.width)}×${Math.round(hit.height)}px)`);
        }
      }

      if (facts.observationSourcePresent) failures.push('MACHINE unexpectedly exposes data-kdx-obs; review signal-vs-observation contract');
      if (facts.scrollWidth > profile.width + 3) failures.push(`horizontal overflow ${facts.scrollWidth}px > ${profile.width}px`);
      if (pageErrors.length) failures.push(`pageerror ${pageErrors.join(' | ')}`);

      const screenshot = `machine-${profile.key}.png`;
      await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false, animations: profile.reducedMotion === 'reduce' ? 'allow' : 'disabled' });
      report.profiles.push({
        profile: profile.key,
        status,
        screenshot,
        pass: failures.length === 0,
        failures,
        pageErrors,
        sharedProgressReadoutRequired: !profile.isMobile,
        sharedProgressReadout: facts.sharedReadoutText.trim(),
        sharedSignal: facts.sharedSignalText.trim(),
        sharedSignalVisible: facts.sharedSignalVisible,
        sharedSignalPressed: facts.sharedSignalPressed,
        signalCycle,
        observationSourcePresent: facts.observationSourcePresent,
        visibleRegions: facts.visibleRegions,
        regionOverlaps,
        metrics: { width: facts.width, scrollWidth: facts.scrollWidth, bodyHeight: facts.bodyHeight, viewportHeight: facts.viewportHeight },
      });
      report.errors.push(...failures.map((failure) => `${profile.key}: ${failure}`));
    } catch (error) {
      const message = String(error?.stack || error?.message || error);
      report.profiles.push({ profile: profile.key, pass: false, failures: [message], pageErrors });
      report.errors.push(`${profile.key}: ${message}`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

await fs.writeFile(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.errors.length) process.exitCode = 1;