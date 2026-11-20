(() => {
  const stages = [
    { title: 'Get your bearings', caption: 'Begin the story and learn your way around.' },
    { title: 'Follow the main roads', caption: 'Reach the next campaign milestones.' },
    { title: 'Open the map', caption: 'Discover the region and try its activities.' },
    { title: 'Build your skill set', caption: 'Work on races, range challenges, and stunts.' },
    { title: 'Take the side roads', caption: 'Finish stranger strands and longer collections.' },
    { title: 'Close the loop', caption: 'Complete the final cleanup and claim platinum.' },
  ];
  const filters = [
    { id: 'all', label: 'All', matches: () => true },
    { id: 'story', label: 'Story', matches: (item) => item.kind === 'story' },
    { id: 'missable', label: 'Missable', matches: (item) => item.missable },
    { id: 'collectibles', label: 'Collectibles', matches: (item) => item.kind === 'collectible' },
    { id: 'activities', label: 'Activities', matches: (item) => item.kind === 'activity' },
    { id: 'online', label: 'Online', matches: (item) => item.kind === 'online' },
  ];

  function make(tag, className = '', text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function obscured(item, progress, spoilers) {
    return spoilers && item.kind === 'story' && !progress.has(item.id);
  }

  function titleFor(item, progress, spoilers) {
    return obscured(item, progress, spoilers) ? `Story trophy #${String(item.id).padStart(2, '0')}` : item.name;
  }

  function filterBar(root, current, onChoose) {
    root.replaceChildren();
    for (const filter of filters) {
      const button = make('button', `filter-button${filter.id === current ? ' active' : ''}`, filter.label);
      button.type = 'button';
      button.setAttribute('aria-pressed', String(filter.id === current));
      button.addEventListener('click', () => onChoose(filter.id));
      root.append(button);
    }
  }

  function trophyRow(item, options) {
    const { selected, progress, spoilers, onSelect, onToggle } = options;
    const hidden = obscured(item, progress, spoilers);
    const row = make('article', `trophy-row${selected === item.id ? ' selected' : ''}`);
    row.tabIndex = 0;
    row.setAttribute('aria-label', `${titleFor(item, progress, spoilers)}${item.missable ? ', missable flag' : ''}`);
    row.addEventListener('click', () => onSelect(item.id));
    row.addEventListener('keydown', (event) => {
      if (event.target === row && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onSelect(item.id);
      }
    });

    const check = make('input', 'earn-check');
    check.type = 'checkbox';
    check.checked = progress.has(item.id);
    check.setAttribute('aria-label', `Mark ${titleFor(item, progress, spoilers)} earned`);
    check.addEventListener('click', (event) => event.stopPropagation());
    check.addEventListener('change', () => onToggle(item.id, check.checked));

    const copy = make('span', 'trophy-copy');
    copy.append(make('strong', 'trophy-name', titleFor(item, progress, spoilers)));
    copy.append(make('span', 'trophy-description', hidden ? 'Earn this trophy to reveal its description.' : item.description));
    const tags = make('span', 'row-tags');
    if (item.missable) tags.append(make('span', 'missable-tag', 'MISSABLE'));
    tags.append(make('span', `grade-tag ${item.grade}`, item.grade), make('span', 'kind-tag', item.kind));
    row.append(check, make('span', 'trophy-number', String(item.id).padStart(2, '0')), copy, tags);
    return row;
  }

  function checklist(options) {
    const { root, trophies, filter, search, selected, progress, spoilers, onSelect, onToggle } = options;
    const active = filters.find((item) => item.id === filter) ?? filters[0];
    const term = search.trim().toLocaleLowerCase();
    const results = trophies.filter((item) => active.matches(item)
      && (!term || `${item.name} ${item.description} ${item.kind}`.toLocaleLowerCase().includes(term)));
    document.getElementById('list-title').textContent = active.label === 'All' ? 'All trophies' : `${active.label} trophies`;
    document.getElementById('list-count').textContent = `${results.length} ${results.length === 1 ? 'entry' : 'entries'}`;
    root.replaceChildren();
    if (!results.length) {
      root.append(make('p', 'empty-state', term ? 'No trophies match that search.' : 'There are no trophies in this category.'));
      return;
    }
    for (const item of results) root.append(trophyRow(item, { selected, progress, spoilers, onSelect, onToggle }));
  }

  function addSources(root, sources) {
    root.replaceChildren();
    for (const source of sources) {
      let address;
      try {
        address = new URL(source.url);
      } catch {
        continue;
      }
      if (address.protocol !== 'https:') continue;
      const link = make('a', 'source-link', source.label);
      link.href = address.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      root.append(link);
    }
  }

  function detail(root, item, progress, spoilers) {
    root.replaceChildren();
    if (!item) {
      const empty = make('div', 'detail-empty');
      empty.append(make('span', 'detail-kicker', 'FIELD NOTE / 00'), make('strong', '', 'Choose a trophy'));
      empty.append(make('p', '', 'Select an entry to see its requirement, route notes, and references.'));
      root.append(empty);
      return;
    }

    const hidden = obscured(item, progress, spoilers);
    const heading = make('div', 'detail-kicker', `${item.kind.toUpperCase()} / FIELD NOTE`);
    heading.append(make('span', 'detail-id', `NO. ${String(item.id).padStart(2, '0')}`));
    root.append(heading, make('h2', '', titleFor(item, progress, spoilers)));
    root.append(make('p', 'detail-desc', hidden ? 'Story details are hidden until this trophy is earned.' : item.description));

    if (hidden) {
      root.append(make('div', 'detail-divider'), make('p', 'detail-label', 'SPOILER GUARD'));
      root.append(make('p', 'detail-guide', 'Mark this trophy as earned to reveal its name and description.'));
    } else {
      root.append(make('div', 'detail-divider'), make('p', 'detail-label', 'THE ROUTE'));
      root.append(make('p', 'detail-guide', item.guide), make('div', 'detail-divider'), make('p', 'detail-label', 'DO THIS'));
      const steps = make('ol', 'detail-steps');
      for (const instruction of item.steps) steps.append(make('li', '', instruction));
      root.append(steps);
      if (item.missable) root.append(make('p', 'missable-note', `MISSABLE PRECAUTION · ${item.missable_note}`));
      root.append(make('div', 'detail-divider'), make('p', 'detail-label', 'REFERENCES'));
      const references = make('div', 'source-list');
      addSources(references, item.sources);
      root.append(references);
    }

    const actions = make('div', 'detail-actions');
    const label = make('label', 'detail-earned');
    const earned = make('input');
    earned.type = 'checkbox';
    earned.checked = progress.has(item.id);
    earned.addEventListener('change', () => window.GuideActions.toggle(item.id, earned.checked));
    label.append(earned, document.createTextNode('Mark earned'));
    actions.append(label, make('span', `detail-grade ${item.grade}`, item.grade));
    root.append(actions);
  }

  function roadmap(root, trophies, selected, progress, spoilers, actions) {
    const board = make('div', 'roadmap');
    board.append(make('p', 'roadmap-intro', 'A flexible six-stage route from the opening story through the final cleanup.'));
    const flagged = trophies.filter((item) => item.missable);
    if (flagged.length) {
      const notice = make('div', 'roadmap-watch');
      notice.append(make('span', 'detail-label', `SAVE-FIRST FLAGS · ${flagged.length}`));
      for (const item of flagged) {
        const chip = make('button', 'watch-chip', `${String(item.id).padStart(2, '0')} · ${titleFor(item, progress, spoilers)}`);
        chip.type = 'button';
        chip.addEventListener('click', () => actions.onSelect(item.id));
        notice.append(chip);
      }
      board.append(notice);
    }

    stages.forEach((stage, index) => {
      const number = index + 1;
      const entries = trophies.filter((item) => item.roadmap_stage === number);
      const done = entries.filter((item) => progress.has(item.id)).length;
      const card = make('section', 'stage-card');
      const header = make('div', 'stage-head');
      const heading = make('div');
      heading.append(make('h3', 'stage-title', stage.title), make('p', 'stage-caption', stage.caption));
      header.append(make('span', 'stage-number', String(number).padStart(2, '0')), heading, make('span', 'stage-count', `${done}/${entries.length} done`));
      const chips = make('div', 'stage-trophies');
      for (const item of entries) {
        const hidden = obscured(item, progress, spoilers);
        const chip = make('button', `stage-chip${selected === item.id ? ' selected' : ''}`);
        chip.type = 'button';
        chip.addEventListener('click', () => actions.onSelect(item.id));
        chip.append(make('span', '', String(item.id).padStart(2, '0')), make('strong', '', titleFor(item, progress, spoilers)));
        if (item.missable) chip.append(make('span', 'missable-tag', 'MISSABLE'));
        if (hidden) chip.setAttribute('aria-label', `Story trophy ${item.id}, details hidden`);
        chips.append(chip);
      }
      card.append(header, chips);
      const stageFlags = entries.filter((item) => item.missable).length;
      if (stageFlags) card.append(make('div', 'stage-warning', `${stageFlags} precautionary missable flag${stageFlags === 1 ? '' : 's'} · consider a save before one-off events`));
      board.append(card);
    });
    root.replaceChildren(board);
  }

  function progress(label, percentLabel, countLabel, fill, store, total) {
    const count = store.count();
    const percent = total ? Math.round((count / total) * 100) : 0;
    label.textContent = `${count} / ${total} earned`;
    percentLabel.textContent = `${percent}% complete`;
    countLabel.textContent = String(count).padStart(2, '0');
    fill.style.width = `${percent}%`;
    fill.parentElement.setAttribute('aria-valuenow', String(count));
  }

  window.GuideView = { filters, filterBar, checklist, detail, roadmap, progress };
})();
