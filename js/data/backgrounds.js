/**
 * Backgrounds grant skill/tool/language proficiencies, starting
 * equipment, and a signature feature, plus flavor tables players can
 * roll on or pick from to round out their character's personality.
 */

const BACKGROUNDS = [
  {
    id: 'acolyte',
    name: 'Acolyte',
    skillProficiencies: ['insight', 'religion'],
    languages: 2,
    equipment: [
      'A holy symbol', 'A prayer book or prayer wheel', '5 sticks of incense',
      'Vestments', 'A set of common clothes', 'A belt pouch containing 15 gp'
    ],
    feature: {
      name: 'Shelter of the Faithful',
      description: 'You and your companions can receive free healing and care at temples of your faith, and you have a network of contacts among the priesthood.'
    },
    personalityTraits: [
      'I idolize a particular hero of my faith and constantly refer to their deeds and example.',
      'I can find common ground between the fiercest enemies, empathizing with them and always working toward peace.'
    ],
    ideals: ['Tradition. The ancient traditions of worship must be preserved.', 'Charity. I always try to help those in need, no matter the personal cost.'],
    bonds: ['I would die to recover an ancient relic of my faith lost long ago.'],
    flaws: ['I judge others harshly, and myself even more severely.']
  },
  {
    id: 'criminal',
    name: 'Criminal',
    skillProficiencies: ['deception', 'stealth'],
    toolProficiencies: ['One type of gaming set', 'Thieves’ tools'],
    equipment: [
      'A crowbar', 'A set of dark common clothes including a hood', 'A belt pouch containing 15 gp'
    ],
    feature: {
      name: 'Criminal Contact',
      description: 'You have a reliable and trustworthy contact who acts as your liaison to a network of other criminals.'
    },
    personalityTraits: [
      'I always have a plan for what to do when things go wrong.',
      'I am incredibly slow to trust. Those who seem the most trustworthy are the ones I suspect the most.'
    ],
    ideals: ['Honor. I don’t steal from others in the trade.', 'Freedom. Chains are meant to be broken, as are those who would forge them.'],
    bonds: ['I’m trying to pay off an old debt I owe to a generous benefactor.'],
    flaws: ['When I see something valuable, I can’t think about anything but how to steal it.']
  },
  {
    id: 'folk-hero',
    name: 'Folk Hero',
    skillProficiencies: ['animalHandling', 'survival'],
    toolProficiencies: ['One type of artisan’s tools', 'Vehicles (land)'],
    equipment: [
      'A set of artisan’s tools', 'A shovel', 'An iron pot', 'A set of common clothes', 'A belt pouch containing 10 gp'
    ],
    feature: {
      name: 'Rustic Hospitality',
      description: 'Common folk will shelter and hide you from the law or those hunting you, unless you have shown yourself to be a danger to them.'
    },
    personalityTraits: [
      'I judge people by their actions, not their words.',
      'I have a strong sense of fair play and always try to find the most equitable solution.'
    ],
    ideals: ['Sincerity. There’s no good in pretending to be something I’m not.', 'Destiny. Nothing and no one can steer me away from my higher calling.'],
    bonds: ['I protect those who cannot protect themselves.'],
    flaws: ['The tyrant who rules my land will stop at nothing to see me killed.']
  },
  {
    id: 'noble',
    name: 'Noble',
    skillProficiencies: ['history', 'persuasion'],
    toolProficiencies: ['One type of gaming set'],
    languages: 1,
    equipment: [
      'A set of fine clothes', 'A signet ring', 'A scroll of pedigree', 'A purse containing 25 gp'
    ],
    feature: {
      name: 'Position of Privilege',
      description: 'People are inclined to think the best of you. You are welcome in high society, and common folk defer to you.'
    },
    personalityTraits: [
      'My eloquent speech comes in handy, especially when talking to other nobles.',
      'The common folk love me for my kindness and generosity.'
    ],
    ideals: ['Responsibility. It is my duty to respect the authority of those above me.', 'Noble Obligation. It is my duty to protect and care for the people beneath me.'],
    bonds: ['My family, clan, or network of contacts provides me with a great deal of political power.'],
    flaws: ['I secretly believe that everyone is beneath me.']
  },
  {
    id: 'sage',
    name: 'Sage',
    skillProficiencies: ['arcana', 'history'],
    languages: 2,
    equipment: [
      'A bottle of black ink', 'A quill', 'A small knife', 'A letter from a dead colleague posing a question you have not yet answered',
      'A set of common clothes', 'A belt pouch containing 10 gp'
    ],
    feature: {
      name: 'Researcher',
      description: 'When you attempt to learn or recall a piece of lore, you often know where to find it even if you don’t already know it, usually in the greatest libraries and universities.'
    },
    personalityTraits: [
      'I use polysyllabic words that convey the impression of great erudition.',
      'I’ve read every book in the world’s greatest libraries — or I like to boast that I have.'
    ],
    ideals: ['Knowledge. The path to power and self-improvement is through knowledge.', 'Logic. Emotions must not cloud our logical thinking.'],
    bonds: ['I have an ancient text that holds terrible secrets that must not fall into the wrong hands.'],
    flaws: ['I speak without really thinking through my words, invariably insulting others.']
  },
  {
    id: 'soldier',
    name: 'Soldier',
    skillProficiencies: ['athletics', 'intimidation'],
    toolProficiencies: ['One type of gaming set', 'Vehicles (land)'],
    equipment: [
      'An insignia of rank', 'A trophy from a fallen enemy', 'A set of bone dice or deck of cards',
      'A set of common clothes', 'A belt pouch containing 10 gp'
    ],
    feature: {
      name: 'Military Rank',
      description: 'Soldiers loyal to your former military organization recognize your rank and defer to you, offering aid if it doesn’t put them at risk.'
    },
    personalityTraits: [
      'I’m always polite and respectful.',
      'I can stare down a hell hound without flinching.'
    ],
    ideals: ['Greater Good. Our lot is to lay down our lives in defense of others.', 'Responsibility. I do what I must and obey just authority.'],
    bonds: ['I would still lay down my life for the people I served with.'],
    flaws: ['I made a terrible mistake in battle that cost many lives, and I would do anything to keep that mistake secret.']
  },
  {
    id: 'charlatan',
    name: 'Charlatan',
    skillProficiencies: ['deception', 'sleightOfHand'],
    toolProficiencies: ['Disguise kit', 'Forgery kit'],
    equipment: [
      'A set of fine clothes', 'A disguise kit', 'Tools of the con of your choice', 'A belt pouch containing 15 gp'
    ],
    feature: {
      name: 'False Identity',
      description: 'You have created a second identity complete with documentation, established acquaintances, and disguises to assume that persona.'
    },
    personalityTraits: [
      'I fall in and out of love easily, and am always pursuing someone.',
      'I have a joke for every occasion, especially occasions where humor is inappropriate.'
    ],
    ideals: ['Independence. I am a free spirit — no one tells me what to do.', 'Charity. I distribute wealth I acquire to the people who really need it.'],
    bonds: ['I fleeced the wrong person and must work to ensure that this individual never crosses paths with me again.'],
    flaws: ['I can’t resist swindling people who are more powerful than me.']
  },
  {
    id: 'entertainer',
    name: 'Entertainer',
    skillProficiencies: ['acrobatics', 'performance'],
    toolProficiencies: ['Disguise kit', 'One type of musical instrument'],
    equipment: [
      'A musical instrument', 'The favor of an admirer', 'A costume', 'A belt pouch containing 15 gp'
    ],
    feature: {
      name: 'By Popular Demand',
      description: 'You can always find a place to perform, usually in exchange for food and lodging, and you gain a residual audience wherever you have performed.'
    },
    personalityTraits: [
      'I know a story relevant to almost every situation.',
      'Whenever I come to a new place, I collect local rumors and spread gossip.'
    ],
    ideals: ['Beauty. When I perform, I make the world better than it was.', 'Creativity. The world is in need of new ideas and bold action.'],
    bonds: ['My instrument is my most treasured possession, and it reminds me of someone I love.'],
    flaws: ['I’m a sucker for a pretty face.']
  }
];
