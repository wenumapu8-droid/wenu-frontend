/**
 * Servidor estático mínimo para evaluar `dist/` sin depender de nada externo.
 *
 *   node scripts/kodex/servir-dist.mjs [raiz=dist] [puerto=4342]
 *
 * Existe porque los gates miden la experiencia sobre el sitio construido, no
 * sobre el dev server: lo que se publica es esto, no aquello.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

const RAIZ = process.argv[2] || 'dist';
const PUERTO = +(process.argv[3] || 4342);

const TIPO = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
};

createServer(async (req, res) => {
  try {
    let p = join(RAIZ, decodeURIComponent(req.url.split('?')[0]));
    try {
      if ((await stat(p)).isDirectory()) p = join(p, 'index.html');
    } catch {
      if (!extname(p)) p += '.html';          // rutas Astro sin barra final
    }
    const cuerpo = await readFile(p);
    res.writeHead(200, { 'content-type': TIPO[extname(p)] || 'application/octet-stream' });
    res.end(cuerpo);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('404');
  }
}).listen(PUERTO, '127.0.0.1', () => console.log(`sirviendo ${RAIZ} en ${PUERTO}`));
