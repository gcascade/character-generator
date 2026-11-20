# Feature Specification: Party Depth (Ties, Roles, Balance, Adventure Hook)

**Feature Branch**: `008-party-depth`

**Created**: 2026-11-20

**Status**: Draft

**Input**: User description: "Ties between members — not every member has a tie, not every time. Roles in the party — not always the same roles. A balance indicator. An adventure starting point."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Ties between members (Priority: P1)

A game master generates a party and sees that some members already know each other: two of them are old rivals, one
owes another their life. Not every member has a tie, and some parties have none, as in real groups that just met.

**Why this priority**: Ties make a party feel like a group of people rather than four random cards; they are the
cheapest source of role-play hooks.

**Independent Test**: Generate 1,000 parties and check: some parties have no tie, no member has more than the
allowed number of ties, every tie names two different members and reads correctly in both languages.

**Acceptance Scenarios**:

1. **Given** a generated party, **When** it is shown, **Then** zero, one or several ties appear, each between two
   different members, written as a short sentence naming both (e.g. "Edith owes Kroth her life" / "Edith doit la vie à
   Kroth").
2. **Given** many generated parties, **When** they are compared, **Then** the number of ties varies, including parties
   with none, and no member is in more than two ties.
3. **Given** a tie, **When** the user rerolls or removes it, **Then** only that tie changes; rerolling or replacing a
   member removes the ties that involved them and may draw new ones for the newcomer.
4. **Given** ties between members, **When** the party is saved, shared or reloaded, **Then** the ties are kept.

---

### User Story 2 - Roles in the party (Priority: P1)

Each member gets a role in the group — leader, scout, healer, face, strategist, muscle… — that fits but does not
strictly follow their class: a rogue is often the scout but may be the face of the group; a cleric often the healer
but sometimes the leader.

**Why this priority**: Roles tell the table how the group works together; together with ties they are the core of
"party depth".

**Independent Test**: Generate 1,000 parties: each member has exactly one role, the same class gets different roles
across parties, and a party never has two leaders.

**Acceptance Scenarios**:

1. **Given** a generated party, **When** it is shown, **Then** each member card shows one role, drawn with a
   preference for roles that suit the member's class and alignment, never fixed.
2. **Given** a party, **When** it is generated, **Then** unique roles (leader) appear at most once, and the same role
   appears at most twice.
3. **Given** a member's role, **When** the user changes it, **Then** [NEEDS CLARIFICATION: can the user pick the role
   from a list, only reroll it at random, or both?]
4. **Given** roles, **When** the party is saved, shared or reloaded, **Then** the roles are kept.

---

### User Story 3 - Party balance (Priority: P2)

Under the party, a small balance panel shows what the group covers — fighting, magic, healing, stealth, talking — and
gently points out what is missing ("No one to heal the wounded").

**Why this priority**: Helpful for game masters and players, but derived from classes and roles rather than new
content.

**Independent Test**: Parties with known classes and roles produce the expected balance and missing-coverage hints.

**Acceptance Scenarios**:

1. **Given** a party, **When** it is shown, **Then** a balance panel shows a level per area (fighting, magic, healing,
   stealth, talking), derived from members' classes and roles.
2. **Given** an area with no coverage, **When** the panel is shown, **Then** a short hint names the gap; a party
   covering every area shows a short "well balanced" message.
3. **Given** the panel, **When** read by a screen reader, **Then** each level is announced as text, not only as
   colour or bars.

---

### User Story 4 - Adventure starting point (Priority: P2)

Each party gets an adventure hook: a place, someone who asks for help and a threat, written as a short paragraph
that suits the party ("In the salt marshes of Varn, a ferryman begs the company to find his missing daughter, taken
by something that sings under the water."). It can be rerolled on its own, and the AI can write it when a provider is
set.

**Why this priority**: Turns a generated party into a ready-to-play first session.

**Independent Test**: Generate parties and check each has a hook in both languages, rerollable alone; with a mocked
AI, the hook comes from the AI and falls back to the app's on failure.

**Acceptance Scenarios**:

1. **Given** a generated party, **When** it is shown, **Then** an adventure hook (place, patron, threat) appears, in
   the interface language, built from bilingual app content.
2. **Given** the hook, **When** the user rerolls it, **Then** only the hook changes.
3. **Given** an AI provider, **When** a party is generated, **Then** the AI may write the hook (and the party story)
   from the members' facts; on failure the app's hook stays, with the usual explanation.
4. **Given** the hook, **When** the party is saved, shared or reloaded, **Then** it is kept.

---

### Edge Cases

- A party of 2: at most one tie; balance hints still make sense ("small party" not treated as an error).
- A kept (locked) member: keeps their role; ties between two kept members are kept on regeneration.
- Shared links from before this feature (`p1`): still open, with no ties, roles drawn on load? [defaulted: shown with
  roles and hook drawn fresh, ties empty]; new links carry ties, roles and hook.
- French agreement: tie and hook texts must read correctly whatever the members' genders (neutral constructions, as
  for party texts); role names agree with the member's gender (category name for non-binary members).
- Saved parties from before this feature: loaded with roles and hook drawn once, then kept.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: A party MUST have 0 to N ties (N grows with party size; no member in more than two ties), each linking
  two different members with a tie type from bilingual app content; some generated parties MUST have no tie.
- **FR-002**: Users MUST be able to reroll or remove a single tie; replacing a member MUST drop their ties and MAY add
  new ones.
- **FR-003**: Each member MUST have exactly one role, drawn with weights from class and alignment affinities; the
  leader role MUST be unique; any role MUST appear at most twice.
- **FR-004**: Users MUST be able to change a member's role (see US2 clarification).
- **FR-005**: The party page MUST show a balance panel with a level per area (fighting, magic, healing, stealth,
  talking) and hints for gaps, readable without colour.
- **FR-006**: Each party MUST have an adventure hook (place, patron, threat) from bilingual app content, rerollable on
  its own; with AI, the AI MAY write it, with fallback.
- **FR-007**: Ties, roles and hook MUST be kept when the party is saved, reloaded or shared; parties and links from
  before this feature MUST still open.
- **FR-008**: Tie and hook texts MUST read correctly for any mix of genders in both languages; role names MUST agree
  with the member's gender in French.
- **FR-009**: All new interface text and content MUST exist in English and French.

### Key Entities

- **Tie**: a type (rival, debt of life, old mentor, sworn kin, shared secret…) and the two members it links.
- **Role**: a function in the group (leader, scout, healer, face, strategist, muscle, scholar, guardian…) with class
  and alignment affinities.
- **Balance**: per-area levels derived from classes and roles, plus gap hints.
- **Adventure hook**: references to a place, a patron and a threat fragment (or AI text with its language).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Over 1,000 generated parties of 4, between 15% and 40% have no tie, and 100% respect the tie limits.
- **SC-002**: Over 1,000 parties, each class gets at least 3 different roles, and no party has two leaders.
- **SC-003**: The same party composition gives at least 20 distinct adventure hooks in 100 draws, per language.
- **SC-004**: 100% of tie and hook texts render without placeholders or agreement errors for every mix of genders, in
  both languages (content tests).
- **SC-005**: Ties, roles and hook survive save, reload and share in 100% of round-trip tests; `p1` links still open.

## Assumptions

- At least 12 tie types, 10 roles, and 12 places, 12 patrons and 12 threats per language at launch.
- Balance is informative only: it never blocks generation or changes members.
- Ties are symmetric or directed depending on the type ("A owes B their life" is directed; "A and B are rivals" is
  symmetric); the text handles both.
