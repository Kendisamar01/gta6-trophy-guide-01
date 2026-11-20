const STORAGE_KEY = 'vice-city-field-notes.progress.v1';
const FORMAT_VERSION = 1;

export function readProgress(validIds) {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return new Set();

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new Error('Saved progress is not valid JSON. Export a backup or clear this browser’s site data.');
  }

  if (payload?.version !== FORMAT_VERSION || !Array.isArray(payload.earned)) {
    throw new Error('Saved progress uses an unknown format and was not loaded.');
  }
  if (payload.earned.some((id) => typeof id !== 'string')) {
    throw new Error('Saved progress contains invalid trophy identifiers and was not loaded.');
  }

  return new Set(payload.earned.filter((id) => validIds.has(id)));
}

export function writeProgress(earned) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: FORMAT_VERSION,
    earned: [...earned],
  }));
}

export function parseProgressImport(text, validIds) {
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }

  if (payload?.version !== FORMAT_VERSION || !Array.isArray(payload.earned)) {
    throw new Error('That file is not a Vice City Field Notes progress export.');
  }
  if (payload.earned.some((id) => typeof id !== 'string')) {
    throw new Error('The progress file contains a non-text trophy identifier.');
  }

  const recognized = payload.earned.filter((id) => validIds.has(id));
  return {
    earned: new Set(recognized),
    skipped: payload.earned.length - recognized.length,
  };
}

export function downloadProgress(earned) {
  const blob = new Blob([JSON.stringify({
    version: FORMAT_VERSION,
    earned: [...earned],
  }, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = 'vice-city-field-notes-progress.json';
  link.click();
  URL.revokeObjectURL(url);
}
