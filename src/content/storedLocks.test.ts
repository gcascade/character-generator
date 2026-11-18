import { parseStoredLocks } from './storedLocks';
import { EPITHET_IDS } from './data';

const stored = (template: unknown) => JSON.stringify({ version: 1, template });

describe('parseStoredLocks', () => {
  it('reads a valid template', () => {
    const template = {
      race: 'Elf',
      age: 300,
      firstName: 'Lathlaer',
      epithet: { id: EPITHET_IDS[0] },
    };
    expect(parseStoredLocks(stored(template))).toEqual(template);
  });

  it('keeps a written epithet', () => {
    const epithet = { text: 'la Brave', language: 'fr', source: 'ai' };
    expect(parseStoredLocks(stored({ epithet }))).toEqual({ epithet });
  });

  it('drops invalid fields and keeps the valid ones', () => {
    expect(
      parseStoredLocks(
        stored({
          race: 'Dragon',
          gender: 'Female',
          age: 'old',
          firstName: '',
          epithet: { id: 'epithet-missing' },
        }),
      ),
    ).toEqual({ gender: 'Female' });
  });

  it('drops an age the locked race cannot reach', () => {
    expect(parseStoredLocks(stored({ race: 'Human', age: 300 }))).toEqual({
      race: 'Human',
    });
  });

  it.each([null, '', 'not json', '{"version":2,"template":{}}', '[]'])(
    'returns no lock for %s',
    (raw) => {
      expect(parseStoredLocks(raw)).toEqual({});
    },
  );
});
