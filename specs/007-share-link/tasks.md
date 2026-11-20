---
description: 'Task list for share links'
---

# Tasks: Share Link

**Input**: Design documents from `specs/007-share-link/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/share.md](./contracts/share.md)

**Tests**: Included (constitution III).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [x] T001 Add the `share.*` ui keys of contracts/share.md in src/data/locales/en/ui.json and src/data/locales/fr/ui.json (plus `share.invalidHint`, `share.toGenerator`, `share.partyCopied`)

---

## Phase 2: Foundational (link format)

**⚠️ Blocks every user story**

- [x] T002 Implement character encoding in src/content/share.ts (research R2, R3, data-model.md): positional payload, enum indexes, short refs resolved among fragments of the same kind (missing → random fragment of that kind), optional written text, base64url of UTF-8 JSON, zod validation of every field ("firstName string 1–40", "age integer 0–100000", indexes in range…), rebuilt character also parsed by `storedCharacterSchema`; `sameCharacter(a, b)`
- [x] T003 Tests in src/content/share.test.ts: round trip of 1,000 random characters (with and without AI text) (SC-002); app-made character link ≤ 300 characters (SC-003); removed fragment replaced by one of the same kind (FR-008); truncated, altered and random strings decode to `undefined` without throwing (SC-004)

---

## Phase 3: User Story 1 - Share a character (P1) 🎯 MVP

**Goal**: share from three places; open, save, open in the generator.

**Independent Test**: share, open in a fresh profile, compare, save.

- [x] T004 [US1] Create src/hooks/useShare.ts (research R5): Web Share API when `navigator.share` exists (cancel is not an error), else clipboard + alert `share.copied`, else fallback URL for the dialog; tests with mocked `navigator`
- [x] T005 [P] [US1] Create src/components/common/share/ShareButton.tsx and ShareDialog.tsx (read-only field, copy button, close); tests and stories
- [x] T006 [US1] Add optional `onSave` and `saved` to src/components/character/characterDetail/CharacterDetail.tsx (Save button, disabled "Already in my characters" when saved); update its test and stories
- [x] T007 [US1] Create src/pages/share/Share.tsx and the `/share` route in src/routes.tsx: character link → `CharacterDetail` titled `share.sharedCharacter` with Save (to `DataContext`, once — `sameCharacter`) and Open in the generator (previous character to the history); invalid → `share.invalid` with a link to the generator; page tests (fresh storage, French visitor, invalid link, nothing changed by opening)
- [x] T008 [US1] Share buttons on the home card (src/components/character/character/Character.tsx), the saved character page (src/pages/characterDetails/CharacterDetails.tsx, via a new optional `onShare` of `CharacterDetail`) and party member cards (src/components/party/partyMemberCard/PartyMemberCard.tsx, optional `onShare`); tests

**Checkpoint**: characters can be shared and opened.

---

## Phase 4: User Story 2 - Share a party (P2)

**Goal**: one link for the whole party.

**Independent Test**: share a party of 6, open, check, save.

- [x] T009 [US2] Party encoding in src/content/share.ts (party payload of data-model.md; members unlocked with fresh ids, fresh party id) and tests: round trip of 1,000 parties incl. AI story (SC-002), party of 6 link ≤ 1,500 characters (SC-003), damaged links (SC-004)
- [x] T010 [US2] Party links on src/pages/share/Share.tsx: `PartyStory` + `PartyMemberCard`s (member sheets, Save member), Save the party (once, by members' content) and Open on the Party page (`PartyContext`); tests
- [x] T011 [US2] "Share the party" on src/components/party/partyControls/PartyControls.tsx (or the Party page) and on saved party cards in src/components/party/savedParties/SavedParties.tsx; tests

---

## Phase 5: User Story 3 - Robust links (P3)

- [x] T012 [US3] Fuzz tests in src/content/share.test.ts over 1,000 random mutations of valid links (never throws, either `undefined` or a fully valid character/party) and a page test showing the invalid message for a tampered party link

---

## Phase 6: Polish

- [ ] T013 [P] Update README.md (sharing section, links are not private) and CLAUDE.md (share module, link format, append-only enums)
- [ ] T014 Run lint, typecheck, test:run, build and build-storybook; browser validation of quickstart.md with screenshots (axe, 360 px, both modes and languages)

---

## Dependencies & Execution Order

Setup → Foundational (T002 → T003) → US1 (T004 ∥ T005 ∥ T006 → T007 → T008) → US2 (T009 → T010 → T011) → US3 (T012)
→ Polish.

## Implementation Strategy

MVP = Phases 1–3 (character links), then parties, robustness, polish, PR, merge once CI is green.
