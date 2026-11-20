import { createReadStream, mkdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const root = resolve(fileURLToPath(new URL('./app/', import.meta.url)));
const output = fileURLToPath(new URL('./screenshots/', import.meta.url));
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

mkdirSync(output, { recursive: true });
const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400).end('bad request');
    return;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = resolve(join(root, normalize(pathname)));
  if (file !== root && !file.startsWith(`${root}${sep}`)) {
    response.writeHead(403).end('forbidden');
    return;
  }
  try {
    const size = statSync(file).size;
    response.writeHead(200, {
      'content-type': mime[extname(file).toLowerCase()] ?? 'application/octet-stream',
      'content-length': size,
      'cache-control': 'no-store',
    });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404).end('not found');
  }
});

const captures = [
  { file: '1-checklist.jpg', path: '/?filter=all&trophy=20' },
  { file: '2-roadmap.jpg', path: '/?view=roadmap&trophy=29' },
  { file: '3-guide.jpg', path: '/?view=guide&trophy=29' },
  { file: '4-spoiler.jpg', path: '/?filter=story&spoilers=on' },
];
let browser;

try {
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  browser = await puppeteer.launch({ headless: 'shell' });
  for (const capture of captures) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
    page.on('console', (message) => {
      if (message.type() === 'error') console.error(`Browser console: ${message.text()}`);
    });
    page.on('pageerror', (error) => console.error(`Browser error: ${error.message}`));
    page.on('requestfailed', (request) => console.error(`Request failed: ${request.url()} (${request.failure()?.errorText})`));
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('leonida-field-guide-progress-v1', JSON.stringify([2, 8, 16, 20, 21, 28, 35, 42]));
    });
    await page.goto(`http://127.0.0.1:${address.port}${capture.path}`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#detail-panel h2');
    const file = join(output, capture.file);
    await page.screenshot({ path: file, type: 'jpeg', quality: 85, fullPage: false });
    if (statSync(file).size >= 262144) {
      await page.screenshot({ path: file, type: 'jpeg', quality: 78, fullPage: false });
    }
    if (statSync(file).size >= 262144) throw new Error(`${capture.file} exceeds 256 KiB`);
    await page.close();
    console.log(`Captured ${capture.file} (${statSync(file).size} bytes)`);
  }
} finally {
  await browser?.close();
  await new Promise((resolveClose, reject) => server.close((error) => error ? reject(error) : resolveClose()));
}
