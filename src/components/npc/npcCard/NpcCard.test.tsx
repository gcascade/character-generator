import { brennaThistledown } from '@Test/stubs/Npc.stubs';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router';
import NpcCard from './NpcCard';

describe('NpcCard', () => {
  it('shows the name, occupation, race and quirk', () => {
    render(<NpcCard npc={brennaThistledown} />);
    expect(
      screen.getByRole('heading', { name: 'Brenna Thistledown' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Innkeeper · Halfling')).toBeInTheDocument();
    expect(screen.getByText(/Offers food to everyone/)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('opens and saves', async () => {
    const onOpen = vi.fn();
    const onSave = vi.fn();
    render(<NpcCard npc={brennaThistledown} onOpen={onOpen} onSave={onSave} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Open Brenna Thistledown' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Save Brenna Thistledown' }),
    );
    expect(onOpen).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledOnce();
  });

  it('shows when it is saved', () => {
    render(<NpcCard npc={brennaThistledown} onSave={vi.fn()} saved />);
    expect(screen.getByRole('button', { name: 'Saved' })).toBeDisabled();
  });

  it('links to the NPC page', () => {
    render(
      <MemoryRouter>
        <NpcCard npc={brennaThistledown} to="/npcs/abc" />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('link', { name: 'Brenna Thistledown' }),
    ).toHaveAttribute('href', '/npcs/abc');
  });
});
