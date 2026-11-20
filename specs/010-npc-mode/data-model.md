# Data Model: NPC Mode

## Occupation (`Occupations`, append-only)

Blacksmith, Innkeeper, Farmer, Beggar, Priest, Merchant, Guard, Fisher, Healer, Scribe, Hunter, Miller, Baker,
Tailor, Stablehand, Minstrel, Sailor, Noble, Alchemist, Gravedigger.

Data (`npc.json`): `{ id: Occupation, minAge: number, icon: string }`. Label `occupation.<Value>` (FR gendered:
`{{Forgeron|Forgeronne|Forgeron}}`…).

## NpcSection

`look | daily | quirk | rumour | secret | opinion`. Fragment `{ id, section, occupation? }`; `daily` fragments
have an occupation (≥ 3 each), the others none (≥ 20 each).

## Npc

| Field      | Type                       | Notes                                            |
| ---------- | -------------------------- | ------------------------------------------------ |
| id         | string?                    | set when saved                                   |
| firstName  | string                     | from race + gender list                          |
| lastName   | string                     | from race list                                   |
| race       | CharacterRace              |                                                  |
| gender     | Gender                     |                                                  |
| age        | number                     | `max(15, minAge)` … `MAX_AGE[race]`              |
| occupation | Occupation                 |                                                  |
| content    | Record<NpcSection, string> | fragment ids (`lookId`… as `look`, `daily`…)     |
| text       | NpcText?                   | AI-written sheet; overrides content when present |

`NpcText = { language: Locale; source: 'ai'; look; daily; quirk; rumour; secret; opinion }` (strings).

`NpcTemplate = Partial<Pick<Npc, 'firstName' | 'lastName' | 'race' | 'gender' | 'age' | 'occupation'>>`.

## Rendered sheet

`renderNpc(npc, locale) → { look, daily, quirk, rumour, secret, opinion, writtenIn?: Locale }`.

## Stored state

- `npc`: `{ version: 1, current?: Npc, batch: Npc[] (≤ 5), locked: LockableNpcProperty[] }`
- `npcs`: `{ version: 1, npcs: Npc[] }`
