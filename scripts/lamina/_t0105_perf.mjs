#!/usr/bin/env node
/** Prueba de costo: cuánto tarda y cuánto pesa trazar el cráneo por capas. */
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
import sharp from "sharp";
import { vectorize, ColorMode, PathSimplifyMode, Hierarchical } from "@neplex/vectorizer";

const img = PNG.sync.read(readFileSync("reference/canon/t01-05-specimen-skull.png"));
const { width: W, data } = img;
const lum = (x, y) => { const i = (y * W + x) * 4; return (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8; };

const X0 = 306, X1 = 775, Y0 = 104, Y1 = 586;
const w = X1 - X0 + 1, h = Y1 - Y0 + 1;
console.log("ventana", w, "x", h);

for (const esc of [3, 4]) {
  for (const u of [20, 60, 120]) {
    const raw = Buffer.alloc(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) raw[y * w + x] = lum(X0 + x, Y0 + y) > u ? 0 : 255;
    const t0 = Date.now();
    const bin = await sharp(raw, { raw: { width: w, height: h, channels: 1 } })
      .resize({ width: w * esc, height: h * esc, kernel: "nearest" }).png().toBuffer();
    const svg = await vectorize(bin, {
      colorMode: ColorMode.Binary, hierarchical: Hierarchical.Stacked,
      filterSpeckle: 4, colorPrecision: 6, layerDifference: 16,
      mode: PathSimplifyMode.Spline, cornerThreshold: 60, lengthThreshold: 4,
      maxIterations: 10, spliceThreshold: 45, pathPrecision: 1,
    });
    console.log(`esc ${esc} u${u}  ${((Date.now() - t0) / 1000).toFixed(1)}s  ${(svg.length / 1024).toFixed(0)}KB  paths ${(svg.match(/<path/g) ?? []).length}`);
  }
}
