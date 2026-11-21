# Research: AI Portraits

## R1. In-app service: AI Horde

- **Decision**: AI Horde image API from the browser: `POST /api/v2/generate/async` (prompt `positive ### negative`,
  `params: { width: 512, height: 512, steps: 25, n: 1, sampler_name }`, `nsfw: false`, `censor_nsfw: true`,
  `r2: false` to get the image inline, a short list of preferred painterly models, `trusted_workers: false`), then
  poll `GET /generate/check/{id}` every 4 s (`queue_position`, `wait_time`, `done`, `faulted`, `is_possible`), then
  one `GET /generate/status/{id}` for the image; `DELETE /generate/status/{id}` on cancel. Headers: `apikey:
0000000000` (anonymous), `Client-Agent: character-generator:<version>:<repository URL>`.
- **Rationale**: free, no account, works from browsers (used by browser clients), documented three-step flow.
- **Alternatives**: user's own image key (deferred, spec Q2); Pollinations (terms and availability change often).
- **Limits**: anonymous requests have the lowest priority (wait from ~30 s to several minutes); time limit 10 min.
- **Update after the first real runs**: with a single SDXL model at 1024 px, a new account waited ~20 min per image.
  The app now asks any available model at 512 px (negative prompt against anime/cartoon styles); the script keeps a
  default model at 768 px, with `--model any` and `--timeout <minutes>` (default 60).

## R2. Prompt recipe

- **Decision**: `buildPortraitPrompt(subject)` composes, in English: fixed style ("semi-realistic digital fantasy
  painting, waist-up portrait, facing the viewer, detailed face, soft warm light, painterly background"), race
  visuals (e.g. dark elf: ash-grey skin, white hair, pointed ears; Ashborn: small horns, ember eyes), gender, age band
  from the share of the race's lifespan (young adult, adult, middle-aged, elderly), class gear (bard: lute) or
  occupation gear (baker: flour-dusted apron, loaves), and for NPCs the app's English look fragment. Negative prompt:
  text, watermark, nudity, deformed hands. Data in `portraitPrompt.json`.
- **Rationale**: FR-002 (traits only, never names or user text); data-driven (constitution II).

## R3. Storing painted portraits

- **Decision**: the image is redrawn on a canvas at 384×384 and encoded as WebP (quality 0.8, JPEG fallback), ~30–50
  KB. Stored in `localStorage["portraits"]` as `{ version: 1, portraits: { [id]: { image, traits, service,
paintedAt } } }`; characters and NPCs keep `portraitId`. On load, portraits whose id appears in no other
  localStorage value are removed. On a quota error the oldest unreferenced portraits go first; if it still fails, the
  portrait is shown for the session only and the user is told.
- **Rationale**: keeps the constitution's localStorage-only rule, avoids duplicating images in history and parties.
- **Alternatives**: IndexedDB (more room, new persistence mechanism — rejected for now); image inside the character
  (duplicated in history, party, saved list).

## R4. Outdated portraits

- **Decision**: `traits` = race, class or occupation, gender, age band at painting time; when they differ from the
  current ones, the portrait shows a small "may be outdated" badge with "paint again".

## R5. Default portraits manifest

- **Decision**: `src/data/content/portraitFiles.json` lists the files under `public/images` (e.g.
  `elf/mage/female1.png`, `gnome/bard/male1.webp`); `portraitFor` returns the listed file or nothing (→ emblem). A
  test checks that the manifest matches the files. Both scripts rewrite it.
- **Rationale**: WebP for new files (10× smaller than the existing PNGs) without trying several extensions; no fetch
  per character.

## R6. Script services

- **Decision**: `--service horde` (default, anonymous or `AI_HORDE_API_KEY` from the environment for priority) at
  1024×1024 or the largest the queue accepts, and `--service cloudflare` (`CLOUDFLARE_ACCOUNT_ID`,
  `CLOUDFLARE_API_TOKEN` from the environment; `POST /client/v4/accounts/{id}/ai/run/@cf/black-forest-labs/flux-1-schnell`
  with `{ prompt, steps: 8 }`, answer `result.image` base64 JPEG). Files are written as WebP when the service returns
  WebP, otherwise JPEG (`.jpg`); the manifest records the extension. A run stops on quota/network errors and the next
  run continues (files already written are skipped). `--dry-run` lists paths and prompts without network.
- **Rationale**: the maintainer keeps control of keys and quota (clarification); no dependency.

## R7. Privacy notice

- **Decision**: the first "Paint a portrait" opens a short dialog: the description (shown) is sent to AI Horde, a
  community service run by volunteers; no name or story is sent; "Don't ask again" stored in settings.
