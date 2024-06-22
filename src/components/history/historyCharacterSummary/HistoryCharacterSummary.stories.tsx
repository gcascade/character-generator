import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { CharacterClasses, CharacterRaces } from '@Types/character';
import { Meta, StoryObj } from '@storybook/react';
import HistoryCharacterSummary from './HistoryCharacterSummary';

const meta = {
  title: 'History/HistoryCharacterSummary',
  component: HistoryCharacterSummary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    race: {
      description: 'The character race',
      control: {
        type: 'select',
        option: Object.values(CharacterRaces),
      },
    },
    characterClass: {
      description: 'The character class',
      control: {
        type: 'select',
        option: Object.values(CharacterClasses),
      },
    },
    firstName: {
      description: 'The character first name',
      control: {
        type: 'text',
      },
    },
    lastName: {
      description: 'The character last name',
      control: {
        type: 'text',
      },
    },
    age: {
      description: 'The character age',
      control: {
        type: 'number',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    race: korvusBlackiron.race,
    characterClass: korvusBlackiron.characterClass,
    firstName: korvusBlackiron.firstName,
    lastName: korvusBlackiron.lastName,
    age: korvusBlackiron.age,
  },
};
