---
description: 'Task list for the party generator'
---

# Tasks: Party Generator

**Input**: Design documents from `specs/004-party-generator/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/party.md](./contracts/party.md)

**Tests**: Included (constitution III). Party content is checked by the content data test.

**Note**: spec 006 (saved character details) landed first: members open in `CharacterDetail` (read-only, actions as
props), and saved characters already have ids.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [x] T001 Add the ui keys of contracts/party.md in src/data/locales/en/ui.json and src/data/locales/fr/ui.json, plus `party.member.open` (Read {name}'s story / Lire l'histoire de {name}) and `party.story` (The company's story / L'histoire de la compagnie)
- [x] T002 [P] Create src/types/party.ts: `AlignmentMode = 'harmonious' | 'anything'`, `PartyConstraints` (optional `race`, `characterClass`, `gender`, `alignment`), `PartyMember { id; character; locked }`, `Party { id; members; constraints; alignmentMode; content: { nameId; meetingId; goalId }; text?: { name; story: string[]; language: Locale; source: 'ai' } }`

---

## Phase 2: Foundational (party content)

**⚠️ Blocks every user story**

- [x] T003 Create src/data/content/party.json (ids for ≥ 10 `name`, ≥ 10 `meeting`, ≥ 10 `goal` fragments) and their texts in src/data/locales/en/party.json and src/data/locales/fr/party.json (heroic fantasy tone; placeholders `{members}`, `{first}`, `{count}` only; the party is the grammatical subject — "the company" / "la compagnie", "le groupe" — so no word agrees with a member's gender; no `{{…|…|…}}` selection; French typography rules of spec 002) — content to be reviewed by the maintainer
- [x] T004 Register party texts in src/content/data.ts (`PARTY_FRAGMENTS`, `PARTY_TEXTS[locale]`) and extend src/data/content.test.ts: same ids and placeholders in every locale, only the allowed placeholders, no gender selection, French rules, ≥ 10 per category (SC-004)
- [x] T005 Implement `renderParty(party, locale)` in src/content/party.ts: `{members}` joined with commas and "and"/"et", `{first}` = first member's first name, `{count}` in words (two…six / deux…six); AI `text` shown as written with `writtenIn`/`writtenBy` like `renderCharacter`; tests in src/content/party.test.ts (both locales, 2 and 6 members, no placeholder left; ≥ 20 distinct stories in 100 draws per locale — SC-005)

---

## Phase 3: User Story 1 - Generate a party in one click (P1) 🎯 MVP

**Goal**: a balanced party of 2–6 with its story, on its own page.

**Independent Test**: without AI, every size 2–6 gives valid members, varied classes and a party text in the current language.

- [x] T006 [US1] Implement in src/content/party.ts: `MIN_PARTY_SIZE`, `MAX_PARTY_SIZE`, `DEFAULT_PARTY_SIZE`, the class plan (research R1: all different up to 4, every class before any repeat, locked members count), `allowedAlignments(mode, constraints, lockedMembers)` (research R2), unique first names (bounded redraw then any unused name of the list), `generateParty({ size, constraints, alignmentMode, keep })`, `checkParty(party)` returning rule violations
- [x] T007 [US1] Tests in src/content/party.test.ts: 1,000 parties per size and mode satisfy class variety, alignment mode, unique names and valid members (SC-002)
- [x] T008 [US1] Create src/contexts/PartyContext.tsx (current party, size, constraints, alignment mode, `generate`) and src/hooks/useParty.ts (throws "useParty must be used within a PartyProvider"); wrap the app in src/components/App.tsx; tests
- [x] T009 [P] [US1] Create src/components/party/partyStory/PartyStory.tsx (party name in Cinzel, story paragraphs with drop cap, `WrittenInNotice` for AI text); test and stories
- [x] T010 [P] [US1] Create src/components/party/partyMemberCard/PartyMemberCard.tsx (cropped portrait, compact `CharacterHeader`, alignment, first story paragraph, "Read the story" opening `CharacterDetail` in a dialog, slots for actions); test and stories
- [x] T011 [US1] Create src/components/party/partyControls/PartyControls.tsx (size select 2–6, Generate) and src/pages/party/Party.tsx (controls, story, member grid: 1/2/3 columns); `/party` route in src/routes.tsx and a menu entry in src/components/navigation/drawerMenu/DrawerMenu.tsx; page test

**Checkpoint**: a party can be generated and read, without AI.

---

## Phase 4: User Story 2 - Shape the party (P1)

**Goal**: shared constraints, alignment mode, locked members, single-member reroll.

**Independent Test**: race = Elf + one locked member, 20 regenerations: all elves, the locked member never changes.

- [x] T012 [US2] Add shared constraint selects (race, class, gender, alignment, each with "Any") and the alignment mode toggle (Harmonious / Anything goes) to PartyControls; store them in PartyContext
- [x] T013 [US2] Implement `rerollMember(party, memberId)` in src/content/party.ts (respects constraints, mode, class variety and the other names; keeps `content`, drops AI `text`) and lock/unlock in PartyContext; member card actions: padlock (`aria-pressed`, `party.member.lock`/`unlock`) and reroll
- [x] T014 [US2] Tests: 1,000 parties with constraints and locked members keep them (SC-003); a locked member that no longer matches a new constraint is kept and flagged with `party.notMatching`; reroll changes only one member

---

## Phase 5: User Story 3 - Keep the party (P2)

**Goal**: save a party as a group, or one member.

**Independent Test**: save a party and a member, reload, find them in My characters.

- [x] T015 [US3] Create src/content/storedParty.ts (`parseStoredParty`, `parseStoredParties`, zod, members reuse the stored-character schema, invalid entries dropped) with tests; persist the current party (`localStorage["party"]`) and saved parties (`localStorage["parties"]`) in PartyContext (FR-013)
- [x] T016 [US3] "Save the party" (copy with a new id; disabled once saved) and "Save this member" (through `DataContext.saveCharacter`) on the party page; tests
- [x] T017 [US3] Add tabs "Characters" / "Parties" to src/pages/characters/Characters.tsx and create src/components/party/savedParties/SavedParties.tsx (cards with the party name and members; open → becomes the current party and navigates to `/party`; delete with confirmation); tests and stories

---

## Phase 6: User Story 4 - AI party story (P3)

**Goal**: the AI writes the party name and story.

**Independent Test**: mocked provider → AI story, members unchanged; failing provider → app story and explanation.

- [x] T018 [US4] Add `partyStorySchema`, `partyStoryPrompt(party, locale)` (members' names, races, classes, alignments, epithets as fixed facts; language rules of spec 002) and `generatePartyStory(provider, party, locale, signal)` in src/ai/; tests (valid answer, invalid answer, failure, member facts never read from the answer)
- [x] T019 [US4] Use it on generate in PartyContext through the request/alert flow of `useCharacterRequest` (one notification, fallback message); tests

---

## Phase 7: Polish

- [ ] T020 [P] Update README.md (party section) and CLAUDE.md (party module, storage keys)
- [ ] T021 Run lint, typecheck, test:run, build and build-storybook; fix anything failing
- [ ] T022 Browser validation of quickstart.md (sizes, constraints, locks, reroll, save/open, French, dark mode, phone, axe) with screenshots; sample of party stories in both languages for the maintainer's review

---

## Dependencies & Execution Order

Setup → Foundational (T003 → T004 → T005) → US1 (T006 → T007; T008; T009 ∥ T010; T011) → US2 (T012 → T013 → T014) →
US3 (T015 → T016 → T017) → US4 (T018 → T019) → Polish. US3 and US4 only depend on US1.

## Implementation Strategy

MVP = Phases 1–3 (generate and read a party without AI), then US2, US3, US4, polish, PR, merge once CI is green.
