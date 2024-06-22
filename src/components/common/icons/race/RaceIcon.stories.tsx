import { Meta, StoryObj } from '@storybook/react';
import { CharacterRaces } from '../../../../types/character';
import RaceIcon from './RaceIcon';

const meta = {
  title: 'Common/Icons/RaceIcon',
  component: RaceIcon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    characterRace: {
      description: 'Character race to display',
      control: {
        type: 'select',
        options: Object.values(CharacterRaces),
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Dwarf: Story = {
  args: {
    characterRace: 'Dwarf',
  },
};

export const Elf: Story = {
  args: {
    characterRace: 'Elf',
  },
};

export const Human: Story = {
  args: {
    characterRace: 'Human',
  },
};

export const Orc: Story = {
  args: {
    characterRace: 'Orc',
  },
};
