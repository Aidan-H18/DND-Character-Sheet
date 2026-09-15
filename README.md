# Adventurer's Ledger — D&D Character Sheet

A guided, no-install character sheet for Dungeons & Dragons. Pick your race,
class, and background BG3-style, and it builds your sheet for you — ability
scores, saving throws, skills, HP, spell slots, and starting gear — then
helps you level it up correctly as your character grows.

Everything is stored **locally in your browser** (`localStorage`). Nothing is
sent to a server, there's no account, and there's no build step — it's meant
to be easy to pick up for a brand-new player and easy to poke at for anyone
who wants to extend it.

## Running it

There's no build process. Any static file server works:

```bash
npx http-server .          # or: python3 -m http.server 8000
```

Then open the printed URL in a browser. You can also just double-click
`index.html` — everything runs client-side, though some browsers restrict
`localStorage` for `file://` pages, so a local server is the more reliable
option.

## What it does today

- **Guided creation wizard**: Name → Race (+ subrace) → Class (+ subclass,
  if chosen at level 1) → Background → Ability Scores → Skills → Review.
- **Three ability score methods**: standard array, point buy (27 points,
  PHB costs), or manual/rolled entry.
- **9 core races** (with subraces for Elf, Dwarf, Halfling, Gnome) and
  **13 classes** — the 12 PHB classes plus the Artificer — each with one
  starter subclass. More races/classes/subclasses can be added easily
  (see "Adding content" below).
- **A full character sheet**: ability scores & modifiers, saving throws,
  all 18 skills, HP/AC/initiative/speed/passive perception, spell slots and
  a spell list for casters, inventory, personality traits, and free-form
  notes — all editable in place.
- **Leveling up**: one button recomputes HP, proficiency bonus, and unlocks
  new class/subclass features, prompting you when a level grants a subclass
  choice or an Ability Score Improvement.
- **Multiple characters**, with export/import to JSON (for backups or moving
  between browsers) and quick duplication.
- **Content Builder**: an in-app form (under "🛠 Content Builder" in the
  header) for adding *or editing* races and subclasses — new Otherworldly
  Patrons, Divine Domains, Sacred Oaths, etc. — without hand-editing the
  data files. See "Adding content" below.

## Project structure

```
index.html            App shell (three views: home / wizard / sheet)
css/styles.css         All styling
js/data/rules.js        Core numbers: proficiency bonus, XP, spell slot tables, skill list
js/data/races.js        Playable races & subraces
js/data/classes.js      Playable classes, their features by level, and subclasses
js/data/backgrounds.js  Backgrounds, their proficiencies, and flavor tables
js/storage.js           localStorage persistence (list/get/save/delete)
js/model.js             Character creation + all derived stats + leveling logic
js/ui-helpers.js        Small DOM helpers, toasts, modal dialog
js/wizard.js            The step-by-step creation flow
js/sheet.js             The character sheet view + level-up flow
js/content-builder.js   Form-based UI for adding races/subclasses to the data files
js/app.js               Routing between home/wizard/sheet, character list actions
```

There's no framework and no build step on purpose — every file is loaded
directly via `<script>` tags in `index.html` (in dependency order: data →
storage/model → views → app). This keeps the barrier to poking around as
low as possible.

## Adding content

The game data is deliberately kept separate from the logic that uses it, so
growing the game's content doesn't require touching the UI code.

**Using the Content Builder (recommended)** — click "🛠 Content Builder" in
the header. "Add Race" / "Add Subclass" create a new entry; "Edit Race" /
"Edit Subclass" pick an existing one from a dropdown, pre-fill the same
form with its current data, and update it in place instead of appending —
use this to add a second Otherworldly Patron for the Warlock, a new Divine
Domain for the Cleric, another Sacred Oath for the Paladin, or just fix a
typo in something already there. "Save" writes straight into
`js/data/races.js` / `js/data/classes.js` (your browser will prompt you to
pick the file — this uses the File System Access API, supported in
Chromium-based browsers like Chrome/Edge). In browsers without that API
(Firefox, Safari), it instead downloads an updated copy of the file for you
to replace the original with. Either way, there's also a "Copy JS Snippet"
button if you'd rather paste the generated object in by hand. The tool
covers the common fields (ability bonuses, traits, subraces, subclass
features); anything more exotic (like Half-Elf's `abilityChoiceBonus`)
still needs a manual edit afterward. Editing a subclass keeps it on its
original class — to move one to a different class, edit it out by hand and
re-add it under "Add Subclass" instead.

**Add a race by hand** — push an object onto the `RACES` array in
`js/data/races.js`. Give it `abilityBonuses`, `speed`, `size`, and a
`traits` array. Add a `subraces` array if it has subraces.

**Add a class or subclass by hand** — push onto `CLASSES` in `js/data/classes.js`.
Each class needs `hitDie`, `savingThrows`, `skillChoices`, and a `features`
array of `{ level, name, description }`. To add another subclass option,
push an object with the same `{ level, name, description }` shape onto that
class's `subclasses` array — the wizard and level-up flow will pick it up
automatically. The 12 PHB classes' included subclasses are all from the
free 5e SRD; the Artificer isn't SRD content (it's from Tasha's Cauldron
of Everything), so its entry is an original paraphrase of the class's
mechanics rather than transcribed text — keep that in mind if you add
more non-SRD classes or subclasses this way.

**Add a background** — push onto `BACKGROUNDS` in `js/data/backgrounds.js`.

## Known simplifications (roadmap)

This is a solid v1, not the full PHB. Things deliberately simplified for
now, in rough priority order for a "v2":

1. **One subclass per class.** Only one starter subclass is included per
   class (SRD-licensed for the 12 PHB classes; an original paraphrase for
   the Artificer). Adding more (per above) is straightforward — mostly a
   matter of transcribing text, not code changes.
2. **Uniform ASI levels (4/8/12/16/19)** for every class, rather than the
   couple of PHB exceptions (Fighter's extra ASI at 6 & 14, Rogue's at 10).
3. **No feats** as an alternative to an Ability Score Improvement.
4. **No multiclassing.**
5. **Simplified starting equipment**: a single sensible default kit per
   class/background rather than the full "choose A or B" equipment trees.
6. **Spell lists are free text**, not a structured spell database — there's
   no picker of official spells with their full rules text, just a slot
   tracker and a place to jot down what you've prepared/learned.
7. **HP on level-up uses the "average" rule** (hit die average, rounded up,
   + Constitution modifier) rather than offering to roll the die.
8. **Class features beyond level ~10-14 aren't transcribed** for every
   class (a few subclasses go further); leveling still works mechanically
   (HP, proficiency bonus, ASI prompts), the flavor text just thins out at
   high level.
9. **5e (2014) rules**, not the 2024 revision (e.g. ability bonuses come
   from race, not background).

None of these are architectural blockers — the data/logic split means each
one is additive work in a data file, not a rewrite.
