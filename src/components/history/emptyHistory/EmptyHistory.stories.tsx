import { Meta, StoryObj } from '@storybook/react';
import EmptyHistory from './EmptyHistory';

const meta = {
  title: 'History/EmptyHistory',
  component: EmptyHistory,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
