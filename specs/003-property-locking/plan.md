# Implementation Plan: Property Locking

**Branch**: `claude/cool-keller-vpldvo` | **Date**: 2026-11-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-property-locking/spec.md`

## Summary

Add a padlock next to each property of the home card. The set of locked properties, read against the current
character, forms a `CharacterTemplate`; Generate draws a new character from that template, choosing unlocked values
among those compatible with the locked ones (lifespan, name lists). The AI receives locked values as fixed facts and
its answers for them are ignored. Dice keep rerolling a property even when locked, but respect the other locked
properties. Locked property names and their values are saved in `localStorage`, and the first character after a
reload is drawn from the saved template.

## Technical Context

**Language/Version**: TypeScript 6 (strict), React 19

**Primary Dependencies**: MUI 9 (icons `Lock`, `LockOpen`), zod 4; no new dependency

**Storage**: `localStorage["locks"]` (`{ version: 1, template }`), validated with zod

**Testing**: Vitest + Testing Library; property-style tests drawing 1,000 characters per lock combination (SC-001)

**Target Platform**: evergreen browsers, static GitHub Pages site

**Project Type**: single-page web application, client-side only

**Performance Goals**: generation stays instant without AI (drawing among compatible values is a filter over a few
dozen entries)

**Constraints**: keyboard and screen-reader usable toggles (`aria-pressed`); EN + FR labels; phone layout unchanged
in width (padlock next to the die)

**Scale/Scope**: 8 lockable properties, one new context, ~10 UI strings × 2

## Constitution Check

| Principle                    | Status         | How                                                                                            |
| ---------------------------- | -------------- | ---------------------------------------------------------------------------------------------- |
| I. Works Without AI          | Pass           | Locks are applied by the app's own generation; AI only receives them as fixed facts            |
| II. Content Is Data          | Pass           | Compatibility comes from the existing data (name lists, lifespans); no new content             |
| III. Everything Tested       | Pass (planned) | Template generation tests per lock combination, reroll tests, AI tests, component tests        |
| IV. Validate External Inputs | Pass           | Stored locks validated with zod; unknown values dropped (FR-009); AI answers already validated |
| V. Client-Side Only          | Pass           | `localStorage` only                                                                            |
| VI. Keep It Simple           | Pass           | Locks are a list of property names; values are read from the current character (R1)            |
| Bilingual UI                 | Pass           | New strings in `ui.json` for both locales                                                      |

**Post-design re-check**: Pass.

## Project Structure

### Documentation (this feature)

```text
specs/003-property-locking/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── locking.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── content/
│   ├── template.ts           # new: CharacterTemplate, LockableProperty, templateOf, compatible draws
│   ├── generate.ts           # generateRandomCharacter(template) honours every field and compatibility;
│   │                         # rerollWithApp(character, property, locked) respects the other locks
│   └── storedLocks.ts        # new: zod schema for localStorage["locks"]
├── contexts/LockContext.tsx  # new: locked properties, toggle, unlockAll, template, persistence
├── hooks/useLocks.ts         # new: reads LockContext (throws without provider)
├── hooks/useCharacterRequest.ts  # generate from the template; "nothing else fits" alert for dice
├── ai/generate.ts, prompts.ts    # template-aware generateCharacter; locked fields fixed in the prompt
├── components/character/
│   ├── characterProperty/    # padlock toggle next to the die
│   └── characterInformation/ # wires locks, "Unlock all"
├── components/App.tsx        # initial character drawn from the stored template; LockProvider
└── data/locales/{en,fr}/ui.json  # lock labels, unlock all, nothing-else-fits message
```

**Structure Decision**: the template logic lives in the framework-free `src/content` module so the later party
generator can reuse it; React only holds which properties are locked.

## Complexity Tracking

No constitution violations to justify.
