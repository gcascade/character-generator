# Research: NPC Mode

## R1. Separate model, shared building blocks

- **Decision**: a new `Npc` type (not a `Character` with optional fields). It reuses race and gender enums, name
  lists (`firstNamesFor`), lifespans (`MAX_AGE`), labels, `renderText` and the race emblem.
- **Rationale**: characters require class, alignment and a story everywhere (parties, AI, share, storage); making
  them optional would ripple through all of it.
- **Alternatives**: occupation as a 10th class (rejected in spec 009, option A).

## R2. Content layout

- **Decision**: `src/data/content/npc.json` lists occupations `{ id, minAge, icon }` and fragments
  `{ id, section, occupation? }` with sections `look | daily | quirk | rumour | secret | opinion`. Daily-life
  fragments belong to an occupation (`daily-blacksmith-dawn`); the other sections are shared. Texts live in
  `src/data/locales/<locale>/npc.json` keyed by id, with `{firstName}`, `{lastName}`, `{fullName}` and
  `{{m|f|n}}`. Occupation labels go into `labels.json` as `occupation.<Value>`.
- **Rationale**: same pattern as character fragments; `content.test.ts` checks parity and French rules for the
  new file automatically (it iterates locale files), plus counts per occupation and section.

## R3. Ages

- **Decision**: age drawn between `max(15, occupation.minAge)` and the race lifespan × 0.9 (old NPCs exist, but few
  at the edge). Min ages: alchemist, priest, healer, scribe 20; noble, beggar, stablehand 15; others 16.
- **Rationale**: FR edge case "age fits occupation and race"; a locked age incompatible with a locked race is
  handled like characters (the race reroll keeps the character when nothing fits).

## R4. Batch

- **Decision**: "Generate 5" draws 5 NPCs with distinct first names respecting the constraints (and locked values
  except names); cards show name, race, occupation and quirk. "Open" makes a card the current NPC (shown in the
  sheet above, scroll into view); the batch stays until the next "Generate 5". A card can also be saved directly.
- **Rationale**: no dialog stack; the sheet is the one place to reroll and save.

## R5. Locks

- **Decision**: NPC locks (`firstName`, `lastName`, `race`, `gender`, `age`, `occupation`) are a set in
  `NpcContext`, stored with the current NPC. Values come from the current NPC (as `templateOf` does for characters).
- **Rationale**: `LockProvider` is keyed to character properties and the generator page; a small dedicated set is
  simpler than generalising it.

## R6. Storage

- **Decision**: `localStorage["npc"] = { version: 1, current?, batch: Npc[], locked: string[] }`,
  `localStorage["npcs"] = { version: 1, npcs: Npc[] }`; zod schemas drop invalid entries (unknown fragment ids are
  replaced by a fragment of the same section, as for links). Saved NPCs get `crypto.randomUUID()` ids.

## R7. Share links

- **Decision**: `#n1.<base64url JSON>`: `[first, last, raceIndex, genderIndex, age, occupationIndex,
[lookSlug, dailySlug, quirkSlug, rumourSlug, secretSlug, opinionSlug] | 0, text?]` where `text` is
  `[language, look, daily, quirk, rumour, secret, opinion]` for AI-written sheets. Slugs use the existing
  shortest-unique-suffix helpers; missing slugs fall back to a fragment of the same section. `Occupations` is
  append-only.

## R8. AI

- **Decision**: `generateNpcSheet(provider, npc, locale)` asks for `{ firstName, lastName, look, daily, quirk,
rumour, secret, opinion }` (zod, each 1–600 chars), fixed facts = race (with spec 009 notes), occupation, gender,
  age. Result stored as `text` with `language` and `source: 'ai'`; failure → the fragment NPC and the usual message.
  Rerolling a section of an AI-written NPC switches the whole sheet back to fragments, as character rerolls drop
  AI text.
- **Rationale**: consistency with characters; keeps the data model simple (text is all-or-nothing).

## R9. Portrait

- **Decision**: `RaceEmblem` gains an optional `occupation` prop: neutral frame (secondary colour) and a small
  occupation icon badge at the bottom; NPC sheet and cards use it. No image files.

## R10. Naming

- **Decision**: UI "Side characters" / "Personnages secondaires", subtitle "Ready-to-play NPCs for the game master" /
  "PNJ prêts à jouer pour le MJ"; route `/npcs`; code `npc`.
