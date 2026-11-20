const { createReadStream, statSync } = require('node:fs');
const { createServer } = require('node:http');
const { extname, join, resolve, sep } = require('node:path');

const root = resolve(join(__dirname, 'app'));
const portPosition = process.argv.indexOf('--port');
const requestedPort = portPosition < 0 ? 8080 : Number(process.argv[portPosition + 1]);
if (!Number.isInteger(requestedPort) || requestedPort < 1 || requestedPort > 65535) {
  throw new RangeError('Choose a port between 1 and 65535 with --port <number>.');
}

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
]);

createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { allow: 'GET, HEAD' }).end('method not allowed');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('bad request');
    return;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';

  const file = resolve(join(root, `.${pathname}`));
  if (file !== root && !file.startsWith(`${root}${sep}`)) {
    response.writeHead(403).end('forbidden');
    return;
  }

  let size;
  try {
    const info = statSync(file);
    if (!info.isFile()) throw new Error('not a file');
    size = info.size;
  } catch {
    response.writeHead(404).end('not found');
    return;
  }

  response.writeHead(200, {
    'content-type': contentTypes.get(extname(file).toLowerCase()) ?? 'application/octet-stream',
    'content-length': size,
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  const stream = createReadStream(file);
  stream.on('error', () => {
    if (!response.headersSent) response.writeHead(500).end('could not read file');
    else response.destroy();
  });
  stream.pipe(response);
}).listen(requestedPort, '127.0.0.1', () => {
  console.log(`Leonida Ledger is available at http://127.0.0.1:${requestedPort}`);
});
