import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { readFileSync, writeFileSync } from "node:fs";

const ROOT = "/Users/galvazincia/kodex-work";
const SP = "/private/tmp/claude-501/-Users-galvazincia/f8a089fc-32ae-4e4c-b9fd-3fd6045b33fb/scratchpad";
const ref = PNG.sync.read(readFileSync(`${ROOT}/reference/canon/t01-03-descent-tunnel.png`));
const { width, height } = ref;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
await page.goto("http://localhost:4405/kodex/lamina/t01-03-descent-tunnel/", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(2500);
await page.evaluate(() => window.__kdxFreeze && window.__kdxFreeze(0));
await page.waitForTimeout(400);
const buf = await page.screenshot({ clip: { x: 0, y: 0, width, height } });
await browser.close();
writeFileSync(`${SP}/actual.png`, buf);
const act = PNG.sync.read(buf);

// hero box
const BX = 317, BY = 96, BW = 776, BH = 522;
function sub(png, x0, y0, w, h) {
  const o = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const s = ((y0 + y) * png.width + (x0 + x)) * 4, d = (y * w + x) * 4;
      o.data[d] = png.data[s]; o.data[d + 1] = png.data[s + 1];
      o.data[d + 2] = png.data[s + 2]; o.data[d + 3] = 255;
    }
  return o;
}
const a = sub(act, BX, BY, BW, BH), r = sub(ref, BX, BY, BW, BH);
const diff = new PNG({ width: BW, height: BH });
const n = pixelmatch(a.data, r.data, diff.data, BW, BH, { threshold: 0.1 });
writeFileSync(`${SP}/hero_actual.png`, PNG.sync.write(a));
writeFileSync(`${SP}/hero_diff.png`, PNG.sync.write(diff));
// global
const gd = new PNG({ width, height });
const gn = pixelmatch(act.data, ref.data, gd.data, width, height, { threshold: 0.1 });
console.log("HERO pct", (100 * n / (BW * BH)).toFixed(3), " GLOBAL pct", (100 * gn / (width * height)).toFixed(3));
