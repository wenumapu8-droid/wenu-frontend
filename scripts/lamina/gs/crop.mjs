import sharp from "sharp";
const [ , , x, y, w, h, esc, out ] = process.argv;
await sharp("reference/pendientes/gaia-sentinel.png")
  .extract({ left: +x, top: +y, width: +w, height: +h })
  .resize({ width: Math.round(+w * +esc), kernel: "lanczos3" })
  .png().toFile(out);
console.log(out);
