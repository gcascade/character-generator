# Feature Specification: Share Link

**Feature Branch**: `007-share-link`

**Created**: 2026-11-19

**Status**: Draft

**Input**: User description: "Share link: a URL that recreates a character or a party, so a player can send it to friends or a game master. No backend: everything needed is in the link."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Share a character (Priority: P1)

A player generated a hero they like and wants to send it to their game master. They click "Share" on the character
and get a link (copied to the clipboard, or sent through the phone's share sheet). The game master opens the link and
sees exactly the same character — portrait, names, epithet, properties and story — and can save it to their own "My
characters" or open it in the generator.

**Why this priority**: Sharing one character is the core need and the simplest case.

**Independent Test**: Share a character, open the link in a fresh browser profile (nothing saved), check every
property and story paragraph is identical, then save it.

**Acceptance Scenarios**:

1. **Given** a character on the home page, its detail page or a party member, **When** the user chooses "Share",
   **Then** a link is produced and copied (or the device share sheet opens) with a confirmation message.
2. **Given** a share link, **When** anyone opens it, **Then** a page shows the same character with every property and
   the full story, without needing anything saved on their device.
3. **Given** the shared character page, **When** the visitor chooses "Save to my characters", **Then** it is added
   to their saved characters (once) and stays there after a reload; "Open in the generator" makes it current on the
   home page.
4. **Given** a character made from the app's content, **When** the visitor's interface is in another language,
   **Then** the story is shown in the visitor's language (same story); AI-written text is shown as written, with the
   existing "written in" label.

---

### User Story 2 - Share a party (Priority: P2)

A game master prepares a party and sends one link to all players. Everyone opens the same party: its name, story and
members.

**Why this priority**: Builds on US1; very useful at the table but secondary to a single character.

**Independent Test**: Share a party of 6, open the link elsewhere, check name, story and every member; save the
party.

**Acceptance Scenarios**:

1. **Given** a party on the Party page or in the Parties tab, **When** the user chooses "Share the party", **Then** a
   link is produced and copied (or shared) with a confirmation.
2. **Given** a party share link, **When** it is opened, **Then** the party name, story and every member card are
   shown, and each member's full sheet can be read.
3. **Given** the shared party page, **When** the visitor saves it, **Then** it appears in their Parties tab; they can
   also open it on their Party page or save a single member.

---

### User Story 3 - Robust links (Priority: P3)

Links keep working: a damaged, truncated or tampered link shows a clear message instead of a broken page, and links
made today still open after the app's content grows.

**Why this priority**: Trust in links; the app must never crash on input it does not control.

**Independent Test**: Open a truncated link, a link with altered data, and a link referring to content that no longer
exists.

**Acceptance Scenarios**:

1. **Given** a damaged or truncated link, **When** it is opened, **Then** a "This link cannot be read" message and a
   way to the generator are shown.
2. **Given** a link whose data passes the format but contains invalid values (unknown race, absurd age, overlong
   text), **When** it is opened, **Then** it is rejected the same way (never partially shown with wrong data).
3. **Given** a link referring to a story fragment that no longer exists, **When** it is opened, **Then** the character
   is shown with a replacement fragment of the same kind (same race, class or alignment) rather than failing.

---

### Edge Cases

- Very long AI-written stories: the link stays usable (shareable in common messaging apps); the format is compact.
- A shared character already saved by the visitor (same content): "Save" says it is already saved instead of adding a
  duplicate.
- Clipboard blocked by the browser and no share sheet: the link is shown in a field the user can copy by hand.
- Opening a link while the generator holds an unsaved character: nothing is replaced unless the visitor chooses "Open
  in the generator" (the previous character then goes to the history, as in spec 006).
- Locks, settings and saved data of the visitor are never changed by merely opening a link.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Users MUST be able to share a character from the home card, a saved character's page and a party member.
- **FR-002**: Users MUST be able to share a party from the Party page and from the Parties tab.
- **FR-003**: Sharing MUST produce a link that contains everything needed to recreate the character or party, without
  any server; the link MUST be copied to the clipboard or passed to the device share sheet when available, with a
  confirmation, and shown for manual copy otherwise.
- **FR-004**: Opening a character link MUST show the character read-only with every property and the full story, plus
  "Save to my characters" and "Open in the generator".
- **FR-005**: Opening a party link MUST show the party name, story and members (with their full sheets), plus "Save
  the party" and "Open on the Party page"; single members can be saved.
- **FR-006**: App-made content MUST be shared by reference, so it renders in the visitor's language; AI-written text
  MUST be shared as written, with its language.
- **FR-007**: Links MUST be validated entirely before display; invalid links MUST show a clear message, never partial
  or wrong data.
- **FR-008**: Links MUST carry a format version so that future formats can still read today's links; unknown fragment
  references MUST be replaced by a fragment of the same kind.
- **FR-009**: Opening a link MUST NOT change the visitor's saved data, current character, party or locks unless they
  choose an action.
- **FR-010**: All new interface text MUST exist in English and French.

### Key Entities

- **Share link**: an address of the app carrying a versioned, compact encoding of one character or one party.
- **Shared character / party**: the data recreated from a link, shown read-only until the visitor saves or opens it.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A user shares a character in 1 interaction from any of the three places (home card, detail page, party
  member).
- **SC-002**: 100% of characters and parties produced by the app (including AI text) are recreated identically from
  their link (round trip tested on 1,000 random characters and parties).
- **SC-003**: A link for an app-made character is at most 300 characters long; a party of 6 at most 1,500.
- **SC-004**: 100% of damaged links tested (truncated, altered, random) show the "cannot be read" message and never an
  error screen.
- **SC-005**: The shared pages have no accessibility violation (automated check) and no horizontal scroll at 360 px, in
  both modes and languages.

## Assumptions

- No backend and no link shortener: the data is in the link itself (in the part of the address that is not sent to
  the server).
- Links do not expire and are not private: anyone with the link can see the character; the share message says so.
- Portraits are not embedded; the visitor's app shows the portrait matching race, class and gender.
- Shared parties keep their AI story if they have one; locked states of members are not shared.
