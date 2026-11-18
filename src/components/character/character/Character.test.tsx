import { ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LockProvider } from '../../../contexts/LockContext';
import React from 'react';
import { AlertManagerContext } from '../../../contexts/AlertManagerContext';
import { CharacterContext } from '../../../contexts/CharacterContext';
import { DataContext } from '../../../contexts/DataContext';
import { RequestContext } from '../../../contexts/RequestContext';
import * as useCharacterRequestModule from '../../../hooks/useCharacterRequest';
import theme from '../../../themes/themes';
import { Character as CharacterType } from '../../../types/character';
import { RequestStatus } from '../../../types/requests';
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

  const setCharacter = vi.fn();
  const mockOnGenerateCallback = vi.fn();
  const mockSaveCharacter = vi.fn();
  const mockAddAlert = vi.fn();
  const mockGenerateNewCharacter = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = ({
    characters = [] as CharacterType[],
    mockRequestStatus = 'success' as RequestStatus,
  } = {}) => {
    vi.spyOn(useCharacterRequestModule, 'default').mockImplementation(() => ({
      requestStatus: mockRequestStatus,
      generateNewCharacter: mockGenerateNewCharacter,
      error: '',
      rerollCharacterProperty: vi.fn(),
      translateCharacter: vi.fn(),
      canUseAi: false,
    }));

    return render(
      <ThemeProvider theme={theme}>
        <CharacterContext.Provider
          value={{ character: mockCharacter, setCharacter }}
        >
          <LockProvider>
            <RequestContext.Provider
              value={{
                requestStatus: mockRequestStatus,
                setRequestStatus: vi.fn(),
                error: '',
                setError: vi.fn(),
              }}
            >
              <AlertManagerContext.Provider
                value={{
                  addAlert: mockAddAlert,
                  removeAlert: vi.fn(),
                  alerts: [],
                }}
              >
                <DataContext.Provider
                  value={{
                    characters,
                    saveCharacter: mockSaveCharacter,
                    removeCharacter: vi.fn(),
                  }}
                >
                  <Character onGenerateCallback={mockOnGenerateCallback} />
                </DataContext.Provider>
              </AlertManagerContext.Provider>
            </RequestContext.Provider>
          </LockProvider>
        </CharacterContext.Provider>
      </ThemeProvider>,
    );
  };

  test('renders Character component without crashing', () => {
    renderComponent();
  });

  test('displays character properties correctly', () => {
    renderComponent();
    expect(screen.getByText('John Character')).toBeInTheDocument();
    expect(screen.getByText('The Great')).toBeInTheDocument();
    expect(screen.getByText('Elf')).toBeInTheDocument();
    expect(screen.getByText('Warrior')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('True Neutral')).toBeInTheDocument();
  });

  test('displays character background correctly', () => {
    renderComponent();
    const backgroundTitle = screen.getByText(mockCharacter.background!.title);
    expect(backgroundTitle).toBeInTheDocument();

    mockCharacter.background!.content.forEach((content) => {
      const backgroundContent = screen.getByText(content);
      expect(backgroundContent).toBeInTheDocument();
    });
  });

  test('calls onGenerate function when Generate button is clicked', async () => {
    renderComponent();
    const button = screen.getByText('Generate');
    fireEvent.click(button);
    await waitFor(() => {
      expect(mockGenerateNewCharacter).toHaveBeenCalled();
    });
  });

  test('applies theme colors correctly to card', () => {
    renderComponent();
    const card = screen.getByTestId('character-card');
    expect(card).toHaveStyle(
      `background-color: ${theme.palette.background.paper}`,
    );
  });

  test('disables Generate button when loading', () => {
    renderComponent({ mockRequestStatus: 'loading' });
    const button = screen.getByText('Generate');
    expect(button).toBeDisabled();
  });

  test('renders character portrait component when not on mobile', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    renderComponent();
    const cardMedia = screen.getByAltText(
      `${mockCharacter.race} ${mockCharacter.characterClass}`,
    );
    expect(cardMedia).toBeInTheDocument();
  });

  test('does not render character portrait on mobile', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    renderComponent();
    const cardMedia = screen.queryByAltText(
      `${mockCharacter.race} ${mockCharacter.characterClass}`,
    );
    expect(cardMedia).not.toBeInTheDocument();
  });

  test('calls saveCharacter function when Save button is clicked', async () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    renderComponent();

    const button = screen.getByText('Save Character');
    fireEvent.click(button);
    await waitFor(() => {
      expect(mockSaveCharacter).toHaveBeenCalledWith(mockCharacter);
      expect(mockAddAlert).toHaveBeenCalledWith({
        message: 'Character saved',
        severity: 'success',
        title: 'Success',
      });
    });
  });

  test('disables Save button if character is already saved', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    renderComponent({ characters: [mockCharacter] });
    const button = screen.getByText('Saved');
    expect(button).toBeDisabled();
  });
});
