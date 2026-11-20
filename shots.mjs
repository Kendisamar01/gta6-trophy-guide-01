import { createReadStream, mkdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const appRoot = resolve(fileURLToPath(new URL('./app/', import.meta.url)));
const captureFolder = fileURLToPath(new URL('./screenshots/', import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

const views = [
  { file: '1-checklist.jpg', route: '/?filter=all&trophy=20' },
  { file: '2-roadmap.jpg', route: '/?view=roadmap&trophy=29' },
  { file: '3-guide.jpg', route: '/?view=guide&trophy=29' },
  { file: '4-spoiler.jpg', route: '/?filter=story&spoilers=on' },
];
const server = createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = resolve(join(appRoot, normalize(pathname)));
  if (file !== appRoot && !file.startsWith(`${appRoot}${sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const info = statSync(file);
    if (!info.isFile()) throw new Error('Requested path is not a file.');
    response.writeHead(200, {
      'content-type': types[extname(file).toLowerCase()] ?? 'application/octet-stream',
      'content-length': info.size,
      'cache-control': 'no-store',
    });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404).end('Not found');
  }
});

let browser;
let listening = false;

try {
  mkdirSync(captureFolder, { recursive: true });
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      listening = true;
      resolveListen();
    });
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Could not determine the local server port.');
  browser = await puppeteer.launch({ headless: 'shell' });
  for (const view of views) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
    const errors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`Console: ${message.text()}`);
    });
    page.on('pageerror', (error) => errors.push(`Page: ${error.message}`));
    page.on('requestfailed', (request) => errors.push(`Request: ${request.url()} (${request.failure()?.errorText})`));
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('leonida-field-guide-progress-v1', JSON.stringify([2, 8, 16, 20, 21, 28, 35, 42]));
    });
    await page.goto(`http://127.0.0.1:${address.port}${view.route}`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#detail-panel h2');
    if (errors.length) throw new Error(errors.join('\n'));
    const file = join(captureFolder, view.file);
    await page.screenshot({ path: file, type: 'jpeg', quality: 85, fullPage: false });
    if (statSync(file).size >= 262144) {
      await page.screenshot({ path: file, type: 'jpeg', quality: 78, fullPage: false });
    }
    if (statSync(file).size >= 262144) throw new Error(`${view.file} exceeds 256 KiB`);
    await page.close();
    console.log(`Captured ${view.file} (${statSync(file).size} bytes)`);
  }
} finally {
  await browser?.close();
  if (listening) await new Promise((resolveClose, reject) => {
    server.close((error) => error ? reject(error) : resolveClose());
  });
}
