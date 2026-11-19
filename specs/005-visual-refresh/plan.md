# Implementation Plan: Visual Refresh

**Branch**: `claude/cool-keller-vpldvo` | **Date**: 2026-11-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-visual-refresh/spec.md`

## Summary

Give the app a heroic fantasy identity through one MUI theme with light and dark colour schemes (parchment and
candle-lit), self-hosted Cinzel / Alegreya / Alegreya Sans fonts, and race and class colours defined once. Rework the
character card (heading with name and epithet, race and class badges, compact property grid whose dice and padlocks
appear on hover/focus and stay visible when locked or on touch screens, small portrait on phone), present the
background as a story with a drop cap and a reading dialog, show a single notification at a time, and add a
light/dark/system toggle. No change to generation, locks, AI or storage of characters.

Mock-ups: [desktop light](./mockups/desktop-light.png), [desktop dark](./mockups/desktop-dark.png),
[phone light](./mockups/phone-light.png), [phone reading view, dark](./mockups/phone-dark-reading.png).

## Technical Context

**Language/Version**: TypeScript 6 (strict), React 19

**Primary Dependencies**: MUI 9 (theme `colorSchemes`, CSS variables, `useColorScheme`, `Dialog`, `Snackbar`, `Chip`);
new: `@fontsource/cinzel`, `@fontsource/alegreya`, `@fontsource/alegreya-sans` (self-hosted fonts, research R1)

**Storage**: colour mode stored by MUI's colour-scheme manager in `localStorage` (research R2)

**Testing**: Vitest + Testing Library (behaviour unchanged, new components tested); palette contrast unit test
(WCAG formula, research R5); axe-core and screenshots in the browser validation

**Target Platform**: evergreen browsers, static GitHub Pages site

**Project Type**: single-page web application, client-side only

**Performance Goals**: fonts limited to the latin subset and the weights used (~150 KB total, cached); no layout jump
(`font-display: swap` with metric-close fallbacks)

**Constraints**: WCAG AA in both modes; visible focus; reduced motion respected; 360 px without horizontal scroll;
existing behaviour tests keep passing (FR-010)

**Scale/Scope**: 1 theme, ~12 components restyled, 3 new components (CharacterHeader, StoryDialog, ColorModeToggle)

## Constitution Check

| Principle                    | Status         | How                                                                                     |
| ---------------------------- | -------------- | --------------------------------------------------------------------------------------- |
| I. Works Without AI          | Pass           | Visual only                                                                             |
| II. Content Is Data          | Pass           | No content change; colours and fonts live in the theme                                  |
| III. Everything Tested       | Pass (planned) | Component tests and stories for new components; contrast test; existing tests unchanged |
| IV. Validate External Inputs | Pass           | Stored colour mode read by MUI with a safe default (system)                             |
| V. Client-Side Only          | Pass           | Fonts shipped with the site, no third-party request                                     |
| VI. Keep It Simple           | Pass           | MUI theme and built-in colour scheme support, no CSS framework added                    |
| Bilingual UI                 | Pass           | New strings (read story, close, colour modes) in both locales                           |

**Post-design re-check**: Pass.

## Project Structure

### Documentation (this feature)

```text
specs/005-visual-refresh/
├── spec.md, plan.md, research.md, data-model.md, quickstart.md
├── contracts/ui.md
├── mockups/            # validated with the maintainer
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── themes/
│   ├── themes.ts            # fantasy theme: colorSchemes light/dark, typography, component overrides
│   ├── palette.ts           # palette tokens + race and class colours per mode
│   └── contrast.ts(+test)   # WCAG contrast ratio, used by the palette test
├── main.tsx                 # font imports (@fontsource)
├── components/
│   ├── App.tsx              # app bar and menu colours from the theme; ColorModeToggle in the menu
│   ├── character/
│   │   ├── characterHeader/        # new: name, epithet, race/class/gender badges
│   │   ├── characterInformation/   # property grid
│   │   ├── characterProperty/      # grid cell; actions on hover/focus, always on touch or when locked
│   │   ├── characterBackground/    # first paragraph + drop cap + "Read the story"
│   │   ├── storyDialog/            # new: reading view (full screen on phone)
│   │   ├── characterImage/         # small portrait on phone
│   │   └── character/              # layout of the card
│   ├── common/alert/AlertManager.tsx  # single notification
│   ├── common/colorModeToggle/        # new: light / dark / system
│   ├── history/*, characterSummary    # badges/dots with race and class colours
│   └── navigation/drawerMenu/         # theme colours, toggle at the bottom
├── contexts/AlertManagerContext.tsx   # a new alert replaces the current one
├── pages/settings/Settings.tsx        # colour mode select
└── data/locales/{en,fr}/ui.json       # new keys
```

**Structure Decision**: all colours, fonts and shapes in `src/themes`; components read them through the theme
(`sx` / `theme.vars`), never hard-coded colours.

## Complexity Tracking

No constitution violations to justify.
