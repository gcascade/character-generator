import { arenaSetup } from '@Test/stubs/Arena.stubs';
import { render, screen, within } from '@testing-library/react';
import React from 'react';
import ContestantStatus from './ContestantStatus';

const base = Object.fromEntries(
  arenaSetup.contestants.map((c) => [
    c.id,
    {
      hp: 30,
      maxHp: 30,
      items: [],
      standing: true,
      sideId: c.sideId,
      defeats: 0,
    },
  ]),
);

describe('ContestantStatus', () => {
  it('shows hit points, gear, teams and those who are out', () => {
    const state = {
      ...base,
      aela: { ...base.aela, hp: 12, items: ['item-bow'] },
      vey: { ...base.vey, standing: false, hp: 0 },
    };
    render(
      <ContestantStatus
        setup={arenaSetup}
        state={state}
        moment="After Day 2"
      />,
    );
    const panel = screen.getByRole('region', {
      name: 'State of the contestants',
    });
    expect(within(panel).getByText('After Day 2')).toBeInTheDocument();
    expect(
      within(panel).getByText('The Lanterns of Greywater'),
    ).toBeInTheDocument();
    const aela = within(panel).getByRole('listitem', { name: 'Aela' });
    expect(within(aela).getByText('HP 12/30')).toBeInTheDocument();
    expect(within(aela).getByText('a bow')).toBeInTheDocument();
    expect(
      within(screen.getByRole('listitem', { name: 'Vey' })).getByText('Out'),
    ).toBeInTheDocument();
  });

  it('shows who left a team, alliances and defeats', () => {
    const state = {
      ...base,
      brom: { ...base.brom, sideId: 'brom:split', defeats: 2 },
      korvus: { ...base.korvus, allianceId: 'x' },
      sil: { ...base.sil, allianceId: 'x' },
    };
    render(
      <ContestantStatus
        setup={arenaSetup}
        state={state}
        moment="After Night 3"
      />,
    );
    expect(
      screen.getByText('Left The Lanterns of Greywater'),
    ).toBeInTheDocument();
    expect(screen.getByText('Foes defeated: 2')).toBeInTheDocument();
    expect(screen.getByText('Alliance: Sil')).toBeInTheDocument();
    expect(screen.getByText('Alliance: Korvus')).toBeInTheDocument();
  });

  it('groups a couple formed during the match', () => {
    const state = {
      ...base,
      korvus: { ...base.korvus, sideId: 'couple:korvus', partner: 'sil' },
      sil: { ...base.sil, sideId: 'couple:korvus', partner: 'korvus' },
    };
    render(
      <ContestantStatus
        setup={arenaSetup}
        state={state}
        moment="After Day 4"
      />,
    );
    expect(screen.getByRole('heading', { name: 'Couple' })).toBeInTheDocument();
  });
});
