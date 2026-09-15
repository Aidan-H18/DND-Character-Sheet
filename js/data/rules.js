/**
 * Core 5th-edition rules reference data.
 * Kept separate from race/class/background content so the numbers
 * that apply to *every* character live in one place.
 */

const RULES = {
  MAX_LEVEL: 20,

  // Proficiency bonus by character level (PHB table).
  proficiencyBonusByLevel: [
    2, 2, 2, 2, // 1-4
    3, 3, 3, 3, // 5-8
    4, 4, 4, 4, // 9-12
    5, 5, 5, 5, // 13-16
    6, 6, 6, 6  // 17-20
  ],

  // Levels at which every class gets an Ability Score Improvement
  // (feats are treated as an optional alternative use of this slot).
  asiLevels: [4, 8, 12, 16, 19],

  // Experience points required to reach a given level (index 0 = level 1).
  xpByLevel: [
    0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
    85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
  ],

  abilityNames: ['str', 'dex', 'con', 'int', 'wis', 'cha'],
  abilityLabels: {
    str: 'Strength', dex: 'Dexterity', con: 'Constitution',
    int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma'
  },

  skillList: [
    { id: 'acrobatics', ability: 'dex', label: 'Acrobatics' },
    { id: 'animalHandling', ability: 'wis', label: 'Animal Handling' },
    { id: 'arcana', ability: 'int', label: 'Arcana' },
    { id: 'athletics', ability: 'str', label: 'Athletics' },
    { id: 'deception', ability: 'cha', label: 'Deception' },
    { id: 'history', ability: 'int', label: 'History' },
    { id: 'insight', ability: 'wis', label: 'Insight' },
    { id: 'intimidation', ability: 'cha', label: 'Intimidation' },
    { id: 'investigation', ability: 'int', label: 'Investigation' },
    { id: 'medicine', ability: 'wis', label: 'Medicine' },
    { id: 'nature', ability: 'int', label: 'Nature' },
    { id: 'perception', ability: 'wis', label: 'Perception' },
    { id: 'performance', ability: 'cha', label: 'Performance' },
    { id: 'persuasion', ability: 'cha', label: 'Persuasion' },
    { id: 'religion', ability: 'int', label: 'Religion' },
    { id: 'sleightOfHand', ability: 'dex', label: 'Sleight of Hand' },
    { id: 'stealth', ability: 'dex', label: 'Stealth' },
    { id: 'survival', ability: 'wis', label: 'Survival' }
  ],

  // Standard array for quick, balanced ability score assignment.
  standardArray: [15, 14, 13, 12, 10, 8],

  // Point-buy: every score starts at 8 (0 cost) and costs points to raise, max 15.
  pointBuy: {
    totalPoints: 27,
    min: 8,
    max: 15,
    cost: { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 }
  },

  // Full spell slots per class level, keyed by caster type.
  // "full": Bard, Cleric, Druid, Sorcerer, Wizard
  // "half": Paladin, Ranger (rounded down, starts at level 2)
  // "pact": Warlock (unique short-rest slot progression)
  spellSlotsFull: [
    null, // level 0 unused
    [2],
    [3],
    [4, 2],
    [4, 3],
    [4, 3, 2],
    [4, 3, 3],
    [4, 3, 3, 1],
    [4, 3, 3, 2],
    [4, 3, 3, 3, 1],
    [4, 3, 3, 3, 2],
    [4, 3, 3, 3, 2, 1],
    [4, 3, 3, 3, 2, 1],
    [4, 3, 3, 3, 2, 1, 1],
    [4, 3, 3, 3, 2, 1, 1],
    [4, 3, 3, 3, 2, 1, 1, 1],
    [4, 3, 3, 3, 2, 1, 1, 1],
    [4, 3, 3, 3, 2, 1, 1, 1, 1],
    [4, 3, 3, 3, 3, 1, 1, 1, 1],
    [4, 3, 3, 3, 3, 2, 1, 1, 1],
    [4, 3, 3, 3, 3, 2, 2, 1, 1]
  ],

  spellSlotsHalf: [
    null,
    [], [2], [3], [3], [4, 2], [4, 2], [4, 3], [4, 3], [4, 3, 2], [4, 3, 2],
    [4, 3, 3], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 2],
    [4, 3, 3, 3, 1], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2]
  ],

  // Warlock pact magic: [slotCount, slotLevel] per character level.
  spellSlotsPact: [
    null,
    [1, 1], [2, 1], [2, 2], [2, 2], [2, 3], [2, 3], [2, 4], [2, 4], [2, 5], [2, 5],
    [3, 5], [3, 5], [3, 5], [3, 5], [3, 5], [3, 5], [4, 5], [4, 5], [4, 5], [4, 5]
  ],

  // Artificer: a half-caster like Paladin/Ranger, but unusually starts
  // casting at level 1 instead of level 2 — every pair of levels shares a
  // slot count (1&2, 3&4, 5&6, ...) rather than the usual single-level offset.
  spellSlotsArtificer: [
    null,
    [2], [2], [3], [3], [4, 2], [4, 2], [4, 3], [4, 3], [4, 3, 2], [4, 3, 2],
    [4, 3, 3], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 2],
    [4, 3, 3, 3, 1], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2]
  ]
};

function abilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

function formatModifier(mod) {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function proficiencyBonusForLevel(level) {
  const idx = Math.min(Math.max(level, 1), RULES.MAX_LEVEL) - 1;
  return RULES.proficiencyBonusByLevel[idx];
}
