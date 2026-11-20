(() => {
  const trophies = window.GTA6_TROPHY_DATA.trophies;
  const ui = window.GuideView;
  const progress = window.GuideProgress;
  const query = new URLSearchParams(location.search);
  const filters = new Set(ui.filters.map((item) => item.id));
  const page = {
    filter: filters.has(query.get('filter')) ? query.get('filter') : 'all',
    selected: Number(query.get('trophy')),
    search: '',
    mode: ['roadmap', 'guide'].includes(query.get('view')) ? query.get('view') : 'checklist',
    spoilers: ['on', 'true', '1'].includes(query.get('spoilers') ?? ''),
  };
  if (!trophies.some((item) => item.id === page.selected)) page.selected = trophies[0].id;

  const el = (id) => document.getElementById(id);
  const message = el('status-message');
  let messageTimeout;

  function notify(text) {
    message.textContent = text;
    message.classList.add('visible');
    clearTimeout(messageTimeout);
    messageTimeout = setTimeout(() => message.classList.remove('visible'), 3600);
  }

  function draw() {
    ui.progress(el('progress-label'), el('progress-percent'), el('earned-count'), el('progress-fill'), progress, trophies.length);
    ui.filterBar(el('filter-tabs'), page.filter, (filter) => {
      page.filter = filter;
      draw();
    });
    ui.checklist({
      root: el('trophy-list'),
      trophies,
      filter: page.filter,
      search: page.search,
      selected: page.selected,
      progress,
      spoilers: page.spoilers,
      onSelect: (id) => { page.selected = id; draw(); },
      onToggle: (id, checked) => window.GuideActions.toggle(id, checked),
    });
    const active = trophies.find((item) => item.id === page.selected);
    ui.detail(el('detail-panel'), active, progress, page.spoilers);
    ui.roadmap(el('roadmap-pane'), trophies, page.selected, progress, page.spoilers, {
      onSelect: (id) => { page.selected = id; draw(); },
      onToggle: (id, checked) => window.GuideActions.toggle(id, checked),
    });

    const isRoadmap = page.mode === 'roadmap';
    const isGuide = page.mode === 'guide';
    el('checklist-pane').hidden = isRoadmap || isGuide;
    el('roadmap-pane').hidden = !isRoadmap;
    el('checklist-view').classList.toggle('active', !isRoadmap && !isGuide);
    el('checklist-view').setAttribute('aria-selected', String(!isRoadmap && !isGuide));
    el('roadmap-view').classList.toggle('active', isRoadmap);
    el('roadmap-view').setAttribute('aria-selected', String(isRoadmap));
    document.body.classList.toggle('guide-focus', isGuide);
  }

  window.GuideActions = {
    toggle(id, checked) {
      progress.toggle(id, checked, notify);
      draw();
    },
  };

  progress.load(notify);
  el('search').addEventListener('input', (event) => {
    page.search = event.target.value;
    draw();
  });
  el('spoiler-toggle').checked = page.spoilers;
  el('spoiler-toggle').addEventListener('change', (event) => {
    page.spoilers = event.target.checked;
    draw();
  });
  el('checklist-view').addEventListener('click', () => { page.mode = 'checklist'; draw(); });
  el('roadmap-view').addEventListener('click', () => { page.mode = 'roadmap'; draw(); });

  el('export-button').addEventListener('click', () => {
    const file = new Blob([`${JSON.stringify(progress.exportObject(), null, 2)}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leonida-trophy-progress.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Progress exported as a JSON file.');
  });
  el('import-input').addEventListener('change', async (event) => {
    const input = event.currentTarget;
    const [file] = input.files;
    if (!file) return;
    if (file.size > 1_000_000) {
      notify('Import failed: the progress file is unexpectedly large.');
      input.value = '';
      return;
    }
    if (progress.importText(await file.text(), notify)) {
      draw();
      notify('Progress imported and saved on this device.');
    }
    input.value = '';
  });

  draw();
})();
