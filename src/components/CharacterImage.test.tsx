import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { CharacterContext } from '../contexts/CharacterContext';
import { Character } from '../types/character';
import { isImage } from '../utils/image';
import CharacterImage from './CharacterImage';

jest.mock('../utils/image');

describe('CharacterImage', () => {
  const character: Character = {
    firstName: 'John',
    lastName: 'Doe',
    epithet: 'The Brave',
    age: 100,
    alignment: 'Neutral Good',
    gender: 'Male',
    race: 'Elf',
    characterClass: 'Warrior',
    background: {
      title: 'Title',
      content: ['Content'],
    },
  };

  const setCharacter = jest.fn();
  const isImageMock = isImage as jest.MockedFunction<typeof isImage>;

  test('renders CharacterImage component without crashing', async () => {
    isImageMock.mockResolvedValue(true);
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(
        <CharacterContext.Provider value={{ character, setCharacter }}>
          <CharacterImage />
        </CharacterContext.Provider>,
      );
    });
  });

  test("renders the correct image based on the character's properties", async () => {
    isImageMock.mockResolvedValue(true);
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(
        <CharacterContext.Provider value={{ character, setCharacter }}>
          <CharacterImage />
        </CharacterContext.Provider>,
      );
    });
    const image = await screen.findByAltText('Elf Warrior') as HTMLImageElement;
    expect(image.src).toContain('/images/elf/warrior/male1.png');
  });

  test("renders the default image when the character's image does not exist", async () => {
    isImageMock.mockResolvedValue(false);
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(
        <CharacterContext.Provider value={{ character, setCharacter }}>
          <CharacterImage />
        </CharacterContext.Provider>,
      );
    });
    const image = await screen.findByAltText(
      'Elf Warrior',
    ) as HTMLImageElement;
    expect(image.src).toContain('/images/default-portrait.png');
  });
});
