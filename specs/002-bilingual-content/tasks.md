---
description: 'Task list for the bilingual app and fragment-based content'
---

# Tasks: Bilingual App and Fragment-Based Content

**Input**: Design documents from `specs/002-bilingual-content/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/i18n-and-content.md](./contracts/i18n-and-content.md)

**Tests**: Included (constitution III). The content data test is the safety net for every content task.

**Organization**: by user story (spec.md). Content writing tasks are marked so they can be reviewed by the maintainer.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [x] T001 Create folders `src/i18n/`, `src/content/`, `src/data/content/names/`, `src/data/locales/en/`, `src/data/locales/fr/`; add `@Content/*` and `@I18n/*` aliases in tsconfig.json and vite.config.ts (keep both in sync)

---

## Phase 2: Foundational (blocking prerequisites)

**⚠️ No user story work can begin until this phase is complete**

- [x] T002 Implement `renderText(text, gender, names)` in src/content/renderText.ts: `{{m|f|n}}` selection (exactly 3 options), `{ m, f, n }` objects, placeholders `{firstName}`, `{lastName}`, `{fullName}`, `{epithet}`; throws on unknown placeholder in development; tests in src/content/renderText.test.ts for each gender and both syntaxes
- [x] T003 [P] Implement the i18n module in src/i18n/: `detectLocale(stored, browserLanguages)` ("fr*" → `fr`, else `en`; invalid stored value ignored), `LocaleProvider` (lazy init from `localStorage["locale"]`, saves on change, sets `document.documentElement.lang`), `useLocale()`, `useT()` with `{param}` interpolation and keys typed from src/data/locales/en/ui.json; tests in src/i18n/i18n.test.tsx
- [x] T004 [P] Extend `Character` in src/types/character.ts with `content?: { titleId; originId; trainingId; turningPointId; goalId; epithetId }` and `written?: { language: 'en' | 'fr'; source: 'ai' | 'legacy'; epithet: string; background: CharacterBackground }` ("Exactly one of `content` / `written` is present"); keep `background`/`epithet` only as legacy input
- [x] T005 Write zod schemas for stored characters in src/content/storedCharacter.ts: current shape (`content` xor `written`) and the legacy shape (`background` text, no `content`) converted to `written: { language: 'en', source: 'legacy' }`; invalid entries dropped; tests in src/content/storedCharacter.test.ts
- [x] T006 Use the stored-character schema when loading `characters` in src/contexts/DataContext.tsx and `characterHistory` in src/contexts/HistoryContext.tsx; compare characters by value-independent identity is out of scope (keep reference comparison); update their tests
- [x] T007 Write the content data test skeleton in src/data/content.test.ts: every id exists in every locale, every `{{…}}` has 3 options, only known placeholders, French texts contain no "iel"/"iels", no "·", no ".e" / "(e)" inclusive forms, UI keys and their `{param}` placeholders identical in `en/ui.json` and `fr/ui.json`
- [x] T008 Wrap the app in `LocaleProvider` in src/components/App.tsx and add a `LocaleDecorator` in test/decorators/LocaleDecorator.tsx; add it where stories/tests render components that will call `useT`

**Checkpoint**: app builds and behaves as before.

---

## Phase 3: User Story 1 — Using the app in French (Priority: P1) 🎯 MVP

**Goal**: every interface text in EN/FR, browser default, selector in the menu, remembered.

**Independent test**: quickstart scenario 1; SC-001 review of every page.

- [x] T009 [P] [US1] Write src/data/locales/en/ui.json with every interface text (navigation, page titles, buttons, labels, helper texts, empty states, settings, alerts, AI messages from src/ai/messages.ts, ConnectionTest, ApiKeyField, history, carousel aria labels)
- [x] T010 [P] [US1] Write src/data/locales/fr/ui.json with the same keys and placeholders (French UI copy reviewed for tone and typography: non-breaking spaces before « : ; ! ? »)
- [x] T011 [P] [US1] Write labels for races, classes, alignments and genders in src/data/locales/en/labels.json and src/data/locales/fr/labels.json as GenderedText (French: agreement for m/f, category name for n — research R3)
- [x] T012 [US1] Implement `label(kind, value, gender, locale)` in src/content/labels.ts with tests in src/content/labels.test.ts ("Naine Guerrière", "Loyale Bonne" for a female dwarf warrior)
- [x] T013 [US1] Replace hard-coded texts with `useT()` in src/components/navigation/drawerMenu/DrawerMenu.tsx, src/components/App.tsx (app bar), src/pages/home/Home.tsx, src/pages/characters/Characters.tsx, src/pages/settings/Settings.tsx, src/components/settings/**, src/components/history/**, src/components/character/** (property labels via `label()`), src/components/common/** (alerts, carousel, error boundary)
- [x] T014 [US1] Make src/ai/messages.ts return message keys + params instead of English sentences, rendered with `useT` in src/hooks/useCharacterRequest.ts and src/components/settings/connectionTest/ConnectionTest.tsx; update src/ai/messages.test.ts
- [x] T015 [US1] Add the language selector ("EN | FR" toggle, labelled for screen readers) at the bottom of src/components/navigation/drawerMenu/DrawerMenu.tsx and a "Language" field in src/pages/settings/Settings.tsx; tests in DrawerMenu.test.tsx and Settings.test.tsx; story in DrawerMenu.stories.tsx
- [x] T016 [US1] Update every test and story that checks English text to render inside `LocaleProvider` (default English) and add one French render test per page in src/pages/**/*.test.tsx

**Checkpoint**: the interface is fully bilingual; characters still use the old content.

---

## Phase 4: User Story 2 — Varied, coherent backgrounds (Priority: P1)

**Goal**: backgrounds from fragments, rendered in the current locale, same story in both languages.

**Independent test**: SC-002 distinctness test; quickstart scenarios 2–5.

- [x] T017 [US2] Declare fragment ids in src/data/content/fragments.json (category; `race` for origins, `characterClass` for trainings, `alignment` for turning points) — minimums "4 origins per race, 4 trainings per class, 3 turning points per alignment, 10 goals, 6 titles"
- [x] T018 [P] [US2] Write English fragment texts (content task, reuse the best passages of src/data/backgrounds.json) in src/data/locales/en/{titles,origins,trainings,turningPoints,goals}.json with `{{He|She|They}}`-style selections
- [x] T019 [P] [US2] Write French fragment texts (content task) in src/data/locales/fr/{titles,origins,trainings,turningPoints,goals}.json with agreement for m/f and neutral phrasing for n
- [x] T020 [US2] Extend src/data/content.test.ts with the FR-009 minimum counts per race, class and alignment and a check that every fragment renders for every gender in every locale without leftover `{` or `}`
- [x] T021 [US2] Implement `pickFragments(character)` and `renderCharacter(character, locale)` in src/content/character.ts (title + origin + training + turning point + goal; `writtenIn`/`writtenBy` for `written` characters); tests in src/content/character.test.ts including SC-002 (≥ 60 distinct backgrounds in 100 draws for a fixed combination, per locale)
- [x] T022 [US2] Move generation from src/utils/character.ts to src/content/generate.ts: `generateRandomCharacter` returns `content` references; `rerollWithApp` changes only the dependent reference (race → `originId`, class → `trainingId`, alignment → `turningPointId`) and keeps names on race rerolls; delete src/utils/character.ts and src/data/backgrounds.json; update imports in src/ai/generate.ts and its tests
- [x] T023 [US2] Render characters through `renderCharacter` in src/components/character/characterBackground/CharacterBackground.tsx, Character.tsx, CharacterInformation.tsx, CharacterSummary.tsx and src/components/history/**; update their tests and stories (test/stubs/Character.stubs.ts gets `content` references)

**Checkpoint**: app-made characters re-render when switching language.

---

## Phase 5: User Story 3 — Names that fit the race and gender (Priority: P2)

**Goal**: per-race name lists, neutral first names, translated epithets with agreement.

**Independent test**: SC-004 test over 200 characters; quickstart scenario 6.

- [x] T024 [P] [US3] Write name lists (content task) in src/data/content/names/{human,elf,dwarf,orc}.json: `first.male`, `first.female`, `first.neutral` "≥ 40 unique names each", `last` "≥ 40 unique names"; each race with its own naming style; delete src/data/characterNames.json once unused
- [x] T025 [P] [US3] Write epithets (content task): ids in src/data/content/epithets.json (≥ 40), English in src/data/locales/en/epithets.json, French with masculine, feminine and neutral forms in src/data/locales/fr/epithets.json
- [x] T026 [US3] Extend src/data/content.test.ts with name list sizes, uniqueness, and epithet coverage in every locale
- [x] T027 [US3] Use race/gender name lists and epithet ids in src/content/generate.ts (non-binary → `first.neutral`; gender reroll keeps the first name only if it is in the new gender's list); tests for SC-004 in src/content/generate.test.ts

---

## Phase 6: User Story 4 — AI-written text in the user's language (Priority: P2)

**Goal**: AI writes in the current language; its text is labelled; "Translate with AI" on demand.

**Independent test**: quickstart scenario 8 with the fake server.

- [x] T028 [US4] Add a `locale` parameter to the prompts in src/ai/prompts.ts ("Write in French." / "Write in English.") and store AI results as `written: { language, source: 'ai' }` in src/ai/generate.ts; update src/ai/prompts.test.ts and src/ai/generate.test.ts
- [x] T029 [US4] Implement `translateWritten(provider, character, locale, signal)` in src/ai/generate.ts (epithet + background only, same validation and failure handling as spec 001) with tests
- [x] T030 [US4] Show the "Written by AI in {language}" label and a "Translate with AI" button (only when `writtenIn` differs from the locale and a provider is configured) in src/components/character/characterBackground/CharacterBackground.tsx, wired through src/hooks/useCharacterRequest.ts; tests and story

---

## Phase 7: User Story 5 — Saved and older characters keep working (Priority: P3)

**Goal**: legacy characters display, labelled as English; new app-made saved characters switch language.

**Independent test**: quickstart scenario 7; SC-006.

- [x] T031 [US5] Add an end-to-end test in src/pages/characters/Characters.test.tsx loading legacy `localStorage.characters` (previous version's shape) and a new app-made character: both display, the legacy one labelled "Written in English", the new one in the current locale
- [x] T032 [US5] Show the "written in" label for legacy text in src/components/character/characterSummary/CharacterSummary.tsx and the home card

---

## Phase 8: Polish & cross-cutting concerns

- [x] T033 [P] Update README.md (languages, content structure, how to add a language or a race) and CLAUDE.md (src/i18n, src/content, src/data layout; remove "Direction" items now done)
- [x] T034 [P] Check phone layouts with long French labels (no horizontal scroll) and fix wrapping where needed
- [x] T035 Run lint, typecheck, tests, build and Storybook build; fix anything failing
- [x] T036 Browser validation of the quickstart scenarios with screenshots, and a sample of generated backgrounds (each gender, both languages) for the maintainer's French review

---

## Dependencies & execution order

- Setup (T001) → Foundational (T002–T008) → stories.
- US1 (T009–T016) and US2 (T017–T023) can proceed in parallel after the foundation, except T013/T023 which touch the same components (do T013 first).
- US3 (T024–T027) after T022 (generation module).
- US4 (T028–T030) after US2 (needs `content`/`written` rendering).
- US5 (T031–T032) after T005/T006 and US2.
- Polish last.

## Parallel opportunities

- Foundation: T003 and T004 with T002.
- Content writing: T018, T019, T024, T025 are independent files.
- US1: T009, T010, T011 together.

## Implementation strategy

1. **Foundation + US1**: bilingual interface (characters still on old content) — releasable on its own.
2. **+ US2 + US3**: new content and names — the main value of the feature; French review by the maintainer before merging.
3. **+ US4 + US5**: AI language and legacy labels.
4. **Polish**, one PR.

Commit after each task group; keep lint, typecheck and tests green at every commit.
