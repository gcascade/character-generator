# Data Model: Property Locking

## LockableProperty

`'firstName' | 'lastName' | 'epithet' | 'race' | 'characterClass' | 'gender' | 'age' | 'alignment'`

## CharacterTemplate

Partial values a generation must keep. A key present = that property is locked.

| Field                                           | Type                                                                               | Rule                                                                               |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `race`, `characterClass`, `gender`, `alignment` | domain enums                                                                       | must be a known value                                                              |
| `age`                                           | integer                                                                            | 15 ≤ age ≤ max lifespan of any race; within the race's lifespan when `race` is set |
| `firstName`, `lastName`                         | string (1–40)                                                                      | any text (AI names allowed)                                                        |
| `epithet`                                       | `{ id: string }` or `{ text: string; language: Locale; source: 'ai' \| 'legacy' }` | `id` must exist in epithets                                                        |

## Lock state (React)

`locked: LockableProperty[]`; derived `template = templateOf(character, locked)`.

Transitions:

- toggle P → P added or removed;
- unlock all → `[]`;
- generate → `character = generateRandomCharacter(template)` (or the AI variant); `locked` unchanged;
- die on P → P rerolled within the other locks; `locked` unchanged (the lock on P now holds the new value);
- load a character from history → locked values now read from it.

## Stored locks

`localStorage["locks"]`: `{ version: 1, template: CharacterTemplate }`, written whenever the lock state or the current
character changes; read once at start-up. Invalid fields are dropped individually.
