#!/usr/bin/env node
/** Comparador con lupa: referencia | actual, de una ventana del póster. */
import { chromium } from "playwright";
import sharp from "sharp";
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
const REF = "reference/canon/t01-06-ritual-device.png";
const [x, y, w, h, s = 3, port = 4326] = process.argv.slice(2).map(Number);
const ref = PNG.sync.read(readFileSync(REF));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: ref.width, height: ref.height }, deviceScaleFactor: 1 });
await p.goto(`http://localhost:${port}/kodex/lamina/t01-06-izq-solo/`, { waitUntil: "networkidle" });
await p.evaluate(() => { if (typeof window.__kdxFreeze === "function") window.__kdxFreeze(0); }).catch(() => {});
await p.waitForTimeout(250);
const shot = await p.screenshot({ animations: "disabled" });
await b.close();
const [a, c] = await Promise.all([
  sharp(REF).extract({ left: x, top: y, width: w, height: h }).png().toBuffer(),
  sharp(shot).extract({ left: x, top: y, width: w, height: h }).png().toBuffer(),
]);
await sharp({ create: { width: w * 2 + 6, height: h, channels: 3, background: "#404040" } })
  .composite([{ input: a, left: 0, top: 0 }, { input: c, left: w + 6, top: 0 }])
  .resize({ width: (w * 2 + 6) * s, kernel: "nearest" }).png()
  .toFile("scripts/lamina/out/t01-06-ritual-device/zoom.png");
console.log("→ scripts/lamina/out/t01-06-ritual-device/zoom.png");
