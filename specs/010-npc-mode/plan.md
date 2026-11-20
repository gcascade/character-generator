# Implementation Plan: NPC Mode (Side Characters)

**Branch**: `claude/cool-keller-vpldvo` | **Date**: 2026-11-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/010-npc-mode/spec.md`

## Summary

A new "Side characters" page (`/npcs`) generates NPCs: name, race, gender, age and one of 20 occupations, plus a
six-section sheet (look, daily life, quirk, rumour, secret, opinion of adventurers) assembled from fragments in both
languages. One NPC by default, "Generate 5" for compact cards. Every property and section has its dice; properties
can be locked. NPCs are saved in a new "Side characters" tab of "My characters", opened at `/npcs/:id`, shared with
`#n1.` links, and optionally written by the AI. The model mirrors characters (fragment ids + `renderNpc(npc, locale)`)
but stays separate: no class, alignment, story or party membership.

## Technical Context

**Language/Version**: TypeScript 6 (strict), React 19

**Primary Dependencies**: MUI 9 (+ icons), React Router 8, zod 4; no new dependency

**Storage**: `localStorage["npc"]` (current NPC, batch and locks) and `localStorage["npcs"]` (saved), each
`{ version: 1, ... }` parsed with zod

**Testing**: Vitest + Testing Library; 1,000-NPC content tests, share round trips, storage parsing, components and
page tests, AI with a fake provider

**Target Platform**: evergreen browsers, static GitHub Pages site

**Project Type**: single-page web application, client-side only

**Constraints**: works without AI; every text in EN and FR with gender selections and French rules; occupations
enum append-only (links store indexes)

**Scale/Scope**: 20 occupations × 3 daily-life texts + 5 shared categories × 20 texts = 160 texts per language;
20 gendered labels; ~10 components

## Constitution Check

| Principle                    | Status         | How                                                                           |
| ---------------------------- | -------------- | ----------------------------------------------------------------------------- |
| I. Works Without AI          | Pass           | Fragments for everything; AI only writes the sheet, with fallback             |
| II. Content Is Data          | Pass           | Occupations, fragments and texts in `src/data/`; gender via `{{m\|f\|n}}`     |
| III. Everything Tested       | Pass (planned) | Content, generation, rerolls, storage, links, components, page, AI            |
| IV. Validate External Inputs | Pass (planned) | zod for stored NPCs, `#n1.` links and AI answers                              |
| V. Client-Side Only          | Pass           | localStorage and URL only                                                     |
| VI. Keep It Simple           | Pass           | Reuses names, lifespans, labels, `renderText`, emblem, share encoding helpers |
| Bilingual UI                 | Pass           | New UI keys in both locales                                                   |

**Post-design re-check**: Pass. One justified duplication: NPC locks live in the NPC context rather than
`LockProvider`, which is tied to the character generator's properties (research R5).

## Project Structure

```text
src/
├── types/npc.ts                          # Occupations (as const), Npc, NpcContentRefs, NpcText, NpcTemplate
├── data/content/npc.json                 # occupations (min age, icon key) and fragment ids by section
├── data/locales/{en,fr}/npc.json         # texts of every NPC fragment
├── data/locales/{en,fr}/labels.json      # occupation.<Value> (gendered in French)
├── data/locales/{en,fr}/ui.json          # nav, page, sheet, tab and action strings
├── content/npc.ts                        # generateNpc, generateNpcs, rerollNpc, renderNpc
├── content/storedNpc.ts                  # zod schemas, load/parse for "npc" and "npcs"
├── content/share.ts                      # + encodeNpc / decodeNpc, prefix n1., parseShareHash kind 'npc'
├── ai/npc.ts                             # npcSheetSchema, prompt, generateNpcSheet (fallback to fragments)
├── contexts/NpcContext.tsx               # current NPC, batch, locks, saved NPCs
├── hooks/useNpcs.ts, useNpcGenerator.ts  # context access; generation with optional AI
├── components/npc/
│   ├── npcSheet/                         # full sheet: header, properties with dice and locks, six sections
│   ├── npcCard/                          # compact card (batch and saved list)
│   ├── npcControls/                      # constraints (occupation, race, gender), Generate, Generate 5
│   ├── savedNpcs/                        # grid of saved NPCs (tab in My characters)
│   └── occupationIcon/                   # icon per occupation
├── components/character/raceEmblem/      # + optional occupation badge (NPC portrait)
├── pages/npcs/Npcs.tsx                   # /npcs
├── pages/npcDetails/NpcDetails.tsx       # /npcs/:id
├── pages/characters/Characters.tsx       # + "Side characters" tab
├── pages/share/Share.tsx                 # + NPC links
└── components/navigation/drawerMenu/     # + menu entry
```

**Structure Decision**: same layout as characters and parties; NPC code in its own files so nothing in the
character or party paths changes behaviour.

## Complexity Tracking

None.
