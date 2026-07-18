// gen-email-avatar.mjs — rasterize the Wenu emblem SVG into the PNGs needed for
// the Gmail sender avatar (Google/Titan profile photo) + BIMI fallback.
//
//   node scripts/gen-email-avatar.mjs
//
// Requires `sharp` (already a transitive dep via the image pipeline; if missing:
// `npm i -D sharp`). Reads public/img/email/wenu-emblem-avatar.svg and writes
// square PNGs on the obsidian field. Google profile photo accepts PNG/JPG; upload
// the 512 (or 1024) version as the account picture for marimari@wenumapuonline.com.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const emailDir = path.resolve(__dirname, "../public/img/email");
const srcSvg = path.join(emailDir, "wenu-emblem-avatar.svg");

const sizes = [
  { name: "wenu-emblem-avatar-512.png", px: 512 },
  { name: "wenu-emblem-avatar-1024.png", px: 1024 },
];

const svg = fs.readFileSync(srcSvg);
const sharp = (await import("sharp")).default;

for (const { name, px } of sizes) {
  await sharp(svg, { density: 400 })
    .resize(px, px, { fit: "contain", background: "#0a0a0a" })
    .png()
    .toFile(path.join(emailDir, name));
  console.log("wrote", name, `${px}x${px}`);
}
console.log("Done. Upload wenu-emblem-avatar-512.png as the Google profile photo for marimari@wenumapuonline.com.");
