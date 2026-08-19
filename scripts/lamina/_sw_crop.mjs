import sharp from "sharp";
const [src, x, y, w, h, esc, out] = process.argv.slice(2);
await sharp(src)
  .extract({ left: +x, top: +y, width: +w, height: +h })
  .resize({ width: Math.round(+w * +esc), kernel: "lanczos3" })
  .png().toFile(out);
console.log("ok", out);
