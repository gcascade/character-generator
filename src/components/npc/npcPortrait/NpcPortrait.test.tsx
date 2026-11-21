import { brennaThistledown } from '@Test/stubs/Npc.stubs';
import { PAINTED_IMAGE } from '@Test/stubs/horde';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { PortraitProvider } from '../../../contexts/PortraitContext';
import NpcPortrait from './NpcPortrait';

describe('NpcPortrait (spec 011)', () => {
  afterEach(() => localStorage.clear());

  it('shows the emblem without a painted portrait', () => {
    render(<NpcPortrait npc={brennaThistledown} height={200} width={200} />);
    expect(
      screen.getByRole('img', { name: 'Emblem: Halfling Innkeeper' }),
    ).toBeInTheDocument();
  });

  it('shows the painted portrait, and says when the NPC changed', () => {
    const npc = { ...brennaThistledown, portraitId: 'p1' };
    localStorage.setItem('npcs', JSON.stringify({ version: 1, npcs: [npc] }));
    localStorage.setItem(
      'portraits',
      JSON.stringify({
        version: 1,
        portraits: {
          p1: {
            image: PAINTED_IMAGE,
            traits: {
              race: 'Halfling',
              gender: 'Female',
              ageBand: 'middle-aged',
              role: 'Baker',
            },
            service: 'horde',
            paintedAt: '2026-11-21T10:00:00Z',
          },
        },
      }),
    );
    render(
      <PortraitProvider>
        <NpcPortrait npc={npc} height={200} width={200} />
      </PortraitProvider>,
    );
    expect(screen.getByAltText('Halfling Innkeeper')).toHaveAttribute(
      'src',
      PAINTED_IMAGE,
    );
    // Painted as a baker, now an innkeeper.
    expect(screen.getByText('May be outdated')).toBeInTheDocument();
  });
});
