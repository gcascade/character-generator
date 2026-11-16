import { CharacterProvider } from '@Contexts/CharacterContext';
import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import type { Decorator } from '@storybook/react-vite';
import React from 'react';
import {
  Character,
  CharacterAlignment,
  CharacterClass,
  CharacterRace,
  Gender,
} from '@Types/character';

type ContextProps = {
  firstName?: string;
  lastName?: string;
  epithet?: string;
  age?: number;
  alignment?: CharacterAlignment;
  characterClass?: CharacterClass;
  race?: CharacterRace;
  gender?: Gender;
  title?: string;
  content?: string[];
  history?: Character[];
};

const CharacterDecorator: Decorator<ContextProps> = (Story, context) => {
  const { title, content, ...args } = context.args;
  const character: Character = {
    ...korvusBlackiron,
    ...args,
    background: {
      title: title || korvusBlackiron.background.title,
      content: content || korvusBlackiron.background.content,
    },
  };

  return (
    <CharacterProvider initCharacter={character}>
      <Story />
    </CharacterProvider>
  );
};

export default CharacterDecorator;
