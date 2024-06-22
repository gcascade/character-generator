import { ThemeProvider, createTheme } from '@mui/material/styles';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { AlertManagerContext } from '../../../contexts/AlertManagerContext';
import { CharacterContext } from '../../../contexts/CharacterContext';
import { Character } from '../../../types/character';
import HistoryCard from './HistoryCard';

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

const setCharacter = jest.fn();

let mockHistory = [character];

jest.mock('../../../hooks/useCharacterHistory', () => ({
  __esModule: true,
  default: () => ({
    history: mockHistory,
    clearHistory: jest.fn().mockImplementation(() => {
      mockHistory = [];
    }),
  }),
}));

describe('HistoryCard', () => {
  it('renders without crashing', () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <CharacterContext.Provider value={{ character, setCharacter }}>
          <AlertManagerContext.Provider
            value={{ addAlert: jest.fn, removeAlert: jest.fn, alerts: [] }}
          >
            <HistoryCard />
          </AlertManagerContext.Provider>
        </CharacterContext.Provider>
      </ThemeProvider>,
    );
  });

  it('displays the "Clear History" button when there is history', () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <CharacterContext.Provider value={{ character, setCharacter }}>
          <AlertManagerContext.Provider
            value={{ addAlert: jest.fn, removeAlert: jest.fn, alerts: [] }}
          >
            <HistoryCard />
          </AlertManagerContext.Provider>
        </CharacterContext.Provider>
      </ThemeProvider>,
    );

    expect(screen.getByText('Clear History')).toBeInTheDocument();
  });

  it('displays the "Confirm?" text when the "Clear History" button is clicked once and resets on outside click', async () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <CharacterContext.Provider value={{ character, setCharacter }}>
          <AlertManagerContext.Provider
            value={{ addAlert: jest.fn, removeAlert: jest.fn, alerts: [] }}
          >
            <HistoryCard />
          </AlertManagerContext.Provider>
        </CharacterContext.Provider>
      </ThemeProvider>,
    );

    expect(screen.queryByText('No history yet')).not.toBeInTheDocument();

    const button = screen.getByText('Clear History');
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByText('Confirm?')).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByText('Clear History')).toBeInTheDocument();
    expect(screen.getByText('No history yet')).toBeInTheDocument();
  });
});
