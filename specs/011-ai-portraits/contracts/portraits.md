# Contracts: AI Portraits

## App

- `buildPortraitPrompt(subject) → { positive: string; negative: string }` — English, traits only.
- `paintPortrait(subject, { signal, onProgress }) → Promise<{ image: string }>` (AI Horde; throws on failure,
  `AbortError` on cancel).
- `usePortraitPainter()` → `{ state, paint(subject, attachTo), cancel }`; `attachTo` saves the portrait id on the
  character, party member or NPC.
- `CharacterImage` / NPC sheet: painted portrait (if any) > default file from the manifest > emblem.

## Script (run by the maintainer)

```text
npm run portraits:paint -- [--service horde|cloudflare] [--dry-run] [--limit <n>] [--only <race/class/variant>]
```

- Environment: `AI_HORDE_API_KEY` (optional), `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN` (for cloudflare).
- Writes `public/images/<race>/<class>/<male|female>1.(webp|jpg)`, `src/data/content/portraitFiles.json`,
  `docs/portraits.md`. Exit code 0 when finished, 2 when stopped early (quota, network) with a summary.
