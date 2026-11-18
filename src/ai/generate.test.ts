import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import {
  CharacterAlignments,
  CharacterClasses,
  CharacterRaces,
  Genders,
  type Character,
} from '../types/character';
import { AiError } from './errors';
import { generateCharacter, rerollProperty, testConnection } from './generate';
import {
  activeSignal,
  cancelledSignal,
  fakeProvider,
} from './providers/testing';
import { renderCharacter as displayed } from '../content/character';

const background = {
  title: 'The Ember Road',
  content: ['First paragraph.', 'Second paragraph.'],
};

const fullAnswer = {
  firstName: 'Aria',
  lastName: 'Vale',
  epithet: 'The Bold',
  background,
};

const expectComplete = (character: Character) => {
  expect(character.firstName).toBeTruthy();
  expect(character.lastName).toBeTruthy();
  const shown = displayed(character, 'en');
  expect(shown.epithet).toBeTruthy();
  expect(Object.values(CharacterRaces)).toContain(character.race);
  expect(Object.values(CharacterClasses)).toContain(character.characterClass);
  expect(Object.values(Genders)).toContain(character.gender);
  expect(Object.values(CharacterAlignments)).toContain(character.alignment);
  expect(character.age).toBeGreaterThan(0);
  expect(shown.background.title).toBeTruthy();
  expect(shown.background.content.length).toBeGreaterThan(0);
};

describe('generateCharacter', () => {
  it('generates a character instantly without a provider, with no failure', async () => {
    const outcome = await generateCharacter(undefined, activeSignal());
    expectComplete(outcome.character);
    expect(outcome.source).toBe('app');
    expect(outcome.failure).toBeUndefined();
  });

  it('uses the full AI contribution when it is valid', async () => {
    const { provider } = fakeProvider([fullAnswer]);
    const outcome = await generateCharacter(provider, activeSignal());
    expect(outcome.source).toBe('ai');
    expect(outcome.character).toMatchObject(fullAnswer);
    expectComplete(outcome.character);
  });

  it('accepts a text answer with the JSON inside a code block', async () => {
    const { provider } = fakeProvider([
      `Here it is:\n\`\`\`json\n${JSON.stringify(fullAnswer)}\n\`\`\``,
    ]);
    const outcome = await generateCharacter(provider, activeSignal());
    expect(outcome.source).toBe('ai');
    expect(outcome.character.firstName).toBe('Aria');
  });

  it('keeps the race, class, gender, alignment and age chosen by the app', async () => {
    const { provider, requests } = fakeProvider([
      { ...fullAnswer, race: 'Dragon', characterClass: 'Bard', age: 9999 },
    ]);
    const outcome = await generateCharacter(provider, activeSignal());
    expectComplete(outcome.character);
    expect(outcome.character.age).not.toBe(9999);
    expect(requests[0].prompt).toContain(`Race: ${outcome.character.race}`);
    expect(requests[0].prompt).toContain(`Age: ${outcome.character.age}`);
  });

  it('completes missing or invalid name fields from the app', async () => {
    const { provider } = fakeProvider([
      { firstName: 'Aria', lastName: '', background },
    ]);
    const outcome = await generateCharacter(provider, activeSignal());
    expect(outcome.source).toBe('ai-completed');
    expect(outcome.completedFields).toEqual(['lastName', 'epithet']);
    expect(outcome.character.firstName).toBe('Aria');
    expect(outcome.character.background).toEqual(background);
    expectComplete(outcome.character);
  });

  it.each([
    ['text without JSON', 'Sorry, I cannot do that.'],
    [
      'no background',
      { firstName: 'Aria', lastName: 'Vale', epithet: 'The Bold' },
    ],
    [
      'an empty background',
      { ...fullAnswer, background: { title: 'x', content: [] } },
    ],
  ])('falls back to the app character on %s', async (_, answer) => {
    const { provider } = fakeProvider([answer]);
    const outcome = await generateCharacter(provider, activeSignal());
    expect(outcome.source).toBe('app');
    expect(outcome.failure?.cause).toBe('invalid-answer');
    expectComplete(outcome.character);
  });

  it.each([
    'unreachable',
    'auth',
    'unknown-model',
    'timeout',
    'refused',
  ] as const)(
    'falls back to the app character when the provider fails (%s)',
    async (cause) => {
      const { provider } = fakeProvider([new AiError(cause, 'ollama')]);
      const outcome = await generateCharacter(provider, activeSignal());
      expect(outcome.source).toBe('app');
      expect(outcome.failure?.cause).toBe(cause);
      expectComplete(outcome.character);
    },
  );

  it('turns an unexpected error into a provider error', async () => {
    const { provider } = fakeProvider([new Error('boom')]);
    const outcome = await generateCharacter(provider, activeSignal());
    expect(outcome.failure?.cause).toBe('provider-error');
  });

  it('rejects with the abort when the caller goes away', async () => {
    const abort = new DOMException('gone', 'AbortError');
    const { provider } = fakeProvider([abort]);
    await expect(generateCharacter(provider, cancelledSignal())).rejects.toBe(
      abort,
    );
  });
});

describe('rerollProperty', () => {
  /** Identity and rules values other than the rerolled one (names may follow a gender change). */
  const others = (character: Character, property: keyof Character) => {
    const keys: (keyof Character)[] = [
      'firstName',
      'lastName',
      'race',
      'characterClass',
      'gender',
      'alignment',
      'age',
    ];
    return Object.fromEntries(
      keys
        .filter((key) => key !== property)
        .filter((key) => !(property === 'gender' && key === 'firstName'))
        .map((key) => [key, character[key]]),
    );
  };

  describe.each([
    'race',
    'characterClass',
    'gender',
    'alignment',
    'age',
  ] as const)('%s (chosen by the app)', (property) => {
    it('changes only that property and takes the AI background', async () => {
      const { provider, requests } = fakeProvider([
        { background, firstName: 'Ignored' },
      ]);
      const outcome = await rerollProperty(
        provider,
        korvusBlackiron,
        property,
        activeSignal(),
      );
      expect(outcome.source).toBe('ai');
      expect(outcome.character[property]).not.toEqual(
        korvusBlackiron[property],
      );
      expect(others(outcome.character, property)).toEqual(
        others(korvusBlackiron, property),
      );
      expect(outcome.character.background).toEqual(background);
      expect(requests[0].prompt).toContain(`${outcome.character[property]}`);
    });

    it('keeps the app background when the AI fails', async () => {
      const { provider } = fakeProvider([new AiError('timeout', 'ollama')]);
      const outcome = await rerollProperty(
        provider,
        korvusBlackiron,
        property,
        activeSignal(),
      );
      expect(outcome.source).toBe('app');
      expect(outcome.failure?.cause).toBe('timeout');
      expect(outcome.character[property]).not.toEqual(
        korvusBlackiron[property],
      );
      expect(others(outcome.character, property)).toEqual(
        others(korvusBlackiron, property),
      );
    });
  });

  describe.each(['firstName', 'lastName', 'epithet'] as const)(
    '%s (proposed by the AI)',
    (field) => {
      it('uses the value proposed by the AI with its background', async () => {
        const { provider } = fakeProvider([
          { [field]: 'Brandnew', background, race: 'Dragon' },
        ]);
        const outcome = await rerollProperty(
          provider,
          korvusBlackiron,
          field,
          activeSignal(),
        );
        expect(outcome.source).toBe('ai');
        expect(outcome.character[field]).toBe('Brandnew');
        expect(outcome.character.background).toEqual(background);
        expect(others(outcome.character, field)).toEqual(
          others(korvusBlackiron, field),
        );
      });

      it('lets the app choose when the AI repeats the previous value', async () => {
        const { provider } = fakeProvider([
          { [field]: korvusBlackiron[field]!.toUpperCase(), background },
        ]);
        const outcome = await rerollProperty(
          provider,
          korvusBlackiron,
          field,
          activeSignal(),
        );
        expect(outcome.source).toBe('ai-completed');
        expect(outcome.completedFields).toEqual([field]);
        expect(outcome.character[field]).not.toBe(korvusBlackiron[field]);
        expect(outcome.character.background).toEqual(background);
      });

      it('falls back entirely to the app when the background is unusable', async () => {
        const { provider } = fakeProvider([{ [field]: 'Brandnew' }]);
        const outcome = await rerollProperty(
          provider,
          korvusBlackiron,
          field,
          activeSignal(),
        );
        expect(outcome.source).toBe('app');
        expect(outcome.failure?.cause).toBe('invalid-answer');
        expect(outcome.character[field]).toBe('Brandnew');
        expect(others(outcome.character, field)).toEqual(
          others(korvusBlackiron, field),
        );
      });
    },
  );

  it.each([
    'firstName',
    'lastName',
    'epithet',
    'race',
    'characterClass',
    'gender',
    'alignment',
    'age',
  ] as const)(
    'rerolls %s without a provider and changes nothing else',
    async (property) => {
      const outcome = await rerollProperty(
        undefined,
        korvusBlackiron,
        property,
        activeSignal(),
      );
      expect(outcome.source).toBe('app');
      expect(outcome.failure).toBeUndefined();
      expect(outcome.character[property]).not.toEqual(
        korvusBlackiron[property],
      );
      expect(others(outcome.character, property)).toEqual(
        others(korvusBlackiron, property),
      );
    },
  );
});

describe('testConnection', () => {
  it('succeeds with the model list when the provider offers one', async () => {
    const { provider } = fakeProvider([{ ok: true }], { models: ['a', 'b'] });
    await expect(
      testConnection(provider, 'a', activeSignal()),
    ).resolves.toEqual({
      ok: true,
      model: 'a',
      models: ['a', 'b'],
    });
  });

  it('succeeds without a list when the provider cannot list models', async () => {
    const { provider } = fakeProvider(['{"ok":true}'], {
      models: new AiError('provider-error', 'ollama'),
    });
    await expect(
      testConnection(provider, 'm', activeSignal()),
    ).resolves.toEqual({
      ok: true,
      model: 'm',
      models: undefined,
    });
  });

  it('reports a refused key from the listing without trying further', async () => {
    const { provider } = fakeProvider([], {
      models: new AiError('auth', 'anthropic'),
    });
    const result = await testConnection(provider, 'm', activeSignal());
    expect(result).toMatchObject({ ok: false, error: { cause: 'auth' } });
    expect(provider.complete).not.toHaveBeenCalled();
  });

  it('reports the cause when the model does not answer', async () => {
    const { provider } = fakeProvider(
      [new AiError('unknown-model', 'ollama')],
      {
        models: ['other'],
      },
    );
    const result = await testConnection(provider, 'm', activeSignal());
    expect(result).toMatchObject({
      ok: false,
      error: { cause: 'unknown-model' },
    });
  });
});
