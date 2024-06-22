import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import SelectedHistoryItem from './SelectedHistoryItem';

const meta = {
  title: 'History/SelectedHistoryItem',
  component: SelectedHistoryItem,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    character: {
      description: 'The character to display',
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
    onDeleteClick: fn,
  },
};
