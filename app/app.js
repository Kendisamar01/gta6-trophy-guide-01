import trophyData from './data/trophies.js';
import { clearProgress, loadProgress, saveProgress } from './store.js';
import { renderCards, setProgress } from './ui.js';

const cards = document.querySelector('#cards');
const search = document.querySelector('#search');
const typeFilter = document.querySelector('#type-filter');
const statusFilter = document.querySelector('#status-filter');
const sortOrder = document.querySelector('#sort-order');
const emptyState = document.querySelector('#empty-state');
const resultCount = document.querySelector('#result-count');
const saveStatus = document.querySelector('#save-status');
const trophies = trophyData.trophies;
let earned = loadProgress();

for (const type of [...new Set(trophies.map((trophy) => trophy.type))].sort()) {
  const option = document.createElement('option');
  option.value = type;
  option.textContent = type;
  typeFilter.append(option);
}

function visibleTrophies() {
  const query = search.value.trim().toLocaleLowerCase();
  const result = trophies.filter((trophy) => {
    const matchesText = !query || [trophy.name, trophy.description, trophy.hint, trophy.type]
      .some((value) => value.toLocaleLowerCase().includes(query));
    const matchesType = typeFilter.value === 'all' || trophy.type === typeFilter.value;
    const matchesStatus = statusFilter.value === 'all'
      || (statusFilter.value === 'earned' ? earned.has(trophy.id) : !earned.has(trophy.id));
    return matchesText && matchesType && matchesStatus;
  });

  if (sortOrder.value === 'name') {
    result.sort((left, right) => left.name.localeCompare(right.name));
  } else if (sortOrder.value === 'rarity') {
    result.sort((left, right) => Number.parseFloat(left.rarity) - Number.parseFloat(right.rarity));
  }
  return result;
}

function refresh() {
  const visible = visibleTrophies();
  renderCards(cards, visible, earned, (id) => {
    if (earned.has(id)) earned.delete(id);
    else earned.add(id);
    saveProgress(earned);
    saveStatus.textContent = 'SAVED IN THIS BROWSER';
    refresh();
  });
  setProgress(trophies.length, earned.size);
  resultCount.textContent = `${visible.length} ${visible.length === 1 ? 'milestone' : 'milestones'} shown`;
  emptyState.hidden = visible.length > 0;
  cards.hidden = visible.length === 0;
}

for (const control of [search, typeFilter, statusFilter, sortOrder]) {
  control.addEventListener('input', refresh);
  control.addEventListener('change', refresh);
}

document.querySelector('#reset-progress').addEventListener('click', () => {
  if (earned.size === 0 || !window.confirm('Clear every checked milestone from this browser?')) return;
  earned = new Set();
  clearProgress();
  saveStatus.textContent = 'CHECKLIST CLEARED';
  refresh();
});

refresh();
