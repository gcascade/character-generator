# Research: Saved Character Details

## R1. Identifiers

- **Decision**: `id` is a `crypto.randomUUID()` string, optional on `Character`; `saveCharacter` stores
  `{ ...character, id: newId }` and returns it; on load, entries without a valid id get one and the list is saved
  back by the existing effect. Duplicate ids in storage (hand-edited data) get a new id.
- **Rationale**: FR-001/FR-002 with no change for characters that are not saved.

## R2. "Saved" state on the home page

- **Decision**: after saving, the current character becomes the saved copy (same `id`), and `isSaved` compares ids.
  Every new character produced by generate, reroll or translate on the home page is stored without `id` (dropped in
  `useCharacterGenerator`), so a rerolled character is never mistaken for the saved one.
- **Rationale**: keeps today's behaviour (Save disabled once saved) without reference equality.
- **Alternatives considered**: comparing content (two identical-looking characters would collide, SC-004).

## R3. Detail as a page

- **Decision**: route `/characters/:id` rendering `CharacterDetails`; unknown id → not-found message with a link to
  "My characters". GitHub Pages deep links already work through `404.html`.
- **Rationale**: spec assumption (address, reload, back/forward).

## R4. Back to the same carousel page

- **Decision**: `Carousel` accepts `page` / `onPageChange` (controlled, optional); `Characters` keeps the page in the
  router location state when opening a detail, and the detail's "Back" navigates to `/characters` with that state
  (browser back restores it too, since the state is on the list entry via `replace`).
- **Rationale**: US1 scenario 2 without global state.

## R5. Translate a saved character

- **Decision**: `useCharacterRequest().translateCharacter(options)` gains an optional `character` and `onTranslated`
  callback; the detail page passes the saved character and `updateCharacter`. The current home character is untouched.
- **Rationale**: reuses the AI flow and its alerts (FR-006) without a second request hook.

## R6. Read-only properties

- **Decision**: a small `PropertyList` (label above value, same typography as the generator grid, 2–3 columns,
  1 on phones) instead of `CharacterProperty` with hidden actions.
- **Rationale**: no dead buttons in a read-only view; reusable by party member details.
