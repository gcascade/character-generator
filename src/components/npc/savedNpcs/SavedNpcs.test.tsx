import { brennaThistledown } from '@Test/stubs/Npc.stubs';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { NpcProvider } from '../../../contexts/NpcContext';
import SavedNpcs from './SavedNpcs';

const renderList = () =>
  render(
    <MemoryRouter>
      <NpcProvider>
        <SavedNpcs />
      </NpcProvider>
    </MemoryRouter>,
  );

describe('SavedNpcs', () => {
  afterEach(() => localStorage.clear());

  it('invites to generate when empty', () => {
    renderList();
    expect(
      screen.getByText(/No saved side characters yet/),
    ).toBeInTheDocument();
  });

  it('links every saved side character to its page', () => {
    localStorage.setItem(
      'npcs',
      JSON.stringify({
        version: 1,
        npcs: [{ ...brennaThistledown, id: 'b1' }],
      }),
    );
    renderList();
    expect(
      screen.getByRole('link', { name: 'Brenna Thistledown' }),
    ).toHaveAttribute('href', '/npcs/b1');
  });
});
