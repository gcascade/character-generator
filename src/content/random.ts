/** A seeded random stream (spec 012 research R1): same seed, same numbers, on every browser. */
export type Random = {
  /** A number in [0, 1). */
  next: () => number;
  /** An integer in [0, n). */
  int: (n: number) => number;
  pick: <T>(items: readonly T[]) => T;
  shuffle: <T>(items: readonly T[]) => T[];
  /** A d100 roll, 1–100. */
  roll: () => number;
};

/** cyrb128: four 32-bit hashes of a string. */
const hash = (text: string) => {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0; i < text.length; i++) {
    const k = text.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= h2 ^ h3 ^ h4;
  h2 ^= h1;
  h3 ^= h1;
  h4 ^= h1;
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
};

export const createRandom = (seed: string): Random => {
  let [a, b, c, d] = hash(seed);
  // sfc32
  const next = () => {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
  const int = (n: number) => Math.floor(next() * n);
  return {
    next,
    int,
    pick: (items) => items[int(items.length)],
    shuffle: (items) => {
      const copy = [...items];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = int(i + 1);
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
    roll: () => int(100) + 1,
  };
};

/** A new seed: 8 base36 characters. */
export const newSeed = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (byte) => (byte % 36).toString(36)).join('');
};
