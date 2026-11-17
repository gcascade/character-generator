import {
  newCharacterSchema,
  storedSettingsSchema,
  validateContribution,
} from './schemas';
import { DEFAULT_SETTINGS } from './storage';

const background = { title: 'The Wanderer', content: ['Once upon a time.'] };

describe('validateContribution', () => {
  it('keeps every valid requested field, trimmed', () => {
    expect(
      validateContribution(
        {
          firstName: '  Aria ',
          lastName: 'Vale',
          epithet: 'The Bold',
          background,
        },
        ['firstName', 'lastName', 'epithet', 'background'],
      ),
    ).toEqual({
      firstName: 'Aria',
      lastName: 'Vale',
      epithet: 'The Bold',
      background,
    });
  });

  it('drops invalid fields and keeps the valid ones', () => {
    expect(
      validateContribution(
        { firstName: '', lastName: 'x'.repeat(41), epithet: 42, background },
        ['firstName', 'lastName', 'epithet', 'background'],
      ),
    ).toEqual({ background });
  });

  it('ignores fields that were not requested', () => {
    expect(
      validateContribution({ firstName: 'Aria', race: 'Dragon', background }, [
        'background',
      ]),
    ).toEqual({ background });
  });

  it.each([
    ['empty title', { title: ' ', content: ['x'] }],
    ['no paragraph', { title: 't', content: [] }],
    ['empty paragraph', { title: 't', content: ['  '] }],
    ['too many paragraphs', { title: 't', content: Array(11).fill('p') }],
    ['too long paragraph', { title: 't', content: ['x'.repeat(2001)] }],
  ])('rejects a background with %s', (_, invalid) => {
    expect(
      validateContribution({ background: invalid }, ['background']),
    ).toEqual({});
  });

  it('returns nothing for a non-object answer', () => {
    expect(validateContribution('text', ['background'])).toEqual({});
    expect(validateContribution(null, ['background'])).toEqual({});
  });
});

describe('newCharacterSchema', () => {
  it('can be described as JSON Schema for prompts', async () => {
    const { z } = await import('zod');
    const jsonSchema = z.toJSONSchema(newCharacterSchema) as {
      required: string[];
    };
    expect(jsonSchema.required).toEqual([
      'firstName',
      'lastName',
      'epithet',
      'background',
    ]);
  });
});

describe('storedSettingsSchema', () => {
  it('accepts the defaults', () => {
    expect(storedSettingsSchema.safeParse(DEFAULT_SETTINGS).success).toBe(true);
  });

  it('rejects a non-http address', () => {
    expect(
      storedSettingsSchema.safeParse({
        ...DEFAULT_SETTINGS,
        ollama: { baseUrl: 'ftp://host', model: 'm' },
      }).success,
    ).toBe(false);
  });
});
