import capturePlan from './shots.json' with { type: 'json' };

const names = new Set();
for (const shot of capturePlan) {
  if (!shot.file || !shot.path?.startsWith('/') || !Number.isInteger(shot.viewport?.width) || !Number.isInteger(shot.viewport?.height)) {
    throw new TypeError('Each shot needs a file name, an absolute app path, and an integer viewport.');
  }
  if (names.has(shot.file)) throw new TypeError(`Duplicate capture file: ${shot.file}`);
  names.add(shot.file);
}

console.log(`Capture plan is valid: ${capturePlan.length} views`);
for (const shot of capturePlan) {
  console.log(`${shot.file}: ${shot.view} at ${shot.viewport.width}x${shot.viewport.height}`);
}
