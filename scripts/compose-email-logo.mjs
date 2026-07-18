// Compose the REAL site wordmark (woven mapuche glyphs + mandala) into a single
// email-safe logo PNG. Mirrors the nav layout in Nav.astro:
//   [wenu-word-woven]  [mandala]  [mapu-word-woven]
// bone-white glyphs on transparent bg (renders on the email's obsidian frame).
// Output: public/img/email/email-logo-woven.png
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = (p) => path.join(root, 'public', p);

// Target heights (2x for retina crispness). Nav ratio: word ~22px, mandala ~34px.
const WORD_H = 132;                     // woven wordmark glyph height
const MANDALA_H = Math.round(WORD_H * 1.55); // ~205 — mandala slightly taller, like nav
const GAP = 48;                         // horizontal breathing room between parts
const PAD_Y = 40;                       // top/bottom padding

async function loadScaled(file, targetH) {
  const img = sharp(P(file));
  const meta = await img.metadata();
  const w = Math.round((meta.width / meta.height) * targetH);
  const buf = await img.resize({ height: targetH }).png().toBuffer();
  return { buf, w, h: targetH };
}

const wenu = await loadScaled('logos/wenu-word-woven.webp', WORD_H);
const mand = await loadScaled('img/brand/wenu-mandala-transparent.webp', MANDALA_H);
const mapu = await loadScaled('logos/mapu-word-woven.webp', WORD_H);

const canvasW = wenu.w + GAP + mand.w + GAP + mapu.w;
const canvasH = MANDALA_H + PAD_Y * 2;

// Vertical centering (words align to optical center of the row)
const wordY = Math.round((canvasH - WORD_H) / 2);
const mandY = Math.round((canvasH - MANDALA_H) / 2);

let x = 0;
const composites = [
  { input: wenu.buf, left: x, top: wordY },
];
x += wenu.w + GAP;
composites.push({ input: mand.buf, left: x, top: mandY });
x += mand.w + GAP;
composites.push({ input: mapu.buf, left: x, top: wordY });

await sharp({
  create: { width: canvasW, height: canvasH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite(composites)
  .png()
  .toFile(P('img/email/email-logo-woven.png'));

console.log(`email-logo-woven.png written: ${canvasW}x${canvasH}`);
