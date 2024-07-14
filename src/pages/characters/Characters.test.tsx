import { render, screen } from '@testing-library/react';
import React from 'react';
import { characterList } from '../../../test/stubs/Character.stubs';
import { AlertManagerContext } from '../../contexts/AlertManagerContext';
import { DataContext } from '../../contexts/DataContext';
import { Character } from '../../types/character';
import Characters from './Characters';

const renderCharactersWithContext = (characters: Character[] = []) => {
  return render(
    <DataContext.Provider
      value={{
        characters,
        saveCharacter: jest.fn(),
        removeCharacter: jest.fn(),
      }}
    >
      <AlertManagerContext.Provider
        value={{ alerts: [], addAlert: jest.fn(), removeAlert: jest.fn() }}
      >
        <Characters />
      </AlertManagerContext.Provider>
    </DataContext.Provider>,
  );
};

describe('Characters', () => {
  it('throws an error when used outside of its context', () => {
    // Since React 16.9, console errors about uncaught exceptions in components are logged even if the error is caught in the test.
    // This line suppresses those logs for this test.
    jest.spyOn(console, 'error').mockImplementation(() => {
      return;
    });

    expect(() => render(<Characters />)).toThrow(
      'Characters must be used within a DataProvider',
    );
  });

  it('does not display the carousel when there are no characters', () => {
    renderCharactersWithContext();
    expect(screen.queryByText('My Characters')).toBeInTheDocument();
    expect(screen.queryByTestId('carousel')).not.toBeInTheDocument();
  });

  it('displays the carousel when there are characters', () => {
    renderCharactersWithContext(characterList);
    expect(screen.getByText('My Characters')).toBeInTheDocument();
    expect(screen.queryByTestId('carousel')).toBeInTheDocument();
  });
});
