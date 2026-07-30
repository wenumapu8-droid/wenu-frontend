// Generate a dithered "signal from the sky" version of an image.
// The visual signature of the cosmic / Hidden Sky layer — Bayer 8x8 ordered
// dithering mapped to the Wenu palette. Pre-baked asset → zero runtime cost.
//
// Run: node scripts/gen-dither.mjs <src> [out] [mode] [width] [dotScale]
//   src      source image (any format sharp reads)
//   out      output path (default: <src dir>/<name>-dither.png)
//   mode     'gold' (obsidian/bronze/ember, 3-tone, keeps depth) [default]
//            'duo'  (obsidian/bone, 1-bit, austere litho)
//   width    target width in px (default 1000)
//   dotScale render at width/dotScale then upscale → chunkier dots (default 1 = fine)
//
// NOTE: dithering is only for atmospheric/cosmic imagery. Never run it on
// product photography — it destroys the detail that makes the jewelry premium.

import sharp from 'sharp';
import path from 'node:path';

const [srcArg, outArg, modeArg, widthArg, dotArg] = process.argv.slice(2);
if (!srcArg) { console.error('usage: node scripts/gen-dither.mjs <src> [out] [gold|duo] [width] [dotScale]'); process.exit(1); }

const src = path.resolve(srcArg);
const mode = (modeArg || 'gold').toLowerCase();
const targetW = parseInt(widthArg || '1000', 10);
const dotScale = Math.max(1, parseFloat(dotArg || '1'));
const out = path.resolve(outArg || src.replace(/\.[^.]+$/, '') + '-dither.png');

// Bayer 8x8 ordered dither matrix (0..63)
const B = [
  [ 0,32, 8,40, 2,34,10,42],[48,16,56,24,50,18,58,26],
  [12,44, 4,36,14,46, 6,38],[60,28,52,20,62,30,54,22],
  [ 3,35,11,43, 1,33, 9,41],[51,19,59,27,49,17,57,25],
  [15,47, 7,39,13,45, 5,37],[63,31,55,23,61,29,53,21],
];

// Wenu palette
const OBSIDIAN = [10,10,10], BONE = [240,237,232], BRONZE = [106,74,40], EMBER = [201,168,76];

const renderW = Math.max(1, Math.round(targetW / dotScale));

const { data, info } = await sharp(src)
  .resize({ width: renderW })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: w, height: h, channels } = info;
const outBuf = Buffer.alloc(w * h * 3);

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * channels;
    const lum = (0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]) / 255;
    const t = (B[y & 7][x & 7] + 0.5) / 64;
    let col;
    if (mode === 'duo') {
      col = lum > t ? BONE : OBSIDIAN;
    } else {
      const v = lum + (t - 0.5) * 0.5;      // bayer perturbation → 3 stable levels
      col = v < 0.34 ? OBSIDIAN : (v < 0.62 ? BRONZE : EMBER);
    }
    const o = (y * w + x) * 3;
    outBuf[o] = col[0]; outBuf[o+1] = col[1]; outBuf[o+2] = col[2];
  }
}

let img = sharp(outBuf, { raw: { width: w, height: h, channels: 3 } });
if (dotScale > 1) img = img.resize({ width: targetW, kernel: 'nearest' });  // crisp chunky dots

// dithered noise → PNG palette compresses these 2-3 colors tightly
await img.png({ palette: true, colors: mode === 'duo' ? 2 : 3 }).toFile(out);

const st = await sharp(out).metadata();
const { size } = await import('node:fs').then(m => m.promises.stat(out));
console.log(`dither[${mode}] → ${path.relative(process.cwd(), out)}  ${st.width}x${st.height}  ${(size/1024).toFixed(0)}KB`);
