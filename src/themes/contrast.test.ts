import { contrastRatio } from './contrast';

describe('contrastRatio', () => {
  it('follows the WCAG formula', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21);
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21);
    expect(contrastRatio('#777777', '#777777')).toBe(1);
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 1);
  });

  it('rejects other colour formats', () => {
    expect(() => contrastRatio('red', '#fff')).toThrow();
  });
});
