# Implementation Plan: Bilingual App and Fragment-Based Content

**Branch**: `claude/cool-keller-vpldvo` | **Date**: 2026-11-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-bilingual-content/spec.md`

## Summary

Make every interface text and every generated content available in English and French, and replace the 46 full
hand-written backgrounds with backgrounds assembled from fragments (origin by race, training by class, turning point
by alignment, goal, title), written once per language with inline gender selections. Characters store references to
fragments, so they re-render in the current language; AI-written text is stored with its language, labelled, and can
be translated on demand. Names come from per-race lists with a neutral list for non-binary characters. A small
in-house i18n module (typed keys, per-locale JSON) handles the interface.

## Technical Context

**Language/Version**: TypeScript 6 (strict), React 19

**Primary Dependencies**: MUI 9, zod 4; no new dependency (in-house i18n, research R1)

**Storage**: `localStorage` (locale, characters, history; legacy characters read and converted)

**Testing**: Vitest + Testing Library; data tests over `src/data/`; renderer tests per gender × locale

**Target Platform**: evergreen browsers, static GitHub Pages site

**Project Type**: single-page web application, client-side only

**Performance Goals**: language switch < 0.5 s without reload (SC-005); generation stays instant without AI

**Constraints**: content as data per locale (constitution II); French non-binary text in neutral phrasing; no
inclusive punctuation; phone layout without horizontal scroll

**Scale/Scope**: ~300 UI strings × 2; ≥ 75 fragments × 2 locales × 3 gender forms; 4 races × 4 name lists ≥ 40;
~40 epithets × 2 locales

## Constitution Check

| Principle                    | Status                    | How                                                                                                                                  |
| ---------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| I. Works Without AI          | Pass                      | All content and translation of app-made characters work offline from data; AI translation is optional                                |
| II. Content Is Data          | Pass                      | Per-locale folders under `src/data/locales/`, ids shared; a language = a folder, a race = entries + a names file; no copy per gender |
| III. Everything Tested       | Pass (planned)            | Data test, renderer tests, i18n tests, migration tests; components keep tests and stories                                            |
| IV. Validate External Inputs | Pass                      | Stored locale, characters and history validated with zod; legacy shapes converted                                                    |
| V. Client-Side Only          | Pass                      | No backend; translation happens in the browser                                                                                       |
| VI. Keep It Simple           | Pass                      | No i18n library (R1); one gender syntax for all languages (R2)                                                                       |
| Bilingual UI                 | Delivered by this feature |                                                                                                                                      |

**Post-design re-check**: Pass. Open point for the maintainer: French labels for non-binary characters use the
category name (research R3).

## Project Structure

### Documentation (this feature)

```text
specs/002-bilingual-content/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── i18n-and-content.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── i18n/                         # new: LocaleProvider, useLocale, useT, detectLocale
├── content/                      # new: renderText, renderCharacter, labels, generation and rerolls
│                                 #      (replaces src/utils/character.ts)
├── data/
│   ├── content/                  # new: fragments.json, epithets.json, names/<race>.json
│   ├── locales/en/, locales/fr/  # new: ui, labels, titles, origins, trainings, turningPoints, goals, epithets
│   ├── backgrounds.json          # deleted
│   └── characterNames.json       # deleted
├── ai/                           # prompts take a locale; written text; translateWritten
├── contexts/                     # Data/History contexts validate stored characters, convert legacy ones
├── components/, pages/           # every text through useT; characters through renderCharacter;
│                                 # language selector in DrawerMenu; "written by AI" label + translate action
└── types/character.ts            # content / written fields
```

**Structure Decision**: two new framework-free modules (`src/content`, `src/i18n` with a thin React provider), data
in `src/data`, UI changes limited to reading texts through `useT` and characters through `renderCharacter`.

## Complexity Tracking

No constitution violations to justify.
