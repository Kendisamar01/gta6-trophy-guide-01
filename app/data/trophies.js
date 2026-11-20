import guide from './trophies.json' with { type: 'json' };

const grades = new Set(['platinum', 'gold', 'silver', 'bronze']);
const kinds = new Set(['story', 'exploration', 'skill', 'collection', 'online', 'misc']);
const identifiers = new Set();

if (!Array.isArray(guide.trophies) || guide.trophies.length < 60 || guide.trophies.length > 80) {
  throw new Error('The concept guide must contain between 60 and 80 trophy entries.');
}

for (const trophy of guide.trophies) {
  if (!trophy.id || identifiers.has(trophy.id)) {
    throw new Error(`Trophy identifiers must be present and unique: ${trophy.id ?? '(missing)'}`);
  }
  identifiers.add(trophy.id);
  if (
    !trophy.name ||
    !grades.has(trophy.grade) ||
    !kinds.has(trophy.type) ||
    !trophy.description ||
    !trophy.hint ||
    !Number.isFinite(trophy.rarity) ||
    trophy.rarity < 0 ||
    trophy.rarity > 100
  ) {
    throw new Error(`Trophy data is incomplete or invalid: ${trophy.id}`);
  }
}

export const title = guide.title;
export const notice = guide.notice;
export const trophies = Object.freeze(guide.trophies.map((trophy) => Object.freeze(trophy)));
