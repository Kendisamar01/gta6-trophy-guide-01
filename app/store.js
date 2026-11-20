const STORAGE_KEY = 'leonida-ledger.progress.v1';

export function readProgress(knownIds) {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { earned: new Set(), repaired: false };

  try {
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved)) throw new TypeError('Progress must be a list.');
    const accepted = saved.filter((id) => Number.isInteger(id) && knownIds.has(id));
    return { earned: new Set(accepted), repaired: accepted.length !== saved.length };
  } catch (error) {
    if (!(error instanceof SyntaxError) && !(error instanceof TypeError)) throw error;
    return { earned: new Set(), repaired: true };
  }
}

export function writeProgress(earned) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

export function parseImport(text, knownIds) {
  const parsed = JSON.parse(text);
  const values = Array.isArray(parsed) ? parsed : parsed?.earned;
  if (!Array.isArray(values)) throw new TypeError('Choose a Leonida Ledger progress export.');

  const accepted = values.filter((id) => Number.isInteger(id) && knownIds.has(id));
  if (accepted.length === 0 && values.length > 0) {
    throw new TypeError('This file has no trophy IDs in common with this guide.');
  }
  return new Set(accepted);
}

export function createExport(earned) {
  return JSON.stringify({
    format: 'leonida-ledger-progress',
    version: 1,
    earned: [...earned].sort((a, b) => a - b),
  }, null, 2);
}
