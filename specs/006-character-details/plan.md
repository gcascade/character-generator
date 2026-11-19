# Implementation Plan: Saved Character Details

**Branch**: `claude/cool-keller-vpldvo` | **Date**: 2026-11-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-character-details/spec.md`

## Summary

Give every saved character a stable `id` (assigned on save, and on load for older data), use it for saving, deleting
and the "saved" state instead of object references, and add a detail page at `/characters/:id`. The page is built from
a reusable `CharacterDetail` component (portrait, `CharacterHeader`, read-only property grid, full story with drop cap)
that takes its actions as props, so the party generator can reuse it. Actions: back (to the same carousel page), open
in the generator (current character goes to the history), delete, translate AI text.

## Technical Context

**Language/Version**: TypeScript 6 (strict), React 19

**Primary Dependencies**: MUI 9, React Router 8 (`useParams`, `useNavigate`, location state), zod 4; no new dependency

**Storage**: `localStorage["characters"]` gains an `id` per entry; entries without one get it on load and are saved back

**Testing**: Vitest + Testing Library (DataContext ids and migration, detail component, detail page routes incl. not
found, open in generator, delete, back to carousel page); axe and 360 px check in the browser validation

**Target Platform**: evergreen browsers, static GitHub Pages site (deep links already served by `404.html`)

**Project Type**: single-page web application, client-side only

**Performance Goals**: instant (lookup in a short list)

**Constraints**: spec 005 look and accessibility; no change to generation, locks or AI behaviour

**Scale/Scope**: 1 route, 2 new components (`CharacterDetail`, `PropertyList`), 1 page, DataContext and Carousel changes

## Constitution Check

| Principle                    | Status         | How                                                                          |
| ---------------------------- | -------------- | ---------------------------------------------------------------------------- |
| I. Works Without AI          | Pass           | Detail view is app-only; translation offered only with a provider            |
| II. Content Is Data          | Pass           | Rendered through `renderCharacter` per locale                                |
| III. Everything Tested       | Pass (planned) | Context, components and page tested; stories for new components              |
| IV. Validate External Inputs | Pass           | `id` validated by the stored-character schema; missing ids created on load   |
| V. Client-Side Only          | Pass           | `localStorage` only                                                          |
| VI. Keep It Simple           | Pass           | Reuses `CharacterHeader`, `CharacterImage`, story styles; one page component |
| Bilingual UI                 | Pass           | New strings in both locales                                                  |

**Post-design re-check**: Pass.

## Project Structure

### Documentation (this feature)

```text
specs/006-character-details/
├── spec.md, plan.md, research.md, data-model.md, quickstart.md
├── contracts/details.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── types/character.ts                    # Character.id?: string
├── content/storedCharacter.ts            # id in the schema; withIds() for entries without one
├── contexts/DataContext.tsx              # ids on load/save; saveCharacter returns the saved copy;
│                                         # removeCharacter(id), updateCharacter(character)
├── hooks/useCharacterGenerator.ts        # results of generate/reroll/translate drop the id (R2)
├── hooks/useCharacterRequest.ts          # translateCharacter can target a given character (R5)
├── components/character/
│   ├── propertyList/                     # new: read-only label/value grid
│   ├── characterDetail/                  # new: reusable detail view with optional actions
│   ├── character/Character.tsx           # isSaved by id; current character becomes the saved copy
│   └── characterSummary/                 # card opens the detail page (link), delete by id
├── components/common/carousel/           # page controlled from outside (initialPage / onPageChange)
├── pages/characterDetails/CharacterDetails.tsx  # new page: /characters/:id, not found state
├── pages/characters/Characters.tsx       # remembers the carousel page in the navigation state
├── routes.tsx                            # /characters/:id
└── data/locales/{en,fr}/ui.json          # new keys
```

**Structure Decision**: the detail view is a presentational component; the page wires it to `DataContext`,
`CharacterContext`, `HistoryContext` and the router.

## Complexity Tracking

No constitution violations to justify.
