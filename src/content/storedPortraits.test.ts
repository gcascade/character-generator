import {
  MAX_IMAGE_LENGTH,
  PORTRAITS_KEY,
  parseStoredPortraits,
  type StoredPortrait,
  savePortraits,
  shrinkImage,
  withoutUnused,
} from './storedPortraits';

const portrait = (paintedAt = '2026-11-20T10:00:00Z'): StoredPortrait => ({
  image: `data:image/webp;base64,${'A'.repeat(100)}`,
  traits: { race: 'Gnome', gender: 'Female', ageBand: 'adult', role: 'Bard' },
  service: 'horde',
  paintedAt,
});

const stored = (portraits: unknown) =>
  JSON.stringify({ version: 1, portraits });

describe('stored portraits (spec 011)', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('reads back valid portraits and drops invalid ones', () => {
    const good = portrait();
    expect(
      parseStoredPortraits(
        stored({
          a: good,
          b: { ...good, image: 'javascript:alert(1)' },
          c: {
            ...good,
            image: `data:image/webp;base64,${'A'.repeat(MAX_IMAGE_LENGTH)}`,
          },
          d: { ...good, traits: { ...good.traits, race: 'Dragon' } },
        }),
      ),
    ).toEqual({ a: good });
  });

  it.each([null, '', 'nope', '{"version":2}'])(
    'starts empty from %j',
    (raw) => {
      expect(parseStoredPortraits(raw)).toEqual({});
    },
  );

  it('keeps portraits something still points to, and those just painted', () => {
    localStorage.setItem(
      'characters',
      JSON.stringify([{ portraitId: 'used' }]),
    );
    const portraits = {
      used: portrait(),
      unused: portrait(),
      fresh: portrait(),
    };
    expect(Object.keys(withoutUnused(portraits, ['fresh'])).sort()).toEqual([
      'fresh',
      'used',
    ]);
  });

  it('drops the oldest unused portraits when storage is full', () => {
    localStorage.setItem(
      'npcs',
      JSON.stringify({ npcs: [{ portraitId: 'used' }] }),
    );
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    setItem.mockImplementation(function (this: Storage, key, value) {
      // Room for two portraits at most.
      if (
        key === PORTRAITS_KEY &&
        Object.keys(JSON.parse(value).portraits).length > 2
      ) {
        throw new DOMException('full', 'QuotaExceededError');
      }
    });
    const portraits = {
      used: portrait('2026-01-01'),
      old: portrait('2026-02-01'),
      recent: portrait('2026-03-01'),
    };
    expect(savePortraits(portraits)).toBe(true);
    const saved = JSON.parse(setItem.mock.calls.at(-1)![1]).portraits;
    expect(Object.keys(saved).sort()).toEqual(['recent', 'used']);
  });

  it('says when portraits cannot be kept at all', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    expect(savePortraits({ a: portrait() })).toBe(false);
  });

  it('keeps a small image as is when it cannot be redrawn', async () => {
    const small = `data:image/webp;base64,${'A'.repeat(1000)}`;
    await expect(shrinkImage(small)).resolves.toBe(small);
    await expect(
      shrinkImage(`data:image/webp;base64,${'A'.repeat(MAX_IMAGE_LENGTH)}`),
    ).rejects.toThrow();
  });
});
