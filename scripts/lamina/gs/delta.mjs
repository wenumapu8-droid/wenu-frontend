/* Delta por celdas: luminancia media de la captura menos la de la
   referencia. Positivo = estoy pintando de más en ese sitio. */
import sharp from "sharp";
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? Number(process.argv[i+1]) : d; };
const X0 = arg("--x0", 230), Y0 = arg("--y0", 206), Wb = arg("--w", 768), Hb = arg("--h", 1162);
const CW = arg("--cw", 64), CH = arg("--ch", 64);
const carga = async (p) => {
  const { data, info } = await sharp(p).extract({ left: X0, top: Y0, width: Wb, height: Hb })
    .raw().toBuffer({ resolveWithObject: true });
  return { data, C: info.channels };
};
const R = await carga("reference/pendientes/gaia-sentinel.png");
const A = await carga("scripts/lamina/out/gaia-sentinel/actual.png");
const lum = (o, x, y) => { const i = (y * Wb + x) * o.C; return (o.data[i]*77 + o.data[i+1]*150 + o.data[i+2]*29) >> 8; };
let cab = "      ";
for (let x = 0; x < Wb; x += CW) cab += String(X0 + x).padStart(5);
console.log(cab);
for (let y = 0; y < Hb; y += CH) {
  const fila = [];
  for (let x = 0; x < Wb; x += CW) {
    let sa = 0, sr = 0, n = 0;
    for (let yy = y; yy < Math.min(y+CH, Hb); yy++) for (let xx = x; xx < Math.min(x+CW, Wb); xx++) { sa += lum(A,xx,yy); sr += lum(R,xx,yy); n++; }
    fila.push(String(Math.round((sa-sr)/n)).padStart(5));
  }
  console.log(String(Y0+y).padStart(6) + fila.join(""));
}
