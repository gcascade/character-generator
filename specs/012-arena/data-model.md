# Data Model: Arena

All types in `src/types/arena.ts`. Enumerations of ids come from data (`arena.json`), not from TypeScript enums, so
perks, items and events grow with data only.

## Skill

`'melee' | 'ranged' | 'magic' | 'athletics' | 'stealth' | 'endurance' | 'perception' | 'survival' | 'lore' |
'healing' | 'persuasion' | 'intimidation' | 'deception'` — grouped in families `combat`, `physical`, `mind`, `social`.

Thirteen skills (the spec's list), grouped 3 + 3 + 4 + 3.

## Skills

| Field  | Type                    | Rules                      |
| ------ | ----------------------- | -------------------------- |
| values | `Record<Skill, number>` | integers, 5–95 when rolled |
| hp     | number                  | 20–40                      |

Derived from character (class, race, age band) and a random stream (research R2). Never stored on a character.

## Perk / Item (data)

| Field   | Type                                                 | Notes                                                                  |
| ------- | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| id      | string                                               | `perk-survivalist`, `item-sword`                                       |
| bonuses | `Partial<Record<Skill, number>>`                     | added to checks of that skill                                          |
| hp      | number?                                              | extra hit points                                                       |
| tags    | string[]                                             | used by event conditions (`reroll`, `ranged-weapon`, `heal`, `light`…) |
| kind    | `weapon \| tool \| protection \| consumable` (items) | consumables are removed when used                                      |
| damage  | number? (weapons)                                    | 2–8                                                                    |

Texts: `perks.<id>.name/description`, `items.<id>.name/the/description` per locale.

## Contestant (setup)

| Field     | Type        | Rules                                           |
| --------- | ----------- | ----------------------------------------------- |
| id        | string      | unique in the roster (`crypto.randomUUID()`)    |
| character | `Character` | snapshot, validated like stored characters      |
| sideId    | string      | a team id or the contestant id when solo        |
| role      | RoleId?     | the member's party role (teams only)            |
| perks     | string[]    | 0–2 distinct known perk ids                     |
| items     | string[]    | 0–3 known item ids                              |
| sourceId  | string?     | saved character id, to avoid enrolling it twice |

## Side

| Field | Type           | Notes                                          |
| ----- | -------------- | ---------------------------------------------- |
| id    | string         |                                                |
| kind  | `team \| solo` |                                                |
| name  | string?        | the party's rendered name at enrolment (teams) |
| ties  | `Tie[]`        | the party's ties, with contestant ids          |

Validation: ≥ 2 sides; ≤ 48 contestants; a team has 2–6 members.

## ArenaSetup (stored)

`localStorage["arena"]` = `{ version: 1, contestants: Contestant[], sides: Side[], seed: string, shownRounds: number }`

## Match (computed by `simulate(setup)`, never stored)

| Entity      | Fields                                                                                                                  |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| Fighter     | contestant id, skills, hp, maxHp, items, perks, sideId, allianceId?, standing, defeatedRound?, defeatedBy?              |
| EventResult | eventId, outcome (`success` \| `failure` \| `only`), actors (ids, in text order), itemId?, defeated ids, notable (bool) |
| Round       | number, phase (`day` \| `night`), events: EventResult[]                                                                 |
| Match       | rounds, winnerSideId, fighters (final state), defeats count per contestant, notable moments (≤ 5)                       |

State transitions of a fighter: `standing` → (`wounded` when hp ≤ maxHp / 2) → `defeated`; heals can bring
`wounded` back to `standing`. Side changes: team → solo (split), solo → alliance → solo (betrayal or end).

## Event kind (data)

| Field    | Type                                                         | Notes                                                                |
| -------- | ------------------------------------------------------------ | -------------------------------------------------------------------- |
| id       | string                                                       | `event-find-sword`, `event-duel`, `event-betray`                     |
| phase    | `day \| night \| any`                                        |                                                                      |
| actors   | 1–3                                                          |                                                                      |
| relation | `same-side \| other-side \| any`                             | between actor a and the others                                       |
| when     | conditions                                                   | alignment, perk, item tag, wounded, tie type, role, minRound, finale |
| check    | `{ actor, skill, modifier } \| { opposed: [skill, skill] }`? |                                                                      |
| outcomes | `{ success?, failure?, only? }` → effects                    | damage, heal, defeat, give/take/lose/find item, ally, betray, split  |
| weight   | number                                                       | deadly events gain weight with rounds                                |
| notable  | boolean?                                                     | goes to the summary when it happens                                  |

Texts: `events.<id>.<outcome>` per locale, with `{a}`, `{b}`, `{c}`, `{item}`, `{theItem}`, `{team}` and
`{{a:…|…|…}}` selections.
