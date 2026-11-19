import { render, screen } from '@testing-library/react';
import React from 'react';
import { characterList } from '../../../test/stubs/Character.stubs';
import { AlertManagerContext } from '../../contexts/AlertManagerContext';
import { DataContext, DataProvider } from '../../contexts/DataContext';
import { AlertManagerProvider } from '../../contexts/AlertManagerContext';
import { Character } from '../../types/character';
import { LocaleProvider } from '../../i18n';
import { MemoryRouter } from 'react-router';
import Characters from './Characters';

const renderCharactersWithContext = (
  characters: Character[] = [],
  locale: 'en' | 'fr' = 'en',
) => {
  return render(
    <MemoryRouter>
      <LocaleProvider initial={locale}>
        <DataContext.Provider
          value={{
            characters,
            saveCharacter: vi.fn(),
            removeCharacter: vi.fn(),
            updateCharacter: vi.fn(),
            findCharacter: vi.fn(),
          }}
        >
          <AlertManagerContext.Provider
            value={{ alerts: [], addAlert: vi.fn(), removeAlert: vi.fn() }}
          >
            <Characters />
          </AlertManagerContext.Provider>
        </DataContext.Provider>
      </LocaleProvider>
    </MemoryRouter>,
  );
};

describe('Characters', () => {
  it('throws an error when used outside of its context', () => {
    // Since React 16.9, console errors about uncaught exceptions in components are logged even if the error is caught in the test.
    // This line suppresses those logs for this test.
    vi.spyOn(console, 'error').mockImplementation(() => {
      return;
    });

    expect(() =>
      render(
        <MemoryRouter>
          <Characters />
        </MemoryRouter>,
      ),
    ).toThrow('Characters must be used within a DataProvider');
  });

  it('does not display the carousel when there are no characters', () => {
    renderCharactersWithContext();
    expect(screen.getByText('My Characters')).toBeInTheDocument();
    expect(screen.queryByTestId('carousel')).not.toBeInTheDocument();
  });

  it('displays the carousel when there are characters', () => {
    renderCharactersWithContext(characterList);
    expect(screen.getByText('My Characters')).toBeInTheDocument();
    expect(screen.getByTestId('carousel')).toBeInTheDocument();
  });

  it('shows its title in French', () => {
    renderCharactersWithContext([], 'fr');
    expect(
      screen.getByRole('heading', { name: 'Mes personnages' }),
    ).toBeInTheDocument();
  });

  it('opens characters saved by the previous version, keeping their English text', () => {
    const legacy = {
      firstName: 'Korvus',
      lastName: 'Blackiron',
      characterClass: 'Warrior',
      gender: 'Male',
      race: 'Dwarf',
      alignment: 'Lawful Good',
      age: 120,
      epithet: 'the Unbreakable',
      background: { title: 'Forged in Fire', content: ['An old story.'] },
    };
    localStorage.setItem(
      'characters',
      JSON.stringify([legacy, { broken: true }]),
    );

    render(
      <MemoryRouter>
        <LocaleProvider initial="fr">
          <AlertManagerProvider>
            <DataProvider>
              <Characters />
            </DataProvider>
          </AlertManagerProvider>
        </LocaleProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Korvus Blackiron')).toBeInTheDocument();
    expect(screen.getByText('The Unbreakable')).toBeInTheDocument();
    expect(screen.getByText('Écrit en anglais')).toBeInTheDocument();
    expect(screen.getByText('Nain')).toBeInTheDocument();
    localStorage.clear();
  });
});
