---
description: 'Task list for the NPC mode (side characters)'
---

# Tasks: NPC Mode (Side Characters)

**Input**: Design documents from `specs/010-npc-mode/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/npc.md](./contracts/npc.md)

**Tests**: Included (constitution III: every component has a test and a story).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [x] T001 Create src/types/npc.ts: `Occupations` as const (Blacksmith, Innkeeper, Farmer, Beggar, Priest, Merchant, Guard, Fisher, Healer, Scribe, Hunter, Miller, Baker, Tailor, Stablehand, Minstrel, Sailor, Noble, Alchemist, Gravedigger — append-only), `Occupation`, `NPC_SECTIONS` (`look | daily | quirk | rumour | secret | opinion`), `Npc`, `NpcText` (`language`, `source: 'ai'`, six strings), `NpcTemplate`, `LOCKABLE_NPC_PROPERTIES` (`firstName`, `lastName`, `race`, `gender`, `age`, `occupation`)
- [x] T002 [P] UI strings in src/data/locales/{en,fr}/ui.json: `nav.npcs` ("Side characters" / "Personnages secondaires"), page subtitle ("Ready-to-play NPCs for the game master" / "PNJ prêts à jouer pour le MJ"), section titles, Generate 5, Open, Keep, tab label, empty states, AI notices

---

## Phase 2: Foundational (content and generation)

**⚠️ Blocks every user story**

- [x] T003 src/data/content/npc.json: occupations `{ id, minAge, icon }` (min ages: alchemist, priest, healer, scribe 20; noble, beggar, stablehand 15; others 16) and fragment ids `{ id, section, occupation? }`: `daily` ≥ 3 per occupation (`daily-<occupation-slug>-<name>`), `look`, `quirk`, `rumour`, `secret`, `opinion` ≥ 20 each
- [x] T004 Texts in src/data/locales/{en,fr}/npc.json for every fragment (gender selections, `{firstName}`/`{fullName}` placeholders, French rules: neutral phrasing for non-binary, U+202F before `: ; ! ?`, no elision before a name) and gendered labels `occupation.<Value>` in src/data/locales/{en,fr}/labels.json; register them in src/content/data.ts and src/content/labels.ts (`LabelKind` += `occupation`)
- [x] T005 Extend src/data/content.test.ts: every NPC fragment has text in both languages, counts per occupation and section, every text renders for every gender, French rules
- [x] T006 src/content/npc.ts: `generateNpc(template)`, `generateNpcs(count, template)` (distinct first names), `rerollNpc(npc, target, locked)` (same object when nothing else fits; race → names/age follow; occupation → daily fragment and age ≥ minAge; drops AI text), `renderNpc(npc, locale)`; age in `[max(15, minAge), MAX_AGE[race] × 0.9]`; tests in src/content/npc.test.ts (1,000 NPCs: every occupation appears, sections render in both languages for every gender — SC-002/003; rerolls change only their target; locks respected)
- [x] T007 [P] src/components/npc/occupationIcon/ (icon per occupation, colour from theme) with test and story
- [x] T008 [P] `RaceEmblem` optional `occupation` prop (neutral frame, occupation badge) in src/components/character/raceEmblem/ with test and story

**Checkpoint**: content and generation tested without UI.

---

## Phase 3: User Story 1 - Generate an NPC on the spot (P1) 🎯 MVP

- [x] T009 [US1] src/content/storedNpc.ts: zod schemas and `loadNpcState` / `parseStoredNpcs` for `localStorage["npc"]` (`{ version: 1, current?, batch: Npc[] ≤ 5, locked: string[] }`) and `["npcs"]` (`{ version: 1, npcs: Npc[] }`), unknown fragment ids replaced by one of the same section; tests
- [x] T010 [US1] src/contexts/NpcContext.tsx (`NpcProvider`: current NPC, batch, locks, saved NPCs; lazy load, save in effects) + src/hooks/useNpcs.ts (throws without provider); add the provider in src/components/App.tsx; tests
- [x] T011 [US1] src/components/npc/npcSheet/NpcSheet.tsx: emblem, name, badges (race, occupation, gender · age), six titled sections in the interface language; read-only when no actions are given; test and story
- [x] T012 [US1] src/components/npc/npcControls/NpcControls.tsx: occupation, race and gender selects (with "Any"), Generate; test and story
- [x] T013 [US1] src/pages/npcs/Npcs.tsx (route `/npcs` in src/routes.tsx, menu entry in src/components/navigation/drawerMenu/DrawerMenu.tsx); page test: generate, constraints respected, language switch keeps the NPC

---

## Phase 4: User Story 1b - Populate a place (P2)

- [x] T014 [US1b] src/components/npc/npcCard/NpcCard.tsx (name, race, occupation, quirk; Open and Save actions); test and story
- [x] T015 [US1b] "Generate 5" in NpcControls and the batch grid on the Npcs page: 5 distinct first names, Open makes a card the current NPC; tests

---

## Phase 5: User Story 2 - Adjust an NPC (P2)

- [x] T016 [US2] Dice per property and per section and padlocks per property in NpcSheet, wired to `rerollNpc` and the context locks; "nothing else fits" notice as for characters; tests (only the target changes, locked values kept by Generate)

---

## Phase 6: User Story 3 - Keep and share NPCs (P2)

- [x] T017 [US3] Save / delete in NpcContext; src/components/npc/savedNpcs/SavedNpcs.tsx grid; "Side characters" tab in src/pages/characters/Characters.tsx; tests
- [x] T018 [US3] src/pages/npcDetails/NpcDetails.tsx (`/npcs/:id`): sheet, delete, share; not-found state; tests
- [x] T019 [US3] Share: `encodeNpc` / `decodeNpc`, prefix `n1.`, `parseShareHash` kind `npc` in src/content/share.ts (research R7; character and party links unchanged); round trip of 1,000 NPCs and invalid links in src/content/share.test.ts; NPC view with save in src/pages/share/Share.tsx; share button through src/hooks/useShare.ts

---

## Phase 7: User Story 4 - Written by AI (P3)

- [x] T020 [US4] src/ai/npc.ts: `npcSheetSchema` (`firstName`, `lastName`, six sections, each 1–600 chars), prompt with fixed facts (race notes from spec 009, occupation, gender, age) and language rules, `generateNpcSheet` with fallback; tests with a fake provider (success, invalid answer, failure)
- [x] T021 [US4] src/hooks/useNpcGenerator.ts: generate with AI when configured (loading state, usual outcome messages), batch stays app-generated; "Written by AI in …" label in NpcSheet; tests

---

## Phase 8: Polish

- [x] T022 [P] README.md (Side characters section, adding occupations and NPC texts) and CLAUDE.md (NPC model, storage keys, `n1.` links)
- [x] T023 Run lint, typecheck, test:run, build and build-storybook; browser validation per quickstart.md (light/dark, FR/EN, phone, axe); send the maintainer a sample of NPC texts in both languages

---

## Dependencies & Execution Order

Setup (T001–T002) → Foundational (T003–T008; T004 after T003, T005/T006 after T004) → US1 (T009 → T010 → T011–T013)
→ US1b (T014–T015) and US2 (T016) → US3 (T017–T019) → US4 (T020–T021) → Polish.

## Parallel Opportunities

- T002 with T001; T007 and T008 with T003–T006.
- T014 (card) and T016 (dice) once US1 is in; T019 (share encoding) and T020 (AI) only touch their own modules.

## Implementation Strategy

MVP = Phases 1–3 (one NPC, constraints, both languages). Then batch and adjustments, saving and sharing, AI, polish.
Content writing (T003–T004, ~160 texts per language) is the largest task and drives quality: write it first.
