import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { AlertManagerProvider } from '../../contexts/AlertManagerContext';
import { NpcProvider } from '../../contexts/NpcContext';
import { LocaleProvider, useLocale } from '../../i18n';
import Npcs from './Npcs';

const SwitchToFrench = () => {
  const { setLocale } = useLocale();
  return <button onClick={() => setLocale('fr')}>fr</button>;
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <LocaleProvider initial="en">
        <AlertManagerProvider>
          <NpcProvider>
            <SwitchToFrench />
            <Npcs />
          </NpcProvider>
        </AlertManagerProvider>
      </LocaleProvider>
    </MemoryRouter>,
  );

const sheet = () => screen.getAllByRole('article')[0];
const heading = () => within(sheet()).getByRole('heading').textContent;

const choose = async (field: string, option: string) => {
  await userEvent.click(screen.getByRole('combobox', { name: field }));
  await userEvent.click(
    within(screen.getByRole('listbox')).getByRole('option', { name: option }),
  );
};

describe('Side characters page', () => {
  afterEach(() => localStorage.clear());

  it('shows a side character from the start, with the six sections', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Side characters' }),
    ).toBeInTheDocument();
    for (const title of ['Look', 'Daily life', 'Rumour', 'Secret']) {
      expect(within(sheet()).getByText(title)).toBeInTheDocument();
    }
  });

  it('generates within the chosen occupation', async () => {
    renderPage();
    await choose('Occupation', 'Blacksmith');
    for (let i = 0; i < 5; i++) {
      await userEvent.click(screen.getByRole('button', { name: 'Generate' }));
      expect(within(sheet()).getAllByText('Blacksmith').length).toBeGreaterThan(
        0,
      );
    }
  });

  it('keeps the same side character when the language changes', async () => {
    renderPage();
    const name = heading();
    await userEvent.click(screen.getByRole('button', { name: 'fr' }));
    expect(heading()).toBe(name);
    expect(within(sheet()).getByText('Quotidien')).toBeInTheDocument();
  });

  it('rerolls one section and keeps locked properties', async () => {
    renderPage();
    const name = heading();
    await userEvent.click(
      screen.getByRole('button', { name: 'Lock the last name' }),
    );
    const lastName = name!.split(' ').slice(1).join(' ');
    await userEvent.click(
      screen.getByRole('button', { name: 'Reroll the secret' }),
    );
    expect(heading()).toBe(name);
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }));
    expect(heading()).toMatch(new RegExp(`${lastName}$`));
  });

  it('generates five cards and opens one', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Generate 5' }));
    const batch = screen.getByRole('region', { name: 'Five more faces' });
    const cards = within(batch).getAllByRole('article');
    expect(cards).toHaveLength(5);
    const name = within(cards[3]).getByRole('heading').textContent!;
    await userEvent.click(
      within(cards[3]).getByRole('button', { name: `Open ${name}` }),
    );
    expect(heading()).toBe(name);
  });

  it('saves the side character once', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByRole('button', { name: 'Saved' })).toBeDisabled();
    expect(JSON.parse(localStorage.getItem('npcs')!).npcs).toHaveLength(1);
  });
});
