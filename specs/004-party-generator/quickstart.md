# Quickstart: Party Generator

## Automated

```bash
npm run test:run
npm run typecheck && npm run lint
npm run build && npm run build-storybook
```

Expected: party rule tests over 1,000 parties (class variety, alignment mode, unique names, constraints, locked
members), storage tests, party content tests (both locales, no agreement selections, French rules), AI fallback tests,
component and page tests.

## Browser

1. Party page, size 4, Generate: 4 members, 4 different classes, a party name and story naming them.
2. Size 6: every class at least once.
3. Shared race Elf: all elves; lock one member, Generate 5 times: that member stays.
4. Reroll one member: only that card changes; the story names the new member.
5. Harmonious: never Good and Evil together; Anything goes: any mix.
6. Save the party and one member; open My characters → Parties tab; reload; open the party again.
7. Switch to French and dark mode; phone width: one column, no horizontal scroll.
8. With an AI provider: the party story comes from the AI; with a failing provider, the app's story and an explanation.
