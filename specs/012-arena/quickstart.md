# Quickstart: Arena

## Automated checks

```bash
npm run test:run -- src/content/random src/content/skills src/content/arena src/data
```

Expected: skill bounds and class signatures for every race, class and age band; 1,000 seeded matches respect the
invariants of [contracts/arena.md](./contracts/arena.md); every arena text exists in both locales with the same
placeholders; share round trips give the same match.

```bash
npm run typecheck && npm run lint && npm run test:run
```

## Manual scenarios

1. `npm start`, open **Arena**. Add the current character, one saved party and "6 random". The roster shows the party
   as a team and the others as solos; each card shows thirteen skills and hit points.
2. Give a contestant two perks and three items; a third perk cannot be chosen. Use "Random loadouts".
3. Start. Day 1 shows several events; "Next round" shows Night 1. Every living contestant appears once per round.
4. Switch the language to French: the same events are now in French.
5. "Skip to the end": the summary shows one winner, defeats per contestant and notable moments.
6. "Replay": the same story from Day 1. "Play again": a different story, new skills.
7. "Share", open the link in a private window: same roster, same story.
8. Try to start with a single party only: the start button explains that two sides are needed.
9. Phone width: roster, cards and rounds read without horizontal scrolling.
