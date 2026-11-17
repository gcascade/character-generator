import { z } from 'zod';
import type { AiContribution, AiContributionField } from './types';
import { PROVIDER_TYPES } from './types';

// --- What an AI provider may write (data-model.md, AiContribution) ---

export const firstNameSchema = z.string().trim().min(1).max(40);
export const lastNameSchema = z.string().trim().min(1).max(40);
export const epithetSchema = z.string().trim().min(1).max(60);
export const backgroundSchema = z.object({
  title: z.string().trim().min(1).max(120),
  content: z.array(z.string().trim().min(1).max(2000)).min(1).max(10),
});

export const contributionFieldSchemas = {
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  epithet: epithetSchema,
  background: backgroundSchema,
} satisfies Record<AiContributionField, z.ZodType>;

/** Shape asked for a new character. */
export const newCharacterSchema = z.object(contributionFieldSchemas);

/** Shape asked when race, class, gender, alignment or age was rerolled. */
export const backgroundRewriteSchema = z.object({
  background: backgroundSchema,
});

export type NameField = 'firstName' | 'lastName' | 'epithet';

/** Shape asked when a name field or the epithet was rerolled. */
export const nameRerollSchema = (field: NameField) =>
  z.object({
    [field]: contributionFieldSchemas[field],
    background: backgroundSchema,
  });

/**
 * Validates each requested field on its own so that a partially valid answer
 * can be completed instead of rejected. Fields that were not requested are ignored.
 */
export const validateContribution = (
  answer: unknown,
  fields: readonly AiContributionField[],
): Partial<AiContribution> => {
  if (typeof answer !== 'object' || answer === null) return {};
  const record = answer as Record<string, unknown>;
  const valid: Partial<AiContribution> = {};
  for (const field of fields) {
    const result = contributionFieldSchemas[field].safeParse(record[field]);
    if (result.success) {
      Object.assign(valid, { [field]: result.data });
    }
  }
  return valid;
};

// --- Stored settings (data-model.md, ProviderSettings) ---

export const urlSchema = z
  .string()
  .trim()
  .refine((value) => {
    try {
      const { protocol } = new URL(value);
      return protocol === 'http:' || protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Enter an http or https address');

export const modelSchema = z.string().trim().min(1).max(200);

export const storedSettingsSchema = z.object({
  version: z.literal(1),
  activeType: z.enum(PROVIDER_TYPES),
  ollama: z.object({ baseUrl: urlSchema, model: modelSchema }),
  openaiCompatible: z.object({ baseUrl: urlSchema, model: modelSchema }),
  anthropic: z.object({ model: modelSchema }),
  rememberKey: z.boolean(),
});

export const storedKeysSchema = z.object({
  anthropic: z.string().min(1).optional(),
  'openai-compatible': z.string().min(1).optional(),
});
