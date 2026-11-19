import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { generateParty, renderParty } from '../../../content/party';
import { AlertManagerProvider } from '../../../contexts/AlertManagerContext';
import { DataProvider } from '../../../contexts/DataContext';
import { PartyProvider } from '../../../contexts/PartyContext';
import useParty from '../../../hooks/useParty';
import Characters from '../../../pages/characters/Characters';

const saved = generateParty({ size: 3 });
const name = renderParty(saved, 'en').name;

const PartyProbe = () => {
  const { party } = useParty();
  return <p>current party: {party?.id}</p>;
};

const renderList = () => {
  localStorage.setItem(
    'parties',
    JSON.stringify({ version: 1, parties: [saved] }),
  );
  return render(
    <MemoryRouter initialEntries={['/characters']}>
      <AlertManagerProvider>
        <DataProvider>
          <PartyProvider>
            <Routes>
              <Route path="/characters" element={<Characters />} />
              <Route path="/party" element={<PartyProbe />} />
            </Routes>
          </PartyProvider>
        </DataProvider>
      </AlertManagerProvider>
    </MemoryRouter>,
  );
};

describe('SavedParties (Parties tab)', () => {
  afterEach(() => localStorage.clear());

  it('lists saved parties with their members and reopens one', async () => {
    renderList();
    await userEvent.click(screen.getByRole('tab', { name: 'Parties' }));
    expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    for (const { character } of saved.members) {
      expect(
        screen.getByText(`${character.firstName} ${character.lastName}`),
      ).toBeInTheDocument();
    }
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByText(`current party: ${saved.id}`)).toBeInTheDocument();
  });

  it('deletes a party after confirmation', async () => {
    renderList();
    await userEvent.click(screen.getByRole('tab', { name: 'Parties' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Click again to delete' }),
    );
    expect(screen.getByText('No saved party yet')).toBeInTheDocument();
  });
});
