#!/usr/bin/env node
// Recorta los clusters grandes de hero-left de la referencia para clasificarlos.
import sharp from "sharp";
const cl = [
  [227, 397, 73, 55, "c1"],
  [341, 632, 55, 108, "c2"],
  [352, 950, 68, 54, "c3"],
  [360, 395, 37, 47, "c4"],
];
for (const [x, y, w, h, n] of cl) {
  await sharp("reference/canon/u10-commons.png")
    .extract({ left: x - 10, top: y - 10, width: w + 20, height: h + 20 })
    .resize({ width: (w + 20) * 4, kernel: "nearest" })
    .toFile(`scripts/lamina/out/u10-commons/heroleft-${n}.png`);
}
console.log("ok");
