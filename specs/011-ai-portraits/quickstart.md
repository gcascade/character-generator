# Quickstart: AI Portraits

```bash
npm run test:run && npm run typecheck && npm run lint && npm run build && npm run build-storybook
npm run portraits:paint -- --dry-run --limit 3      # lists paths and prompts, no network
```

In the app (needs access to aihorde.net):

1. Generate a gnome bard → "Paint a portrait" → privacy notice → progress with queue position and estimate → portrait.
2. Cancel during a painting → previous picture stays, message shown.
3. Save the character, reload → portrait in the list, details page; add it to a party → member card shows it.
4. Reroll the race → "may be outdated" badge; "Paint again".
5. Side character → paint → saved → reload.
6. Share the character → link opens with the default portrait.

On the maintainer's computer:

```bash
npm run portraits:paint -- --limit 2                 # AI Horde, anonymous
CLOUDFLARE_ACCOUNT_ID=… CLOUDFLARE_API_TOKEN=… npm run portraits:paint -- --service cloudflare
```

Review the new images, then commit `public/images`, `src/data/content/portraitFiles.json` and `docs/portraits.md`.
