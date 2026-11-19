# Data Model: Saved Character Details

## Character (addition)

| Field | Type             | Rule                                                                     |
| ----- | ---------------- | ------------------------------------------------------------------------ |
| `id`  | string, optional | set on saved characters only; unique among saved characters; 1–100 chars |

## Saved characters (`localStorage["characters"]`)

Same list as today, each entry now with `id`. Load: parse (invalid entries dropped, as today) → give an `id` to
entries without one or with a duplicate → saved back.

Transitions: save → `{ ...character, id }` appended, becomes the current character; delete(id) → removed; update
(translate) → entry with the same id replaced; open in generator → current character = saved entry, previous current
character appended to the history (unless already there).
