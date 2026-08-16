import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
const t = PNG.sync.read(readFileSync("scripts/lamina/out/t01-02-observation-eye/paneles/Centro-triptico.png"));
const { width: W, data } = t;
const lum = (x, y) => { const i = (y * W + x) * 4; return (data[i]*77 + data[i+1]*150 + data[i+2]*29) >> 8; };
// panels: ref at 0, act at 720 (712 + 8 gap)
const OFF = 720;
const ext = (o, x0, x1, y0, y1, th) => {
  let a = 1e9, b = -1, ya = 1e9, yb = -1;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (lum(x + o, y) > th) { if (x < a) a = x; if (x > b) b = x; if (y < ya) ya = y; if (y > yb) yb = y; }
  return b < 0 ? "-" : `x${a}-${b}(${b-a+1}) y${ya}-${yb}`;
};
for (const line of process.argv.slice(2)) {
  const [nom, x0, x1, y0, y1, th] = line.split(",");
  console.log(nom.padEnd(16), "ref", ext(0, +x0, +x1, +y0, +y1, +(th||30)).padEnd(28), "act", ext(OFF, +x0, +x1, +y0, +y1, +(th||30)));
}
