# Contract: More Races and Classes

- `slug(value: string): string` (src/content/slug.ts).
- `portraitFor(race, class, gender, name)` uses slugs.
- `RaceEmblem({ race, characterClass, height?, width? })` — accessible SVG.
- `CharacterImage`: emblem when the image file does not exist.
- `scripts/missing-portraits.mjs` → writes `docs/portraits.md` (path, recommended 512×768 PNG, style notes).
