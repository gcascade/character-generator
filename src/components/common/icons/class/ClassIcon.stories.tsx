import { Meta, StoryObj } from '@storybook/react';
import { CharacterClasses } from '../../../../types/character';
import ClassIcon from './ClassIcon';

const meta = {
  title: 'Common/Icons/ClassIcon',
  component: ClassIcon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    characterClass: {
      description: 'Character class to display',
      control: {
        type: 'select',
        options: Object.values(CharacterClasses),
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Warrior: Story = {
  args: {
    characterClass: 'Warrior',
  },
};

export const Mage: Story = {
  args: {
    characterClass: 'Mage',
  },
};

export const Rogue: Story = {
  args: {
    characterClass: 'Rogue',
  },
};

export const Cleric: Story = {
  args: {
    characterClass: 'Cleric',
  },
};
