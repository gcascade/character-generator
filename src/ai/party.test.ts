import { generateParty } from '../content/party';
import { generatePartyStory, partyStoryPrompt } from './party';
import { activeSignal, fakeProvider } from './providers/testing';

const party = generateParty({ size: 3 });
const answer = {
  name: 'The Ash Lanterns',
  story: ['They met in the rain.', 'They seek the crown.'],
};

describe('partyStoryPrompt', () => {
  it('gives every member as a fixed fact and the language', () => {
    const { prompt } = partyStoryPrompt(party, 'fr');
    for (const { character } of party.members) {
      expect(prompt).toContain(`${character.firstName} ${character.lastName}`);
    }
    expect(prompt).toContain('Write every text value in French.');
    expect(prompt).toContain('la compagnie');
  });
});

describe('generatePartyStory', () => {
  it('uses a valid AI story and keeps the members', async () => {
    const { provider } = fakeProvider([
      { ...answer, members: [{ firstName: 'Nope' }] },
    ]);
    const outcome = await generatePartyStory(
      provider,
      party,
      'en',
      activeSignal(),
    );
    expect(outcome.source).toBe('ai');
    expect(outcome.party.text).toEqual({
      ...answer,
      language: 'en',
      source: 'ai',
    });
    expect(outcome.party.members).toBe(party.members);
  });

  it('keeps the app story when the answer is invalid', async () => {
    const { provider } = fakeProvider([{ name: 'Only a name' }]);
    const outcome = await generatePartyStory(
      provider,
      party,
      'en',
      activeSignal(),
    );
    expect(outcome).toMatchObject({ source: 'app', party });
    expect(outcome.failure?.cause).toBe('invalid-answer');
  });

  it('keeps the app story when the provider fails', async () => {
    const { provider } = fakeProvider([new TypeError('Failed to fetch')]);
    const outcome = await generatePartyStory(
      provider,
      party,
      'en',
      activeSignal(),
    );
    expect(outcome.source).toBe('app');
    expect(outcome.failure).toBeDefined();
    expect(outcome.party.text).toBeUndefined();
  });
});
