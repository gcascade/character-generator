import { CharacterClasses, CharacterRaces } from '../types/character';
import { contrastRatio } from './contrast';
import { classColor, type Mode, raceColor, TOKENS } from './palette';

const AA = 4.5;

describe.each(['light', 'dark'] as Mode[])('%s palette (WCAG AA)', (mode) => {
  const t = TOKENS[mode];

  it.each([
    ['text on paper', t.text, t.paper],
    ['text on background', t.text, t.background],
    ['secondary text on paper', t.textSecondary, t.paper],
    ['secondary text on background', t.textSecondary, t.background],
    ['accent on paper', t.accent, t.paper],
    ['primary on paper', t.primary, t.paper],
    ['primary on background', t.primary, t.background],
    ['button text on primary', t.onPrimary, t.primary],
    ['menu text', t.onMenu, t.menu],
  ])('%s', (_, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(AA);
  });

  it.each(Object.values(CharacterRaces))('%s badge', (race) => {
    const { main, contrastText } = raceColor(race, mode);
    expect(contrastRatio(contrastText, main)).toBeGreaterThanOrEqual(AA);
    expect(contrastRatio(main, t.paper)).toBeGreaterThanOrEqual(3);
  });

  it.each(Object.values(CharacterClasses))('%s badge', (characterClass) => {
    const { main, contrastText } = classColor(characterClass, mode);
    expect(contrastRatio(contrastText, main)).toBeGreaterThanOrEqual(AA);
    expect(contrastRatio(main, t.paper)).toBeGreaterThanOrEqual(3);
  });
});
