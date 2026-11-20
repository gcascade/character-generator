import { brennaThistledown } from '@Test/stubs/Npc.stubs';
import { generateNpcSheet, npcSheetPrompt } from './npc';
import { activeSignal, fakeProvider } from './providers/testing';

const answer = {
  firstName: 'Merra',
  lastName: 'Cobbleby',
  look: 'A flour-dusted apron.',
  daily: 'Runs the kitchen.',
  quirk: 'Hums.',
  rumour: 'The cellar is haunted.',
  secret: 'Owes money.',
  opinion: 'Likes paying customers.',
};

describe('npcSheetPrompt', () => {
  it('gives the fixed facts, the sections and the language rules', () => {
    const { prompt } = npcSheetPrompt(
      { ...brennaThistledown, race: 'Ashborn', gender: 'Non-binary' },
      'fr',
    );
    expect(prompt).toContain('Occupation: Innkeeper');
    expect(prompt).toMatch(/Race: Ashborn \(.*infernal/);
    expect(prompt).toContain('Age: 46');
    for (const section of [
      'look',
      'daily',
      'quirk',
      'rumour',
      'secret',
      'opinion',
    ]) {
      expect(prompt).toContain(`"${section}"`);
    }
    expect(prompt).toContain('Write every text value in French.');
    expect(prompt).toContain('never use "iel"');
  });
});

describe('generateNpcSheet', () => {
  it('uses a valid answer and keeps the app facts', async () => {
    const { provider } = fakeProvider([
      { ...answer, occupation: 'Noble', age: 3 },
    ]);
    const outcome = await generateNpcSheet(
      provider,
      brennaThistledown,
      'en',
      activeSignal(),
    );
    expect(outcome.source).toBe('ai');
    expect(outcome.npc).toMatchObject({
      firstName: 'Merra',
      lastName: 'Cobbleby',
      occupation: 'Innkeeper',
      age: 46,
      race: 'Halfling',
    });
    expect(outcome.npc.text).toEqual({
      look: answer.look,
      daily: answer.daily,
      quirk: answer.quirk,
      rumour: answer.rumour,
      secret: answer.secret,
      opinion: answer.opinion,
      language: 'en',
      source: 'ai',
    });
  });

  it('keeps the app sheet when the answer is invalid', async () => {
    const { provider } = fakeProvider([{ ...answer, secret: '' }]);
    const outcome = await generateNpcSheet(
      provider,
      brennaThistledown,
      'en',
      activeSignal(),
    );
    expect(outcome).toMatchObject({ source: 'app', npc: brennaThistledown });
    expect(outcome.failure?.cause).toBe('invalid-answer');
  });

  it('keeps the app sheet when the provider fails', async () => {
    const { provider } = fakeProvider([new TypeError('Failed to fetch')]);
    const outcome = await generateNpcSheet(
      provider,
      brennaThistledown,
      'en',
      activeSignal(),
    );
    expect(outcome.source).toBe('app');
    expect(outcome.npc).toBe(brennaThistledown);
    expect(outcome.failure).toBeDefined();
  });
});
