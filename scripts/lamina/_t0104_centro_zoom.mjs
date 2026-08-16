#!/usr/bin/env node
/* Recorte ampliado de una zona del póster, a mi carpeta. */
import sharp from "sharp";
import { join, dirname } from "node:path";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const [name, x, y, w, h, k] = process.argv.slice(2);
const OUT = join(ROOT, "scripts", "lamina", "crops", "t01-04", "centro");
mkdirSync(OUT, { recursive: true });
const K = Number(k || 6);
await sharp(join(ROOT, "reference", "canon", "t01-04-archive-tree.png"))
  .extract({ left: +x, top: +y, width: +w, height: +h })
  .resize({ width: +w * K, height: +h * K, kernel: "nearest" })
  .png()
  .toFile(join(OUT, `${name}.png`));
console.log(join(OUT, `${name}.png`));
