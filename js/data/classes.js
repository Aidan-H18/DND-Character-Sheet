/**
 * Playable classes. Each includes one SRD subclass to start with —
 * more can be added later by pushing onto a class's `subclasses` array
 * (see README "Adding content" section).
 *
 * NOTE (deliberate MVP simplification): every class uses the same
 * Ability Score Improvement levels (RULES.asiLevels = 4/8/12/16/19)
 * rather than the couple of class-specific exceptions in the PHB
 * (e.g. Fighter's extra ASI at 6 & 14, Rogue's at 10). Documented in
 * the README roadmap.
 */

const CLASSES = [
  {
    // Unlike the other 12 classes, Artificer isn't part of the free 5e
    // SRD (it comes from Tasha's Cauldron of Everything / Eberron), so
    // this entry is an original paraphrase of the class's mechanics
    // rather than SRD text. See README "Adding content" for more.
    id: 'artificer',
    name: 'Artificer',
    hitDie: 8,
    primaryAbility: ['int'],
    savingThrows: ['con', 'int'],
    armorProficiencies: ['Light armor', 'Medium armor', 'Shields'],
    weaponProficiencies: ['Simple weapons'],
    toolProficiencies: ['Thieves’ tools', 'Tinker’s tools', 'One type of artisan’s tools of your choice'],
    skillChoices: { count: 2, options: ['arcana', 'history', 'investigation', 'medicine', 'nature', 'perception', 'sleightOfHand'] },
    startingEquipment: ['A light crossbow and 20 bolts, or a simple weapon', 'Studded leather armor', 'Thieves’ tools and a dungeoneer’s pack', 'Two daggers and a set of tinker’s tools'],
    spellcasting: { ability: 'int', slotType: 'artificer', knownStyle: 'prepared' },
    subclassLevel: 3,
    subclassFeatureName: 'Artificer Specialist',
    features: [
      { level: 1, name: 'Magical Tinkering', description: 'You learn to invest a spark of magic into a tiny object, granting it a minor magical property such as a light, a recorded message, a sensory effect, or a faint scent, for as long as you touch it.' },
      { level: 1, name: 'Spellcasting', description: 'You can cast artificer spells using Intelligence as your spellcasting ability, treating them as formulas channeled through tools rather than innate magic.' },
      { level: 2, name: 'Infuse Item', description: 'You learn a number of magical infusions and can imbue mundane items with them, turning ordinary gear into quasi-magical tools and equipment that persist until you replace them.' },
      { level: 3, name: 'The Right Tool for the Job', description: 'You can magically create a set of artisan’s tools in unoccupied space you can see, usable for one hour before disappearing.' },
      { level: 6, name: 'Tool Expertise', description: 'Your proficiency bonus is doubled for any ability check you make that uses your proficiency with a tool.' },
      { level: 7, name: 'Flash of Genius', description: 'When you or a creature you can see within 30 feet makes an ability check or saving throw, you can use your reaction to add your Intelligence modifier to the roll.' },
      { level: 10, name: 'Magic Item Adept', description: 'You gain the ability to attune to up to four magic items at once, and you craft and modify magic items more efficiently.' },
      { level: 11, name: 'Spell-Storing Item', description: 'You can store a spell in an object during a short rest, letting another creature unleash it later by using the item.' },
      { level: 14, name: 'Magic Item Savant', description: 'You can attune to up to five magic items at once, and you ignore all class, race, and level requirements on attuning to or using a magic item.' }
    ],
    subclasses: [
      {
        id: 'alchemist',
        name: 'Alchemist',
        description: 'Alchemists are masters of chemical magic, using their creations to give life and to leech it away, brewing elixirs of transformative power.',
        features: [
          { level: 3, name: 'Tool Proficiency', description: 'You gain proficiency with alchemist’s supplies, and any check you make with them can use Intelligence instead of the normal ability.' },
          { level: 3, name: 'Alchemist Spells', description: 'You always have certain healing- and transmutation-themed spells prepared, and they don’t count against the number of spells you can prepare.' },
          { level: 3, name: 'Experimental Elixir', description: 'You can magically produce a random (or, at higher levels, chosen) potion-like elixir during a short rest, granting effects such as healing, resistance, or a boost to an ability.' },
          { level: 5, name: 'Alchemical Savant', description: 'When you cast a spell that uses alchemist’s supplies as a spellcasting focus, you add your Intelligence modifier to one damage or healing roll of that spell.' },
          { level: 9, name: 'Restorative Reagents', description: 'Your experimental elixirs can also grant temporary hit points, and creatures you heal with a spell regain a small bonus of extra hit points.' },
          { level: 15, name: 'Chemical Mastery', description: 'You gain resistance to acid and poison damage, immunity to being poisoned, and can craft your experimental elixirs so anyone can safely drink two per rest.' }
        ]
      }
    ]
  },
  {
    id: 'barbarian',
    name: 'Barbarian',
    hitDie: 12,
    primaryAbility: ['str'],
    savingThrows: ['str', 'con'],
    armorProficiencies: ['Light armor', 'Medium armor', 'Shields'],
    weaponProficiencies: ['Simple weapons', 'Martial weapons'],
    skillChoices: { count: 2, options: ['animalHandling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'] },
    startingEquipment: ['A greataxe or any martial melee weapon', 'Two handaxes or a simple weapon', "An explorer's pack", 'Four javelins'],
    subclassLevel: 3,
    subclassFeatureName: 'Primal Path',
    features: [
      { level: 1, name: 'Rage', description: 'In battle you fight with primal ferocity. On your turn you can enter a rage as a bonus action, gaining bonus melee damage and resistance to bludgeoning, piercing, and slashing damage.' },
      { level: 1, name: 'Unarmored Defense', description: 'While not wearing armor, your AC equals 10 + your Dexterity modifier + your Constitution modifier.' },
      { level: 2, name: 'Reckless Attack', description: 'You can throw aside all concern for defense to attack with advantage, but attacks against you have advantage until your next turn.' },
      { level: 2, name: 'Danger Sense', description: 'You have advantage on Dexterity saving throws against effects you can see, such as traps and spells.' },
      { level: 5, name: 'Extra Attack', description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.' },
      { level: 5, name: 'Fast Movement', description: 'Your speed increases by 10 feet while you aren’t wearing heavy armor.' },
      { level: 7, name: 'Feral Instinct', description: 'You have advantage on initiative rolls, and can act normally on a surprised turn if you enter your rage first.' },
      { level: 9, name: 'Brutal Critical', description: 'You can roll one additional weapon damage die when determining the extra damage for a critical hit with a melee attack.' }
    ],
    subclasses: [
      {
        id: 'path-of-the-berserker',
        name: 'Path of the Berserker',
        description: 'For some barbarians, rage is a means to an end — that end being violence.',
        features: [
          { level: 3, name: 'Frenzy', description: 'While raging you can go into a frenzy, making a single melee weapon attack as a bonus action each turn, at the cost of exhaustion when the rage ends.' },
          { level: 6, name: 'Mindless Rage', description: 'You can’t be charmed or frightened while raging; if you were already, the effect is suspended.' },
          { level: 10, name: 'Intimidating Presence', description: 'You can use your action to frighten someone with your menacing presence.' },
          { level: 14, name: 'Retaliation', description: 'When you take damage from a creature within 5 feet, you can use your reaction to make a melee weapon attack against it.' }
        ]
      }
    ]
  },
  {
    id: 'bard',
    name: 'Bard',
    hitDie: 8,
    primaryAbility: ['cha'],
    savingThrows: ['dex', 'cha'],
    armorProficiencies: ['Light armor'],
    weaponProficiencies: ['Simple weapons', 'Hand crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
    toolProficiencies: ['Three musical instruments of your choice'],
    skillChoices: { count: 3, options: RULES_SKILL_ALL_PLACEHOLDER() },
    startingEquipment: ['A rapier or simple weapon', "A diplomat's pack or entertainer's pack", 'A lute or other musical instrument', 'Leather armor and a dagger'],
    spellcasting: { ability: 'cha', slotType: 'full', knownStyle: 'known' },
    subclassLevel: 3,
    subclassFeatureName: 'Bard College',
    features: [
      { level: 1, name: 'Spellcasting', description: 'You can cast bard spells using Charisma as your spellcasting ability.' },
      { level: 1, name: 'Bardic Inspiration (d6)', description: 'As a bonus action, give an ally a Bardic Inspiration die (d6) they can add to one ability check, attack roll, or saving throw.' },
      { level: 2, name: 'Jack of All Trades', description: 'You add half your proficiency bonus, rounded down, to any ability check that doesn’t already include your proficiency bonus.' },
      { level: 2, name: 'Song of Rest (d6)', description: 'During a short rest, you and allies who hear your performance regain extra hit points.' },
      { level: 3, name: 'Expertise', description: 'Choose two of your skill proficiencies; your proficiency bonus is doubled for checks using either.' },
      { level: 5, name: 'Bardic Inspiration (d8)', description: 'Your Bardic Inspiration die becomes a d8.' },
      { level: 5, name: 'Font of Inspiration', description: 'You regain all uses of Bardic Inspiration on a short or long rest.' },
      { level: 6, name: 'Countercharm', description: 'As an action, you can perform to give yourself and nearby allies advantage on saves against being frightened or charmed.' },
      { level: 9, name: 'Song of Rest (d8)', description: 'The extra hit points from Song of Rest increase to a d8.' },
      { level: 10, name: 'Bardic Inspiration (d10)', description: 'Your Bardic Inspiration die becomes a d10.' },
      { level: 10, name: 'Magical Secrets', description: 'You learn two spells of your choice from any class’s spell list.' }
    ],
    subclasses: [
      {
        id: 'college-of-lore',
        name: 'College of Lore',
        description: 'Bards of the College of Lore know something about most things, collecting bits of knowledge from sources as diverse as scholarly tomes and tavern tales.',
        features: [
          { level: 3, name: 'Bonus Proficiencies', description: 'You gain proficiency with three skills of your choice.' },
          { level: 3, name: 'Cutting Words', description: 'You can use your reaction and expend a Bardic Inspiration die to subtract it from an enemy’s attack roll, ability check, or damage roll.' },
          { level: 6, name: 'Additional Magical Secrets', description: 'You learn two spells of your choice from any class, which count as bard spells for you.' },
          { level: 14, name: 'Peerless Skill', description: 'You can add a Bardic Inspiration die to one of your own ability checks.' }
        ]
      }
    ]
  },
  {
    id: 'cleric',
    name: 'Cleric',
    hitDie: 8,
    primaryAbility: ['wis'],
    savingThrows: ['wis', 'cha'],
    armorProficiencies: ['Light armor', 'Medium armor', 'Shields'],
    weaponProficiencies: ['Simple weapons'],
    skillChoices: { count: 2, options: ['history', 'insight', 'medicine', 'persuasion', 'religion'] },
    startingEquipment: ['A mace or warhammer (if proficient)', 'Scale mail, leather, or chain mail (if proficient)', 'A light crossbow and bolts or a simple weapon', "A priest's pack", 'A shield and a holy symbol'],
    spellcasting: { ability: 'wis', slotType: 'full', knownStyle: 'prepared' },
    subclassLevel: 1,
    subclassFeatureName: 'Divine Domain',
    features: [
      { level: 1, name: 'Spellcasting', description: 'You can cast cleric spells using Wisdom as your spellcasting ability.' },
      { level: 2, name: 'Channel Divinity (1/rest)', description: 'You can channel divine energy to fuel magical effects, starting with Turn Undead and a domain option.' },
      { level: 5, name: 'Destroy Undead (CR 1/2)', description: 'When an undead fails its save against your Turn Undead, it is destroyed if it is CR 1/2 or lower.' },
      { level: 6, name: 'Channel Divinity (2/rest)', description: 'You can use Channel Divinity twice between rests.' },
      { level: 8, name: 'Destroy Undead (CR 1)', description: 'The undead CR threshold for automatic destruction increases to 1.' },
      { level: 10, name: 'Divine Intervention', description: 'You can call on your deity to intervene on your behalf when your need is great.' }
    ],
    subclasses: [
      {
        id: 'life-domain',
        name: 'Life Domain',
        description: 'The Life domain focuses on the vibrant positive energy that sustains all life, emphasizing healing magic.',
        features: [
          { level: 1, name: 'Bonus Proficiency', description: 'You gain proficiency with heavy armor.' },
          { level: 1, name: 'Disciple of Life', description: 'Your healing spells restore additional hit points.' },
          { level: 2, name: 'Channel Divinity: Preserve Life', description: 'You can use Channel Divinity to heal creatures for a pool of hit points.' },
          { level: 6, name: 'Blessed Healer', description: 'When you cast a healing spell on someone else, you also regain hit points.' },
          { level: 8, name: 'Divine Strike', description: 'Once per turn you can deal extra radiant damage on a weapon hit.' },
          { level: 17, name: 'Supreme Healing', description: 'Instead of rolling healing dice, you use their maximum possible value.' }
        ]
      }
    ]
  },
  {
    id: 'druid',
    name: 'Druid',
    hitDie: 8,
    primaryAbility: ['wis'],
    savingThrows: ['int', 'wis'],
    armorProficiencies: ['Light armor', 'Medium armor', 'Shields (non-metal)'],
    weaponProficiencies: ['Clubs', 'Daggers', 'Darts', 'Javelins', 'Maces', 'Quarterstaffs', 'Scimitars', 'Sickles', 'Slings', 'Spears'],
    toolProficiencies: ['Herbalism kit'],
    skillChoices: { count: 2, options: ['arcana', 'animalHandling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'] },
    startingEquipment: ['A wooden shield or simple weapon', 'A scimitar or simple melee weapon', 'Leather armor', "An explorer's pack", 'A druidic focus'],
    spellcasting: { ability: 'wis', slotType: 'full', knownStyle: 'prepared' },
    subclassLevel: 2,
    subclassFeatureName: 'Druid Circle',
    features: [
      { level: 1, name: 'Spellcasting', description: 'You can cast druid spells using Wisdom as your spellcasting ability.' },
      { level: 1, name: 'Druidic', description: 'You know Druidic, the secret language of druids.' },
      { level: 2, name: 'Wild Shape', description: 'You can use your action to magically assume the shape of a beast you have seen before, twice per short or long rest.' },
      { level: 4, name: 'Wild Shape Improvement', description: 'You can transform into beasts with a swim speed.' },
      { level: 8, name: 'Wild Shape Improvement', description: 'You can transform into beasts with a fly speed.' },
      { level: 10, name: 'Circle Feature', description: 'Your Druid Circle grants an additional benefit at this level.' }
    ],
    subclasses: [
      {
        id: 'circle-of-the-land',
        name: 'Circle of the Land',
        description: 'Druids of the Circle of the Land are keepers of ancient knowledge and rites, deeply attuned to the land itself.',
        features: [
          { level: 2, name: 'Bonus Cantrip', description: 'You learn one additional druid cantrip of your choice.' },
          { level: 2, name: 'Natural Recovery', description: 'You can recover some spell slots during a short rest, once per day.' },
          { level: 3, name: 'Circle Spells', description: 'Choosing your land grants you additional spells that are always prepared, tied to your chosen terrain.' },
          { level: 6, name: 'Land’s Stride', description: 'Moving through nonmagical difficult terrain costs no extra movement, and you have advantage against plants that impede you.' },
          { level: 10, name: 'Nature’s Ward', description: 'You can’t be charmed or frightened by elementals or fey, and you are immune to poison and disease.' },
          { level: 14, name: 'Nature’s Sanctuary', description: 'Creatures of the natural world sense your connection to nature and are more reluctant to attack you.' }
        ]
      }
    ]
  },
  {
    id: 'fighter',
    name: 'Fighter',
    hitDie: 10,
    primaryAbility: ['str', 'dex'],
    savingThrows: ['str', 'con'],
    armorProficiencies: ['Light armor', 'Medium armor', 'Heavy armor', 'Shields'],
    weaponProficiencies: ['Simple weapons', 'Martial weapons'],
    skillChoices: { count: 2, options: ['acrobatics', 'animalHandling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'] },
    startingEquipment: ['Chain mail or leather/longbow', 'A martial weapon and a shield, or two martial weapons', 'A light crossbow and bolts or two handaxes', "A dungeoneer's pack or explorer's pack"],
    subclassLevel: 3,
    subclassFeatureName: 'Martial Archetype',
    features: [
      { level: 1, name: 'Fighting Style', description: 'You adopt a particular style of fighting as your specialty (e.g. Archery, Defense, Dueling, Great Weapon Fighting, Protection, Two-Weapon Fighting).' },
      { level: 1, name: 'Second Wind', description: 'On your turn, you can use a bonus action to regain hit points equal to 1d10 + your fighter level. Once per short or long rest.' },
      { level: 2, name: 'Action Surge', description: 'You can push yourself beyond normal limits, taking one additional action on your turn. Once per short or long rest.' },
      { level: 5, name: 'Extra Attack', description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.' },
      { level: 9, name: 'Indomitable', description: 'You can reroll a failed saving throw. Once per long rest.' }
    ],
    subclasses: [
      {
        id: 'champion',
        name: 'Champion',
        description: 'The archetypal Champion focuses on the development of raw physical power honed to deadly perfection.',
        features: [
          { level: 3, name: 'Improved Critical', description: 'Your weapon attacks score a critical hit on a roll of 19 or 20.' },
          { level: 7, name: 'Remarkable Athlete', description: 'You add half your proficiency bonus to Strength, Dexterity, or Constitution checks that don’t already use your proficiency bonus.' },
          { level: 10, name: 'Additional Fighting Style', description: 'You can choose a second option from the Fighting Style class feature.' },
          { level: 15, name: 'Superior Critical', description: 'Your weapon attacks score a critical hit on a roll of 18-20.' },
          { level: 18, name: 'Survivor', description: 'You regain hit points at the start of each of your turns if you are badly injured but not unconscious.' }
        ]
      }
    ]
  },
  {
    id: 'monk',
    name: 'Monk',
    hitDie: 8,
    primaryAbility: ['dex', 'wis'],
    savingThrows: ['str', 'dex'],
    armorProficiencies: [],
    weaponProficiencies: ['Simple weapons', 'Shortswords'],
    toolProficiencies: ['One type of artisan’s tools or musical instrument'],
    skillChoices: { count: 2, options: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'] },
    startingEquipment: ['A shortsword or simple weapon', "A dungeoneer's pack or explorer's pack", '10 darts'],
    subclassLevel: 3,
    subclassFeatureName: 'Monastic Tradition',
    features: [
      { level: 1, name: 'Unarmored Defense', description: 'While not wearing armor or wielding a shield, your AC equals 10 + Dexterity modifier + Wisdom modifier.' },
      { level: 1, name: 'Martial Arts', description: 'You can use Dexterity instead of Strength for unarmed strikes and monk weapons, roll a martial arts die for damage, and make an unarmed strike as a bonus action.' },
      { level: 2, name: 'Ki', description: 'You gain ki points to fuel Flurry of Blows, Patient Defense, and Step of the Wind.' },
      { level: 2, name: 'Unarmored Movement', description: 'Your speed increases while you aren’t wearing armor or wielding a shield.' },
      { level: 3, name: 'Deflect Missiles', description: 'You can use your reaction to deflect or catch a ranged weapon attack, reducing its damage.' },
      { level: 4, name: 'Slow Fall', description: 'You can use your reaction to reduce falling damage you take.' },
      { level: 5, name: 'Extra Attack', description: 'You can attack twice, instead of once, whenever you take the Attack action.' },
      { level: 5, name: 'Stunning Strike', description: 'You can spend a ki point to attempt to stun a creature you hit with a melee weapon attack.' },
      { level: 6, name: 'Ki-Empowered Strikes', description: 'Your unarmed strikes count as magical for overcoming resistance and immunity to nonmagical attacks.' },
      { level: 7, name: 'Evasion', description: 'When subjected to an effect allowing a Dexterity save for half damage, you take no damage on a success and half on a failure.' },
      { level: 7, name: 'Stillness of Mind', description: 'You can use your action to end one effect causing you to be charmed or frightened.' },
      { level: 9, name: 'Unarmored Movement Improvement', description: 'You can move along vertical surfaces and across liquids without falling during your move.' },
      { level: 10, name: 'Purity of Body', description: 'You are immune to disease and poison.' }
    ],
    subclasses: [
      {
        id: 'way-of-the-open-hand',
        name: 'Way of the Open Hand',
        description: 'Monks of the Way of the Open Hand are masters of martial arts, using their bodies as weapons of pinpoint precision.',
        features: [
          { level: 3, name: 'Open Hand Technique', description: 'When you hit with Flurry of Blows you can knock a creature prone, push it away, or prevent its reactions.' },
          { level: 6, name: 'Wholeness of Body', description: 'You can use your action to heal yourself for a number of hit points. Once per long rest.' },
          { level: 11, name: 'Tranquility', description: 'You can achieve a meditative state that grants you the effect of a sanctuary spell.' },
          { level: 17, name: 'Quivering Palm', description: 'You can set up lethal vibrations that can be triggered to harm a creature you have struck.' }
        ]
      }
    ]
  },
  {
    id: 'paladin',
    name: 'Paladin',
    hitDie: 10,
    primaryAbility: ['str', 'cha'],
    savingThrows: ['wis', 'cha'],
    armorProficiencies: ['Light armor', 'Medium armor', 'Heavy armor', 'Shields'],
    weaponProficiencies: ['Simple weapons', 'Martial weapons'],
    skillChoices: { count: 2, options: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'] },
    startingEquipment: ['A martial weapon and a shield, or two martial weapons', 'Five javelins or a simple melee weapon', "A priest's pack or explorer's pack", 'Chain mail and a holy symbol'],
    spellcasting: { ability: 'cha', slotType: 'half', knownStyle: 'prepared' },
    subclassLevel: 3,
    subclassFeatureName: 'Sacred Oath',
    features: [
      { level: 1, name: 'Divine Sense', description: 'You can open your awareness to detect strong evil and good nearby.' },
      { level: 1, name: 'Lay on Hands', description: 'You have a pool of healing power that replenishes when you take a long rest, usable to heal or cure disease/poison.' },
      { level: 2, name: 'Fighting Style', description: 'You adopt a particular style of fighting as your specialty.' },
      { level: 2, name: 'Spellcasting', description: 'You can cast paladin spells using Charisma as your spellcasting ability.' },
      { level: 2, name: 'Divine Smite', description: 'When you hit with a melee weapon attack, you can expend a spell slot to deal extra radiant damage.' },
      { level: 3, name: 'Divine Health', description: 'The divine magic flowing through you makes you immune to disease.' },
      { level: 5, name: 'Extra Attack', description: 'You can attack twice, instead of once, whenever you take the Attack action.' },
      { level: 6, name: 'Aura of Protection', description: 'You and friendly creatures within 10 feet add your Charisma modifier to saving throws.' },
      { level: 10, name: 'Aura of Courage', description: 'You and friendly creatures within 10 feet can’t be frightened while you are conscious.' }
    ],
    subclasses: [
      {
        id: 'oath-of-devotion',
        name: 'Oath of Devotion',
        description: 'The Oath of Devotion binds a paladin to the loftiest ideals of justice, virtue, and order.',
        features: [
          { level: 3, name: 'Channel Divinity: Sacred Weapon', description: 'You can imbue one weapon you are holding with positive energy, adding your Charisma modifier to attack rolls with it.' },
          { level: 3, name: 'Channel Divinity: Turn the Unholy', description: 'You can present your holy symbol to turn fiends and undead.' },
          { level: 7, name: 'Aura of Devotion', description: 'You and friendly creatures within 10 feet can’t be charmed while you are conscious.' },
          { level: 15, name: 'Purity of Spirit', description: 'You are constantly under the effect of a protection from evil and good spell.' },
          { level: 20, name: 'Holy Nimbus', description: 'You emanate an aura of sunlight that damages fiends and undead and grants advantage against their spells.' }
        ]
      }
    ]
  },
  {
    id: 'ranger',
    name: 'Ranger',
    hitDie: 10,
    primaryAbility: ['dex', 'wis'],
    savingThrows: ['str', 'dex'],
    armorProficiencies: ['Light armor', 'Medium armor', 'Shields'],
    weaponProficiencies: ['Simple weapons', 'Martial weapons'],
    skillChoices: { count: 3, options: ['animalHandling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'] },
    startingEquipment: ['Scale mail or leather armor', 'Two shortswords or two simple melee weapons', "A dungeoneer's pack or explorer's pack", 'A longbow and a quiver of arrows'],
    spellcasting: { ability: 'wis', slotType: 'half', knownStyle: 'known' },
    subclassLevel: 3,
    subclassFeatureName: 'Ranger Archetype',
    features: [
      { level: 1, name: 'Favored Enemy', description: 'You have advantage on tracking and recalling information about a type of creature you have chosen as your enemy.' },
      { level: 1, name: 'Natural Explorer', description: 'You are particularly familiar with one type of natural environment and adept at traveling and surviving there.' },
      { level: 2, name: 'Fighting Style', description: 'You adopt a particular style of fighting as your specialty.' },
      { level: 2, name: 'Spellcasting', description: 'You can cast ranger spells using Wisdom as your spellcasting ability.' },
      { level: 3, name: 'Primeval Awareness', description: 'You can expend a spell slot to sense whether certain types of creatures are present nearby.' },
      { level: 5, name: 'Extra Attack', description: 'You can attack twice, instead of once, whenever you take the Attack action.' },
      { level: 6, name: 'Favored Enemy & Natural Explorer Improvement', description: 'You add an additional favored enemy and natural environment.' },
      { level: 8, name: 'Land’s Stride', description: 'Moving through nonmagical difficult terrain costs no extra movement.' },
      { level: 10, name: 'Hide in Plain Sight', description: 'You can spend 1 minute creating camouflage to hide well against a solid surface.' }
    ],
    subclasses: [
      {
        id: 'hunter',
        name: 'Hunter',
        description: 'Hunters walk a perilous path, hurling themselves against the monsters that threaten civilization.',
        features: [
          { level: 3, name: 'Hunter’s Prey', description: 'Choose an option such as Colossus Slayer, Giant Killer, or Horde Breaker to enhance your combat prowess.' },
          { level: 7, name: 'Defensive Tactics', description: 'Choose an option such as Escape the Horde, Multiattack Defense, or Steel Will.' },
          { level: 11, name: 'Multiattack', description: 'Choose Volley or Whirlwind Attack to strike multiple nearby foes.' },
          { level: 15, name: 'Superior Hunter’s Defense', description: 'Choose an option such as Evasion, Stand Against the Tide, or Uncanny Dodge.' }
        ]
      }
    ]
  },
  {
    id: 'rogue',
    name: 'Rogue',
    hitDie: 8,
    primaryAbility: ['dex'],
    savingThrows: ['dex', 'int'],
    armorProficiencies: ['Light armor'],
    weaponProficiencies: ['Simple weapons', 'Hand crossbows', 'Longswords', 'Rapiers', 'Shortswords'],
    toolProficiencies: ['Thieves’ tools'],
    skillChoices: { count: 4, options: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleightOfHand', 'stealth'] },
    startingEquipment: ['A rapier or shortsword', 'A shortbow and quiver or shortsword', "A burglar's pack, dungeoneer's pack, or explorer's pack", 'Leather armor, two daggers, and thieves’ tools'],
    subclassLevel: 3,
    subclassFeatureName: 'Roguish Archetype',
    features: [
      { level: 1, name: 'Expertise', description: 'Choose two of your skill proficiencies; your proficiency bonus is doubled for checks using either.' },
      { level: 1, name: 'Sneak Attack', description: 'Once per turn you can deal extra damage to a creature you hit with an attack if you have advantage, or an ally is nearby.' },
      { level: 1, name: 'Thieves’ Cant', description: 'You know a secret mix of dialect, jargon, and code that lets you hide messages in seemingly normal conversation.' },
      { level: 2, name: 'Cunning Action', description: 'You can take a bonus action on each of your turns to Dash, Disengage, or Hide.' },
      { level: 5, name: 'Uncanny Dodge', description: 'You can use your reaction to halve the damage of an attack that hits you.' },
      { level: 6, name: 'Expertise', description: 'Choose two more skill proficiencies to gain the Expertise benefit.' },
      { level: 7, name: 'Evasion', description: 'When subjected to an effect allowing a Dexterity save for half damage, you take no damage on a success and half on a failure.' }
    ],
    subclasses: [
      {
        id: 'thief',
        name: 'Thief',
        description: 'Thieves hone their skills in the larcenous arts, becoming masters of theft and infiltration.',
        features: [
          { level: 3, name: 'Fast Hands', description: 'You can use the bonus action from Cunning Action to make a Sleight of Hand check, use thieves’ tools, or take the Use an Object action.' },
          { level: 3, name: 'Second-Story Work', description: 'Climbing no longer costs extra movement, and your running jump distance increases by your Dexterity modifier.' },
          { level: 9, name: 'Supreme Sneak', description: 'You have advantage on Stealth checks if you move no more than half your speed on the same turn.' },
          { level: 13, name: 'Use Magic Device', description: 'You ignore all class, race, and level requirements on the use of magic items.' },
          { level: 17, name: 'Thief’s Reflexes', description: 'You can take two turns during the first round of combat.' }
        ]
      }
    ]
  },
  {
    id: 'sorcerer',
    name: 'Sorcerer',
    hitDie: 6,
    primaryAbility: ['cha'],
    savingThrows: ['con', 'cha'],
    armorProficiencies: [],
    weaponProficiencies: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light crossbows'],
    skillChoices: { count: 2, options: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'] },
    startingEquipment: ['A light crossbow and bolts or a simple weapon', "A component pouch or arcane focus", "A dungeoneer's pack or explorer's pack", 'Two daggers'],
    spellcasting: { ability: 'cha', slotType: 'full', knownStyle: 'known' },
    subclassLevel: 1,
    subclassFeatureName: 'Sorcerous Origin',
    features: [
      { level: 1, name: 'Spellcasting', description: 'You can cast sorcerer spells using Charisma as your spellcasting ability.' },
      { level: 2, name: 'Font of Magic', description: 'You gain sorcery points you can convert to and from spell slots and spend on Metamagic.' },
      { level: 3, name: 'Metamagic', description: 'You learn two Metamagic options, letting you twist your spells to suit your needs (e.g. Quickened, Twinned, Empowered Spell).' },
      { level: 10, name: 'Metamagic (Additional Option)', description: 'You learn an additional Metamagic option of your choice.' }
    ],
    subclasses: [
      {
        id: 'draconic-bloodline',
        name: 'Draconic Bloodline',
        description: 'Your innate magic comes from draconic magic that was mingled with your blood or that of your ancestors.',
        features: [
          { level: 1, name: 'Dragon Ancestor', description: 'You choose a dragon type; you can speak, read, and write Draconic, and creatures have a hard time telling when you lie about your ancestry.' },
          { level: 1, name: 'Draconic Resilience', description: 'Your hit point maximum increases, and your skin takes on a scaly quality, granting a base AC of 13 + Dex when unarmored.' },
          { level: 6, name: 'Elemental Affinity', description: 'You can add your Charisma modifier to one damage roll of a spell that deals damage of your draconic type.' },
          { level: 14, name: 'Dragon Wings', description: 'You can sprout a pair of dragon wings and gain a flying speed equal to your current speed.' },
          { level: 18, name: 'Draconic Presence', description: 'You can channel your inner draconic presence to exude an aura of awe or fear.' }
        ]
      }
    ]
  },
  {
    id: 'warlock',
    name: 'Warlock',
    hitDie: 8,
    primaryAbility: ['cha'],
    savingThrows: ['wis', 'cha'],
    armorProficiencies: ['Light armor'],
    weaponProficiencies: ['Simple weapons'],
    skillChoices: { count: 2, options: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'] },
    startingEquipment: ['A light crossbow and bolts or a simple weapon', "A component pouch or arcane focus", "A scholar's pack or dungeoneer's pack", 'Leather armor, a simple weapon, and two daggers'],
    spellcasting: { ability: 'cha', slotType: 'pact', knownStyle: 'known' },
    subclassLevel: 1,
    subclassFeatureName: 'Otherworldly Patron',
    features: [
      { level: 1, name: 'Pact Magic', description: 'You can cast warlock spells using Charisma, with a small number of slots that always recharge at their highest level on a short rest.' },
      { level: 2, name: 'Eldritch Invocations', description: 'You learn eldritch invocations, fragments of forbidden knowledge granting magical benefits.' },
      { level: 3, name: 'Pact Boon', description: 'Your otherworldly patron bestows a gift upon you: the Pact of the Chain, Blade, or Tome.' },
      { level: 10, name: 'Patron Feature', description: 'Your patron grants you an additional benefit at this level.' }
    ],
    subclasses: [
      {
        id: 'the-fiend',
        name: 'The Fiend',
        description: 'You have made a pact with a fiend from the lower planes, a being whose aims are evil and whose knowledge is dark and dangerous.',
        features: [
          { level: 1, name: 'Dark One’s Blessing', description: 'When you reduce a hostile creature to 0 hit points, you gain temporary hit points.' },
          { level: 6, name: 'Dark One’s Own Luck', description: 'You can add a bonus to an ability check or saving throw you make. Once per short or long rest.' },
          { level: 10, name: 'Fiendish Resilience', description: 'You can choose a damage type each rest and gain resistance to it, unless the damage comes from magic weapons.' },
          { level: 14, name: 'Hurl Through Hell', description: 'When you hit a creature with an attack, you can instantly transport it to the lower planes momentarily.' }
        ]
      }
    ]
  },
  {
    id: 'wizard',
    name: 'Wizard',
    hitDie: 6,
    primaryAbility: ['int'],
    savingThrows: ['int', 'wis'],
    armorProficiencies: [],
    weaponProficiencies: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light crossbows'],
    skillChoices: { count: 2, options: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'] },
    startingEquipment: ['A quarterstaff or dagger', 'A component pouch or arcane focus', "A scholar's pack or explorer's pack", 'A spellbook'],
    spellcasting: { ability: 'int', slotType: 'full', knownStyle: 'prepared' },
    subclassLevel: 2,
    subclassFeatureName: 'Arcane Tradition',
    features: [
      { level: 1, name: 'Spellcasting', description: 'You can cast wizard spells using Intelligence as your spellcasting ability, and keep a spellbook of the spells you know.' },
      { level: 1, name: 'Arcane Recovery', description: 'Once per day, when you finish a short rest, you can recover expended spell slots.' },
      { level: 10, name: 'Tradition Feature', description: 'Your Arcane Tradition grants an additional benefit at this level.' }
    ],
    subclasses: [
      {
        id: 'school-of-evocation',
        name: 'School of Evocation',
        description: 'Evokers focus their study on magic that creates powerful elemental effects such as bitter cold, searing flame, rolling thunder, crackling lightning, and burning acid.',
        features: [
          { level: 2, name: 'Evocation Savant', description: 'The gold and time you must spend to copy an evocation spell into your spellbook is halved.' },
          { level: 2, name: 'Sculpt Spells', description: 'You can create pockets of relative safety within the effects of your evocation spells, protecting chosen allies from the damage.' },
          { level: 6, name: 'Potent Cantrip', description: 'Your damaging cantrips do half damage to creatures that succeed on a saving throw against them.' },
          { level: 10, name: 'Empowered Evocation', description: 'You can add your Intelligence modifier to one damage roll of any wizard evocation spell you cast.' },
          { level: 14, name: 'Overchannel', description: 'You can deal maximum damage with a spell of 5th level or lower, at the cost of taking damage yourself on repeated uses.' }
        ]
      }
    ]
  }
];

/** Bard picks any 3 skills, so build that option list from the master skill list. */
function RULES_SKILL_ALL_PLACEHOLDER() {
  return RULES.skillList.map(s => s.id);
}
