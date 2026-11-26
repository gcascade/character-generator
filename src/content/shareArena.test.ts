import {
  addParty,
  addRandom,
  emptySetup,
  randomLoadouts,
  simulate,
} from './arena';
import { generateParty } from './party';
import { createRandom } from './random';
import { arenaUrl, decodeArena, encodeArena } from './share';

const bigSetup = () => {
  let setup = emptySetup();
  for (let i = 0; i < 6; i++)
    setup = addParty(setup, generateParty({ size: 4 }), 'en');
  return randomLoadouts(addRandom(setup, 24), createRandom('share'));
};

describe('arena share links (spec 012 US5)', () => {
  it('gives the same match after a round trip, for 48 contestants (SC-006)', async () => {
    const setup = bigSetup();
    expect(setup.contestants).toHaveLength(48);
    const shared = await decodeArena(await encodeArena(setup));
    expect(shared).toBeDefined();
    expect(shared!.contestants.map((c) => c.id)).toEqual(
      setup.contestants.map((c) => c.id),
    );
    expect(shared!.contestants.map((c) => c.perks)).toEqual(
      setup.contestants.map((c) => c.perks),
    );
    expect(shared!.sides.map((s) => s.name)).toEqual(
      setup.sides.map((s) => s.name),
    );
    expect(simulate(shared!).rounds).toEqual(simulate(setup).rounds);
  });

  it('keeps a 48-contestant link under 8 KB', async () => {
    const url = await arenaUrl(bigSetup(), 'https://example.org/app/');
    expect(url).toMatch(/^https:\/\/example\.org\/app\/arena#a1\./);
    expect(url.length).toBeLessThan(8000);
  });

  it('refuses damaged or crafted data', async () => {
    const data = await encodeArena(bigSetup());
    expect(await decodeArena(data.slice(0, data.length / 2))).toBeUndefined();
    expect(await decodeArena('not-base64!')).toBeUndefined();
    const crafted = btoa('["x"]');
    expect(await decodeArena(crafted)).toBeUndefined();
  });
});
