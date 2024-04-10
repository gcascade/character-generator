import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CharacterContext } from '../../contexts/CharacterContext';
import { HistoryContext } from '../../contexts/HistoryContext';
import { Character } from '../../types/character';
import HistoryList from './HistoryList';

describe('HistoryList', () => {
  const character: Character = {
    firstName: 'John',
    lastName: 'Doe',
    age: 30,
    race: 'Elf',
    characterClass: 'Warrior',
    epithet: 'The Brave',
    gender: 'Male',
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
  const mockHistory: Character[] = [
    {
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      race: 'Elf',
      characterClass: 'Warrior',
      epithet: 'The Brave',
      gender: 'Male',
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
    },
    {
      firstName: 'Jane',
      lastName: 'Doe',
      age: 25,
      race: 'Human',
      characterClass: 'Mage',
      epithet: 'The Wise',
      gender: 'Female',
      alignment: 'Chaotic Neutral',
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
    },
  ];

  const setCharacter = jest.fn();

  it('renders without crashing', () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <CharacterContext.Provider value={{ character, setCharacter }}>
          <HistoryContext.Provider
            value={{
              history: mockHistory,
              clearHistory: jest.fn(),
              removeFromHistory: jest.fn(),
              addToHistory: jest.fn(),
            }}
          >
            <HistoryList history={mockHistory} removeFromHistory={jest.fn()} />
          </HistoryContext.Provider>
        </CharacterContext.Provider>
      </ThemeProvider>,
    );
  });

  it('displays the correct characters', () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <CharacterContext.Provider value={{ character, setCharacter }}>
          <HistoryContext.Provider
            value={{
              history: mockHistory,
              clearHistory: jest.fn(),
              removeFromHistory: jest.fn(),
              addToHistory: jest.fn(),
            }}
          >
            <HistoryList history={mockHistory} removeFromHistory={jest.fn()} />
          </HistoryContext.Provider>
        </CharacterContext.Provider>
      </ThemeProvider>,
    );

    expect(screen.getByText('John Doe (30)')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe (25)')).toBeInTheDocument();
  });
});
