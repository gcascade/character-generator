# Research: Arena

## R1. Seeded randomness

- **Decision**: a string seed (8 base36 characters from `crypto.getRandomValues`) hashed with cyrb128 into the state of
  an sfc32 generator, written in `src/content/random.ts` (`createRandom(seed)` → `{ next(), int(n), pick(list),
shuffle(list), roll() }`). Each use gets its own stream: `createRandom(`${seed}:skills:${contestantId}`)`,
  `createRandom(`${seed}:match`)`.
- **Rationale**: same results on every browser (32-bit integer arithmetic), no dependency, a few lines. Separate streams
  mean adding a contestant does not change the skills of the others.
- **Alternatives**: `Math.random` (not replayable); a PRNG library (unneeded dependency); storing the whole match
  (big storage and links, and language-dependent if stored as text).

## R2. Skills

- **Decision**: thirteen skills. Base profile per class in `arena.json` (each class has 3 signature skills around 60–70,
  average ones around 40, weak ones around 20–25); race modifiers from −10 to +10 on a few skills (Orc +10 intimidation,
  Halfling +10 stealth, Elf +5 perception and magic, Dwarf +10 endurance, Gnome +10 lore, Dark elf +5 stealth and
  deception, Ashborn +5 intimidation and magic, Half-elf +5 persuasion, Human +3 everywhere it fits a generalist);
  age band (reusing `ageBand` of spec 011): young −5 lore/healing, +5 athletics; middle-aged +5 lore/survival,
  −5 athletics; elderly +10 lore/healing, −10 athletics/endurance; then a random part from −8 to +8 per skill; clamped
  to 5–95. Hit points = 20 + Endurance / 5 + class bonus (Barbarian/Warrior +6, Paladin/Ranger +4, others +0–2).
- **Rationale**: readable percentages (the maintainer's d100 idea), visible class identity (SC-001), small but felt
  race and age effects, randomness without upsetting the profile.
- **Alternatives**: D&D attributes and modifiers (less readable, rejected by the maintainer); skills stored on
  characters (rejected in clarification).

## R3. Checks and fights

- **Decision**: `check(skill, modifier, rng)` rolls 1–100 and succeeds when the roll ≤ clamp(skill + modifier, 5, 95).
  Fights are short exchanges: the attacker uses the best of Melee / Ranged (needs a ranged weapon) / Magic (needs a
  caster class or a wand); defender opposes with Athletics or the same skill; a hit deals weapon damage (2–8) plus
  a bonus on a roll ≤ skill / 5 (critical); a contestant at 0 HP is defeated; a wounded contestant (≤ half HP) gets
  −10 to physical checks. Fleeing is a Stealth or Athletics check.
- **Rationale**: one simple rule for every check; fights end in a few exchanges, which keeps the text short.
- **Alternatives**: simultaneous initiative and turns (too long to tell), pure dice-free outcomes (stats meaningless).

## R4. Event engine

- **Decision**: events are data. Each event kind has an id, a phase (`day`, `night`, `any`), a size (1–3 actors, 1 for
  solo events), conditions (alive, same side or different sides, alignment, perk, item, wounded, tie type, role, round
  ≥ n), an optional check (actor skill and modifier, or opposed skills), outcomes (`success`, `failure`, or single)
  with effects (damage, heal, defeat, give/take/lose/find item, form/break alliance, leave team) and a weight. Each
  round: shuffle the living contestants (teams kept together when they act as a team), then repeatedly take the next
  actor(s), list the event kinds whose conditions hold, pick one by weight, resolve it, until every living contestant
  has taken part once. Deadly events weigh more as rounds pass.
- **Rationale**: content grows without code (Principle II); conditions express alignment, ties, roles and items
  (FR-014); weights tune the pace.
- **Alternatives**: hand-written event functions (code for each event, hard to grow); an event scripting language
  (overkill).

## R5. Teams, alignment, ties, roles, balance

- **Decision**:
  - A team is an enrolled party: its members cannot target each other while the team holds. A hostile tie
    (`tie-rivals`, `tie-betrayal`, `tie-suspicion`, `tie-family-feud`) unlocks a "split" event between those two,
    rarer for good characters; after a split, each is a solo side.
  - Alliances between different sides form through events (more likely for good characters and for persuasion
    successes); an alliance acts as a temporary team; only non-good characters can betray an ally (evil more often,
    chaotic a little).
  - Good characters spare a defeated foe when the event offers it; evil ones finish the wounded.
  - Friendly ties (`tie-life-debt`, `tie-childhood`, `tie-blood-oath`, `tie-mentor`, `tie-admiration`) unlock
    protection and sacrifice events; the leader (`role-leader`) gets protection events for any teammate; the healer
    role and the Healing skill unlock team heals.
  - Balance: each team's `balanceOf` (spec 008) counts the areas covered at level ≥ 2 (fighting, magic, healing,
    stealth, talking); the team gets +4 on every check per covered area beyond the first. A first try (+3 per area on
    the matching skills only) favoured all-fighter teams, which won 78 % of matches against a balanced team; with the
    coverage bonus, a balanced team wins about half of those and over 90 % against other single-class teams (SC-005).
- **Rationale**: reuses spec 008 data as it is; the rules are testable as invariants over many matches (SC-003).

## R6. Pace and ending

- **Decision**: round limit = 4 + ceil(sides × 0.75), capped at 24; from round 3, an arena event per round ("the
  mist closes in", "a storm") gives a hazard check to everyone in an area; in the last two rounds of the limit, the
  hazard is deadly on failure; if two or more sides remain when the limit is reached, a final event pairs them until one
  remains (a duel of honour for good characters, a sacrifice when tied friends are the last two). A round tells at most
  one event per living contestant, so a 12-contestant match is about 8 rounds × ~7 lines ≈ 55 lines ≈ 5 minutes.
- **Rationale**: guarantees an end (FR-016, SC-003) and a readable length (SC-004).

## R7. Text with several actors

- **Decision**: texts use `{a}`, `{b}`, `{c}` for actor names, `{item}` for an item name, `{team}` for a team name,
  and per-actor gender selections `{{a:il|elle|…}}`. `renderEvent` replaces selections first, then placeholders. The
  French rules hold: neutral phrasing for the third form (no point médian), narrow no-break spaces before `: ; ! ?`,
  never `{a}` after an elidable word. Item names are written with their article in each language
  (`"une épée"`, `"a sword"`) and a second form for "the" (`"l'épée"`, `"the sword"`) as `{item}` / `{theItem}`.
- **Rationale**: the existing `{{m|f|n}}` system handles one character; actors need their own selections, and
  agreement-free French for hundreds of event texts would be too constraining.
- **Alternatives**: agreement-free texts like party ties (too restrictive here); per-gender copies (Principle II).

## R8. Persistence

- **Decision**: `localStorage["arena"]` = `{ version: 1, roster: Contestant setup[], seed, shownRounds }`, where a
  roster entry holds a snapshot of the character (as stored characters), its side (team id and name, or solo), its
  role and ties inside the team, and its chosen perk and item ids. The match is recomputed from roster + seed.
- **Rationale**: small storage; snapshots keep a roster working after characters or parties are deleted or edited.

## R9. Share link

- **Decision**: `<app>/arena#a1.<data>`, `data` = base64url of the deflate-raw compression (`CompressionStream`) of the
  JSON `[seed, sides, contestants]`, contestants as the positional arrays already used by `#c1.` links plus side index,
  role, perk ids and item ids, and ties per side. Decoding is asynchronous, validated with zod, and opens the match from
  round 1 in read-only mode with a "Use this roster" action.
- **Rationale**: 48 characters uncompressed would make a ~15 KB link; compressed it stays around 4–6 KB, which
  browsers and chat apps accept. The `/arena` route keeps the existing `/share` page unchanged.
- **Alternatives**: no sharing of big matches (loses SC-006); a server (Principle V).

## R10. Perks and items

- **Decision**: perks (≥ 12): Survivalist (+15 survival, finds food/shelter events), Lucky (one reroll of a failed
  check per match), Brute (+10 melee, +4 HP), Sharpshooter (+15 ranged), Shadow (+15 stealth), Silver tongue
  (+10 persuasion, +10 deception), Fearsome (+15 intimidation), Healer's hands (+15 healing, heals others), Scholar
  (+15 lore, knows traps), Tough (+8 HP, +10 endurance), Quick (+10 athletics, flees better), Arcane spark (+15 magic),
  Watchful (+15 perception, never surprised), Charming (alliances more likely). Items (≥ 15) by kind: weapons (sword,
  axe, spear, dagger, bow, crossbow, magic wand, staff), tools (rope, lantern, map, lockpick), protection (shield,
  chain shirt, cloak), consumables (healing potion, rations, smoke bomb, throwing knives). Each has bonuses and tags
  used by event conditions.
- **Rationale**: matches the maintainer's examples (survivalist, sword, wand) within a fantasy setting (no pistol).
