import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = resolve(fileURLToPath(new URL('./app/', import.meta.url)));
const portFlag = process.argv.indexOf('--port');
const portValue = portFlag < 0 ? 8080 : Number(process.argv[portFlag + 1]);
const port = Number.isInteger(portValue) && portValue > 0 && portValue <= 65535 ? portValue : 8080;

const contentTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

const server = createServer((request, response) => {
  let route: string;
  try {
    route = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }
  if (route.endsWith('/')) route += 'index.html';

  const file = resolve(join(webRoot, normalize(route)));
  if (file !== webRoot && !file.startsWith(`${webRoot}${sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  let length: number;
  try {
    const info = statSync(file);
    if (!info.isFile()) throw new Error('Requested path is not a file.');
    length = info.size;
  } catch {
    response.writeHead(404).end('Not found');
    return;
  }
  response.writeHead(200, {
    'content-type': contentTypes[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'content-length': length,
    'cache-control': 'no-store',
  });
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  const stream = createReadStream(file);
  stream.on('error', (error) => {
    if (!response.headersSent) response.writeHead(500).end('Read failed');
    else response.destroy(error);
  });
  stream.pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`app/ is on http://localhost:${port}`);
});
