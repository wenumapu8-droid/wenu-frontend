import { chromium } from 'playwright';
import fs from 'node:fs';

const base = process.env.OCIN_QA_BASE_URL ?? 'http://127.0.0.1:4321';
const outDir = process.env.OCIN_QA_OUT_DIR ?? 'qa-artifacts';
const routes = [
  ['threshold', '/kodex/lab/ocin-collage/'],
  ['archive', '/kodex/lab/ocin-collage/archive/'],
  ['museum', '/kodex/lab/ocin-collage/museum/'],
];
const expectedAssets = [
  'OCN-TOR-005',
  'OCN-TOR-001',
  'OCN-SQR-001',
  'OCN-FRC-002',
  'OCN-TRI-001',
  'OCN-MND-GRY-002',
];

fs.mkdirSync(outDir, { recursive: true });

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const durationToMs = (token) => {
  const value = Number.parseFloat(token);
  if (!Number.isFinite(value)) return Number.POSITIVE_INFINITY;
  return token.trim().endsWith('ms') ? value : value * 1000;
};

const verifyPage = async (page, name) => {
  await page.waitForLoadState('networkidle');

  // Visual assertions apply only to artwork actually presented in this viewport.
  // Some variants intentionally keep a hero record in the DOM but hide it.
  const images = page.locator('[data-ocin-art]:visible img');
  const count = await images.count();
  assert(count > 0, `${name}: no visible original artwork images rendered`);

  const imageChecks = [];
  for (let i = 0; i < count; i += 1) {
    const image = images.nth(i);
    await image.scrollIntoViewIfNeeded();
    await image.waitFor({ state: 'visible' });
    await image.evaluate(async (img) => {
      if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
        await img.decode();
      }
    });

    const result = await image.evaluate((img) => {
      const style = getComputedStyle(img);
      return {
        src: img.currentSrc || img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        objectFit: style.objectFit,
        filter: style.filter,
        transform: style.transform,
        mixBlendMode: style.mixBlendMode,
        clipPath: style.clipPath,
        opacity: style.opacity,
      };
    });

    assert(result.complete && result.naturalWidth > 0 && result.naturalHeight > 0, `${name}: broken artwork image ${i}`);
    assert(result.objectFit === 'contain', `${name}: artwork ${i} object-fit=${result.objectFit}`);
    assert(result.filter === 'none', `${name}: artwork ${i} filter=${result.filter}`);
    assert(result.transform === 'none', `${name}: artwork ${i} transform=${result.transform}`);
    assert(result.mixBlendMode === 'normal', `${name}: artwork ${i} mix-blend-mode=${result.mixBlendMode}`);
    assert(result.clipPath === 'none', `${name}: artwork ${i} clip-path=${result.clipPath}`);
    assert(result.opacity === '1', `${name}: artwork ${i} opacity=${result.opacity}`);
    imageChecks.push(result);
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(50);

  const layout = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    scrollHeight: document.documentElement.scrollHeight,
  }));
  assert(layout.overflow <= 1, `${name}: horizontal overflow ${layout.overflow}px`);

  // Provenance applies to all declared art records, including intentionally hidden ones.
  const ids = await page.locator('[data-ocin-art]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-ocin-art')));
  assert(ids.every(Boolean), `${name}: artwork without provenance ID`);

  return { ...layout, imageCount: count, ids, imageChecks };
};

const report = {};
let browser;
let failure;

try {
  browser = await chromium.launch({ headless: true });

  for (const [name, route] of routes) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
    report[`${name}-desktop`] = await verifyPage(page, `${name}-desktop`);
    await page.screenshot({ path: `${outDir}/${name}-1440x1000.png`, fullPage: true });
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await page.goto(`${base}/kodex/lab/ocin-collage/`, { waitUntil: 'domcontentloaded' });
    report['threshold-390x844'] = await verifyPage(page, 'threshold-390x844');
    await page.screenshot({ path: `${outDir}/threshold-390x844.png`, fullPage: true });
    await context.close();
  }

  {
    const context = await browser.newContext({
      viewport: { width: 412, height: 915 },
      hasTouch: true,
      isMobile: true,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto(`${base}/kodex/lab/ocin-collage/museum/`, { waitUntil: 'domcontentloaded' });
    report['museum-412x915-reduced'] = await verifyPage(page, 'museum-412x915-reduced');
    await page.screenshot({ path: `${outDir}/museum-412x915-reduced.png`, fullPage: true });

    const motion = await page.locator('.ocx__cta').evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        transitionDuration: style.transitionDuration,
        animationDuration: style.animationDuration,
      };
    });
    const transitionMs = motion.transitionDuration.split(',').map((value) => durationToMs(value.trim()));
    const animationMs = motion.animationDuration.split(',').map((value) => durationToMs(value.trim()));
    assert(transitionMs.every((value) => value <= 1), `reduced motion transition still active: ${motion.transitionDuration}`);
    assert(animationMs.every((value) => value <= 1), `reduced motion animation still active: ${motion.animationDuration}`);
    report['museum-412x915-reduced'].motion = { ...motion, transitionMs, animationMs };
    await context.close();
  }

  const union = new Set(Object.values(report).flatMap((entry) => entry.ids ?? []));
  for (const id of expectedAssets) assert(union.has(id), `expected asset missing from evidence: ${id}`);
} catch (error) {
  failure = error instanceof Error ? error : new Error(String(error));
} finally {
  if (browser) await browser.close();
  fs.writeFileSync(
    `${outDir}/browser-acceptance.json`,
    JSON.stringify(
      failure
        ? { status: 'FAIL', error: failure.message, stack: failure.stack, report }
        : { status: 'PASS', report },
      null,
      2,
    ),
  );
}

if (failure) throw failure;
console.log(`Ocín collage browser QA PASS: ${Object.keys(report).join(', ')}`);
