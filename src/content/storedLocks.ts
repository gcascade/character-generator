import { z } from 'zod';
import {
  CharacterAlignments,
  CharacterClasses,
  CharacterRaces,
  Genders,
} from '../types/character';
import { EPITHET_IDS } from './data';
import { type CharacterTemplate, MAX_AGE, MIN_AGE } from './template';

export const LOCKS_KEY = 'locks';

const name = z.string().trim().min(1).max(40);

/** One schema per field: an invalid field is dropped, not the whole template (research R6). */
const FIELDS = {
  firstName: name,
  lastName: name,
  race: z.enum(Object.values(CharacterRaces)),
  characterClass: z.enum(Object.values(CharacterClasses)),
  gender: z.enum(Object.values(Genders)),
  alignment: z.enum(Object.values(CharacterAlignments)),
  age: z
    .number()
    .int()
    .min(MIN_AGE)
    .max(Math.max(...Object.values(MAX_AGE))),
  epithet: z.union([
    z.object({ id: z.string().refine((id) => EPITHET_IDS.includes(id)) }),
    z.object({
      text: z.string().trim().min(1).max(60),
      language: z.enum(['en', 'fr']),
      source: z.enum(['ai', 'legacy']),
    }),
  ]),
} satisfies Record<keyof CharacterTemplate, z.ZodType>;

const storedSchema = z.object({
  version: z.literal(1),
  template: z.record(z.string(), z.unknown()),
});

/** Reads the stored locks; invalid fields are ignored and nothing ever throws (FR-009). */
export const parseStoredLocks = (raw: string | null): CharacterTemplate => {
  if (!raw) return {};
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return {};
  }
  const stored = storedSchema.safeParse(json);
  if (!stored.success) return {};
  const template: CharacterTemplate = {};
  for (const [field, schema] of Object.entries(FIELDS)) {
    const result = schema.safeParse(stored.data.template[field]);
    if (result.success) Object.assign(template, { [field]: result.data });
  }
  if (
    template.race !== undefined &&
    template.age !== undefined &&
    template.age > MAX_AGE[template.race]
  ) {
    delete template.age;
  }
  return template;
};

export const loadLocks = (): CharacterTemplate => {
  try {
    return parseStoredLocks(localStorage.getItem(LOCKS_KEY));
  } catch {
    return {};
  }
};

export const saveLocks = (template: CharacterTemplate) => {
  try {
    localStorage.setItem(LOCKS_KEY, JSON.stringify({ version: 1, template }));
  } catch {
    // Storage full or blocked: locks simply won't survive a reload.
  }
};
