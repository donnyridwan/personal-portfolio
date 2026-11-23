// Static server with clean URLs (/projects/x -> /projects/x.html), mirroring the reference routing.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(process.argv[2] ?? 'site'), port = +(process.argv[3] ?? 3000);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.json':'application/json','.webp':'image/webp','.avif':'image/avif','.gif':'image/gif','.mp4':'video/mp4'};
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = path.join(root, p);
  if (!f.startsWith(root)) { res.writeHead(403).end(); return; }
  if (p.endsWith('/')) f = path.join(f, 'index.html');
  else if (!path.extname(f) && fs.existsSync(f + '.html')) f += '.html';
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, {'content-type': types[path.extname(f)] ?? 'application/octet-stream'}).end(d); });
}).listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}`));
