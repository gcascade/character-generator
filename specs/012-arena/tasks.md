---
description: 'Task list for the arena (spectator battle royale)'
---

# Tasks: Arena

**Input**: Design documents from `specs/012-arena/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/arena.md](./contracts/arena.md), [quickstart.md](./quickstart.md)

**Tests**: Included (constitution III: every component has a test and a story; engine invariants over 1,000 seeded
matches are success criteria SC-003 and SC-005).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [x] T001 Create src/types/arena.ts: `SKILLS` (`melee`, `ranged`, `magic`, `athletics`, `stealth`, `endurance`,
      `perception`, `survival`, `lore`, `healing`, `persuasion`, `intimidation`, `deception`), `Skill`, `SKILL_FAMILIES`
      (`combat`: melee, ranged, magic; `physical`: athletics, stealth, endurance; `mind`: perception, survival, lore,
      healing; `social`: persuasion, intimidation, deception), `Skills` (`values: Record<Skill, number>` "integers, 5–95
      when rolled", `hp` "20–40"), `PerkDefinition`, `ItemDefinition` (`kind: weapon | tool | protection | consumable`,
      `damage` 2–8 for weapons), `Contestant` (`id`, `character`, `sideId`, `role?`, `perks` "0–2 distinct known perk
      ids", `items` "0–3 known item ids", `sourceId?`), `Side` (`id`, `kind: team | solo`, `name?`, `ties`),
      `ArenaSetup` (`contestants`, `sides`, `seed`, `shownRounds`), `Fighter`, `EventResult`, `Round`, `Match`
- [x] T002 [P] UI strings in src/data/locales/{en,fr}/ui.json: `nav.arena` ("Arena" / "Arène"), page title and intro,
      roster actions (add current character, add saved character, add current party, add saved party, add random N,
      remove, random loadouts), side labels (team, solo), start, next round, skip to the end, replay, play again, share,
      use this roster, summary titles, errors (too few sides, roster full, unreadable link)

---

## Phase 2: Foundational (randomness, skills data, text engine)

**⚠️ Blocks every user story**

- [x] T003 src/content/random.ts: `createRandom(seed)` (cyrb128 hash → sfc32), `next`, `int(n)`, `pick`, `shuffle`,
      `roll()` 1–100, `newSeed()` (8 base36 characters from `crypto.getRandomValues`); tests in src/content/random.test.ts
      (same seed → same sequence, known first values pinned, different seeds differ, `roll` within 1–100, uniformity
      roughly ±3 % over 100,000 rolls)
- [x] T004 [P] src/data/content/arena.json, part 1: `skills.classes` (base profile per class: 3 signature skills
      60–70, average ~40, weak 20–25), `skills.races` (modifiers −10…+10, research R2), `skills.ageBands` (young, adult,
      middle-aged, elderly), `skills.hp` (class bonus); register in src/content/data.ts
- [x] T005 [P] Skill names and family names in src/data/locales/{en,fr}/arena.json (`skills.<skill>`,
      `families.<family>`); content test in src/data/content.test.ts (same keys in both locales)
- [x] T006 src/content/skills.ts: `rollSkills(character, random)` (class + race + age band via `ageBand` of
      src/content/portraitPrompt.ts + random −8…+8, clamp 5–95; hp = 20 + endurance / 5 + class bonus, within 20–40),
      `check(value, modifier, random)` (success when roll ≤ clamp(value + modifier, 5, 95)); tests in
      src/content/skills.test.ts (every race × class × age band within bounds; class signature skills among the three
      highest in ≥ 90 % of 1,000 rolls — SC-001; orc intimidation and halfling stealth above average; check rates match
      the value over 10,000 rolls)
- [x] T007 Per-actor text rendering in src/content/arenaText.ts: `fillActorText(text, actors, extras)` with `{a}`,
      `{b}`, `{c}` (first names), `{item}`, `{theItem}`, `{team}` and selections `{{a:m|f|n}}` per actor (research R7),
      capitalised first letter; tests (each actor's gender picks its own form, missing actor throws, French narrow
      no-break spaces untouched)

**Checkpoint**: seeded rolls, skills and multi-actor texts tested without UI.

---

## Phase 3: User Story 1 - Contestants get skills (P1) 🎯 MVP part 1

**Goal**: the Arena page builds a roster and shows each contestant's skills, rolled from the seed.

**Independent test**: add characters of several races and classes; each card shows thirteen skills and hit points;
reloading the page shows the same values; character pages show no skills.

- [x] T008 [US1] Roster functions in src/content/arena.ts: `MAX_CONTESTANTS = 48`, `emptySetup()` (new seed),
      `addCharacter(setup, character, sourceId?)` (ignored when `sourceId` already enrolled or roster full),
      `addParty(setup, party, locale)` (one team, members' roles and ties kept, ties remapped to contestant ids),
      `addRandom(setup, count)`, `removeContestant` (a team left with one member becomes solo), `canStart` (≥ 2 sides,
      ≤ 48), `contestantSkills(setup, id)` (stream `${seed}:skills:${id}`); tests in src/content/arena.test.ts
- [x] T009 [US1] src/content/storedArena.ts: zod schema for `localStorage["arena"]` = `{ version: 1, contestants,
sides, seed, shownRounds }` (characters validated like stored characters, unknown perk/item ids dropped, at most 48
      contestants, orphan sides removed); tests in src/content/storedArena.test.ts
- [x] T010 [US1] src/contexts/ArenaContext.tsx (`ArenaProvider`: setup and actions; lazy load, save in an effect) +
      src/hooks/useArena.ts (throws without provider); add the provider in src/components/App.tsx; tests
- [x] T011 [P] [US1] src/components/arena/skillGrid/SkillGrid.tsx: thirteen skills grouped by family with labels in
      the interface language, values as numbers and bars, hit points; test and story
- [x] T012 [P] [US1] src/components/arena/contestantCard/ContestantCard.tsx: portrait (`CharacterImage`), name, race,
      class, side, `SkillGrid`, remove action; test and story
- [x] T013 [US1] src/components/arena/rosterBuilder/RosterBuilder.tsx: add current character, saved character (picker),
      current party, saved party (picker), random N; roster grouped by side; full-roster and too-few-sides messages; test
      and story
- [x] T014 [US1] src/pages/arena/Arena.tsx setup view (route `/arena` in src/routes.tsx, menu entry in
      src/components/navigation/drawerMenu/DrawerMenu.tsx); page test: add contestants, skills shown, reload keeps them,
      character page shows no skills

**Checkpoint**: the roster works and shows skills.

---

## Phase 4: User Story 2 - Watch an arena match (P1) 🎯 MVP part 2

**Goal**: a match runs from the seed, is told round by round in either language and ends with one winner.

**Independent test**: matches of 2, 8 and 24 contestants end with one winner; same seed → same story; language
switch rewords the same events.

- [x] T015 [US2] src/data/content/arena.json, part 2: core event kinds (≥ 50) for solos: finding things, food and
      shelter, traps and hazards, hunting, hiding, ambushes, melee / ranged / magic fights, fleeing, persuasion,
      intimidation, deception, healing oneself, arena tightening events, final duel, humour; fields per data-model.md
      (`phase`, `actors` 1–3, `relation`, `when`, `check`, `outcomes` with effects, `weight`, `notable`)
- [x] T016 [US2] Event texts in src/data/locales/{en,fr}/arena.json (`events.<id>.<outcome>`, `rounds.day`,
      `rounds.night`, summary lines): epic and light humour, no gore, French rules; content test: every event outcome
      has a text in both locales with the same placeholders, every text renders for every gender combination
- [x] T017 [US2] Engine in src/content/arenaEvents.ts (`eligibleEvents`, `resolveEvent`: checks, fights per research
      R3, effects, wounds) and `simulate(setup)` in src/content/arena.ts (rounds alternating day / night, every living
      fighter once per round, round limit 4 + ceil(sides × 0.75) capped at 24, tightening from round 3, deadly in the
      last two, forced finale, summary data: winner, defeats per contestant, round of defeat, ≤ 5 notable moments);
      tests in src/content/arena.test.ts over 1,000 seeded matches of 2 to 48 contestants (SC-003: exactly one winning
      side within the limit, every living fighter once per round; SC-005 first half: +30 skill → clearly more successes;
      48 contestants simulated in < 100 ms)
- [x] T018 [US2] `renderEvent`, `renderRoundTitle`, `renderSummary` in src/content/arenaText.ts; tests (same match
      rendered in en and fr has the same number of lines; no event text repeats more than twice in a typical match —
      SC-007)
- [x] T019 [P] [US2] src/components/arena/roundView/RoundView.tsx (day/night title, event lines with defeated names
      highlighted); test and story
- [x] T020 [P] [US2] src/components/arena/matchSummary/MatchSummary.tsx (winner with portrait, defeats table, notable
      moments); test and story
- [x] T021 [US2] Match view in src/pages/arena/Arena.tsx: Start (disabled with reason when `canStart` fails), rounds
      up to `shownRounds`, Next round, Skip to the end, summary, back to setup; page test (2-side match to the end,
      language switch keeps events)

**Checkpoint**: MVP: build a roster, watch a full match.

---

## Phase 5: User Story 3 - Teams, alignment and ties shape the story (P2)

**Goal**: teams, alliances, betrayals, protection and sacrifices follow alignment, ties, roles and balance.

**Independent test**: invariants and statistics over 1,000 seeded matches.

- [x] T022 [US3] Team and alliance event kinds in src/data/content/arena.json (≥ 25): team entrance, shared food, team
      heal, leader protects, friend protects, sacrifice (friendly ties), split (hostile ties: `tie-rivals`,
      `tie-betrayal`, `tie-suspicion`, `tie-family-feud`), alliance offer, alliance betrayal (not good), sparing the
      defeated (good), finishing the wounded (evil), chaotic surprises; texts in src/data/locales/{en,fr}/arena.json
- [x] T023 [US3] Side rules in src/content/arenaEvents.ts: teammates never target each other while the team holds,
      splits turn both into solos, alliances as temporary sides, good characters never betray, balance bonus +3 per area at
      level ≥ 2 (`balanceOf` of src/content/partyDepth.ts) on the matching checks; tests over 1,000 matches (SC-003 second
      half: no teammate defeat, no betrayal by a good ally; SC-005 second half: balanced teams win more often than
      unbalanced teams of the same size)

**Checkpoint**: parties play as parties.

---

## Phase 6: User Story 4 - Perks and items (P2)

**Goal**: perks and items picked in setup change the match.

**Independent test**: same seed, different loadouts → different events and outcomes; limits enforced.

- [ ] T024 [P] [US4] Perks (≥ 12) and items (≥ 15) in src/data/content/arena.json (research R10: bonuses, hp, tags,
      kind, damage) and names / descriptions in src/data/locales/{en,fr}/arena.json (`perks.<id>`, `items.<id>` with
      `name`, `the`, `description`); content test
- [ ] T025 [US4] `setPerks` (max 2, distinct, known), `setItems` (max 3, known), `randomLoadouts(setup, random)` in
      src/content/arena.ts; perk and item effects in the engine (bonuses, Lucky reroll once per match, consumables used
      up, items found, traded, stolen, lost) with item event kinds (≥ 15) and texts; tests (limits, same seed with and
      without a sword → different fights, Lucky rerolls once)
- [ ] T026 [US4] src/components/arena/loadoutPicker/LoadoutPicker.tsx (two perk selects, three item selects, one-line
      descriptions) in ContestantCard, "Random loadouts" in RosterBuilder; test and story

**Checkpoint**: the player's setup matters.

---

## Phase 7: User Story 5 - Replay and share a match (P3)

**Goal**: replay, play again, share by link.

**Independent test**: a shared link opened in a fresh browser shows the same roster and story.

- [ ] T027 [US5] `encodeArena` / `decodeArena` / `arenaUrl` in src/content/share.ts (`#a1.`, deflate-raw with
      `CompressionStream`, base64url, positional arrays reusing the character encoding, zod validation, unknown ids
      dropped); tests (round trip of a 48-contestant setup gives the same `simulate` result — SC-006; damaged data →
      undefined; 48-contestant link under 8 KB)
- [ ] T028 [US5] Replay (shownRounds back to 1), Play again (new seed: new skills and story), Share (copy link) in
      src/pages/arena/Arena.tsx; opening `/arena#a1.…` shows the shared match read-only with "Use this roster"
      (confirmation before replacing the local setup) and an error message for unreadable links; page tests

---

## Phase 8: Polish & cross-cutting

- [ ] T029 [P] Content pass: ≥ 90 event kinds in total, tone check (epic + light humour, no gore), French rules
      (neutral third form, U+202F, no elision before a placeholder), reading time of a 12-contestant match 3–7 minutes
      (SC-004, ~55 lines)
- [ ] T030 [P] Docs: README (Arena section), CLAUDE.md (spec 012 section: files, storage key, `#a1.` prefix, per-actor
      selections, skills only in the arena), src/data README if any
- [ ] T031 Run quickstart.md scenarios, `npm run typecheck`, `npm run lint`, `npm run test:run`, Storybook build;
      open the PR

---

## Dependencies

- Phase 1 → Phase 2 → US1 → US2 (needs the roster and skills) → US3 and US4 (both extend the engine; can run in
  either order) → US5 (needs a complete setup) → Polish.
- Within US2: T015 → T016 → T017 → T018; T019 and T020 in parallel with T017; T021 last.

## Parallel examples

- Phase 1: T002 alongside T001.
- Phase 2: T004 and T005 alongside T003; T006 after T003 and T004.
- US1: T011 and T012 in parallel, then T013 and T014.
- US2: T019 and T020 while T017 is written.
- US4: T024 while US3 is in progress.

## Implementation strategy

1. MVP = Phases 1–4 (roster with skills, full match told in both languages): demo to the maintainer.
2. Then US3 (teams), US4 (perks and items), US5 (sharing), each a complete increment tested on its own.
3. Content keeps growing after the feature: more event kinds are data only.
