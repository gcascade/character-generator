# Research: Party Generator

## R1. Drawing a party

- **Decision**: build a class plan first (locked members' classes count; without a shared class, take classes in a
  shuffled order so all differ up to 4 members, then start a new shuffled round), then an alignment plan (R2), then
  draw each unlocked member with `generateRandomCharacter({ ...constraints, characterClass, alignment })`, redrawing
  (bounded, then falling back to any unused name of the list) when its first name is already in the party.
- **Rationale**: reuses spec 003 compatibility rules; the plan makes variety and alignment rules hold by construction
  rather than by rejection sampling.
- **Alternatives considered**: drawing members then fixing violations (harder to prove); rejection sampling whole
  parties (unbounded).

## R2. Alignment modes

- **Decision**: "harmonious" (default): the party leans Good or Evil (never both); allowed alignments are the Good and
  Neutral ones, or the Neutral and Evil ones, chosen by the locked members if any (a locked Good member forces the
  first set, a locked Evil one the second), otherwise at random with Good twice as likely (heroic tone). "Anything goes":
  any alignment. A shared alignment constraint overrides both.
- **Rationale**: simple, explainable rule matching the clarification; heroic default.

## R3. Party text without gender agreement

- **Decision**: three fragment categories, ≥ 10 each per locale: `name` ("The Company of the Silver Lion" / "La
  Compagnie du Lion d'Argent"), `meeting` and `goal`. Placeholders: `{members}` (names joined with commas and "and" /
  "et"), `{first}` (a member's first name), `{count}` (number in words: "four" / "quatre"). Texts use the party as the
  subject ("the company", "la compagnie", "le groupe") so no word agrees with a member's gender; the content test
  forbids `{{…|…|…}}` selections in party texts and checks the French rules of spec 002.
- **Rationale**: SC-004 by construction, any mix of genders.
- **Alternatives considered**: agreement on a mixed group (French masculine plural by default, against the neutral
  phrasing decision of spec 002).

## R4. Storage and ids

- **Decision**: members get an `id` (`crypto.randomUUID()`), so rerolling, locking and saving one member does not rely
  on reference equality (known issue in CLAUDE.md, not fixed globally here). Current party in `localStorage["party"]`,
  saved parties in `localStorage["parties"]`, parsed with zod field by field; members reuse the stored-character
  schema.
- **Rationale**: FR-013, constitution IV.

## R5. AI party story

- **Decision**: `generatePartyStory(provider, party, locale)` sends the members' facts (names, races, classes,
  alignments, epithets) and asks for `{ name, story: string[] }` (2–4 paragraphs); validated with zod; on failure or
  invalid answer the app's text stays and the usual outcome alert explains why. Member facts are never read from the
  answer.
- **Rationale**: FR-011, same pattern as spec 001.

## R6. Layout

- **Decision**: controls in a card at the top (size, constraint selects with "Any", alignment mode toggle, Generate,
  Save party), the party story card below, then member cards in a responsive grid (1 column on phones, 2 on tablets,
  3 on desktop). Member card: small cropped portrait, `CharacterHeader` compact, alignment, first paragraph of the
  story with "Read the story", and actions (lock, reroll, save).
- **Rationale**: consistent with spec 005; phone-friendly (FR-012).
