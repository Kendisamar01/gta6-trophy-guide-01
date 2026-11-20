const STORAGE_KEY = 'leonida-trophy-atlas-progress-v1';

export function loadProgress() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return new Set();
  try {
    const values = JSON.parse(saved);
    if (!Array.isArray(values)) throw new TypeError('Progress must be a list of trophy ids.');
    return new Set(values.filter((value) => Number.isInteger(value) && value > 0));
  } catch (error) {
    console.warn('Saved trophy progress was unreadable; starting with an empty checklist.', error);
    return new Set();
  }
}

export function saveProgress(earned) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}

export function clearProgress() {
  localStorage.removeItem(STORAGE_KEY);
}
