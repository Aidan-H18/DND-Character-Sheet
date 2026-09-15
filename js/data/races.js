/**
 * Playable races. Each race may define `subraces` — if it does, the
 * wizard requires a subrace choice before continuing.
 *
 * abilityBonuses: { str, dex, con, int, wis, cha } flat bonuses applied
 * on top of the character's base ability scores.
 */

const RACES = [
  {
    id: 'human',
    name: 'Human',
    speed: 30,
    size: 'Medium',
    abilityBonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
    languages: ['Common', 'One language of your choice'],
    description: 'Versatile and ambitious, humans are the most adaptable and diverse people in the world.',
    traits: [
      { name: 'Ability Score Increase', description: 'Every ability score increases by 1.' },
      { name: 'Languages', description: 'You can speak, read, and write Common and one extra language of your choice.' }
    ]
  },
  {
    id: 'elf',
    name: 'Elf',
    speed: 30,
    size: 'Medium',
    abilityBonuses: { dex: 2 },
    languages: ['Common', 'Elvish'],
    description: 'Graceful, keen-sensed, and long-lived, elves are magical people attuned to nature and art.',
    traits: [
      { name: 'Darkvision', description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.' },
      { name: 'Keen Senses', description: 'You have proficiency in the Perception skill.' },
      { name: 'Fey Ancestry', description: 'You have advantage on saving throws against being charmed, and magic can’t put you to sleep.' },
      { name: 'Trance', description: 'You don’t need to sleep; you meditate deeply for 4 hours a day instead.' }
    ],
    subraces: [
      {
        id: 'high-elf',
        name: 'High Elf',
        abilityBonuses: { int: 1 },
        traits: [
          { name: 'Cantrip', description: 'You know one wizard cantrip of your choice.' },
          { name: 'Extra Language', description: 'You can speak, read, and write one extra language of your choice.' }
        ]
      },
      {
        id: 'wood-elf',
        name: 'Wood Elf',
        abilityBonuses: { wis: 1 },
        speedOverride: 35,
        traits: [
          { name: 'Fleet of Foot', description: 'Your base walking speed increases to 35 feet.' },
          { name: 'Mask of the Wild', description: 'You can attempt to hide even when only lightly obscured by foliage, heavy rain, and other natural phenomena.' }
        ]
      },
      {
        id: 'drow',
        name: 'Dark Elf (Drow)',
        abilityBonuses: { cha: 1 },
        traits: [
          { name: 'Superior Darkvision', description: 'Your darkvision has a radius of 120 feet.' },
          { name: 'Sunlight Sensitivity', description: 'You have disadvantage on attack rolls and Perception checks that rely on sight in direct sunlight.' },
          { name: 'Drow Magic', description: 'You know the dancing lights cantrip; at level 3 you can cast faerie fire once per day, and at level 5, darkness once per day.' }
        ]
      }
    ]
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    speed: 25,
    size: 'Medium',
    abilityBonuses: { con: 2 },
    languages: ['Common', 'Dwarvish'],
    description: 'Bold and hardy, dwarves are known as skilled warriors, miners, and workers of stone and metal.',
    traits: [
      { name: 'Darkvision', description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.' },
      { name: 'Dwarven Resilience', description: 'You have advantage on saving throws against poison, and resistance against poison damage.' },
      { name: 'Stonecunning', description: 'Your proficiency bonus is doubled for History checks related to stonework.' },
      { name: 'Tool Proficiency', description: 'You gain proficiency with one type of artisan’s tools of your choice.' }
    ],
    subraces: [
      {
        id: 'hill-dwarf',
        name: 'Hill Dwarf',
        abilityBonuses: { wis: 1 },
        traits: [
          { name: 'Dwarven Toughness', description: 'Your hit point maximum increases by 1, and by 1 again every time you gain a level.' }
        ]
      },
      {
        id: 'mountain-dwarf',
        name: 'Mountain Dwarf',
        abilityBonuses: { str: 2 },
        traits: [
          { name: 'Dwarven Armor Training', description: 'You have proficiency with light and medium armor.' }
        ]
      }
    ]
  },
  {
    id: 'halfling',
    name: 'Halfling',
    speed: 25,
    size: 'Small',
    abilityBonuses: { dex: 2 },
    languages: ['Common', 'Halfling'],
    description: 'Small, practical, and famously lucky, halflings prize the comforts of home and hearth.',
    traits: [
      { name: 'Lucky', description: 'When you roll a 1 on an attack roll, ability check, or saving throw, you can reroll the die and must use the new roll.' },
      { name: 'Brave', description: 'You have advantage on saving throws against being frightened.' },
      { name: 'Halfling Nimbleness', description: 'You can move through the space of any creature that is of a size larger than yours.' }
    ],
    subraces: [
      {
        id: 'lightfoot',
        name: 'Lightfoot',
        abilityBonuses: { cha: 1 },
        traits: [
          { name: 'Naturally Stealthy', description: 'You can attempt to hide even when obscured only by a creature at least one size larger than you.' }
        ]
      },
      {
        id: 'stout',
        name: 'Stout',
        abilityBonuses: { con: 1 },
        traits: [
          { name: 'Stout Resilience', description: 'You have advantage on saving throws against poison, and resistance against poison damage.' }
        ]
      }
    ]
  },
  {
    id: 'dragonborn',
    name: 'Dragonborn',
    speed: 30,
    size: 'Medium',
    abilityBonuses: { str: 2, cha: 1 },
    languages: ['Common', 'Draconic'],
    description: 'Proud, honorable descendants of dragons, dragonborn walk the world in dragon-like humanoid form.',
    traits: [
      { name: 'Draconic Ancestry', description: 'Choose a dragon type; it determines the damage type of your breath weapon and your resistance.' },
      { name: 'Breath Weapon', description: 'You can use your action to exhale destructive energy in a shape determined by your ancestry, dealing damage based on your level.' },
      { name: 'Damage Resistance', description: 'You have resistance to the damage type associated with your draconic ancestry.' }
    ]
  },
  {
    id: 'gnome',
    name: 'Gnome',
    speed: 25,
    size: 'Small',
    abilityBonuses: { int: 2 },
    languages: ['Common', 'Gnomish'],
    description: 'Curious and energetic, gnomes possess a natural gift for illusion and invention.',
    traits: [
      { name: 'Darkvision', description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.' },
      { name: 'Gnome Cunning', description: 'You have advantage on Intelligence, Wisdom, and Charisma saving throws against magic.' }
    ],
    subraces: [
      {
        id: 'forest-gnome',
        name: 'Forest Gnome',
        abilityBonuses: { dex: 1 },
        traits: [
          { name: 'Natural Illusionist', description: 'You know the minor illusion cantrip.' },
          { name: 'Speak with Small Beasts', description: 'You can communicate simple ideas with Small or smaller beasts.' }
        ]
      },
      {
        id: 'rock-gnome',
        name: 'Rock Gnome',
        abilityBonuses: { con: 1 },
        traits: [
          { name: 'Artificer’s Lore', description: 'Your proficiency bonus is doubled for History checks related to magic items, alchemical objects, or tech.' },
          { name: 'Tinker', description: 'You have proficiency with artisan’s tools (tinker’s tools) and can construct tiny clockwork devices.' }
        ]
      }
    ]
  },
  {
    id: 'half-elf',
    name: 'Half-Elf',
    speed: 30,
    size: 'Medium',
    abilityBonuses: { cha: 2 },
    abilityChoiceBonus: { count: 2, amount: 1, exclude: ['cha'] },
    languages: ['Common', 'Elvish', 'One language of your choice'],
    description: 'Walking in two worlds but truly belonging to neither, half-elves combine human ambition with elven grace.',
    traits: [
      { name: 'Darkvision', description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.' },
      { name: 'Fey Ancestry', description: 'You have advantage on saving throws against being charmed, and magic can’t put you to sleep.' },
      { name: 'Skill Versatility', description: 'You gain proficiency in two skills of your choice.' }
    ]
  },
  {
    id: 'half-orc',
    name: 'Half-Orc',
    speed: 30,
    size: 'Medium',
    abilityBonuses: { str: 2, con: 1 },
    languages: ['Common', 'Orc'],
    description: 'Strong and resilient, half-orcs carry the fierce vitality of their orcish heritage.',
    traits: [
      { name: 'Darkvision', description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.' },
      { name: 'Menacing', description: 'You gain proficiency in the Intimidation skill.' },
      { name: 'Relentless Endurance', description: 'When reduced to 0 hit points but not killed outright, you can drop to 1 hit point instead. Once per long rest.' },
      { name: 'Savage Attacks', description: 'When you score a critical hit with a melee weapon attack, roll one additional weapon damage die.' }
    ]
  },
  {
    id: 'tiefling',
    name: 'Tiefling',
    speed: 30,
    size: 'Medium',
    abilityBonuses: { int: 1, cha: 2 },
    languages: ['Common', 'Infernal'],
    description: 'Bearing the mark of an infernal bloodline, tieflings face prejudice with resilience and dark wit.',
    traits: [
      { name: 'Darkvision', description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.' },
      { name: 'Hellish Resistance', description: 'You have resistance to fire damage.' },
      { name: 'Infernal Legacy', description: 'You know the thaumaturgy cantrip. At level 3 you can cast hellish rebuke once per day, and at level 5, darkness once per day.' }
    ]
  }
];
