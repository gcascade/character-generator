import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LockProvider } from '../../contexts/LockContext';
import React from 'react';
import { AlertManagerContext } from '../../contexts/AlertManagerContext';
import { CharacterContext } from '../../contexts/CharacterContext';
import { DataContext } from '../../contexts/DataContext';
import { HistoryContext } from '../../contexts/HistoryContext';
import { RequestContext } from '../../contexts/RequestContext';
import { Character } from '../../types/character';
import Home from './Home';

describe('Home', () => {
  const character: Character = {
    firstName: 'John',
    lastName: 'Doe',
    epithet: 'The Brave',
    race: 'Elf',
    characterClass: 'Warrior',
    gender: 'Male',
    age: 100,
    alignment: 'Neutral Good',
    background: {
      title: 'Test Title',
      content: [
        'Test content 1',
        'Test content 2',
        'Test content 3',
        'Test content 4',
        'Test content 5',
      ],
    },
  };

  const history: Character[] = [];

  const setCharacter = vi.fn();
  const addToHistory = vi.fn();
  const removeFromHistory = vi.fn();
  const clearHistory = vi.fn();
  const setRequestStatus = vi.fn();
  const setError = vi.fn();

  beforeEach(() => {
    setCharacter.mockClear();
    addToHistory.mockClear();
    removeFromHistory.mockClear();
    clearHistory.mockClear();
    setRequestStatus.mockClear();
    setError.mockClear();
  });

  test('renders Home component without crashing', () => {
    render(
      <CharacterContext.Provider value={{ character, setCharacter }}>
        <LockProvider>
          <HistoryContext.Provider
            value={{ history, addToHistory, removeFromHistory, clearHistory }}
          >
            <RequestContext.Provider
              value={{
                requestStatus: 'success',
                setRequestStatus: setRequestStatus,
                error: '',
                setError: setError,
              }}
            >
              <AlertManagerContext.Provider
                value={{ addAlert: vi.fn(), removeAlert: vi.fn(), alerts: [] }}
              >
                <DataContext.Provider
                  value={{
                    characters: [],
                    saveCharacter: vi.fn(),
                    removeCharacter: vi.fn(),
                    updateCharacter: vi.fn(),
                    findCharacter: vi.fn(),
                  }}
                >
                  <Home />
                </DataContext.Provider>
              </AlertManagerContext.Provider>
            </RequestContext.Provider>
          </HistoryContext.Provider>
        </LockProvider>
      </CharacterContext.Provider>,
    );
  });

  test('renders Home title', () => {
    render(
      <CharacterContext.Provider value={{ character, setCharacter }}>
        <LockProvider>
          <HistoryContext.Provider
            value={{ history, addToHistory, removeFromHistory, clearHistory }}
          >
            <RequestContext.Provider
              value={{
                requestStatus: 'success',
                setRequestStatus: setRequestStatus,
                error: '',
                setError: setError,
              }}
            >
              <AlertManagerContext.Provider
                value={{ addAlert: vi.fn(), removeAlert: vi.fn(), alerts: [] }}
              >
                <DataContext.Provider
                  value={{
                    characters: [],
                    saveCharacter: vi.fn(),
                    removeCharacter: vi.fn(),
                    updateCharacter: vi.fn(),
                    findCharacter: vi.fn(),
                  }}
                >
                  <Home />
                </DataContext.Provider>
              </AlertManagerContext.Provider>
            </RequestContext.Provider>
          </HistoryContext.Provider>
        </LockProvider>
      </CharacterContext.Provider>,
    );
    const title = screen.getByText('Character Generator');
    expect(title).toBeInTheDocument();
  });

  test('renders initial character on load', () => {
    render(
      <CharacterContext.Provider value={{ character, setCharacter }}>
        <LockProvider>
          <HistoryContext.Provider
            value={{ history, addToHistory, removeFromHistory, clearHistory }}
          >
            <RequestContext.Provider
              value={{
                requestStatus: 'success',
                setRequestStatus: setRequestStatus,
                error: '',
                setError: setError,
              }}
            >
              <AlertManagerContext.Provider
                value={{ addAlert: vi.fn(), removeAlert: vi.fn(), alerts: [] }}
              >
                <DataContext.Provider
                  value={{
                    characters: [],
                    saveCharacter: vi.fn(),
                    removeCharacter: vi.fn(),
                    updateCharacter: vi.fn(),
                    findCharacter: vi.fn(),
                  }}
                >
                  <Home />
                </DataContext.Provider>
              </AlertManagerContext.Provider>
            </RequestContext.Provider>
          </HistoryContext.Provider>
        </LockProvider>
      </CharacterContext.Provider>,
    );
    const initialCharacters = screen.getAllByText(/\w+/);
    const initialCharacter = initialCharacters[0].textContent;
    expect(initialCharacter).toMatch(/\w+/);
  });

  test('clicking the generate button updates the character', async () => {
    render(
      <CharacterContext.Provider value={{ character, setCharacter }}>
        <LockProvider>
          <HistoryContext.Provider
            value={{ history, addToHistory, removeFromHistory, clearHistory }}
          >
            <RequestContext.Provider
              value={{
                requestStatus: 'success',
                setRequestStatus: setRequestStatus,
                error: '',
                setError: setError,
              }}
            >
              <AlertManagerContext.Provider
                value={{ addAlert: vi.fn(), removeAlert: vi.fn(), alerts: [] }}
              >
                <DataContext.Provider
                  value={{
                    characters: [],
                    saveCharacter: vi.fn(),
                    removeCharacter: vi.fn(),
                    updateCharacter: vi.fn(),
                    findCharacter: vi.fn(),
                  }}
                >
                  <Home />
                </DataContext.Provider>
              </AlertManagerContext.Provider>
            </RequestContext.Provider>
          </HistoryContext.Provider>
        </LockProvider>
      </CharacterContext.Provider>,
    );
    const button = screen.getByText('Generate');
    fireEvent.click(button);
    await waitFor(
      () => {
        expect(setCharacter).toHaveBeenCalled();
      },
      { timeout: 2000 },
    );
  });
});
