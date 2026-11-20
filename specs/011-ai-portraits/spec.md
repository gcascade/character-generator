# Feature Specification: AI Portraits

**Feature Branch**: `011-ai-portraits`

**Created**: 2026-11-20

**Status**: Draft

**Input**: User description: "AI portraits (spec 011). Generate a portrait image with AI from a character's description (race, class or occupation, gender, age, alignment/epithet, a fixed painterly style matching the existing portraits), for characters and side characters, since 130 of 162 race/class portraits are missing and NPCs only have an emblem. Free image services discussed earlier: AI Horde (anonymous key, browser-capable, slow ~1 min) for in-app portraits; Cloudflare Workers AI (free daily quota, FLUX schnell) for a one-off batch of missing generic portraits committed to the repo. Must keep working without AI (emblem/static portraits remain the fallback)."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - A portrait made for my character (Priority: P1)

A player likes a generated character — a gnome bard of 120 — but the portrait slot shows an emblem. They click "Paint a
portrait": a progress indicator says the painting is in progress (it can take about a minute, with an estimate), and
the portrait appears, matching race, class, gender, age and the style of the existing portraits. The same works for
a side character (with their occupation). If they don't like it, they can paint another one, or go back to the
default portrait.

**Why this priority**: This is the feature: most race/class combinations and every side character have no picture.

**Independent Test**: With the image service reachable (or a fake one in tests), paint a portrait for a character
and a side character; it is shown in the portrait slot; failure or cancellation leaves the previous picture.

**Acceptance Scenarios**:

1. **Given** a character or side character, **When** "Paint a portrait" is used, **Then** the app shows progress
   with an estimated wait and a Cancel action, then the new portrait in the portrait slot.
2. **Given** a painting in progress, **When** the user cancels, navigates away or the service fails, **Then** the
   previous portrait (image or emblem) stays and a clear message explains what happened.
3. **Given** a painted portrait, **When** the user asks for another, **Then** a new one is painted; **When** they
   remove it, **Then** the default portrait (image or emblem) comes back.
4. **Given** the description sent to the service, **Then** it only contains the character's visible traits (race,
   class or occupation, gender, age range, look) and a fixed style — never names or story text written by the user.

---

### User Story 2 - Portraits that stay (Priority: P1)

The player saves the character: the painted portrait is kept with it, shows in "My characters", on its page and in
the party, and survives a reload. The same applies to saved side characters and parties.

**Why this priority**: A portrait that disappears on reload is little use.

**Independent Test**: Paint, save, reload: the portrait is still there in the list, on the details page and in the
party member card.

**Acceptance Scenarios**:

1. **Given** a saved character with a painted portrait, **When** the app is reopened, **Then** the portrait is shown
   everywhere the character appears.
2. **Given** the browser storage is nearly full, **When** a portrait cannot be kept, **Then** the character is still
   saved without it and the user is told.
3. **Given** a share link of a character with a painted portrait, **When** it is opened elsewhere, **Then** the
   default portrait is shown (links stay short; the picture is not in the link).

---

### User Story 3 - Fill the missing default portraits (Priority: P2)

[NEEDS CLARIFICATION: Should this feature also produce the 130 missing default race/class portraits once, as files
in the project (painted in a batch by the maintainer's tooling), or stay limited to in-app portraits?]

**Why this priority**: Default portraits benefit every visitor, without waiting for a painting.

**Independent Test**: The portrait guide lists no missing file for the combinations painted; the app shows them
instead of the emblem.

**Acceptance Scenarios**:

1. **Given** the batch tool and a service account, **When** it runs, **Then** it writes the missing portraits at the
   expected paths and size, in the existing style, and updates the portrait guide.
2. **Given** a combination already painted by hand, **When** the batch runs, **Then** it is never overwritten.

---

### Edge Cases

- Service queue very slow or unavailable: the wait estimate updates; after a time limit the painting stops with a
  message; the app stays usable meanwhile (painting runs in the background of the page).
- Two paintings at once (character page and party): each card shows its own progress; at most one request per
  character at a time.
- Inappropriate output: the request always asks for a safe, non-explicit portrait; the user can remove any portrait.
- Offline or blocked service (corporate network, privacy extensions): the button explains the service cannot be
  reached; nothing else changes.
- Characters rerolled after painting: changing race, class, gender, age or occupation keeps the portrait but marks it
  as possibly outdated, with "paint again".
- Privacy: the user is told, before the first painting, which service receives the description, and that the
  description contains no name or personal data.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Characters and side characters MUST offer "Paint a portrait" when an image service is available, and
  never require it: without it, images and emblems are shown as today.
- **FR-002**: The description sent MUST be built by the app from visible traits only (race, class or occupation,
  gender, age range, a short look) plus a fixed style matching the existing portraits; no names, no user text.
- **FR-003**: Painting MUST show progress with an estimated wait, be cancellable, stop after a time limit, and leave
  the previous picture on failure, with a clear message.
- **FR-004**: The painted portrait MUST replace the default one wherever the character appears, and be removable.
- **FR-005**: Painted portraits of saved characters, side characters and party members MUST survive a reload;
  storage limits are handled without losing the character.
- **FR-006**: Share links MUST stay as they are; a shared character shows its default portrait.
- **FR-007**: The image service used MUST be [NEEDS CLARIFICATION: a free, no-account service only (slow queue), the
  user's own image provider with a key (fast, may cost), or both?].
- **FR-008**: Before the first painting, the user MUST be told which service receives the description.
- **FR-009**: Changing a trait shown in the portrait MUST mark a painted portrait as possibly outdated.

### Key Entities

- **Painted portrait**: an image for one character or side character, with the traits it was painted from and the
  service that painted it.
- **Portrait request**: the description, its progress (queued, painting, done, failed, cancelled) and wait estimate.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: With the service reachable, 90% of paintings finish in under 3 minutes, with progress shown the whole
  time.
- **SC-002**: 100% of failed or cancelled paintings leave the previous picture and show a message.
- **SC-003**: A painted portrait of a saved character is shown after a reload in 100% of the places the character
  appears.
- **SC-004**: No request ever contains a character's name or user-written text (checked by tests on every request).
- **SC-005**: Without any image service, the app behaves exactly as before (all existing tests pass).

## Assumptions

- Painting is on demand only (a button), never automatic, so no request leaves the browser without the user asking.
- Portraits are stored in the browser with the saved character; the number kept may be limited by the browser.
- The style matches the existing portraits: semi-realistic digital painting, waist-up, facing the viewer, fantasy
  background matching the race, no text.
- The service's terms allow use from a hobby web app; anonymous use can be slower than with a free account.
