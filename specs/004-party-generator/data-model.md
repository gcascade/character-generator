# Data Model: Party Generator

## PartyConstraints

`CharacterTemplate` restricted to `race`, `characterClass`, `gender`, `alignment` (each optional = "Any").

## AlignmentMode

`'harmonious' | 'anything'` (default `'harmonious'`).

## PartyMember

| Field       | Type      | Rule                           |
| ----------- | --------- | ------------------------------ |
| `id`        | string    | unique in the party            |
| `character` | Character | valid as everywhere in the app |
| `locked`    | boolean   | kept on regeneration           |

## Party

| Field           | Type                                                        | Rule                                       |
| --------------- | ----------------------------------------------------------- | ------------------------------------------ |
| `id`            | string                                                      | unique among saved parties                 |
| `members`       | PartyMember[]                                               | 2–6, unique first names                    |
| `constraints`   | PartyConstraints                                            |                                            |
| `alignmentMode` | AlignmentMode                                               |                                            |
| `content`       | `{ nameId, meetingId, goalId }`                             | ids exist in `party.json`                  |
| `text`          | `{ name, story: string[], language: Locale, source: 'ai' }` | optional; overrides `content` when present |

Rendered party: `{ name, story: [meeting, goal] | text.story, writtenIn?, writtenBy? }` per locale.

## Storage

- `localStorage["party"]`: `{ version: 1, party }` — the current party; invalid → no party (the page shows the
  controls only).
- `localStorage["parties"]`: `{ version: 1, parties: Party[] }` — invalid entries dropped individually.

Transitions: generate → new party (locked members kept, `text` dropped); reroll member → that member replaced, party
`content` kept, `text` dropped; lock/unlock → `locked` toggled; save party → copy appended to `parties` with a new id;
open a saved party → becomes the current party; delete → removed from `parties`.
