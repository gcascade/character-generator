# Implementation Plan: Arena

**Branch**: `claude/cool-keller-vpldvo` | **Date**: 2026-11-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/012-arena/spec.md`

## Summary

A new Arena page (`/arena`) runs a spectator battle royale with the app's characters. The player builds a roster
(current character, saved characters, current or saved parties as teams, random characters; up to 48), gives each
contestant up to two perks and three items, and starts the match. Everything random comes from a seeded generator:
skills (thirteen 0–100 values and hit points, rolled per contestant from the seed, never stored on characters), the
events of each round and their skill checks. The engine is a set of pure functions: `simulate(setup)` returns a list of
rounds of event results (ids, actors, items, outcomes, defeats); rendering turns those results into English or French
text, so a language change only rewords the match. Events are data (≈ 90 event kinds in `src/data/content/arena.json`
with conditions, checks and effects; texts in `src/data/locales/<locale>/arena.json`). Teams follow party ties, roles
and balance; alignment decides who helps and who betrays. The roster, setup and seed are kept in
`localStorage["arena"]`; the match itself is recomputed from them, and shared with an `#a1.` link (compressed).

## Technical Context

**Language/Version**: TypeScript 6 (strict), React 19

**Primary Dependencies**: MUI 9 (+ icons), React Router 8, zod 4; no new dependency (seeded generator written in a
few lines; link compression with the browser's `CompressionStream`)

**Storage**: `localStorage["arena"]` = `{ version: 1, roster, seed, shownRounds }`, parsed with zod; matches are
recomputed from it, never stored as text

**Testing**: Vitest + Testing Library; engine tests over 1,000 seeded matches (one winner, round limit, team and
alignment rules, skill effect, balance effect), skill bounds for every race/class/age band, content tests (keys and
placeholders in both locales, actor selections), share round trips, storage parsing, component and page tests

**Target Platform**: evergreen browsers, static GitHub Pages site

**Project Type**: single-page web application, client-side only

**Performance Goals**: a 48-contestant match simulated in under 100 ms; rounds render instantly

**Constraints**: works without AI; every text in EN and FR with per-actor gender selections and French rules; the
same setup and seed give the same match on every browser; skills never stored on characters (spec clarification);
characters, parties and their share links unchanged

**Scale/Scope**: 13 skills, ≥ 12 perks, ≥ 15 items, ≈ 90 event kinds with 1–3 outcome texts each per language
(≈ 250 texts per language), ~10 components, one page, one route

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                             | Status | How                                                                                                                                                        |
| ------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Works Without AI                   | ✅     | The arena uses only app content; no AI path in this feature                                                                                                |
| II. Content Is Data                   | ✅     | Skill profiles, perks, items and events live in `src/data/content/arena*.json`, texts per locale; per-actor gender selections instead of per-gender copies |
| III. Everything Tested                | ✅     | Engine as pure functions with seeded tests; each component with test and story                                                                             |
| IV. Validate External Inputs          | ✅     | `localStorage["arena"]` and `#a1.` links parsed with zod before use; unknown perk/item ids dropped                                                         |
| V. Client-Side Only                   | ✅     | Simulation in the browser; sharing through the URL hash                                                                                                    |
| VI. Keep It Simple                    | ✅     | No game library or state machine library; a seeded PRNG and plain functions                                                                                |
| Tone: heroic, not grimdark or parodic | ✅     | Defeats told without gore; humour stays light (mishaps, banter), the maintainer asked for a mix of epic and humour                                         |
| EN + FR complete                      | ✅     | Content test enforces every arena text in both locales with the same placeholders                                                                          |
| Accessibility / mobile                | ✅     | Roster and match views are lists and cards usable at phone width; buttons labelled                                                                         |

No violation: Complexity Tracking stays empty.

**Post-design re-check**: still passes. The only new mechanism (per-actor gender selections `{{a:…|…|…}}`) extends
the existing text system instead of duplicating texts per gender, as Principle II asks.

## Project Structure

### Documentation (this feature)

```text
specs/012-arena/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── arena.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
src/
  types/arena.ts                     Skill, Skills, Perk, Item, Contestant, Side, ArenaSetup, EventResult, Round, Match
  content/
    random.ts                        seeded generator (hash a string seed → sfc32), pick, shuffle, roll
    skills.ts                        rollSkills(character, rng), check(skill, modifier, rng)
    arena.ts                         buildContestants, simulate(setup) → Match, summary
    arenaEvents.ts                   event selection and resolution (conditions, checks, effects)
    arenaText.ts                     renderEvent(result, match, locale), per-actor selections
    storedArena.ts                   zod schema for localStorage["arena"]
    share.ts                         + encodeArena / decodeArena (#a1.)
  data/content/arena.json            skill profiles per class, race and age modifiers, perks, items, events
  data/locales/<locale>/arena.json   skill / perk / item names and descriptions, event texts, round titles
  contexts/ArenaContext.tsx          roster, seed, shown rounds; persistence
  hooks/useArena.ts
  components/arena/
    rosterBuilder/                   add current / saved / party / random; remove; team grouping
    contestantCard/                  portrait, name, team, skills grid, perks and items pickers
    skillGrid/                       thirteen skills in four families + hit points
    roundView/                       day/night title and its event lines
    matchSummary/                    winner, defeats, notable moments
  pages/arena/Arena.tsx              setup ↔ match views, share / replay / play again
  routes.tsx                         + /arena
  components/navigation/…            + Arena entry
```

**Structure Decision**: same single-app layout as previous features: pure content logic in `src/content/`, data in
`src/data/`, a context for persistence, components per area with test and story, one page.

## Complexity Tracking

No violations.
