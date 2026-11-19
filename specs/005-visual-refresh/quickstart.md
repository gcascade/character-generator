# Quickstart: Visual Refresh

## Automated

```bash
npm run test:run
npm run typecheck
npm run lint
npm run build && npm run build-storybook
```

Expected: every existing test passes unchanged in behaviour (FR-010); the palette contrast test passes for both
modes; new component tests pass (header, story dialog, colour mode toggle, single notification).

## Browser (npm start or vite preview)

1. Home in light and dark, desktop and 360 px phone: matches the mock-ups in `mockups/`; no horizontal scroll.
2. axe-core on home, my characters and settings, both modes: no contrast or focus violation.
3. Tab through the card: each die and padlock receives a visible focus ring and its actions show.
4. "Read the story": the dialog opens (full screen on phone), Escape closes it, focus returns to the button.
5. Click Generate 5 times quickly: one notification at most.
6. Toggle Light / Dark / System in the menu and in Settings; reload: the choice is kept.
7. Measure the home card height on desktop before and after: at least 25% shorter (SC-003).
8. Reduced motion enabled: no decorative animation.
