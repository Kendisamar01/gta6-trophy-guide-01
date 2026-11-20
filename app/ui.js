function textElement(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  return element;
}

export function renderCards(container, trophies, earned, onToggle) {
  const fragment = document.createDocumentFragment();
  for (const trophy of trophies) {
    const done = earned.has(trophy.id);
    const card = document.createElement('article');
    card.className = `trophy-card${done ? ' is-earned' : ''}`;

    card.append(textElement('span', 'trophy-index', String(trophy.id).padStart(2, '0')));
    const body = document.createElement('div');
    body.className = 'trophy-body';
    const kicker = document.createElement('p');
    kicker.className = 'trophy-kicker';
    kicker.append(textElement('span', 'type-tag', trophy.type));
    kicker.append(textElement('span', '', `EST. ${trophy.rarity}`));
    body.append(kicker);
    body.append(textElement('h3', 'trophy-name', trophy.name));
    body.append(textElement('p', 'trophy-description', trophy.description));
    const hint = document.createElement('p');
    hint.className = 'trophy-hint';
    hint.append(textElement('strong', '', 'FIELD NOTE  '));
    hint.append(document.createTextNode(trophy.hint));
    body.append(hint);
    card.append(body);

    const mark = document.createElement('button');
    mark.type = 'button';
    mark.className = 'mark-button';
    mark.setAttribute('aria-label', `${done ? 'Unmark' : 'Mark'} ${trophy.name}`);
    mark.setAttribute('aria-pressed', String(done));
    mark.addEventListener('click', () => onToggle(trophy.id));
    card.append(mark);
    fragment.append(card);
  }
  container.replaceChildren(fragment);
}

export function setProgress(total, earned) {
  const percent = total === 0 ? 0 : Math.round((earned / total) * 100);
  document.querySelector('#earned-count').textContent = String(earned);
  document.querySelector('#total-count').textContent = String(total);
  document.querySelector('#progress-percent').textContent = `${percent}%`;
  const bar = document.querySelector('#progress-bar');
  bar.setAttribute('aria-valuenow', String(percent));
  document.querySelector('#progress-fill').style.width = `${percent}%`;
  const message = percent === 100
    ? 'Leonida is yours. What a ride.'
    : percent >= 60
      ? 'The horizon is getting closer.'
      : percent >= 25
        ? 'Your story is taking shape.'
        : 'Every great story starts somewhere.';
  document.querySelector('#progress-message').textContent = message;
}
