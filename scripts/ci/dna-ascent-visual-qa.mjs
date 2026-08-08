import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.KDX_DNA_BASE_URL || "http://127.0.0.1:4173";
const route = "/kodex/lab/dna-ascent/";
const outputDir = path.resolve("artifacts/dna-ascent-qa");

const viewports = [
  { name: "390x844", width: 390, height: 844 },
  { name: "412x915", width: 412, height: 915 },
  { name: "1440x1000", width: 1440, height: 1000 },
];

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = {
  route,
  generatedAt: new Date().toISOString(),
  viewports: [],
  reducedMotion: null,
  failures: [],
};

async function inspectPage(page) {
  return page.evaluate(() => {
    const root = document.querySelector("[data-dna-ascent]");
    const canvas = root?.querySelector("canvas");
    const state = root?.querySelector("[data-dna-state]")?.textContent?.trim() || null;
    const motion = root?.querySelector("[data-dna-motion]")?.textContent?.trim() || null;
    const rect = root?.getBoundingClientRect();
    return {
      ready: root?.getAttribute("data-ready") || null,
      mounted: root?.getAttribute("data-dna-mounted") || null,
      ariaPressed: root?.getAttribute("aria-pressed") || null,
      state,
      motion,
      canvasWidth: canvas?.width || 0,
      canvasHeight: canvas?.height || 0,
      rootWidth: rect?.width || 0,
      rootHeight: rect?.height || 0,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    };
  });
}

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));

  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  await page.locator("[data-dna-ascent]").waitFor({ state: "visible" });
  await page.waitForTimeout(900);

  const before = await inspectPage(page);

  await page.locator("[data-dna-ascent]").focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(150);
  const afterEngage = await inspectPage(page);

  const screenshot = path.join(outputDir, `dna-ascent-${viewport.name}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });

  const result = {
    ...viewport,
    before,
    afterEngage,
    consoleErrors,
    pageErrors,
    screenshot,
  };
  report.viewports.push(result);

  if (before.ready !== "true") report.failures.push(`${viewport.name}: canvas did not become ready`);
  if (before.canvasWidth < 1 || before.canvasHeight < 1) report.failures.push(`${viewport.name}: canvas has zero dimensions`);
  if (before.horizontalOverflow) report.failures.push(`${viewport.name}: horizontal page overflow detected`);
  if (afterEngage.ariaPressed !== "true" || afterEngage.state !== "ENGAGED") {
    report.failures.push(`${viewport.name}: keyboard engagement did not reach ENGAGED`);
  }
  if (consoleErrors.length) report.failures.push(`${viewport.name}: browser console errors: ${consoleErrors.join(" | ")}`);
  if (pageErrors.length) report.failures.push(`${viewport.name}: page errors: ${pageErrors.join(" | ")}`);

  await context.close();
}

{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));

  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  await page.locator("[data-dna-ascent]").waitFor({ state: "visible" });
  await page.waitForTimeout(500);

  const snapshot = await inspectPage(page);
  const screenshot = path.join(outputDir, "dna-ascent-390x844-reduced-motion.png");
  await page.screenshot({ path: screenshot, fullPage: true });

  report.reducedMotion = { snapshot, consoleErrors, pageErrors, screenshot };

  if (snapshot.ready !== "true") report.failures.push("reduced-motion: canvas did not become ready");
  if (snapshot.motion !== "REDUCED") report.failures.push(`reduced-motion: expected REDUCED readout, got ${snapshot.motion}`);
  if (snapshot.horizontalOverflow) report.failures.push("reduced-motion: horizontal page overflow detected");
  if (consoleErrors.length) report.failures.push(`reduced-motion: browser console errors: ${consoleErrors.join(" | ")}`);
  if (pageErrors.length) report.failures.push(`reduced-motion: page errors: ${pageErrors.join(" | ")}`);

  await context.close();
}

await browser.close();
await fs.writeFile(path.join(outputDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (report.failures.length) {
  console.error("DNA Ascent visual QA failed:");
  for (const failure of report.failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("DNA Ascent visual QA passed.");
for (const item of report.viewports) {
  console.log(
    `${item.name}: canvas=${item.before.canvasWidth}x${item.before.canvasHeight}, root=${Math.round(item.before.rootWidth)}x${Math.round(item.before.rootHeight)}, overflow=${item.before.horizontalOverflow}, state=${item.afterEngage.state}`,
  );
}
console.log(`reduced-motion: ${report.reducedMotion.snapshot.motion}`);
