# Research: Share Link

## R1. Where the data goes

- **Decision**: in the URL fragment: `<origin><base>share#c1.<data>` / `#p1.<data>`.
- **Rationale**: the fragment is never sent to the server (privacy, no backend), survives GitHub Pages' `404.html`
  deep-link fallback, and React Router leaves it untouched.
- **Alternatives considered**: query string (sent to the server, logged); a shortener (backend, third party).

## R2. Compact format

- **Decision**: a positional array, JSON then base64url (UTF-8 safe through `TextEncoder`):
  character `[first, last, race, class, gender, alignment, age, refs, text?]` where enum values are indexes in the
  `as const` objects (append-only), `refs = [title, origin, training, turningPoint, goal, epithet]` hold the last
  segment of each fragment id (`origin-human-harbour` → `harbour`), and `text = [lang, source, epithet, title,
paragraphs[]]` only for written text. Party `[name, meeting, goal, mode, constraints, members[], text?]`.
- **Rationale**: SC-003 (≈ 150–250 characters for an app-made character) without a compression library; short
  references stay valid when fragments are added.
- **Alternatives considered**: `CompressionStream` (async, not in jsdom, little gain on short data); full ids (≈ +120
  characters).

## R3. Resolving references

- **Decision**: a short reference is resolved among the fragments of the same kind that fit the character (same
  category, race, class or alignment): exact `<prefix>-<slug>` match first; if missing (fragment removed), a random
  fragment of the same kind (FR-008). Epithets and party fragments the same way.
- **Rationale**: robust to content evolution; ids keep their meaning across languages.

## R4. Validation

- **Decision**: decode → JSON.parse → zod tuple schemas (index ranges, ages, string lengths as in the stored schemas,
  version prefix) → rebuilt character passes `storedCharacterSchema` too. Any failure → `undefined` → "cannot be read".
- **Rationale**: constitution IV; never partial display (FR-007).

## R5. Sharing UX

- **Decision**: `useShare` tries `navigator.share({ title, url })` on devices that support it (phones), then
  `navigator.clipboard.writeText(url)` with an alert "Link copied — anyone with it can see this character", then a
  dialog with a read-only text field and a copy button. A user cancelling the share sheet is not an error.
- **Rationale**: FR-003 and the edge case "clipboard blocked".

## R6. Shared page actions

- **Decision**: character: `CharacterDetail` with Save (disabled with "Already in my characters" when an identical
  character — same content, ignoring id — is saved) and Open in the generator (spec 006 behaviour). Party: the party
  components with Save the party (disabled when a saved party has the same members' content), Open on the Party page, and Save
  per member. Locked states are not shared (members arrive unlocked).
