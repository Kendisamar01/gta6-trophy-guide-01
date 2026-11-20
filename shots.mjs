import shots from './shots.json' with { type: 'json' };

if (!Array.isArray(shots)) {
  throw new Error('Shot manifest must be a JSON array.');
}

for (const shot of shots) {
  if (
    typeof shot.file !== 'string' ||
    typeof shot.path !== 'string' ||
    !Number.isInteger(shot.viewport?.width) ||
    !Number.isInteger(shot.viewport?.height)
  ) {
    throw new Error('Every shot needs a file, route, and integer viewport dimensions.');
  }
}

export default shots;
