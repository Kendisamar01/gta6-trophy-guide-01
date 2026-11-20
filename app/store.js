(() => {
  const storageKey = 'leonida-field-guide-progress-v1';
  const trophies = window.GTA6_TROPHY_DATA.trophies;
  const ids = new Set(trophies.map((trophy) => trophy.id));
  const idByName = new Map(trophies.map((trophy) => [trophy.name, trophy.id]));
  let earnedIds = new Set();

  function parseIds(values) {
    if (!Array.isArray(values)) throw new TypeError('Progress must contain a list of earned trophies.');
    return new Set(values.map((value) => {
      if (Number.isInteger(value) && ids.has(value)) return value;
      if (typeof value === 'string' && idByName.has(value)) return idByName.get(value);
      throw new TypeError('The progress file contains an unknown trophy.');
    }));
  }

  function save(onError) {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...earnedIds]));
      return true;
    } catch (error) {
      onError(`Could not save on this device: ${error.message}`);
      return false;
    }
  }

  function load(onNotice) {
    try {
      const contents = localStorage.getItem(storageKey);
      if (contents) earnedIds = parseIds(JSON.parse(contents));
    } catch (error) {
      earnedIds = new Set();
      onNotice(`Saved progress could not be read; starting with an empty checklist. ${error.message}`);
    }
  }

  function toggle(id, checked, onError) {
    if (!ids.has(id)) throw new RangeError(`Unknown trophy id: ${id}`);
    if (checked) earnedIds.add(id);
    else earnedIds.delete(id);
    save(onError);
  }

  function importText(text, onError) {
    const previous = earnedIds;
    try {
      const parsed = JSON.parse(text);
      const values = Array.isArray(parsed) ? parsed : parsed?.earned;
      earnedIds = parseIds(values);
      if (!save(onError)) {
        earnedIds = previous;
        return false;
      }
      return true;
    } catch (error) {
      earnedIds = previous;
      onError(`Import failed: ${error.message}`);
      return false;
    }
  }

  window.GuideProgress = {
    load,
    toggle,
    importText,
    has: (id) => earnedIds.has(id),
    count: () => earnedIds.size,
    exportObject: () => ({
      format: 'leonida-field-guide-progress',
      version: 1,
      savedAt: new Date().toISOString(),
      earned: [...earnedIds].sort((left, right) => left - right),
    }),
  };
})();
