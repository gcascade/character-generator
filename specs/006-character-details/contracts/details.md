# Contract: Saved Character Details

## DataContext

`{ characters, saveCharacter(character): Character, removeCharacter(id: string), updateCharacter(character),
findCharacter(id): Character | undefined }`

## Components

- `PropertyList({ character })` — label/value grid: first name, last name, epithet, race, class, gender, age,
  alignment (labels via `label()` per locale).
- `CharacterDetail({ character, onBack?, onOpenInGenerator?, onDelete?, onTranslate?, translating? })` — portrait,
  `CharacterHeader` (`h1` on the page), `PropertyList`, story title + every paragraph (drop cap on the first),
  `WrittenInNotice`; an action is shown only when its handler is given; delete asks for confirmation.
- `Carousel` — optional `page` and `onPageChange` props (controlled mode).

## Page and route

- `/characters/:id` → `CharacterDetails`: found → `CharacterDetail` with every action; not found → message + link.

## UI keys (en / fr)

`details.back` (Back to my characters / Retour à mes personnages), `details.openInGenerator` (Open in the generator /
Ouvrir dans le générateur), `details.delete` (Delete / Supprimer), `details.confirmDelete` (Click again to delete /
Cliquez à nouveau pour supprimer), `details.deleted` (Character deleted / Personnage supprimé), `details.notFound`
(Character not found / Personnage introuvable), `details.notFoundHint` (It may have been deleted. / Il a peut-être été
supprimé.), `details.open` (Open {name} / Ouvrir {name}).
