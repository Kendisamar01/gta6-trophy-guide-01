const gradeOrder = ['platinum', 'gold', 'silver', 'bronze'];

export function renderRows({ trophies, earned, query, grade, status, showHints, onToggle }) {
  const body = document.getElementById('trophy-rows');
  const needle = query.trim().toLocaleLowerCase();
  const visible = trophies.filter((trophy) => {
    const matchesGrade = grade === 'all' || trophy.type === grade;
    const isEarned = earned.has(trophy.id);
    const matchesStatus = status === 'all' || (status === 'earned' ? isEarned : !isEarned);
    const searchable = `${trophy.name} ${trophy.description} ${trophy.hint}`.toLocaleLowerCase();
    return matchesGrade && matchesStatus && (!needle || searchable.includes(needle));
  }).sort((a, b) => {
    const gradeDelta = gradeOrder.indexOf(a.type) - gradeOrder.indexOf(b.type);
    return gradeDelta || a.id - b.id;
  });

  body.replaceChildren();
  if (visible.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.className = 'empty-state';
    cell.textContent = 'No entries match this stretch of road. Try another filter.';
    row.append(cell);
    body.append(row);
  }

  for (const trophy of visible) {
    const row = document.createElement('tr');
    const isEarned = earned.has(trophy.id);
    if (isEarned) row.className = 'earned-row';

    const earnedCell = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'check';
    checkbox.checked = isEarned;
    checkbox.setAttribute('aria-label', `${isEarned ? 'Unmark' : 'Mark'} ${trophy.name}`);
    checkbox.addEventListener('change', () => onToggle(trophy.id, checkbox.checked));
    earnedCell.append(checkbox);

    const titleCell = document.createElement('td');
    const title = document.createElement('div');
    title.className = 'title-line';
    const id = document.createElement('span');
    id.className = 'trophy-id';
    id.textContent = `#${String(trophy.id).padStart(2, '0')}`;
    title.append(id, document.createTextNode(trophy.name));
    const description = document.createElement('div');
    description.className = 'description';
    description.textContent = trophy.description;
    titleCell.append(title, description);

    const gradeCell = document.createElement('td');
    const gradeLabel = document.createElement('span');
    gradeLabel.className = `grade grade-${trophy.type}`;
    gradeLabel.textContent = trophy.type;
    gradeCell.append(gradeLabel);

    const rarityCell = document.createElement('td');
    rarityCell.className = 'rarity';
    rarityCell.textContent = `${trophy.rarity}%`;

    const hintCell = document.createElement('td');
    hintCell.className = showHints ? 'hint' : 'hint-locked';
    hintCell.textContent = showHints ? trophy.hint : 'Enable hints to reveal the field note';

    row.append(earnedCell, titleCell, gradeCell, rarityCell, hintCell);
    body.append(row);
  }

  document.getElementById('result-count').textContent =
    `${visible.length} ${visible.length === 1 ? 'entry' : 'entries'} shown`;
}

export function updateProgress(trophies, earned) {
  const total = trophies.length;
  const count = earned.size;
  const percentage = total ? Math.round((count / total) * 100) : 0;
  document.getElementById('earned-count').textContent = String(count);
  document.getElementById('total-count').textContent = String(total);
  document.getElementById('percent').textContent = `${percentage}%`;
  document.getElementById('progress-ring').style.setProperty('--progress', `${percentage * 3.6}deg`);
  document.getElementById('progress-ring').setAttribute('aria-label', `${percentage} percent complete`);
  document.getElementById('remaining-copy').textContent = count === total
    ? 'Every mile is in the books.'
    : `${total - count} ${total - count === 1 ? 'entry' : 'entries'} left on your route.`;
}

export function notify(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(notify.timeout);
  notify.timeout = setTimeout(() => toast.classList.remove('visible'), 2800);
}
