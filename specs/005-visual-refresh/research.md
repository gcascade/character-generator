# Research: Visual Refresh

## R1. Fonts

- **Decision**: Cinzel (titles, 400/700), Alegreya (story text, 400/700/400 italic), Alegreya Sans (interface,
  400/500/700), self-hosted with `@fontsource/*`, latin subset only, `font-display: swap`.
- **Rationale**: Cinzel gives the engraved look; Alegreya and Alegreya Sans are designed together, very readable,
  and cover French accents. Self-hosting avoids a third-party request (constitution V, FR-002).
- **Alternatives considered**: Google Fonts CDN (third-party request, offline issue); a single serif for everything
  (interface labels less legible at small sizes).

## R2. Light and dark modes

- **Decision**: MUI theme with `colorSchemes: { light, dark }` and `cssVariables: { colorSchemeSelector: 'class' }`;
  `useColorScheme()` for the toggle (`light` / `dark` / `system`), MUI stores the choice in `localStorage`; default
  `system`.
- **Rationale**: built in, no flash of the wrong mode, no custom context needed (constitution VI).
- **Alternatives considered**: own `ColorModeContext` swapping two themes (more code, re-renders everything).

## R3. Property grid actions

- **Decision**: each property is a grid cell; its die and padlock are visible on `:hover` and `:focus-within`, always
  visible when locked, and always visible on devices without hover (`@media (hover: none)`).
- **Rationale**: removes visual repetition without hiding actions from keyboard or touch users (FR-005).

## R4. Story presentation

- **Decision**: the card shows the background title and the first paragraph in full, with a drop cap
  (`::first-letter`); a "Read the story" button opens a MUI `Dialog` (`fullScreen` below `sm`) with the full text,
  closed by Escape or a close button; focus returns to the button. No truncation by characters anymore.
- **Rationale**: clarification Q1; never cuts a word (SC-005).

## R5. Contrast

- **Decision**: a unit test computes WCAG contrast ratios for every text/background pair of the palette and every
  badge colour against its text colour, in both modes (≥ 4.5:1 for text, ≥ 3:1 for large text and icons).
  axe-core runs in the browser validation for the rendered pages.
- **Rationale**: SC-001 is checked in CI for the palette, and on real pages before merge.

## R6. Notifications

- **Decision**: `AlertManagerContext.addAlert` replaces the current alert (one at a time); `AlertManager` renders it in
  one `Snackbar` with auto-hide for success/info (5 s) and no auto-hide for warning/error; `Alert` role `status` or
  `alert` by severity.
- **Rationale**: FR-008 with the smallest change; callers are unchanged.

## R7. Race and class colours

- **Decision**: one map per mode in `src/themes/palette.ts` (light: deep tones with white text; dark: light tones with
  dark text), used by badges, history dots and saved-character summaries.
- **Rationale**: defined once (FR-004); legibility checked by R5.
