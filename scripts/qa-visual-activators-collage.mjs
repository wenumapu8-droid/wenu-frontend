import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const route = '/kodex/lab/visual-activators-collage-v0';
const outDir = 'qa-artifacts/visual-activators-collage-v0';
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const cases = [
  { name: 'desktop', viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' },
  { name: 'mobile', viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' },
  { name: 'mobile-reduced', viewport: { width: 412, height: 915 }, reducedMotion: 'reduce' },
];

const failures = [];
const results = [];

for (const spec of cases) {
  const context = await browser.newContext({ viewport: spec.viewport, reducedMotion: spec.reducedMotion });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push(err.message));

  const response = await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle', timeout: 45_000 });
  if (!response?.ok()) failures.push(`${spec.name}: HTTP ${response?.status() ?? 'no-response'}`);

  const metaRobots = await page.locator('meta[name="robots"]').getAttribute('content');
  if (metaRobots !== 'noindex, nofollow') failures.push(`${spec.name}: route is not noindex`);

  const artwork = page.locator('.art');
  await artwork.waitFor({ state: 'visible', timeout: 20_000 });
  const artState = await artwork.evaluate(img => {
    const style = getComputedStyle(img);
    const rect = img.getBoundingClientRect();
    return {
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      objectFit: style.objectFit,
      filter: style.filter,
      transform: style.transform,
      mixBlendMode: style.mixBlendMode,
      clipPath: style.clipPath,
      opacity: style.opacity,
      width: rect.width,
      height: rect.height,
    };
  });

  if (artState.naturalWidth < 100 || artState.naturalHeight < 100) failures.push(`${spec.name}: authorial image did not load`);
  if (artState.objectFit !== 'contain') failures.push(`${spec.name}: artwork object-fit=${artState.objectFit}`);
  if (artState.filter !== 'none') failures.push(`${spec.name}: artwork filter=${artState.filter}`);
  if (artState.transform !== 'none') failures.push(`${spec.name}: artwork transform=${artState.transform}`);
  if (artState.mixBlendMode !== 'normal') failures.push(`${spec.name}: artwork blend=${artState.mixBlendMode}`);
  if (!['none', 'auto'].includes(artState.clipPath)) failures.push(`${spec.name}: artwork clip-path=${artState.clipPath}`);
  if (artState.opacity !== '1') failures.push(`${spec.name}: artwork opacity=${artState.opacity}`);

  const overflow = await page.evaluate(() => ({
    x: document.documentElement.scrollWidth - innerWidth,
    y: document.documentElement.scrollHeight - innerHeight,
  }));
  if (overflow.x > 1 || overflow.y > 1) failures.push(`${spec.name}: page overflow x=${overflow.x}, y=${overflow.y}`);

  // Drive the state machine through OPEN and verify the DOM state changes.
  const activate = page.locator('.activate');
  await activate.click();
  await activate.click();
  await activate.click();
  const phase = await page.locator('.kdx').getAttribute('data-phase');
  if (phase !== 'open') failures.push(`${spec.name}: expected OPEN after three activations, got ${phase}`);

  // Jump to RETURN and verify true light-field inversion.
  await page.locator('.dot[data-index="6"]').click();
  const returnState = await page.locator('.kdx').evaluate(el => {
    const bg = getComputedStyle(el).backgroundColor;
    return { scene: el.dataset.scene, bg };
  });
  if (returnState.scene !== 'RETURN') failures.push(`${spec.name}: RETURN scene not selected`);
  const rgb = returnState.bg.match(/\d+/g)?.slice(0, 3).map(Number) ?? [0,0,0];
  if (rgb.some(v => v < 220)) failures.push(`${spec.name}: RETURN is not a light field (${returnState.bg})`);

  if (spec.reducedMotion === 'reduce') {
    const duration = await page.locator('.art-zone').evaluate(el => getComputedStyle(el, '::before').transitionDuration);
    const ms = duration.split(',').map(s => s.trim()).map(s => s.endsWith('ms') ? parseFloat(s) : parseFloat(s) * 1000);
    if (ms.some(v => v > 2)) failures.push(`${spec.name}: reduced-motion transition too long (${duration})`);
  }

  await page.screenshot({ path: `${outDir}/${spec.name}.png`, fullPage: true });
  results.push({ ...spec, artState, overflow, returnState, consoleErrors });
  if (consoleErrors.length) failures.push(`${spec.name}: console errors: ${consoleErrors.join(' | ')}`);
  await context.close();
}

await browser.close();
console.log(JSON.stringify({ route, results, failures }, null, 2));
if (failures.length) {
  console.error(`Visual activator collage QA failed (${failures.length})`);
  process.exit(1);
}
console.log('Visual activator collage QA: PASS');
