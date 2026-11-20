# Data Model: Party Depth

## Tie

`{ id: string; type: TieTypeId; from: memberId; to: memberId }` — `from ≠ to`; each member in ≤ 2 ties; no duplicate
pair. Tie types: `{ id, directed: boolean }` in `partyDepth.json`; texts `{a}`/`{b}` placeholders (first names).

## Role

`RoleId` from `partyDepth.json` roles: `{ id, unique?: boolean, area: BalanceArea, classes: Record<Class, 0–3>,
alignment?: { lawful?, chaotic?, good?, evil? } }`. `PartyMember.role?: RoleId` (always set on new parties).

## Adventure hook

`Party.hook?: { placeId; patronId; threatId }`; `Party.text.hook?: string` when written by the AI.

## Balance (computed)

`balanceOf(party): Record<BalanceArea, 0 | 1 | 2 | 3>` with `BalanceArea = 'fighting' | 'magic' | 'healing' |
'stealth' | 'talking'`, and `gaps(party): BalanceArea[]`.

## Share link `p2`

Party payload v1 + `[ties [[typeSlug, fromIndex, toIndex]...], roles [roleSlug per member], hook [place, patron,
threat]]`; AI text may include the hook.
