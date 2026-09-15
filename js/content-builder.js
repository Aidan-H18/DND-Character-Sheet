/**
 * In-app content builder: forms for adding a new race or a new subclass
 * without hand-editing js/data/races.js or js/data/classes.js.
 *
 * "Save" reads the actual data file (via the File System Access API when
 * the browser supports it, so the change is written straight back to disk;
 * otherwise it fetches the file over the local server and offers the
 * updated copy as a download) and splices the new entry into the right
 * array, using a bracket-depth-aware scan rather than fragile regex so it
 * works regardless of how deeply the target array is nested.
 */

const ContentBuilder = (() => {

  // ---------- id/text helpers ----------

  function slugify(str) {
    return String(str).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  function isPrimitive(v) {
    return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
  }

  function litPrimitive(v) {
    if (typeof v === 'string') return `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
    return String(v);
  }

  function keyName(k) {
    return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : `'${k}'`;
  }

  /** Serialize a plain value to a JS literal matching this project's data-file style:
   *  arrays/objects made entirely of primitives render inline, anything containing
   *  a nested array/object breaks onto multiple lines. */
  function toJSLiteral(value, depth) {
    const pad = '  '.repeat(depth);
    const childPad = '  '.repeat(depth + 1);
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      if (value.every(isPrimitive)) return '[' + value.map(litPrimitive).join(', ') + ']';
      const items = value.map(v => childPad + toJSLiteral(v, depth + 1));
      return '[\n' + items.join(',\n') + '\n' + pad + ']';
    }
    if (value && typeof value === 'object') {
      const keys = Object.keys(value).filter(k => value[k] !== undefined);
      if (keys.length === 0) return '{}';
      if (keys.every(k => isPrimitive(value[k]))) {
        return '{ ' + keys.map(k => `${keyName(k)}: ${litPrimitive(value[k])}`).join(', ') + ' }';
      }
      const items = keys.map(k => childPad + `${keyName(k)}: ${toJSLiteral(value[k], depth + 1)}`);
      return '{\n' + items.join(',\n') + '\n' + pad + '}';
    }
    return litPrimitive(value);
  }

  // ---------- bracket-aware text surgery ----------

  /**
   * If text[i] starts a string literal or a comment, return the index just past
   * its end; otherwise -1. Source comments in these data files (e.g. "isn't",
   * "Tasha's") contain unescaped apostrophes, which would otherwise be
   * misread as string delimiters and throw off bracket counting.
   */
  function skipNoise(text, i) {
    const ch = text[i];
    if (ch === '/' && text[i + 1] === '/') {
      const nl = text.indexOf('\n', i);
      return nl === -1 ? text.length : nl;
    }
    if (ch === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      return end === -1 ? text.length : end + 2;
    }
    if (ch === '\'' || ch === '"' || ch === '`') {
      let j = i + 1;
      while (j < text.length && text[j] !== ch) { if (text[j] === '\\') j++; j++; }
      return j + 1;
    }
    return -1;
  }

  /** Find the index of the bracket matching text[openIndex] ('[' or '{'), skipping strings/comments. */
  function findMatchingBracket(text, openIndex) {
    const open = text[openIndex];
    const close = open === '[' ? ']' : '}';
    let depth = 0;
    for (let i = openIndex; i < text.length;) {
      const skipTo = skipNoise(text, i);
      if (skipTo !== -1) { i = skipTo; continue; }
      const ch = text[i];
      if (ch === open) depth++;
      else if (ch === close) { depth--; if (depth === 0) return i; }
      i++;
    }
    return -1;
  }

  /** Find the top-level array-item object (one level below `arrOpen`) that contains `targetIdx`. */
  function findEnclosingObject(text, arrOpen, targetIdx) {
    let depth = 0;
    let candidateStart = -1;
    for (let i = arrOpen; i < text.length;) {
      const skipTo = skipNoise(text, i);
      if (skipTo !== -1) { i = skipTo; continue; }
      const ch = text[i];
      if (ch === '[' || ch === '{') {
        depth++;
        if (depth === 2 && ch === '{') candidateStart = i;
      } else if (ch === ']' || ch === '}') {
        if (depth === 2 && ch === '}' && candidateStart !== -1) {
          if (candidateStart <= targetIdx && targetIdx <= i) return { start: candidateStart, end: i };
          candidateStart = -1;
        }
        depth--;
      }
      i++;
    }
    return null;
  }

  function lastNonWhitespaceIndex(text, beforeIdx) {
    let i = beforeIdx - 1;
    while (i >= 0 && /\s/.test(text[i])) i--;
    return i;
  }

  /** Insert `obj` as a new element of the bracketed list spanning [openIdx, closeIdx], matching indentation. */
  function insertIntoBracketedList(text, openIdx, closeIdx, obj) {
    const lastCharIdx = lastNonWhitespaceIndex(text, closeIdx);
    const isEmpty = text[lastCharIdx] === text[openIdx];
    const lineStart = text.lastIndexOf('\n', closeIdx - 1) + 1;
    const bracketIndent = text.slice(lineStart, closeIdx);
    const itemDepth = Math.round(bracketIndent.length / 2) + 1;
    const itemIndent = '  '.repeat(itemDepth);
    const entryText = itemIndent + toJSLiteral(obj, itemDepth);
    const prefix = text.slice(0, lastCharIdx + 1);
    const suffix = text.slice(closeIdx);
    return prefix + (isEmpty ? '' : ',') + '\n' + entryText + '\n' + bracketIndent + suffix;
  }

  function insertRaceIntoText(text, race) {
    const marker = 'const RACES = [';
    const markerIdx = text.indexOf(marker);
    if (markerIdx === -1) return null;
    const openIdx = markerIdx + marker.length - 1;
    const closeIdx = findMatchingBracket(text, openIdx);
    if (closeIdx === -1) return null;
    return insertIntoBracketedList(text, openIdx, closeIdx, race);
  }

  function insertSubclassIntoText(text, classId, subclass) {
    const marker = 'const CLASSES = [';
    const markerIdx = text.indexOf(marker);
    if (markerIdx === -1) return null;
    const arrOpen = markerIdx + marker.length - 1;
    const arrClose = findMatchingBracket(text, arrOpen);
    if (arrClose === -1) return null;

    const idMarker = `id: '${classId}'`;
    const idIdx = text.indexOf(idMarker, arrOpen);
    if (idIdx === -1 || idIdx > arrClose) return null;

    const objRange = findEnclosingObject(text, arrOpen, idIdx);
    if (!objRange) return null;

    const subKeyIdx = text.indexOf('subclasses:', objRange.start);
    if (subKeyIdx === -1 || subKeyIdx > objRange.end) return null;
    const subOpenIdx = text.indexOf('[', subKeyIdx);
    const subCloseIdx = findMatchingBracket(text, subOpenIdx);
    if (subCloseIdx === -1) return null;

    return insertIntoBracketedList(text, subOpenIdx, subCloseIdx, subclass);
  }

  function downloadText(text, filename) {
    const blob = new Blob([text], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function pickFile(filename) {
    const [handle] = await window.showOpenFilePicker({
      suggestedName: filename,
      types: [{ description: 'JavaScript', accept: { 'text/javascript': ['.js'] } }]
    });
    return handle;
  }

  async function saveRaceToFile(race) {
    const filename = 'races.js';
    if ('showOpenFilePicker' in window) {
      let handle;
      try { handle = await pickFile(filename); }
      catch (err) { if (err.name === 'AbortError') return { ok: false }; throw err; }
      const text = await (await handle.getFile()).text();
      const updated = insertRaceIntoText(text, race);
      if (!updated) throw new Error('Could not find the RACES array — make sure you selected races.js.');
      const writable = await handle.createWritable();
      await writable.write(updated);
      await writable.close();
      RACES.push(race);
      return { ok: true, mode: 'file' };
    }
    const res = await fetch('js/data/races.js', { cache: 'no-store' });
    if (!res.ok) throw new Error('Could not fetch the current races.js.');
    const updated = insertRaceIntoText(await res.text(), race);
    if (!updated) throw new Error('Could not find the RACES array in races.js.');
    downloadText(updated, filename);
    RACES.push(race);
    return { ok: true, mode: 'download' };
  }

  async function saveSubclassToFile(classId, subclass) {
    const filename = 'classes.js';
    const applyInMemory = () => {
      const cls = CLASSES.find(c => c.id === classId);
      cls.subclasses = cls.subclasses || [];
      cls.subclasses.push(subclass);
    };
    if ('showOpenFilePicker' in window) {
      let handle;
      try { handle = await pickFile(filename); }
      catch (err) { if (err.name === 'AbortError') return { ok: false }; throw err; }
      const text = await (await handle.getFile()).text();
      const updated = insertSubclassIntoText(text, classId, subclass);
      if (!updated) throw new Error('Could not find that class — make sure you selected classes.js.');
      const writable = await handle.createWritable();
      await writable.write(updated);
      await writable.close();
      applyInMemory();
      return { ok: true, mode: 'file' };
    }
    const res = await fetch('js/data/classes.js', { cache: 'no-store' });
    if (!res.ok) throw new Error('Could not fetch the current classes.js.');
    const updated = insertSubclassIntoText(await res.text(), classId, subclass);
    if (!updated) throw new Error('Could not find that class in classes.js.');
    downloadText(updated, filename);
    applyInMemory();
    return { ok: true, mode: 'download' };
  }

  // ---------- small form-building helpers ----------

  function fieldWrap(label, node) {
    return el('div', { class: 'field' }, [el('label', {}, label), node]);
  }

  function mkInput(type, value, onInput) {
    const node = document.createElement(type === 'textarea' ? 'textarea' : 'input');
    if (type !== 'textarea') node.type = type;
    node.value = value === undefined || value === null ? '' : value;
    node.addEventListener('input', e => onInput(e.target.value));
    return node;
  }

  function abilityBonusGrid(target) {
    const grid = el('div', { class: 'checkbox-grid' });
    RULES.abilityNames.forEach(ab => {
      const inp = mkInput('number', target[ab] || 0, v => { target[ab] = parseInt(v, 10) || 0; });
      grid.appendChild(fieldWrap(RULES.abilityLabels[ab], inp));
    });
    return grid;
  }

  /** Generic add/remove list editor over an array of plain objects. */
  function listEditor(arr, renderFields, makeDefault, addLabel) {
    const container = el('div', { class: 'dynamic-list' });
    function rerender() {
      container.innerHTML = '';
      arr.forEach((item, idx) => {
        const row = el('div', { class: 'dynamic-row' }, [
          renderFields(item, rerender),
          el('button', { class: 'btn btn--small btn--danger', onclick: (e) => { e.preventDefault(); arr.splice(idx, 1); rerender(); } }, 'Remove')
        ]);
        container.appendChild(row);
      });
      container.appendChild(el('button', {
        class: 'btn btn--small btn--ghost',
        onclick: (e) => { e.preventDefault(); arr.push(makeDefault()); rerender(); }
      }, addLabel));
    }
    rerender();
    return container;
  }

  function traitFields(item) {
    return el('div', { class: 'dynamic-row__fields' }, [
      fieldWrap('Trait Name', mkInput('text', item.name, v => item.name = v)),
      fieldWrap('Trait Description', mkInput('textarea', item.description, v => item.description = v))
    ]);
  }

  function featureFields(item) {
    return el('div', { class: 'dynamic-row__fields' }, [
      fieldWrap('Level', mkInput('number', item.level, v => item.level = parseInt(v, 10) || 1)),
      fieldWrap('Feature Name', mkInput('text', item.name, v => item.name = v)),
      fieldWrap('Feature Description', mkInput('textarea', item.description, v => item.description = v))
    ]);
  }

  function subraceFields(item) {
    return el('div', { class: 'dynamic-row__fields dynamic-row__fields--subrace' }, [
      fieldWrap('Subrace Name', mkInput('text', item.name, v => { item.name = v; if (!item._idEdited) item.id = slugify(v); })),
      fieldWrap('Subrace ID', mkInput('text', item.id, v => { item.id = v; item._idEdited = true; })),
      fieldWrap('Ability Bonuses', abilityBonusGrid(item.abilityBonuses)),
      fieldWrap('Speed Override (optional, feet)', mkInput('number', item.speedOverride || '', v => item.speedOverride = v ? parseInt(v, 10) : undefined)),
      fieldWrap('Traits', listEditor(item.traits, traitFields, () => ({ name: '', description: '' }), '+ Add Subrace Trait'))
    ]);
  }

  // ---------- Race form ----------

  function buildRaceObject(state) {
    if (!state.name.trim()) throw new Error('Race name is required.');
    const id = (state.id || slugify(state.name)).trim();
    if (!id) throw new Error('Race ID is required.');
    if (RACES.some(r => r.id === id)) throw new Error(`A race with id "${id}" already exists.`);
    const abilityBonuses = {};
    Object.keys(state.abilityBonuses).forEach(k => { if (state.abilityBonuses[k]) abilityBonuses[k] = state.abilityBonuses[k]; });
    const traits = state.traits.filter(t => t.name.trim() && t.description.trim())
      .map(t => ({ name: t.name.trim(), description: t.description.trim() }));
    if (!traits.length) throw new Error('Add at least one trait.');
    const languages = state.languages.split(',').map(s => s.trim()).filter(Boolean);
    if (!state.description.trim()) throw new Error('Description is required.');

    const race = {
      id, name: state.name.trim(), speed: state.speed || 30, size: state.size,
      abilityBonuses, languages, description: state.description.trim(), traits
    };

    if (state.hasSubraces && state.subraces.length) {
      const subraces = state.subraces.filter(s => s.name.trim()).map(s => {
        const sid = (s.id || slugify(s.name)).trim();
        const ab = {};
        Object.keys(s.abilityBonuses).forEach(k => { if (s.abilityBonuses[k]) ab[k] = s.abilityBonuses[k]; });
        const sub = { id: sid, name: s.name.trim(), abilityBonuses: ab };
        if (s.speedOverride) sub.speedOverride = s.speedOverride;
        sub.traits = (s.traits || []).filter(t => t.name.trim() && t.description.trim())
          .map(t => ({ name: t.name.trim(), description: t.description.trim() }));
        return sub;
      });
      if (subraces.some(s => !s.id)) throw new Error('Every subrace needs a name.');
      const ids = subraces.map(s => s.id);
      if (new Set(ids).size !== ids.length) throw new Error('Subrace IDs must be unique.');
      race.subraces = subraces;
    }
    return race;
  }

  function buildRaceForm() {
    const state = {
      name: '', id: '', idEdited: false,
      size: 'Medium', speed: 30,
      abilityBonuses: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
      languages: 'Common', description: '',
      traits: [{ name: '', description: '' }],
      hasSubraces: false, subraces: []
    };

    const idInput = mkInput('text', state.id, v => { state.id = v; state.idEdited = true; });
    const nameInput = mkInput('text', state.name, v => { state.name = v; if (!state.idEdited) { state.id = slugify(v); idInput.value = state.id; } });
    const sizeSelect = el('select', { onchange: e => state.size = e.target.value },
      ['Small', 'Medium', 'Large'].map(s => el('option', { value: s, selected: s === state.size }, s)));
    const speedInput = mkInput('number', state.speed, v => state.speed = parseInt(v, 10) || 30);
    const languagesInput = mkInput('text', state.languages, v => state.languages = v);
    const descInput = mkInput('textarea', state.description, v => state.description = v);
    const traitsEditor = listEditor(state.traits, traitFields, () => ({ name: '', description: '' }), '+ Add Trait');

    const subracesContainer = el('div', { hidden: true }, [
      listEditor(state.subraces, subraceFields, () => ({
        name: '', id: '', abilityBonuses: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 }, traits: []
      }), '+ Add Subrace')
    ]);
    const subracesToggle = el('input', {
      type: 'checkbox', checked: state.hasSubraces,
      onchange: e => { state.hasSubraces = e.target.checked; subracesContainer.hidden = !state.hasSubraces; }
    });

    const status = el('div', { class: 'hint' }, '');
    const saveBtn = el('button', { class: 'btn btn--primary', onclick: () => handleSaveRace(state, status) }, 'Save Race');
    const copyBtn = el('button', { class: 'btn btn--ghost', onclick: () => copySnippet(buildRaceObject, state, status, 'RACES array in js/data/races.js') }, 'Copy JS Snippet');

    return el('div', { class: 'builder-form' }, [
      el('h2', {}, 'Add a Race'),
      fieldWrap('Name', nameInput),
      fieldWrap('ID (used internally, must be unique)', idInput),
      fieldWrap('Size', sizeSelect),
      fieldWrap('Speed (feet)', speedInput),
      fieldWrap('Ability Bonuses', abilityBonusGrid(state.abilityBonuses)),
      fieldWrap('Languages (comma-separated)', languagesInput),
      fieldWrap('Description', descInput),
      fieldWrap('Traits', traitsEditor),
      el('div', { class: 'checkbox-row' }, [subracesToggle, el('label', {}, 'This race has subraces')]),
      subracesContainer,
      el('div', { class: 'wizard-actions' }, [copyBtn, saveBtn]),
      status
    ]);
  }

  async function handleSaveRace(state, status) {
    let race;
    try { race = buildRaceObject(state); } catch (err) { status.textContent = err.message; return; }
    status.textContent = 'Saving…';
    try {
      const result = await saveRaceToFile(race);
      if (result.ok === false) { status.textContent = 'Cancelled.'; return; }
      status.textContent = result.mode === 'file'
        ? `Saved! ${race.name} was added directly to js/data/races.js.`
        : `Downloaded an updated races.js with ${race.name} added — replace js/data/races.js with this file.`;
      showToast(`${race.name} added to races.js`);
    } catch (err) {
      console.error(err);
      status.textContent = `Could not update the file automatically: ${err.message} — use "Copy JS Snippet" to add it by hand instead.`;
    }
  }

  // ---------- Subclass form ----------

  function buildSubclassObject(state) {
    const cls = CLASSES.find(c => c.id === state.classId);
    if (!cls) throw new Error('Pick a class.');
    if (!state.name.trim()) throw new Error('Subclass name is required.');
    const id = (state.id || slugify(state.name)).trim();
    if (!id) throw new Error('Subclass ID is required.');
    if ((cls.subclasses || []).some(s => s.id === id)) throw new Error(`${cls.name} already has a subclass with id "${id}".`);
    if (!state.description.trim()) throw new Error('Description is required.');
    const features = state.features.filter(f => f.name.trim() && f.description.trim())
      .map(f => ({ level: parseInt(f.level, 10) || 1, name: f.name.trim(), description: f.description.trim() }));
    if (!features.length) throw new Error('Add at least one feature.');
    return { classId: cls.id, subclass: { id, name: state.name.trim(), description: state.description.trim(), features } };
  }

  function buildSubclassForm() {
    const state = { classId: CLASSES[0].id, name: '', id: '', idEdited: false, description: '', features: [{ level: 1, name: '', description: '' }] };

    const existingBox = el('div', { class: 'detail-panel' });
    function renderExisting() {
      const cls = CLASSES.find(c => c.id === state.classId);
      existingBox.innerHTML = '';
      existingBox.appendChild(el('h3', {}, `Existing ${cls.subclassFeatureName || 'subclasses'} for ${cls.name}`));
      existingBox.appendChild(el('ul', {}, (cls.subclasses || []).map(s => el('li', {}, `${s.name} (id: ${s.id})`))));
    }

    const classSelect = el('select', {
      onchange: e => { state.classId = e.target.value; renderExisting(); }
    }, CLASSES.map(c => el('option', { value: c.id, selected: c.id === state.classId }, c.name)));
    renderExisting();

    const idInput = mkInput('text', state.id, v => { state.id = v; state.idEdited = true; });
    const nameInput = mkInput('text', state.name, v => { state.name = v; if (!state.idEdited) { state.id = slugify(v); idInput.value = state.id; } });
    const descInput = mkInput('textarea', state.description, v => state.description = v);
    const featuresEditor = listEditor(state.features, featureFields, () => ({ level: 1, name: '', description: '' }), '+ Add Feature');

    const status = el('div', { class: 'hint' }, '');
    const saveBtn = el('button', { class: 'btn btn--primary', onclick: () => handleSaveSubclass(state, status) }, 'Save Subclass');
    const copyBtn = el('button', {
      class: 'btn btn--ghost',
      onclick: () => copySnippet(() => buildSubclassObject(state).subclass, state, status, `subclasses array for the chosen class in js/data/classes.js`)
    }, 'Copy JS Snippet');

    return el('div', { class: 'builder-form' }, [
      el('h2', {}, 'Add a Subclass'),
      fieldWrap('Class', classSelect),
      existingBox,
      fieldWrap('Subclass Name', nameInput),
      fieldWrap('ID (used internally, must be unique)', idInput),
      fieldWrap('Description', descInput),
      fieldWrap('Features', featuresEditor),
      el('div', { class: 'wizard-actions' }, [copyBtn, saveBtn]),
      status
    ]);
  }

  async function handleSaveSubclass(state, status) {
    let built;
    try { built = buildSubclassObject(state); } catch (err) { status.textContent = err.message; return; }
    status.textContent = 'Saving…';
    try {
      const result = await saveSubclassToFile(built.classId, built.subclass);
      if (result.ok === false) { status.textContent = 'Cancelled.'; return; }
      status.textContent = result.mode === 'file'
        ? `Saved! ${built.subclass.name} was added directly to js/data/classes.js.`
        : `Downloaded an updated classes.js with ${built.subclass.name} added — replace js/data/classes.js with this file.`;
      showToast(`${built.subclass.name} added to classes.js`);
    } catch (err) {
      console.error(err);
      status.textContent = `Could not update the file automatically: ${err.message} — use "Copy JS Snippet" to add it by hand instead.`;
    }
  }

  async function copySnippet(builderFn, state, status, destinationHint) {
    let obj;
    try { obj = builderFn(state); } catch (err) { status.textContent = err.message; return; }
    const snippet = '  ' + toJSLiteral(obj, 1) + ',';
    try {
      await navigator.clipboard.writeText(snippet);
      status.textContent = `Copied! Paste it into the ${destinationHint}.`;
    } catch (err) {
      console.log(snippet);
      status.textContent = 'Could not copy automatically — snippet logged to the console instead.';
    }
  }

  // ---------- top-level render ----------

  function render(root) {
    let active = 'race';
    const tabs = el('div', { class: 'method-tabs' });
    const panel = el('div', { class: 'builder-panel' });

    function renderTabs() {
      tabs.innerHTML = '';
      [['race', 'Add Race'], ['subclass', 'Add Subclass']].forEach(([key, label]) => {
        tabs.appendChild(el('div', {
          class: 'method-tab' + (active === key ? ' method-tab--active' : ''),
          onclick: () => { active = key; renderTabs(); renderPanel(); }
        }, label));
      });
    }
    function renderPanel() {
      panel.innerHTML = '';
      panel.appendChild(active === 'race' ? buildRaceForm() : buildSubclassForm());
    }
    renderTabs();
    renderPanel();

    root.innerHTML = '';
    root.appendChild(el('div', { class: 'view-header' }, [el('h1', {}, 'Content Builder')]));
    root.appendChild(el('p', { class: 'hint' },
      'Fill in the form and save — this writes the new entry directly into js/data/races.js or js/data/classes.js ' +
      '(your browser will ask you to pick that file), or downloads an updated copy to replace it manually if your browser can’t write files directly.'));
    root.appendChild(tabs);
    root.appendChild(panel);
  }

  return { render };
})();
