import type { Meta, StoryObj } from '@storybook/react';
import PageTitle from './PageTitle';

const meta: Meta<typeof PageTitle> = {
  title: 'Common/PageTitle/PageTitle',
  component: PageTitle,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
    align: {
      control: 'select',
      options: ['inherit', 'left', 'center', 'right', 'justify'],
    },
    gutterBottom: {
      control: 'boolean',
    },
    children: {
      control: 'text',
    },
  },
};
export default meta;

type Story = StoryObj<typeof PageTitle>;

export const Default: Story = {
  args: {
    children: 'Character Generator',
  },
};
