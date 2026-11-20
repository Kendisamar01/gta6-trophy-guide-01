(function () {
  const data = window.GTA6_TROPHY_DATA;
  const query = new URLSearchParams(location.search);
  const allowedFilters = new Set(window.TrophyUI.filters.map((filter) => filter.id));
  let filter = allowedFilters.has(query.get('filter')) ? query.get('filter') : 'all';
  let selected = Number(query.get('trophy'));
  if (!data.trophies.some((trophy) => trophy.id === selected)) selected = data.trophies[0].id;
  let search = '';
  let view = query.get('view') === 'roadmap' ? 'roadmap' : query.get('view') === 'guide' ? 'guide' : 'checklist';
  let spoilers = ['on', 'true', '1'].includes(query.get('spoilers') ?? '');
  let messageTimer;

  const elements = {
    filterTabs: document.getElementById('filter-tabs'),
    trophyList: document.getElementById('trophy-list'),
    checklistPane: document.getElementById('checklist-pane'),
    roadmapPane: document.getElementById('roadmap-pane'),
    detail: document.getElementById('detail-panel'),
    search: document.getElementById('search'),
    spoiler: document.getElementById('spoiler-toggle'),
    checklistButton: document.getElementById('checklist-view'),
    roadmapButton: document.getElementById('roadmap-view'),
    status: document.getElementById('status-message'),
  };

  function announce(message) {
    elements.status.textContent = message;
    elements.status.classList.add('visible');
    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => elements.status.classList.remove('visible'), 3600);
  }

  function rerender() {
    const store = window.TrophyStore;
    window.TrophyUI.renderProgress(store, data.trophies.length);
    window.TrophyUI.renderFilterTabs(elements.filterTabs, filter, (next) => {
      filter = next;
      rerender();
    });
    window.TrophyUI.renderChecklist(
      elements.trophyList,
      data.trophies,
      filter,
      search,
      selected,
      store,
      spoilers,
      (id) => {
        selected = id;
        rerender();
      },
      (id, checked) => window.GuideActions.toggle(id, checked),
    );
    window.TrophyUI.renderDetail(elements.detail, data.trophies.find((trophy) => trophy.id === selected), store, spoilers);
    window.TrophyUI.renderRoadmap(
      elements.roadmapPane,
      data.trophies,
      selected,
      store,
      spoilers,
      (id) => {
        selected = id;
        rerender();
      },
      (id, checked) => window.GuideActions.toggle(id, checked),
    );

    const roadmap = view === 'roadmap';
    const focusedGuide = view === 'guide';
    elements.checklistPane.hidden = roadmap || focusedGuide;
    elements.roadmapPane.hidden = !roadmap;
    elements.checklistButton.classList.toggle('active', !roadmap && !focusedGuide);
    elements.checklistButton.setAttribute('aria-selected', String(!roadmap && !focusedGuide));
    elements.roadmapButton.classList.toggle('active', roadmap);
    elements.roadmapButton.setAttribute('aria-selected', String(roadmap));
    document.body.classList.toggle('guide-focus', focusedGuide);
  }

  window.GuideActions = {
    toggle(id, checked) {
      window.TrophyStore.toggle(id, checked, announce);
      rerender();
    },
  };

  window.TrophyStore.load(announce);
  elements.search.addEventListener('input', () => {
    search = elements.search.value;
    rerender();
  });
  elements.spoiler.checked = spoilers;
  elements.spoiler.addEventListener('change', () => {
    spoilers = elements.spoiler.checked;
    rerender();
  });
  elements.checklistButton.addEventListener('click', () => {
    view = 'checklist';
    rerender();
  });
  elements.roadmapButton.addEventListener('click', () => {
    view = 'roadmap';
    rerender();
  });

  document.getElementById('export-button').addEventListener('click', () => {
    const file = new Blob([`${JSON.stringify(window.TrophyStore.exportObject(), null, 2)}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leonida-trophy-progress.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    announce('Progress exported as a JSON file.');
  });
  document.getElementById('import-input').addEventListener('change', async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    if (file.size > 1_000_000) {
      announce('Import failed: the progress file is unexpectedly large.');
      event.target.value = '';
      return;
    }
    const success = window.TrophyStore.importText(await file.text(), announce);
    event.target.value = '';
    if (success) {
      rerender();
      announce('Progress imported and saved on this device.');
    }
  });

  rerender();
})();
