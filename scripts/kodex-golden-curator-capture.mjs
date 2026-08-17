import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

/**
 * KODEX−∞ Golden Plate curator capture exporter.
 *
 * This is deliberately NOT a correctness gate and MUST NOT promote
 * human_curator_acceptance. Mechanical validity remains owned by
 * kodex-golden-plate-browser-evidence.mjs. This exporter only makes all 12
 * initial rendered states visible for creator/readability review.
 */

const baseURL = process.env.KODEX_PREVIEW_URL || 'http://127.0.0.1:4321';
const headSha = process.env.KODEX_HEAD_SHA || process.env.GITHUB_SHA || 'LOCAL_UNBOUND';
const outputDir = path.resolve('artifacts/kodex-browser-evidence/golden-curator-review');
await fs.mkdir(outputDir, { recursive: true });

const CASES = [
  ['GP-SCI-01', 'science'], ['GP-SCI-02', 'science'], ['GP-SCI-03', 'science'],
  ['GP-TECH-01', 'technology'], ['GP-TECH-02', 'technology'], ['GP-TECH-03', 'technology'],
  ['GP-ART-01', 'art'], ['GP-ART-02', 'art'], ['GP-ART-03', 'art'],
  ['GP-CON-01', 'consciousness'], ['GP-CON-02', 'consciousness'], ['GP-CON-03', 'consciousness'],
];

const PROFILES = [
  {
    id: 'desktop-1440x900',
    context: { viewport: { width: 1440, height: 900 }, colorScheme: 'dark' },
  },
  {
    id: 'mobile-390x844',
    context: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, colorScheme: 'dark' },
  },
];

const slug = (value) => value.toLowerCase();
const manifest = {
  generated_at: new Date().toISOString(),
  head_sha: headSha,
  base_url: baseURL,
  purpose: 'CREATOR_READABILITY_REVIEW_EVIDENCE_ONLY',
  truth_boundary: {
    mechanical_qa_authority: 'scripts/kodex-golden-plate-browser-evidence.mjs',
    human_curator_acceptance: 'NOT_RUN',
    creator_visual_acceptance: 'NOT_RUN',
    protected_artwork_source_bytes: 'WITHHELD_WHERE_CONTRACT_REQUIRES',
    note: 'Screenshots are review evidence only. Capture does not promote canon, correctness, artwork approval, merge, preview publication or deployment state.',
  },
  expected_cases: CASES.length,
  expected_profiles_per_case: PROFILES.length,
  captures: [],
  errors: [],
};

async function openInitialState(page, caseId) {
  const url = new URL(`/kodex/lab/golden-plates/${slug(caseId)}/`, baseURL).toString();
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  if (!response?.ok()) throw new Error(`${caseId}: route returned ${response?.status() ?? 'NO_RESPONSE'}`);
  await page.locator('[data-kdx-golden-plate]').waitFor({ state: 'visible', timeout: 10_000 });
  await page.locator('[data-active-plate]').waitFor({ state: 'visible', timeout: 10_000 });
  await page.waitForFunction(
    () => document.activeElement === document.querySelector('[data-active-plate]'),
    undefined,
    { timeout: 2_000 },
  );
}

async function describeInitialState(page) {
  return page.evaluate(() => {
    const renderer = document.querySelector('[data-kdx-golden-renderer]');
    const payload = document.querySelector('[data-primary-payload]');
    const root = document.querySelector('[data-kdx-golden-plate]');
    const rect = root?.getBoundingClientRect();
    return {
      plate_id: renderer?.getAttribute('data-plate-id') || null,
      plate_type: renderer?.getAttribute('data-plate-type') || null,
      scene_state: renderer?.getAttribute('data-scene-state') || null,
      semantic_node: renderer?.getAttribute('data-semantic-node') || null,
      primary_element_id: renderer?.getAttribute('data-primary-element-id') || null,
      payload_type: payload?.getAttribute('data-payload-type') || null,
      artwork_source: renderer?.getAttribute('data-artwork-source') || null,
      viewport: { width: innerWidth, height: innerHeight },
      root: { width: rect?.width ?? 0, height: rect?.height ?? 0 },
      page_overflow: {
        x: document.documentElement.scrollWidth > innerWidth + 1,
        y: document.documentElement.scrollHeight > innerHeight + 2,
      },
    };
  });
}

const browser = await chromium.launch({ headless: true });
try {
  for (const [caseId, domain] of CASES) {
    for (const profile of PROFILES) {
      const context = await browser.newContext(profile.context);
      const page = await context.newPage();
      try {
        await openInitialState(page, caseId);
        const state = await describeInitialState(page);
        const filename = `${slug(caseId)}-${profile.id}.png`;
        await page.screenshot({
          path: path.join(outputDir, filename),
          fullPage: false,
          animations: 'disabled',
        });
        manifest.captures.push({
          case_id: caseId,
          domain,
          profile: profile.id,
          screenshot: filename,
          ...state,
        });
      } catch (error) {
        manifest.errors.push({
          case_id: caseId,
          profile: profile.id,
          message: String(error?.stack || error?.message || error),
        });
      } finally {
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}

manifest.captured = manifest.captures.length;
manifest.complete = manifest.errors.length === 0
  && manifest.captures.length === CASES.length * PROFILES.length;

await fs.writeFile(
  path.join(outputDir, 'review-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);

console.log(`Golden curator review capture: ${manifest.captured}/${CASES.length * PROFILES.length}`);
console.log(`human_curator_acceptance=${manifest.truth_boundary.human_curator_acceptance}`);
if (manifest.errors.length) {
  console.error(JSON.stringify(manifest.errors, null, 2));
  process.exitCode = 1;
}
