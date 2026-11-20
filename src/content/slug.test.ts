import { slug } from './slug';

describe('slug', () => {
  it.each([
    ['Human', 'human'],
    ['Dark elf', 'dark-elf'],
    ['Half-elf', 'half-elf'],
    ['Ashborn', 'ashborn'],
  ])('%s → %s', (value, expected) => {
    expect(slug(value)).toBe(expected);
  });
});
