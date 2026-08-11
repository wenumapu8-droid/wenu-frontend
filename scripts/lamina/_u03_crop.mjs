#!/usr/bin/env node
/* Recorta la misma caja de referencia y captura, lado a lado. */
import { PNG } from "pngjs";
import { readFileSync, writeFileSync } from "node:fs";

const [x0, y0, w, h, nombre] = process.argv.slice(2);
const X = +x0, Y = +y0, Wc = +w, Hc = +h;
const ref = PNG.sync.read(readFileSync(new URL("../../reference/canon/u03-return.png", import.meta.url)));
const act = PNG.sync.read(readFileSync(new URL("./out/u03-return/actual.png", import.meta.url)));
const out = new PNG({ width: Wc * 2 + 12, height: Hc });
for (let i = 0; i < out.data.length; i += 4) { out.data[i] = 255; out.data[i+1] = 0; out.data[i+2] = 90; out.data[i+3] = 255; }
PNG.bitblt(ref, out, X, Y, Wc, Hc, 0, 0);
PNG.bitblt(act, out, X, Y, Wc, Hc, Wc + 12, 0);
writeFileSync(new URL(`./out/u03-return/_crop_${nombre}.png`, import.meta.url), PNG.sync.write(out));
console.log("ok", nombre);
