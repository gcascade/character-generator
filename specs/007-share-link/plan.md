# Implementation Plan: Share Link

**Branch**: `claude/cool-keller-vpldvo` | **Date**: 2026-11-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-share-link/spec.md`

## Summary

A framework-free `src/content/share.ts` encodes a character or a party as a compact, versioned array (enum values as
indexes, fragment references shortened to their last segment), serialised to JSON and base64url, and decodes it back
with full zod validation. Links have the form `<app>/share#c1.<data>` (character) or `#p1.<data>` (party): the data
stays in the URL fragment, never sent to the server. A `/share` page shows the result read-only with the existing
`CharacterDetail` or party components and offers save / open actions. A `useShare` hook shares through the Web Share
API when present, the clipboard otherwise, and a dialog with the link as a last resort.

## Technical Context

**Language/Version**: TypeScript 6 (strict), React 19

**Primary Dependencies**: MUI 9, React Router 8, zod 4; browser `TextEncoder`/`btoa`, `navigator.share`,
`navigator.clipboard`; no new dependency

**Storage**: none for links; saving uses `DataContext` and `PartyContext`

**Testing**: Vitest round-trip property tests (1,000 characters and parties, SC-002), length tests (SC-003), damaged
link fuzz tests (SC-004), component and page tests with mocked share/clipboard; axe in the browser validation

**Target Platform**: evergreen browsers, static GitHub Pages site (`/share` deep link served by `404.html`)

**Project Type**: single-page web application, client-side only

**Performance Goals**: instant encode/decode (a few hundred bytes)

**Constraints**: no server; links ≤ 300 characters for an app-made character, ≤ 1,500 for a party of 6; never show
partial data from an invalid link

**Scale/Scope**: 1 module, 1 hook, 2 components (`ShareButton`, `ShareDialog`), 1 page, share buttons in 4 places

## Constitution Check

| Principle                    | Status         | How                                                                            |
| ---------------------------- | -------------- | ------------------------------------------------------------------------------ |
| I. Works Without AI          | Pass           | Links carry app content by reference; AI text only when the character has some |
| II. Content Is Data          | Pass           | References to fragment ids, rendered per locale by the visitor's app           |
| III. Everything Tested       | Pass (planned) | Round trip, length, fuzz, components, page                                     |
| IV. Validate External Inputs | Pass           | A link is external input: decoded data validated with zod before display       |
| V. Client-Side Only          | Pass           | Data in the URL fragment; no backend, no shortener                             |
| VI. Keep It Simple           | Pass           | JSON + base64url, no compression library                                       |
| Bilingual UI                 | Pass           | New strings in both locales                                                    |

**Post-design re-check**: Pass.

## Project Structure

### Documentation (this feature)

```text
specs/007-share-link/
├── spec.md, plan.md, research.md, data-model.md, quickstart.md
├── contracts/share.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── content/share.ts (+test)            # encode/decode characters and parties, short references
├── hooks/useShare.ts (+test)           # share sheet, clipboard, fallback dialog state
├── components/common/share/
│   ├── ShareButton.tsx                 # icon or text button, used in 4 places
│   └── ShareDialog.tsx                 # link shown for manual copy
├── pages/share/Share.tsx (+test)       # /share: shared character or party, or "cannot be read"
├── components/character/characterDetail/CharacterDetail.tsx  # optional onSave / saved state
├── components/character/character/Character.tsx              # share button on the home card
├── pages/characterDetails/, pages/party/, components/party/*  # share buttons
├── routes.tsx                          # /share
└── data/locales/{en,fr}/ui.json        # share.* keys
```

**Structure Decision**: the link format is pure data code in `src/content` (like party rules); the page reuses
existing presentation components.

## Complexity Tracking

No constitution violations to justify.
