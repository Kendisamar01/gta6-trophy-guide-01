(function () {
  const stages = [
    { title: 'Get your bearings', caption: 'Start the campaign and open up Leonida.' },
    { title: 'Follow the main roads', caption: 'Push through the next chapter milestones.' },
    { title: 'Open the map', caption: 'Explore regions and sample the state’s activities.' },
    { title: 'Build your skill set', caption: 'Races, range work, stunts, and street challenges.' },
    { title: 'Take the side roads', caption: 'Stranger strands, collectibles, and longer grinds.' },
    { title: 'Close the loop', caption: 'Finish 100%, secure the properties, and claim platinum.' },
  ];
  const filters = [
    { id: 'all', label: 'All', matches: () => true },
    { id: 'story', label: 'Story', matches: (trophy) => trophy.kind === 'story' },
    { id: 'missable', label: 'Missable', matches: (trophy) => trophy.missable },
    { id: 'collectibles', label: 'Collectibles', matches: (trophy) => trophy.kind === 'collectible' },
    { id: 'activities', label: 'Activities', matches: (trophy) => trophy.kind === 'activity' },
    { id: 'online', label: 'Online', matches: (trophy) => trophy.kind === 'online' },
  ];

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function safeName(trophy, store, spoilers) {
    return spoilers && trophy.kind === 'story' && !store.has(trophy.id)
      ? `Story trophy #${String(trophy.id).padStart(2, '0')}`
      : trophy.name;
  }

  function isHidden(trophy, store, spoilers) {
    return spoilers && trophy.kind === 'story' && !store.has(trophy.id);
  }

  function renderFilterTabs(root, active, onChange) {
    root.replaceChildren();
    for (const filter of filters) {
      const button = element('button', `filter-button${active === filter.id ? ' active' : ''}`, filter.label);
      button.type = 'button';
      button.setAttribute('aria-pressed', String(active === filter.id));
      button.addEventListener('click', () => onChange(filter.id));
      root.append(button);
    }
  }

  function makeRow(trophy, selected, store, spoilers, onSelect, onToggle) {
    const hidden = isHidden(trophy, store, spoilers);
    const row = element('article', `trophy-row${selected === trophy.id ? ' selected' : ''}`);
    row.tabIndex = 0;
    row.setAttribute('aria-label', `${safeName(trophy, store, spoilers)}${trophy.missable ? ', missable flag' : ''}`);
    row.addEventListener('click', () => onSelect(trophy.id));
    row.addEventListener('keydown', (event) => {
      if (event.target === row && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onSelect(trophy.id);
      }
    });

    const checkbox = element('input', 'earn-check');
    checkbox.type = 'checkbox';
    checkbox.checked = store.has(trophy.id);
    checkbox.setAttribute('aria-label', `Mark ${safeName(trophy, store, spoilers)} earned`);
    checkbox.addEventListener('click', (event) => event.stopPropagation());
    checkbox.addEventListener('change', () => onToggle(trophy.id, checkbox.checked));

    const number = element('span', 'trophy-number', String(trophy.id).padStart(2, '0'));
    const copy = element('span', 'trophy-copy');
    copy.append(element('strong', 'trophy-name', safeName(trophy, store, spoilers)));
    copy.append(element('span', 'trophy-description', hidden ? 'Earn this trophy to reveal its description.' : trophy.description));

    const tags = element('span', 'row-tags');
    if (trophy.missable) tags.append(element('span', 'missable-tag', 'MISSABLE'));
    tags.append(element('span', `grade-tag ${trophy.grade}`, trophy.grade));
    tags.append(element('span', 'kind-tag', trophy.kind));
    row.append(checkbox, number, copy, tags);
    return row;
  }

  function renderChecklist(root, trophies, filter, search, selected, store, spoilers, onSelect, onToggle) {
    const currentFilter = filters.find((item) => item.id === filter) ?? filters[0];
    const query = search.trim().toLowerCase();
    const filtered = trophies.filter((trophy) => {
      if (!currentFilter.matches(trophy)) return false;
      if (!query) return true;
      return `${trophy.name} ${trophy.description} ${trophy.kind}`.toLowerCase().includes(query);
    });
    document.getElementById('list-title').textContent = currentFilter.label === 'All' ? 'All trophies' : `${currentFilter.label} trophies`;
    document.getElementById('list-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'entry' : 'entries'}`;
    root.replaceChildren();
    if (!filtered.length) {
      root.append(element('p', 'empty-state', query ? 'No trophies match that search.' : 'No trophies in this category. The list is kept empty when the official set has no matching entries.'));
      return;
    }
    for (const trophy of filtered) root.append(makeRow(trophy, selected, store, spoilers, onSelect, onToggle));
  }

  function renderSources(root, sources) {
    root.replaceChildren();
    for (const source of sources) {
      const link = element('a', 'source-link', source.label);
      const sourceOrigin = ['https:', '', 'www.exophase.com'].join('/');
      link.href = `${sourceOrigin}/${source.url.replace(/^\/+/, '')}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      root.append(link);
    }
  }

  function renderDetail(root, trophy, store, spoilers) {
    root.replaceChildren();
    if (!trophy) {
      const empty = element('div', 'detail-empty');
      empty.append(element('span', 'detail-kicker', 'FIELD NOTE / 00'));
      empty.append(element('strong', '', 'Choose a trophy'));
      empty.append(element('p', '', 'Select any entry to see its requirement, route notes, steps, and references.'));
      root.append(empty);
      return;
    }
    const hidden = isHidden(trophy, store, spoilers);
    root.append(element('div', 'detail-kicker', `${trophy.kind.toUpperCase()} / FIELD NOTE`));
    root.lastChild.append(element('span', 'detail-id', `NO. ${String(trophy.id).padStart(2, '0')}`));
    root.append(element('h2', '', safeName(trophy, store, spoilers)));
    root.append(element('p', 'detail-desc', hidden ? 'Story details are hidden until this trophy is earned.' : trophy.description));

    if (hidden) {
      root.append(element('div', 'detail-divider'));
      root.append(element('p', 'detail-label', 'SPOILER GUARD'));
      root.append(element('p', 'detail-guide', 'Mark this trophy earned to reveal its name and description. Other story details stay tucked away while spoiler protection is on.'));
    } else {
      root.append(element('div', 'detail-divider'));
      root.append(element('p', 'detail-label', 'THE ROUTE'));
      root.append(element('p', 'detail-guide', trophy.guide));
      root.append(element('div', 'detail-divider'));
      root.append(element('p', 'detail-label', 'DO THIS'));
      const steps = element('ol', 'detail-steps');
      for (const step of trophy.steps) steps.append(element('li', '', step));
      root.append(steps);
      if (trophy.missable) root.append(element('p', 'missable-note', `MISSABLE PRECAUTION · ${trophy.missable_note}`));
      root.append(element('div', 'detail-divider'));
      root.append(element('p', 'detail-label', 'REFERENCES'));
      const sources = element('div', 'source-list');
      renderSources(sources, trophy.sources);
      root.append(sources);
    }

    const actions = element('div', 'detail-actions');
    const label = element('label', 'detail-earned');
    const checkbox = element('input');
    checkbox.type = 'checkbox';
    checkbox.checked = store.has(trophy.id);
    checkbox.addEventListener('change', () => window.GuideActions.toggle(trophy.id, checkbox.checked));
    label.append(checkbox, document.createTextNode('Mark earned'));
    actions.append(label, element('span', `detail-grade ${trophy.grade}`, trophy.grade));
    root.append(actions);
  }

  function renderRoadmap(root, trophies, selected, store, spoilers, onSelect, onToggle) {
    const roadmap = element('div', 'roadmap');
    roadmap.append(element('p', 'roadmap-intro', 'A flexible six-stage route from the opening story to the last cleanup task. It is an order-of-operations suggestion, not a spoiler-heavy walkthrough.'));
    const flagged = trophies.filter((trophy) => trophy.missable);
    if (flagged.length) {
      const watch = element('div', 'roadmap-watch');
      watch.append(element('span', 'detail-label', `SAVE-FIRST FLAGS · ${flagged.length}`));
      for (const trophy of flagged) {
        const chip = element('button', 'watch-chip', `${String(trophy.id).padStart(2, '0')} · ${safeName(trophy, store, spoilers)}`);
        chip.type = 'button';
        chip.addEventListener('click', () => onSelect(trophy.id));
        watch.append(chip);
      }
      roadmap.append(watch);
    }
    for (let stage = 1; stage <= stages.length; stage += 1) {
      const entries = trophies.filter((trophy) => trophy.roadmap_stage === stage);
      const done = entries.filter((trophy) => store.has(trophy.id)).length;
      const card = element('section', 'stage-card');
      const head = element('div', 'stage-head');
      head.append(element('span', 'stage-number', String(stage).padStart(2, '0')));
      const title = element('div');
      title.append(element('h3', 'stage-title', stages[stage - 1].title));
      title.append(element('p', 'stage-caption', stages[stage - 1].caption));
      head.append(title, element('span', 'stage-count', `${done}/${entries.length} done`));
      card.append(head);
      const chips = element('div', 'stage-trophies');
      for (const trophy of entries) {
        const hidden = isHidden(trophy, store, spoilers);
        const chip = element('button', 'stage-chip');
        chip.type = 'button';
        chip.addEventListener('click', () => onSelect(trophy.id));
        chip.append(element('span', '', String(trophy.id).padStart(2, '0')));
        chip.append(element('strong', '', safeName(trophy, store, spoilers)));
        if (trophy.missable) chip.append(element('span', 'missable-tag', 'MISSABLE'));
        if (hidden) chip.setAttribute('aria-label', `Story trophy ${trophy.id}, details hidden`);
        chips.append(chip);
      }
      card.append(chips);
      if (entries.some((trophy) => trophy.missable)) {
        card.append(element('div', 'stage-warning', `${entries.filter((trophy) => trophy.missable).length} precautionary missable flag${entries.filter((trophy) => trophy.missable).length === 1 ? '' : 's'} · make a save before one-off events`));
      }
      roadmap.append(card);
    }
    root.replaceChildren(roadmap);
  }

  function renderProgress(store, total) {
    const count = store.count();
    const percent = Math.round((count / total) * 100);
    document.getElementById('progress-label').textContent = `${count} / ${total} earned`;
    document.getElementById('progress-percent').textContent = `${percent}% complete`;
    document.getElementById('earned-count').textContent = String(count).padStart(2, '0');
    const fill = document.getElementById('progress-fill');
    fill.style.width = `${percent}%`;
    fill.parentElement.setAttribute('aria-valuenow', String(count));
  }

  window.TrophyUI = {
    filters,
    renderFilterTabs,
    renderChecklist,
    renderDetail,
    renderRoadmap,
    renderProgress,
  };
})();
