# Feature Specification: Property Locking

**Feature Branch**: `003-property-locking`

**Created**: 2026-11-18

**Status**: Draft

**Input**: User description: "Property locking: before clicking Generate, the user can lock any of the character's properties (race, class, gender, alignment, age, first name, last name, epithet) so that the next generation keeps them and randomizes only the unlocked ones. Works without AI and with AI (the AI must respect locked values). Locks are visible and toggleable next to each property on the home card, persist across generations (and reloads), and must keep content consistent (e.g. locked gender with a first name from the right list; locked race keeps the origin fragment). Bilingual UI (en/fr), accessible (keyboard, aria-pressed). This is also the base for a later party generator."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Keep what I like, regenerate the rest (Priority: P1)

A player knows they want an elf, but nothing else is decided. They lock the race on the home card and click
Generate several times: every new character is an elf, while class, gender, alignment, age, names, epithet and
background change. They then also like a class and lock it; the following characters are elven clerics.

**Why this priority**: This is the whole feature; it already saves the player from rerolling property by property.

**Independent Test**: Lock one property, generate 20 times without AI, and check the locked value never changes
while each unlocked property changes at least once.

**Acceptance Scenarios**:

1. **Given** the race is locked on "Elf", **When** the user clicks Generate, **Then** the new character is an elf
   and its unlocked properties are drawn at random.
2. **Given** several properties are locked, **When** the user generates, **Then** every locked value is kept
   exactly and the background is consistent with all of them (an elf origin for an elf, a cleric training for a
   cleric, a turning point matching the alignment).
3. **Given** a property is locked, **When** the user clicks its lock again, **Then** it is unlocked and the next
   generation draws it at random again.
4. **Given** every property is locked, **When** the user generates, **Then** all values are kept and only the
   background changes.

---

### User Story 2 - Locks that keep the character coherent (Priority: P1)

Locking one property never produces an inconsistent character: unlocked properties are drawn among the values
that fit the locked ones.

**Why this priority**: Without it, locks would produce characters that contradict their own data (a 300-year-old
human, a feminine first name with a masculine gender drawn by the app).

**Independent Test**: Lock combinations such as an age of 300, or the first name "Edith", generate many times,
and check every character is valid.

**Acceptance Scenarios**:

1. **Given** the age is locked at 300 and the race is unlocked, **When** the user generates, **Then** the race is
   one whose lifespan allows that age (elf or dwarf), never a human or an orc.
2. **Given** the first name is locked and the gender is unlocked, **When** the user generates, **Then** the gender
   is drawn among those whose name list contains that first name (any gender if no list contains it).
3. **Given** the gender is locked and the first name is unlocked, **When** the user generates, **Then** the first
   name comes from the list for that race and gender (neutral names for non-binary characters).
4. **Given** the race is locked and the first or last name is unlocked, **When** the user generates, **Then** the
   name comes from that race's lists.

---

### User Story 3 - Locks with AI generation (Priority: P2)

With an AI provider configured, locked values are given to the AI as fixed facts; the AI writes only the unlocked
names and epithet, and a background consistent with every value.

**Why this priority**: AI generation is optional; the feature must not break it, but it is secondary to the app's
own generation.

**Independent Test**: With a mocked provider, lock the first name and epithet, generate, and check the result keeps
them even when the AI answers with other values.

**Acceptance Scenarios**:

1. **Given** the first name is locked and an AI provider is active, **When** the user generates, **Then** the AI is
   told the first name is fixed and the character keeps it whatever the AI answers.
2. **Given** the AI fails, **When** the user generates with locks, **Then** the app generates the character itself,
   still respecting every lock, and explains why the AI was not used (as today).

---

### User Story 4 - Locks remembered (Priority: P3)

The user closes the tab with the race and class locked. When they come back, the locks are still on, with the same
values, and the first character shown already respects them.

**Why this priority**: Comfort; useful but not needed to get value from locks within a session.

**Independent Test**: Lock two properties, reload the page, and check the locks and their values are restored.

**Acceptance Scenarios**:

1. **Given** locks were set, **When** the page is reloaded, **Then** the same properties are locked with the same
   values and the character shown respects them.
2. **Given** the stored locks are damaged or refer to values that no longer exist, **When** the page loads,
   **Then** the invalid locks are ignored and the app works normally.

---

### Edge Cases

- A die (reroll of one property) on a locked property still rerolls it, and the lock keeps the new value: locks
  only affect Generate.
- Rerolling the race with its die while the age is locked: the new race must allow the locked age.
- Rerolling the gender with its die while the first name is locked: the gender is drawn among those that fit the
  name; if only the current gender fits, the die tells the user nothing else fits instead of doing nothing silently.
- Locked first name typed by an AI earlier and absent from every list: kept as is; the gender is drawn freely.
- A locked epithet written by the AI in another language: kept as written, with the existing "written in" label.
- Loading a character from the history or a saved character while locks are on: the shown character replaces the
  locked values (locks keep their state and now hold the new values).
- Switching language: locks and values are unaffected.

## Clarifications

### Session 2026-11-18

- Q: What does the die of a locked property do? → A: It still rerolls the value, and the lock keeps the new value;
  locks only affect Generate.
- Q: When race, class or alignment is locked, does its background paragraph stay the same? → A: No, a new paragraph
  is drawn for the same value at each generation.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Users MUST be able to lock and unlock each of these properties on the home card: first name, last
  name, epithet, race, class, gender, age, alignment.
- **FR-002**: Each lock MUST be a toggle placed next to its property, showing its state visually (open or closed
  padlock) and to assistive technologies (pressed state), usable with the keyboard, with a translated label such as
  "Lock race" / "Verrouiller la race".
- **FR-003**: A lock MUST hold the property's current value; changing that value by any explicit user action (die,
  loading a character) updates the locked value.
- **FR-004**: Generating a new character MUST keep every locked value exactly and draw the unlocked ones.
- **FR-005**: Unlocked values MUST be drawn only among values consistent with the locked ones: races whose lifespan
  allows a locked age, genders whose list contains a locked first name (any gender when no list does), first and
  last names from the lists of the (locked or drawn) race and gender.
- **FR-006**: The generated background MUST be consistent with the final values (origin by race, training by class,
  turning point by alignment), whatever is locked. When the race, class or alignment is locked, a new paragraph is drawn for the same value at each generation (the
  lock holds the value, not the text).
- **FR-007**: With an AI provider, locked values MUST be given to the AI as fixed facts, the AI MUST only be asked
  for the unlocked names and epithet plus a background, and any value the AI returns for a locked property MUST be
  ignored.
- **FR-008**: When the AI fails, the app MUST generate the character itself with the same locks (spec 001 fallback).
- **FR-009**: Locks and their values MUST be saved on the device and restored on load; the first character shown
  after load MUST respect them. Invalid stored locks MUST be ignored.
- **FR-010**: An "Unlock all" action MUST be available when at least one property is locked.
- **FR-011**: Locks MUST be described by a reusable "character template" (the locked values) so that a later party
  generator can generate several characters from one template.
- **FR-012**: All new interface text MUST exist in English and French.

### Key Entities

- **Lock set**: which properties are locked, and the value held for each locked property. It is the template the
  next generation starts from.
- **Character template**: the partial set of property values a generation must keep; the lock set is one template.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: With any combination of locks, 100% of 1,000 generated characters keep every locked value and are
  valid (age within the race's lifespan, first name from the right list unless it was locked, background matching
  race, class and alignment).
- **SC-002**: With one property locked, each unlocked property takes at least 2 different values over 50 generations.
- **SC-003**: A user can lock a property and generate in 2 interactions, with mouse or keyboard alone.
- **SC-004**: After a reload, 100% of valid stored locks are restored with their values.
- **SC-005**: With AI and a locked first name, the generated character keeps the locked first name in 100% of cases,
  including when the AI answers with another one.

## Assumptions

- Locks only exist on the home card; saved characters and the history are not affected.
- The background, the portrait and the content ids are not lockable themselves in this feature (the portrait follows
  race, class and gender).
- No lock is set by default; a new user sees the app exactly as today until they click a padlock.
- Locks are stored in the browser like the other settings; there is no account.
- The party generator is a later feature; this one only makes the template reusable.
