# Data Model: AI Portraits

## PortraitSubject (input of the prompt)

`{ race, gender, age, characterClass? , occupation?, lookId? }` — built from a character or NPC; never names.

## PortraitTraits

`{ race, gender, ageBand: 'young' | 'adult' | 'middle-aged' | 'elderly', role: <class or occupation> }`.

## StoredPortrait (`localStorage["portraits"]`)

| Field     | Type           | Rule                                         |
| --------- | -------------- | -------------------------------------------- |
| image     | string         | `data:image/webp;base64,…` or jpeg, ≤ 200 KB |
| traits    | PortraitTraits | traits at painting time                      |
| service   | `'horde'`      | who painted it                               |
| paintedAt | string         | ISO date                                     |

Store: `{ version: 1, portraits: Record<string, StoredPortrait> }`; ids from `crypto.randomUUID()`.

## References

- `Character.portraitId?: string`, `Npc.portraitId?: string` (stored schemas accept it; share links drop it).

## PaintingState (hook)

`idle → submitting → queued (position, waitSeconds) → done | failed (reason) | cancelled | timedOut`.

## Default portrait manifest

`portraitFiles.json`: sorted array of paths relative to `public/images/`.
