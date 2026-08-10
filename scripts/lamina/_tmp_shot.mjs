import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
const ROOT = "/Users/galvazincia/kodex-work/dist";
const MIME = {".html":"text/html",".css":"text/css",".js":"text/javascript",".woff2":"font/woff2",".woff":"font/woff",".png":"image/png",".svg":"image/svg+xml",".json":"application/json",".jpg":"image/jpeg",".webp":"image/webp",".avif":"image/avif"};
const srv = createServer((req,res)=>{
  let p = join(ROOT, decodeURIComponent(req.url.split("?")[0]));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p,"index.html");
  if (!existsSync(p)) { res.writeHead(404); return res.end("nope"); }
  res.writeHead(200,{"content-type":MIME[extname(p)]||"application/octet-stream"});
  res.end(readFileSync(p));
});
await new Promise(r=>srv.listen(4491,r));
const b = await chromium.launch();
const pg = await b.newPage({ viewport:{width:1672,height:941}, deviceScaleFactor:1 });
await pg.goto("http://localhost:4491/kodex/lamina/t01-03-descent-tunnel/", {waitUntil:"networkidle"});
await pg.waitForTimeout(500);
await pg.screenshot({ path: process.argv[2] });
await b.close(); srv.close();
