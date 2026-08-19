import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
const ROOT = process.argv[2] || "dist-ak";
const PORT = +(process.argv[3] || 4425);
const tipos = { ".html":"text/html", ".css":"text/css", ".js":"text/javascript", ".png":"image/png",
  ".svg":"image/svg+xml", ".woff":"font/woff", ".woff2":"font/woff2", ".json":"application/json", ".jpg":"image/jpeg", ".webp":"image/webp" };
createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split("?")[0]);
  let f = join(ROOT, p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  if (!existsSync(f) && existsSync(f + ".html")) f += ".html";
  if (!existsSync(f)) { res.writeHead(404); res.end("nope"); return; }
  res.writeHead(200, { "content-type": tipos[extname(f)] || "application/octet-stream" });
  res.end(readFileSync(f));
}).listen(PORT, ()=>console.log("sirviendo", ROOT, "en", PORT));
