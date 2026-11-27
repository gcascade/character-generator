# Feature Specification: Arena

**Feature Branch**: `012-arena`

**Created**: 2026-11-25

**Status**: Draft

**Input**: User description: "Arena: a spectator battle-royale mini-game with the app's characters and parties, plus percentage stats for every character. Stats (shown on character sheets too): skills from 0 to 100, each the percent chance to succeed (d100 roll-under; events apply bonuses or penalties). About a dozen skills in four families — Combat: melee, ranged, magic; Physical: athletics, stealth, endurance; Mind: perception, survival, lore, healing; Social: persuasion, intimidation, deception — plus hit points. Values come from class, race, age and a little randomness, drawn once and kept with the character. Arena setup: enrol any number of characters (saved characters, saved parties as teams, the current character or party, generated ones); each contestant can get 2 perks (e.g. Survivalist, Lucky) and starting items (sword, bow, magic wand, potion, rope…). The match: the player only watches; day/night rounds of random events told in English and French without AI, using skill rolls; alignment, party ties, roles and balance drive behaviour; deaths without gore; tone mixing epic and humour; about 5 minutes of reading; last one standing or last team wins; summary with winner, kills, notable moments; seeded randomness makes a match replayable and shareable. A later expedition (roguelike) mode will reuse the stats and event engine (out of scope)."

## Clarifications

### Session 2026-11-25

- Q: Roster size? → A: Up to 48 contestants (for example 12 parties of 4).
- Q: Can side characters (NPCs) enter the arena? → A: No.
- Q: Can the player edit or reroll skills? → A: No, skills are drawn and kept as drawn.
- Q: Where do skills live? → A: Only in the arena: they are rolled when a match is set up, shown in the arena setup and
  during the match, and never stored on characters or shown on character pages.

### Session 2026-11-26 (after the first release)

- Q: Portraits in the story? → A: Each event line shows the portrait of who acts on the left and of who undergoes it
  on the right; several portraits are stacked and take turns in front on hover or focus.
- Q: How many events per period? → A: 4 to 6, drawn at random; the round limit grows with the number of contestants
  (4 + 0.9 × contestants, at most 60) instead of ending after a few rounds.
- Q: Show the effect of skills? → A: Each event lists its dice rolls (who, skill, chance, roll, success), with a switch
  to hide them.
- Q: State of the contestants? → A: A panel shows, after the last revealed period, hit points, items, teams, those
  who left them, alliances, defeats and who is out.
- Q: Seeing a contestant's skills during the match? → A: Names in the story are highlighted; hovering, focusing or
  tapping a name, a portrait or a contestant in the status panel opens a card with their skills, perks, and hit
  points and items at that moment (just before the event).
- Q: Filling the roster? → A: "Fill the arena" up to 8–48 contestants, as solos, teams of 2, 3 or 4, or a mix.

### Session 2026-11-27

- Q: New mechanics? → A: Couples, group events, grudges. Two contestants of different sides grow a bond (alliances,
  care, sparing, shared feasts); past a threshold they can form a couple that leaves their teams and alliances and
  wins together. Group events gather 3 to 6 contestants (melee, a team or coalition falling on one contestant, group
  hazards, feasts). Contestants remember who hurt, robbed or betrayed them, or defeated a friend: revenge, avenging and
  reconciliation events follow.

- Q: The finale felt like simultaneous events? → A: Two teams had the same name. Team names are now unique; a
  narrator's line (a bubble of its own) opens the finale, links its duels (the winner faces the next opponent) and
  tells when a team is gone; eliminating events say who is out.

## Context

The maintainer wants a game that gives the generated characters and parties something to do. Two formats were
discussed: an arena (spectator battle royale) and an expedition (roguelike). The arena comes first; the expedition is
a later feature built on the same stats and event engine. Inspiration: browser battle-royale simulators where any
number of custom characters, each with two perks and a few items, are dropped into a match told as short texts. The
arena is the app's own game: its own characters, stats, perks, items and texts.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Contestants get skills (Priority: P1)

When characters enter the arena, each one gets skills rolled for the match: thirteen values from 0 to 100 grouped in
four families, plus hit points. A value is the percent chance that the contestant succeeds at an action of that kind.
A warrior is good at melee and endurance, a bard at persuasion, an elderly mage knows more lore but runs slower than a
young one, an orc intimidates more easily, a halfling hides better. The player sees them on each contestant's card in
the arena; character pages do not show them.

**Why this priority**: Skills are what the match rolls against; they are the foundation of the arena and of the
later expedition.

**Independent Test**: Enrol characters of every race and class and check that each contestant card shows thirteen skills
and hit points within bounds, that the strongest skills match the class, that the same seed gives the same skills,
and that character pages and stored characters are unchanged.

**Acceptance Scenarios**:

1. **Given** a roster in the arena, **When** the match is set up, **Then** each contestant card lists thirteen skills
   (Melee, Ranged, Magic, Athletics, Stealth, Endurance, Perception, Survival, Lore, Healing, Persuasion, Intimidation,
   Deception) from 0 to 100 and hit points, grouped in Combat, Physical, Mind and Social.
2. **Given** a match set up with a seed, **When** it is replayed or opened from its share link, **Then** every
   contestant has the same skills.
3. **Given** the player chooses "Play again", **When** the new match is set up, **Then** skills are rolled anew.
4. **Given** a character page, a party page or a character share link, **When** it is shown, **Then** no skills appear
   and nothing about the character is changed by the arena.
5. **Given** the interface is in French, **When** the skills are shown, **Then** their names are in French.

---

### User Story 2 - Watch an arena match (Priority: P1)

The player opens the Arena page, adds contestants (the current character, saved characters, the current or a saved party
as a team, or randomly generated characters to fill the roster) and starts the match. The match is told round by
round, day and night, as short texts: someone finds a sword in a ruined chapel, someone else falls into a pit trap,
two characters from different teams form an alliance, a rogue tricks a paladin into giving up their food, a fight
ends in a defeat. The player watches and reads at their own pace, then reaches the end: the winner (a character or a
team), the number of defeats each contestant caused, and a few notable moments.

**Why this priority**: This is the game itself; with stats (story 1) it is the minimum playable arena.

**Independent Test**: Start matches with 2, 8 and 24 contestants and check that each ends with exactly one winner or
winning team, that every defeated contestant was defeated by a told event, that skill rolls decide outcomes, and that
a match with the same contestants and seed tells exactly the same story.

**Acceptance Scenarios**:

1. **Given** at least two contestants who are not all on one team, **When** the player starts the match, **Then** rounds
   are told one after the other, each round as a list of short events naming the contestants involved.
2. **Given** a match in progress, **When** the player asks for the next round, **Then** it is shown; the player can also
   skip to the end.
3. **Given** an event that depends on a skill, **When** it happens, **Then** the outcome follows a roll against that
   skill with the event's bonus or penalty, and a better skill succeeds more often over many matches.
4. **Given** a match where only one contestant or one team is left standing, **When** the last round ends, **Then** the
   summary shows the winner, each contestant's defeats caused and the round they fell, and at least three notable
   moments.
5. **Given** the same contestants, perks, items and seed, **When** the match is played again, **Then** every event and
   outcome is identical.
6. **Given** the interface language changes during or after a match, **When** the story is shown, **Then** the same
   events are told in the new language.

---

### User Story 3 - Teams, alignment and ties shape the story (Priority: P2)

Parties enter as teams. Members of a team start together, help each other and are not attacked by teammates unless
something breaks the team. Alignment colours behaviour: good characters share food, heal and spare the defeated;
evil ones betray alliances and finish off the wounded; chaotic ones do unexpected things. Party ties matter: friends
protect each other, rivals may turn on one another, a character owing a debt may sacrifice themselves. The party
leader takes risks to protect the others; a balanced party survives better than a party of four rogues.

**Why this priority**: This is what makes the arena feel like the app's characters rather than anonymous fighters,
and it gives the party features (balance, roles, ties) a real use.

**Independent Test**: Over many simulated matches, compare teams with and without good balance, characters of good and
evil alignment, and pairs with friendly or hostile ties, and check that the differences show up in the events and
outcomes.

**Acceptance Scenarios**:

1. **Given** a party enrolled as a team, **When** the match starts, **Then** its members are told as entering together
   and never attack each other while the team holds.
2. **Given** a hostile tie between two members of the same team, **When** the match runs, **Then** a betrayal or split
   between them can happen, and it is told.
3. **Given** an evil character in an alliance, **When** the match runs, **Then** betrayal events can happen to that
   alliance; a good character never betrays an ally.
4. **Given** a team leader whose teammate is in danger, **When** a protection event applies, **Then** the leader can
   step in, at a risk to themselves.
5. **Given** many simulated matches, **When** balanced teams are compared to unbalanced ones of the same size, **Then**
   balanced teams win more often.

---

### User Story 4 - Perks and items (Priority: P2)

Before the start, the player can give each contestant up to two perks from a list (Survivalist, Lucky, Brute, Silver
tongue, Shadow, Healer's hands, …) and a few starting items (sword, bow, magic wand, healing potion, rope, cloak, …).
Contestants without choices get none (or a random draw if the player asks). Perks change skills or unlock events
(a Survivalist finds food more easily, a Lucky character can reroll one failed roll per match); items give bonuses
and unlock events (a rope gets out of a pit, a potion heals, a bow allows ranged fights). Items are also found,
traded, stolen and lost during the match.

**Why this priority**: It adds the player's part in a spectator game and a lot of variety, but a match is already
playable without it.

**Independent Test**: Give the same contestant different perks and items across matches with the same seed and check
that the told events and outcomes change accordingly; check the limits (two perks, item count).

**Acceptance Scenarios**:

1. **Given** a contestant in setup, **When** the player opens their options, **Then** they can choose at most two
   different perks and a limited number of starting items, each with a one-line description.
2. **Given** a contestant with an item, **When** an event uses it, **Then** the text names the item and the bonus
   applies.
3. **Given** the player asks for random perks and items, **When** applied, **Then** every contestant gets a random
   valid set.
4. **Given** a contestant who finds, receives or loses an item during the match, **When** later events happen, **Then**
   they use the current inventory.

---

### User Story 5 - Replay and share a match (Priority: P3)

The player can replay a match from the start, play again with the same roster but a new draw, or share the match by
link. Whoever opens the link sees the same match told in their language, without needing the shared characters saved.

**Why this priority**: Sharing is a strong part of the app (characters, parties, side characters), and a funny match is
worth sending to friends; but it comes after the game itself.

**Independent Test**: Share a match, open the link in a fresh browser, and check that the roster, perks, items and every
event are identical.

**Acceptance Scenarios**:

1. **Given** a finished or running match, **When** the player copies its share link and someone opens it, **Then**
   the same match is told from the start.
2. **Given** a match, **When** the player chooses "Play again", **Then** the same roster and setup get a new draw and a
   different story.
3. **Given** a damaged or outdated arena link, **When** it is opened, **Then** a clear message is shown instead of a
   broken match.

---

### Edge Cases

- Fewer than two contestants, or every contestant in the same team: the match cannot start, with a message.
- One contestant enrolled twice (the same saved character, or a character also in an enrolled party): it is enrolled
  only once.
- Large rosters: a cap keeps matches readable (see FR-016); when everyone is on teams, at least two teams are needed.
- Rounds where nothing deadly happens: the arena tightens (a shrinking zone, a storm, a monster released) so that a
  match always ends within the round limit.
- Two last contestants who would never fight each other (allies, good characters): the arena forces a final event so
  that one winner remains, told in a way that fits (a duel of honour, a sacrifice).
- A whole team defeated except one member: the survivor keeps playing alone.
- Characters with AI-written text or in another language: only their names, race, class, gender, alignment, age, ties
  and stats are used; events are always told from the app's own texts.
- Non-binary characters and French texts: events follow the app's text rules (agreement-free French phrasing).

## Requirements _(mandatory)_

### Functional Requirements

**Stats**

- **FR-001**: Every contestant MUST have thirteen skills, each an integer from 0 to 100 — Combat: Melee, Ranged, Magic;
  Physical: Athletics, Stealth, Endurance; Mind: Perception, Survival, Lore, Healing; Social: Persuasion, Intimidation,
  Deception — and hit points.
- **FR-002**: Skill values MUST come from the class (base profile), the race (small modifiers), the age band
  (experience against physical form) and a bounded random part, and MUST stay within 5 and 95 at creation so that
  nothing is ever certain.
- **FR-003**: Skills MUST be rolled from the match seed when a match is set up, and kept for that match; the player
  cannot edit or reroll them.
- **FR-004**: Skills MUST NOT be stored on characters or parties, nor shown on character, party or share pages;
  enrolling a character in the arena MUST NOT change it.
- **FR-005**: The arena setup and the match MUST show each contestant's skills, grouped by family, with names in the
  interface language.
- **FR-006**: A skill check MUST succeed when a roll from 1 to 100 is less than or equal to the skill plus bonuses and
  minus penalties, the effective value being kept between 5 and 95.

**Arena setup**

- **FR-007**: The app MUST offer an Arena page where the player builds a roster from the current character, saved
  characters, the current party, saved parties (each as one team) and randomly generated characters (any count up to
  the cap).
- **FR-008**: The player MUST be able to remove contestants and see the roster grouped by team, with solo contestants
  shown on their own.
- **FR-009**: Each contestant MUST accept up to two different perks from a list of at least 12 perks and up to three
  starting items from a list of at least 15 items, each with a short description in both languages; a "random"
  action MUST fill them for everyone.
- **FR-010**: The match MUST NOT start with fewer than two sides (a side is a team or a solo contestant).

**Match**

- **FR-011**: A match MUST run in rounds alternating day and night, each round telling several events; every living
  contestant MUST take part in at least one event per round.
- **FR-012**: Events MUST be chosen among at least 80 event kinds (finding things, food and shelter, traps and hazards,
  hunting, hiding, fights, ranged attacks, spells, persuasion, intimidation, deception, healing, alliances, betrayals,
  sacrifices, arena events, humour), each with conditions (skills, perks, items, alignment, team, ties, wounds) and
  texts in English and French using the app's placeholders and gendered selections.
- **FR-013**: Event outcomes depending on ability MUST be decided by skill checks (FR-006); fights MUST use the
  combatants' skills, items, wounds and hit points.
- **FR-014**: Behaviour MUST follow alignment (good characters never betray allies; evil characters can betray and
  finish the wounded), teams (teammates do not attack each other while the team holds), party ties (friendly ties
  protect, hostile ties can break a team), party roles (the leader protects) and party balance (a balanced team gets
  better odds).
- **FR-015**: Defeats MUST be told without gore, and the tone MUST mix epic moments and humour.
- **FR-016**: A match MUST end with exactly one surviving contestant or team; with the arena's tightening events it
  MUST end within a round limit, and a typical match MUST read in about five minutes.
- **FR-017**: The player MUST be able to show the next round, skip to the end, and read the summary: winner, defeats
  caused by each contestant, the round each fell, and at least three notable moments.
- **FR-018**: All randomness of a match MUST come from a seed so that the same roster, setup and seed always give the
  same match; the language MUST only change the wording.

**Persistence and sharing**

- **FR-019**: The arena roster and setup MUST be kept between visits; the last match MUST be kept until a new one starts.
- **FR-020**: A match MUST be shareable by link holding the roster (characters), teams, perks, items and
  seed, validated before display; old link formats MUST keep being read once a new one exists.
- **FR-021**: The arena MUST work entirely without AI and without any server.

### Key Entities

- **Skills**: thirteen values from 0 to 100 and hit points, rolled for a contestant in a match.
- **Perk**: a named trait with a description and effects (skill bonuses, extra events, one-off abilities).
- **Item**: a named object with a description, a kind (weapon, tool, consumable, protection) and effects.
- **Contestant**: a character in a match, with its side, perks, inventory, wounds and state (standing or defeated).
- **Side**: a team (an enrolled party) or a solo contestant.
- **Event kind**: a reusable event with its conditions, its checks, its outcomes and its texts in each language.
- **Match**: a roster, a setup and a seed; it produces rounds of told events and a summary.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of contestants of every race and class have thirteen skills between 5 and 95 and hit points, and the
  class's signature skills are among its three highest in at least 90% of contestants.
- **SC-002**: A player goes from an empty arena to a running match with a generated roster in under 30 seconds.
- **SC-003**: In 1,000 simulated matches of 2 to 48 contestants, every match ends with exactly one surviving side within
  the round limit, and no contestant is defeated by a teammate while their team holds, nor betrayed by a good ally.
- **SC-004**: A typical 12-contestant match takes 3 to 7 minutes to read.
- **SC-005**: Over 1,000 simulated matches, a contestant with a skill 30 points higher succeeds at checks of that skill
  clearly more often, and balanced teams win more often than unbalanced teams of the same size.
- **SC-006**: Replaying a match from its seed or its share link gives exactly the same events in 100% of tested cases.
- **SC-007**: Every event text exists in English and French with the same placeholders, and no event text repeats more
  than twice in a typical match.

## Assumptions

- The skill list is the thirteen skills above; hit points come from Endurance and the class.
- Skills are rolled per match (same seed, same skills) and only exist in the arena; the player does not edit them.
- Side characters (NPCs) do not get skills and cannot enter the arena in this feature.
- Matches are not saved in a list; the last match, the roster and the setup are kept, and sharing covers the rest.
- The player is only a spectator during the match: no sponsoring, betting or intervention once it has started.
- The roster cap is 48 contestants (for example 12 parties of 4), enough for a big match while keeping it readable.
- AI narration of matches is out of scope; it may come later as an option like for characters.
- Portraits (default or painted) are shown next to contestants when available.
- The expedition (roguelike) mode is a later feature reusing skills, perks, items and the event engine.
