# Quickstart: Share Link

## Automated

```bash
npm run test:run && npm run typecheck && npm run lint
npm run build && npm run build-storybook
```

Expected: round trip of 1,000 characters and parties (incl. AI text), link length limits, fuzzed links never throw,
share hook (share sheet, clipboard, fallback), share page (character, party, invalid).

## Browser

1. Home card → Share: "Link copied"; open the link in a new private window: same character; Save; reload.
2. Switch the visitor to French: app story shown in French; an AI text keeps its language with the label.
3. Party page → Share the party; open: name, story, members; open a member sheet; save the party.
4. Truncate the link, change one character of the data: "This link cannot be read".
5. Phone width, dark mode: no horizontal scroll; axe clean on `/share` (character, party, invalid).
