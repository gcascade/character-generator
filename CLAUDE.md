# CLAUDE.md

Fantasy character generator (race, class, gender, alignment, age, names, background, portrait).
Personal learning project for React + TypeScript, deployed to GitHub Pages:
https://gcascade.github.io/character-generator

The maintainer communicates in French; code, comments, commits and app content are in English.

## Commands

```bash
npm start              # Vite dev server (http://localhost:5173/character-generator/)
npm test               # Vitest in watch mode
npm run test:run       # Vitest single run
npm run typecheck      # tsc --noEmit (includes tests and stories)
npm run build          # production build to dist/
npm run lint           # ESLint (flat config in eslint.config.js); lint:fix to auto-fix
npm run prettier       # format everything
npm run storybook      # Storybook on :6006
```

Before considering a change done: tests pass, `npm run typecheck` is clean, lint is clean.

## Stack

- React 19, TypeScript 6 (strict; TS 7 waits for typescript-eslint support), MUI 9, React Router 8 (`react-router`, basename = Vite base), Storybook 10.
- Build: Vite (`vite.config.ts`, base `/character-generator/` for GitHub Pages); tests: Vitest + jsdom
  - Testing Library, configured in the same file. Storybook uses the Vite builder.
- Use `import.meta.env.BASE_URL` for public assets, never absolute `/images/...` paths.
- Import MUI icons as named imports from `@mui/icons-material` (default imports of
  `@mui/icons-material/X` break under Vite's CJS interop).
- Optional AI generation lives in `src/ai/` (framework-free, see its README): providers "Ollama",
  "OpenAI-compatible" (both through one `fetch` adapter) and "Claude" (official `@anthropic-ai/sdk`, browser mode).
  zod validates AI answers, stored settings and stored characters. Without AI, everything comes from `src/data/`.
- Bilingual (en, fr) with an in-house i18n in `src/i18n/` (`LocaleProvider`, `useT`, `useLocale`); no i18n library.

## CI / deploy

`.github/workflows/ci.yml`: lint, typecheck, tests, build and Storybook build on every push and PR. Pushes to
`master` then deploy `dist/` to the `gh-pages` branch (with `404.html` = `index.html` for deep links).

## Layout

```
src/
  components/<area>/<component>/   Component.tsx + .test.tsx + .stories.tsx (+ .css)
  pages/                           Home (generator), Party, Characters (saved + parties tab), CharacterDetails, Share, Settings
  contexts/                        One React context per concern (character, history, settings, ...)
  ai/                              AI provider layer: adapters, validation, prompts, outcome messages, storage
  hooks/                           Hooks wrapping contexts; __mocks__/useSettings ("No AI") used by vi.mock
  i18n/                            Locale detection, LocaleProvider, useT / useLocale
  content/                         renderText (gendered text), generate (random characters, rerolls),
                                   character (renderCharacter per locale), labels, storedCharacter (zod),
                                   template (CharacterTemplate, locks, compatible race/gender), storedLocks,
                                   party (party rules, renderParty), storedParty, share (share links)
  data/content/                    Fragment and epithet ids, name lists per race (language-independent)
  data/locales/<locale>/           ui.json, labels.json, and one text file per fragment category
  themes/                          MUI theme (light/dark colour schemes), palette + race/class colours, fonts, contrast
  types/                           Domain types; enums are `as const` objects + derived union types
test/                              Shared Storybook/test decorators and stubs
public/images/<race>/<class>/<gender>1.png   Portraits
```

Path aliases (`tsconfig.json` + `vite.config.ts`, keep both in sync): `@Components/*`, `@Contexts/*`, `@Types/*`, `@Test/*`, `@Ai/*`, `@Content/*`, `@I18n/*`.

## Conventions

- Function components with `FC<Props>`; each context-consuming hook throws if its provider is missing.
- Every component gets a test (Testing Library) and a story. Tests use the decorators in `test/decorators/`.
- Persistence is `localStorage` only (no backend), loaded once in the provider with a lazy
  `useState` initializer and saved in an effect; hooks like `useSettings` only read the context.
- Domain enums: add the value at the end of the `as const` object in `src/types/character.ts` (share links use their
  indexes); the union type follows.

## Saved characters (spec 006)

- Saved characters have an `id` (`crypto.randomUUID()`), given on save and on load for older data (`withIds`);
  `DataContext` saves, deletes, updates and finds by id. The generator's current character becomes the saved copy
  after saving; generate/reroll/translate drop the id, so `isSaved` compares ids.
- `CharacterDetail` is a read-only view whose actions are optional props (reused for party members).
- History entries are still compared by reference.

## Party (spec 004)

- `src/content/party.ts` holds the rules (class variety, alignment modes, unique first names, locked members) as pure
  functions; `checkParty` lists violations and is used by the 1,000-party tests.
- Party texts (`src/data/locales/<locale>/party.json`) use `{members}`, `{first}`, `{count}` and keep "the company" /
  "la compagnie" as the subject: no gender selection, no agreement with members.
- `PartyProvider` stores the current party in `localStorage["party"]` and saved parties in `localStorage["parties"]`
  (`{ version: 1, ... }`, parsed by `storedParty.ts`). A rerolled party gets a new id, so it is no longer "saved".
- With AI, `generatePartyStory` writes the name and story only (`usePartyGenerator`).

## Share links (spec 007)

- `<app>/share#c1.<data>` (character) or `#p1.<data>` (party); `data` is base64url JSON of a positional array
  (`specs/007-share-link/data-model.md`), decoded and validated by `src/content/share.ts` before display.
- Enum values are shared as indexes: keep the `as const` objects of `src/types/character.ts` append-only.
- Fragment references are shared as short slugs; a slug that no longer exists is replaced by a fragment of the same
  kind. A new link format gets a new version prefix (`c2.`), and old prefixes keep being read.

## Content and languages

- Characters store fragment ids (`content`); `renderCharacter(character, locale)` turns them into text. Written
  text (AI, or legacy characters) is stored with `textLanguage`/`textSource` and overrides fragments.
- Texts use `{firstName}`-style placeholders and `{{masculine|feminine|non-binary}}` selections. Every text exists
  in every locale with the same placeholders; `src/data/content.test.ts` enforces it.
- French: neutral phrasing for non-binary characters (no "iel", no point médian); narrow no-break space (U+202F)
  before `: ; ! ?` and inside « »; never put `{firstName}` after an elidable word (de, que, le…).
- Interface strings go through `useT()` with keys from `src/data/locales/en/ui.json`; never hard-code UI text.

## Theme (spec 005)

- Colours only come from the theme (`src/themes/palette.ts`): use `sx` tokens such as `text.secondary`,
  `race.Elf` or `characterClass.Mage`, never hex values or `theme.palette.*` (CSS variables carry the dark mode).
- `src/themes/palette.test.ts` checks WCAG AA contrast for every token and badge in both modes; keep it green.
- Fonts are self-hosted with `@fontsource` (latin subsets, imported in `src/themes/fonts.ts`).
- Colour mode (light / dark / system) is MUI's `useColorScheme`, stored by MUI (`mui-mode`).
- One notification at a time (`AlertManagerContext`); warnings and errors stay until closed or replaced.

## Locks (spec 003)

- `LockProvider` (inside `CharacterProvider`) holds which properties are locked; values are read from the current
  character with `templateOf`. Generation goes through `generateRandomCharacter(template)`; dice through
  `rerollWithApp(character, property, locked)`, which returns the same object when nothing else fits.
- Saved in `localStorage["locks"]` as `{ version: 1, template }`, parsed field by field by `parseStoredLocks`.

## Direction

- Content without AI should keep growing: more fragments, names and epithets, in both languages.
- New features are specified with Spec Kit before implementation (see below).

## Spec-driven development (Spec Kit)

Spec Kit is initialized in `.specify/`, with skills in `.claude/skills/speckit-*`.
Workflow per feature: `/speckit-specify` → `/speckit-clarify` (optional) → `/speckit-plan` →
`/speckit-tasks` → `/speckit-implement`. Project principles live in `.specify/memory/constitution.md`.
Use it for features; small bug fixes and tooling chores don't need a spec.
