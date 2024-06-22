import CharacterDecorator from '@Test/decorators/CharacterDecorator';
import { historyStub } from '@Test/stubs/History.stubs';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import HistoryList from './HistoryList';

const meta = {
  title: 'History/HistoryList',
  component: HistoryList,
  parameters: {
    layout: 'centered',
  },
  args: {
    removeFromHistory: fn,
  },
  decorators: [CharacterDecorator],
  tags: ['autodocs'],
  argTypes: {
    history: {
      description: 'List of characters to display',
    },
    removeFromHistory: {
      description: 'Function to remove a character from the history',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    history: historyStub,
  },
};
