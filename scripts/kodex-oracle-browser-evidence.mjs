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

const THRESHOLD_LINE = 'You crossed the threshold. The archive has registered that decision.';
const PROLOGUE_LINE = 'Do not watch the eye. Watch what changes when you approach it.';
const seedMemory = JSON.stringify({ views: ['/kodex/', '/kodex/folio/i/'], effects: ['proof-seed'], cycle: 0 });
const report = { baseURL, generatedAt: new Date().toISOString(), cases: [], muteCase: null, errors: [] };
const browser = await chromium.launch({ headless: true });

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const formatError = (error) => String(error?.stack || error?.message || error);

const installEvidenceHooks = async (context) => {
  await context.addInitScript((memory) => {
    localStorage.setItem('kx-journey', memory);
    window.__oracleEvidence = { cues: [], getUserMediaCalls: 0 };
    window.addEventListener('kdx:oracle-cue', (event) => {
      window.__oracleEvidence.cues.push(event.detail);
    });
    if (navigator.mediaDevices) {
      try {
        const original = navigator.mediaDevices.getUserMedia?.bind(navigator.mediaDevices);
        Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
          configurable: true,
          value: (...args) => {
            window.__oracleEvidence.getUserMediaCalls += 1;
            return original ? original(...args) : Promise.reject(new Error('getUserMedia unavailable'));
          },
        });
      } catch {}
    }
  }, seedMemory);
};

const snapshot = async (page) => page.evaluate(() => {
  const root = document.querySelector('[data-oracle-lab]');
  const read = (selector) => document.querySelector(selector)?.textContent?.trim() || '';
  const energy = Number.parseFloat(getComputedStyle(root).getPropertyValue('--oracle-energy')) || 0;
  return {
    scene: root?.getAttribute('data-scene') || '',
    state: root?.getAttribute('data-oracle-state') || '',
    audioStatus: root?.getAttribute('data-audio-status') || '',
    caption: read('[data-caption]'),
    evidence: read('[data-evidence]'),
    energy,
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    overflowY: document.documentElement.scrollHeight - window.innerHeight,
    memory: localStorage.getItem('kx-journey'),
    hooks: window.__oracleEvidence || { cues: [], getUserMediaCalls: -1 },
  };
});

try {
  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport: { width: profile.width, height: profile.height },
      isMobile: profile.isMobile || false,
      hasTouch: profile.hasTouch || false,
      reducedMotion: profile.reducedMotion,
      colorScheme: 'dark',
    });
    await installEvidenceHooks(context);
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(formatError(error)));

    try {
      const url = new URL('/kodex/lab/oracle-presence-v0/', baseURL).toString();
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      assert((response?.status() || 0) >= 200 && (response?.status() || 0) < 400, `${profile.key}: HTTP ${response?.status()}`);
      await page.locator('[data-oracle-lab]').waitFor({ state: 'visible' });

      const initial = await snapshot(page);
      assert(initial.state === 'DORMANT', `${profile.key}: initial state ${initial.state}`);
      assert(initial.scene === 'threshold', `${profile.key}: initial scene ${initial.scene}`);
      assert(initial.caption === '', `${profile.key}: speech occurred before entry`);
      assert(initial.evidence.includes('2 RECORDED VIEWS · READ ONLY'), `${profile.key}: route evidence count missing`);
      assert(initial.memory === seedMemory, `${profile.key}: memory changed before interaction`);
      assert(initial.overflowX <= 1, `${profile.key}: initial horizontal overflow ${initial.overflowX}`);

      const enter = page.locator('[data-enter]');
      if (profile.hasTouch) await enter.tap();
      else await enter.click();

      await page.waitForFunction(() => document.querySelector('[data-oracle-lab]')?.getAttribute('data-oracle-state') === 'ADDRESS', null, { timeout: 5_000 });
      await page.waitForFunction(() => {
        const root = document.querySelector('[data-oracle-lab]');
        return (Number.parseFloat(getComputedStyle(root).getPropertyValue('--oracle-energy')) || 0) > 0.005;
      }, null, { timeout: 5_000 });
      await page.waitForFunction((line) => document.querySelector('[data-caption]')?.textContent?.trim() === line, THRESHOLD_LINE, { timeout: 7_000 });

      const addressed = await snapshot(page);
      assert(addressed.scene === 'prologue', `${profile.key}: scene did not advance to proof PROLOGUE`);
      assert(addressed.state === 'ADDRESS', `${profile.key}: first cue state ${addressed.state}`);
      assert(addressed.memory === seedMemory, `${profile.key}: Oracle mutated journey memory during ADDRESS`);
      assert(addressed.hooks.getUserMediaCalls === 0, `${profile.key}: microphone API was called`);

      await page.waitForFunction(() => document.querySelector('[data-oracle-lab]')?.getAttribute('data-oracle-state') === 'REVEAL', null, { timeout: 9_000 });
      await page.waitForFunction((line) => document.querySelector('[data-caption]')?.textContent?.trim() === line, PROLOGUE_LINE, { timeout: 7_000 });

      const revealed = await snapshot(page);
      assert(revealed.memory === seedMemory, `${profile.key}: Oracle mutated journey memory during REVEAL`);
      assert(revealed.hooks.getUserMediaCalls === 0, `${profile.key}: microphone API was called`);
      assert(revealed.hooks.cues.length === 2, `${profile.key}: expected 2 cue events, saw ${revealed.hooks.cues.length}`);
      assert(revealed.hooks.cues[0]?.id === 'KDX_ORACLE_THRESHOLD_001', `${profile.key}: wrong first cue`);
      assert(revealed.hooks.cues[1]?.id === 'KDX_ORACLE_PROLOGUE_001', `${profile.key}: wrong second cue`);
      assert(revealed.hooks.cues.every((cue) => cue.epistemicStatus === 'OBSERVED_EVENT'), `${profile.key}: unbounded epistemic cue`);
      assert(revealed.overflowX <= 1, `${profile.key}: horizontal overflow ${revealed.overflowX}`);
      assert(revealed.overflowY <= 1, `${profile.key}: vertical overflow ${revealed.overflowY}`);
      assert(pageErrors.length === 0, `${profile.key}: page errors ${pageErrors.join(' | ')}`);

      const file = `oracle-presence-${profile.key}.png`;
      await page.screenshot({ path: path.join(outputDir, file), fullPage: true, animations: 'disabled' });
      report.cases.push({ profile: profile.key, pass: true, screenshot: file, initial, addressed, revealed, pageErrors });
    } catch (error) {
      const message = `${profile.key}: ${formatError(error)}`;
      report.errors.push(message);
      report.cases.push({ profile: profile.key, pass: false, error: formatError(error), pageErrors });
      console.error(message);
    } finally {
      await context.close();
    }
  }

  // Dedicated mute contract: captions and causal state must survive muted audio.
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'no-preference', colorScheme: 'dark' });
  await installEvidenceHooks(context);
  const page = await context.newPage();
  try {
    await page.goto(new URL('/kodex/lab/oracle-presence-v0/', baseURL).toString(), { waitUntil: 'domcontentloaded', timeout: 30_000 });
    const mute = page.locator('[data-mute]');
    await mute.click();
    assert(await mute.getAttribute('aria-pressed') === 'true', 'mute: aria state did not enable');
    await page.locator('[data-enter]').click();
    await page.waitForFunction((line) => document.querySelector('[data-caption]')?.textContent?.trim() === line, THRESHOLD_LINE, { timeout: 7_000 });
    const muted = await snapshot(page);
    assert(muted.state === 'ADDRESS', `mute: state ${muted.state}`);
    assert(muted.audioStatus === 'MUTED', `mute: audio status ${muted.audioStatus}`);
    assert(muted.memory === seedMemory, 'mute: Oracle mutated journey memory');
    assert(muted.hooks.getUserMediaCalls === 0, 'mute: microphone API was called');
    const file = 'oracle-presence-muted.png';
    await page.screenshot({ path: path.join(outputDir, file), fullPage: true, animations: 'disabled' });
    report.muteCase = { pass: true, screenshot: file, muted };
  } catch (error) {
    const message = `mute: ${formatError(error)}`;
    report.errors.push(message);
    report.muteCase = { pass: false, error: formatError(error) };
    console.error(message);
  } finally {
    await context.close();
  }
} finally {
  await browser.close();
}

await fs.writeFile(path.join(outputDir, 'oracle-presence-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.errors.length) process.exitCode = 1;
