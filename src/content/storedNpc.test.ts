import { generateNpc } from './npc';
import {
  BATCH_SIZE,
  EMPTY_NPC_STATE,
  parseNpc,
  parseStoredNpcState,
  parseStoredNpcs,
} from './storedNpc';

const stored = (value: unknown) =>
  JSON.stringify({ version: 1, ...(value as object) });

describe('stored side characters', () => {
  it('reads back what was saved', () => {
    const current = { ...generateNpc(), id: 'a' };
    const batch = [generateNpc(), generateNpc()];
    const state = parseStoredNpcState(
      stored({
        current,
        batch,
        locked: ['race', 'occupation'],
        constraints: { occupation: 'Baker', gender: 'Female' },
      }),
    );
    expect(state).toEqual({
      current,
      batch,
      locked: ['race', 'occupation'],
      constraints: { occupation: 'Baker', gender: 'Female' },
    });
    expect(parseStoredNpcs(stored({ npcs: [current] }))).toEqual([current]);
  });

  it.each([null, '', 'not json', '{"version":2}', '[]'])(
    'starts empty from %j',
    (raw) => {
      expect(parseStoredNpcState(raw)).toEqual(EMPTY_NPC_STATE);
      expect(parseStoredNpcs(raw)).toEqual([]);
    },
  );

  it('drops invalid NPCs, locks and constraints one by one', () => {
    const good = generateNpc();
    const state = parseStoredNpcState(
      stored({
        current: { ...good, race: 'Dragon' },
        batch: [good, { nope: true }, ...Array(10).fill(good)],
        locked: ['race', 'alignment', 42],
        constraints: { occupation: 'Wizard', race: 'Gnome' },
      }),
    );
    expect(state.current).toBeUndefined();
    expect(state.batch).toHaveLength(BATCH_SIZE);
    expect(state.locked).toEqual(['race']);
    expect(state.constraints).toEqual({ race: 'Gnome' });
  });

  it('replaces a fragment that no longer exists by one of the same section', () => {
    const npc = generateNpc({ occupation: 'Miller' });
    const parsed = parseNpc({
      ...npc,
      content: { ...npc.content, daily: 'daily-miller-gone', rumour: 'x' },
    });
    expect(parsed?.content.daily).toMatch(/^daily-miller-/);
    expect(parsed?.content.daily).not.toBe('daily-miller-gone');
    expect(parsed?.content.rumour).toMatch(/^rumour-/);
    expect(parsed?.content.secret).toBe(npc.content.secret);
  });

  it('keeps AI text and refuses empty or oversized text', () => {
    const npc = generateNpc();
    const text = {
      language: 'fr',
      source: 'ai',
      look: 'l',
      daily: 'd',
      quirk: 'q',
      rumour: 'r',
      secret: 's',
      opinion: 'o',
    };
    expect(parseNpc({ ...npc, text })?.text).toEqual(text);
    expect(parseNpc({ ...npc, text: { ...text, look: '' } })).toBeUndefined();
    expect(
      parseNpc({ ...npc, text: { ...text, look: 'x'.repeat(601) } }),
    ).toBeUndefined();
  });
});
