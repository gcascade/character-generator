# Research: More Races and Classes

## R1. Enum order

- **Decision**: append new values at the end of `CharacterRaces` and `CharacterClasses`.
- **Rationale**: share links store indexes (spec 007); old links keep their meaning (SC-005).

## R2. Slugs

- **Decision**: `slug(value) = value.toLowerCase().replace(/[^a-z]+/g, '-')` for fragment ids (`origin-dark-elf-*`),
  name files (`dark-elf.json`) and image folders (`images/dark-elf/ranger/female1.png`). Existing folders are already
  slugs (`human`, `elf`…).

## R3. Lifespans and balance

- **Decision**: lifespans halfling 150, gnome 400, half-elf 180, dark elf 500, Ashborn 120. Balance points: Ranger
  stealth 1 + fighting 1; Paladin fighting 1 + healing 1; Bard talking 2; Druid healing 1 + magic 1; Barbarian
  fighting 2. Role weights follow (bard → face/chronicler, ranger → scout, paladin → guardian/leader, druid →
  healer/scholar, barbarian → muscle).

## R4. Neutral portrait

- **Decision**: `RaceEmblem({ race, characterClass })`: an inline SVG crest (shield shape) with a simple glyph per race
  (leaf, anvil, crescent…) in the race colour, framed by the class colour, with an accessible label "Emblem of the
  <race> <class>". `CharacterImage` shows it when no file exists for the combination (instead of the generic default
  portrait), for every race.
- **Rationale**: SC-004; no external assets; consistent with the theme in both modes.

## R5. Content writing

- **Decision**: 4 origins per new race and 4 trainings per new class, written in the existing tone with
  `{{m|f|n}}` selections in French; names: original, culture-flavoured lists (halfling homely, gnome tinkering,
  half-elf mixed, dark elf sharp, Ashborn ember/ash themed), unique across all lists (existing test).
