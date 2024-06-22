import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from '@storybook/test';
import RerollButton from './RerollButton';

const meta = {
  title: 'Common/Buttons/RerollButton',
  component: RerollButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { onButtonClick: fn(), tooltip: 'Reroll' },
  argTypes: {
    disabled: {
      description: 'If true, the button will be disabled',
    },
    tooltip: {
      description: 'Text to display in the tooltip',
      control: 'text',
    },
    onButtonClick: {
      action: 'clicked',
      description: 'Function to call when button is clicked',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Enabled: Story = {
  args: {
    disabled: false,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('reroll-button'));
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
