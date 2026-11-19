# Feature Specification: Saved Character Details

**Feature Branch**: `006-character-details`

**Created**: 2026-11-19

**Status**: Draft

**Input**: User description: "In 'My characters', it is not possible to see the details of a saved character. Clicking a saved character opens a detail view in the style of the generator card (portrait, name, epithet, badges, every property, the full story with drop cap), reachable by its own link; actions: open in the generator, delete, translate AI text. Saved characters get a stable id. Done before the party generator, which will reuse the detail view for party members."

**Note**: implemented before spec 004 (party generator), which reuses the detail view.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Read a saved character (Priority: P1)

A player opens "My characters", clicks one of their saved heroes and sees everything about them: large portrait,
name and epithet, race / class / gender badges, every property (age, alignment…) and the whole story, presented like
the generator card. A "Back" action returns to the list where they were.

**Why this priority**: Today the story of a saved character cannot be read at all; this is the gap reported.

**Independent Test**: Save a character, open it from "My characters", check every property and every story paragraph
is shown, then go back to the list.

**Acceptance Scenarios**:

1. **Given** a saved character, **When** the user clicks or activates (keyboard) its card, **Then** the detail view
   shows the portrait, name, epithet, race, class, gender, age, alignment and the full story in the current language.
2. **Given** the detail view, **When** the user chooses "Back" (or the browser back button), **Then** "My characters"
   is shown again on the same page of the carousel.
3. **Given** a character whose text was written in another language (AI or earlier version), **When** it is shown,
   **Then** the "written in" label appears, and "Translate with AI" is offered when an AI provider is configured.

---

### User Story 2 - A link to each saved character (Priority: P2)

Each saved character has its own address, so the page survives a reload and can be bookmarked on the same device.

**Why this priority**: Comfort and robustness (reload, back/forward), and the base for party members later.

**Independent Test**: Open a detail view, reload the page: the same character is shown; open an unknown address: a
clear "not found" message with a way back.

**Acceptance Scenarios**:

1. **Given** a detail view, **When** the page is reloaded, **Then** the same character is shown.
2. **Given** an address for a character that does not exist (deleted, other device), **When** it is opened, **Then**
   a "character not found" message and a link to "My characters" are shown.
3. **Given** characters saved by earlier versions (without an identifier), **When** the app loads, **Then** each one
   gets a stable identifier, kept from then on, and nothing else changes.

---

### User Story 3 - Act on a saved character (Priority: P2)

From the detail view the user can reopen the character in the generator (to reroll or lock its properties) or delete
it.

**Why this priority**: Natural next steps once the character is open; editing in place is a separate roadmap item.

**Independent Test**: From the detail view, open the character in the generator and check it is the current character;
delete another one and check it disappears from the list.

**Acceptance Scenarios**:

1. **Given** the detail view, **When** the user chooses "Open in the generator", **Then** the home page shows that
   character as the current one, and the character that was there before is kept in the history.
2. **Given** the detail view, **When** the user deletes the character (with the existing confirmation), **Then** it is
   removed from "My characters" and the user is taken back to the list with a confirmation message.

---

### Edge Cases

- Two saved characters with the same name, race and age: each has its own identifier and its own detail view; deleting
  one never deletes the other.
- Saving the same generated character twice is prevented, as today ("Saved" state).
- A character with no story text (legacy without background): the story section is omitted, nothing breaks.
- Very long names, epithets and French labels: wrap without horizontal scroll at 360 px.
- Dark mode and both languages: same rules as spec 005 (AA contrast, focus visible).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Every saved character MUST have a stable unique identifier; characters stored without one MUST receive
  one on load, and the list MUST be saved back with it.
- **FR-002**: Deleting and recognising saved characters MUST use the identifier, not the character's content.
- **FR-003**: Each saved card in "My characters" MUST open the detail view by mouse, touch and keyboard.
- **FR-004**: The detail view MUST show portrait, name, epithet, race, class, gender, age, alignment and the full story
  (title and every paragraph, drop cap on the first) in the current language, in the style of the generator card.
- **FR-005**: The detail view MUST have its own address under "My characters"; an unknown address MUST show a "not
  found" message with a link back.
- **FR-006**: The detail view MUST offer "Back", "Open in the generator" and "Delete" (with confirmation); "Translate
  with AI" MUST appear under the same conditions as on the home page.
- **FR-007**: "Open in the generator" MUST make the character current on the home page and keep the previous current
  character in the history.
- **FR-008**: The detail view MUST be reusable for a character that is not saved (e.g. a party member), with only the
  actions that apply.
- **FR-009**: All new interface text MUST exist in English and French.

### Key Entities

- **Saved character**: a character plus a stable identifier, stored on the device.
- **Character detail view**: a read-only presentation of one character with context-dependent actions.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: From "My characters", a user reaches the full story of a saved character in 1 interaction.
- **SC-002**: 100% of saved characters, including those saved by earlier versions, open in a detail view showing every
  property and story paragraph.
- **SC-003**: Reloading a detail view shows the same character in 100% of cases.
- **SC-004**: Deleting one of two identical-looking saved characters removes exactly one.
- **SC-005**: The detail view has no accessibility violation (automated check) and no horizontal scroll at 360 px, in
  both modes and both languages.

## Assumptions

- The detail view is a page of its own (not a dialog), so it has an address and works with back/forward.
- Editing properties in place stays a separate roadmap item; "Open in the generator" covers rerolling for now.
- The history panel keeps its current behaviour (clicking an entry loads it into the generator).
