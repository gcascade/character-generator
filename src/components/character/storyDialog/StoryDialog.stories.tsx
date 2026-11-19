import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import StoryDialog from './StoryDialog';

const meta = {
  title: 'Character/StoryDialog',
  component: StoryDialog,
  tags: ['autodocs'],
} satisfies Meta<typeof StoryDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    open: true,
    onClose: fn(),
    title: korvusBlackiron.background!.title,
    subtitle: 'Orc Warrior · Lawful Good',
    paragraphs: korvusBlackiron.background!.content,
  },
};
