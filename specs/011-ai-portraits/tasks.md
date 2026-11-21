---
description: 'Task list for AI portraits'
---

# Tasks: AI Portraits

**Input**: Design documents from `specs/011-ai-portraits/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/portraits.md](./contracts/portraits.md)

**Tests**: Included (constitution III).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [x] T001 [P] src/data/content/portraitPrompt.json: fixed style, negative prompt, race visuals (9 races), class gear (9 classes), occupation gear (20 occupations), age bands by share of lifespan (young < 25%, adult < 50%, middle-aged < 75%, elderly)
- [x] T002 [P] UI strings in src/data/locales/{en,fr}/ui.json: paint, paint again, remove portrait, progress (queue position, estimate), cancel, outdated badge, failure messages (unreachable, faulted, timed out, impossible), privacy notice title/body/"don't ask again"

---

## Phase 2: Foundational

**⚠️ Blocks the user stories**

- [x] T003 src/content/portraitPrompt.ts: `portraitSubjectOf(character | npc)`, `ageBand`, `buildPortraitPrompt(subject) → { positive, negative }`; tests (every race × class and race × occupation, every gender: no name, no story text, contains race visuals and gear — SC-004)
- [x] T004 [P] Default portrait manifest src/data/content/portraitFiles.json written by scripts/missing-portraits.mjs (now also listing `.webp`/`.jpg`); `portraitFor` in src/components/character/characterImage/CharacterImage.tsx reads the manifest (no network check); test that the manifest matches public/images
- [x] T005 src/ai/horde.ts: `paintWithHorde(prompt, { signal, onProgress, timeoutMs = 600000 })` — submit (`apikey: 0000000000`, `Client-Agent`, `r2: false`, `nsfw: false`, `censor_nsfw: true`, 512×512, 25 steps), poll check every 4 s, fetch status, cancel with DELETE on abort; zod for every answer; typed errors (unreachable, faulted, impossible, timed-out, invalid-answer); tests with a fetch stub (success, queue progress, cancel, fault, timeout)
- [x] T006 src/content/storedPortraits.ts: `{ version: 1, portraits: Record<id, { image, traits, service: 'horde', paintedAt }> }` (image `data:image/(webp|jpeg);base64,…` ≤ 200 KB), `shrinkImage(dataUrl) → 384×384 WebP q0.8 (JPEG fallback)`, cleanup of portraits referenced by no other localStorage value, quota handling (drop oldest unreferenced, else keep for the session only); tests

**Checkpoint**: prompt, service and storage tested without UI.

---

## Phase 3: User Story 1 - A portrait made for my character (P1) 🎯 MVP

- [x] T007 [US1] src/contexts/PortraitContext.tsx (+ hook src/hooks/usePortraits.ts): load once, save in effect, `add`, `remove`, `get`; provider in src/components/App.tsx; tests
- [x] T008 [US1] `portraitId?: string` on `Character` (src/types/character.ts) and `Npc` (src/types/npc.ts), accepted by src/content/storedCharacter.ts, storedNpc.ts and party storage; never shared (src/content/share.ts drops it; test)
- [x] T009 [US1] src/hooks/usePortraitPainter.ts: state machine `idle → submitting → queued → done | failed | cancelled | timedOut`, one painting per subject, abort on unmount, shrink and store the result, attach the id through a callback; tests with the fake service
- [x] T010 [US1] src/components/portrait/paintPortrait/PaintPortrait.tsx: button (paint / paint again / remove), progress (queue position, estimate, cancel), messages, privacy notice dialog on first use (choice stored); test and story
- [x] T011 [US1] Show painted portraits: CharacterImage takes an optional `portraitId` (painted > manifest file > emblem), outdated badge when traits differ (R4); wire PaintPortrait into the generator card (src/components/character/character/Character.tsx), the side-character sheet (src/components/npc/npcSheet/NpcSheet.tsx via the Npcs page) and update the current character / NPC; tests

---

## Phase 4: User Story 2 - Portraits that stay (P1)

- [x] T012 [US2] Saved characters, party members and saved NPCs show their portrait (CharacterSummary, CharacterDetail, PartyMemberCard, NpcCard, NpcSheet); painting from the details pages updates the saved item; a shared link shows the default portrait; tests including reload
- [x] T013 [US2] Storage full: character still saved, portrait kept for the session, message; test with a throwing `setItem`

---

## Phase 5: User Story 3 - Fill the missing default portraits (P2)

- [x] T014 [US3] scripts/portrait-prompt.mjs (same recipe as src/content/portraitPrompt.ts, reading portraitPrompt.json) and a test comparing both for every race × class × variant
- [x] T015 [US3] scripts/paint-portraits.mjs (`npm run portraits:paint`): `--service horde|cloudflare`, `--dry-run`, `--limit`, `--only`; keys only from the environment (`AI_HORDE_API_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`), never printed; skips existing files; stops cleanly on quota/network errors (exit 2) and resumes; writes WebP/JPEG, the manifest and docs/portraits.md; dry-run test (no network)
- [x] T016 [US3] docs/portraits.md: how to run the script (no account, with a Horde key, with Cloudflare), review before committing

---

## Phase 6: Polish

- [x] T017 [P] README.md (Portraits section, privacy) and CLAUDE.md (portrait store, manifest, script)
- [x] T018 Run lint, typecheck, test:run, build and build-storybook; browser validation with the fake service (and the real one if the network allows) per quickstart.md

---

## Dependencies & Execution Order

Setup → Foundational (T003 after T001; T005, T006 independent) → US1 (T007 → T008 → T009 → T010 → T011) → US2 →
US3 (needs T001/T003/T004 only; can run in parallel with US1/US2) → Polish.

## Parallel Opportunities

- T001, T002, T004 in parallel; T005 and T006 in parallel.
- US3 (script) is independent of the in-app UI.

## Implementation Strategy

MVP = Phases 1–3 (paint a portrait for the current character / NPC). Then persistence, then the script so the
maintainer can fill the default portraits, then polish.
