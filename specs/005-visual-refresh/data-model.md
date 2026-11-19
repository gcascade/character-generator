# Data Model: Visual Refresh

No domain data changes.

## Colour mode preference

`'light' | 'dark' | 'system'`, default `'system'`, stored by MUI's colour-scheme manager in `localStorage`
(`mui-mode`); an unknown stored value falls back to `system`.

## Palette tokens (per mode)

`background.default` (parchment / night), `background.paper`, `text.primary`, `text.secondary`, `primary` (brown in
light, gold in dark), `secondary` (gold accent), `divider`, `menu` (side menu and app bar), plus `race.<Race>` and
`characterClass.<Class>` colours with their contrast text colour.
