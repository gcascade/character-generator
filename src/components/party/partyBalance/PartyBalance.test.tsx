import { render, screen } from '@testing-library/react';
import React from 'react';
import type { Party } from '../../../types/party';
import PartyBalance from './PartyBalance';

const member = (characterClass: string, role: string) =>
  ({
    character: { characterClass },
    role,
  }) as unknown as Party['members'][number];

describe('PartyBalance', () => {
  it('gives each area a level in words and names the gaps', () => {
    render(
      <PartyBalance
        party={{
          members: [
            member('Warrior', 'role-muscle'),
            member('Mage', 'role-scholar'),
          ],
        }}
      />,
    );
    const levels = Object.fromEntries(
      screen
        .getAllByRole('term')
        .map((dt, i) => [
          dt.textContent,
          screen.getAllByRole('definition')[i].textContent,
        ]),
    );
    expect(levels).toEqual({
      Fighting: 'good',
      Magic: 'good',
      Healing: 'none',
      Stealth: 'none',
      Talking: 'none',
    });
    expect(screen.getByText('No one to heal the wounded.')).toBeInTheDocument();
  });

  it('praises a well-balanced party', () => {
    render(
      <PartyBalance
        party={{
          members: [
            member('Warrior', 'role-leader'),
            member('Mage', 'role-strategist'),
            member('Rogue', 'role-scout'),
            member('Cleric', 'role-healer'),
          ],
        }}
      />,
    );
    expect(screen.getByText('A well-balanced company.')).toBeInTheDocument();
  });
});
