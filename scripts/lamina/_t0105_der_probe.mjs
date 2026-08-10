import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
const png = PNG.sync.read(readFileSync("/Users/galvazincia/kodex-work/reference/canon/t01-05-specimen-skull.png"));
const { width: W, data } = png;
const L = (x, y) => { const i = (y * W + x) * 4; return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]; };
const [x0, x1, y0, y1, U, COV] = process.argv.slice(2).map(Number);
const rows = []; for (let y = y0; y < y1; y++) { let c = 0; for (let x = x0; x < x1; x++) if (L(x, y) > U) c++; rows.push(c / (x1 - x0)); }
console.log("ROWS:", rows.map((v,i)=> v>=COV ? `${y0+i}:${v.toFixed(2)}`:null).filter(Boolean).join("  "));
const cols = []; for (let x = x0; x < x1; x++) { let c = 0; for (let y = y0; y < y1; y++) if (L(x, y) > U) c++; cols.push(c / (y1 - y0)); }
console.log("COLS:", cols.map((v,i)=> v>=COV ? `${x0+i}:${v.toFixed(2)}`:null).filter(Boolean).join("  "));
