# Implementation Plan: Party Depth (Ties, Roles, Balance, Adventure Hook)

**Branch**: `claude/cool-keller-vpldvo` | **Date**: 2026-11-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-party-depth/spec.md`

## Summary

Extend the party model with optional `ties`, a `role` per member and an adventure `hook`, all drawn by pure functions
in a new `src/content/partyDepth.ts` from language-independent data (`src/data/content/partyDepth.json`: tie types,
roles with class/alignment weights, hook fragment ids) and bilingual texts. Balance is computed, never stored. The
party page gains a ties list, a role menu on each member card, a balance panel and an adventure hook card. Storage
and share links carry the new data (share format `p2`, `p1` still read); older parties get roles and a hook drawn once
on load. The AI may write the hook together with the party story.

## Technical Context

**Language/Version**: TypeScript 6 (strict), React 19

**Primary Dependencies**: MUI 9, zod 4; no new dependency

**Storage**: `localStorage["party"]` / `["parties"]` gain optional `ties`, `role`, `hook`, `text.hook` (still
`version: 1`, fields optional)

**Testing**: Vitest property tests over 1,000 parties (SC-001, SC-002), hook distinctness (SC-003), content tests
(SC-004), storage and share round trips incl. `p1` (SC-005), components, page; axe in the browser validation

**Target Platform**: evergreen browsers, static GitHub Pages site

**Project Type**: single-page web application, client-side only

**Performance Goals**: instant without AI

**Constraints**: agreement-free tie and hook texts in French; role names gendered with the existing `{{m|f|n}}`
syntax; balance readable without colour

**Scale/Scope**: ≥ 12 tie types, ≥ 10 roles, ≥ 12 places / patrons / threats per locale; 4 new components

## Constitution Check

| Principle                    | Status         | How                                                                          |
| ---------------------------- | -------------- | ---------------------------------------------------------------------------- |
| I. Works Without AI          | Pass           | Ties, roles, balance and hook come from app data; AI only rewrites the hook  |
| II. Content Is Data          | Pass           | Tie types, roles, weights and hook fragments in `src/data`, texts per locale |
| III. Everything Tested       | Pass (planned) | Rules, content, storage, share, AI fallback, components, page                |
| IV. Validate External Inputs | Pass           | Stored parties and share links validated; unknown ids dropped or redrawn     |
| V. Client-Side Only          | Pass           | `localStorage` and links only                                                |
| VI. Keep It Simple           | Pass           | Balance computed on the fly; one module for the new rules                    |
| Bilingual UI                 | Pass           | New strings and content in both locales                                      |

**Post-design re-check**: Pass.

## Project Structure

```text
src/
├── types/party.ts                       # Tie, RoleId, HookRefs; PartyMember.role, Party.ties, Party.hook, text.hook
├── data/content/partyDepth.json         # tie types (directed?), roles (unique?, class/alignment weights), hook ids
├── data/locales/{en,fr}/ties.json       # "{a} owes {b} their life" (agreement-free)
├── data/locales/{en,fr}/roles.json      # role names, {{m|f|n}} in French
├── data/locales/{en,fr}/hooks.json      # place / patron / threat fragments
├── content/partyDepth.ts (+test)        # drawTies, drawRoles, drawHook, balanceOf, renderTie, renderHook, reroll helpers
├── content/party.ts                     # generateParty / rerollMember fill ties, roles and hook
├── content/storedParty.ts, share.ts     # new fields; share `p2`, `p1` read; older data completed on load
├── ai/party.ts                          # optional `hook` in the AI answer
├── contexts/PartyContext.tsx            # rerollTie, removeTie, setRole, rerollHook
└── components/party/
    ├── partyTies/                       # list of ties with reroll / remove
    ├── roleMenu/                        # role chip + menu (every role, "Random")
    ├── partyBalance/                    # levels per area + gap hints
    └── adventureHook/                   # hook paragraph + reroll
```

**Structure Decision**: new rules in a sibling module of `party.ts` to keep each file focused; the page composes the
new components under the party story.

## Complexity Tracking

No constitution violations to justify.
