# Contracts: Arena

Pure functions in `src/content/`; the UI only calls these and renders their results.

## random.ts

```ts
createRandom(seed: string): Random     // deterministic sfc32 stream from any string
newSeed(): string                      // 8 base36 characters
Random = { next(): number /* [0,1) */; int(n): number; pick<T>(list): T; shuffle<T>(list): T[]; roll(): number /* 1–100 */ }
```

Same seed → same sequence on every browser.

## skills.ts

```ts
rollSkills(character: Character, random: Random): Skills    // research R2, values 5–95
check(value: number, modifier: number, random: Random): { roll: number; success: boolean }
                                                            // success when roll ≤ clamp(value + modifier, 5, 95)
SKILLS: readonly Skill[]; SKILL_FAMILIES: Record<Family, Skill[]>
```

## arena.ts

```ts
MAX_CONTESTANTS = 48
canStart(setup: ArenaSetup): { ok: true } | { ok: false; reason: 'too-few-sides' | 'too-many' }
addCharacter(setup, character, sourceId?): ArenaSetup       // ignored when sourceId already enrolled
addParty(setup, party, locale): ArenaSetup                  // one team, members' roles and ties kept
addRandom(setup, count): ArenaSetup                          // generateRandomCharacter() solos, up to the cap
removeContestant(setup, id): ArenaSetup                      // a team of 1 becomes solo
setPerks(setup, id, perkIds) / setItems(setup, id, itemIds): ArenaSetup   // limits 2 and 3, known ids only
randomLoadouts(setup, random): ArenaSetup
contestantSkills(setup, id): Skills                          // createRandom(`${seed}:skills:${id}`)
simulate(setup: ArenaSetup): Match                           // createRandom(`${seed}:match`); pure, < 100 ms for 48
```

Invariants checked over 1,000 seeded matches (SC-003):

- `match.winnerSideId` is set and exactly one side has standing fighters at the end;
- `match.rounds.length` ≤ round limit (research R6);
- no event has a defeat caused by a teammate while the team holds, nor a betrayal by a good character;
- every living fighter appears in exactly one event per round.

## arenaText.ts

```ts
renderEvent(result: EventResult, match: Match, setup: ArenaSetup, locale: Locale): string
renderRoundTitle(round: Round, locale: Locale): string         // "Day 1", "Nuit 2"
renderSummary(match, setup, locale): { winner: string; lines: string[]; moments: string[] }
```

Placeholders `{a}`, `{b}`, `{c}` (first names), `{item}`, `{theItem}`, `{team}`; selections `{{a:m|f|n}}`.

## share.ts

```ts
encodeArena(setup: ArenaSetup): Promise<string>                // deflate-raw + base64url, prefix added by arenaUrl
decodeArena(data: string): Promise<ArenaSetup | undefined>     // zod-validated; unknown perk/item ids dropped
arenaUrl(setup): Promise<string>                               // `${base}arena#a1.${data}`
```

## UI

- Route `/arena`: setup view (roster builder, contestant cards with skills, perks and items) and match view (rounds
  shown up to `shownRounds`, "Next round", "Skip to the end", summary, "Replay", "Play again", "Share").
- Opening `/arena#a1.…` shows the shared match read-only with "Use this roster", which replaces the local setup
  after a confirmation.
- Navigation: an "Arena" / "Arène" entry next to Party and Side characters.
