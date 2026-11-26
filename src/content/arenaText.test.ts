import { eventSides, fillActorText } from './arenaText';

const ana = { firstName: 'Ana', gender: 'Female' as const };
const bo = { firstName: 'Bo', gender: 'Male' as const };
const cy = { firstName: 'Cy', gender: 'Non-binary' as const };

describe('arena texts with several actors (spec 012 R7)', () => {
  it('chooses each selection by its own actor', () => {
    expect(
      fillActorText(
        '{a} est {{a:prêt|prête|prêt à tout}}, {b} est {{b:prêt|prête|prêt à tout}}.',
        [ana, bo],
      ),
    ).toBe('Ana est prête, Bo est prêt.');
    expect(fillActorText('{{a:il|elle|{a}}} attend.', [cy])).toBe('Cy attend.');
  });

  it('fills items and teams and capitalises the first letter', () => {
    expect(
      fillActorText('{item} lies at the feet of {a} ({team}).', [ana], {
        item: 'a sword',
        team: 'The Grey Company',
      }),
    ).toBe('A sword lies at the feet of Ana (The Grey Company).');
  });

  it('throws when an actor or a value is missing', () => {
    expect(() => fillActorText('{b} runs.', [ana])).toThrow(/Missing actor/);
    expect(() => fillActorText('{item}', [ana])).toThrow(/Missing/);
  });

  it('keeps narrow no-break spaces untouched', () => {
    expect(fillActorText('{a} : « non ! »', [ana])).toBe('Ana : « non ! »');
  });
});

describe('event sides', () => {
  const result = (eventId: string, actors: string[]) => ({
    eventId,
    outcome: 'only',
    actors,
    defeated: [],
  });

  it('puts the one who acts on the left and those who undergo it on the right', () => {
    expect(eventSides(result('event-fight-clearing', ['a', 'b']))).toEqual({
      left: ['a'],
      right: ['b'],
    });
    expect(eventSides(result('event-protect', ['a', 'b', 'c']))).toEqual({
      left: ['a'],
      right: ['b', 'c'],
    });
    expect(eventSides(result('event-hazard-pit', ['a']))).toEqual({
      left: [],
      right: ['a'],
    });
    expect(eventSides(result('event-find-chest', ['a']))).toEqual({
      left: ['a'],
      right: [],
    });
  });
});
