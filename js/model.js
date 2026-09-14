/**
 * Character data model: creation, derived/computed stats, and leveling.
 * The character object itself is plain JSON so it can be saved straight
 * to localStorage (see storage.js) or exported/imported as a file.
 */

const CharacterModel = (() => {
  function findRace(id) { return RACES.find(r => r.id === id) || null; }
  function findSubrace(race, subraceId) {
    if (!race || !race.subraces) return null;
    return race.subraces.find(s => s.id === subraceId) || null;
  }
  function findClass(id) { return CLASSES.find(c => c.id === id) || null; }
  function findSubclass(cls, subclassId) {
    if (!cls) return null;
    return cls.subclasses.find(s => s.id === subclassId) || null;
  }
  function findBackground(id) { return BACKGROUNDS.find(b => b.id === id) || null;}

  function uid() {
    return 'char_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  /** Build a brand-new character from wizard selections. */
  function createCharacter({ name, raceId, subraceId, classId, subclassId, backgroundId, abilityScores, chosenSkills, abilityMethod, bonusAbilities }) {
    const cls = findClass(classId);

    const character = {
      id: uid(),
      name: name || 'Unnamed Adventurer',
      alignment: '',
      xp: 0,
      race: { id: raceId, subraceId: subraceId || null, bonusAbilities: bonusAbilities || [] },
      class: { id: classId, subclassId: subclassId || null, level: 1 },
      background: backgroundId,
      abilityScores, // base scores as assigned during creation (before racial bonuses)
      abilityMethod: abilityMethod || 'manual',
      asiBonuses: [], // { level, ability, amount }
      skillProficiencies: chosenSkills || [],
      expertiseSkills: [],
      hp: { max: 0, current: 0, temp: 0 },
      hitDiceTotal: 1,
      hitDiceUsed: 0,
      ac: 10,
      inventory: (cls ? cls.startingEquipment.slice() : []),
      spellsKnown: [],
      spellSlotsUsed: {},
      personality: { traits: '', ideals: '', bonds: '', flaws: '' },
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const conMod = getAbilityModifier(character, 'con');
    const dexMod = getAbilityModifier(character, 'dex');
    const startingHp = Math.max(1, (cls ? cls.hitDie : 8) + conMod);
    character.hp = { max: startingHp, current: startingHp, temp: 0 };
    character.ac = 10 + dexMod;

    const bg = findBackground(backgroundId);
    if (bg) {
      character.inventory = character.inventory.concat(bg.equipment);
      character.personality.traits = bg.personalityTraits ? bg.personalityTraits[0] || '' : '';
      character.personality.ideals = bg.ideals ? bg.ideals[0] || '' : '';
      character.personality.bonds = bg.bonds ? bg.bonds[0] || '' : '';
      character.personality.flaws = bg.flaws ? bg.flaws[0] || '' : '';
    }

    return character;
  }

  /** Full effective ability score for a character, including racial bonuses and ASI increases. */
  function getAbilityScore(character, ability) {
    const race = findRace(character.race.id);
    const subrace = findSubrace(race, character.race.subraceId);
    let bonus = 0;
    if (race && race.abilityBonuses && race.abilityBonuses[ability]) bonus += race.abilityBonuses[ability];
    if (subrace && subrace.abilityBonuses && subrace.abilityBonuses[ability]) bonus += subrace.abilityBonuses[ability];
    if ((character.race.bonusAbilities || []).includes(ability)) {
      const choiceBonus = race && race.abilityChoiceBonus ? race.abilityChoiceBonus.amount : 1;
      bonus += choiceBonus;
    }
    const asi = (character.asiBonuses || []).reduce((sum, b) => b.ability === ability ? sum + b.amount : sum, 0);
    return (character.abilityScores[ability] || 10) + bonus + asi;
  }

  function getAbilityModifier(character, ability) {
    return abilityModifier(getAbilityScore(character, ability));
  }

  function getProficiencyBonus(character) {
    return proficiencyBonusForLevel(character.class.level);
  }

  function getSpeed(character) {
    const race = findRace(character.race.id);
    const subrace = findSubrace(race, character.race.subraceId);
    if (subrace && subrace.speedOverride) return subrace.speedOverride;
    return race ? race.speed : 30;
  }

  function isSavingThrowProficient(character, ability) {
    const cls = findClass(character.class.id);
    return !!(cls && cls.savingThrows.includes(ability));
  }

  function getSavingThrowBonus(character, ability) {
    const mod = getAbilityModifier(character, ability);
    return mod + (isSavingThrowProficient(character, ability) ? getProficiencyBonus(character) : 0);
  }

  function isSkillProficient(character, skillId) {
    return (character.skillProficiencies || []).includes(skillId);
  }

  function isSkillExpert(character, skillId) {
    return (character.expertiseSkills || []).includes(skillId);
  }

  function getSkillBonus(character, skillId) {
    const skill = RULES.skillList.find(s => s.id === skillId);
    if (!skill) return 0;
    const mod = getAbilityModifier(character, skill.ability);
    const prof = getProficiencyBonus(character);
    if (isSkillExpert(character, skillId)) return mod + prof * 2;
    if (isSkillProficient(character, skillId)) return mod + prof;
    return mod;
  }

  function getPassivePerception(character) {
    return 10 + getSkillBonus(character, 'perception');
  }

  function getInitiative(character) {
    return getAbilityModifier(character, 'dex');
  }

  /** Class + subclass features unlocked at or below the character's current level. */
  function getUnlockedFeatures(character) {
    const cls = findClass(character.class.id);
    if (!cls) return [];
    const level = character.class.level;
    const features = cls.features
      .filter(f => f.level <= level)
      .map(f => ({ ...f, source: cls.name }));

    if (character.class.subclassId) {
      const subclass = findSubclass(cls, character.class.subclassId);
      if (subclass) {
        features.push(...subclass.features
          .filter(f => f.level <= level)
          .map(f => ({ ...f, source: subclass.name })));
      }
    }
    return features.sort((a, b) => a.level - b.level);
  }

  function needsSubclassChoice(character) {
    const cls = findClass(character.class.id);
    return !!(cls && character.class.level >= cls.subclassLevel && !character.class.subclassId);
  }

  function getPendingAsiLevels(character) {
    const spent = (character.asiBonuses || []).reduce((set, b) => set.add(b.level), new Set());
    return RULES.asiLevels.filter(lvl => lvl <= character.class.level && !spent.has(lvl));
  }

  function getSpellSlots(character) {
    const cls = findClass(character.class.id);
    if (!cls || !cls.spellcasting) return null;
    const level = character.class.level;
    let table;
    if (cls.spellcasting.slotType === 'full') table = RULES.spellSlotsFull;
    else if (cls.spellcasting.slotType === 'half') table = RULES.spellSlotsHalf;
    else if (cls.spellcasting.slotType === 'pact') table = RULES.spellSlotsPact;
    else if (cls.spellcasting.slotType === 'artificer') table = RULES.spellSlotsArtificer;
    if (!table) return null;
    return table[level] || [];
  }

  function getSpellSaveDC(character) {
    const cls = findClass(character.class.id);
    if (!cls || !cls.spellcasting) return null;
    return 8 + getProficiencyBonus(character) + getAbilityModifier(character, cls.spellcasting.ability);
  }

  function getSpellAttackBonus(character) {
    const cls = findClass(character.class.id);
    if (!cls || !cls.spellcasting) return null;
    return getProficiencyBonus(character) + getAbilityModifier(character, cls.spellcasting.ability);
  }

  /**
   * Advance the character one level. Returns { character, newFeatures, subclassRequired, asiRequired }
   * so the UI can prompt for any choices the new level unlocked.
   */
  function levelUp(character) {
    if (character.class.level >= RULES.MAX_LEVEL) return { character, newFeatures: [], subclassRequired: false, asiRequired: false };

    const cls = findClass(character.class.id);
    character.class.level += 1;
    character.hitDiceTotal += 1;

    const hitDieAverage = Math.floor(cls.hitDie / 2) + 1; // standard 5e "average" HP-per-level rule
    const conMod = getAbilityModifier(character, 'con');
    const hpGain = Math.max(1, hitDieAverage + conMod);
    character.hp.max += hpGain;
    character.hp.current += hpGain;

    const newFeatures = cls.features.filter(f => f.level === character.class.level);
    if (character.class.subclassId) {
      const subclass = findSubclass(cls, character.class.subclassId);
      if (subclass) newFeatures.push(...subclass.features.filter(f => f.level === character.class.level));
    }

    character.updatedAt = new Date().toISOString();

    return {
      character,
      newFeatures,
      subclassRequired: needsSubclassChoice(character),
      asiRequired: RULES.asiLevels.includes(character.class.level),
      hpGain
    };
  }

  function applyAsi(character, level, choices) {
    // choices: [{ability, amount}, ...] totalling 2 points, max +2 to a single ability, ability cap 20
    choices.forEach(choice => {
      character.asiBonuses.push({ level, ability: choice.ability, amount: choice.amount });
    });
    character.updatedAt = new Date().toISOString();
  }

  function setSubclass(character, subclassId) {
    character.class.subclassId = subclassId;
    character.updatedAt = new Date().toISOString();
  }

  return {
    findRace, findSubrace, findClass, findSubclass, findBackground,
    createCharacter, getAbilityScore, getAbilityModifier, getProficiencyBonus,
    getSpeed, isSavingThrowProficient, getSavingThrowBonus, isSkillProficient,
    isSkillExpert, getSkillBonus, getPassivePerception, getInitiative,
    getUnlockedFeatures, needsSubclassChoice, getPendingAsiLevels,
    getSpellSlots, getSpellSaveDC, getSpellAttackBonus,
    levelUp, applyAsi, setSubclass
  };
})();
