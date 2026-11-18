# Research: Property Locking

## R1. What a lock stores

- **Decision**: the lock state is the list of locked property names; the locked values are read from the current
  character when generating (`templateOf(character, locked)`). For persistence, the template (names + values) is
  saved, and the first character after load is drawn from it.
- **Rationale**: FR-003 says a die or loading a character updates the locked value; reading values from the current
  character gives that for free, with no synchronisation between two copies of the same value.
- **Alternatives considered**: storing values in the lock state and syncing on every character change (two sources
  of truth); persisting the whole current character (larger change, not asked for).

## R2. Compatible draws

- **Decision**: draw `(race, gender)` first among the pairs compatible with the locked age (lifespan), locked first
  name (first-name list of that race and gender contains it) and locked last name (last-name list of that race
  contains it). A name constraint that no pair satisfies is dropped (custom or AI name: any race/gender). Then draw
  the remaining properties within the chosen race and gender.
- **Rationale**: covers every case in US2 with one filter over 4 races × 3 genders; dropping unsatisfiable name
  constraints implements "any gender if no list contains it".
- **Alternatives considered**: retrying random draws until valid (unbounded, harder to test); constraining only
  gender (misses the age/race and last-name/race cases).

## R3. Locked epithet

- **Decision**: a locked epithet keeps the character's current epithet: its written text with language and source
  when there is one (AI or legacy), otherwise its `epithetId`.
- **Rationale**: the epithet is the only lockable property that can be content (id) or written text; both must
  survive generation and language switches.

## R4. Locks and the AI

- **Decision**: `generateCharacter(provider, signal, locale, template)`: the app draws the base from the template;
  the prompt lists locked names/epithet with the fixed facts and asks only for unlocked fields plus a background;
  validation only accepts unlocked fields; a fully locked name set means the AI writes only the background.
- **Rationale**: FR-007 and SC-005: locked values are kept whatever the AI answers, because they are never read from
  the answer.

## R5. Dice and other locks

- **Decision**: a die on property P draws P among values compatible with the other locked properties (race die with a
  locked age: races allowing that age, and the age is no longer clamped; gender die with a locked first name: genders
  whose list contains it). When no other value fits, the character is unchanged and an info alert says so.
- **Rationale**: clarification Q1 (dice still work, locks only affect Generate) while keeping US2's coherence.

## R6. Persistence

- **Decision**: `localStorage["locks"] = { version: 1, template }`, parsed with zod field by field; invalid fields
  (unknown race, out-of-range age, unknown epithet id) are dropped, not the whole object.
- **Rationale**: FR-009 ("invalid stored locks are ignored") without losing the valid ones.
