import {
  Character,
  CharacterAlignments,
  CharacterClasses,
  CharacterRaces,
  Genders,
} from '../types/character';

export const characterSchema = {
  firstName: {
    type: 'string',
    description: 'The first name of the character',
  },
  lastName: {
    type: 'string',
    description: 'The last name of the character',
  },
  epithet: {
    type: 'string',
    description: "The character's epithet. Start with 'The'",
  },
  characterClass: {
    type: 'string',
    enum: Object.values(CharacterClasses),
    description: "The character's class",
  },
  gender: {
    type: 'string',
    enum: Object.values(Genders),
    description: "The character's gender",
  },
  race: {
    type: 'string',
    enum: Object.values(CharacterRaces),
    description: "The character's race",
  },
  alignment: {
    type: 'string',
    enum: Object.values(CharacterAlignments),
    description: "The character's alignment",
  },
  age: {
    type: 'integer',
    description: "The character's age",
  },
  background: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: "The title of the character's background",
      },
      content: {
        type: 'array',
        items: {
          type: 'string',
        },
        description:
          "The content of the character's background. Each element of the array is a paragraph of text. Content should be made of 4 to 6 paragraphs. Use third person.",
      },
    },
  },
};

export function buildCharacterPrompt(character: Character) {
  const { characterClass, gender, race, alignment, age } = character;
  return `Generate a ${age} year-old ${gender} ${race} ${characterClass} of ${alignment} alignment in a fantasy setting. Some values were already generated. Answer in JSON only. Schema: ${JSON.stringify(
    characterSchema,
  )} All properties are required`;
}

export function buildBackgroundPrompt(character: Character) {
  return `Generate a background for a character. Answer in JSON only. Schema: ${JSON.stringify(
    characterSchema,
  )} All properties are required. Here is the current character: ${JSON.stringify(
    {
      ...character,
      background: null,
    },
  )}`;
}
