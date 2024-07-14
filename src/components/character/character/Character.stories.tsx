import AlertManagerDecorator from '@Test/decorators/AlertManagerDecorator';
import CharacterDecorator from '@Test/decorators/CharacterDecorator';
import DataDecorator from '@Test/decorators/DataDecorator';
import RequestDecorator from '@Test/decorators/RequestDecorator';
import SettingsDecorator from '@Test/decorators/SettingsDecorator';
import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import {
  CharacterAlignments,
  CharacterClasses,
  CharacterRaces,
  Genders,
} from '../../../types/character';
import Character from './Character';

const meta = {
  title: 'Character/Character',
  component: Character,
  parameters: {
    layout: 'centered',
  },
  args: {
    onGenerateCallback: fn(),
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
  decorators: [
    AlertManagerDecorator,
    SettingsDecorator,
    RequestDecorator,
    CharacterDecorator,
    DataDecorator,
  ],
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
