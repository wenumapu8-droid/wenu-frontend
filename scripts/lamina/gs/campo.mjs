/* Campo de ambiente MEDIDO: color medio por celda de la caja del arte.
   Rejilla deliberadamente gruesa (64 px/celda): 12x19 = 228 muestras sobre
   892.416 px. No es un calco — a esa resolución no hay dibujo, hay LUZ. */
import sharp from "sharp";
const X0 = 230, Y0 = 206, W = 768, H = 1162;
const NX = 12, NY = 19;
const { data, info } = await sharp("reference/pendientes/gaia-sentinel.png")
  .extract({ left: X0, top: Y0, width: W, height: H }).raw().toBuffer({ resolveWithObject: true });
const C = info.channels;
const filas = [];
for (let j = 0; j < NY; j++) {
  const fila = [];
  for (let i = 0; i < NX; i++) {
    const xa = Math.round((i * W) / NX), xb = Math.round(((i + 1) * W) / NX);
    const ya = Math.round((j * H) / NY), yb = Math.round(((j + 1) * H) / NY);
    let r = 0, g = 0, b = 0, n = 0;
    for (let y = ya; y < yb; y++) for (let x = xa; x < xb; x++) {
      const k = (y * W + x) * C; r += data[k]; g += data[k + 1]; b += data[k + 2]; n++;
    }
    fila.push([Math.round(r / n), Math.round(g / n), Math.round(b / n)]);
  }
  filas.push(fila);
}
console.log(filas.map((f) => "    [" + f.map((c) => c.join(",")).map(s=>`[${s}]`).join(",") + "],").join("\n"));
