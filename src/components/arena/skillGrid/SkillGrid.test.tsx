import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { LocaleProvider } from '../../../i18n';
import { createRandom } from '../../../content/random';
import { rollSkills } from '../../../content/skills';
import SkillGrid from './SkillGrid';

const skills = rollSkills(
  { race: 'Orc', characterClass: 'Warrior', age: 30 },
  createRandom('grid'),
);

describe('SkillGrid', () => {
  it('shows the thirteen skills by family, and hit points', () => {
    render(<SkillGrid skills={skills} name="Korvus" />);
    const grid = screen.getByRole('group', { name: 'Skills of Korvus' });
    for (const family of ['Combat', 'Physical', 'Mind', 'Social']) {
      expect(within(grid).getByText(family)).toBeInTheDocument();
    }
    expect(within(grid).getByText('Melee')).toBeInTheDocument();
    expect(within(grid).getByText('Deception')).toBeInTheDocument();
    expect(
      within(grid).getAllByText(String(skills.values.melee)).length,
    ).toBeGreaterThan(0);
    expect(within(grid).getByText(`HP ${skills.hp}`)).toBeInTheDocument();
  });

  it('names the skills in French', () => {
    render(
      <LocaleProvider initial="fr">
        <SkillGrid skills={skills} name="Korvus" />
      </LocaleProvider>,
    );
    expect(screen.getByText('Corps à corps')).toBeInTheDocument();
    expect(screen.getByText(`PV ${skills.hp}`)).toBeInTheDocument();
  });
});
