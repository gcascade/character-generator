import { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import CharacterProperty from './CharacterProperty';

const meta = {
  title: 'Character/CharacterProperty',
  component: CharacterProperty,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Text to display',
    },
    value: {
      description: 'Value to display',
    },
    onButtonClick: {
      description: 'Function to call when button is clicked',
    },
    isRerollButtonDisabled: {
      description: 'Whether the reroll button is disabled',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const RerollButtonEnabled: Story = {
  args: {
    label: 'Lorem Ipsum',
    value: 'Dolor sit amet',
    onButtonClick: fn(),
    isRerollButtonDisabled: false,
  },
};

export const RerollButtonDisabled: Story = {
  args: {
    ...RerollButtonEnabled.args,
    isRerollButtonDisabled: true,
  },
};
