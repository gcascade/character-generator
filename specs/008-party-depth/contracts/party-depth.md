# Contract: Party Depth

## src/content/partyDepth.ts

- `drawTies(members): Tie[]`, `rerollTie(party, tieId): Party`, `removeTie(party, tieId): Party`
- `drawRoles(members, keep?): Record<memberId, RoleId>`, `setRole(party, memberId, role | 'random'): Party`
- `drawHook(): HookRefs`, `rerollHook(party): Party`
- `balanceOf(party)`, `gaps(party)`
- `renderTie(tie, party, locale): string`, `renderHook(party, locale): string`, `roleLabel(role, gender, locale)`
- `completeParty(party): Party` — fills missing roles and hook (older data)

## PartyContext additions

`rerollTie(id)`, `removeTie(id)`, `setRole(memberId, role | 'random')`, `rerollHook()`.

## UI keys (en / fr)

`party.ties`, `party.noTies`, `party.tie.reroll`, `party.tie.remove`, `party.role`, `party.role.random`,
`party.balance`, `balance.<area>`, `balance.level.<0-3>`, `balance.gap.<area>`, `balance.ok`, `party.hook`,
`party.hook.reroll`.
