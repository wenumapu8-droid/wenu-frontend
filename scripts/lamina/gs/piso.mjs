/* ¿CUÁL ES EL PISO? El diff píxel a píxel contra una referencia
   fotográfica no puede llegar a cero con dibujo procedural. Esto mide
   contra qué se está compitiendo: la propia referencia desenfocada. */
import sharp from "sharp";
import pixelmatch from "pixelmatch";
const box = { left: 230, top: 206, width: 768, height: 1162 };
const W = box.width, H = box.height;
const rgba = (b) => { const o = Buffer.alloc(W * H * 4); for (let i = 0, j = 0; i < b.length; i += 3, j += 4) { o[j] = b[i]; o[j+1] = b[i+1]; o[j+2] = b[i+2]; o[j+3] = 255; } return o; };
const ref = rgba(await sharp("reference/pendientes/gaia-sentinel.png").extract(box).removeAlpha().raw().toBuffer());
for (const s of [2, 4, 8, 16, 32]) {
  const bl = rgba(await sharp("reference/pendientes/gaia-sentinel.png").extract(box).blur(s).removeAlpha().raw().toBuffer());
  const bad = pixelmatch(ref, bl, null, W, H, { threshold: 0.12, includeAA: false });
  console.log(`referencia vs sí misma desenfocada ${String(s).padStart(2)} px  →  pixel ${(100 * bad / (W * H)).toFixed(2)} %`);
}
const act = rgba(await sharp("scripts/lamina/out/gaia-sentinel/actual.png").extract(box).removeAlpha().raw().toBuffer());
const bad = pixelmatch(ref, act, null, W, H, { threshold: 0.12, includeAA: false });
console.log(`referencia vs captura                     →  pixel ${(100 * bad / (W * H)).toFixed(2)} %`);
