---
description: 'Task list for saved character details'
---

# Tasks: Saved Character Details

**Input**: Design documents from `specs/006-character-details/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/details.md](./contracts/details.md)

**Tests**: Included (constitution III).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [x] T001 Add ui keys in src/data/locales/en/ui.json and src/data/locales/fr/ui.json: `details.back`, `details.openInGenerator`, `details.delete`, `details.confirmDelete`, `details.deleted`, `details.notFound`, `details.notFoundHint`, `details.open` (texts in contracts/details.md)

---

## Phase 2: Foundational (identifiers)

**⚠️ Blocks every user story**

- [x] T002 Add `id?: string` to `Character` in src/types/character.ts and to the stored-character schema in src/content/storedCharacter.ts ("set on saved characters only; unique among saved characters; 1–100 chars"); add `withIds(characters)` giving a new `crypto.randomUUID()` to entries without an id or with a duplicate; tests in src/content/storedCharacter.test.ts
- [x] T003 Rework src/contexts/DataContext.tsx: load with `withIds` (saved back by the existing effect), `saveCharacter` stores `{ ...character, id }` and returns it, `removeCharacter(id)`, `updateCharacter(character)` (replace by id), `findCharacter(id)`; tests in src/contexts/DataContext.test.tsx (migration, two identical-looking characters deleted one at a time — SC-004)
- [x] T004 Use ids on the home page (research R2): in src/components/character/character/Character.tsx set the current character to the saved copy after saving and compute `isSaved` by id; in src/hooks/useCharacterGenerator.ts drop `id` from characters produced by generate, reroll and translate; update src/components/character/characterSummary/CharacterSummary.tsx to delete by id; update affected tests (Character, CharacterSummary, useCharacterGenerator, Characters page)

**Checkpoint**: same behaviour as before, with ids.

---

## Phase 3: User Story 1 - Read a saved character (P1) 🎯 MVP

**Goal**: one click from My characters to the full character.

**Independent Test**: save a character, open it, check every property and paragraph, go back.

- [x] T005 [P] [US1] Create src/components/character/propertyList/PropertyList.tsx (read-only label/value grid: first name, last name, epithet, race, class, gender, age, alignment; 1 column on phones, 2 on tablets, 3 on desktop; labels per locale); test and stories
- [x] T006 [US1] Create src/components/character/characterDetail/CharacterDetail.tsx (portrait via `CharacterImage`, `CharacterHeader` with heading level `h1`, `PropertyList`, story title + every paragraph with the drop cap of `storyParagraphSx`, `WrittenInNotice`; actions shown only when their handler is given: Back, Open in the generator, Delete with confirmation, Translate); test (all fields, actions present/absent) and stories (app content, AI text in the other language, legacy without story)
- [x] T007 [US1] Create src/pages/characterDetails/CharacterDetails.tsx and the `/characters/:id` route in src/routes.tsx: find the character by id in `DataContext`, render `CharacterDetail` with Back; page test with a MemoryRouter
- [x] T008 [US1] Make each card of src/pages/characters/Characters.tsx open its detail page (the card links to `/characters/<id>`, accessible name `details.open`), keeping the delete button working without opening the card; give src/components/common/carousel/Carousel.tsx optional `page`/`onPageChange` props and keep the page in the router location state so Back returns to it (research R4); tests

---

## Phase 4: User Story 2 - A link to each saved character (P2)

**Goal**: reload-proof address, clear not-found state.

**Independent Test**: reload a detail page; open an unknown id.

- [x] T009 [US2] Not-found state in src/pages/characterDetails/CharacterDetails.tsx (`details.notFound`, `details.notFoundHint`, link to My characters); tests for reload (provider re-created from localStorage) and unknown id; legacy entry without id opens after load (SC-002)

---

## Phase 5: User Story 3 - Act on a saved character (P2)

**Goal**: open in the generator, delete, translate.

**Independent Test**: open in the generator, delete another one.

- [x] T010 [US3] "Open in the generator" in src/pages/characterDetails/CharacterDetails.tsx: previous current character added to the history if not already there, current character set to the saved one, navigate to `/`; test (Save disabled on home, previous character in history)
- [x] T011 [US3] Delete from the detail page (confirmation, `details.deleted` alert, back to the list) and Translate with AI for AI text in another language: `translateCharacter` in src/hooks/useCharacterRequest.ts accepts `{ character, onTranslated }` (research R5) and the page passes `updateCharacter`; tests

---

## Phase 6: Polish

- [x] T012 [P] Update CLAUDE.md (ids on saved characters, remove the "compared by reference" known issue for saved characters, detail page) and README.md (My characters section)
- [x] T013 Run lint, typecheck, test:run, build and build-storybook; browser validation of quickstart.md (axe, 360 px, both languages and modes) with screenshots

---

## Dependencies & Execution Order

Setup → Foundational (T002 → T003 → T004) → US1 (T005 ∥ T006 → T007 → T008) → US2 (T009) → US3 (T010, T011) → Polish.

## Implementation Strategy

MVP = Phases 1–3; then US2 and US3; then polish, PR, merge once CI is green.
