# Quickstart: NPC Mode

```bash
npm run test:run && npm run typecheck && npm run lint && npm run build && npm run build-storybook
npm start   # http://localhost:5173/character-generator/npcs
```

1. Menu → "Side characters": an NPC is shown; "Generate" gives another, with all six sections.
2. Choose "Innkeeper" in the constraints, generate several times: always an innkeeper, daily life about an inn.
3. Dice on "Rumour": only the rumour changes. Lock race and occupation, generate: they stay.
4. "Generate 5": five cards, distinct first names; "Open" one: it becomes the sheet above.
5. Switch to French: same NPC, French text, neutral phrasing for a non-binary NPC.
6. Save; My characters → "Side characters" tab: listed; open it (`/npcs/<id>`), share link, open in a private
   window in the other language; save from the link; delete.
7. With an AI (fake or Ollama): generate → sheet written by the AI; stop the provider → fragment sheet and message.
8. Check light/dark and phone width; axe without new violations.
