# Feature Specification: Visual Refresh

**Feature Branch**: `005-visual-refresh`

**Created**: 2026-11-19

**Status**: Draft

**Input**: User description: "Visual refresh with a heroic fantasy identity, done before the party generator so new pages are born with it. 1) Fantasy theme: serif display font for titles (e.g. Cinzel) with a readable body font, subtle parchment background, gold/brown palette replacing default MUI blue, all through the theme. 2) Character card hierarchy: name + epithet as a real heading, race and class as colored badges, properties in a compact grid with dice and padlocks less repetitive. 3) Background as a story: drop cap on the first paragraph and a proper reading mode instead of the truncated "Read more…" cut mid-word. 4) Alerts: one notification that updates instead of stacked toasts. 5) Dark mode with the same palette (follows the system, with a toggle). 6) Portrait on phone: a smaller version at the top of the card instead of hidden. Bilingual, accessible (contrast AA, focus visible), phone-friendly, no change to generation logic."

**Note**: implemented before spec 004 (party generator), so that the party page uses the new look from the start.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - The app looks like heroic fantasy (Priority: P1)

A visitor opens the site and immediately sees a fantasy tool rather than a generic web form: titles in an engraved
serif lettering, warm parchment tones, gold and brown accents, consistent on every page (generator, my characters,
settings, menu).

**Why this priority**: It is the main gain of the refresh and the base every other story builds on.

**Independent Test**: Open each page in both languages and compare with the agreed mock-ups; no default-blue element
remains; automated contrast checks pass.

**Acceptance Scenarios**:

1. **Given** any page, **When** it is displayed, **Then** titles use the display lettering, body text uses a readable
   lettering, and the colours come from the fantasy palette (no default blue left).
2. **Given** any text or control, **When** checked for contrast, **Then** it meets WCAG AA (4.5:1 for text, 3:1 for
   large text and controls) in light and dark modes.
3. **Given** keyboard navigation, **When** a control is focused, **Then** a clearly visible focus outline is shown.
4. **Given** the network is slow or offline after first load, **When** pages are shown, **Then** the fonts are served
   with the site (no request to a third-party font service) and text stays readable while fonts load.

---

### User Story 2 - A character card that reads at a glance (Priority: P1)

On the home page, the character's name and epithet form a proper heading; race and class appear as coloured badges;
the other properties sit in a compact grid; dice and padlocks no longer repeat at full weight on every line.

**Why this priority**: The card is the heart of the app; today it is a long, repetitive list.

**Independent Test**: Show the card on desktop and phone; the name, epithet, race and class are identifiable in one
look; every property can still be rerolled and locked with mouse and keyboard.

**Acceptance Scenarios**:

1. **Given** a character, **When** the card is shown, **Then** "First name Last name" is the card heading with the
   epithet under it, and race and class are badges with a colour per race and per class.
2. **Given** the property grid, **When** the user hovers or focuses a property, **Then** its reroll die and padlock are
   shown; a locked property always shows its padlock (locked state visible without hovering).
3. **Given** a phone, **When** the card is shown, **Then** a smaller portrait appears at the top of the card, and the
   grid falls back to one column without horizontal scroll.
4. **Given** a screen reader, **When** it reads the card, **Then** headings, badges and every die and padlock have
   meaningful translated labels (as today).

---

### User Story 3 - The background reads like a story (Priority: P2)

The background is presented like a page of a chronicle: its title, a drop cap on the first paragraph, comfortable
line length. Long stories are no longer cut in the middle of a word.

**Why this priority**: The fragment-based stories are now rich; they deserve to be read.

**Independent Test**: Generate characters with long backgrounds, check no text is cut mid-word, and that the full
story is reachable in one action and closable with the keyboard.

**Acceptance Scenarios**:

1. **Given** a background, **When** it is shown, **Then** the first paragraph starts with a drop cap and the text keeps
   a comfortable line length.
2. **Given** a long background, **When** it does not fit, **Then** the card shows the first paragraph in full and a
   "Read the story" button opens a reading view over the page (full screen on phone), closable with Escape and a
   close button, returning focus to the button
3. **Given** any shortened view, **When** it is shown, **Then** it ends on a whole paragraph or sentence, never in the
   middle of a word.

---

### User Story 4 - One calm notification (Priority: P2)

Generating several characters in a row no longer stacks identical messages: a single notification shows the latest
outcome and updates in place.

**Why this priority**: Stacked toasts hide the history panel and look broken (seen on the current site).

**Independent Test**: Click Generate five times quickly: at most one notification is visible, showing the latest
message; warnings and errors stay until dismissed or replaced.

**Acceptance Scenarios**:

1. **Given** a notification is visible, **When** a new outcome arrives, **Then** it replaces the visible one instead of
   adding another.
2. **Given** a success notification, **When** a few seconds pass, **Then** it disappears on its own; warnings and
   errors stay until closed or replaced.
3. **Given** a notification, **When** it appears, **Then** screen readers announce it once (polite for success and
   info, assertive for errors).

---

### User Story 5 - Dark mode (Priority: P3)

In the evening the user switches to a dark "candle-lit" version of the same palette, or the app follows the system
setting automatically.

**Why this priority**: Comfort; secondary to the main identity.

**Independent Test**: Switch the system theme and the in-app toggle; every page is readable and keeps AA contrast.

**Acceptance Scenarios**:

1. **Given** no choice was made, **When** the app opens, **Then** it follows the system light/dark setting.
2. **Given** the toggle (next to the language selector and in Settings), **When** the user picks light, dark or
   system, **Then** the app switches immediately and remembers the choice after a reload.
3. **Given** dark mode, **When** portraits and badges are shown, **Then** they stay legible and keep AA contrast.

---

### Edge Cases

- Very long French labels in badges and the grid (e.g. "Chaotique Mauvaise", long epithets): wrap without overflow.
- Legacy characters with a background of a single paragraph or none: drop cap applies only when a paragraph exists.
- AI-written backgrounds with more paragraphs than app content: same presentation, reading mode handles any length.
- Users who prefer reduced motion: no decorative animation (notifications and reading view appear without motion).
- Storybook and tests keep working under both colour modes.

## Clarifications

### Session 2026-11-19

- Q: How is the full story read? → A: In a reading view opened over the page (full screen on phone); the card shows
  the first paragraph in full and a "Read the story" button.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The app MUST use one shared fantasy theme (display lettering for titles, readable lettering for text,
  parchment background, gold/brown palette) applied to every page and component, with no default-blue left.
- **FR-002**: Fonts MUST be served with the site, with a readable fallback while they load.
- **FR-003**: All text and controls MUST meet WCAG AA contrast in light and dark modes, and focus MUST be visible.
- **FR-004**: The character card MUST show name + epithet as its heading and race and class as coloured badges (one
  colour per race and per class, defined once and reused by history and saved characters).
- **FR-005**: Properties MUST be laid out in a compact grid; dice and padlocks MUST stay reachable by mouse, touch and
  keyboard, and locked properties MUST show their padlock at all times.
- **FR-006**: On phone width the card MUST show a smaller portrait at the top and stay without horizontal scroll.
- **FR-007**: Backgrounds MUST be presented with their title and a drop cap on the first paragraph; shortened views
  MUST never cut a word; the full story MUST be reachable in one action (a reading view opened from the card).
- **FR-008**: Only one notification MUST be visible at a time; a new outcome replaces it; success disappears on its
  own, warnings and errors stay until closed or replaced.
- **FR-009**: Users MUST be able to choose light, dark or system mode; the choice MUST be remembered; the default
  follows the system.
- **FR-010**: Generation, locking, AI and saving behaviour MUST NOT change (all existing behaviour tests keep passing).
- **FR-011**: All new interface text MUST exist in English and French.

### Key Entities

- **Theme**: palette (light and dark), lettering, spacing and component styles shared by the whole app.
- **Colour mode preference**: light, dark or system; stored on the device.
- **Race and class colours**: one colour per race and per class, each legible in both modes.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of pages pass an automated accessibility check with no contrast or focus violation, in both modes.
- **SC-002**: A user identifies name, epithet, race and class of the character in under 3 seconds (one glance at the
  card heading and badges).
- **SC-003**: The home card on desktop is at least 25% shorter in height than today for the same character, without
  losing any information.
- **SC-004**: Generating 5 characters in a row shows at most 1 notification at any time.
- **SC-005**: No background text is ever cut mid-word, for all app content in both languages.
- **SC-006**: Every page renders without horizontal scroll at 360 px wide, in both languages and both modes.
- **SC-007**: The maintainer validates the mock-ups (light, dark, phone) before implementation is merged.

## Assumptions

- Mock-ups (home page light/dark, phone, my characters) are produced and validated with the maintainer at the planning
  stage, before implementation.
- Cinzel (titles) and a readable serif or sans-serif for body text are free fonts that can be shipped with the site.
- The parchment background is a light texture or gradient that does not reduce text contrast.
- Portrait images are unchanged; only their size and placement change.
- Page structure (routes, menu entries) is unchanged; this feature is visual only.
