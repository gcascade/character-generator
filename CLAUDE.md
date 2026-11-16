# CLAUDE.md

Fantasy character generator (race, class, gender, alignment, age, names, background, portrait).
Personal learning project for React + TypeScript, deployed to GitHub Pages:
https://gcascade.github.io/character-generator

The maintainer communicates in French; code, comments, commits and app content are in English.

## Commands

```bash
npm start              # dev server
npm test               # Jest (watch mode locally; use CI=true for a single run)
npx tsc --noEmit       # type check (not run in CI yet)
npm run lint           # ESLint with --fix
npm run prettier       # format everything
npm run storybook      # Storybook on :6006
```

Before considering a change done: tests pass, `tsc --noEmit` is clean, lint is clean.

## Stack

- React 18, TypeScript (strict), MUI 5, React Router 6, react-hook-form.
- Build: an **ejected Create React App** (`config/`, `scripts/`). Planned migration to Vite + Vitest;
  do not invest in the webpack config.
- Optional AI generation: Ollama (via `@langchain/community`) or Azure / GitHub Models
  (via `@azure-rest/ai-inference`). Without AI, everything comes from the static data in `src/data/`.

## Layout

```
src/
  components/<area>/<component>/   Component.tsx + .test.tsx + .stories.tsx (+ .css)
  pages/                           Home (generator), Characters (saved), Settings
  contexts/                        One React context per concern (character, history, settings, ...)
  hooks/                           Hooks wrapping contexts and AI providers; __mocks__/ for Jest
  utils/character.ts               Random generation from static data
  utils/prompt.ts                  LLM prompts and JSON schema
  data/                            backgrounds.json (templated with {{firstName}} etc.), characterNames.json
  types/                           Domain types; enums are `as const` objects + derived union types
test/                              Shared Storybook/test decorators and stubs
public/images/<race>/<class>/<gender>1.png   Portraits
```

Path aliases (`tsconfig.json` + Jest `moduleNameMapper`): `@Components/*`, `@Contexts/*`, `@Types/*`, `@Test/*`.

## Conventions

- Function components with `FC<Props>`; each context-consuming hook throws if its provider is missing.
- Every component gets a test (Testing Library) and a story. Tests use the decorators in `test/decorators/`.
- Persistence is `localStorage` only (no backend).
- Domain enums: add the value to the `as const` object in `src/types/character.ts`; the union type follows.

## Known issues (from the November 2026 review)

- Rerolling a property with no AI configured throws (`useCharacterGenerator`, missing `'none'` case).
- With AI, rerolling any property regenerates the background; Azure may also overwrite names.
- Settings defaults are overwritten by empty strings on first load (`useSettings`).
- Deploy workflow runs even when tests fail, and twice per push.
- Characters are compared by reference (no `id`); LLM responses are not validated.
- Some backgrounds use `Non-Binary` while the code expects `Non-binary`, so they never match.

## Direction

- Rich content without AI is a goal: static content (backgrounds, names, epithets) is meant to grow,
  likely as composable fragments (origin by race, training by class, turning point by alignment)
  with pronoun placeholders instead of one copy per gender.
- When a property is rerolled with AI enabled, the background is rewritten to stay coherent.
- New features are specified with Spec Kit before implementation (see below).

## Spec-driven development (Spec Kit)

Spec Kit is initialized in `.specify/`, with skills in `.claude/skills/speckit-*`.
Workflow per feature: `/speckit-specify` → `/speckit-clarify` (optional) → `/speckit-plan` →
`/speckit-tasks` → `/speckit-implement`. Project principles live in `.specify/memory/constitution.md`.
Use it for features; small bug fixes and tooling chores don't need a spec.
