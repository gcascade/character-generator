# Implementation Plan: Party Generator

**Branch**: `claude/cool-keller-vpldvo` | **Date**: 2026-11-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-party-generator/spec.md`

## Summary

A new "Party" page generates 2–6 adventurers at once. A framework-free `src/content/party.ts` draws members with the
existing generator (spec 003 templates for shared constraints), then enforces the party rules: class variety, the
alignment mode (harmonious: never Good with Evil), unique first names, kept locked members. The party gets a name and a
short story assembled from new bilingual fragments (meeting, shared goal) that only use agreement-free constructions,
so they read correctly for any mix of genders. The current party is kept in `localStorage`; saved parties live next to
saved characters, in a "Parties" tab of "My characters". With an AI provider, the AI may write the party name and story
from the members' facts. UI uses the spec 005 look (compact member cards with `CharacterHeader`, `StoryDialog`).

## Technical Context

**Language/Version**: TypeScript 6 (strict), React 19

**Primary Dependencies**: MUI 9, zod 4, React Router 8; no new dependency

**Storage**: `localStorage["party"]` (current party), `localStorage["parties"]` (saved parties), both validated with zod

**Testing**: Vitest + Testing Library; property-style tests over 1,000 parties (SC-002, SC-003); content data test
extended to party fragments (SC-004); distinctness test (SC-005)

**Target Platform**: evergreen browsers, static GitHub Pages site

**Project Type**: single-page web application, client-side only

**Performance Goals**: a party of 6 is generated instantly without AI (a few filters over small lists)

**Constraints**: party texts in EN and FR with no gendered agreement on member names; phone layout in one column;
every control keyboard-usable with translated labels

**Scale/Scope**: 1 page, ~6 components, 1 content module, 2 storage keys, ≥ 10 names + 10 meetings + 10 goals × 2 locales

## Constitution Check

| Principle                    | Status         | How                                                                                             |
| ---------------------------- | -------------- | ----------------------------------------------------------------------------------------------- |
| I. Works Without AI          | Pass           | Party, name and story come from app content; AI only rewrites the name and story                |
| II. Content Is Data          | Pass           | Party fragments in `src/data/locales/<locale>/party.json`, ids in `src/data/content/party.json` |
| III. Everything Tested       | Pass (planned) | Party rules, storage, content, AI fallback, components and page tested; stories for components  |
| IV. Validate External Inputs | Pass           | Stored party and parties parsed with zod, invalid entries dropped; AI answer validated          |
| V. Client-Side Only          | Pass           | `localStorage` only                                                                             |
| VI. Keep It Simple           | Pass           | Reuses `generateRandomCharacter`, `CharacterTemplate`, `CharacterHeader`, `StoryDialog`         |
| Bilingual UI                 | Pass           | New strings and content in both locales                                                         |

**Post-design re-check**: Pass.

## Project Structure

### Documentation (this feature)

```text
specs/004-party-generator/
├── spec.md, plan.md, research.md, data-model.md, quickstart.md
├── contracts/party.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── types/party.ts                     # Party, PartyMember, PartyConstraints, AlignmentMode
├── content/
│   ├── party.ts (+test)               # generateParty, rerollMember, party rules, renderParty
│   └── storedParty.ts (+test)         # zod schemas for the current party and saved parties
├── data/content/party.json            # name, meeting and goal fragment ids
├── data/locales/{en,fr}/party.json    # their texts ({members}, {first}, {count})
├── data/locales/{en,fr}/ui.json       # party page strings
├── contexts/PartyContext.tsx          # current party + saved parties, persistence
├── hooks/useParty.ts                  # reads PartyContext (throws without provider)
├── ai/                                # partyStoryPrompt, partyStorySchema, generatePartyStory
├── components/party/
│   ├── partyControls/                 # size, shared constraints, alignment mode, Generate
│   ├── partyStory/                    # party name + story (+ AI notice)
│   ├── partyMemberCard/               # compact member card: lock, reroll, save, read story
│   └── savedParties/                  # "Parties" tab of My characters
├── pages/party/Party.tsx              # the page
├── pages/characters/Characters.tsx    # tabs: Characters | Parties
├── routes.tsx, navigation/drawerMenu  # /party route and menu entry
```

**Structure Decision**: party rules are pure functions in `src/content` (testable without React); React only holds the
current party and saved parties.

## Complexity Tracking

No constitution violations to justify.
