import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const outDir = 'artifacts/kodex-signal-vortex-loop-01';
await mkdir(outDir, { recursive: true });

const cases = [
  { name: 'black-1920x1080', width: 1920, height: 1080, query: '?state=black&seed=1808&duration=8', reduced: false, state: 'black' },
  { name: 'signal-1920x1080', width: 1920, height: 1080, query: '?state=signal&seed=1808&duration=8', reduced: false, state: 'signal' },
  { name: 'signal-1080x1080', width: 1080, height: 1080, query: '?state=signal&seed=1808&duration=8', reduced: false, state: 'signal' },
  { name: 'reduced-390x844', width: 390, height: 844, query: '?state=black&seed=1808&duration=8&reduced=1', reduced: true, state: 'black' },
];

const digest = (value) => createHash('sha256').update(value).digest('hex');
const browser = await chromium.launch({ headless: true });
const report = [];

try {
  for (const testCase of cases) {
    const page = await browser.newPage({ viewport: { width: testCase.width, height: testCase.height } });
    const browserErrors = [];
    page.on('pageerror', (error) => browserErrors.push(`pageerror: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') browserErrors.push(`console: ${message.text()}`);
    });

    const url = `${base}/kodex/lab/visual-systems/signal-vortex/${testCase.query}`;
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    assert.ok(response, `${testCase.name}: missing navigation response`);
    assert.equal(response.status(), 200, `${testCase.name}: expected HTTP 200`);

    await page.waitForSelector('[data-kdx-signal-vortex-loop] canvas');
    await page.waitForTimeout(350);

    const first = await page.evaluate(() => {
      const proof = document.querySelector('[data-kdx-visual-proof]');
      const host = document.querySelector('[data-kdx-signal-vortex-loop]');
      const canvas = host?.querySelector('canvas');
      if (!(proof instanceof HTMLElement) || !(host instanceof HTMLElement) || !(canvas instanceof HTMLCanvasElement)) {
        throw new Error('proof surface or canvas missing');
      }
      const hostRect = host.getBoundingClientRect();
      return {
        proofState: proof.dataset.state,
        proofRights: proof.dataset.rights,
        hostState: host.dataset.state,
        hostReady: host.dataset.ready,
        hostRect: { width: hostRect.width, height: hostRect.height, x: hostRect.x, y: hostRect.y },
        canvasCss: { width: canvas.clientWidth, height: canvas.clientHeight },
        canvasBacking: { width: canvas.width, height: canvas.height },
        scroll: {
          width: document.documentElement.scrollWidth,
          height: document.documentElement.scrollHeight,
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
        },
        frame: canvas.toDataURL('image/png'),
      };
    });

    await page.waitForTimeout(650);
    const secondFrame = await page.evaluate(() => {
      const canvas = document.querySelector('[data-kdx-signal-vortex-loop] canvas');
      if (!(canvas instanceof HTMLCanvasElement)) throw new Error('canvas missing on second sample');
      return canvas.toDataURL('image/png');
    });

    const firstHash = digest(first.frame);
    const secondHash = digest(secondFrame);
    const changed = firstHash !== secondHash;

    assert.equal(first.proofState, testCase.state, `${testCase.name}: proof state mismatch`);
    assert.equal(first.hostState, testCase.state, `${testCase.name}: host state mismatch`);
    assert.equal(first.proofRights, 'NEEDS_CONFIRMATION', `${testCase.name}: rights truth boundary changed`);
    assert.equal(first.hostReady, 'true', `${testCase.name}: visual engine did not initialize`);
    assert.ok(Math.abs(first.hostRect.width - testCase.width) <= 1, `${testCase.name}: host width does not fill viewport`);
    assert.ok(Math.abs(first.hostRect.height - testCase.height) <= 1, `${testCase.name}: host height does not fill viewport`);
    assert.ok(first.canvasBacking.width > 0 && first.canvasBacking.height > 0, `${testCase.name}: canvas backing store missing`);
    assert.ok(first.scroll.width <= first.scroll.innerWidth + 1, `${testCase.name}: horizontal page overflow`);
    assert.ok(first.scroll.height <= first.scroll.innerHeight + 1, `${testCase.name}: vertical page overflow`);
    assert.equal(changed, !testCase.reduced, `${testCase.name}: motion/reduced-motion frame behavior mismatch`);
    assert.deepEqual(browserErrors, [], `${testCase.name}: first-party browser errors`);

    await page.screenshot({ path: `${outDir}/${testCase.name}.png`, fullPage: false });
    report.push({
      ...testCase,
      url,
      http: response.status(),
      firstFrameSha256: firstHash,
      secondFrameSha256: secondHash,
      changed,
      hostRect: first.hostRect,
      canvasBacking: first.canvasBacking,
      browserErrors,
      result: 'PASS',
    });
    await page.close();
  }
} finally {
  await browser.close();
}

await writeFile(`${outDir}/browser-evidence.json`, JSON.stringify({
  proof: 'KDX-VISUAL-SIGNAL-LOOP-001',
  source: 'KDX-SCREEN-SIGNAL-014',
  rights: 'NEEDS_CONFIRMATION',
  cases: report,
}, null, 2));

console.log(JSON.stringify({ result: 'PASS', cases: report.map(({ name, result, changed }) => ({ name, result, changed })) }, null, 2));
