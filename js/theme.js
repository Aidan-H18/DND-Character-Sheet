/**
 * Optional user theme customization: accent, text, and background colors.
 * A custom theme is stored separately from character data and, once set,
 * overrides the stylesheet's default (and prefers-color-scheme) palette by
 * writing CSS custom properties directly onto the root element. Every other
 * color in the palette (panels, borders, muted/faint text, accent-strong,
 * accent-text) is derived from those three picks so the whole app stays
 * visually consistent no matter what the user chooses.
 */

const Theme = (() => {
  const KEY = 'dnd-character-sheet:theme:v1';
  const VARS = ['bg', 'bg-elevated', 'bg-card', 'bg-card-hover', 'border', 'border-soft',
    'text', 'text-muted', 'text-faint', 'accent', 'accent-strong', 'accent-text'];

  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

  function hexToRgb(hex) {
    const clean = (hex || '').replace('#', '').trim();
    const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
    const num = parseInt(full, 16) || 0;
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  function rgbToHex({ r, g, b }) {
    const toHex = (v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function mix(hexA, hexB, weightB) {
    const a = hexToRgb(hexA), b = hexToRgb(hexB);
    return rgbToHex({
      r: a.r + (b.r - a.r) * weightB,
      g: a.g + (b.g - a.g) * weightB,
      b: a.b + (b.b - a.b) * weightB
    });
  }

  function relativeLuminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const [rs, gs, bs] = [r, g, b].map(v => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /** Whichever of pure black/white has better contrast against bgHex. */
  function bestOn(bgHex) {
    const lum = relativeLuminance(bgHex);
    const withBlack = (lum + 0.05) / 0.05;
    const withWhite = 1.05 / (lum + 0.05);
    return withBlack >= withWhite ? '#000000' : '#ffffff';
  }

  /** Build the full derived palette from the three user-facing picks. */
  function derive({ main, text, accent }) {
    return {
      'bg': main,
      'bg-elevated': mix(main, text, 0.06),
      'bg-card': mix(main, text, 0.10),
      'bg-card-hover': mix(main, text, 0.14),
      'border': mix(main, text, 0.25),
      'border-soft': mix(main, text, 0.16),
      'text': text,
      'text-muted': mix(text, main, 0.3),
      'text-faint': mix(text, main, 0.55),
      'accent': accent,
      'accent-strong': mix(accent, '#ffffff', 0.2),
      'accent-text': bestOn(accent)
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error('Failed to load theme', err);
      return null;
    }
  }

  function save(picks) {
    try {
      localStorage.setItem(KEY, JSON.stringify(picks));
    } catch (err) {
      console.error('Failed to save theme', err);
    }
  }

  function clear() {
    try { localStorage.removeItem(KEY); } catch (err) { /* ignore */ }
  }

  function applyPalette(palette) {
    const root = document.documentElement.style;
    VARS.forEach(name => root.setProperty(`--${name}`, palette[name]));
  }

  function clearOverrides() {
    const root = document.documentElement.style;
    VARS.forEach(name => root.removeProperty(`--${name}`));
  }

  /** Current effective colors (computed), regardless of source. */
  function currentPicks() {
    const style = getComputedStyle(document.documentElement);
    return {
      main: rgbToHex(hexToRgb(style.getPropertyValue('--bg').trim() || '#171216')),
      text: rgbToHex(hexToRgb(style.getPropertyValue('--text').trim() || '#f1e9ec')),
      accent: rgbToHex(hexToRgb(style.getPropertyValue('--accent').trim() || '#c8963f'))
    };
  }

  function applyStoredTheme() {
    const saved = load();
    if (saved) applyPalette(derive(saved));
  }

  function openSettings() {
    let draft = currentPicks();

    function colorRow(label, key) {
      const swatch = el('input', {
        type: 'color', class: 'theme-picker__swatch', value: draft[key],
        oninput: (e) => {
          draft = { ...draft, [key]: e.target.value };
          hexLabel.textContent = e.target.value;
          applyPalette(derive(draft));
        }
      });
      const hexLabel = el('span', { class: 'theme-picker__hex' }, draft[key]);
      return el('div', { class: 'theme-picker-row' }, [
        el('span', { class: 'theme-picker-row__label' }, label),
        el('div', { class: 'theme-picker-row__control' }, [swatch, hexLabel])
      ]);
    }

    const wrapper = el('div', { class: 'modal-card' }, [
      el('h3', {}, 'Customize Theme'),
      el('p', { class: 'hint' }, 'Pick your own accent, text, and background colors. Changes preview live and save automatically.'),
      colorRow('Accent Color', 'accent'),
      colorRow('Text Color', 'text'),
      colorRow('Background Color', 'main'),
      el('div', { class: 'modal-card__actions' }, [
        el('button', {
          class: 'btn btn--ghost',
          style: 'margin-right:auto;',
          onclick: () => {
            clear();
            clearOverrides();
            closeModal();
            showToast('Theme reset to default.');
          }
        }, 'Reset to Default'),
        el('button', {
          class: 'btn btn--primary',
          onclick: () => {
            save(draft);
            closeModal();
            showToast('Theme saved.');
          }
        }, 'Save')
      ])
    ]);
    openModal(wrapper);
  }

  applyStoredTheme();

  return { openSettings, applyStoredTheme };
})();

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-theme');
  if (btn) btn.addEventListener('click', Theme.openSettings);
});
