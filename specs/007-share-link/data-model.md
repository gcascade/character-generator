# Data Model: Share Link

## Link

`<origin><BASE_URL>share#<kind><version>.<data>` — `kind` is `c` (character) or `p` (party), `version` is `1`,
`data` is base64url (no padding) of UTF-8 JSON.

## Character payload (v1)

| Index | Field     | Type / rule                                                                    |
| ----- | --------- | ------------------------------------------------------------------------------ |
| 0     | firstName | string, 1–40                                                                   |
| 1     | lastName  | string, 0–40                                                                   |
| 2     | race      | index in `CharacterRaces` (append-only)                                        |
| 3     | class     | index in `CharacterClasses`                                                    |
| 4     | gender    | index in `Genders`                                                             |
| 5     | alignment | index in `CharacterAlignments`                                                 |
| 6     | age       | integer 0–100000 (as stored characters)                                        |
| 7     | refs      | `[title, origin, training, turningPoint, goal, epithet]` short refs, 1–40 each |
| 8     | text?     | `[language, source, epithet?, title?, paragraphs?]` — written text, as stored  |

## Party payload (v1)

`[name, meeting, goal, mode (0 harmonious / 1 anything), constraints [race?, class?, gender?, alignment?] (−1 = any),
members (2–6 character payloads), text? [language, name, paragraphs]]`.

## Rebuilt values

A decoded character has no `id` and is shown read-only until saved. Party ids are not shared: a decoded party gets a
fresh id, members get fresh ids and are unlocked; "already saved" is detected by comparing the members' content.
