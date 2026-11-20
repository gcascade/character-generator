# Feature Specification: More Races and Classes

**Feature Branch**: `009-more-races-classes`

**Created**: 2026-11-20

**Status**: Draft

**Input**: User description: "More races and classes: halfling, gnome, half-elf, a demon-blooded race with an original name, dark elf; ranger, paladin, bard, druid, barbarian. Portraits: a neutral illustration while real images are missing (decided). Townsfolk/NPCs are a separate feature (spec 010)."

## Clarifications

### Session 2026-11-20

- Q: Which races and classes? → A: Races halfling, gnome, half-elf, dark elf and a demon-blooded race with an
  original name; classes ranger, paladin, bard, druid, barbarian.
- Q: Portraits for combinations without an image? → A: A neutral illustration per race until real images are added.
- Q: Townsfolk? → A: A separate NPC mode (spec 010).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - New races and classes everywhere (Priority: P1)

A player generates characters and gets the new races and classes as often as the existing ones: a halfling bard, a
dark elf ranger, a gnome druid… Each comes with fitting names, a lifespan-appropriate age, origin and training
paragraphs in both languages, colours and icons, and works in locks, parties, sharing and saving like the others.

**Why this priority**: This is the feature.

**Independent Test**: Generate 2,000 characters: every race and class appears; each new combination renders a full
story in both languages with names from the right lists.

**Acceptance Scenarios**:

1. **Given** the generator, **When** characters are generated, **Then** each of the 9 races and 9 classes can appear,
   with names from the race and gender lists and an age within the race's lifespan.
2. **Given** a new race or class, **When** its story is shown, **Then** it has origin (race) and training (class)
   paragraphs written for it, in English and French, agreeing with every gender.
3. **Given** the race or class dice and locks, the party generator (class variety, roles, balance) and share links,
   **When** they are used with the new values, **Then** they behave as for the existing ones; links made before this
   feature still open with the same values.
4. **Given** a new race or class, **When** it is displayed, **Then** it has a colour and an icon meeting the contrast
   rules in both modes, and French labels agree with the gender.

---

### User Story 2 - A portrait for every character (Priority: P1)

Combinations without a painted portrait show a neutral illustration (an emblem of the race, framed in the class
colour) instead of a broken or generic image, and gain the real portrait as soon as the image file is added.

**Why this priority**: Without it, most new combinations would look broken.

**Independent Test**: Show a character of each new race; the illustration appears; add a real image file for one
combination and it is used instead.

**Acceptance Scenarios**:

1. **Given** a combination without an image file, **When** its portrait is shown, **Then** a neutral illustration of
   the race, with the class colour, is shown, with a meaningful text alternative.
2. **Given** a combination with an image file, **When** its portrait is shown, **Then** the image is used.
3. **Given** the repository, **When** a contributor wants to add portraits, **Then** a guide lists the missing
   images with their exact file names and recommended size.

---

### Edge Cases

- Saved characters, parties and share links from before: unchanged; enum order is append-only so links keep their
  meaning.
- Dark elf vs elf: distinct race with its own names, origins and lifespan; elf-related texts are not reused as is.
- Demon-blooded race name: original, not taken from a specific game; French and English names chosen to read
  naturally.
- Party balance and roles: new classes have balance points and role weights (e.g. bard → talking, druid → healing
  and magic, barbarian → fighting, ranger → stealth and fighting, paladin → fighting and healing).
- Small phone screens: longer French class names (e.g. "Barbare", "Paladine", "Rôdeuse") fit badges and grids.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The app MUST offer 5 new races (halfling, gnome, half-elf, dark elf, a demon-blooded race) and 5 new
  classes (ranger, paladin, bard, druid, barbarian), drawn as often as existing ones.
- **FR-002**: Each new race MUST have a lifespan, name lists (masculine, feminine, neutral first names and last
  names, at least 40 each, unique) and at least 4 origin fragments per language.
- **FR-003**: Each new class MUST have at least 4 training fragments per language, balance points and role weights.
- **FR-004**: Every new text MUST exist in English and French with gender agreement (neutral phrasing for
  non-binary characters in French).
- **FR-005**: New races and classes MUST have a colour and an icon meeting WCAG AA in both modes.
- **FR-006**: Combinations without an image MUST show a neutral illustration of the race in the class colour;
  existing portraits are unchanged.
- **FR-007**: Existing saved data and share links MUST keep working unchanged.
- **FR-008**: A guide MUST list missing portrait files (path, size, style notes).

### Key Entities

- **Race**: name (EN/FR, gendered labels), lifespan, name lists, origin fragments, colour, icon, emblem.
- **Class**: name (EN/FR, gendered labels), training fragments, colour, icon, balance points, role weights.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Over 2,000 generated characters, every race and class appears at least 5% of the time.
- **SC-002**: 100% of new texts render without placeholders or agreement errors for every gender in both languages.
- **SC-003**: 100% of new colours pass the contrast test in both modes.
- **SC-004**: 100% of characters show either a portrait or the neutral illustration — never a broken image.
- **SC-005**: All existing tests about saved data and share links keep passing; a link from before decodes to the
  same race and class.

## Assumptions

- Names (confirmed by the maintainer): Halfling / Halfelin, Gnome / Gnome, Half-elf / Demi-elfe, Dark elf / Elfe noir (gendered
  label: Elfe noir / Elfe noire), demon-blooded race "Ashborn" / "Cendré" ({{Cendré|Cendrée|Cendré}}).
- Lifespans: halfling 150, gnome 400, half-elf 180, dark elf 500, Ashborn 120.
- Neutral illustrations are vector emblems drawn for this project (no external assets).
- An AI portrait feature is a later, separate item.
