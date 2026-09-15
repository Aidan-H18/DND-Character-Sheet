/**
 * Full character sheet view: stats, skills, features, spellcasting,
 * inventory, personality, and the level-up flow. Every edit calls
 * `onChange(character)` immediately so nothing is ever lost.
 */

const Sheet = (() => {
  function render(container, character, { onBack, onChange }) {
    function persist() { character.updatedAt = new Date().toISOString(); onChange(character); }
    function rerender() { container.innerHTML = ''; build(); }

    function build() {
      const cls = CharacterModel.findClass(character.class.id);
      const subclass = character.class.subclassId ? CharacterModel.findSubclass(cls, character.class.subclassId) : null;
      const race = CharacterModel.findRace(character.race.id);
      const subrace = CharacterModel.findSubrace(race, character.race.subraceId);
      const bg = CharacterModel.findBackground(character.background);

      container.appendChild(buildHeader(cls, subclass, race, subrace, bg));

      if (CharacterModel.needsSubclassChoice(character)) {
        container.appendChild(el('div', { class: 'pending-banner' }, [
          el('span', {}, `⚠ Choose your ${cls.subclassFeatureName} to finish leveling up.`),
          el('button', { class: 'btn btn--small btn--primary', onclick: () => promptSubclassChoice(cls) }, 'Choose Now')
        ]));
      }
      const pendingAsi = CharacterModel.getPendingAsiLevels(character);
      if (pendingAsi.length) {
        container.appendChild(el('div', { class: 'pending-banner' }, [
          el('span', {}, `⚠ You have an unspent Ability Score Improvement (level ${pendingAsi[0]}).`),
          el('button', { class: 'btn btn--small btn--primary', onclick: () => promptAsiChoice(pendingAsi[0]) }, 'Apply Now')
        ]));
      }

      const grid = el('div', { class: 'sheet-grid' });
      grid.appendChild(buildLeftColumn());
      grid.appendChild(buildMiddleColumn(cls, subclass, race, subrace, bg));
      grid.appendChild(buildRightColumn(cls));
      container.appendChild(grid);
    }

    // ---------------- Header ----------------

    function buildHeader(cls, subclass, race, subrace, bg) {
      const raceLabel = subrace ? subrace.name : race.name;
      const classLabel = subclass ? `${subclass.name} ${cls.name}` : cls.name;

      return el('div', { class: 'sheet-header' }, [
        el('div', {}, [
          el('button', { class: 'btn btn--ghost btn--small', onclick: onBack }, '← My Characters'),
          el('input', {
            class: 'sheet-header__name inline-editable', value: character.name,
            style: 'font-family: Georgia, serif; font-size: 2rem; background:transparent; border:none; margin-top:0.4rem;',
            onchange: (e) => { character.name = e.target.value || 'Unnamed Adventurer'; persist(); }
          }),
          el('div', { class: 'sheet-header__subtitle' }, `Level ${character.class.level} ${raceLabel} ${classLabel} · ${bg.name}`)
        ]),
        el('div', { class: 'sheet-header__actions' }, [
          el('button', { class: 'btn btn--primary', onclick: doLevelUp, disabled: character.class.level >= RULES.MAX_LEVEL }, '⭱ Level Up'),
        ])
      ]);
    }

    // ---------------- Left column: abilities + core stats ----------------

    function buildLeftColumn() {
      const col = el('div', {}, []);

      const coreStats = el('div', { class: 'card' }, [
        el('h3', {}, 'Core Stats'),
        el('div', { class: 'stat-block' }, [
          statTile('Level', character.class.level),
          statTile('Prof. Bonus', formatModifier(CharacterModel.getProficiencyBonus(character))),
          statTile('Speed', `${CharacterModel.getSpeed(character)} ft`),
          statTile('Initiative', formatModifier(CharacterModel.getInitiative(character))),
          statTile('Passive Perc.', CharacterModel.getPassivePerception(character))
        ]),
        field('Alignment', el('input', {
          type: 'text', value: character.alignment, placeholder: 'e.g. Chaotic Good',
          onchange: (e) => { character.alignment = e.target.value; persist(); }
        })),
        field('Experience Points', el('input', {
          type: 'number', min: 0, value: character.xp,
          onchange: (e) => { character.xp = Math.max(0, parseInt(e.target.value, 10) || 0); persist(); }
        }))
      ]);
      col.appendChild(coreStats);

      const abilitiesCard = el('div', { class: 'card' }, [el('h3', {}, 'Ability Scores')]);
      const list = el('div', { class: 'ability-list' });
      RULES.abilityNames.forEach(ability => {
        const total = CharacterModel.getAbilityScore(character, ability);
        const mod = abilityModifier(total);
        list.appendChild(el('div', { class: 'ability-row' }, [
          el('div', { class: 'ability-row__name' }, ability.toUpperCase()),
          el('input', {
            class: 'inline-editable', type: 'number', style: 'width:3.2rem;text-align:center;',
            value: character.abilityScores[ability],
            onchange: (e) => {
              let val = parseInt(e.target.value, 10);
              if (isNaN(val)) val = 10;
              character.abilityScores[ability] = Math.max(1, Math.min(30, val));
              persist(); rerender();
            }
          }),
          el('span', { class: 'ability-row__score' }, `= ${total}`),
          el('span', { class: 'ability-row__mod' }, formatModifier(mod))
        ]));
      });
      abilitiesCard.appendChild(list);
      col.appendChild(abilitiesCard);

      return col;
    }

    function statTile(label, value) {
      return el('div', { class: 'stat-tile' }, [
        el('div', { class: 'stat-tile__value' }, String(value)),
        el('div', { class: 'stat-tile__label' }, label)
      ]);
    }

    // ---------------- Middle column: saves, skills, features ----------------

    function buildMiddleColumn(cls, subclass, race, subrace, bg) {
      const col = el('div', {}, []);

      const savesCard = el('div', { class: 'card' }, [el('h3', {}, 'Saving Throws')]);
      RULES.abilityNames.forEach(ability => {
        const proficient = CharacterModel.isSavingThrowProficient(character, ability);
        savesCard.appendChild(el('div', { class: 'save-row' }, [
          el('input', { type: 'checkbox', checked: proficient, disabled: true, title: 'Determined by class' }),
          el('span', {}, RULES.abilityLabels[ability]),
          el('span', { class: 'save-row__bonus' }, formatModifier(CharacterModel.getSavingThrowBonus(character, ability)))
        ]));
      });
      col.appendChild(savesCard);

      const skillsCard = el('div', { class: 'card' }, [el('h3', {}, 'Skills')]);
      RULES.skillList.forEach(skill => {
        const proficient = CharacterModel.isSkillProficient(character, skill.id);
        const expert = CharacterModel.isSkillExpert(character, skill.id);
        skillsCard.appendChild(el('div', { class: 'skill-row' }, [
          el('input', {
            type: 'checkbox', checked: proficient, title: 'Proficient',
            onchange: (e) => {
              if (e.target.checked) character.skillProficiencies.push(skill.id);
              else {
                character.skillProficiencies = character.skillProficiencies.filter(s => s !== skill.id);
                character.expertiseSkills = character.expertiseSkills.filter(s => s !== skill.id);
              }
              persist(); rerender();
            }
          }),
          el('span', { class: 'skill-row__ability' }, skill.ability.toUpperCase()),
          el('span', {}, skill.label + (expert ? ' (Expertise)' : '')),
          el('span', { class: 'skill-row__bonus' }, formatModifier(CharacterModel.getSkillBonus(character, skill.id)))
        ]));
      });
      col.appendChild(skillsCard);

      const featuresCard = el('div', { class: 'card' }, [el('h3', {}, 'Features & Traits')]);
      const raceTraits = [...race.traits, ...(subrace ? subrace.traits : [])].map(t => ({ ...t, source: subrace ? subrace.name : race.name }));
      raceTraits.forEach(t => featuresCard.appendChild(featureEntry(t.name, t.source, t.description)));
      if (bg) featuresCard.appendChild(featureEntry(bg.feature.name, bg.name, bg.feature.description));
      CharacterModel.getUnlockedFeatures(character).forEach(f => featuresCard.appendChild(featureEntry(f.name, `${f.source} · Lv ${f.level}`, f.description)));
      col.appendChild(featuresCard);

      return col;
    }

    function featureEntry(name, meta, desc) {
      return el('div', { class: 'feature-entry' }, [
        el('div', { class: 'feature-entry__title' }, name),
        el('div', { class: 'feature-entry__meta' }, meta),
        el('div', { class: 'feature-entry__desc' }, desc)
      ]);
    }

    // ---------------- Right column: combat, spells, inventory, personality, notes ----------------

    function buildRightColumn(cls) {
      const col = el('div', {}, []);

      const combatCard = el('div', { class: 'card' }, [el('h3', {}, 'Combat')]);
      combatCard.appendChild(el('div', { class: 'stat-block' }, [
        el('div', { class: 'stat-tile' }, [
          el('input', {
            class: 'inline-editable', type: 'number', style: 'width:3.5rem;text-align:center;font-size:1.4rem;color:var(--accent-strong);background:transparent;border:none;',
            value: character.ac,
            onchange: (e) => { character.ac = parseInt(e.target.value, 10) || 10; persist(); }
          }),
          el('div', { class: 'stat-tile__label' }, 'Armor Class')
        ]),
        el('div', { class: 'stat-tile' }, [
          el('div', { class: 'stat-tile__value' }, `${character.hitDiceTotal - character.hitDiceUsed}/${character.hitDiceTotal}`),
          el('div', { class: 'stat-tile__label' }, `d${cls.hitDie} Hit Dice`)
        ])
      ]));
      combatCard.appendChild(el('div', { class: 'hp-controls' }, [
        labeledNumber('Current', character.hp.current, (v) => { character.hp.current = v; persist(); }),
        el('span', {}, '/'),
        labeledNumber('Max', character.hp.max, (v) => { character.hp.max = v; persist(); }),
        labeledNumber('Temp', character.hp.temp, (v) => { character.hp.temp = v; persist(); })
      ]));
      col.appendChild(combatCard);

      if (cls.spellcasting) col.appendChild(buildSpellcastingCard(cls));

      col.appendChild(buildListCard('Inventory & Equipment', character.inventory, (items) => { character.inventory = items; persist(); }));

      const personalityCard = el('div', { class: 'card' }, [el('h3', {}, 'Personality')]);
      ['traits', 'ideals', 'bonds', 'flaws'].forEach(key => {
        personalityCard.appendChild(field(capitalize(key), el('textarea', {
          class: 'notes-area', style: 'min-height:50px;',
          oninput: (e) => { character.personality[key] = e.target.value; persist(); }
        }, character.personality[key] || '')));
      });
      col.appendChild(personalityCard);

      const notesCard = el('div', { class: 'card' }, [
        el('h3', {}, 'Notes'),
        el('textarea', {
          class: 'notes-area',
          oninput: (e) => { character.notes = e.target.value; persist(); }
        }, character.notes || '')
      ]);
      col.appendChild(notesCard);

      return col;
    }

    function labeledNumber(label, value, onSet) {
      return el('div', { style: 'text-align:center;' }, [
        el('input', {
          type: 'number', value,
          onchange: (e) => onSet(parseInt(e.target.value, 10) || 0)
        }),
        el('div', { style: 'font-size:0.7rem;color:var(--text-muted);' }, label)
      ]);
    }

    function buildSpellcastingCard(cls) {
      const card = el('div', { class: 'card' }, [el('h3', {}, 'Spellcasting')]);
      card.appendChild(el('div', { class: 'stat-block' }, [
        statTile('Save DC', CharacterModel.getSpellSaveDC(character)),
        statTile('Attack Bonus', formatModifier(CharacterModel.getSpellAttackBonus(character))),
        statTile('Ability', cls.spellcasting.ability.toUpperCase())
      ]));

      const slots = CharacterModel.getSpellSlots(character);
      if (slots && slots.length) {
        card.appendChild(el('h4', { style: 'margin: 0.6rem 0 0.3rem;color:var(--text-muted);font-size:0.85rem;' },
          cls.spellcasting.slotType === 'pact' ? 'Pact Magic Slots' : 'Spell Slots'));
        if (cls.spellcasting.slotType === 'pact') {
          const [count, level] = slots;
          card.appendChild(spellSlotRow(`Lv ${level}`, count, `pact`));
        } else {
          slots.forEach((count, idx) => {
            if (!count) return;
            card.appendChild(spellSlotRow(`Lv ${idx + 1}`, count, `L${idx + 1}`));
          });
        }
      }

      card.appendChild(buildListCard('Spells Known / Prepared', character.spellsKnown, (items) => { character.spellsKnown = items; persist(); }, true));
      return card;
    }

    function spellSlotRow(label, count, key) {
      const used = character.spellSlotsUsed[key] || 0;
      const boxes = [];
      for (let i = 0; i < count; i++) {
        const isUsed = i < used;
        boxes.push(el('div', {
          class: 'slot-checkbox' + (isUsed ? ' slot-checkbox--used' : ''),
          onclick: () => {
            character.spellSlotsUsed[key] = isUsed ? i : i + 1;
            persist(); rerender();
          }
        }));
      }
      return el('div', { class: 'spell-slot-row' }, [
        el('span', { class: 'spell-slot-row__label' }, label),
        ...boxes
      ]);
    }

    function buildListCard(title, items, onSave, nested) {
      const card = nested ? el('div', {}, [el('h4', { style: 'margin:0.8rem 0 0.3rem;color:var(--text-muted);font-size:0.85rem;' }, title)]) : el('div', { class: 'card' }, [el('h3', {}, title)]);
      const list = el('ul', { class: 'item-list' });
      items.forEach((item, idx) => {
        list.appendChild(el('li', {}, [
          el('span', {}, item),
          el('button', {
            class: 'btn btn--small btn--ghost', title: 'Remove',
            onclick: () => { items.splice(idx, 1); onSave(items); rerender(); }
          }, '✕')
        ]));
      });
      card.appendChild(list);

      let draftValue = '';
      const input = el('input', { type: 'text', placeholder: 'Add item…', oninput: (e) => { draftValue = e.target.value; } });
      const addRow = el('div', { class: 'add-item-row' }, [
        input,
        el('button', {
          class: 'btn btn--small btn--primary',
          onclick: () => {
            if (draftValue.trim()) { items.push(draftValue.trim()); onSave(items); rerender(); }
          }
        }, 'Add')
      ]);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addRow.querySelector('button').click(); }
      });
      card.appendChild(addRow);
      return card;
    }

    function field(label, inputNode) {
      return el('div', { class: 'field' }, [el('label', {}, label), inputNode]);
    }

    function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    // ---------------- Level up flow ----------------

    function doLevelUp() {
      const result = CharacterModel.levelUp(character);
      persist();
      const lines = [`Reached level ${character.class.level}! +${result.hpGain} HP.`];
      if (result.newFeatures.length) lines.push('New: ' + result.newFeatures.map(f => f.name).join(', '));
      showToast(lines.join(' '));
      rerender();

      const cls = CharacterModel.findClass(character.class.id);
      if (result.subclassRequired) promptSubclassChoice(cls);
      else if (result.asiRequired) promptAsiChoice(character.class.level);
    }

    function promptSubclassChoice(cls) {
      const wrapper = el('div', { class: 'modal-card' }, [
        el('h3', {}, `Choose your ${cls.subclassFeatureName}`),
        el('div', { class: 'option-grid' }, cls.subclasses.map(sub => el('div', {
          class: 'option-card',
          onclick: () => {
            CharacterModel.setSubclass(character, sub.id);
            persist();
            closeModal();
            showToast(`You have chosen ${sub.name}!`);
            rerender();
          }
        }, [
          el('div', { class: 'option-card__title' }, sub.name),
          el('div', { class: 'option-card__desc' }, sub.description)
        ])))
      ]);
      openModal(wrapper);
    }

    function promptAsiChoice(level) {
      let mode = 'single'; // 'single' = +2 one ability, 'double' = +1 to two abilities
      let picked = [];

      function draw() {
        const capAt = 20;
        const body = el('div', { class: 'modal-card' }, []);
        body.appendChild(el('h3', {}, `Ability Score Improvement (Level ${level})`));
        body.appendChild(el('p', {}, 'Increase one ability by 2, or two abilities by 1 each (max effective score 20).'));

        const tabs = el('div', { class: 'method-tabs' }, [
          el('button', { class: 'method-tab' + (mode === 'single' ? ' method-tab--active' : ''), onclick: () => { mode = 'single'; picked = []; draw(); } }, '+2 to one ability'),
          el('button', { class: 'method-tab' + (mode === 'double' ? ' method-tab--active' : ''), onclick: () => { mode = 'double'; picked = []; draw(); } }, '+1 to two abilities')
        ]);
        body.appendChild(tabs);

        const grid = el('div', { class: 'checkbox-grid' });
        RULES.abilityNames.forEach(a => {
          const current = CharacterModel.getAbilityScore(character, a);
          const amount = mode === 'single' ? 2 : 1;
          const wouldExceed = current + amount > capAt;
          const checked = picked.includes(a);
          const maxPicked = mode === 'single' ? 1 : 2;
          const disabled = wouldExceed || (!checked && picked.length >= maxPicked);
          grid.appendChild(el('label', { class: 'checkbox-row' + (disabled ? ' checkbox-row--disabled' : '') }, [
            el('input', {
              type: 'checkbox', checked, disabled,
              onchange: (e) => {
                if (e.target.checked) picked.push(a); else picked = picked.filter(x => x !== a);
                draw();
              }
            }),
            `${RULES.abilityLabels[a]} (${current} → ${current + amount})`
          ]));
        });
        body.appendChild(grid);

        const needed = mode === 'single' ? 1 : 2;
        body.appendChild(el('div', { class: 'modal-card__actions' }, [
          el('button', {
            class: 'btn btn--primary', disabled: picked.length !== needed,
            onclick: () => {
              const amount = mode === 'single' ? 2 : 1;
              CharacterModel.applyAsi(character, level, picked.map(a => ({ ability: a, amount })));
              persist();
              closeModal();
              showToast('Ability scores improved!');
              rerender();
            }
          }, 'Confirm')
        ]));

        openModal(body);
      }
      draw();
    }

    build();
  }

  return { render };
})();
