import { CharacterProvider } from '@Contexts/CharacterContext';
import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { StoryContext, StoryFn } from '@storybook/react/*';
import React from 'react';
import {
  Character,
  CharacterAlignment,
  CharacterClass,
  CharacterRace,
  Gender,
} from 'src/types/character';

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

const CharacterDecorator = (
  Story: StoryFn,
  context: StoryContext<ContextProps>,
): JSX.Element => {
  const character: Character = {
    ...korvusBlackiron,
    ...context.args,
    background: {
      title: context.args.title || korvusBlackiron.background.title,
      content: context.args.content || korvusBlackiron.background.content,
    },
  };

  return (
    <CharacterProvider initCharacter={character}>
      <Story />
    </CharacterProvider>
  );
};

export default CharacterDecorator;
