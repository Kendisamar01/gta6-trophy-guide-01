import { cpSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR ?? join(root, 'out');
const requiredFiles = [
  'app/index.html',
  'app/style.css',
  'app/app.js',
  'app/ui.js',
  'app/store.js',
  'app/data/trophies.json',
  'app/data/trophies.js',
  'shots.json',
  'shots.mjs',
];

for (const relativePath of requiredFiles) {
  const source = join(root, relativePath);
  if (!statSync(source).isFile()) throw new Error(`Required build input is not a file: ${relativePath}`);
}

mkdirSync(output, { recursive: true });
cpSync(join(root, 'app'), join(output, 'app'), { recursive: true });
cpSync(join(root, 'shots.json'), join(output, 'shots.json'));
cpSync(join(root, 'shots.mjs'), join(output, 'shots.mjs'));

console.log(`Built offline trophy guide at ${output}`);
