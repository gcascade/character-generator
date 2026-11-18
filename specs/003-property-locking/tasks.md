---
description: 'Task list for property locking'
---

# Tasks: Property Locking

**Input**: Design documents from `specs/003-property-locking/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/locking.md](./contracts/locking.md)

**Tests**: Included (constitution III: everything tested).

**Organization**: by user story (spec.md).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [x] T001 Add ui keys in src/data/locales/en/ui.json and src/data/locales/fr/ui.json: `lock.<property>` and `unlock.<property>` for firstName, lastName, epithet, race, characterClass, gender, age, alignment ("Lock race" / "Verrouiller la race", "Unlock race" / "Déverrouiller la race"), `lock.unlockAll` ("Unlock all" / "Tout déverrouiller"), `reroll.nothingElseFits` ("No other value fits the locked properties." / "Aucune autre valeur ne convient aux propriétés verrouillées.")

---

## Phase 2: Foundational

**⚠️ Blocks every user story**

- [x] T002 Create src/content/template.ts: `LockableProperty` (`'firstName' | 'lastName' | 'epithet' | 'race' | 'characterClass' | 'gender' | 'age' | 'alignment'`), `LOCKABLE_PROPERTIES`, `CharacterTemplate` (data-model.md: epithet is `{ id: string }` or `{ text: string; language: Locale; source: 'ai' | 'legacy' }`), `templateOf(character, locked)` (epithet as written text when the character has one, otherwise its `content.epithetId`, research R3); export `MAX_AGE`/`MIN_AGE` from here and import them in src/content/generate.ts
- [x] T003 Implement `compatibleRaceGenders(template)` in src/content/template.ts (research R2): pairs allowed by locked race, gender, age (`15 ≤ age ≤ MAX_AGE[race]`), first name (in `firstNamesFor(race, gender)`) and last name (in `NAMES[race].last`); a name constraint no pair satisfies is dropped; tests in src/content/template.test.ts (age 300 → only Elf/Dwarf; "Edith" → genders whose list has it; unknown name → all pairs; templateOf with id and written epithets)

---

## Phase 3: User Story 1 - Keep what I like, regenerate the rest (P1) 🎯 MVP

**Goal**: padlocks on the home card; Generate keeps locked values.

**Independent Test**: lock one property, generate 20 times without AI: the locked value never changes and each unlocked property changes at least once.

- [x] T004 [US1] Make `generateRandomCharacter(template: CharacterTemplate = {})` in src/content/generate.ts keep every template value exactly (epithet `{ id }` → `content.epithetId`; `{ text, language, source }` → `epithet`, `textLanguage`, `textSource`), draw race and gender among `compatibleRaceGenders(template)`, then age within the race, names from the race/gender lists, and new content fragments for the final race, class and alignment (clarification Q2)
- [x] T005 [P] [US1] Tests in src/content/generate.test.ts: for each single lockable property and for all locked, 1,000 draws keep the locked values (SC-001); with one property locked each unlocked property takes ≥ 2 values over 50 draws (SC-002); all locked → only content changes
- [x] T006 [US1] Create src/contexts/LockContext.tsx (`LockProvider({ initialLocked, children })`, state `locked: LockableProperty[]`, `toggle(p)`, `unlockAll()`, `isLocked(p)`) and src/hooks/useLocks.ts (throws "useLocks must be used within a LockProvider"); tests in src/contexts/LockContext.test.tsx
- [x] T007 [US1] Generate from the template in src/hooks/useCharacterRequest.ts and src/hooks/useCharacterGenerator.ts: `generateNewCharacter` passes `templateOf(character, locked)` down (app path: `generateRandomCharacter(template)`); update src/hooks/useCharacterRequest.test.tsx (locked race kept after generate)
- [x] T008 [US1] Add `locked?: boolean`, `onToggleLock?: VoidFunction`, `lockLabel?: string` to src/components/character/characterProperty/CharacterProperty.tsx: an `IconButton` before the die with `aria-pressed={locked}`, `aria-label={lockLabel}`, `Lock`/`LockOpen` icons (named imports from `@mui/icons-material`); test (click and keyboard toggle, aria-pressed) and stories (locked / unlocked)
- [x] T009 [US1] Wire locks in src/components/character/characterInformation/CharacterInformation.tsx (`useLocks`, label `lock.<p>` or `unlock.<p>`) and add an "Unlock all" button shown when at least one property is locked (FR-010); update its test and story (wrap in LockProvider via a decorator in test/decorators/)
- [x] T010 [US1] Wrap the app in `LockProvider` in src/components/App.tsx (inside LocaleProvider, around CharacterProvider); update src/components/App.test.tsx if needed

**Checkpoint**: locks work without AI, within a session.

---

## Phase 4: User Story 2 - Locks that keep the character coherent (P1)

**Goal**: dice respect the other locks; no inconsistent character.

**Independent Test**: lock age 300 then roll the race die, lock "Edith" then roll the gender die; every result is valid.

- [x] T011 [US2] Add `locked: LockableProperty[] = []` to `rerollWithApp(character, property, locked)` in src/content/generate.ts (research R5): the race die draws among races allowing a locked age (no age clamping when age is locked) and, with a locked first or last name, among races compatible with it; the gender die with a locked first name draws among genders whose list has it and keeps the name; returns the same object when no other value fits
- [x] T012 [P] [US2] Tests in src/content/generate.test.ts for T011: locked age 300 + race die → Elf or Dwarf, age unchanged; locked "Edith" + gender die → only fitting genders, or unchanged when none; unlocked behaviour unchanged
- [x] T013 [US2] Pass `locked` through `rerollProperty(provider, character, property, signal, locale, locked = [])` in src/ai/generate.ts, src/hooks/useCharacterGenerator.ts and src/hooks/useCharacterRequest.ts; when the result is the same object, skip the AI and show an info alert `reroll.nothingElseFits`; test in src/hooks/useCharacterRequest.test.tsx

**Checkpoint**: all P1 behaviour done without AI.

---

## Phase 5: User Story 3 - Locks with AI generation (P2)

**Goal**: the AI respects locked values.

**Independent Test**: mocked provider answering other names for locked fields; the locked values are kept.

- [x] T014 [US3] `generateCharacter(provider, signal, locale, template = {})` in src/ai/generate.ts (research R4): base from `generateRandomCharacter(template)`; ask only for unlocked name fields (`firstName`, `lastName`, `epithet`) plus `background`; validate only those; `completedFields` counts only unlocked fields
- [x] T015 [US3] In src/ai/prompts.ts, `newCharacterPrompt(character, locale, fixed: NameField[])` lists locked names and the rendered epithet with the fixed facts and asks only for the others; schema built from the requested fields; tests in src/ai/prompts.test.ts
- [x] T016 [US3] Tests in src/ai/generate.test.ts: locked first name and epithet kept when the AI answers other values (SC-005); AI failure with locks → app character respecting every lock (FR-008)

---

## Phase 6: User Story 4 - Locks remembered (P3)

**Goal**: locks and values survive a reload.

**Independent Test**: lock two properties, reload, check they are restored and respected.

- [x] T017 [US4] Create src/content/storedLocks.ts: zod parsing of `localStorage["locks"]` = `{ version: 1, template }`, field by field (data-model.md rules: known enum values; integer age with "15 ≤ age ≤ max lifespan of any race; within the race's lifespan when `race` is set"; names 1–40 characters; epithet `id` must exist in epithets), invalid fields dropped, never throws; tests in src/content/storedLocks.test.ts
- [x] T018 [US4] Persist in src/contexts/LockContext.tsx: save `{ version: 1, template: templateOf(character, locked) }` in an effect when locks or the character change (provider placed inside CharacterProvider, or reading it); in src/components/App.tsx load once: `initialTemplate = parseStoredLocks(...)`, `initialCharacter = generateRandomCharacter(initialTemplate)`, `initialLocked = keys of initialTemplate`
- [x] T019 [US4] End-to-end test in src/components/App.test.tsx: stored locks for race and first name → the first character has them and their padlocks are pressed; damaged storage → app works with no lock

---

## Phase 7: Polish & Cross-Cutting

- [x] T020 [P] Update README.md (locks section) and CLAUDE.md (src/content/template.ts, LockContext, `locks` storage key)
- [x] T021 [P] Check the phone layout with padlocks and long French labels (no horizontal scroll)
- [x] T022 Run lint, typecheck, test:run, build and build-storybook; fix anything failing
- [x] T023 Browser validation of quickstart.md scenarios with screenshots (EN and FR, phone and desktop)

---

## Dependencies & Execution Order

- Setup (T001) → Foundational (T002–T003) → US1 (T004–T010) → US2 (T011–T013) → US3 (T014–T016) → US4 (T017–T019) → Polish.
- US3 and US4 depend only on US1 (template generation and the lock context); they can run in either order.
- Within US1: T004 before T005 and T007; T006 before T007, T009, T010; T008 before T009.

## Parallel Opportunities

- T005 (tests) alongside T006/T008 once T004 is done.
- T012 alongside T013 once T011 is done.
- T020 and T021 in parallel during polish.

## Implementation Strategy

1. MVP: Phases 1–3 (locks within a session, without AI).
2. Add US2 (coherent dice), then US3 (AI) and US4 (persistence).
3. Polish, browser validation with screenshots, PR, merge once CI is green.
