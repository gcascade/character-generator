import { z } from 'zod';
import {
  type Character,
  CharacterAlignments,
  CharacterClasses,
  CharacterRaces,
  Genders,
} from '../types/character';

const text = z.string().trim().min(1).max(4000);

const backgroundSchema = z.object({
  title: z.string().max(400),
  content: z.array(z.string().max(4000)).max(20),
});

/**
 * A character read from the browser (constitution IV). Characters saved by
 * older versions have `epithet` and `background` text but no `content`: they
 * are read as English text written by the app (FR-016).
 */
const storedCharacterSchema = z
  .object({
    id: z.string().trim().min(1).max(100).optional(),
    firstName: text,
    lastName: z.string().trim().max(4000),
    race: z.enum(Object.values(CharacterRaces)),
    characterClass: z.enum(Object.values(CharacterClasses)),
    gender: z.enum(Object.values(Genders)),
    alignment: z.enum(Object.values(CharacterAlignments)),
    age: z.number().int().min(0).max(100000),
    content: z
      .object({
        titleId: text,
        originId: text,
        trainingId: text,
        turningPointId: text,
        goalId: text,
        epithetId: text,
      })
      .optional(),
    epithet: z.string().max(400).optional(),
    background: backgroundSchema.optional(),
    textLanguage: z.enum(['en', 'fr']).optional(),
    textSource: z.enum(['ai', 'legacy']).optional(),
  })
  .refine(
    (character) =>
      character.content !== undefined ||
      (character.epithet !== undefined && character.background !== undefined),
    'A character needs app content or written text',
  )
  .transform((character): Character => {
    const hasText =
      character.epithet !== undefined || character.background !== undefined;
    return hasText
      ? {
          ...character,
          textLanguage: character.textLanguage ?? 'en',
          textSource: character.textSource ?? 'legacy',
        }
      : character;
  });

/** Parses stored characters, dropping the invalid ones. */
export const parseStoredCharacters = (raw: string | null): Character[] => {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  return data.flatMap((entry) => {
    const parsed = storedCharacterSchema.safeParse(entry);
    return parsed.success ? [parsed.data] : [];
  });
};

/**
 * Gives an id to saved characters without one, or sharing one with an earlier
 * entry (older versions, hand-edited data) — spec 006 FR-001.
 */
export const withIds = (characters: Character[]): Character[] => {
  const seen = new Set<string>();
  return characters.map((character) => {
    const id =
      character.id && !seen.has(character.id)
        ? character.id
        : crypto.randomUUID();
    seen.add(id);
    return id === character.id ? character : { ...character, id };
  });
};
