import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { createRandom } from '../../../content/random';
import { rollSkills } from '../../../content/skills';
import ContestantCard from './ContestantCard';

const contestant = {
  id: 'c1',
  character: korvusBlackiron,
  sideId: 'c1',
  perks: [],
  items: [],
};
const skills = rollSkills(korvusBlackiron, createRandom('card'));

describe('ContestantCard', () => {
  it('shows the name, race, class and skills', () => {
    render(<ContestantCard contestant={contestant} skills={skills} />);
    expect(
      screen.getByRole('heading', { name: 'Korvus Blackiron' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Orc · Warrior')).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'Skills of Korvus Blackiron' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('removes the contestant', async () => {
    const onRemove = vi.fn();
    render(
      <ContestantCard
        contestant={contestant}
        skills={skills}
        onRemove={onRemove}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Korvus Blackiron' }),
    );
    expect(onRemove).toHaveBeenCalledOnce();
  });
});
