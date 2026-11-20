# Research: Party Depth

## R1. How many ties

- **Decision**: for a party of n members, draw k ties with k = 0..floor(n/2)+1, with probabilities tuned so that
  ~25% of parties of 4 have none (SC-001); pick pairs at random among members with fewer than 2 ties, never the same
  pair twice; tie type drawn among all types (directed types get a random direction).
- **Rationale**: "not always, not everyone" (user request); bounded and simple to test.

## R2. Roles

- **Decision**: each role has weights per class (0–3) and a small bonus per alignment axis (e.g. leader + lawful,
  face + good/neutral, muscle + chaotic); draw members in random order, each picking a role with probability
  proportional to its weight among roles still allowed (leader unique, any role at most twice); a weight of 0 for a
  class is raised to a small floor so any class can get any role.
- **Rationale**: affinity without determinism (SC-002); "not always the same roles".

## R3. Balance

- **Decision**: areas fighting, magic, healing, stealth, talking; each class contributes base points (e.g. Warrior
  fighting 2, Cleric healing 2 + fighting 1), each role adds 1 to its area; level = none (0) / low (1) / good (2–3) /
  strong (4+); hints for areas at none. Shown as labelled bars with the level as text.
- **Rationale**: transparent, computed, no stored state.

## R4. Hook text

- **Decision**: three fragment kinds per locale — `place` ("In the salt marshes of Varn" / "Dans les marais salants de
  Varn"), `patron` ("a ferryman begs the company for help" / "un passeur implore l'aide de la compagnie") and `threat`
  (a full sentence: "Something that sings under the water drags travellers to the bottom."). Rendered as
  `"{place}, {patron}. {threat}"`. No member names, no gender agreement.
- **Rationale**: independent fragments combine grammatically in both languages; ≥ 20 distinct hooks out of 1,728
  combinations (SC-003).

## R5. Compatibility

- **Decision**: new fields optional in storage; on load, a party without roles or hook gets them drawn once (then
  saved); ties stay empty. Share links: `p2` adds ties, roles and hook; `p1` decodes as before then completes roles and
  hook. Member role kept for locked members on regeneration; ties between two kept members kept.
