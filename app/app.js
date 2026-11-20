import { createExport, parseImport, readProgress, writeProgress } from './store.js';
import { notify, renderRows, updateProgress } from './ui.js';

const controls = {
  search: document.getElementById('search'),
  grade: document.getElementById('grade-filter'),
  status: document.getElementById('status-filter'),
  hints: document.getElementById('spoiler-toggle'),
  import: document.getElementById('import-file'),
};
let trophies = [];
let earned = new Set();

function redraw() {
  renderRows({
    trophies,
    earned,
    query: controls.search.value,
    grade: controls.grade.value,
    status: controls.status.value,
    showHints: controls.hints.checked,
    onToggle: (id, checked) => {
      if (checked) earned.add(id);
      else earned.delete(id);
      writeProgress(earned);
      updateProgress(trophies, earned);
      redraw();
    },
  });
  updateProgress(trophies, earned);
}

function validateTrophies(data) {
  if (!data || !Array.isArray(data.trophies) || data.trophies.length < 60 || data.trophies.length > 80) {
    throw new TypeError('The guide data must contain 60–80 trophy entries.');
  }
  const ids = new Set();
  for (const trophy of data.trophies) {
    if (!Number.isInteger(trophy.id) || ids.has(trophy.id)
      || !['platinum', 'gold', 'silver', 'bronze'].includes(trophy.type)
      || !['name', 'description', 'hint'].every((key) => typeof trophy[key] === 'string' && trophy[key].trim())
      || !Number.isInteger(trophy.rarity) || trophy.rarity < 1 || trophy.rarity > 100) {
      throw new TypeError('A trophy entry is incomplete or has an invalid ID, grade, or rarity.');
    }
    ids.add(trophy.id);
  }
  return ids;
}

for (const control of [controls.search, controls.grade, controls.status, controls.hints]) {
  control.addEventListener('input', redraw);
  control.addEventListener('change', redraw);
}

document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
    event.preventDefault();
    controls.search.focus();
  }
});

document.getElementById('export').addEventListener('click', () => {
  const file = new Blob([createExport(earned)], { type: 'application/json' });
  const address = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = address;
  link.download = 'leonida-ledger-progress.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(address), 1000);
  notify('Progress export is ready.');
});

controls.import.addEventListener('change', async () => {
  const file = controls.import.files?.[0];
  if (!file) return;
  try {
    earned = parseImport(await file.text(), new Set(trophies.map((trophy) => trophy.id)));
    writeProgress(earned);
    redraw();
    notify(`Imported ${earned.size} marked ${earned.size === 1 ? 'entry' : 'entries'}.`);
  } catch (error) {
    notify(error instanceof Error ? error.message : 'Could not read that progress file.');
  } finally {
    controls.import.value = '';
  }
});

try {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error(`Trophy guide data could not be loaded (HTTP ${response.status}).`);
  const data = await response.json();
  const knownIds = validateTrophies(data);
  trophies = data.trophies;
  const stored = readProgress(knownIds);
  earned = stored.earned;
  if (stored.repaired) notify('Some saved marks were unreadable or outdated; the current entries were kept.');
  redraw();
} catch (error) {
  console.error(error);
  const body = document.getElementById('trophy-rows');
  const row = document.createElement('tr');
  const cell = document.createElement('td');
  cell.colSpan = 5;
  cell.className = 'empty-state';
  cell.textContent = 'The ledger could not open. Serve this folder locally and check that its guide data is present.';
  row.append(cell);
  body.replaceChildren(row);
  document.getElementById('result-count').textContent = 'Guide data unavailable';
  notify(error instanceof Error ? error.message : 'The guide could not be loaded.');
}
