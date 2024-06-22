import { Meta, StoryObj } from '@storybook/react';
import RerollIcon from './RerollIcon';

const meta = {
  title: 'Common/Icons/RerollIcon',
  component: RerollIcon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
