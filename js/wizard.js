/**
 * Guided character creation wizard (BG3-style): Name -> Race -> Class ->
 * Background -> Ability Scores -> Skills -> Review.
 */

const Wizard = (() => {
  const STEPS = ['Name', 'Race', 'Class', 'Background', 'Abilities', 'Skills', 'Review'];

  function render(container, onComplete, onCancel) {
    const draft = {
      name: '',
      raceId: null,
      subraceId: null,
      bonusAbilities: [],
      classId: null,
      subclassId: null,
      backgroundId: null,
      abilityMethod: 'standard',
      standardAssignment: { str: null, dex: null, con: null, int: null, wis: null, cha: null },
      pointBuyScores: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
      manualScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      chosenSkills: []
    };

    let stepIndex = 0;

    function abilityScoresFromDraft() {
      if (draft.abilityMethod === 'pointbuy') return { ...draft.pointBuyScores };
      if (draft.abilityMethod === 'manual') return { ...draft.manualScores };
      const scores = {};
      RULES.abilityNames.forEach(a => { scores[a] = draft.standardAssignment[a] || 8; });
      return scores;
    }

    function selectedRace() { return draft.raceId ? CharacterModel.findRace(draft.raceId) : null; }
    function selectedSubrace() { const r = selectedRace(); return r ? CharacterModel.findSubrace(r, draft.subraceId) : null; }
    function selectedClass() { return draft.classId ? CharacterModel.findClass(draft.classId) : null; }
    function selectedBackground() { return draft.backgroundId ? CharacterModel.findBackground(draft.backgroundId) : null; }

    function canAdvance() {
      switch (STEPS[stepIndex]) {
        case 'Name': return draft.name.trim().length > 0;
        case 'Race': {
          const race = selectedRace();
          if (!race) return false;
          if (race.subraces && !draft.subraceId) return false;
          if (race.abilityChoiceBonus && draft.bonusAbilities.length !== race.abilityChoiceBonus.count) return false;
          return true;
        }
        case 'Class': return !!draft.classId;
        case 'Background': return !!draft.backgroundId;
        case 'Abilities': {
          if (draft.abilityMethod === 'standard') {
            return RULES.abilityNames.every(a => draft.standardAssignment[a] !== null);
          }
          if (draft.abilityMethod === 'pointbuy') {
            return pointBuyRemaining() === 0;
          }
          return RULES.abilityNames.every(a => draft.manualScores[a] >= 3 && draft.manualScores[a] <= 20);
        }
        case 'Skills': {
          const cls = selectedClass();
          if (!cls) return false;
          return draft.chosenSkills.length === cls.skillChoices.count;
        }
        default: return true;
      }
    }

    function pointBuyRemaining() {
      const spent = RULES.abilityNames.reduce((sum, a) => sum + (RULES.pointBuy.cost[draft.pointBuyScores[a]] || 0), 0);
      return RULES.pointBuy.totalPoints - spent;
    }

    function goTo(index) {
      stepIndex = Math.max(0, Math.min(STEPS.length - 1, index));
      renderStep();
    }

    function renderProgress() {
      return el('div', { class: 'wizard-progress' }, STEPS.map((label, i) => el('div', {
        class: 'wizard-progress__step' + (i === stepIndex ? ' wizard-progress__step--active' : i < stepIndex ? ' wizard-progress__step--done' : '')
      }, label)));
    }

    function renderActions(body) {
      const nextLabel = stepIndex === STEPS.length - 1 ? 'Create Character' : 'Next';
      const actions = el('div', { class: 'wizard-actions' }, [
        el('button', {
          class: 'btn btn--ghost',
          onclick: () => { if (stepIndex === 0) onCancel(); else goTo(stepIndex - 1); }
        }, stepIndex === 0 ? 'Cancel' : '← Back'),
        el('button', {
          class: 'btn btn--primary',
          disabled: !canAdvance(),
          onclick: () => {
            if (stepIndex === STEPS.length - 1) finish();
            else goTo(stepIndex + 1);
          }
        }, nextLabel)
      ]);
      body.appendChild(actions);
    }

    function finish() {
      const character = CharacterModel.createCharacter({
        name: draft.name.trim(),
        raceId: draft.raceId,
        subraceId: draft.subraceId,
        classId: draft.classId,
        subclassId: draft.subclassId,
        backgroundId: draft.backgroundId,
        abilityScores: abilityScoresFromDraft(),
        abilityMethod: draft.abilityMethod,
        chosenSkills: draft.chosenSkills,
        bonusAbilities: draft.bonusAbilities
      });
      const bg = selectedBackground();
      if (bg) {
        character.skillProficiencies = Array.from(new Set([...(bg.skillProficiencies || []), ...draft.chosenSkills]));
      }
      onComplete(character);
    }

    function renderStep() {
      container.innerHTML = '';
      container.appendChild(renderProgress());
      const stepBody = el('div', { class: 'wizard-step' });
      container.appendChild(stepBody);

      switch (STEPS[stepIndex]) {
        case 'Name': renderNameStep(stepBody); break;
        case 'Race': renderRaceStep(stepBody); break;
        case 'Class': renderClassStep(stepBody); break;
        case 'Background': renderBackgroundStep(stepBody); break;
        case 'Abilities': renderAbilitiesStep(stepBody); break;
        case 'Skills': renderSkillsStep(stepBody); break;
        case 'Review': renderReviewStep(stepBody); break;
      }

      renderActions(container);
    }

    function refresh() { renderStep(); }

    // ---------------- Step renderers ----------------

    function renderNameStep(body) {
      body.appendChild(el('h2', {}, "What's your hero's name?"));
      body.appendChild(el('p', { class: 'wizard-step__subtitle' }, 'You can change this any time from the character sheet.'));
      const field = el('div', { class: 'field' }, [
        el('label', { for: 'wname' }, 'Character Name'),
        el('input', {
          type: 'text', id: 'wname', value: draft.name, autofocus: true,
          placeholder: 'e.g. Astarion, Karlach, Shadowheart…',
          oninput: (e) => { draft.name = e.target.value; refreshActionsOnly(); }
        })
      ]);
      body.appendChild(field);
      setTimeout(() => document.getElementById('wname')?.focus(), 0);
    }

    function refreshActionsOnly() {
      const oldActions = container.querySelector('.wizard-actions');
      if (oldActions) oldActions.remove();
      renderActions(container);
    }

    function renderRaceStep(body) {
      body.appendChild(el('h2', {}, 'Choose a Race'));
      body.appendChild(el('p', { class: 'wizard-step__subtitle' }, 'Your race shapes your appearance, natural talents, and starting abilities.'));

      const grid = el('div', { class: 'option-grid' });
      RACES.forEach(race => {
        const bonusText = Object.entries(race.abilityBonuses || {}).map(([a, v]) => `${a.toUpperCase()} +${v}`).join(', ');
        grid.appendChild(el('div', {
          class: 'option-card' + (draft.raceId === race.id ? ' option-card--selected' : ''),
          onclick: () => { draft.raceId = race.id; draft.subraceId = null; draft.bonusAbilities = []; refresh(); }
        }, [
          el('div', { class: 'option-card__title' }, race.name),
          el('div', { class: 'option-card__desc' }, race.description),
          el('div', { class: 'option-card__tags' }, [
            el('span', { class: 'tag' }, `Speed ${race.speed} ft`),
            el('span', { class: 'tag' }, race.size),
            bonusText ? el('span', { class: 'tag' }, bonusText) : null
          ])
        ]));
      });
      body.appendChild(grid);

      const race = selectedRace();
      if (race && race.subraces) {
        body.appendChild(el('h3', {}, 'Choose a Subrace'));
        const subGrid = el('div', { class: 'option-grid' });
        race.subraces.forEach(sub => {
          const bonusText = Object.entries(sub.abilityBonuses || {}).map(([a, v]) => `${a.toUpperCase()} +${v}`).join(', ');
          subGrid.appendChild(el('div', {
            class: 'option-card' + (draft.subraceId === sub.id ? ' option-card--selected' : ''),
            onclick: () => { draft.subraceId = sub.id; refresh(); }
          }, [
            el('div', { class: 'option-card__title' }, sub.name),
            el('div', { class: 'option-card__tags' }, bonusText ? [el('span', { class: 'tag' }, bonusText)] : [])
          ]));
        });
        body.appendChild(subGrid);
      }

      if (race && race.abilityChoiceBonus) {
        const { count, amount, exclude } = race.abilityChoiceBonus;
        body.appendChild(el('h3', {}, `Choose ${count} abilities to increase by +${amount}`));
        const grid2 = el('div', { class: 'checkbox-grid' });
        RULES.abilityNames.filter(a => !(exclude || []).includes(a)).forEach(a => {
          const checked = draft.bonusAbilities.includes(a);
          const maxReached = draft.bonusAbilities.length >= count && !checked;
          grid2.appendChild(el('label', { class: 'checkbox-row' + (maxReached ? ' checkbox-row--disabled' : '') }, [
            el('input', {
              type: 'checkbox', checked, disabled: maxReached,
              onchange: (e) => {
                if (e.target.checked) draft.bonusAbilities.push(a);
                else draft.bonusAbilities = draft.bonusAbilities.filter(x => x !== a);
                refresh();
              }
            }),
            RULES.abilityLabels[a]
          ]));
        });
        body.appendChild(grid2);
      }

      if (race) {
        const sub = selectedSubrace();
        const traits = [...race.traits, ...(sub ? sub.traits : [])];
        body.appendChild(el('div', { class: 'detail-panel' }, [
          el('h3', {}, `${sub ? sub.name : race.name} Traits`),
          el('ul', {}, traits.map(t => el('li', {}, [el('strong', {}, t.name + '. '), t.description])))
        ]));
      }
    }

    function renderClassStep(body) {
      body.appendChild(el('h2', {}, 'Choose a Class'));
      body.appendChild(el('p', { class: 'wizard-step__subtitle' }, 'Your class determines your abilities in and out of combat, and how you’ll grow more powerful.'));

      const grid = el('div', { class: 'option-grid' });
      CLASSES.forEach(cls => {
        grid.appendChild(el('div', {
          class: 'option-card' + (draft.classId === cls.id ? ' option-card--selected' : ''),
          onclick: () => { draft.classId = cls.id; draft.subclassId = null; draft.chosenSkills = []; refresh(); }
        }, [
          el('div', { class: 'option-card__title' }, cls.name),
          el('div', { class: 'option-card__desc' }, `Hit Die: d${cls.hitDie} · Primary: ${cls.primaryAbility.map(a => a.toUpperCase()).join('/')}`),
          el('div', { class: 'option-card__tags' }, [
            el('span', { class: 'tag' }, cls.spellcasting ? 'Spellcaster' : 'Martial')
          ])
        ]));
      });
      body.appendChild(grid);

      const cls = selectedClass();
      if (cls) {
        body.appendChild(el('div', { class: 'detail-panel' }, [
          el('h3', {}, 'Level 1 Features'),
          el('ul', {}, cls.features.filter(f => f.level === 1).map(f => el('li', {}, [el('strong', {}, f.name + '. '), f.description]))),
          el('p', {}, `Saving Throws: ${cls.savingThrows.map(a => RULES.abilityLabels[a]).join(', ')}`),
          el('p', {}, `Armor: ${cls.armorProficiencies.length ? cls.armorProficiencies.join(', ') : 'None'}`),
          el('p', {}, `Weapons: ${cls.weaponProficiencies.join(', ')}`)
        ]));

        if (cls.subclassLevel === 1) {
          body.appendChild(el('h3', {}, `Choose your ${cls.subclassFeatureName}`));
          const subGrid = el('div', { class: 'option-grid' });
          cls.subclasses.forEach(sub => {
            subGrid.appendChild(el('div', {
              class: 'option-card' + (draft.subclassId === sub.id ? ' option-card--selected' : ''),
              onclick: () => { draft.subclassId = sub.id; refresh(); }
            }, [
              el('div', { class: 'option-card__title' }, sub.name),
              el('div', { class: 'option-card__desc' }, sub.description)
            ]));
          });
          body.appendChild(subGrid);
        } else {
          body.appendChild(el('p', { class: 'hint' }, `You'll choose your ${cls.subclassFeatureName} at level ${cls.subclassLevel} — the sheet will prompt you when you level up.`));
        }
      }
    }

    function renderBackgroundStep(body) {
      body.appendChild(el('h2', {}, 'Choose a Background'));
      body.appendChild(el('p', { class: 'wizard-step__subtitle' }, 'Your background reflects your life before adventuring, granting extra skills and a unique feature.'));

      const grid = el('div', { class: 'option-grid' });
      BACKGROUNDS.forEach(bg => {
        grid.appendChild(el('div', {
          class: 'option-card' + (draft.backgroundId === bg.id ? ' option-card--selected' : ''),
          onclick: () => { draft.backgroundId = bg.id; refresh(); }
        }, [
          el('div', { class: 'option-card__title' }, bg.name),
          el('div', { class: 'option-card__desc' }, `Skills: ${bg.skillProficiencies.map(s => RULES.skillList.find(x => x.id === s).label).join(', ')}`),
        ]));
      });
      body.appendChild(grid);

      const bg = selectedBackground();
      if (bg) {
        body.appendChild(el('div', { class: 'detail-panel' }, [
          el('h3', {}, bg.feature.name),
          el('p', {}, bg.feature.description),
          el('p', {}, [el('strong', {}, 'Starting Equipment: '), bg.equipment.join(', ')])
        ]));
      }
    }

    function renderAbilitiesStep(body) {
      body.appendChild(el('h2', {}, 'Determine Ability Scores'));
      body.appendChild(el('p', { class: 'wizard-step__subtitle' }, 'Pick the method your table uses. Racial bonuses are applied automatically.'));

      const tabs = el('div', { class: 'method-tabs' }, [
        methodTab('standard', 'Standard Array'),
        methodTab('pointbuy', 'Point Buy'),
        methodTab('manual', 'Manual / Rolled')
      ]);
      body.appendChild(tabs);

      if (draft.abilityMethod === 'standard') body.appendChild(renderStandardArray());
      else if (draft.abilityMethod === 'pointbuy') body.appendChild(renderPointBuy());
      else body.appendChild(renderManualEntry());
    }

    function methodTab(method, label) {
      return el('button', {
        class: 'method-tab' + (draft.abilityMethod === method ? ' method-tab--active' : ''),
        onclick: () => { draft.abilityMethod = method; refresh(); }
      }, label);
    }

    function abilityCard(ability, baseValue, control) {
      const race = selectedRace();
      const sub = selectedSubrace();
      let racialBonus = 0;
      if (race && race.abilityBonuses && race.abilityBonuses[ability]) racialBonus += race.abilityBonuses[ability];
      if (sub && sub.abilityBonuses && sub.abilityBonuses[ability]) racialBonus += sub.abilityBonuses[ability];
      if (draft.bonusAbilities.includes(ability)) racialBonus += (race.abilityChoiceBonus ? race.abilityChoiceBonus.amount : 1);
      const total = (baseValue || 0) + racialBonus;
      return el('div', { class: 'ability-assign-card' }, [
        el('div', { class: 'ability-assign-card__label' }, RULES.abilityLabels[ability]),
        control,
        el('div', { class: 'ability-assign-card__total' }, `${total} (${formatModifier(abilityModifier(total))})`),
        racialBonus ? el('div', { class: 'ability-assign-card__breakdown' }, `${baseValue || 0} base + ${racialBonus} racial`) : null
      ]);
    }

    function renderStandardArray() {
      const wrap = el('div', {}, [
        el('p', { class: 'hint' }, `Assign each value from ${RULES.standardArray.join(', ')} to a different ability.`)
      ]);
      const grid = el('div', { class: 'ability-assign-grid' });
      const used = Object.values(draft.standardAssignment).filter(v => v !== null);
      RULES.abilityNames.forEach(ability => {
        const currentValue = draft.standardAssignment[ability];
        const available = RULES.standardArray.filter(v => !used.includes(v) || v === currentValue);
        const select = el('select', {
          onchange: (e) => {
            const val = e.target.value ? Number(e.target.value) : null;
            draft.standardAssignment[ability] = val;
            refresh();
          }
        }, [
          el('option', { value: '', selected: currentValue === null }, '—'),
          ...available.map(v => el('option', { value: v, selected: v === currentValue }, String(v)))
        ]);
        grid.appendChild(abilityCard(ability, currentValue || 0, select));
      });
      wrap.appendChild(grid);
      return wrap;
    }

    function renderPointBuy() {
      const wrap = el('div', {});
      wrap.appendChild(el('div', { class: 'pointbuy-remaining' }, `${pointBuyRemaining()} points remaining`));
      wrap.appendChild(el('p', { class: 'hint', style: 'text-align:center;margin-top:-0.6rem;' }, 'Spend all your points to continue — point buy doesn’t allow banking leftovers.'));
      const grid = el('div', { class: 'ability-assign-grid' });
      RULES.abilityNames.forEach(ability => {
        const value = draft.pointBuyScores[ability];
        const controls = el('div', { style: 'display:flex;align-items:center;gap:0.4rem;justify-content:center;' }, [
          el('button', {
            class: 'btn btn--small btn--ghost', type: 'button',
            disabled: value <= RULES.pointBuy.min,
            onclick: () => { draft.pointBuyScores[ability] -= 1; refresh(); }
          }, '−'),
          el('span', { style: 'min-width:1.6rem;display:inline-block;text-align:center;font-weight:700;' }, String(value)),
          el('button', {
            class: 'btn btn--small btn--ghost', type: 'button',
            disabled: value >= RULES.pointBuy.max || pointBuyRemaining() - (RULES.pointBuy.cost[value + 1] - RULES.pointBuy.cost[value]) < 0,
            onclick: () => { draft.pointBuyScores[ability] += 1; refresh(); }
          }, '+')
        ]);
        grid.appendChild(abilityCard(ability, value, controls));
      });
      wrap.appendChild(grid);
      return wrap;
    }

    function renderManualEntry() {
      const grid = el('div', { class: 'ability-assign-grid' });
      RULES.abilityNames.forEach(ability => {
        const input = el('input', {
          type: 'number', min: 3, max: 20, value: draft.manualScores[ability],
          onchange: (e) => {
            let val = parseInt(e.target.value, 10);
            if (isNaN(val)) val = 10;
            val = Math.max(3, Math.min(20, val));
            draft.manualScores[ability] = val;
            refresh();
          }
        });
        grid.appendChild(abilityCard(ability, draft.manualScores[ability], input));
      });
      return grid;
    }

    function renderSkillsStep(body) {
      const cls = selectedClass();
      const bg = selectedBackground();
      body.appendChild(el('h2', {}, 'Choose Skill Proficiencies'));
      body.appendChild(el('p', { class: 'wizard-step__subtitle' },
        `${bg.name} already grants you ${bg.skillProficiencies.map(s => RULES.skillList.find(x => x.id === s).label).join(' and ')}. Choose ${cls.skillChoices.count} more from your class list below.`));

      const grid = el('div', { class: 'checkbox-grid' });
      const options = cls.skillChoices.options.filter(s => !bg.skillProficiencies.includes(s));
      options.forEach(skillId => {
        const skill = RULES.skillList.find(s => s.id === skillId);
        const checked = draft.chosenSkills.includes(skillId);
        const maxReached = draft.chosenSkills.length >= cls.skillChoices.count && !checked;
        grid.appendChild(el('label', { class: 'checkbox-row' + (maxReached ? ' checkbox-row--disabled' : '') }, [
          el('input', {
            type: 'checkbox', checked, disabled: maxReached,
            onchange: (e) => {
              if (e.target.checked) draft.chosenSkills.push(skillId);
              else draft.chosenSkills = draft.chosenSkills.filter(x => x !== skillId);
              refresh();
            }
          }),
          `${skill.label} (${skill.ability.toUpperCase()})`
        ]));
      });
      body.appendChild(grid);
      body.appendChild(el('p', { class: 'hint' }, `${draft.chosenSkills.length} / ${cls.skillChoices.count} selected`));
    }

    function renderReviewStep(body) {
      const race = selectedRace();
      const sub = selectedSubrace();
      const cls = selectedClass();
      const subclass = cls && draft.subclassId ? CharacterModel.findSubclass(cls, draft.subclassId) : null;
      const bg = selectedBackground();
      const scores = abilityScoresFromDraft();

      body.appendChild(el('h2', {}, 'Review Your Hero'));
      body.appendChild(el('div', { class: 'review-summary' }, [
        el('dl', {}, [
          el('dt', {}, 'Name'), el('dd', {}, draft.name),
          el('dt', {}, 'Race'), el('dd', {}, sub ? `${sub.name} ${race.name}` : race.name),
          el('dt', {}, 'Class'), el('dd', {}, subclass ? `${subclass.name} ${cls.name}` : cls.name),
          el('dt', {}, 'Background'), el('dd', {}, bg.name),
          el('dt', {}, 'Speed'), el('dd', {}, `${(sub && sub.speedOverride) || race.speed} ft`)
        ])
      ]));

      const grid = el('div', { class: 'ability-assign-grid' }, RULES.abilityNames.map(a => {
        let racialBonus = 0;
        if (race.abilityBonuses[a]) racialBonus += race.abilityBonuses[a];
        if (sub && sub.abilityBonuses && sub.abilityBonuses[a]) racialBonus += sub.abilityBonuses[a];
        if (draft.bonusAbilities.includes(a)) racialBonus += (race.abilityChoiceBonus ? race.abilityChoiceBonus.amount : 1);
        const total = scores[a] + racialBonus;
        return el('div', { class: 'ability-assign-card' }, [
          el('div', { class: 'ability-assign-card__label' }, RULES.abilityLabels[a]),
          el('div', { class: 'ability-assign-card__total' }, `${total} (${formatModifier(abilityModifier(total))})`),
          el('div', { class: 'ability-assign-card__breakdown' }, `${scores[a]} base + ${racialBonus} racial`)
        ]);
      }));
      body.appendChild(grid);

      body.appendChild(el('div', { class: 'detail-panel' }, [
        el('h3', {}, 'Skill Proficiencies'),
        el('p', {}, Array.from(new Set([...bg.skillProficiencies, ...draft.chosenSkills]))
          .map(s => RULES.skillList.find(x => x.id === s).label).join(', ')),
        el('h3', {}, 'Starting Equipment'),
        el('p', {}, [...cls.startingEquipment, ...bg.equipment].join('; '))
      ]));
    }

    renderStep();
  }

  return { render };
})();
