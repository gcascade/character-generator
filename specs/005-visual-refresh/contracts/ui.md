# Contract: UI (Visual Refresh)

## Theme (`src/themes`)

- `theme` — MUI theme with `colorSchemes.light` / `colorSchemes.dark`, typography (`h1`–`h4` Cinzel, `body1/2`
  Alegreya Sans, `story` variant Alegreya), component overrides (Card, Button, Chip, Dialog, Snackbar, focus ring).
- `raceColor(race, mode)`, `classColor(characterClass, mode)` → `{ main, contrastText }`.
- `contrastRatio(foreground, background): number` (WCAG 2.x).

## Components

- `CharacterHeader({ character })` — `h2` "First Last", epithet below, badges: race, class (coloured), gender · age.
- `CharacterProperty` — unchanged props (spec 003) plus layout as a grid cell; actions visible on hover/focus, when
  locked, and on touch devices.
- `CharacterBackground` — title, first paragraph with drop cap, "Read the story" button (`story.read`) opening
  `StoryDialog`; written-in notice unchanged.
- `StoryDialog({ open, onClose, title, subtitle, paragraphs })` — full screen below `sm`, close button labelled
  `story.close`, Escape closes, focus returns to the opener.
- `ColorModeToggle({ variant: 'compact' | 'select' })` — light / dark / system, labels `colorMode.*`.
- `AlertManager` — at most one visible notification.

## UI keys (en / fr)

`story.read` (Read the story / Lire l'histoire), `story.close` (Close / Fermer), `colorMode.label` (Theme / Thème),
`colorMode.light` (Light / Clair), `colorMode.dark` (Dark / Sombre), `colorMode.system` (System / Système).
