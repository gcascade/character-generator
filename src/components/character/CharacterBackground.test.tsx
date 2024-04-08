import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { CharacterContext } from '../../contexts/CharacterContext';
import theme from '../../themes/themes';
import { Character } from '../../types/character';
import CharacterBackground from './CharacterBackground';

describe('CharacterBackground', () => {
  const character: Character = {
    firstName: 'Test',
    lastName: 'Character',
    epithet: 'The Great',
    age: 100,
    alignment: 'Neutral Good',
    characterClass: 'Warrior',
    gender: 'Female',
    race: 'Human',
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

  test('renders CharacterBackground component without crashing', () => {
    render(
      <ThemeProvider theme={theme}>
        <CharacterContext.Provider value={{ character, setCharacter }}>
          <CharacterBackground />
        </CharacterContext.Provider>
      </ThemeProvider>,
    );
  });

  test('displays the title correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <CharacterContext.Provider value={{ character, setCharacter }}>
          <CharacterBackground />
        </CharacterContext.Provider>
      </ThemeProvider>,
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  test('displays the content correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <CharacterContext.Provider value={{ character, setCharacter }}>
          <CharacterBackground />
        </CharacterContext.Provider>
      </ThemeProvider>,
    );
    expect(screen.getByText('Test content 1')).toBeInTheDocument();
  });

  test('expands and collapses the content when the button is clicked', () => {
    render(
      <ThemeProvider theme={theme}>
        <CharacterContext.Provider value={{ character, setCharacter }}>
          <CharacterBackground />
        </CharacterContext.Provider>
      </ThemeProvider>,
    );

    // Initially, the button should say "Show More..."
    const button = screen.getByText('Show More...');
    expect(button).toBeInTheDocument();

    // After clicking the button, it should say "Show Less"
    fireEvent.click(button);
    expect(button.textContent).toBe('Show Less');

    // After clicking the button again, it should say "Show More..."
    fireEvent.click(button);
    expect(button.textContent).toBe('Show More...');
  });
});
