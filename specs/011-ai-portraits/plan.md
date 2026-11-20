# Implementation Plan: AI Portraits

**Branch**: `claude/cool-keller-vpldvo` | **Date**: 2026-11-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/011-ai-portraits/spec.md`

## Summary

Two parts sharing one prompt recipe:

1. **In-app portraits** (US1, US2): "Paint a portrait" on characters, party members and side characters asks AI Horde
   (free, anonymous, browser-friendly queue) for an image built from visible traits only. Progress shows the queue
   position and wait estimate; cancel and time limit are supported. Painted images are shrunk in the browser and kept
   in a separate `localStorage["portraits"]` store referenced by a `portraitId` on the character or NPC; unreferenced
   portraits are cleaned on load. Share links are unchanged.
2. **Default portraits** (US3): `npm run portraits:paint` — a Node script the maintainer runs on their own computer,
   with AI Horde (no account) or Cloudflare Workers AI (their own free account, key read from their environment). It
   paints missing race/class/gender portraits, writes them as WebP, updates a portrait manifest and the guide, never
   overwrites, resumes after a stop, and has a dry run.

The portrait manifest (`src/data/content/portraitFiles.json`) also lets the app know which default portraits exist
without a network check per character (no more flash from the generic image to the emblem).

## Technical Context

**Language/Version**: TypeScript 6 (strict), React 19; Node 22 for the script (built-in `fetch`, ESM)

**Primary Dependencies**: MUI 9, zod 4; no new runtime dependency; the script uses only Node built-ins

**Storage**: `localStorage["portraits"]` `{ version: 1, portraits: Record<id, StoredPortrait> }`; `portraitId` added
(optional) to stored characters, party members' characters and NPCs; manifest JSON in the repository

**Testing**: Vitest with a fake Horde (`fetch` stub): prompt contents (no names), progress/cancel/timeout, storage and
cleanup, components; the script's prompt builder is checked against the app's for every combination; dry run of the
script in tests (no network)

**Target Platform**: evergreen browsers (static site); script on the maintainer's computer (macOS/Linux/Windows)

**Constraints**: works without AI; no name or user text in prompts; keys never stored in the repository or printed;
`localStorage` quota (~5 MB) shared with the rest of the app

**Scale/Scope**: ~150 portraits for the script (9 races × 9 classes × 2 variants, minus existing); in-app storage cap
around 60 portraits at ~40 KB each

## Constitution Check

| Principle                    | Status         | How                                                                                      |
| ---------------------------- | -------------- | ---------------------------------------------------------------------------------------- |
| I. Works Without AI          | Pass           | Button only when the service is enabled; defaults (images, emblem) unchanged             |
| II. Content Is Data          | Pass           | Style, race visuals, class and occupation gear in `src/data/content/portraitPrompt.json` |
| III. Everything Tested       | Pass (planned) | Fake service, storage, components, manifest in sync with files, script dry run           |
| IV. Validate External Inputs | Pass (planned) | zod for Horde answers and the portrait store; images checked as `image/webp`/`jpeg`      |
| V. Client-Side Only          | Pass           | Browser talks to AI Horde directly; script runs locally; nothing server-side             |
| VI. Keep It Simple           | Pass           | No SDK or image library: `fetch` + canvas; script with Node built-ins                    |
| Bilingual UI                 | Pass           | New strings in both locales                                                              |

**Post-design re-check**: Pass. Note: the privacy notice (FR-008) states that AI Horde receives the description.

## Project Structure

```text
src/
├── data/content/portraitPrompt.json      # style, negative prompt, race visuals, class/occupation gear, age bands
├── data/content/portraitFiles.json       # manifest of default portrait files (written by the scripts)
├── content/portraitPrompt.ts             # buildPortraitPrompt(subject) from visible traits only
├── content/storedPortraits.ts            # zod store, save/load, cleanup of unreferenced portraits, quota handling
├── ai/horde.ts                           # submit / check / status / cancel against AI Horde (fetch, zod)
├── hooks/usePortraitPainter.ts           # paint(subject) → progress, cancel, timeout, result
├── contexts/PortraitContext.tsx          # portraits store (load once, save in effect)
├── components/portrait/paintPortrait/    # button + progress (queue, estimate, cancel) + privacy notice
├── components/character/characterImage/  # painted > default file (manifest) > emblem
├── components/character/raceEmblem/      # unchanged
├── types/character.ts, types/npc.ts      # optional portraitId
├── content/storedCharacter.ts, storedNpc.ts, storedParty.ts  # accept portraitId
└── content/share.ts                      # unchanged format (portraitId never shared)
scripts/
├── paint-portraits.mjs                   # npm run portraits:paint [--service horde|cloudflare] [--dry-run] [--limit n] [--only path]
├── portrait-prompt.mjs                   # same recipe as src/content/portraitPrompt.ts (checked by a test)
└── missing-portraits.mjs                 # + writes the manifest
docs/portraits.md                         # how to run the script, keys, review before committing
```

## Complexity Tracking

| Item                                         | Why needed                                    | Simpler alternative rejected because                                      |
| -------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------- |
| Prompt builder in TS and in the script (mjs) | The script must run with plain Node, no build | Running TS from Node needs a loader or flags; a test keeps both identical |
