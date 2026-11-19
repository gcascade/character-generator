---
description: 'Task list for the visual refresh'
---

# Tasks: Visual Refresh

**Input**: Design documents from `specs/005-visual-refresh/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/ui.md](./contracts/ui.md), [mockups/](./mockups/)

**Tests**: Included (constitution III). Existing behaviour tests must keep passing without behaviour changes (FR-010).

**Organization**: by user story (spec.md).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [x] T001 Install `@fontsource/cinzel`, `@fontsource/alegreya`, `@fontsource/alegreya-sans`; import only the latin subsets and weights used (Cinzel 400/700, Alegreya 400/700/400-italic, Alegreya Sans 400/500/700) in src/index.tsx (research R1)
- [x] T002 [P] Add ui keys in src/data/locales/en/ui.json and src/data/locales/fr/ui.json: `story.read` (Read the story / Lire l'histoire), `story.close` (Close / Fermer), `colorMode.label` (Theme / Thème), `colorMode.light` (Light / Clair), `colorMode.dark` (Dark / Sombre), `colorMode.system` (System / Système)

---

## Phase 2: Foundational

**⚠️ Blocks every user story**

- [x] T003 Create src/themes/contrast.ts (`contrastRatio(foreground, background)`, WCAG 2.x relative luminance) with tests in src/themes/contrast.test.ts (black/white = 21, same colour = 1)
- [x] T004 Create src/themes/palette.ts: light (parchment) and dark (candle-lit) tokens from the mock-ups (`background.default`, `background.paper`, `text.primary/secondary`, `primary`, `secondary`, `divider`, `menu`, `onMenu`) and `raceColor(race, mode)` / `classColor(characterClass, mode)` returning `{ main, contrastText }`; test in src/themes/palette.test.ts: every text/background pair ≥ 4.5:1 and every badge `contrastText` on `main` ≥ 4.5:1, in both modes (research R5, R7)
- [x] T005 Rewrite src/themes/themes.ts: MUI theme with `cssVariables: { colorSchemeSelector: 'class' }`, `colorSchemes: { light, dark }` from palette.ts, typography (h1–h4 Cinzel, body Alegreya Sans, a `story` typography variant in Alegreya with its TypeScript module augmentation), shape, visible focus ring (`:focus-visible` outline in `secondary`), and component overrides for Card, Button, Chip, Dialog, Snackbar, Alert; keep `responsiveFontSizes`; reduced-motion: no transitions when `prefers-reduced-motion: reduce`
- [x] T006 Wire the theme in src/components/App.tsx (`ThemeProvider` with `defaultMode="system"`, `CssBaseline` with `enableColorScheme`) and in .storybook/preview.tsx; replace hard-coded colours (`#3f51b5` in App.tsx and src/components/navigation/drawerMenu/DrawerMenu.tsx, `#000000` in src/components/character/characterImage/CharacterImage.css) with theme values; parchment background on `body` via CssBaseline overrides

**Checkpoint**: the whole app uses the fantasy palette and fonts; all existing tests pass.

---

## Phase 3: User Story 1 - The app looks like heroic fantasy (P1) 🎯 MVP

**Goal**: every page has the fantasy identity.

**Independent Test**: each page in both languages matches the mock-ups; no default blue; contrast test passes.

- [x] T007 [US1] Restyle src/components/common/pageTitle/PageTitle.tsx (Cinzel title in `primary` with the ✦ ornament divider from the mock-ups); update its story
- [x] T008 [US1] Restyle src/components/navigation/drawerMenu/DrawerMenu.tsx (menu colours from the theme, brand title "Générateur / de personnages" in Cinzel from ui keys `app.title`, active item with a gold left border) and the app bar in src/components/App.tsx; update DrawerMenu story and test if labels change
- [x] T009 [P] [US1] Restyle the history panel (src/components/history/historyList, historyCard, historyItem, historyCharacterSummary) with race and class colour dots from `raceColor` / `classColor`; keep tests passing
- [x] T010 [P] [US1] Restyle src/pages/characters/Characters.tsx and src/components/character/characterSummary/CharacterSummary.tsx (badges for race and class), and src/pages/settings/Settings.tsx (cards and fields follow the theme)

---

## Phase 4: User Story 2 - A character card that reads at a glance (P1)

**Goal**: heading, badges, compact grid, phone portrait.

**Independent Test**: card on desktop and phone; name, epithet, race, class at a glance; every die and padlock still usable by mouse, touch and keyboard.

- [x] T011 [US2] Create src/components/character/characterHeader/CharacterHeader.tsx: `h2` "First Last", epithet (capitalised, rendered for the locale) in italic Alegreya below, `Chip` badges for race and class (`raceColor`/`classColor`, labels from `label()`) and an outlined chip "gender · age"; test (heading level, badge texts in EN and FR) and stories (each race/class, light and dark)
- [x] T012 [US2] Turn src/components/character/characterInformation/CharacterInformation.tsx into a 2-column grid (1 column below `sm`) and src/components/character/characterProperty/CharacterProperty.tsx into a grid cell (small uppercase label, value below); actions visible on `:hover` and `:focus-within`, always when locked, always under `@media (hover: none)` (research R3); keep "Unlock all"; existing tests keep passing
- [x] T013 [US2] Rework the card layout in src/components/character/character/Character.tsx: portrait left on desktop (bordered in gold), small portrait (height ~180 px, cropped to the face) at the top on phone via src/components/character/characterImage/CharacterImage.tsx; `CharacterHeader` replaces the old subtitle; Generate (contained, primary) and Save (outlined) buttons styled as in the mock-ups; update Character test and stories

---

## Phase 5: User Story 3 - The background reads like a story (P2)

**Goal**: drop cap and reading view.

**Independent Test**: long backgrounds never cut mid-word; the full story opens in one action and closes with Escape.

- [x] T014 [US3] Create src/components/character/storyDialog/StoryDialog.tsx (`Dialog`, `fullScreen` below `sm`, title in Cinzel, subtitle "class race · alignment", paragraphs in the `story` variant, first paragraph with a drop cap, close `IconButton` labelled `story.close` placed so it never overlaps the title, Escape closes, focus returns to the opener); test and stories
- [x] T015 [US3] Rework src/components/character/characterBackground/CharacterBackground.tsx: title, first paragraph in full with a drop cap (`::first-letter`, only when a paragraph exists), "Read the story" button (`story.read`) opening `StoryDialog`; remove the character-count truncation and "Read more…"; keep `WrittenInNotice`; update its test (no mid-word cut, dialog opens and closes) and stories

---

## Phase 6: User Story 4 - One calm notification (P2)

**Goal**: one notification at a time.

**Independent Test**: five quick generations show at most one notification.

- [x] T016 [US4] In src/contexts/AlertManagerContext.tsx make `addAlert` replace the current alert; in src/components/common/alert/AlertManager.tsx render it in one `Snackbar` (bottom right on desktop, full width at the bottom on phone), auto-hide after 5 s for success and info, no auto-hide for warning and error, `Alert` with role `status` (success/info) or `alert` (warning/error); update tests (a second alert replaces the first) and stories

---

## Phase 7: User Story 5 - Dark mode (P3)

**Goal**: light / dark / system, remembered.

**Independent Test**: switch the toggle and the system mode; every page readable; choice kept after reload.

- [x] T017 [US5] Create src/components/common/colorModeToggle/ColorModeToggle.tsx with `useColorScheme()`: `variant="compact"` (icon toggle group ☀ / ◐ / ☾ with translated labels) and `variant="select"` (labelled select); test (switching sets the mode) and stories
- [x] T018 [US5] Place the compact toggle next to the language selector at the bottom of src/components/navigation/drawerMenu/DrawerMenu.tsx and the select in src/pages/settings/Settings.tsx; update their tests

---

## Phase 8: Polish & Cross-Cutting

- [ ] T019 [P] Check long French labels and epithets in badges and the grid (wrap, no overflow) and 360 px width on every page in both modes
- [ ] T020 [P] Update README.md (screenshot, theme section) and CLAUDE.md (themes folder, colours only through the theme, fonts self-hosted)
- [ ] T021 Run lint, typecheck, test:run, build and build-storybook; fix anything failing
- [ ] T022 Browser validation (quickstart.md): screenshots light/dark/phone compared with the mock-ups, axe-core on home, my characters and settings in both modes, keyboard path through the card, notification count, card height before/after (SC-003)

---

## Dependencies & Execution Order

- Setup (T001–T002) → Foundational (T003–T006) → US1 (T007–T010) → US2 (T011–T013) → US3 (T014–T015) → US4 (T016) → US5 (T017–T018) → Polish.
- US3, US4 and US5 only depend on the foundational phase and can be done in any order after it.
- Within US2: T011 before T013; T012 independent of T011.

## Parallel Opportunities

- T002 alongside T001; T009 and T010 together; T014 alongside T016 or T017; T019 and T020.

## Implementation Strategy

1. MVP: Phases 1–3 (theme everywhere).
2. US2 (card), then US3 and US4, then US5.
3. Polish, browser validation against the mock-ups, PR, merge once CI is green.
