import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import HistoryItem from './HistoryItem';

const meta = {
  title: 'History/HistoryItem',
  component: HistoryItem,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    character: {
      description: 'The character to display',
    },
    onCharacterClick: {
      description: 'Function to call when character is clicked',
    },
    onDeleteClick: {
      description: 'Function to call when delete button is clicked',
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    character: korvusBlackiron,
    onCharacterClick: fn,
    onDeleteClick: fn,
  },
};
