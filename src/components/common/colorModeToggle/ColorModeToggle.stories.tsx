import { Meta, StoryObj } from '@storybook/react-vite';
import ColorModeToggle from './ColorModeToggle';

const meta = {
  title: 'Common/ColorModeToggle',
  component: ColorModeToggle,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof ColorModeToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Compact: Story = { args: { variant: 'compact' } };
export const SelectInSettings: Story = { args: { variant: 'select' } };
