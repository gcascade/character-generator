import { render } from '@testing-library/react';
import React from 'react';
import { CharacterContext, CharacterProvider } from './CharacterContext';

describe('CharacterContext', () => {
  it('provides character and setCharacter function', () => {
    const character = {
      firstName: 'Test',
      lastName: 'Character',
      epithet: 'The Great',
      characterClass: 'Warrior',
      race: 'Elf',
      gender: 'Female',
      age: 100,
      alignment: 'Neutral Good',
      background: {
        title: 'Test Title',
        content: ['Test content 1', 'Test content 2'],
      },
    };

    const TestComponent = () => {
      return (
        <CharacterContext.Consumer>
          {(context) => {
            expect(context?.character).toBeDefined();
            expect(typeof context?.setCharacter).toBe('function');
            return null;
          }}
        </CharacterContext.Consumer>
      );
    };

    render(
      <CharacterProvider initCharacter={character}>
        <TestComponent />
      </CharacterProvider>,
    );
  });
});
