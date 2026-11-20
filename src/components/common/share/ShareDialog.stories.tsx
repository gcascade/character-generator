import { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import ShareDialog from './ShareDialog';

const meta = {
  title: 'Common/ShareDialog',
  component: ShareDialog,
  tags: ['autodocs'],
} satisfies Meta<typeof ShareDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    url: 'https://gcascade.github.io/character-generator/share#c1.example',
    onClose: fn(),
  },
};
