# Quickstart: Saved Character Details

## Automated

```bash
npm run test:run && npm run typecheck && npm run lint
npm run build && npm run build-storybook
```

## Browser

1. Save two characters; My characters → click the second: every property and every story paragraph is shown.
2. Reload: same character. Browser back: list on the same carousel page.
3. `/characters/unknown`: "Character not found" and a link back.
4. Open in the generator: home shows it with Save disabled; the previous character is in the history.
5. Delete from the detail page: back to the list, one character fewer.
6. Load an old `characters` entry without id (from spec 002 tests): it opens, and after reload has an id.
7. French, dark mode, 360 px: no horizontal scroll; axe clean.
