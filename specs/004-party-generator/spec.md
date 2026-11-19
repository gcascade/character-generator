# Feature Specification: Party Generator

**Feature Branch**: `004-party-generator`

**Created**: 2026-11-19

**Status**: Draft

**Input**: User description: "Party generator: generate a group of adventurers at once (e.g. 2 to 6 characters) from a shared template (the locked properties of spec 003 apply to the whole party, e.g. all elves). The party should feel like a balanced, coherent group: varied classes by default, compatible alignments, optionally a shared origin or a common link between members. Works without AI (from the app's content, bilingual en/fr) and optionally with AI (party backstory). The user can reroll one member, lock a member, save the whole party or individual members to "My characters", and view the party on its own page. Bilingual UI, accessible, phone-friendly."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Generate a party in one click (Priority: P1)

A game master preparing a session opens the new "Party" page, chooses 4 members and clicks Generate. Four
adventurers appear as cards (portrait, name, epithet, race, class, gender, age, alignment, short background), with
different classes, alignments that can travel together, and a short text telling how the party came together.

**Why this priority**: This is the feature; everything else refines it.

**Independent Test**: Without AI, generate parties of every size from 2 to 6 and check each one has the requested
size, valid members, varied classes and a party text in the current language.

**Acceptance Scenarios**:

1. **Given** the Party page, **When** the user picks a size between 2 and 6 and clicks Generate, **Then** that many
   complete characters are shown, each valid on its own (same rules as the home page).
2. **Given** a party of 4 or fewer members and no class constraint, **When** it is generated, **Then** no two
   members share a class; with 5 or 6 members, every class appears at least once.
3. **Given** a generated party, **When** it is shown, **Then** a party text (how they met, what they are after)
   names the members and reads correctly in English and French for every mix of genders.
4. **Given** a party is shown, **When** the user clicks Generate again, **Then** a new party replaces it.

---

### User Story 2 - Shape the party (Priority: P1)

The user wants an elven party, or an all-cleric order. On the Party page they set shared constraints (any of race,
class, gender, alignment, age range not included) that every member must respect, and they can lock a member they
like so that regenerating the party keeps that member.

**Why this priority**: Without it, a GM cannot get the party their story needs; it reuses the template from
spec 003.

**Independent Test**: Set race = Elf, lock one member, regenerate 20 times: every member is an elf and the locked
member never changes.

**Acceptance Scenarios**:

1. **Given** the shared race is set to Elf, **When** the party is generated, **Then** every member is an elf, and
   the other properties stay varied and consistent (names from elven lists, ages within an elf's lifespan).
2. **Given** a shared class is set, **When** the party is generated, **Then** all members have that class (class
   variety no longer applies).
3. **Given** a member is locked, **When** the party is regenerated, **Then** that member is kept exactly and the
   others are drawn to complete a balanced party around them (their classes count for variety).
4. **Given** a member, **When** the user rerolls only that member, **Then** only that member changes, still
   respecting the shared constraints and the party's balance, and the party text is updated to name them.

---

### User Story 3 - Keep the party (Priority: P2)

The user likes a party and saves it, or saves only one member, to "My characters".

**Why this priority**: Generated parties are otherwise lost; saving makes them usable at the table.

**Independent Test**: Save a party and one member, reload, and find them in "My characters".

**Acceptance Scenarios**:

1. **Given** a party, **When** the user saves one member, **Then** that member appears in "My characters" like any
   saved character.
2. **Given** a party, **When** the user saves the whole party, **Then** the party is kept as a group: its own entry with its
   members and party text, shown in a "Parties" section of "My characters", where it can be opened again or deleted
3. **Given** saved data from before this feature, **When** the app loads, **Then** saved characters are unchanged.

---

### User Story 4 - AI party story (Priority: P3)

With an AI provider configured, the party text is written by the AI from the members' facts, in the interface
language; members' own names and backgrounds stay the app's unless the AI is asked for them.

**Why this priority**: Optional, like all AI features; the party is complete without it.

**Independent Test**: With a mocked provider, generate a party and check the party text comes from the AI while
every member's facts are unchanged; with a failing provider, the app's party text is shown with an explanation.

**Acceptance Scenarios**:

1. **Given** an AI provider, **When** a party is generated, **Then** the AI writes the party text from the members'
   names, races, classes and alignments, and cannot change those facts.
2. **Given** the AI fails or answers badly, **When** a party is generated, **Then** the app's party text is used and
   the user is told why (as for single characters).

---

### Edge Cases

- Shared constraints that leave a single possible value for a property (e.g. a shared age only an elf reaches):
  handled as in spec 003, drawing only among fitting values.
- Party size larger than the number of classes (5 or 6): classes repeat, but each class appears before any repeats.
- All members locked: regenerating only redraws the party text.
- A locked member who no longer matches a new shared constraint (e.g. a locked dwarf, then race set to Elf): the
  locked member is kept and shown as not matching, rather than silently changed.
- Duplicate names inside one party: never two members with the same first name.
- Switching language: members and party text re-render in the new language (app content), as on the home page.
- Phone width: cards stack in one column without horizontal scroll.

## Clarifications

### Session 2026-11-19

- Q: How is a whole party saved? → A: As a group, with its members and party text, in a "Parties" section of "My
  characters".
- Q: Which alignment rule applies within a party? → A: A user choice between "Harmonious" (default; no Good member
  with an Evil member) and "Anything goes".

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The app MUST offer a "Party" page reachable from the navigation menu.
- **FR-002**: Users MUST be able to choose a party size from 2 to 6 (default 4) and generate a party.
- **FR-003**: Each member MUST be a complete, valid character generated with the same rules as the home page
  (names by race and gender, age within the race's lifespan, background matching race, class and alignment).
- **FR-004**: Without a shared class, classes MUST be all different up to the number of classes, then every class
  MUST appear before any repeats.
- **FR-005**: Alignments within a party MUST be compatible: the user chooses between "Harmonious" (default:
  never a Good member together with an Evil member; Neutral members fit with anyone) and "Anything goes" (no rule).
- **FR-006**: No two members of a party MUST share a first name.
- **FR-007**: Users MUST be able to set shared constraints (race, class, gender, alignment, or "any") that apply to
  every member, using the same consistency rules as spec 003 locks.
- **FR-008**: Users MUST be able to lock a member (kept on regeneration) and reroll a single member.
- **FR-009**: Every party MUST have a party text built from bilingual app content (how the members met, the goal they
  share), naming the members, with correct gender agreement in French and neutral phrasing for non-binary members.
- **FR-010**: Users MUST be able to save one member, or the whole party, to "My characters" (a saved party keeps its members and party text together).
- **FR-011**: With an AI provider, the party text MAY be written by the AI; member facts MUST NOT change; on failure
  the app's text is used and the reason is shown.
- **FR-012**: The party page MUST work on phone width without horizontal scroll, and every control MUST be usable
  with the keyboard and have a translated label.
- **FR-013**: The current party and its shared constraints MUST survive a reload; invalid stored data is ignored.
- **FR-014**: All new interface text and content MUST exist in English and French.

### Key Entities

- **Party**: an ordered list of 2–6 members, the party text references (or AI text with its language), the shared
  constraints and the alignment mode it was generated with.
- **Party member**: a character (as everywhere in the app) plus whether it is locked in the party.
- **Shared constraints**: a character template (spec 003) applied to every member.
- **Party text**: fragments for how the party met and its common goal, written once per language.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A user gets a complete party of any size from 2 to 6 in one click, instantly without AI.
- **SC-002**: Over 1,000 generated parties without a shared class, 100% satisfy the class variety rule and the
  alignment rule, and no party has two members with the same first name.
- **SC-003**: With shared constraints, 100% of members of 1,000 generated parties respect them, and locked members
  are kept exactly.
- **SC-004**: The party text renders without placeholders or agreement errors for every combination of member genders
  in both languages (checked by the content tests).
- **SC-005**: For a fixed set of members, at least 20 distinct party texts appear in 100 generations, per language.
- **SC-006**: Saving a party or a member and reloading shows them in "My characters" in 100% of cases.

## Assumptions

- The home page's locks (spec 003) are not shared with the Party page; the Party page has its own shared constraints,
  built on the same template.
- Members are shown as compact cards; full backgrounds are available by expanding a card, to keep the page readable.
- Party text without AI is assembled from new fragments (meeting place or circumstance, shared goal), at least 10 of
  each, in both languages.
- Portraits come from the existing images by race, class and gender.
- No sharing link or export in this feature (separate roadmap items).
