# Contracts: NPC Mode

## Content functions (`src/content/npc.ts`)

- `generateNpc(template?: NpcTemplate): Npc` — fills every missing field; daily fragment matches the occupation;
  age within `[max(15, minAge), MAX_AGE[race]]`.
- `generateNpcs(count: number, template?: NpcTemplate): Npc[]` — distinct first names.
- `rerollNpc(npc, target: LockableNpcProperty | NpcSection, locked: LockableNpcProperty[]): Npc` — changes only the
  target (and what must follow: race → names/age if they no longer fit; occupation → daily fragment and age if
  below minimum); returns the same object when nothing else fits; drops AI text.
- `renderNpc(npc, locale)` — see data model.

## Share (`src/content/share.ts`)

- `shareUrl({ kind: 'npc', npc })` → `<base>share#n1.<data>`; `parseShareHash` returns `{ kind: 'npc', npc }`.
- Character and party prefixes unchanged.

## AI (`src/ai/npc.ts`)

- `generateNpcSheet(provider, npc, signal, locale) → { npc, source: 'ai' | 'app', failure? }`; the app's facts are
  never read from the answer.

## Routes

- `/npcs` (generator), `/npcs/:id` (saved NPC), `/characters` tab `npcs`, `/share#n1.…`.
