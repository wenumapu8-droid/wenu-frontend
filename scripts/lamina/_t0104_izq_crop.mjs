#!/usr/bin/env node
/** Recorta y amplía una región de la referencia para mirarla.
 *  uso: node scripts/lamina/_t0104_izq_crop.mjs x0 y0 w h [escala] [salida] */
import sharp from "sharp";
const [x, y, w, h, s = 4, out = "scripts/lamina/out/_izq_crop.png"] = process.argv.slice(2);
await sharp("reference/canon/t01-04-archive-tree.png")
  .extract({ left: +x, top: +y, width: +w, height: +h })
  .resize({ width: +w * +s, height: +h * +s, kernel: "nearest" })
  .toFile(out);
console.log(out, `${+w * +s}x${+h * +s}`);
