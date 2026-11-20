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
  let sourceStat;
  try {
    sourceStat = statSync(source);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      throw new Error(`Required build input is missing: ${relativePath}`, { cause: error });
    }
    throw error;
  }
  if (!sourceStat.isFile()) throw new Error(`Required build input is not a file: ${relativePath}`);
}

mkdirSync(output, { recursive: true });
cpSync(join(root, 'app'), join(output, 'app'), { recursive: true });
cpSync(join(root, 'shots.json'), join(output, 'shots.json'));
cpSync(join(root, 'shots.mjs'), join(output, 'shots.mjs'));

console.log(`Built offline trophy guide at ${output} (app, shots.json, shots.mjs)`);
