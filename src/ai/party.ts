import { z } from 'zod';
import { renderCharacter } from '../content/character';
import type { Locale } from '../i18n';
import type { Party } from '../types/party';
import { AiError } from './errors';
import { ask, toAiError } from './generate';
import { LANGUAGE_NAME, type Prompt, SYSTEM_PROMPT } from './prompts';
import type { AiProvider } from './providers';
import type { OutcomeSource } from './types';

/** What the AI may write for a party: its name and story (spec 004 R5). */
export const partyStorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  story: z.array(z.string().trim().min(1).max(2000)).min(2).max(4),
  /** Where the adventure begins (spec 008); optional, the app's stays otherwise. */
  hook: z.string().trim().min(1).max(1000).optional(),
});

const schemaText = JSON.stringify(z.toJSONSchema(partyStorySchema));

export const partyStoryPrompt = (party: Party, locale: Locale): Prompt => ({
  system: SYSTEM_PROMPT,
  schema: partyStorySchema,
  prompt: [
    `Here is a party of ${party.members.length} adventurers. These facts are fixed:`,
    ...party.members.map(({ character }) => {
      const epithet = renderCharacter(character, locale).epithet;
      return `- ${character.firstName} ${character.lastName}, ${epithet}: ${character.age}-year-old ${character.gender.toLowerCase()} ${character.race} ${character.characterClass}, ${character.alignment}`;
    }),
    'Give the company a name, and write 2 to 4 short paragraphs telling how they met and what they are after together, naming every member.',
    'Also write "hook": one short paragraph giving where their next adventure begins — a place, someone who asks for help, and a threat.',
    `Write every text value in ${LANGUAGE_NAME[locale]}.`,
    locale === 'fr'
      ? 'In French, make "la compagnie" or "le groupe" the subject when speaking of several members, so that no word has to agree with their genders; never use "iel" or inclusive punctuation.'
      : '',
    `Answer with JSON matching this schema: ${schemaText}`,
  ]
    .filter(Boolean)
    .join('\n'),
});

export type PartyStoryOutcome = {
  /** Always complete: the app's story stays when the AI's is not usable. */
  party: Party;
  source: Extract<OutcomeSource, 'ai' | 'app'>;
  completedFields: [];
  failure?: AiError;
};

/** Asks the AI for the party's name and story; member facts are never read from the answer. */
export const generatePartyStory = async (
  provider: AiProvider,
  party: Party,
  locale: Locale,
  signal: AbortSignal,
): Promise<PartyStoryOutcome> => {
  let answer: unknown;
  try {
    answer = await ask(provider, partyStoryPrompt(party, locale), signal);
  } catch (error) {
    return {
      party,
      source: 'app',
      completedFields: [],
      failure: toAiError(error, provider),
    };
  }
  const parsed = partyStorySchema.safeParse(answer);
  if (!parsed.success) {
    return {
      party,
      source: 'app',
      completedFields: [],
      failure: new AiError('invalid-answer', provider.type),
    };
  }
  return {
    party: {
      ...party,
      text: {
        name: parsed.data.name,
        story: parsed.data.story,
        ...(parsed.data.hook && { hook: parsed.data.hook }),
        language: locale,
        source: 'ai',
      },
    },
    source: 'ai',
    completedFields: [],
  };
};
