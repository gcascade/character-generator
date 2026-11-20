# Feature Specification: NPC Mode

**Feature Branch**: `010-npc-mode`

**Created**: 2026-11-20

**Status**: Draft

**Input**: User description: "NPC / townsfolk mode (spec 010). A separate "NPC" (PNJ) page, alongside the character generator and the party page, that generates ordinary people of a fantasy world: an occupation instead of a class (blacksmith, innkeeper, farmer, beggar, priest, merchant, guard, etc.), race, gender, age, name, and a short sheet made for a game master: daily life, a rumour they know, a secret, their opinion of adventurers, a quirk/manner of speaking. Works without AI from fragments in both languages (en, fr); optional AI writing like characters. NPCs can be saved, shared by link, rerolled per property with locks. Previously decided: option A = separate mode/page (not a class among others)."

## Clarifications

### Session 2026-11-20

- Q: NPCs as a class or a separate mode? → A: A separate mode with its own page (decided during spec 009).
- Q: Which occupations? → A: The 20 proposed occupations (see Assumptions).
- Q: One NPC at a time or a batch? → A: One NPC by default, plus a "Generate 5" action showing compact cards that open
  the full sheet.
- Q: Name in the interface? → A: "Side characters" / "Personnages secondaires" (menu and title), with "NPC" / "PNJ"
  recalled in the page subtitle; code keeps `npc`.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Generate an NPC on the spot (Priority: P1)

A game master whose players just walked into a forge clicks "Generate" on the NPC page and gets, in a few seconds, a
blacksmith ready to play: name, race, gender, age, occupation, and a short sheet: a one-line look, daily life, a
quirk or way of speaking, a rumour they know, a secret, and what they think of adventurers. The occupation can be
chosen (or left to chance), as can race and gender.

**Why this priority**: This is the feature: improvising a believable person in seconds, without AI.

**Independent Test**: Generate 1,000 NPCs without AI: each has every sheet section in both languages, with names
from the race lists and an age fitting the occupation and race.

**Acceptance Scenarios**:

1. **Given** the NPC page, **When** "Generate" is clicked with no constraint, **Then** an NPC is shown with name,
   race, gender, age, occupation and the six sheet sections, in the interface language.
2. **Given** an occupation chosen in the constraints (e.g. innkeeper), **When** NPCs are generated, **Then** they all
   have that occupation and daily-life text written for it.
3. **Given** a generated NPC, **When** the language is switched, **Then** the same NPC reads in the other language
   (same people, same facts).
4. **Given** a non-binary NPC, **When** the sheet is read in French, **Then** it uses neutral phrasing, as character
   stories do.

---

### User Story 1b - Populate a place (Priority: P2)

The players enter a tavern: the game master clicks "Generate 5" and gets five compact cards (name, race,
occupation, quirk), opens the one the players talk to, and keeps or saves it.

**Why this priority**: Populating a place quickly is a frequent need at the table.

**Independent Test**: Click "Generate 5": 5 cards with different first names appear; open one: its full sheet shows.

**Acceptance Scenarios**:

1. **Given** the page, **When** "Generate 5" is clicked, **Then** 5 cards appear with different first names,
   respecting the chosen constraints.
2. **Given** the cards, **When** one is opened, **Then** its full sheet is shown, with keep and save actions.

---

### User Story 2 - Adjust an NPC (Priority: P2)

The game master likes the innkeeper but wants another secret, or a dwarf instead of a human. Each property and each
sheet section has its own dice; properties can be locked so "Generate" keeps them.

**Why this priority**: Fine-tuning is what makes generated NPCs usable at the table; it reuses the generator's habits.

**Independent Test**: Reroll each property and section in turn: only it changes; lock the occupation and race,
generate 100 times: they stay.

**Acceptance Scenarios**:

1. **Given** an NPC, **When** the dice of one section (e.g. rumour) is used, **Then** only that section changes.
2. **Given** an NPC, **When** the race is rerolled, **Then** the race changes and the name and age are kept when they
   still fit, as for characters.
3. **Given** locked properties, **When** "Generate" is clicked, **Then** locked values are kept and everything else
   changes.

---

### User Story 3 - Keep and share NPCs (Priority: P2)

The game master saves the NPCs met during a session, finds them later in "My characters" (a dedicated NPC tab), opens
one to read the full sheet, deletes the ones no longer needed, and sends a link to a player or co-GM, who sees the
NPC in their own language.

**Why this priority**: NPCs come back from one session to the next; sharing follows the existing link feature.

**Independent Test**: Save 3 NPCs, reload: they are listed; open one; share its link and open it in a fresh browser
in the other language.

**Acceptance Scenarios**:

1. **Given** a generated NPC, **When** it is saved, **Then** it appears in the NPC tab of "My characters" and survives
   a reload.
2. **Given** a saved NPC, **When** it is opened, **Then** its full sheet is shown with delete and share actions.
3. **Given** an NPC link, **When** it is opened, **Then** the NPC is shown in the visitor's language and can be saved.

---

### User Story 4 - Written by AI (Priority: P3)

With an AI configured, the game master can have the sheet written by the AI from the NPC's facts (occupation, race,
gender, age), as for characters; without AI, or if the AI fails, the fragment sheet is shown.

**Why this priority**: Optional, like the rest of the AI features.

**Independent Test**: With a fake AI, generate an NPC: the sheet comes from the AI answer; with a failing AI, the
fragment sheet is shown with the usual message.

**Acceptance Scenarios**:

1. **Given** an AI is configured, **When** an NPC is generated, **Then** the AI writes the name and the six sections,
   and the app keeps occupation, race, gender and age.
2. **Given** the AI fails or answers badly, **When** an NPC is generated, **Then** a fragment NPC is shown with the
   usual error message.

---

### Edge Cases

- Age and occupation: some occupations need a minimum age (an apprentice can be young, an elder cannot be 20);
  ages stay within the race lifespan.
- Occupation and race: any race can hold any occupation; texts are written so they fit every race.
- Rumours and secrets must be usable hooks, not personal details only; none should require a specific place name
  the game master has not chosen (generic names such as "the old mill" are fine).
- Opinion of adventurers: varied (admiring, wary, greedy, hostile, indifferent…) so NPCs do not all react the same.
- Older app data: characters, parties and links are unchanged; NPCs use their own storage and link format.
- No portrait images exist for occupations: the NPC shows the race emblem (spec 009) framed with the occupation.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The app MUST offer a side-character page ("Side characters" / "Personnages secondaires", subtitle
  recalling "NPC" / "PNJ"), reachable from the menu, separate from the character generator and the party page.
- **FR-002**: An NPC MUST have a first and last name, race, gender, age, occupation and six sheet sections: look,
  daily life, quirk, rumour, secret, opinion of adventurers.
- **FR-003**: The app MUST offer the 20 occupations listed in Assumptions, each with at least 3 daily-life texts per language; look, quirk, rumour, secret and opinion texts are
  shared by all occupations (at least 20 each per language).
- **FR-004**: Occupation, race and gender MUST be selectable as constraints (or left to chance).
- **FR-005**: Every property and every sheet section MUST be rerollable on its own; properties MUST be lockable.
- **FR-006**: Every text MUST exist in English and French, agree with every gender, and follow the French rules
  (neutral phrasing for non-binary, typography, no elision before a name).
- **FR-007**: NPCs MUST be savable, listed in a dedicated tab of "My characters", openable, deletable, and kept
  between visits.
- **FR-008**: NPCs MUST be shareable by link, shown in the visitor's language, and savable from the link.
- **FR-009**: With AI configured, the AI MAY write the name and sheet; the app decides occupation, race, gender and
  age; any AI failure falls back to fragments.
- **FR-010**: The page MUST generate one NPC by default and offer "Generate 5", showing 5 compact cards (name,
  race, occupation, quirk) that each open the full sheet and can be kept as the current NPC or saved.
- **FR-011**: Existing characters, parties, saved data and links MUST keep working unchanged.

### Key Entities

- **NPC**: names, race, gender, age, occupation, references to its six sheet texts (or AI-written text with its
  language), optional saved id.
- **Occupation**: name (EN/FR, gendered labels), minimum age, icon, daily-life texts.
- **Sheet fragment**: a text of one section (look, quirk, rumour, secret, opinion), in every language, with gender
  selections.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A game master gets a complete NPC in one click, in under a second, without AI.
- **SC-002**: Over 1,000 generated NPCs, 100% have all six sections rendered in both languages without placeholders,
  for every gender.
- **SC-003**: Over 1,000 generated NPCs, every occupation appears and no two consecutive NPCs share all of rumour,
  secret and quirk.
- **SC-004**: A saved NPC is found again after a reload; a shared NPC opens identically in a fresh browser.
- **SC-005**: All existing tests about characters, parties, saved data and links keep passing.

## Assumptions

- Occupations (20, confirmed): blacksmith, innkeeper, farmer, beggar, priest, merchant, guard, fisher, healer,
  scribe, hunter, miller, baker, tailor, stablehand, minstrel, sailor, noble, alchemist, gravedigger.
- NPCs have no class, alignment, party role or background story; the sheet replaces them.
- NPCs are not party members (parties stay made of adventurers).
- Portraits: the race emblem with the occupation icon; no new images.
- Saved NPCs are stored apart from characters; links use a new prefix (e.g. `n1.`).
