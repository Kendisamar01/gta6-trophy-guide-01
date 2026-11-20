import { trophies } from './data/trophies.js';
import {
  downloadProgress,
  parseProgressImport,
  readProgress,
  writeProgress,
} from './store.js';
import { renderGuide, renderProgress, setNotice } from './ui.js';

const trophyIds = new Set(trophies.map((trophy) => trophy.id));
let earned = new Set();

try {
  earned = readProgress(trophyIds);
} catch (error) {
  setNotice(error.message, true);
}

function refresh() {
  renderProgress(earned, trophies.length);
  renderGuide({
    trophies,
    earned,
    query: document.getElementById('search').value,
    grade: document.getElementById('grade').value,
    type: document.getElementById('kind').value,
    showHints: document.getElementById('spoilers').checked,
    onToggle: toggleTrophy,
  });
}

function toggleTrophy(id) {
  if (!trophyIds.has(id)) return;
  const updated = new Set(earned);
  if (updated.has(id)) updated.delete(id);
  else updated.add(id);

  try {
    writeProgress(updated);
    earned = updated;
    setNotice('Field log saved on this device.');
  } catch (error) {
    setNotice(`Progress could not be saved: ${error.message}`, true);
  }
  refresh();
}

document.getElementById('search').addEventListener('input', refresh);
document.getElementById('grade').addEventListener('change', refresh);
document.getElementById('kind').addEventListener('change', refresh);
document.getElementById('spoilers').addEventListener('change', refresh);
document.getElementById('clear-filters').addEventListener('click', () => {
  document.getElementById('search').value = '';
  document.getElementById('grade').value = 'all';
  document.getElementById('kind').value = 'all';
  refresh();
});

document.getElementById('export').addEventListener('click', () => {
  try {
    downloadProgress(earned);
    setNotice('Progress export downloaded.');
  } catch (error) {
    setNotice(`Export could not be created: ${error.message}`, true);
  }
});

document.getElementById('import').addEventListener('change', async (event) => {
  const input = event.currentTarget;
  const file = input.files[0];
  if (!file) return;

  try {
    const imported = parseProgressImport(await file.text(), trophyIds);
    writeProgress(imported.earned);
    earned = imported.earned;
    const skipped = imported.skipped
      ? ` ${imported.skipped} unknown entr${imported.skipped === 1 ? 'y was' : 'ies were'} skipped.`
      : '';
    setNotice(`Progress imported.${skipped}`);
  } catch (error) {
    setNotice(`Import failed: ${error.message}`, true);
  } finally {
    input.value = '';
    refresh();
  }
});

refresh();
