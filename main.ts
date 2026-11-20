import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR ?? join(root, 'out');
const appOutput = join(output, 'app');

mkdirSync(output, { recursive: true });
rmSync(appOutput, { recursive: true, force: true });
cpSync(join(root, 'app'), appOutput, { recursive: true });
writeFileSync(
  join(output, 'build-manifest.json'),
  `${JSON.stringify({
    title: 'Leonida Trophy Atlas',
    entry: 'app/index.html',
    offline: true,
    builtAt: new Date().toISOString(),
  }, null, 2)}\n`,
);

console.log(`Build complete: offline guide at ${appOutput}; manifest at ${join(output, 'build-manifest.json')}`);
