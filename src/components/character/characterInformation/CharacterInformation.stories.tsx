import AlertManagerDecorator from '@Test/decorators/AlertManagerDecorator';
import CharacterDecorator from '@Test/decorators/CharacterDecorator';
import RequestDecorator from '@Test/decorators/RequestDecorator';
import SettingsDecorator from '@Test/decorators/SettingsDecorator';
import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { Meta, StoryObj } from '@storybook/react';
import {
  CharacterAlignments,
  CharacterClasses,
  CharacterRaces,
  Genders,
} from '../../../types/character';
import CharacterInformation from './CharacterInformation';

const meta = {
  title: 'Character/CharacterInformation',
  component: CharacterInformation,
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
  },
  decorators: [
    AlertManagerDecorator,
    SettingsDecorator,
    RequestDecorator,
    CharacterDecorator,
  ],
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const {
  firstName,
  lastName,
  epithet,
  age,
  alignment,
  characterClass,
  race,
  gender,
} = korvusBlackiron;

export const Default: Story = {
  args: {
    firstName: firstName,
    lastName: lastName,
    epithet: epithet,
    age: age,
    alignment: alignment,
    characterClass: characterClass,
    race: race,
    gender: gender,
  },
};
