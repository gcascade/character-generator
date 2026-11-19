# Contract: Party (src/content, contexts, AI, UI)

## src/content/party.ts

- `MIN_PARTY_SIZE = 2`, `MAX_PARTY_SIZE = 6`, `DEFAULT_PARTY_SIZE = 4`.
- `generateParty({ size, constraints, alignmentMode, keep?: PartyMember[] }): Party` — keeps `keep` members that are
  locked, completes to `size` following R1/R2, unique first names, new `content`.
- `rerollMember(party, memberId): Party` — replaces one unlocked member, respecting constraints, mode, class variety
  and names of the others.
- `allowedAlignments(mode, constraints, lockedMembers): CharacterAlignment[]`.
- `renderParty(party, locale): { name; story: string[]; writtenIn?; writtenBy? }`.
- `checkParty(party): string[]` — rule violations (empty when valid); used by tests and to flag locked members that no
  longer match the constraints.

## src/content/storedParty.ts

- `parseStoredParty(raw)`, `parseStoredParties(raw)` — never throw.

## src/contexts/PartyContext.tsx, src/hooks/useParty.ts

`{ party, size, constraints, alignmentMode, setSize, setConstraint, setAlignmentMode, generate, rerollMember,
toggleLock, saveParty, saveMember, savedParties, openParty, deleteParty, setPartyText }`.

## src/ai

- `partyStoryPrompt(party, locale)`, `partyStorySchema = z.object({ name, story: z.array(...).min(2).max(4) })`.
- `generatePartyStory(provider, party, locale, signal): Promise<{ party; outcome }>`.

## UI keys (en / fr)

`nav.party` (Party / Groupe), `page.party` (Party generator / Générateur de groupe), `party.size`, `party.any`
(Any / Peu importe), `party.alignmentMode`, `party.harmonious` (Harmonious / Harmonieux), `party.anything`
(Anything goes / Tout est permis), `party.generate`, `party.save`, `party.saved`, `party.member.lock`,
`party.member.unlock`, `party.member.reroll`, `party.member.save`, `party.notMatching`, `party.empty`,
`characters.tab.characters`, `characters.tab.parties`, `parties.open`, `parties.delete`, `parties.empty`.
