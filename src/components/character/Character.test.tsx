/* eslint-disable @typescript-eslint/no-empty-function */
import { ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { CharacterContext } from '../../contexts/CharacterContext';
import { RequestContext } from '../../contexts/RequestContext';
import theme from '../../themes/themes';
import { Character as CharacterType } from '../../types/character';
import Character from './Character';

describe('Character', () => {
  const mockCharacter: CharacterType = {
    firstName: 'John',
    lastName: 'Character',
    epithet: 'The Great',
    race: 'Elf',
    characterClass: 'Warrior',
    gender: 'Male',
    age: 100,
    alignment: 'True Neutral',
    background: {
      title: 'Test Background Title',
      content: ['Test Background Content'],
    },
  };

  const setCharacter = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Character component without crashing', () => {
    render(
      <ThemeProvider theme={theme}>
        <CharacterContext.Provider
          value={{ character: mockCharacter, setCharacter }}
        >
          <RequestContext.Provider
            value={{
              requestStatus: 'success',
              setRequestStatus: jest.fn(),
              error: '',
              setError: jest.fn(),
            }}
          >
            <Character onGenerateCallback={() => {}} />
          </RequestContext.Provider>
        </CharacterContext.Provider>
      </ThemeProvider>,
    );
  });

  test('displays character properties correctly', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <CharacterContext.Provider
          value={{ character: mockCharacter, setCharacter }}
        >
          <RequestContext.Provider
            value={{
              requestStatus: 'success',
              setRequestStatus: jest.fn(),
              error: '',
              setError: jest.fn(),
            }}
          >
            <Character onGenerateCallback={() => {}} />
          </RequestContext.Provider>
        </CharacterContext.Provider>
      </ThemeProvider>,
    );
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const title = container.querySelector('.MuiCardHeader-title');
    expect(title).toHaveTextContent('John Character');
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('The Great')).toBeInTheDocument();
    expect(screen.getByText('Elf')).toBeInTheDocument();
    expect(screen.getByText('Warrior')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('True Neutral')).toBeInTheDocument();
  });

  test('displays character background correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <CharacterContext.Provider
          value={{ character: mockCharacter, setCharacter }}
        >
          <RequestContext.Provider
            value={{
              requestStatus: 'success',
              setRequestStatus: jest.fn(),
              error: '',
              setError: jest.fn(),
            }}
          >
            <Character onGenerateCallback={() => {}} />
          </RequestContext.Provider>
        </CharacterContext.Provider>
      </ThemeProvider>,
    );

    const backgroundTitle = screen.getByText(mockCharacter.background.title);
    expect(backgroundTitle).toBeInTheDocument();

    mockCharacter.background.content.forEach((content) => {
      const backgroundContent = screen.getByText(content);
      expect(backgroundContent).toBeInTheDocument();
    });
  });

  test('calls onGenerate function when button is clicked', async () => {
    const mockOnGenerate = jest.fn();
    render(
      <ThemeProvider theme={theme}>
        <CharacterContext.Provider
          value={{ character: mockCharacter, setCharacter }}
        >
          <RequestContext.Provider
            value={{
              requestStatus: 'success',
              setRequestStatus: jest.fn(),
              error: '',
              setError: jest.fn(),
            }}
          >
            <Character onGenerateCallback={mockOnGenerate} />
          </RequestContext.Provider>
        </CharacterContext.Provider>
      </ThemeProvider>,
    );
    const button = screen.getByText('New Character');
    fireEvent.click(button);
    await waitFor(
      () => {
        expect(mockOnGenerate).toHaveBeenCalled();
      },
      { timeout: 2000 },
    );
  });

  test('applies theme colors correctly to card', () => {
    render(
      <ThemeProvider theme={theme}>
        <CharacterContext.Provider
          value={{ character: mockCharacter, setCharacter }}
        >
          <RequestContext.Provider
            value={{
              requestStatus: 'success',
              setRequestStatus: jest.fn(),
              error: '',
              setError: jest.fn(),
            }}
          >
            <Character onGenerateCallback={() => {}} />
          </RequestContext.Provider>
        </CharacterContext.Provider>
      </ThemeProvider>,
    );

    const card = screen.getByTestId('character-card');
    expect(card).toHaveStyle(
      `background-color: ${theme.palette.background.paper}`,
    );
    expect(card).toHaveStyle(`color: ${theme.palette.text.primary}`);
  });

  test('disables new character button when loading', () => {
    render(
      <ThemeProvider theme={theme}>
        <CharacterContext.Provider
          value={{ character: mockCharacter, setCharacter }}
        >
          <RequestContext.Provider
            value={{
              requestStatus: 'loading',
              setRequestStatus: jest.fn(),
              error: '',
              setError: jest.fn(),
            }}
          >
            <Character onGenerateCallback={() => {}} />
          </RequestContext.Provider>
        </CharacterContext.Provider>
      </ThemeProvider>,
    );

    const button = screen.getByText('New Character');
    expect(button).toBeDisabled();
  });

  test('applies hover effects correctly to card', () => {
    render(
      <ThemeProvider theme={theme}>
        <CharacterContext.Provider
          value={{ character: mockCharacter, setCharacter }}
        >
          <RequestContext.Provider
            value={{
              requestStatus: 'success',
              setRequestStatus: jest.fn(),
              error: '',
              setError: jest.fn(),
            }}
          >
            <Character onGenerateCallback={() => {}} />
          </RequestContext.Provider>
        </CharacterContext.Provider>
      </ThemeProvider>,
    );
    const card = screen.getByTestId('character-card');
    fireEvent.mouseOver(card);
    expect(card).toHaveStyle(
      'box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    );
  });

  test('renders character portrait component when not on mobile', () => {
    window.matchMedia = jest.fn().mockImplementation((query) => {
      return {
        matches: false, // not mobile
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };
    });

    render(
      <ThemeProvider theme={theme}>
        <CharacterContext.Provider
          value={{ character: mockCharacter, setCharacter }}
        >
          <RequestContext.Provider
            value={{
              requestStatus: 'success',
              setRequestStatus: jest.fn(),
              error: '',
              setError: jest.fn(),
            }}
          >
            <Character onGenerateCallback={() => {}} />
          </RequestContext.Provider>
        </CharacterContext.Provider>
      </ThemeProvider>,
    );

    const cardMedia = screen.getByAltText(
      `${mockCharacter.race} ${mockCharacter.characterClass}`,
    );
    expect(cardMedia).toBeInTheDocument();
  });

  test('does not render character portrait on mobile', () => {
    window.matchMedia = jest.fn().mockImplementation((query) => {
      return {
        matches: true, // mobile
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };
    });

    render(
      <ThemeProvider theme={theme}>
        <CharacterContext.Provider
          value={{ character: mockCharacter, setCharacter }}
        >
          <RequestContext.Provider
            value={{
              requestStatus: 'success',
              setRequestStatus: jest.fn(),
              error: '',
              setError: jest.fn(),
            }}
          >
            <Character onGenerateCallback={() => {}} />
          </RequestContext.Provider>
        </CharacterContext.Provider>
      </ThemeProvider>,
    );

    const cardMedia = screen.queryByAltText(
      `${mockCharacter.race} ${mockCharacter.characterClass}`,
    );
    expect(cardMedia).not.toBeInTheDocument();
  });
});
