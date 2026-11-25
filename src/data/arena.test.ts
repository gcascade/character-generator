import { fillActorText } from '../content/arenaText';
import { ARENA, ARENA_TEXTS } from '../content/data';
import { Genders } from '../types/character';
import { SKILLS } from '../types/arena';

/** The outcomes each event type can produce (src/content/arenaEvents.ts). */
const OUTCOMES: Record<string, string[]> = {
  find: ['success', 'failure'],
  gift: ['only'],
  forage: ['success', 'failure'],
  hazard: ['success', 'failure', 'defeated'],
  arena: ['success', 'failure', 'defeated'],
  rest: ['only'],
  quiet: ['only'],
  potion: ['only'],
  treat: ['success', 'failure'],
  fight: ['win', 'lose', 'draw', 'defeat', 'defeated'],
  finish: ['win', 'lose', 'draw', 'defeat', 'defeated'],
  finale: ['defeat', 'defeated'],
  ambush: ['success', 'defeat', 'failure', 'defeated'],
  social: ['success', 'failure'],
  steal: ['success', 'failure'],
  spare: ['only'],
  'team-heal': ['success', 'failure'],
  share: ['only'],
  banter: ['only'],
  trade: ['only'],
  split: ['only'],
  alliance: ['success', 'failure'],
  betray: ['success', 'defeat'],
  protect: ['success', 'failure', 'defeat', 'defeated'],
  sacrifice: ['only'],
};

const outcomesOf = (kind: (typeof ARENA.events)[number]) => [
  ...OUTCOMES[kind.type],
  ...(kind.loseItem ? ['lost'] : []),
  ...(kind.effect === 'hurt' ? ['defeat'] : []),
  ...(kind.effect === 'take' ? ['took'] : []),
];

const params = (text: string) =>
  [...new Set([...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort();

const GENDERS = Object.values(Genders);

describe('arena content (spec 012)', () => {
  it('has unique event ids, known types and enough events', () => {
    const ids = ARENA.events.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const kind of ARENA.events)
      expect(OUTCOMES[kind.type], kind.id).toBeDefined();
    expect(ids.length).toBeGreaterThanOrEqual(70);
  });

  it('has a text for every outcome of every event in both languages, with the same placeholders', () => {
    for (const kind of ARENA.events) {
      for (const outcome of outcomesOf(kind)) {
        const en = ARENA_TEXTS.en.events[kind.id]?.[outcome];
        const fr = ARENA_TEXTS.fr.events[kind.id]?.[outcome];
        expect(en, `${kind.id}.${outcome} (en)`).toBeTruthy();
        expect(fr, `${kind.id}.${outcome} (fr)`).toBeTruthy();
        expect(params(fr), `${kind.id}.${outcome}`).toEqual(params(en));
      }
    }
  });

  it('renders every text for every combination of genders', () => {
    for (const locale of ['en', 'fr'] as const) {
      for (const [id, outcomes] of Object.entries(ARENA_TEXTS[locale].events)) {
        for (const text of Object.values(outcomes)) {
          for (const a of GENDERS)
            for (const b of GENDERS) {
              const filled = fillActorText(
                text,
                [
                  { firstName: 'Ana', gender: a },
                  { firstName: 'Bo', gender: b },
                  { firstName: 'Cy', gender: a },
                ],
                { item: 'x', theItem: 'x', team: 'x' },
              );
              expect(filled, id).not.toMatch(/[{}]/);
            }
        }
      }
    }
  });

  it('follows the French rules', () => {
    const elision =
      /\b(que|de|le|la|ce|jusque|lorsque|puisque)\s+\{(a|b|c|item|theItem)\}/i;
    for (const outcomes of Object.values(ARENA_TEXTS.fr.events)) {
      for (const text of Object.values(outcomes)) {
        expect(text).not.toMatch(elision);
        expect(text).not.toMatch(/ [:;!?»]|« /);
        expect(text).not.toMatch(/\biels?\b|·/);
      }
    }
  });

  it('names every skill, perk and item in both languages', () => {
    for (const locale of ['en', 'fr'] as const) {
      const texts = ARENA_TEXTS[locale];
      for (const skill of SKILLS) expect(texts.skills[skill]).toBeTruthy();
      for (const perk of ARENA.perks)
        expect(texts.perks[perk.id]?.name).toBeTruthy();
      for (const item of ARENA.items)
        expect(texts.items[item.id]?.a).toBeTruthy();
    }
    expect(ARENA.perks.length).toBeGreaterThanOrEqual(12);
    expect(ARENA.items.length).toBeGreaterThanOrEqual(15);
  });
});
