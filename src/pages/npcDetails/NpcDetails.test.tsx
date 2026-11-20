import { brennaThistledown } from '@Test/stubs/Npc.stubs';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { AlertManagerProvider } from '../../contexts/AlertManagerContext';
import { NpcProvider } from '../../contexts/NpcContext';
import useNpcs from '../../hooks/useNpcs';
import { LocaleProvider } from '../../i18n';
import NpcDetails from './NpcDetails';

const ListProbe = () => (
  <p>list tab: {(useLocation().state as { tab?: string } | null)?.tab}</p>
);
const GeneratorProbe = () => <p>current: {useNpcs().npc.firstName}</p>;

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <LocaleProvider initial="en">
        <AlertManagerProvider>
          <NpcProvider>
            <Routes>
              <Route path="/npcs/:id" element={<NpcDetails />} />
              <Route path="/npcs" element={<GeneratorProbe />} />
              <Route path="/characters" element={<ListProbe />} />
            </Routes>
          </NpcProvider>
        </AlertManagerProvider>
      </LocaleProvider>
    </MemoryRouter>,
  );

describe('NpcDetails page', () => {
  beforeEach(() =>
    localStorage.setItem(
      'npcs',
      JSON.stringify({
        version: 1,
        npcs: [{ ...brennaThistledown, id: 'brenna' }],
      }),
    ),
  );
  afterEach(() => localStorage.clear());

  it('shows the saved side character', () => {
    renderAt('/npcs/brenna');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Brenna Thistledown' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument();
  });

  it('says when it no longer exists', () => {
    renderAt('/npcs/gone');
    expect(
      screen.getByText('This side character no longer exists.'),
    ).toBeInTheDocument();
  });

  it('deletes after confirmation and goes back to the list tab', async () => {
    renderAt('/npcs/brenna');
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Click again to confirm' }),
    );
    expect(screen.getByText('list tab: npcs')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('npcs')!).npcs).toEqual([]);
  });

  it('opens it on the side-character page', async () => {
    renderAt('/npcs/brenna');
    await userEvent.click(
      screen.getByRole('button', { name: 'Open in Side characters' }),
    );
    expect(screen.getByText('current: Brenna')).toBeInTheDocument();
  });
});
