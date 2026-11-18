# Contract: Locking (src/content, contexts, AI)

## src/content/template.ts

- `LOCKABLE_PROPERTIES: readonly LockableProperty[]`
- `templateOf(character, locked): CharacterTemplate` — values of the locked properties (epithet as text or id, R3).
- `compatibleRaceGenders(template): { race; gender }[]` — pairs allowed by locked race, gender, age and names (R2).

## src/content/generate.ts

- `generateRandomCharacter(template?: CharacterTemplate): Character` — keeps every template value exactly; unlocked
  values drawn within compatible pairs; content drawn for the final race, class and alignment (a new paragraph each
  time, clarification Q2).
- `rerollWithApp(character, property, locked?: LockableProperty[]): Character` — rerolls `property` within the
  other locks (R5); returns the same object when nothing else fits.

## src/content/storedLocks.ts

- `parseStoredLocks(raw: string | null): CharacterTemplate` — drops invalid fields, never throws.

## src/contexts/LockContext.tsx, src/hooks/useLocks.ts

- `LockProvider({ initialLocked, children })`; `useLocks(): { locked, isLocked(p), toggle(p), unlockAll() }`.
- Saves `{ version: 1, template }` on change.

## src/ai

- `generateCharacter(provider, signal, locale, template = {})` — base from the template; prompt fixes locked fields;
  only unlocked name fields are read from the answer.
- `rerollProperty(provider, character, property, signal, locale, locked = [])` — the app part uses `rerollWithApp`
  with `locked`.

## UI

- `CharacterProperty` props: `locked?: boolean`, `onToggleLock?: VoidFunction`, `lockLabel?: string`; renders an
  `IconButton` with `aria-pressed={locked}` and a `Lock` / `LockOpen` icon.
- ui keys: `lock.<property>` ("Lock race" / "Verrouiller la race"), `unlock.<property>`, `lock.unlockAll`,
  `reroll.nothingElseFits`.
