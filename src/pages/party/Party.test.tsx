import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { AlertManagerProvider } from '../../contexts/AlertManagerContext';
import { DataProvider } from '../../contexts/DataContext';
import { PartyProvider } from '../../contexts/PartyContext';
import { LocaleProvider } from '../../i18n';
import Party from './Party';

const renderPage = (locale: 'en' | 'fr' = 'en') =>
  render(
    <MemoryRouter>
      <LocaleProvider initial={locale}>
        <AlertManagerProvider>
          <DataProvider>
            <PartyProvider>
              <Party />
            </PartyProvider>
          </DataProvider>
        </AlertManagerProvider>
      </LocaleProvider>
    </MemoryRouter>,
  );

const members = () => screen.queryAllByRole('article');

const choose = async (field: string, option: string) => {
  await userEvent.click(screen.getByRole('combobox', { name: field }));
  await userEvent.click(
    within(screen.getByRole('listbox')).getByRole('option', { name: option }),
  );
};

describe('Party page', () => {
  afterEach(() => localStorage.clear());

  it('invites to generate, then shows a party of 4 with its story', async () => {
    renderPage();
    expect(
      screen.getByText('Choose a size and generate your party.'),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Generate a party' }),
    );
    expect(members()).toHaveLength(4);
    expect(screen.getByRole('region', { name: /./ })).toBeInTheDocument();
  });

  it('applies the size and shared race', async () => {
    renderPage();
    await choose('Size', '6');
    await choose('Race', 'Elf');
    await userEvent.click(
      screen.getByRole('button', { name: 'Generate a party' }),
    );
    expect(members()).toHaveLength(6);
    for (const card of members()) {
      expect(within(card).getAllByText('Elf').length).toBeGreaterThan(0);
    }
  });

  it('keeps a locked member and flags it when settings change', async () => {
    renderPage();
    await userEvent.click(
      screen.getByRole('button', { name: 'Generate a party' }),
    );
    const first = members()[0];
    const name = first.getAttribute('aria-label')!;
    const firstName = name.split(' ')[0];
    await userEvent.click(
      within(first).getByRole('button', { name: `Keep ${firstName}` }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Generate a party' }),
    );
    expect(members()[0]).toHaveAttribute('aria-label', name);
    const isOrc = within(members()[0]).queryAllByText('Orc').length > 0;
    await choose('Race', isOrc ? 'Elf' : 'Orc');
    expect(
      within(members()[0]).getByText('No longer matches the party settings'),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Generate a party' }),
    );
    expect(members()[0]).toHaveAttribute('aria-label', name);
  });

  it('saves the party and a member', async () => {
    renderPage();
    await userEvent.click(
      screen.getByRole('button', { name: 'Generate a party' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Save the party' }),
    );
    expect(screen.getByRole('button', { name: 'Party saved' })).toBeDisabled();
    const card = members()[1];
    const firstName = card.getAttribute('aria-label')!.split(' ')[0];
    await userEvent.click(
      within(card).getByRole('button', { name: `Save ${firstName}` }),
    );
    expect(JSON.parse(localStorage.getItem('characters')!)).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem('parties')!).parties).toHaveLength(
      1,
    );
  });

  it('speaks French', async () => {
    renderPage('fr');
    await userEvent.click(
      screen.getByRole('button', { name: 'Générer un groupe' }),
    );
    expect(members()).toHaveLength(4);
  });
});
