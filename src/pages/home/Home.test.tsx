import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { AlertManagerContext } from '../../contexts/AlertManagerContext';
import { CharacterContext } from '../../contexts/CharacterContext';
import { DataContext } from '../../contexts/DataContext';
import { HistoryContext } from '../../contexts/HistoryContext';
import { RequestContext } from '../../contexts/RequestContext';
import { Character } from '../../types/character';
import Home from './Home';

jest.mock('../../hooks/useSettings', () => ({
  __esModule: true,
  default: () => ({
    settings: {
      useOllamaAPI: false,
      ollamaEndpoint: '',
      ollamaModelName: '',
    },
    setUseOllamaAPI: jest.fn(),
    setOllamaEndpoint: jest.fn(),
    setOllamaModelName: jest.fn(),
  }),
}));

jest.mock('../../hooks/useOllama', () => ({
  __esModule: true,
  default: () => ({
    generateCharacterFromTemplateCharacter: jest.fn(),
    generateBackground: jest.fn(),
  }),
}));

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

  const history = [];

  const setCharacter = jest.fn();
  const addToHistory = jest.fn();
  const removeFromHistory = jest.fn();
  const clearHistory = jest.fn();
  const setRequestStatus = jest.fn();
  const setError = jest.fn();

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
              value={{ addAlert: jest.fn, removeAlert: jest.fn, alerts: [] }}
            >
              <DataContext.Provider
                value={{
                  characters: [],
                  saveCharacter: jest.fn(),
                  removeCharacter: jest.fn(),
                }}
              >
                <Home />
              </DataContext.Provider>
            </AlertManagerContext.Provider>
          </RequestContext.Provider>
        </HistoryContext.Provider>
      </CharacterContext.Provider>,
    );
  });

  test('renders Home title', () => {
    render(
      <CharacterContext.Provider value={{ character, setCharacter }}>
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
              value={{ addAlert: jest.fn, removeAlert: jest.fn, alerts: [] }}
            >
              <DataContext.Provider
                value={{
                  characters: [],
                  saveCharacter: jest.fn(),
                  removeCharacter: jest.fn(),
                }}
              >
                <Home />
              </DataContext.Provider>
            </AlertManagerContext.Provider>
          </RequestContext.Provider>
        </HistoryContext.Provider>
      </CharacterContext.Provider>,
    );
    const title = screen.getByText('Character Generator');
    expect(title).toBeInTheDocument();
  });

  test('renders initial character on load', () => {
    render(
      <CharacterContext.Provider value={{ character, setCharacter }}>
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
              value={{ addAlert: jest.fn, removeAlert: jest.fn, alerts: [] }}
            >
              <DataContext.Provider
                value={{
                  characters: [],
                  saveCharacter: jest.fn(),
                  removeCharacter: jest.fn(),
                }}
              >
                <Home />
              </DataContext.Provider>
            </AlertManagerContext.Provider>
          </RequestContext.Provider>
        </HistoryContext.Provider>
      </CharacterContext.Provider>,
    );
    const initialCharacters = screen.getAllByText(/\w+/);
    const initialCharacter = initialCharacters[0].textContent;
    expect(initialCharacter).toMatch(/\w+/);
  });

  test('clicking the generate button updates the character', async () => {
    render(
      <CharacterContext.Provider value={{ character, setCharacter }}>
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
              value={{ addAlert: jest.fn, removeAlert: jest.fn, alerts: [] }}
            >
              <DataContext.Provider
                value={{
                  characters: [],
                  saveCharacter: jest.fn(),
                  removeCharacter: jest.fn(),
                }}
              >
                <Home />
              </DataContext.Provider>
            </AlertManagerContext.Provider>
          </RequestContext.Provider>
        </HistoryContext.Provider>
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
