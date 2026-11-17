# Quickstart: validating the bilingual app and fragment content

## Automated checks

```bash
npm run test:run
```

```bash
npm run typecheck
```

```bash
npm run lint
```

Key suites: the content data test (parity, placeholders, minimum counts, no neopronoun in French, name lists),
the renderer tests (each gender × locale), distinctness (≥ 60 distinct backgrounds in 100 draws for a fixed
combination, SC-002), i18n (detection, persistence, key parity), storage migration of legacy characters.

## Manual scenarios

Start with `npm start`, open `http://localhost:5173/character-generator/`.

1. **Browser in French** (DevTools → Sensors → Locale `fr-FR`, or a French browser profile): every page and alert
   in French (SC-001). Switch to English from the bottom of the menu: everything in English at once; reload: still
   English.
2. **Agreement**: generate until a female Dwarf: summary reads "Naine …", class and alignment agree.
3. **Non-binary in French**: generate until a non-binary character: background uses neutral phrasing, no "il/elle",
   no "iel", no "·".
4. **Same story across languages**: note the French background, switch to English: same paragraphs translated.
5. **Reroll race**: only the first paragraph changes.
6. **Names**: generate 20 orcs: orcish names only; non-binary characters get names from the neutral list.
7. **Legacy data**: before loading, put a character saved by the previous version in `localStorage.characters`;
   "My Characters" shows it, labelled as written in English.
8. **AI in French** (with the fake server from spec 001's quickstart or a real provider): the prompt asks for French;
   switch to English: text unchanged, label "Written by AI in French", "Translate with AI" rewrites it in English.
9. **Phone**: language selector reachable in the menu drawer; long French labels wrap without horizontal scroll.
