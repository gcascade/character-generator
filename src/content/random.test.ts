import { createRandom, newSeed } from './random';

describe('seeded random (spec 012 R1)', () => {
  it('gives the same sequence for the same seed', () => {
    const a = createRandom('abc');
    const b = createRandom('abc');
    const first = Array.from({ length: 20 }, () => a.next());
    expect(Array.from({ length: 20 }, () => b.next())).toEqual(first);
  });

  it('pins the first values, so a change of algorithm is noticed', () => {
    const random = createRandom('arena');
    expect([random.roll(), random.roll(), random.roll()]).toMatchSnapshot();
  });

  it('gives different sequences for different seeds', () => {
    const a = createRandom('seed-1');
    const b = createRandom('seed-2');
    expect(a.next()).not.toBe(b.next());
  });

  it('rolls 1 to 100, roughly uniformly', () => {
    const random = createRandom('uniform');
    const counts = new Array<number>(10).fill(0);
    for (let i = 0; i < 100_000; i++) {
      const roll = random.roll();
      expect(roll).toBeGreaterThanOrEqual(1);
      expect(roll).toBeLessThanOrEqual(100);
      counts[Math.floor((roll - 1) / 10)]++;
    }
    for (const count of counts) {
      expect(Math.abs(count - 10_000)).toBeLessThan(300);
    }
  });

  it('shuffles without losing items and picks from the list', () => {
    const random = createRandom('shuffle');
    const items = [1, 2, 3, 4, 5];
    expect(random.shuffle(items).sort()).toEqual(items);
    expect(items).toContain(random.pick(items));
  });

  it('makes 8-character seeds', () => {
    expect(newSeed()).toMatch(/^[0-9a-z]{8}$/);
  });
});
