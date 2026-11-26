import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import LoadoutPicker from './LoadoutPicker';

const setup = (perks: string[] = [], items: string[] = []) => {
  const onPerks = vi.fn();
  const onItems = vi.fn();
  render(
    <LoadoutPicker
      name="Korvus"
      id="k"
      perks={perks}
      items={items}
      onPerks={onPerks}
      onItems={onItems}
    />,
  );
  return { onPerks, onItems };
};

const choose = async (field: string, option: string) => {
  await userEvent.click(screen.getByRole('combobox', { name: field }));
  await userEvent.click(
    within(screen.getByRole('listbox')).getByRole('option', {
      name: new RegExp(`^${option}`),
    }),
  );
};

describe('LoadoutPicker', () => {
  it('chooses a perk and an item', async () => {
    const { onPerks, onItems } = setup();
    expect(
      screen.getByRole('group', { name: 'Perks and items of Korvus' }),
    ).toBeInTheDocument();
    await choose('Perk 1', 'Lucky');
    expect(onPerks).toHaveBeenCalledWith(['perk-lucky']);
    await choose('Item 1', 'a sword');
    expect(onItems).toHaveBeenCalledWith(['item-sword']);
  });

  it('opens a new slot after each choice, up to two perks and three items', () => {
    setup(
      ['perk-lucky', 'perk-brute'],
      ['item-sword', 'item-bow', 'item-rope'],
    );
    expect(screen.getAllByRole('combobox')).toHaveLength(5);
    expect(
      screen.getByText('Rerolls one failed check per match.'),
    ).toBeInTheDocument();
  });

  it('does not offer the same perk twice', async () => {
    setup(['perk-lucky']);
    await userEvent.click(screen.getByRole('combobox', { name: 'Perk 2' }));
    expect(
      within(screen.getByRole('listbox')).queryByRole('option', {
        name: /^Lucky/,
      }),
    ).not.toBeInTheDocument();
  });

  it('removes a choice with None', async () => {
    const { onPerks } = setup(['perk-lucky', 'perk-brute']);
    await choose('Perk 1', 'None');
    expect(onPerks).toHaveBeenCalledWith(['perk-brute']);
  });
});
