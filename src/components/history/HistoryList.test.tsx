// FILEPATH: /c:/Users/geoff/Documents/GitHub/character-generator/src/components/History/HistoryList.test.tsx

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Character } from '../../types/character';
import HistoryList from './HistoryList';

describe('HistoryList', () => {
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

  it('renders without crashing', () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <HistoryList history={mockHistory} />
      </ThemeProvider>,
    );
  });

  it('displays the correct characters', () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <HistoryList history={mockHistory} />
      </ThemeProvider>,
    );

    expect(screen.getByText('John Doe (30)')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe (25)')).toBeInTheDocument();
  });
});
