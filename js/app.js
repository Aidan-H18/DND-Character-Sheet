/**
 * App shell: routing between the home (character list), wizard, and
 * sheet views, plus home-view rendering (list/create/delete/duplicate/
 * export/import).
 */

const App = (() => {
  const views = {
    home: document.getElementById('view-home'),
    wizard: document.getElementById('view-wizard'),
    sheet: document.getElementById('view-sheet')
  };

  function setView(name) {
    Object.entries(views).forEach(([key, node]) => { node.hidden = key !== name; });
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  function showHome() {
    setView('home');
    renderHome();
  }

  function showWizard() {
    setView('wizard');
    const root = document.getElementById('wizard-root');
    root.innerHTML = '';
    Wizard.render(root, (character) => {
      Storage.upsert(character);
      showToast(`${character.name} has entered the world!`);
      showSheet(character.id);
    }, () => showHome());
  }

  function showSheet(characterId) {
    const character = Storage.getById(characterId);
    if (!character) { showHome(); return; }
    setView('sheet');
    const root = document.getElementById('sheet-root');
    root.innerHTML = '';
    Sheet.render(root, character, {
      onBack: showHome,
      onChange: (updated) => Storage.upsert(updated)
    });
  }

  function renderHome() {
    const listEl = document.getElementById('character-list');
    const emptyEl = document.getElementById('empty-state');
    const characters = Storage.loadAll().sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));

    listEl.innerHTML = '';
    emptyEl.hidden = characters.length > 0;

    characters.forEach(character => {
      const cls = CharacterModel.findClass(character.class.id);
      const race = CharacterModel.findRace(character.race.id);
      const subrace = CharacterModel.findSubrace(race, character.race.subraceId);
      const raceLabel = subrace ? `${subrace.name}` : (race ? race.name : 'Unknown');

      const card = el('div', { class: 'character-card', onclick: () => showSheet(character.id) }, [
        el('div', { class: 'character-card__name' }, character.name),
        el('div', { class: 'character-card__meta' },
          `Level ${character.class.level} ${raceLabel} ${cls ? cls.name : ''}`),
        el('div', { class: 'character-card__actions' }, [
          el('button', {
            class: 'btn btn--small btn--ghost',
            onclick: (e) => { e.stopPropagation(); exportCharacter(character); }
          }, 'Export'),
          el('button', {
            class: 'btn btn--small btn--ghost',
            onclick: (e) => { e.stopPropagation(); duplicateCharacter(character); }
          }, 'Duplicate'),
          el('button', {
            class: 'btn btn--small btn--danger',
            onclick: async (e) => {
              e.stopPropagation();
              const ok = await confirmDialog(`Delete ${character.name}? This can't be undone.`, 'Delete');
              if (ok) { Storage.remove(character.id); showToast(`${character.name} was deleted.`); renderHome(); }
            }
          }, 'Delete')
        ])
      ]);
      listEl.appendChild(card);
    });
  }

  function duplicateCharacter(character) {
    const copy = JSON.parse(JSON.stringify(character));
    copy.id = 'char_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    copy.name = character.name + ' (Copy)';
    copy.createdAt = new Date().toISOString();
    Storage.upsert(copy);
    showToast(`Duplicated as "${copy.name}".`);
    renderHome();
  }

  function exportCharacter(character) {
    const blob = new Blob([JSON.stringify(character, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.name.replace(/[^a-z0-9]+/gi, '_').toLowerCase() || 'character'}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importCharacterFromFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.race || !data.class || !data.abilityScores) throw new Error('Not a valid character file');
        data.id = 'char_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
        data.updatedAt = new Date().toISOString();
        Storage.upsert(data);
        showToast(`Imported "${data.name}".`);
        renderHome();
      } catch (err) {
        showToast('That file doesn’t look like a valid character export.');
        console.error(err);
      }
    };
    reader.readAsText(file);
  }

  function init() {
    if (!Storage.isAvailable()) {
      showToast('Local storage is unavailable — characters won’t be saved in this browser.');
    }

    document.getElementById('brand-link').addEventListener('click', (e) => { e.preventDefault(); showHome(); });
    document.getElementById('nav-home').addEventListener('click', showHome);
    document.getElementById('btn-new-character').addEventListener('click', showWizard);
    document.getElementById('import-file-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) importCharacterFromFile(file);
      e.target.value = '';
    });

    showHome();
  }

  return { init, showHome, showWizard, showSheet };
})();

document.addEventListener('DOMContentLoaded', App.init);
