import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { generateParty } from '../../../content/party';
import RosterBuilder from './RosterBuilder';

const party = generateParty({ size: 3 });
const saved = [{ ...korvusBlackiron, id: 'k1' }];

const setup = (count = 0) => {
  const props = {
    count,
    current: korvusBlackiron,
    saved,
    party,
    savedParties: [party],
    onAddCharacter: vi.fn(),
    onAddParty: vi.fn(),
    onAddRandom: vi.fn(),
    onRandomLoadouts: vi.fn(),
    onClear: vi.fn(),
  };
  render(<RosterBuilder {...props} />);
  return props;
};

describe('RosterBuilder', () => {
  it('adds the current character and the current party', async () => {
    const props = setup();
    await userEvent.click(
      screen.getByRole('button', { name: 'Add the current character' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Add the current party' }),
    );
    expect(props.onAddCharacter).toHaveBeenCalledWith(
      korvusBlackiron,
      undefined,
    );
    expect(props.onAddParty).toHaveBeenCalledWith(party);
  });

  it('adds a saved character and a saved party', async () => {
    const props = setup();
    await userEvent.click(
      screen.getByRole('combobox', { name: 'Saved character' }),
    );
    await userEvent.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: 'Korvus Blackiron',
      }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Add a saved character' }),
    );
    expect(props.onAddCharacter).toHaveBeenCalledWith(saved[0], 'k1');
    await userEvent.click(
      screen.getByRole('combobox', { name: 'Saved party' }),
    );
    await userEvent.click(
      within(screen.getByRole('listbox')).getAllByRole('option')[0],
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Add a saved party' }),
    );
    expect(props.onAddParty).toHaveBeenCalledWith(party);
  });

  it('adds random characters', async () => {
    const props = setup(3);
    await userEvent.click(
      screen.getByRole('button', { name: 'Add 4 random characters' }),
    );
    expect(props.onAddRandom).toHaveBeenCalledWith(4);
    expect(screen.getByText('3 / 48 contestants')).toBeInTheDocument();
  });

  it('says when the arena is full', () => {
    setup(48);
    expect(
      screen.getByText('The arena is full (48 contestants).'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add the current character' }),
    ).toBeDisabled();
  });
});
