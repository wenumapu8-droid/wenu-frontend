import { chromium } from 'playwright';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const storageKey = 'kdx:journey:v1';

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1200, height: 760 }, colorScheme: 'dark' });
const page = await context.newPage();

async function click(action) {
  await page.locator(`[data-action="${action}"]`).click();
}

async function runCleanTrace() {
  await click('declare');
  await click('signal');
  await click('transform');
  await page.waitForFunction(() => document.querySelector('[data-kdx-manifestation-core]')?.dataset.phase === 'TRANSFORMING');
  await click('realize');
  await click('trace');
  await page.waitForFunction(() => {
    const root = document.querySelector('[data-kdx-manifestation-core]');
    return root?.dataset.phase === 'TRACE' && root?.dataset.journeyTraceWritten === 'true';
  });
}

const response = await page.goto(new URL('/kodex/lab/manifestation-engine/', baseURL).toString(), {
  waitUntil: 'domcontentloaded',
  timeout: 30_000,
});
assert(response?.ok(), `manifestation lab returned ${response?.status()}`);
await page.locator('[data-kdx-manifestation-core]').waitFor({ state: 'visible' });

await page.evaluate(key => sessionStorage.removeItem(key), storageKey);
await runCleanTrace();

const first = await page.evaluate(key => {
  const raw = sessionStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}, storageKey);

assert(first, 'JourneyState was not persisted after TRACE');
assert(Array.isArray(first.committedActions), 'JourneyState committedActions missing');
assert(first.committedActions.includes('manifestation:KDX-LAB-INTENT-001:realized'), 'realized semantic write missing');
assert(first.committedActions.includes('manifestation-node:KDX-NODE-PORTAL-RING'), 'node semantic write missing');
assert(first.trace.length === 2, `expected exactly 2 JourneyState commits, got ${first.trace.length}`);
assert(first.trace.every(event => event.kind === 'commit'), 'manifestation trace did not enter JourneyState as commit events');
assert(first.trace.every((event, index) => event.at === index), 'JourneyState did not preserve semantic order');
assert(first.trace.every(event => !('createdAt' in event)), 'wall-clock timing leaked into JourneyState trace');

await click('reset');
const afterReset = await page.evaluate(key => JSON.parse(sessionStorage.getItem(key) || '{}'), storageKey);
assert(afterReset.committedActions?.length === 2, 'manifestation RESET incorrectly erased journey memory');

await runCleanTrace();
const replay = await page.evaluate(key => JSON.parse(sessionStorage.getItem(key) || '{}'), storageKey);
assert(replay.committedActions?.length === 2, 'replayed identical TRACE double-wrote JourneyState memory');
assert(replay.trace?.length === 2, 'replayed identical TRACE duplicated journey events');

await context.close();
await browser.close();
console.log('Manifestation TRACE → JourneyState browser evidence passed.');
