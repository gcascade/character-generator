import { z } from 'zod';
import type { Locale } from '../i18n';
import { NPC_SECTIONS, type Npc, type NpcSection } from '../types/npc';
import { AiError } from './errors';
import { ask, toAiError } from './generate';
import { type Prompt, SYSTEM_PROMPT, languageRules, raceText } from './prompts';
import type { AiProvider } from './providers';
import type { OutcomeSource } from './types';

const section = z.string().trim().min(1).max(600);

/** What the AI may write for a side character (research R8). */
export const npcSheetSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  ...(Object.fromEntries(NPC_SECTIONS.map((s) => [s, section])) as Record<
    NpcSection,
    typeof section
  >),
});

const schemaText = JSON.stringify(z.toJSONSchema(npcSheetSchema));

const GUIDE: Record<NpcSection, string> = {
  look: 'one sentence on their appearance',
  daily: 'one or two sentences on their daily life in this occupation',
  quirk: 'a habit or way of speaking a game master can act out',
  rumour: 'a rumour they know, usable as an adventure hook',
  secret: 'a secret they keep',
  opinion: 'what they think of adventurers',
};

export const npcSheetPrompt = (npc: Npc, locale: Locale): Prompt => ({
  system: SYSTEM_PROMPT,
  schema: npcSheetSchema,
  prompt: [
    'Create a side character (an ordinary person, not an adventurer) for a game master. These facts are fixed:',
    `Race: ${raceText(npc.race)}`,
    `Occupation: ${npc.occupation}`,
    `Gender: ${npc.gender}`,
    `Age: ${npc.age}`,
    'Give them a first and last name fitting the race, and write short texts, each one or two sentences:',
    ...NPC_SECTIONS.map((s) => `- "${s}": ${GUIDE[s]}`),
    'Avoid named real places; generic places ("the old mill") are fine.',
    languageRules(locale, npc.gender),
    `Answer with JSON matching this schema: ${schemaText}`,
  ].join('\n'),
});

export type NpcSheetOutcome = {
  /** Always complete: the app's sheet stays when the AI's is not usable. */
  npc: Npc;
  source: Extract<OutcomeSource, 'ai' | 'app'>;
  completedFields: [];
  failure?: AiError;
};

/** Asks the AI for the name and sheet; occupation, race, gender and age are never read from the answer. */
export const generateNpcSheet = async (
  provider: AiProvider,
  npc: Npc,
  locale: Locale,
  signal: AbortSignal,
): Promise<NpcSheetOutcome> => {
  const fallback = (failure: AiError): NpcSheetOutcome => ({
    npc,
    source: 'app',
    completedFields: [],
    failure,
  });
  let answer: unknown;
  try {
    answer = await ask(provider, npcSheetPrompt(npc, locale), signal);
  } catch (error) {
    return fallback(toAiError(error, provider));
  }
  const parsed = npcSheetSchema.safeParse(answer);
  if (!parsed.success) {
    return fallback(new AiError('invalid-answer', provider.type));
  }
  const { firstName, lastName, ...sections } = parsed.data;
  return {
    npc: {
      ...npc,
      firstName,
      lastName,
      text: { ...sections, language: locale, source: 'ai' },
    },
    source: 'ai',
    completedFields: [],
  };
};
