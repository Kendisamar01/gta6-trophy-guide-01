(function () {
  const key = 'leonida-field-guide-progress-v1';
  const knownIds = new Set(window.GTA6_TROPHY_DATA.trophies.map((trophy) => trophy.id));
  const namesToIds = new Map(window.GTA6_TROPHY_DATA.trophies.map((trophy) => [trophy.name, trophy.id]));
  let earned = new Set();

  function normalize(values) {
    if (!Array.isArray(values)) throw new TypeError('Progress must contain a list of earned trophies.');
    return new Set(values.map((value) => {
      if (Number.isInteger(value) && knownIds.has(value)) return value;
      if (typeof value === 'string' && namesToIds.has(value)) return namesToIds.get(value);
      throw new TypeError('The progress file contains an unknown trophy.');
    }));
  }

  function persist(onError) {
    try {
      localStorage.setItem(key, JSON.stringify([...earned]));
      return true;
    } catch (error) {
      onError(`Could not save on this device: ${error.message}`);
      return false;
    }
  }

  function load(onNotice) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) earned = normalize(JSON.parse(saved));
    } catch (error) {
      earned = new Set();
      onNotice(`Saved progress could not be read; starting with an empty checklist. ${error.message}`);
    }
  }

  function toggle(id, checked, onError) {
    if (checked) earned.add(id);
    else earned.delete(id);
    persist(onError);
  }

  function importText(text, onError) {
    const previous = earned;
    try {
      const parsed = JSON.parse(text);
      const values = Array.isArray(parsed) ? parsed : parsed?.earned;
      if (!Array.isArray(values)) throw new TypeError('Choose a Leonida progress JSON file.');
      earned = normalize(values);
      if (!persist(onError)) {
        earned = previous;
        return false;
      }
      return true;
    } catch (error) {
      onError(`Import failed: ${error.message}`);
      return false;
    }
  }

  window.TrophyStore = {
    load,
    toggle,
    importText,
    all: () => new Set(earned),
    has: (id) => earned.has(id),
    count: () => earned.size,
    exportObject: () => ({
      format: 'leonida-field-guide-progress',
      version: 1,
      savedAt: new Date().toISOString(),
      earned: [...earned].sort((a, b) => a - b),
    }),
  };
})();
