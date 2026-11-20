---
description: 'Task list for party depth'
---

# Tasks: Party Depth (Ties, Roles, Balance, Adventure Hook)

**Input**: Design documents from `specs/008-party-depth/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/party-depth.md](./contracts/party-depth.md)

**Tests**: Included (constitution III).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [x] T001 Add the ui keys of contracts/party-depth.md in src/data/locales/en/ui.json and src/data/locales/fr/ui.json
- [x] T002 Extend src/types/party.ts: `Tie`, `RoleId`, `HookRefs`, `BalanceArea`; `PartyMember.role?`, `Party.ties?`, `Party.hook?`, `text.hook?`

---

## Phase 2: Foundational (content)

**⚠️ Blocks every user story**

- [x] T003 Create src/data/content/partyDepth.json: ≥ 12 tie types (`directed`), ≥ 10 roles (`unique`, `area`, class weights 0–3, alignment bonus), ≥ 12 place / patron / threat ids
- [x] T004 Write texts in src/data/locales/{en,fr}/ties.json (`{a}`, `{b}`; agreement-free), roles.json (`{{m|f|n}}` in French, category name for non-binary) and hooks.json (place, patron, threat per research R4) — content to be reviewed by the maintainer
- [x] T005 Register them in src/content/data.ts and extend src/data/content.test.ts: ids and placeholders in both locales, no gender selection in ties and hooks, French typography and elision rules, minimum counts (SC-004)

---

## Phase 3: User Story 1 - Ties (P1) 🎯 MVP

- [x] T006 [US1] Implement in src/content/partyDepth.ts: `drawTies`, `rerollTie`, `removeTie`, `renderTie` (research R1); tests: 1,000 parties of 4 with 15–40% without ties, ≤ 2 ties per member, no duplicate pair, both locales render (SC-001)
- [x] T007 [US1] Fill ties in `generateParty` (ties between two kept members kept) and drop a replaced member's ties in `rerollMember` (may add new ones) in src/content/party.ts; tests
- [x] T008 [US1] Create src/components/party/partyTies/PartyTies.tsx (list with reroll / remove per tie, "no ties" text) and wire `rerollTie` / `removeTie` in src/contexts/PartyContext.tsx and src/pages/party/Party.tsx; tests and stories

---

## Phase 4: User Story 2 - Roles (P1)

- [x] T009 [US2] Implement `drawRoles`, `setRole`, `roleLabel` in src/content/partyDepth.ts (research R2); tests: 1,000 parties, one role per member, one leader at most, ≤ 2 per role, ≥ 3 roles per class (SC-002)
- [x] T010 [US2] Roles in `generateParty` / `rerollMember` (kept members keep their role) in src/content/party.ts; tests
- [x] T011 [US2] Create src/components/party/roleMenu/RoleMenu.tsx (role chip opening a menu: every role, "Random"; keyboard accessible) on PartyMemberCard; `setRole` in PartyContext; tests and stories

---

## Phase 5: User Story 3 - Balance (P2)

- [x] T012 [US3] Implement `balanceOf` and `gaps` in src/content/partyDepth.ts (research R3); tests with known compositions
- [x] T013 [US3] Create src/components/party/partyBalance/PartyBalance.tsx (labelled bars with the level as text, gap hints, "well balanced"); on the Party page; tests and stories

---

## Phase 6: User Story 4 - Adventure hook (P2)

- [x] T014 [US4] Implement `drawHook`, `rerollHook`, `renderHook` in src/content/partyDepth.ts; hook in `generateParty`; tests (≥ 20 distinct hooks in 100 draws per locale — SC-003)
- [x] T015 [US4] Create src/components/party/adventureHook/AdventureHook.tsx (hook paragraph, reroll, "written by AI" notice); `rerollHook` in PartyContext; on the Party page; tests and stories
- [x] T016 [US4] AI: optional `hook` in `partyStorySchema` / prompt (src/ai/party.ts), stored as `text.hook`; tests (valid, missing hook keeps the app's, failure)

---

## Phase 7: Persistence and sharing (FR-007)

- [x] T017 Storage: new optional fields in src/content/storedParty.ts; `completeParty` fills roles and hook for older parties on load in PartyContext; tests
- [x] T018 Share links: `p2` format with ties, roles and hook in src/content/share.ts; `p1` still decoded and completed; shared party page shows ties, roles, balance and hook; tests (round trip of 1,000 parties, old `p1` link — SC-005)

---

## Phase 8: Polish

- [ ] T019 [P] Update README.md and CLAUDE.md (party depth data, share `p2`)
- [ ] T020 Run lint, typecheck, test:run, build and build-storybook; browser validation of quickstart.md with screenshots; sample of ties and hooks in both languages for the maintainer

---

## Dependencies & Execution Order

Setup → Foundational → US1 (T006 → T007 → T008) → US2 (T009 → T010 → T011) → US3 (T012 → T013) → US4 (T014 → T015 → T016)
→ Persistence/sharing (T017 → T018) → Polish. US3 and US4 only depend on the foundational phase.

## Implementation Strategy

MVP = Phases 1–3 (ties); then roles, balance, hook, persistence and sharing, polish, PR, merge once CI is green.
