function makeTag(className, text) {
  const tag = document.createElement('span');
  tag.className = className;
  tag.textContent = text;
  return tag;
}

function makeRarity(trophy) {
  const wrapper = document.createElement('p');
  wrapper.className = 'rarity';
  wrapper.append(document.createTextNode(`Estimated rarity · ${trophy.rarity}%`));
  const meter = document.createElement('span');
  meter.className = 'rarity-meter';
  meter.setAttribute('aria-hidden', 'true');

  const filled = Math.max(1, Math.min(5, Math.round(trophy.rarity / 20)));
  for (let index = 0; index < 5; index += 1) {
    const segment = document.createElement('i');
    if (index < filled) segment.className = 'filled';
    meter.append(segment);
  }
  wrapper.append(meter);
  return wrapper;
}

function makeCard(trophy, earned, showHints) {
  const card = document.createElement('article');
  card.className = `trophy-card${earned.has(trophy.id) ? ' is-earned' : ''}`;

  const check = document.createElement('button');
  check.className = 'check-control';
  check.type = 'button';
  check.dataset.trophyId = trophy.id;
  check.setAttribute('aria-label', `${earned.has(trophy.id) ? 'Unmark' : 'Mark'} ${trophy.name}`);
  check.setAttribute('aria-pressed', String(earned.has(trophy.id)));
  check.textContent = '✓';

  const content = document.createElement('div');
  const top = document.createElement('div');
  top.className = 'trophy-topline';
  top.append(makeTag(`grade-badge grade-${trophy.grade}`, trophy.grade));
  top.append(makeTag('kind-label', trophy.type));

  const title = document.createElement('h3');
  title.className = 'trophy-name';
  title.textContent = trophy.name;
  const description = document.createElement('p');
  description.className = 'trophy-description';
  description.textContent = trophy.description;

  content.append(top, title, description);
  if (showHints) {
    const hint = document.createElement('p');
    hint.className = 'hint';
    const label = document.createElement('strong');
    label.textContent = 'FIELD TIP';
    hint.append(label, document.createTextNode(trophy.hint));
    content.append(hint);
  }
  content.append(makeRarity(trophy));
  card.append(check, content);
  return card;
}

export function renderGuide({
  trophies,
  earned,
  query,
  grade,
  type,
  showHints,
  onToggle,
}) {
  const list = document.getElementById('rows');
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visible = trophies.filter((trophy) => {
    const matchesGrade = grade === 'all' || trophy.grade === grade;
    const matchesType = type === 'all' || trophy.type === type;
    const searchable = `${trophy.name} ${trophy.description} ${trophy.hint} ${trophy.type}`.toLocaleLowerCase();
    return matchesGrade && matchesType && searchable.includes(normalizedQuery);
  });

  list.replaceChildren(...visible.map((trophy) => makeCard(trophy, earned, showHints)));
  document.getElementById('visible-count').textContent = `${visible.length} / ${trophies.length}`;
  document.getElementById('empty-state').hidden = visible.length > 0;
  list.onclick = (event) => {
    const button = event.target.closest('button[data-trophy-id]');
    if (button) onToggle(button.dataset.trophyId);
  };
}

export function renderProgress(earned, total) {
  const count = earned.size;
  const percentage = total === 0 ? 0 : Math.round((count / total) * 100);
  document.getElementById('earned-count').textContent = String(count);
  document.getElementById('total-count').textContent = String(total);
  document.getElementById('percent').textContent = `${percentage}%`;
  document.getElementById('progress-fill').style.width = `${percentage}%`;
  document.querySelector('[role="progressbar"]').setAttribute('aria-valuenow', String(percentage));
}

export function setNotice(message, isError = false) {
  const notice = document.getElementById('notice');
  notice.textContent = message;
  notice.dataset.state = isError ? 'error' : 'success';
}
