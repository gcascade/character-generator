# Data Model: More Races and Classes

- `CharacterRaces` += `Halfling: 'Halfling'`, `Gnome: 'Gnome'`, `HalfElf: 'Half-elf'`, `DarkElf: 'Dark elf'`,
  `Ashborn: 'Ashborn'` (appended).
- `CharacterClasses` += `Ranger`, `Paladin`, `Bard`, `Druid`, `Barbarian` (appended).
- Names file per race: `{ first: { male[40+], female[40+], neutral[40+] }, last[40+] }`.
- Fragments: `origin-<race-slug>-<name>` (≥ 4 per race), `training-<class>-<name>` (≥ 4 per class).
- Labels: `race.<Value>`, `class.<Value>` with `{{m|f|n}}` in French.
