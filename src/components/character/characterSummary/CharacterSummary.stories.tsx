import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import {
  Character,
  CharacterAlignment,
  CharacterAlignments,
  CharacterClass,
  CharacterClasses,
  CharacterRace,
  CharacterRaces,
  Gender,
  Genders,
} from '@Types/character';
import { Meta, StoryObj } from '@storybook/react';
import React, { FC } from 'react';
import CharacterSummary from './CharacterSummary';

type ComponentProps = {
  firstName: string;
  lastName: string;
  epithet: string;
  age: number;
  alignment: CharacterAlignment;
  gender: Gender;
  characterClass: CharacterClass;
  race: CharacterRace;
  title: string;
  content: string[];
};

const Component: FC<ComponentProps> = ({
  firstName,
  lastName,
  epithet,
  age,
  alignment,
  gender,
  characterClass,
  race,
  title,
  content,
}) => {
  const character: Character = {
    firstName: firstName,
    lastName: lastName,
    epithet: epithet,
    age: age,
    alignment: alignment,
    gender: gender,
    characterClass: characterClass,
    race: race,
    background: {
      title: title,
      content: content,
    },
  };
  return <CharacterSummary character={character} />;
};

const meta: Meta<ComponentProps> = {
  title: 'Character/CharacterSummary',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    firstName: {
      description: 'Character first name',
      control: {
        type: 'text',
      },
    },
    lastName: {
      description: 'Character last name',
      control: {
        type: 'text',
      },
    },
    epithet: {
      description: 'Character epithet',
      control: {
        type: 'text',
      },
    },
    age: {
      description: 'Character age',
      control: {
        type: 'number',
      },
    },
    alignment: {
      description: 'Character alignment',
      control: {
        type: 'text',
        options: Object.values(CharacterAlignments),
      },
    },
    gender: {
      description: 'Character gender',
      control: {
        type: 'select',
        options: Object.values(Genders),
      },
    },
    characterClass: {
      description: 'Character class',
      control: {
        type: 'select',
        options: Object.values(CharacterClasses),
      },
    },
    race: {
      description: 'Character race',
      control: {
        type: 'select',
        options: Object.values(CharacterRaces),
      },
    },
    title: {
      control: 'text',
      description: 'The title of the character background',
    },
    content: {
      description:
        'The content of the character background. 1 string = 1 paragraph',
    },
  },
  decorators: [],
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const {
  firstName,
  lastName,
  epithet,
  race,
  characterClass,
  gender,
  age,
  alignment,
  background: { title, content },
} = korvusBlackiron;

export const Default: Story = {
  args: {
    firstName: firstName,
    lastName: lastName,
    epithet: epithet,
    race: race,
    characterClass: characterClass,
    gender: gender,
    age: age,
    alignment: alignment,
    title: title,
    content: content,
  },
};
