/**
 * All persistence for the app. Everything lives in the browser's
 * localStorage under one key — nothing is ever sent to a server.
 */

const Storage = (() => {
  const KEY = 'dnd-character-sheet:characters:v1';

  function loadAll() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Failed to load characters from localStorage', err);
      return [];
    }
  }

  function saveAll(characters) {
    try {
      localStorage.setItem(KEY, JSON.stringify(characters));
      return true;
    } catch (err) {
      console.error('Failed to save characters to localStorage', err);
      return false;
    }
  }

  function getById(id) {
    return loadAll().find(c => c.id === id) || null;
  }

  function upsert(character) {
    const all = loadAll();
    const idx = all.findIndex(c => c.id === character.id);
    character.updatedAt = new Date().toISOString();
    if (idx === -1) {
      all.push(character);
    } else {
      all[idx] = character;
    }
    saveAll(all);
    return character;
  }

  function remove(id) {
    const all = loadAll().filter(c => c.id !== id);
    saveAll(all);
  }

  function isAvailable() {
    try {
      const testKey = '__dnd_storage_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch (err) {
      return false;
    }
  }

  return { loadAll, saveAll, getById, upsert, remove, isAvailable };
})();
