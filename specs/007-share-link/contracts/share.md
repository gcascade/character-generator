# Contract: Share Link

## src/content/share.ts

- `encodeCharacter(character): string` / `decodeCharacter(data): Character | undefined`
- `encodeParty(party): string` / `decodeParty(data): Party | undefined`
- `shareUrl(kind: 'c' | 'p', data, base = location.origin + import.meta.env.BASE_URL): string`
- `parseShareHash(hash): { kind: 'character'; character } | { kind: 'party'; party } | undefined`
- `sameCharacter(a, b): boolean` — content equality ignoring `id`.

## src/hooks/useShare.ts

`{ share(target: { title: string; url: string }): Promise<void>, fallbackUrl?: string, closeFallback }` —
Web Share API → clipboard (+ alert) → fallback dialog.

## Components

- `ShareButton({ label, onShare, variant?: 'icon' | 'text' })`
- `ShareDialog({ url, onClose })` — read-only field + copy button.
- `CharacterDetail` gains optional `onSave`, `saved?: boolean`.

## Page

`/share` → `Share`: reads `location.hash`; character → `CharacterDetail` (Save, Open in the generator); party →
`PartyStory` + `PartyMemberCard`s (Save the party, Open on the Party page, Save member); invalid → `share.invalid`
message + link to the generator.

## UI keys (en / fr)

`share.character` (Share / Partager), `share.party` (Share the party / Partager le groupe), `share.copied` (Link copied —
anyone with it can see this character / Lien copié — toute personne qui l'a peut voir ce personnage),
`share.partyCopied`, `share.dialogTitle` (Copy this link / Copiez ce lien), `share.copy` (Copy / Copier),
`share.invalid` (This link cannot be read / Ce lien est illisible), `share.invalidHint`, `share.toGenerator`,
`share.sharedCharacter` (Shared character / Personnage partagé), `share.sharedParty` (Shared party / Groupe partagé),
`share.save` (Save to my characters / Sauvegarder dans mes personnages), `share.alreadySaved` (Already in my characters
/ Déjà dans mes personnages), `share.openParty` (Open on the Party page / Ouvrir sur la page Groupe).
