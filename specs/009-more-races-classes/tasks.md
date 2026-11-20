---
description: 'Task list for more races and classes'
---

# Tasks: More Races and Classes

**Input**: Design documents from `specs/009-more-races-classes/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/races-classes.md](./contracts/races-classes.md)

**Tests**: Included (constitution III).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [ ] T001 Create src/content/slug.ts (`slug(value)`, research R2) with tests; use it in `portraitFor` (src/components/character/characterImage/CharacterImage.tsx) and wherever fragment ids or name files are derived from race names
- [ ] T002 Append the 5 races and 5 classes to `CharacterRaces` / `CharacterClasses` in src/types/character.ts (at the end); test that existing indexes are unchanged and an old share link decodes to the same race and class (SC-005)

---

## Phase 2: Foundational (data for every new value)

**⚠️ Blocks the user stories**

- [ ] T003 [P] Lifespans in `MAX_AGE` (src/content/template.ts) per research R3
- [ ] T004 [P] Name lists src/data/content/names/{halfling,gnome,half-elf,dark-elf,ashborn}.json (≥ 40 per list, unique across all lists) and their registration in src/content/data.ts
- [ ] T005 [P] Labels in src/data/locales/{en,fr}/labels.json (FR: Halfelin/Halfeline, Gnome, Demi-elfe, Elfe noir/Elfe noire, Cendré/Cendrée; Rôdeur/Rôdeuse, Paladin/Paladine, Barde, Druide, Barbare)
- [ ] T006 Origin fragments (≥ 4 per new race) and training fragments (≥ 4 per new class) in src/data/content/fragments.json with texts in src/data/locales/{en,fr}/{origins,trainings}.json (gendered selections, French rules) — content to be reviewed by the maintainer
- [ ] T007 [P] Colours in src/themes/palette.ts (light and dark, contrast test green — SC-003) and icons in src/components/common/icons/{race,class}/
- [ ] T008 [P] Balance points (`CLASS_POINTS` in src/content/partyDepth.ts) and role weights (src/data/content/partyDepth.json) for the new classes

**Checkpoint**: content tests (which iterate the enums) pass for every new value.

---

## Phase 3: User Story 1 - New races and classes everywhere (P1) 🎯 MVP

- [ ] T009 [US1] Tests: 2,000 characters, each race and class ≥ 5% (SC-001); new combinations render 4 paragraphs in both languages for every gender (SC-002); party rules hold with 9 classes (class variety, roles ≥ 3 per class)
- [ ] T010 [US1] Check every UI list driven by the enums (constraint selects, dice, locks, labels, badges) shows the new values; fix fixed-size assumptions; component tests where lists are counted

---

## Phase 4: User Story 2 - A portrait for every character (P1)

- [ ] T011 [US2] Create src/components/character/raceEmblem/RaceEmblem.tsx (research R4: SVG crest per race, class colour frame, accessible label); test and stories (every race × a few classes, light/dark)
- [ ] T012 [US2] `CharacterImage` shows `RaceEmblem` when the image file does not exist (instead of default-portrait.png); tests (missing file → emblem, existing file → image — SC-004)
- [ ] T013 [US2] scripts/missing-portraits.mjs writing docs/portraits.md (missing paths, 512×768 PNG, style notes from existing portraits); run it and commit the guide

---

## Phase 5: Polish

- [ ] T014 [P] Update README.md (races and classes list, how to add portraits) and CLAUDE.md (slugs, emblem fallback)
- [ ] T015 Run lint, typecheck, test:run, build and build-storybook; browser validation (quickstart.md) with screenshots; sample of new names, origins and trainings in both languages for the maintainer

---

## Dependencies & Execution Order

Setup (T001 → T002) → Foundational (T003–T008, T006 after T005) → US1 (T009, T010) → US2 (T011 → T012 → T013) → Polish.

## Implementation Strategy

Data first (it is most of the work), then tests over the whole matrix, then the emblem fallback, polish, PR.
