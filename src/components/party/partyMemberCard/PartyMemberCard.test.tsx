import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { generateParty } from '../../../content/party';
import PartyMemberCard from './PartyMemberCard';

const member = generateParty({ size: 2 }).members[0];
const { firstName, lastName } = member.character;

describe('PartyMemberCard', () => {
  it('shows the member and only the actions it is given', () => {
    render(<PartyMemberCard member={member} />);
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: `${firstName} ${lastName}`,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: `Keep ${firstName}` }),
    ).toBeNull();
  });

  it('locks, rerolls and saves', async () => {
    const onToggleLock = vi.fn();
    const onReroll = vi.fn();
    const onSave = vi.fn();
    render(
      <PartyMemberCard
        member={member}
        onToggleLock={onToggleLock}
        onReroll={onReroll}
        onSave={onSave}
      />,
    );
    const lock = screen.getByRole('button', { name: `Keep ${firstName}` });
    expect(lock).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(lock);
    await userEvent.click(
      screen.getByRole('button', { name: `Replace ${firstName}` }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: `Save ${firstName}` }),
    );
    expect(
      [onToggleLock, onReroll, onSave].map((f) => f.mock.calls.length),
    ).toEqual([1, 1, 1]);
  });

  it('cannot be replaced while kept', () => {
    render(
      <PartyMemberCard
        member={{ ...member, locked: true }}
        onToggleLock={vi.fn()}
        onReroll={vi.fn()}
      />,
    );
    expect(
      screen.getByRole('button', { name: `Release ${firstName}` }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.queryByRole('button', { name: `Replace ${firstName}` }),
    ).toBeNull();
  });

  it('opens the full story of the member', async () => {
    render(<PartyMemberCard member={member} />);
    await userEvent.click(
      screen.getByRole('button', { name: `Read ${firstName}'s story` }),
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: `${firstName} ${lastName}`,
      }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
  });

  it('warns when the member no longer matches the party settings', () => {
    render(<PartyMemberCard member={member} notMatching />);
    expect(
      screen.getByText('No longer matches the party settings'),
    ).toBeInTheDocument();
  });
});
