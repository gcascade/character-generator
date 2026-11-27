# Feature Specification: Arena wilds (spec 013)

**Feature Branch**: `claude/cool-keller-vpldvo` · **Created**: 2026-11-27 · **Status**: In progress

**Input**: Maintainer: "more events (200, 300?); events tied to equipment (a rope to climb down a cliff); taming wild
animals, or being hurt or killed trying; starving; a new character appearing (a spectator, a gladiator…), hostile or
friendly, as an NPC or a real fighter; events that change the end condition (survive for a time, reach a goal…)."

## Clarifications

### Session 2026-11-27

- Q: How many events? → A: About 220 now (130 today), 300 in a later batch.
- Q: Can a newcomer win? → A: Yes. A gladiator-type newcomer becomes a real contestant, shown as a guest of the arena,
  and can win; spectators and visitors stay one-off figures who help or hinder.
- Q: Several winners? → A: Yes, a shared victory is allowed (e.g. everyone alive at dawn of a given day); decrees stay
  rare (about one match in six).
- Q: Can hunger eliminate? → A: Yes, rarely: a hunger gauge rises without food, gives penalties, then hurts, and can
  eliminate someone who has not eaten for long.

## User Scenarios

1. **Equipment matters (P1)**: some events have a tool outcome: a contestant with a rope climbs down a cliff, a lantern
   lights a dark cave, lockpicks open a cage, a smoke bomb ends an ambush. The text names the item; consumables are used
   up. Without the item, the usual roll decides.
2. **Animals (P1)**: contestants meet wild animals; they can try to tame one (success: a companion that helps in fights,
   hunts and warns; failure: they are hurt, sometimes eliminated). Wild animals also attack. A companion runs off when
   its contestant leaves the arena. The card and the status panel show the companion.
3. **Hunger (P2)**: each period without food raises hunger; hungry contestants get penalties, starving ones lose hit
   points and may be eliminated (rarely). Foraging, hunting, rations, feasts and companions feed them.
4. **Guests (P2)**: during the match a guest may enter: a hostile gladiator (a new contestant on its own side, who can
   win), or a friendly wanderer who joins a contestant's side. Visitors (a spectator, a priest, a merchant) only appear
   in one event.
5. **Decrees (P3)**: the arena masters may change the end condition: everyone standing at dawn of a given day wins
   (shared victory), the first to bring back a relic wins, or the first to defeat N foes wins. The summary shows every
   winner.

## Requirements

- FR-001: Event kinds may declare a tool tag; an actor carrying an item with that tag gets the tool outcome (no roll),
  and a consumable tool is used up.
- FR-002: Animals are data (id, difficulty, bonuses, texts with an indefinite and a definite form in each language);
  taming is a roll; a companion gives a fight bonus and unlocks companion events; it leaves with its contestant.
- FR-003: Hunger is tracked per contestant, rises each period, is lowered by food events and items; penalties from 3,
  harm from 5, a rare elimination from 7.
- FR-004: Guests are generated from the seed (deterministic), get skills like contestants, and appear in the story, the
  cards and the status panel; at most two per match.
- FR-005: Decrees set a goal: survive until a period (shared victory), bring back a relic (held, stolen, returned) or
  reach a number of defeats; the match ends as soon as the goal is reached.
- FR-006: About 220 event kinds, every text in English and French with the French rules (agreement-free where the
  gender is unknown, narrow no-break spaces, no elision before a name or an item).
- FR-007: All previous invariants hold (one winning side within the limit unless a decree says otherwise, teammates
  never defeat each other, good characters never betray, same seed same match).

## Success criteria

- SC-001: At least 220 event kinds, each with texts in both languages for every outcome.
- SC-002: In 1,000 matches: tools are used, animals tamed and companions act, guests appear in some matches, decrees in
  about one in six, starvation eliminations stay rare (under 2% of eliminations).
- SC-003: Matches stay readable: about 50–70 lines for 12 contestants.

## Clarifications (continued)

- Q: Only the rope? → A (maintainer, 2026-11-27): more item and perk mechanics. Events can be tied to perks or classes,
  and perks can make events more likely. Added: a `knack` outcome when a perk stands in for the tool, `boost` weights
  per perk, class or race, `when.classes`; items flint, net, antidote, bird call, waterskin, grappling hook; perks
  Beast friend, Iron stomach, Climber, Night eyes, Crowd favourite, Tracker.

## Implementation notes

- Engine: `src/content/arenaEvents.ts` (tool / knack, `tame`, `beast`, `companion`, `companion-attack`, `eat`, `feed`,
  `hunger`, `arrival`, `relic-*`), `src/content/arena.ts` (`makeGuest`, `planDecree`, `matchSetup`, hunger tick,
  decree checks, shared victory in `summarize`).
- Measured over 400 matches of 12 (mixed roster, random loadouts): about 73 lines, 14 periods; 1.1 tool and 0.3 knack
  outcomes, about one tamed animal per match; guests in about a quarter of matches; decrees in 14%; starvation 0.4% of
  eliminations.
