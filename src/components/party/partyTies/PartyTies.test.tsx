import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { generateParty } from '../../../content/party';
import type { Party } from '../../../types/party';
import PartyTies from './PartyTies';

const base = generateParty({ size: 3 });
const [a, b] = base.members;
const party: Party = {
  ...base,
  ties: [{ id: 't1', type: 'tie-life-debt', from: a.id, to: b.id }],
};

describe('PartyTies', () => {
  it('writes each tie with both names', () => {
    render(<PartyTies party={party} />);
    expect(
      screen.getByText(
        `${a.character.firstName} owes ${b.character.firstName} a life debt, and has not yet found a way to repay it.`,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('says when the members have no tie', () => {
    render(<PartyTies party={{ ...party, ties: [] }} />);
    expect(
      screen.getByText('These adventurers have just met.'),
    ).toBeInTheDocument();
  });

  it('rerolls and removes a tie', async () => {
    const onReroll = vi.fn();
    const onRemove = vi.fn();
    render(<PartyTies party={party} onReroll={onReroll} onRemove={onRemove} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Draw another tie' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove this tie' }),
    );
    expect(onReroll).toHaveBeenCalledWith('t1');
    expect(onRemove).toHaveBeenCalledWith('t1');
  });
});
