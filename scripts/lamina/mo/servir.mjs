/* Servidor estático propio: dos agentes más están construyendo en este
   worktree y `astro preview` sirve el dist compartido. Con outDir propio
   y este servidor, la medición de esta lámina no depende de la de nadie. */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
const RAIZ = process.argv[2];
const PUERTO = Number(process.argv[3] || 4423);
const tipos = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json", ".jpg": "image/jpeg", ".webp": "image/webp" };
createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  try {
    const buf = await readFile(join(RAIZ, p));
    res.writeHead(200, { "content-type": tipos[extname(p)] || "application/octet-stream" });
    res.end(buf);
  } catch {
    res.writeHead(404); res.end("no");
  }
}).listen(PUERTO, () => console.log("sirviendo", RAIZ, "en", PUERTO));
