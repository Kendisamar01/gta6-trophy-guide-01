import { readFileSync } from 'node:fs';

const shots = JSON.parse(readFileSync(new URL('./shots.json', import.meta.url), 'utf8'));
if (!Array.isArray(shots) || shots.length < 1 || shots.length > 4) {
  throw new TypeError('The shot manifest must contain between one and four views.');
}

const names = new Set();
for (const shot of shots) {
  if (!shot || typeof shot.file !== 'string' || !shot.file.endsWith('.png')
    || typeof shot.path !== 'string' || !shot.path.startsWith('/')
    || !Number.isInteger(shot.viewport?.width) || !Number.isInteger(shot.viewport?.height)) {
    throw new TypeError('Each shot needs a PNG name, a local route, and integer viewport dimensions.');
  }
  if (names.has(shot.file)) throw new TypeError(`Repeated shot file name: ${shot.file}`);
  names.add(shot.file);
}

console.log(JSON.stringify(shots, null, 2));
