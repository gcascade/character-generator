import { renderActorText } from './arenaText';

const ana = { firstName: 'Ana', gender: 'Female' as const };
const bo = { firstName: 'Bo', gender: 'Male' as const };
const cy = { firstName: 'Cy', gender: 'Non-binary' as const };

describe('arena texts with several actors (spec 012 R7)', () => {
  it('chooses each selection by its own actor', () => {
    expect(
      renderActorText(
        '{a} est {{a:prêt|prête|prêt à tout}}, {b} est {{b:prêt|prête|prêt à tout}}.',
        [ana, bo],
      ),
    ).toBe('Ana est prête, Bo est prêt.');
    expect(renderActorText('{{a:il|elle|{a}}} attend.', [cy])).toBe(
      'Cy attend.',
    );
  });

  it('fills items and teams and capitalises the first letter', () => {
    expect(
      renderActorText('{item} lies at the feet of {a} ({team}).', [ana], {
        item: 'a sword',
        team: 'The Grey Company',
      }),
    ).toBe('A sword lies at the feet of Ana (The Grey Company).');
  });

  it('throws when an actor or a value is missing', () => {
    expect(() => renderActorText('{b} runs.', [ana])).toThrow(/Missing actor/);
    expect(() => renderActorText('{item}', [ana])).toThrow(/Missing/);
  });

  it('keeps narrow no-break spaces untouched', () => {
    expect(renderActorText('{a} : « non ! »', [ana])).toBe('Ana : « non ! »');
  });
});
